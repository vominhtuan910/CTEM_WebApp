export interface HealthScore {
  score: number;
  classification: string;
  lastWeek: number;
  standard: number;
}

export interface ErrorToWatch {
  id: number;
  name: string;
  trend: 'up' | 'down';
  change: number;
  type: string;
}

export interface Threat {
  id: number;
  name: string;
  type: string;
  increase: number;
}

export interface ThreatsSummary {
  week: {
    total: number;
    impactful: Threat[];
  };
  month: {
    total: number;
    impactful: Threat[];
  };
}

export interface MetricItem {
  name: string;
  count: number;
}

export interface DashboardData {
  healthScore: HealthScore;
  errorsToWatch: ErrorToWatch[];
  threatsSummary: ThreatsSummary;
  commonThreats: MetricItem[];
  attackedAssets: MetricItem[];
  attackMethods: MetricItem[];
}

export interface DashboardProps {
  data?: DashboardData;
  isLoading?: boolean;
  error?: string | null;
}

export interface HealthScoreCardProps {
  healthScore: HealthScore;
}

export interface ErrorsWatchListProps {
  errors: ErrorToWatch[];
}

export interface ThreatsSummaryCardProps {
  title: string;
  summary: {
    total: number;
    impactful: Threat[];
  };
  period: 'week' | 'month';
}

export interface MetricsChartProps {
  title: string;
  data: MetricItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}