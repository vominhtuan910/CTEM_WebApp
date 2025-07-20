import {
  ShieldExclamationIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowPathIcon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import HealthScoreCard from "../components/Dashboard/HealthScoreCard";
import ErrorsWatchList from "../components/Dashboard/ErrorsWatchList";
import ThreatsSummaryCard from "../components/Dashboard/ThreatsSummaryCard";
import MetricsChart from "../components/Dashboard/MetricsChart";
import DashboardSkeleton from "../components/Dashboard/DashboardSkeleton";
import ErrorBoundary from "../components/Dashboard/ErrorBoundary";

const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboardData();

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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Removed manual refresh button (auto-refresh elsewhere) */}

        {/* Health Score Section */}
        <section
          className="mb-8 lg:mb-12"
          aria-labelledby="health-section-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClipboardDocumentListIcon className="text-emerald-600 h-4 w-4" />
            </div>
            <div>
              <h2
                id="health-section-heading"
                className="text-2xl font-bold text-slate-800"
              >
                Security Health Overview
              </h2>
              <p className="text-slate-600">
                Monitor your security posture and trending issues
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <HealthScoreCard healthScore={data.healthScore} />
            </div>

            <div className="lg:col-span-2">
              <ErrorsWatchList errors={data.errorsToWatch} />
            </div>
          </div>
        </section>

        {/* Threats Summary */}
        <section
          className="mb-8 lg:mb-12"
          aria-labelledby="threats-section-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldExclamationIcon className="text-red-600" />
            </div>
            <div>
              <h2
                id="threats-section-heading"
                className="text-2xl font-bold text-slate-800"
              >
                Threat Intelligence
              </h2>
              <p className="text-slate-600">
                Recent threat detections and security incidents
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ThreatsSummaryCard
              title="Weekly Threat Analysis"
              summary={data.threatsSummary.week}
              period="week"
            />

            <ThreatsSummaryCard
              title="Monthly Threat Trends"
              summary={data.threatsSummary.month}
              period="month"
            />
          </div>
        </section>

        {/* Analytics Charts */}
        <section
          className="mb-8 lg:mb-12"
          aria-labelledby="analytics-section-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 rounded-lg">
              <ChartBarSquareIcon className="text-violet-600" />
            </div>
            <div>
              <h2
                id="analytics-section-heading"
                className="text-2xl font-bold text-slate-800"
              >
                Security Analytics
              </h2>
              <p className="text-slate-600">
                Detailed breakdown of security events and patterns
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            <MetricsChart
              title="Common Threats by Frequency"
              data={data.commonThreats}
              icon={ChartBarIcon}
            />

            <MetricsChart
              title="Most Attacked Asset Types"
              data={data.attackedAssets}
              icon={ChartPieIcon}
            />

            <MetricsChart
              title="Common Attack Methods"
              data={data.attackMethods}
              icon={ChartBarSquareIcon}
            />
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {data.commonThreats.length +
                    data.attackedAssets.length +
                    data.attackMethods.length}
                </div>
                <div className="text-slate-600 font-medium">
                  Security Metrics
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-slate-600 font-medium">Last Updated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  ✓
                </div>
                <div className="text-slate-600 font-medium">System Status</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm">
                Dashboard powered by advanced security monitoring • Updated
                every 5 minutes
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
