/**
 * Async Query Executor Utilities
 * Provides utilities for parallel query execution and batch operations
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type QueryResult<T> = {
  data: T | null;
  error: any | null;
};

/**
 * Execute multiple queries in parallel
 * Returns results in the same order as queries
 */
export async function executeParallelQueries<T extends any[]>(
  queries: Array<() => Promise<QueryResult<T[number]>>>
): Promise<QueryResult<T[number]>[]> {
  const promises = queries.map((query) => query());
  return Promise.all(promises);
}

/**
 * Execute queries with a concurrency limit
 * Useful for rate limiting or resource management
 */
export async function executeBatchedQueries<T>(
  queries: Array<() => Promise<QueryResult<T>>>,
  batchSize: number = 5
): Promise<QueryResult<T>[]> {
  const results: QueryResult<T>[] = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((query) => query()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Execute queries with timeout protection
 */
export async function executeWithTimeout<T>(
  query: () => Promise<QueryResult<T>>,
  timeoutMs: number = 5000
): Promise<QueryResult<T>> {
  const timeoutPromise = new Promise<QueryResult<T>>((resolve) => {
    setTimeout(() => {
      resolve({
        data: null,
        error: new Error(`Query timeout after ${timeoutMs}ms`),
      });
    }, timeoutMs);
  });

  return Promise.race([query(), timeoutPromise]);
}

/**
 * Retry a query with exponential backoff
 */
export async function executeWithRetry<T>(
  query: () => Promise<QueryResult<T>>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<QueryResult<T>> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await query();

    if (!result.error) {
      return result;
    }

    lastError = result.error;

    // Don't retry on the last attempt
    if (attempt < maxRetries) {
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    data: null,
    error: lastError,
  };
}

/**
 * Batch fetch by IDs with chunking
 * Useful for fetching multiple records by ID
 */
export async function batchFetchByIds<T>(
  client: SupabaseClient,
  table: string,
  ids: string[],
  select: string = "*",
  chunkSize: number = 100
): Promise<QueryResult<T[]>> {
  if (ids.length === 0) {
    return { data: [], error: null };
  }

  // Split into chunks to avoid query size limits
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  // Execute chunks in parallel
  const chunkPromises = chunks.map((chunk) =>
    client
      .from(table)
      .select(select)
      .in("id", chunk)
      .then(({ data, error }) => ({ data: data as T[] | null, error }))
  );

  const results = await Promise.all(chunkPromises);

  // Combine results
  const allData: T[] = [];
  let hasError = false;
  let lastError: any = null;

  for (const result of results) {
    if (result.error) {
      hasError = true;
      lastError = result.error;
    } else if (result.data && Array.isArray(result.data)) {
      allData.push(...result.data);
    }
  }

  return {
    data: hasError ? null : allData,
    error: hasError ? lastError : null,
  };
}

/**
 * Execute queries with priority ordering
 * Higher priority queries execute first
 */
export async function executeWithPriority<T>(
  queries: Array<{ query: () => Promise<QueryResult<T>>; priority: number }>
): Promise<QueryResult<T>[]> {
  // Sort by priority (higher first)
  const sorted = [...queries].sort((a, b) => b.priority - a.priority);

  // Execute in priority order
  const results: QueryResult<T>[] = [];
  for (const { query } of sorted) {
    results.push(await query());
  }

  return results;
}

/**
 * Stream query results (for large datasets)
 * Processes results in chunks as they arrive
 */
export async function* streamQueryResults<T>(
  query: () => Promise<QueryResult<T[]>>,
  chunkSize: number = 50
): AsyncGenerator<T[], void, unknown> {
  const result = await query();

  if (result.error || !result.data) {
    return;
  }

  const data = result.data;

  for (let i = 0; i < data.length; i += chunkSize) {
    yield data.slice(i, i + chunkSize);
  }
}
