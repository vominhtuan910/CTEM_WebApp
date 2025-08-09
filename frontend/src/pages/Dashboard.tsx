import {
  ShieldExclamationIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import DashboardSkeleton from "../components/Dashboard/DashboardSkeleton";
import ErrorBoundary from "../components/Dashboard/ErrorBoundary";
import DashboardTabs from "../components/Dashboard/DashboardTabs";

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

          {/* Dashboard Tabs */}
          <DashboardTabs data={data} />

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
