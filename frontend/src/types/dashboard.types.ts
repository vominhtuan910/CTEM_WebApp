// Core data interfaces
export interface HealthScore {
  score: number;
  classification: string;
  last_updated: string;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface StatusBreakdown {
  validated: number;
  not_validated: number;
  false_positive: number;
  exploitable: number;
}

export interface RecentActivity {
  new_findings_7d: number;
  scans_completed_7d: number;
  openvas_scans_7d: number;
  nmap_scans_7d: number;
}

export interface TopCVE {
  cve_id: string;
  count: number;
}

export interface VulnerableAsset {
  ip: string;
  hostname: string;
  vulnerability_count: number;
}

export interface ScanStatistics {
  total_openvas_scans: number;
  total_nmap_scans: number;
  completed_scans: number;
  failed_scans: number;
  success_rate: number;
}

export interface Coverage {
  scanned_assets: number;
  total_assets: number;
  coverage_percentage: number;
  unscanned_assets: number;
}

export interface OSDistribution {
  os: string;
  count: number;
}

export interface AssetIntelligence {
  os_distribution: OSDistribution[];
  active_assets: number;
  inactive_assets: number;
}

export interface Trends {
  findings_trend: "up" | "down";
  findings_change: number;
  current_period: number;
  previous_period: number;
}

export interface SeverityTimelineEntry {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface Alert {
  type: "critical" | "warning" | "danger" | "info";
  title: string;
  message: string;
  count: number;
  action: string;
}

// Main dashboard data interface
export interface DashboardData {
  total_assets: number;
  active_assets: number;
  total_findings: number;
  health_score: HealthScore;
  severity_breakdown: SeverityBreakdown;
  status_breakdown: StatusBreakdown;
  recent_activity: RecentActivity;
  top_cves: TopCVE[];
  vulnerable_assets: VulnerableAsset[];
  scan_statistics: ScanStatistics;
  coverage: Coverage;
  asset_intelligence: AssetIntelligence;
  trends: Trends;
}

export interface DashboardMetrics {
  severity_timeline: SeverityTimelineEntry[];
}

export interface DashboardAlerts {
  alerts: Alert[];
  total_alerts: number;
}

// Component props interfaces
export interface DashboardProps {
  data?: DashboardData;
  isLoading?: boolean;
  error?: string | null;
}

export interface HealthScoreCardProps {
  healthScore: HealthScore;
  totalFindings: number;
}

export interface SeverityBreakdownCardProps {
  severityBreakdown: SeverityBreakdown;
  totalFindings: number;
}

export interface RecentActivityCardProps {
  recentActivity: RecentActivity;
}

export interface TopThreatsCardProps {
  topCVEs: TopCVE[];
  title?: string;
}

export interface VulnerableAssetsCardProps {
  vulnerableAssets: VulnerableAsset[];
  title?: string;
}

export interface ScanStatisticsCardProps {
  scanStatistics: ScanStatistics;
}

export interface CoverageCardProps {
  coverage: Coverage;
}

export interface AssetIntelligenceCardProps {
  assetIntelligence: AssetIntelligence;
}

export interface TrendsCardProps {
  trends: Trends;
}

export interface AlertsCardProps {
  alerts: Alert[];
}

export interface MetricsChartProps {
  title: string;
  data: any[];
  type?: "line" | "bar" | "pie" | "area";
  height?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}

// Legacy interfaces for backward compatibility
export interface ErrorToWatch {
  id: number;
  name: string;
  trend: "up" | "down";
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
