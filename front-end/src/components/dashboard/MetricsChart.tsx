import { MetricsChartProps } from '../../types/dashboard.types';
import { sortByCount, formatNumber } from '../../utils/dashboardHelpers';

const MetricsChart: React.FC<MetricsChartProps> = ({ title, data, icon: Icon }) => {
  const sortedData = sortByCount(data);
  const maxCount = sortedData.length > 0 ? sortedData[0].count : 0;

  return (
    <div 
      className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow duration-200"
      role="region"
      aria-labelledby={`metrics-${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
    >
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
        {Icon && <Icon className="text-blue-600" aria-hidden="true" />}
        <h3 id={`metrics-${title.replace(/\s+/g, '-').toLowerCase()}-heading`}>
          {title}
        </h3>
      </div>
      
      {sortedData.length === 0 ? (
        <div className="text-gray-500 italic text-center py-4">
          No data available
        </div>
      ) : (
        <div className="space-y-3">
          {sortedData.map((item, index) => {
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isTopItem = index === 0;
            
            return (
              <div 
                key={item.name} 
                className="group"
                role="listitem"
                aria-label={`${item.name}: ${item.count} occurrences`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span 
                    className={`text-sm font-medium ${
                      isTopItem ? 'text-blue-700' : 'text-gray-700'
                    } group-hover:text-blue-600 transition-colors duration-150`}
                  >
                    {item.name}
                  </span>
                  <span 
                    className={`text-sm font-bold ${
                      isTopItem ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {formatNumber(item.count)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                      isTopItem 
                        ? 'bg-blue-600 group-hover:bg-blue-700' 
                        : 'bg-blue-400 group-hover:bg-blue-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                    role="progressbar"
                    aria-valuenow={item.count}
                    aria-valuemin={0}
                    aria-valuemax={maxCount}
                    aria-label={`${item.name} progress: ${item.count} out of ${maxCount}`}
                  />
                </div>
                
                {/* Percentage indicator for top items */}
                {index < 3 && (
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {sortedData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total items: {sortedData.length}</span>
            <span>Highest: {formatNumber(maxCount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsChart;