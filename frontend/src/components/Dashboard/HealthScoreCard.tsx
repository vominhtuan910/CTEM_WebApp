import {
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { HealthScoreCardProps } from "../../types/dashboard.types";
import { useHealthScore } from "../../hooks/dashboard/useHealthScore";
import { getHealthScoreColors } from "../../styles/designSystem";

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore }) => {
  const {
    scoreChange,
    pointsToStandard,
    status,
    sanitizedScore,
    meetsStandard,
  } = useHealthScore(healthScore);

  const colors = getHealthScoreColors(sanitizedScore);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${colors.bg} ${colors.border} border-2 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
      role="region"
      aria-labelledby="health-score-heading"
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />

      {/* Score display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <span
            className={`text-7xl font-black ${colors.score} tracking-tight`}
            aria-label={`Health score: ${sanitizedScore} out of 100`}
          >
            {sanitizedScore}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <h2
            id="health-score-heading"
            className="text-xl font-bold text-slate-800"
          >
            Security Health Score
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge} shadow-sm`}
          >
            Grade {healthScore.classification}
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Week comparison */}
        <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center gap-3">
            {status === "positive" ? (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ArrowTrendingUpIcon
                    className="text-emerald-600 h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Weekly Change
                  </p>
                  <p
                    className="text-emerald-600 font-bold text-lg"
                    aria-label={`Increased by ${scoreChange} points from last week`}
                  >
                    +{scoreChange} points
                  </p>
                </div>
              </div>
            ) : status === "negative" ? (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowTrendingDownIcon
                    className="text-red-600 h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Weekly Change
                  </p>
                  <p
                    className="text-red-600 font-bold text-lg"
                    aria-label={`Decreased by ${Math.abs(
                      scoreChange
                    )} points from last week`}
                  >
                    {scoreChange} points
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ArrowUpIcon
                    className="text-slate-600 h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Weekly Change
                  </p>
                  <p className="text-slate-600 font-bold text-lg">No change</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Standard comparison */}
        <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          {meetsStandard ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircleIcon className="text-emerald-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Standard Achievement
                </p>
                <p className="text-emerald-600 font-bold text-lg">
                  Exceeds Standard ({healthScore.standard})
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <span className="text-amber-600 font-bold text-lg">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Points to Standard
                </p>
                <p
                  className="text-amber-600 font-bold text-lg"
                  aria-label={`${pointsToStandard} points needed to reach standard of ${healthScore.standard}`}
                >
                  {pointsToStandard} points needed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">
            Progress to Excellence
          </span>
          <span className="text-sm font-bold text-slate-700">
            {sanitizedScore}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${colors.accent} shadow-sm`}
            style={{ width: `${sanitizedScore}%` }}
            role="progressbar"
            aria-valuenow={sanitizedScore}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthScoreCard;
