import { Link } from "react-router-dom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BugReportIcon from "@mui/icons-material/BugReport";
import { ThreatsSummaryCardProps } from '../../types/dashboard.types';

const ThreatsSummaryCard: React.FC<ThreatsSummaryCardProps> = ({ 
  title, 
  summary, 
  period 
}) => {
  const periodLabel = period === 'week' ? 'Last Week' : 'Last Month';
  
  return (
    <div 
      className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow duration-200"
      role="region"
      aria-labelledby={`threats-${period}-heading`}
    >
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-700">
        <BugReportIcon className="text-blue-600" aria-hidden="true" />
        <h3 id={`threats-${period}-heading`}>
          {title || `Threats Detected (${periodLabel})`}
        </h3>
      </div>
      
      <div className="mb-4">
        <span 
          className="text-3xl font-bold text-blue-700"
          aria-label={`${summary.total} total threats detected`}
        >
          {summary.total}
        </span>
        <span className="ml-2 text-gray-600">threats detected</span>
      </div>
      
      {summary.impactful && summary.impactful.length > 0 && (
        <div>
          <div className="mb-3 text-gray-600 font-medium text-sm">
            Most Impactful:
          </div>
          
          <ul role="list" className="space-y-2">
            {summary.impactful.map((threat) => (
              <li 
                key={threat.id} 
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <Link
                  to={`/threats/${threat.id}`}
                  className="text-blue-700 hover:text-blue-800 hover:underline font-semibold flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                  aria-label={`View details for ${threat.name}`}
                >
                  {threat.name}
                </Link>
                
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border">
                  {threat.type}
                </span>
                
                <span 
                  className="flex items-center text-green-600 text-xs font-semibold"
                  aria-label={`Increased by ${threat.increase}`}
                >
                  <TrendingUpIcon 
                    fontSize="small" 
                    className="mr-1" 
                    aria-hidden="true"
                  /> 
                  +{threat.increase}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {(!summary.impactful || summary.impactful.length === 0) && (
        <div className="text-gray-500 italic text-sm">
          No significant threats detected
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Data from {periodLabel.toLowerCase()}
        </div>
      </div>
    </div>
  );
};

export default ThreatsSummaryCard;