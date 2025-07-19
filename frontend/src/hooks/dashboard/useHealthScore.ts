import { useMemo } from "react";
import { HealthScore } from "../../types/dashboard.types";
import { calculateHealthMetrics } from "../../utils/dashboardHelpers";

interface UseHealthScoreReturn {
  scoreChange: number;
  pointsToStandard: number;
  status: "positive" | "negative" | "neutral";
  classificationColor: string;
  sanitizedScore: number;
  meetsStandard: boolean;
}

export const useHealthScore = (
  healthScore: HealthScore
): UseHealthScoreReturn => {
  const metrics = useMemo(() => {
    return calculateHealthMetrics(healthScore);
  }, [healthScore]);

  return metrics;
};
