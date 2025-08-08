import {
  ShieldExclamationIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import EnhancedHealthScoreCard from "../components/Dashboard/EnhancedHealthScoreCard";
import SeverityBreakdownCard from "../components/Dashboard/SeverityBreakdownCard";
import RecentActivityCard from "../components/Dashboard/RecentActivityCard";
import TopThreatsCard from "../components/Dashboard/TopThreatsCard";
import VulnerableAssetsCard from "../components/Dashboard/VulnerableAssetsCard";
import CoverageCard from "../components/Dashboard/CoverageCard";
import DashboardSkeleton from "../components/Dashboard/DashboardSkeleton";
import ErrorBoundary from "../components/Dashboard/ErrorBoundary";

const Dashboard: React.FC = () => {
  const { data, metrics, isLoading, error, refetch } = useDashboardData();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-white p-8 shadow-xl border border-red-100">
            <div className="text-center">
              <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
                <ShieldExclamationIcon
                  className="text-red-600"
                  style={{ fontSize: "2.5rem" }}
                  aria-hidden="true"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Failed to Load Dashboard
              </h2>

              <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>

              <button
                onClick={refetch}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                aria-label="Retry loading dashboard"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-slate-100 rounded-full w-fit mx-auto mb-6">
            <ShieldExclamationIcon
              className="text-slate-400"
              style={{ fontSize: "4rem" }}
            />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            No Dashboard Data Available
          </h2>
          <p className="text-slate-600 text-lg">
            Please check back later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error: Error) => console.error("Dashboard Error:", error)}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Security Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive view of your security posture and threat
                  landscape
                </p>
              </div>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                aria-label="Refresh dashboard data"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-8" aria-labelledby="overview-section-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ClipboardDocumentListIcon className="text-emerald-600 h-5 w-5" />
              </div>
              <div>
                <h2
                  id="overview-section-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Security Overview
                </h2>
                <p className="text-gray-600">
                  Key metrics and health indicators
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1">
                <EnhancedHealthScoreCard
                  healthScore={data.health_score}
                  totalFindings={data.total_findings}
                />
              </div>
              <div className="xl:col-span-1">
                <SeverityBreakdownCard
                  severityBreakdown={data.severity_breakdown}
                  totalFindings={data.total_findings}
                />
              </div>
              <div className="xl:col-span-1">
                <RecentActivityCard recentActivity={data.recent_activity} />
              </div>
            </div>
          </section>

          {/* Threat Intelligence Section */}
          <section className="mb-8" aria-labelledby="threats-section-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldExclamationIcon className="text-red-600 h-5 w-5" />
              </div>
              <div>
                <h2
                  id="threats-section-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Threat Intelligence
                </h2>
                <p className="text-gray-600">
                  Vulnerability analysis and asset risk assessment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopThreatsCard topCVEs={data.top_cves} />
              <VulnerableAssetsCard vulnerableAssets={data.vulnerable_assets} />
            </div>
          </section>

          {/* Asset Management Section */}
          <section className="mb-8" aria-labelledby="assets-section-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ComputerDesktopIcon className="text-blue-600 h-5 w-5" />
              </div>
              <div>
                <h2
                  id="assets-section-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Asset Management
                </h2>
                <p className="text-gray-600">
                  Coverage analysis and asset intelligence
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CoverageCard coverage={data.coverage} />

              {/* Asset Intelligence Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartPieIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Asset Intelligence
                      </h3>
                      <p className="text-sm text-gray-600">
                        Operating system distribution and asset status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {data.asset_intelligence.active_assets}
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        Active Assets
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {data.asset_intelligence.inactive_assets}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        Inactive Assets
                      </div>
                    </div>
                  </div>

                  {data.asset_intelligence.os_distribution.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        OS Distribution
                      </h4>
                      <div className="space-y-2">
                        {data.asset_intelligence.os_distribution
                          .slice(0, 5)
                          .map((os, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-700">
                                {os.os}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {os.count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Analytics Section */}
          <section className="mb-8" aria-labelledby="analytics-section-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <ChartBarSquareIcon className="text-violet-600 h-5 w-5" />
              </div>
              <div>
                <h2
                  id="analytics-section-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Security Analytics
                </h2>
                <p className="text-gray-600">Trends and performance metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trends Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Vulnerability Trends
                  </h3>
                  <p className="text-sm text-gray-600">30-day comparison</p>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div
                      className={`text-3xl font-bold ${
                        data.trends.findings_trend === "up"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {data.trends.findings_trend === "up" ? "↗" : "↘"}{" "}
                      {data.trends.findings_change}
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.trends.findings_trend === "up"
                        ? "Increase"
                        : "Decrease"}{" "}
                      from last period
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {data.trends.current_period}
                      </div>
                      <div className="text-xs text-gray-600">Current</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {data.trends.previous_period}
                      </div>
                      <div className="text-xs text-gray-600">Previous</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan Statistics Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Scan Performance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Overall scan statistics
                  </p>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {data.scan_statistics.success_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        OpenVAS Scans
                      </span>
                      <span className="text-sm font-medium">
                        {data.scan_statistics.total_openvas_scans}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Network Scans
                      </span>
                      <span className="text-sm font-medium">
                        {data.scan_statistics.total_nmap_scans}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Failed Scans
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {data.scan_statistics.failed_scans}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Finding Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Validation and exploitation status
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Validated</span>
                      <span className="text-sm font-medium text-green-600">
                        {data.status_breakdown.validated}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Not Validated
                      </span>
                      <span className="text-sm font-medium text-yellow-600">
                        {data.status_breakdown.not_validated}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        False Positive
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {data.status_breakdown.false_positive}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Exploitable</span>
                      <span className="text-sm font-medium text-red-600">
                        {data.status_breakdown.exploitable}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {data.total_assets}
                  </div>
                  <div className="text-gray-600 font-medium">Total Assets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {data.total_findings}
                  </div>
                  <div className="text-gray-600 font-medium">
                    Total Findings
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-gray-600 font-medium">Last Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    ✓
                  </div>
                  <div className="text-gray-600 font-medium">System Online</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-500 text-sm">
                  CTEM Dashboard powered by advanced security monitoring •
                  Auto-refreshes every 5 minutes
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
