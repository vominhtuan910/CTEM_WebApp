import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { ErrorsWatchListProps } from '../../types/dashboard.types';
import { getTrendColor } from '../../utils/dashboardHelpers';

const ErrorsWatchList: React.FC<ErrorsWatchListProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-2 text-lg font-semibold text-gray-700 flex items-center gap-2">
          <WarningAmberIcon className="text-yellow-500" />
          Errors to Watch
        </div>
        <p className="text-gray-500 italic">No trending errors detected</p>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow duration-200"
      role="region"
      aria-labelledby="errors-watch-heading"
    >
      <div className="mb-4 text-lg font-semibold text-gray-700 flex items-center gap-2">
        <WarningAmberIcon className="text-yellow-500" aria-hidden="true" />
        <h3 id="errors-watch-heading">
          Errors to Watch ({errors.length})
        </h3>
      </div>
      
      <ul role="list" className="space-y-3">
        {errors.map((error) => {
          const TrendIcon = error.trend === 'down' ? TrendingDownIcon : TrendingUpIcon;
          const trendColor = getTrendColor(error.trend);
          
          return (
            <li 
              key={error.id} 
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 flex-1">
                <TrendIcon 
                  className={trendColor}
                  aria-label={`Trending ${error.trend}`}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {error.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                    {error.type}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <span 
                  className={`text-sm font-semibold ${trendColor} flex items-center`}
                  aria-label={`Change: ${error.change > 0 ? '+' : ''}${error.change}`}
                >
                  {error.change > 0 ? '+' : ''}{error.change}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      
      {errors.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing {errors.length} trending error{errors.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ErrorsWatchList;