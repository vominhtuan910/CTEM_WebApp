import { MetricsChartProps } from '../../types/dashboard.types';
import { sortByCount, formatNumber } from '../../utils/dashboardHelpers';
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AnalyticsIcon from "@mui/icons-material/Analytics";

const MetricsChart: React.FC<MetricsChartProps> = ({ title, data, icon: Icon }) => {
  const sortedData = sortByCount(data);
  const maxCount = sortedData.length > 0 ? sortedData[0].count : 0;
  const total = sortedData.reduce((sum, item) => sum + item.count, 0);

  // Determine chart theme based on title
  const getChartTheme = (title: string) => {
    if (title.toLowerCase().includes('threat')) {
      return {
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        border: 'border-orange-200',
        accent: 'bg-orange-500',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        primaryColor: 'text-orange-800',
        progressColors: ['bg-orange-500', 'bg-orange-400', 'bg-orange-300'],
      };
    } else if (title.toLowerCase().includes('asset')) {
      return {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        primaryColor: 'text-blue-800',
        progressColors: ['bg-blue-500', 'bg-blue-400', 'bg-blue-300'],
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
        border: 'border-indigo-200',
        accent: 'bg-indigo-500',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        primaryColor: 'text-indigo-800',
        progressColors: ['bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'],
      };
    }
  };

  const theme = getChartTheme(title);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${theme.bg} ${theme.border} border-2 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
      role="region"
      aria-labelledby={`metrics-${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent}`} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 ${theme.iconBg} rounded-lg`}>
            {Icon ? <Icon className={`${theme.iconColor} text-xl`} aria-hidden="true" /> : <AnalyticsIcon className={`${theme.iconColor} text-xl`} />}
          </div>
          <div className="flex-1">
            <h3 id={`metrics-${title.replace(/\s+/g, '-').toLowerCase()}-heading`} className="text-lg font-bold text-slate-800">
              {title}
            </h3>
            <p className="text-slate-600 text-sm">Analytics Overview</p>
          </div>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <div className={`text-2xl font-bold ${theme.primaryColor}`}>
              {sortedData.length}
            </div>
            <div className="text-slate-600 text-xs font-medium">Categories</div>
          </div>
          <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <div className={`text-2xl font-bold ${theme.primaryColor}`}>
              {formatNumber(total)}
            </div>
            <div className="text-slate-600 text-xs font-medium">Total Events</div>
          </div>
        </div>
      </div>
      
      {sortedData.length === 0 ? (
        <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-slate-500 italic">
            No data available
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const totalPercentage = total > 0 ? (item.count / total) * 100 : 0;
            const isTopTier = index < 3;
            const colorIndex = Math.min(index, theme.progressColors.length - 1);
            
            return (
              <div 
                key={item.name} 
                className="group p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/80 transition-all duration-200"
                role="listitem"
                aria-label={`${item.name}: ${item.count} occurrences`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {item.name}
                    </span>
                    {isTopTier && (
                      <TrendingUpIcon className="text-emerald-600 text-sm" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-black ${theme.primaryColor}`}>
                      {formatNumber(item.count)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {totalPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Enhanced progress bar */}
                <div className="relative">
                  <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${theme.progressColors[colorIndex]} shadow-sm`}
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemin={0}
                      aria-valuemax={maxCount}
                      aria-label={`${item.name} progress: ${item.count} out of ${maxCount}`}
                    />
                  </div>
                  
                  {/* Value indicator */}
                  {percentage > 15 && (
                    <div 
                      className="absolute top-0 h-3 flex items-center px-2"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {formatNumber(item.count)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Footer summary */}
      {sortedData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-500 font-medium">Top Item</div>
              <div className={`text-sm font-bold ${theme.primaryColor}`}>
                {formatNumber(maxCount)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Average</div>
              <div className={`text-sm font-bold ${theme.primaryColor}`}>
                {formatNumber(Math.round(total / sortedData.length))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Range</div>
              <div className={`text-sm font-bold ${theme.primaryColor}`}>
                {formatNumber(sortedData[sortedData.length - 1]?.count || 0)}-{formatNumber(maxCount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsChart;