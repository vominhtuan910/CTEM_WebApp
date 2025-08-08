import { useState, useEffect } from "react";
import { DashboardData, DashboardMetrics } from "../../types/dashboard.types";
import { dashboardApi } from "../../services/api";

interface UseDashboardDataReturn {
  data: DashboardData | null;
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard data in parallel
      const [dashboardData, metricsData] = await Promise.all([
        dashboardApi.getData(),
        dashboardApi.getMetrics(),
      ]);

      setData(dashboardData);
      setMetrics(metricsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setData(null);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    metrics,
    isLoading,
    error,
    refetch,
  };
};
