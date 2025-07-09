import SecurityIcon from "@mui/icons-material/Security";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AssessmentIcon from "@mui/icons-material/Assessment";

import { useDashboardData } from '../hooks/useDashboardData';
import {
  HealthScoreCard,
  ErrorsWatchList,
  ThreatsSummaryCard,
  MetricsChart,
  DashboardSkeleton,
  ErrorBoundary,
} from '../components/dashboard';

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
                <SecurityIcon 
                  className="text-red-600" 
                  style={{ fontSize: '2.5rem' }}
                  aria-hidden="true"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Failed to Load Dashboard
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {error}
              </p>
              
              <button
                onClick={refetch}
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                aria-label="Retry loading dashboard"
              >
                <RefreshIcon fontSize="small" />
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
            <SecurityIcon 
              className="text-slate-400" 
              style={{ fontSize: '4rem' }}
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
    <ErrorBoundary onError={(error) => console.error('Dashboard Error:', error)}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Enhanced Header */}
          <header className="mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <DashboardIcon 
                    className="text-white" 
                    style={{ fontSize: '2rem' }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                    Security Dashboard
                  </h1>
                  <p className="text-slate-600 font-medium mt-1">
                    Real-time security monitoring and analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-600">Live</span>
                </div>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-slate-700"
                  aria-label="Refresh dashboard data"
                >
                  <RefreshIcon fontSize="small" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </header>

          {/* Health Score Section */}
          <section 
            className="mb-8 lg:mb-12"
            aria-labelledby="health-section-heading"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <AssessmentIcon className="text-emerald-600" />
              </div>
              <div>
                <h2 id="health-section-heading" className="text-2xl font-bold text-slate-800">
                  Security Health Overview
                </h2>
                <p className="text-slate-600">Monitor your security posture and trending issues</p>
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
                <SecurityIcon className="text-red-600" />
              </div>
              <div>
                <h2 id="threats-section-heading" className="text-2xl font-bold text-slate-800">
                  Threat Intelligence
                </h2>
                <p className="text-slate-600">Recent threat detections and security incidents</p>
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
                <ShowChartIcon className="text-violet-600" />
              </div>
              <div>
                <h2 id="analytics-section-heading" className="text-2xl font-bold text-slate-800">
                  Security Analytics
                </h2>
                <p className="text-slate-600">Detailed breakdown of security events and patterns</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              <MetricsChart
                title="Common Threats by Frequency"
                data={data.commonThreats}
                icon={BarChartIcon}
              />
              
              <MetricsChart
                title="Most Attacked Asset Types"
                data={data.attackedAssets}
                icon={PieChartIcon}
              />
              
              <MetricsChart
                title="Common Attack Methods"
                data={data.attackMethods}
                icon={BarChartIcon}
              />
            </div>
          </section>

          {/* Enhanced Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {data.commonThreats.length + data.attackedAssets.length + data.attackMethods.length}
                  </div>
                  <div className="text-slate-600 font-medium">Security Metrics</div>
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
                  Dashboard powered by advanced security monitoring • Updated every 5 minutes
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
