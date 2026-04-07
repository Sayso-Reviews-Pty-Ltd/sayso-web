"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ITEMS_PER_PAGE } from "../ForYouClient.constants";

export function useForYouPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const previousPageRef = useRef(currentPage);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === currentPage) return;

      setIsPaginationLoading(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        previousPageRef.current = currentPage;
        setCurrentPage(newPage);

        setTimeout(() => {
          setIsPaginationLoading(false);
        }, 300);
      }, 150);
    },
    [currentPage]
  );

  // Safety mechanism: Reset pagination loading after timeout
  useEffect(() => {
    if (!isPaginationLoading) return;

    const timeout = setTimeout(() => {
      setIsPaginationLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isPaginationLoading]);

  const calculatePageData = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return { totalPages, startIndex, endIndex };
  };

  return {
    currentPage,
    setCurrentPage,
    isPaginationLoading,
    previousPageRef,
    handlePageChange,
    calculatePageData,
  };
}
