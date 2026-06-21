import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Pull-to-refresh hook for mobile/touch devices.
 * Triggers `onRefresh` when the user pulls down at the top of the page.
 *
 * @param {Function} onRefresh - async function to call on refresh
 * @param {number} threshold - pull distance in px required to trigger (default 70)
 * @returns {{ pullDistance: number, refreshing: boolean }}
 */
export default function usePullToRefresh(onRefresh, threshold = 70) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    // Only start tracking if at the very top
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    // Rubber-band resistance
    const resisted = Math.min(delta * 0.4, 120);
    setPullDistance(resisted);
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefreshRef.current();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, refreshing]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, refreshing };
}