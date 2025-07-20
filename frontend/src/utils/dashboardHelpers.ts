import { HealthScore } from '../types/dashboard.types';

/**
 * Calculate the score change from last week
 */
export const calculateScoreChange = (current: number, lastWeek: number): number => {
  return current - lastWeek;
};

/**
 * Calculate points needed to reach standard
 */
export const calculatePointsToStandard = (current: number, standard: number): number => {
  return Math.max(0, standard - current);
};

/**
 * Get score status based on change
 */
export const getScoreStatus = (change: number): 'positive' | 'negative' | 'neutral' => {
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
};

/**
 * Get classification color based on score
 */
export const getClassificationColor = (classification: string): string => {
  const colorMap: Record<string, string> = {
    'A': 'bg-green-100 text-green-700',
    'B': 'bg-blue-100 text-blue-700',
    'C': 'bg-yellow-100 text-yellow-700',
    'D': 'bg-orange-100 text-orange-700',
    'F': 'bg-red-100 text-red-700',
  };
  return colorMap[classification] || 'bg-gray-100 text-gray-700';
};

/**
 * Sanitize score value (ensure it's between 0-100)
 */
export const sanitizeScore = (score: number): number => {
  return Math.max(0, Math.min(100, score));
};

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get trend icon based on trend direction
 */
export const getTrendColor = (trend: 'up' | 'down'): string => {
  return trend === 'up' ? 'text-green-600' : 'text-red-600';
};

/**
 * Calculate health score metrics
 */
export const calculateHealthMetrics = (healthScore: HealthScore) => {
  const scoreChange = calculateScoreChange(healthScore.score, healthScore.lastWeek);
  const pointsToStandard = calculatePointsToStandard(healthScore.score, healthScore.standard);
  const status = getScoreStatus(scoreChange);
  const classificationColor = getClassificationColor(healthScore.classification);
  const sanitizedScore = sanitizeScore(healthScore.score);

  return {
    scoreChange,
    pointsToStandard,
    status,
    classificationColor,
    sanitizedScore,
    meetsStandard: pointsToStandard === 0,
  };
};

/**
 * Sort items by count in descending order
 */
export const sortByCount = <T extends { count: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => b.count - a.count);
};

/**
 * Get the top N items from a list
 */
export const getTopItems = <T>(items: T[], count: number): T[] => {
  return items.slice(0, count);
};