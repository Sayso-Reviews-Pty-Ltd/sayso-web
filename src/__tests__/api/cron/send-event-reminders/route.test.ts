/**
 * Tests for GET /api/cron/send-event-reminders
 *
 * Covers:
 *   - 401 when Authorization header is missing or wrong
 *   - Returns { sent: 0 } when no reminders are due
 *   - 500 when the DB fetch fails
 *   - Creates one notification per due reminder
 *   - Notification message uses "tomorrow" for remind_before=1_day
 *   - Notification message uses "in 2 hours" for remind_before=2_hours (or any other value)
 *   - Marks all sent reminder IDs with { sent: true }
 *   - sent count matches number of reminders processed
 *   - Applies .limit(100) to the due query
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/send-event-reminders/route';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCreateNotification = jest.fn().mockResolvedValue('notif-id');

jest.mock('@/app/lib/notifications', () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

const mockIn     = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({ in: mockIn });
const mockLimit  = jest.fn();
const mockEq     = jest.fn().mockReturnValue({ limit: mockLimit });
const mockLte    = jest.fn().mockReturnValue({ eq: mockEq });
const mockSelect = jest.fn().mockReturnValue({ lte: mockLte });
const mockFrom   = jest.fn().mockImplementation(() => ({
  select: mockSelect,
  update: mockUpdate,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['authorization'] = `Bearer ${secret}`;
  return new NextRequest('http://localhost/api/cron/send-event-reminders', { headers });
}

function makeReminder(overrides: Partial<{
  id: string; user_id: string; event_id: string;
  event_title: string; remind_before: string;
}> = {}) {
  return {
    id:            overrides.id            ?? 'rem-1',
    user_id:       overrides.user_id       ?? 'user-1',
    event_id:      overrides.event_id      ?? 'event-1',
    event_title:   overrides.event_title   ?? 'Jazz Night',
    remind_before: overrides.remind_before ?? '1_day',
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/cron/send-event-reminders', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateNotification.mockResolvedValue('notif-id');
    mockIn.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ in: mockIn });
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({ limit: mockLimit });
    mockLte.mockReturnValue({ eq: mockEq });
    mockSelect.mockReturnValue({ lte: mockLte });
    mockFrom.mockImplementation(() => ({ select: mockSelect, update: mockUpdate }));
    process.env = { ...ORIGINAL_ENV, CRON_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── Auth ────────────────────────────────────────────────────────────────────

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 401 when Authorization header has the wrong secret', async () => {
    const res = await GET(makeRequest('bad-secret'));
    expect(res.status).toBe(401);
  });

  it('proceeds when Authorization header matches CRON_SECRET', async () => {
    const res = await GET(makeRequest('test-secret'));
    expect(res.status).not.toBe(401);
  });

  it('proceeds without auth when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest());
    expect(res.status).not.toBe(401);
  });

  // ── DB error ─────────────────────────────────────────────────────────────────

  it('returns 500 when the DB select fails', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'timeout' } });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('timeout');
  });

  // ── No due reminders ─────────────────────────────────────────────────────────

  it('returns { sent: 0 } when no reminders are due', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.sent).toBe(0);
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it('returns { sent: 0 } when due data is null', async () => {
    mockLimit.mockResolvedValue({ data: null, error: null });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(body.sent).toBe(0);
  });

  // ── Notification creation ────────────────────────────────────────────────────

  it('creates one notification per due reminder', async () => {
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })];
    mockLimit.mockResolvedValue({ data: reminders, error: null });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(mockCreateNotification).toHaveBeenCalledTimes(2);
    expect(body.sent).toBe(2);
  });

  it('uses "tomorrow" in the message when remind_before is 1_day', async () => {
    mockLimit.mockResolvedValue({ data: [makeReminder({ remind_before: '1_day' })], error: null });
    await GET(makeRequest('test-secret'));

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('tomorrow') })
    );
  });

  it('uses "in 2 hours" in the message when remind_before is not 1_day', async () => {
    mockLimit.mockResolvedValue({ data: [makeReminder({ remind_before: '2_hours' })], error: null });
    await GET(makeRequest('test-secret'));

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('in 2 hours') })
    );
  });

  it('passes the correct userId, type, title, entityId and link to createNotification', async () => {
    const reminder = makeReminder({ user_id: 'u-99', event_id: 'ev-42', event_title: 'Sunset Party' });
    mockLimit.mockResolvedValue({ data: [reminder], error: null });

    await GET(makeRequest('test-secret'));

    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId:   'u-99',
        type:     'event_reminder',
        title:    'Event Reminder',
        entityId: 'ev-42',
        link:     '/event/ev-42',
      })
    );
  });

  // ── Mark as sent ─────────────────────────────────────────────────────────────

  it('marks all processed reminder IDs as sent', async () => {
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' }), makeReminder({ id: 'r3' })];
    mockLimit.mockResolvedValue({ data: reminders, error: null });

    await GET(makeRequest('test-secret'));

    expect(mockUpdate).toHaveBeenCalledWith({ sent: true });
    expect(mockIn).toHaveBeenCalledWith('id', ['r1', 'r2', 'r3']);
  });

  it('does not call update when no reminders were sent', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    await GET(makeRequest('test-secret'));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ── Query shape ───────────────────────────────────────────────────────────────

  it('applies a limit of 100 to the due query', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    await GET(makeRequest('test-secret'));
    expect(mockLimit).toHaveBeenCalledWith(100);
  });

  it('filters by sent=false', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    await GET(makeRequest('test-secret'));
    expect(mockEq).toHaveBeenCalledWith('sent', false);
  });
});
