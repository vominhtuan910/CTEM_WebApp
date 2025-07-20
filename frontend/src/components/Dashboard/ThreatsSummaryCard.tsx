import { Link } from "react-router-dom";
import {
  ArrowTrendingUpIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { ThreatsSummaryCardProps } from '../../types/dashboard.types';

const ThreatsSummaryCard: React.FC<ThreatsSummaryCardProps> = ({ 
  title, 
  summary, 
  period 
}) => {
  const periodLabel = period === 'week' ? 'Last Week' : 'Last Month';
  const isWeekly = period === 'week';
  
  const cardColors = isWeekly 
    ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200' 
    : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200';
  
  const accentColor = isWeekly ? 'bg-rose-500' : 'bg-violet-500';
  const iconBg = isWeekly ? 'bg-rose-100' : 'bg-violet-100';
  const iconColor = isWeekly ? 'text-rose-600' : 'text-violet-600';
  const textColor = isWeekly ? 'text-rose-800' : 'text-violet-800';
  const badgeColor = isWeekly ? 'bg-rose-100 text-rose-800' : 'bg-violet-100 text-violet-800';
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${cardColors} border-2 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
      role="region"
      aria-labelledby={`threats-${period}-heading`}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 ${iconBg} rounded-xl`}>
            <BugAntIcon className={`${iconColor} h-6 w-6`} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 id={`threats-${period}-heading`} className="text-2xl font-bold text-slate-800">
              {title || `Threat Detection`}
            </h3>
            <p className="text-slate-600 font-medium">
              {periodLabel} • Security Analysis
            </p>
          </div>
        </div>
        
        {/* Threat count with visual impact */}
        <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className={`text-5xl font-black ${textColor} mb-2`}>
            {summary.total}
          </div>
          <div className="text-slate-600 font-semibold">
            Threats Detected
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${badgeColor} mt-2`}>
            {summary.total === 0 ? 'All Clear' : summary.total > 20 ? 'High Activity' : 'Moderate'}
          </div>
        </div>
      </div>
      
      {summary.impactful && summary.impactful.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldExclamationIcon className={`${iconColor} h-5 w-5`} />
            <h4 className="font-bold text-slate-800 text-lg">Critical Threats</h4>
          </div>
          
          <div className="space-y-3">
            {summary.impactful.map((threat, index) => (
              <div 
                key={threat.id}
                className="group p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={`/threats/${threat.id}`}
                    className={`font-bold text-slate-800 hover:${textColor} transition-colors duration-200 flex items-center gap-2 group-hover:underline`}
                    aria-label={`View details for ${threat.name}`}
                  >
                    {threat.name}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor} border`}>
                      {threat.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="text-emerald-600 h-4 w-4" aria-hidden="true" />
                      <span className="text-emerald-600 font-bold text-sm">
                        +{threat.increase}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Priority #{index + 1}</span>
                  <span>•</span>
                  <span>Requires immediate attention</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3">
            <ShieldExclamationIcon className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-emerald-800 mb-1">No Critical Threats</h4>
          <p className="text-emerald-600 text-sm">
            All systems operating within normal parameters
          </p>
        </div>
      )}
      
      {/* Footer with additional context */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <GlobeAltIcon className="h-4 w-4" />
            <span>Real-time monitoring</span>
          </div>
          <div className="text-slate-500">
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatsSummaryCard;