import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { ErrorsWatchListProps } from '../../types/dashboard.types';

const ErrorsWatchList: React.FC<ErrorsWatchListProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-8 shadow-lg">
        <div className="text-center">
          <div className="p-4 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
            <CheckCircleIcon className="text-emerald-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-emerald-800 mb-2">All Clear!</h3>
          <p className="text-emerald-600 font-medium">No trending security errors detected</p>
        </div>
      </div>
    );
  }

  const criticalErrors = errors.filter(error => error.change <= -5);
  const moderateErrors = errors.filter(error => error.change > -5);

  return (
    <div 
      className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
      role="region"
      aria-labelledby="errors-watch-heading"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <WarningAmberIcon className="text-amber-600 text-2xl" aria-hidden="true" />
            </div>
            <div>
              <h3 id="errors-watch-heading" className="text-2xl font-bold text-slate-800">
                Security Alerts
              </h3>
              <p className="text-slate-600 font-medium">
                {errors.length} trending issue{errors.length !== 1 ? 's' : ''} require attention
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
              {criticalErrors.length} Critical
            </span>
          </div>
        </div>
      </div>
      
      {/* Critical Errors Section */}
      {criticalErrors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PriorityHighIcon className="text-red-600 text-lg" />
            <h4 className="font-bold text-red-800">Critical Issues</h4>
          </div>
          <div className="space-y-3">
            {criticalErrors.map((error) => (
              <ErrorItem key={error.id} error={error} isCritical={true} />
            ))}
          </div>
        </div>
      )}

      {/* Moderate Errors Section */}
      {moderateErrors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <WarningAmberIcon className="text-amber-600 text-lg" />
            <h4 className="font-bold text-amber-800">Monitor Closely</h4>
          </div>
          <div className="space-y-3">
            {moderateErrors.map((error) => (
              <ErrorItem key={error.id} error={error} isCritical={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ErrorItem: React.FC<{ error: any; isCritical: boolean }> = ({ error, isCritical }) => {
  const TrendIcon = error.trend === 'down' ? TrendingDownIcon : TrendingUpIcon;
  const changeColor = error.change < -5 ? 'text-red-600' : error.change < 0 ? 'text-amber-600' : 'text-emerald-600';
  const bgColor = isCritical ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-amber-50 border-amber-200 hover:bg-amber-100';
  
  return (
    <div className={`p-4 rounded-xl border-2 ${bgColor} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-amber-100'}`}>
            <TrendIcon 
              className={`${isCritical ? 'text-red-600' : 'text-amber-600'} text-xl`}
              aria-label={`Trending ${error.trend}`}
            />
          </div>
          
          <div className="flex-1">
            <h5 className="font-bold text-slate-800 text-lg mb-1">
              {error.name}
            </h5>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border`}>
                {error.type}
              </span>
              <span className="text-slate-600 text-sm">
                • Weekly trend
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-black ${changeColor} mb-1`}>
            {error.change > 0 ? '+' : ''}{error.change}
          </div>
          <div className="text-xs font-medium text-slate-600">
            points
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorsWatchList;