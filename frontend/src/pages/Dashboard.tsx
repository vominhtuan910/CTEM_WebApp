import SecurityIcon from "@mui/icons-material/Security";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import RefreshIcon from "@mui/icons-material/Refresh";

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
      <div className="bg-gray-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <SecurityIcon 
              className="text-red-500 mx-auto mb-4" 
              style={{ fontSize: '3rem' }}
              aria-hidden="true"
            />
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Retry loading dashboard"
            >
              <RefreshIcon fontSize="small" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="text-center py-12">
          <SecurityIcon 
            className="text-gray-400 mx-auto mb-4" 
            style={{ fontSize: '3rem' }}
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Dashboard Data Available
          </h2>
          <p className="text-gray-600">
            Please check back later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={(error) => console.error('Dashboard Error:', error)}>
      <div className="bg-gray-50 p-4 sm:p-6 min-h-screen">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <SecurityIcon 
                className="text-blue-600" 
                aria-hidden="true"
              />
              Dashboard Overview
            </h1>
            
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Refresh dashboard data"
            >
              <RefreshIcon fontSize="small" />
              Refresh
            </button>
          </div>
        </header>

        {/* Health Score Section */}
        <section 
          className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          aria-labelledby="health-section-heading"
        >
          <h2 id="health-section-heading" className="sr-only">
            Health Score and Error Monitoring
          </h2>
          
          <div className="lg:col-span-1">
            <HealthScoreCard healthScore={data.healthScore} />
          </div>
          
          <div className="lg:col-span-2">
            <ErrorsWatchList errors={data.errorsToWatch} />
          </div>
        </section>

        {/* Threats Summary */}
        <section 
          className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          aria-labelledby="threats-section-heading"
        >
          <h2 id="threats-section-heading" className="sr-only">
            Threat Detection Summary
          </h2>
          
          <ThreatsSummaryCard
            title="Threats Detected (Last Week)"
            summary={data.threatsSummary.week}
            period="week"
          />
          
          <ThreatsSummaryCard
            title="Threats Detected (Last Month)"
            summary={data.threatsSummary.month}
            period="month"
          />
        </section>

        {/* Analytics Charts */}
        <section 
          className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          aria-labelledby="analytics-section-heading"
        >
          <h2 id="analytics-section-heading" className="sr-only">
            Security Analytics and Metrics
          </h2>
          
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
        </section>

        {/* Footer Info */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Dashboard last updated: {new Date().toLocaleString()}</p>
            <p className="mt-1">
              Monitoring {data.commonThreats.length + data.attackedAssets.length + data.attackMethods.length} security metrics
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
