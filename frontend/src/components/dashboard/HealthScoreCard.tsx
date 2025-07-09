import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { HealthScoreCardProps } from '../../types/dashboard.types';
import { useHealthScore } from '../../hooks/useHealthScore';

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore }) => {
  const {
    scoreChange,
    pointsToStandard,
    status,
    classificationColor,
    sanitizedScore,
    meetsStandard,
  } = useHealthScore(healthScore);

  return (
    <div 
      className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
      role="region"
      aria-labelledby="health-score-heading"
    >
      <span 
        className="text-5xl font-extrabold text-blue-700"
        aria-label={`Health score: ${sanitizedScore} out of 100`}
      >
        {sanitizedScore}
      </span>
      
      <div className="mt-2 text-lg font-semibold text-gray-600 flex items-center gap-2">
        <h2 id="health-score-heading" className="text-lg font-semibold">
          Health Score
        </h2>
        <span className={`px-2 py-1 rounded text-sm font-bold ${classificationColor}`}>
          {healthScore.classification}
        </span>
      </div>
      
      <div className="mt-2 text-gray-500 text-sm">
        {status === 'positive' ? (
          <span className="flex items-center text-green-600" aria-label={`Increased by ${scoreChange} points from last week`}>
            <ArrowUpwardIcon fontSize="small" aria-hidden="true" /> 
            +{scoreChange} vs last week
          </span>
        ) : status === 'negative' ? (
          <span className="flex items-center text-red-600" aria-label={`Decreased by ${Math.abs(scoreChange)} points from last week`}>
            <ArrowDownwardIcon fontSize="small" aria-hidden="true" /> 
            {scoreChange} vs last week
          </span>
        ) : (
          <span className="flex items-center text-gray-600" aria-label="No change from last week">
            No change vs last week
          </span>
        )}
      </div>
      
      <div className="mt-2 text-gray-500 text-sm">
        {meetsStandard ? (
          <span className="text-green-600 font-medium">
            ✓ Meets standard ({healthScore.standard})
          </span>
        ) : (
          <span aria-label={`${pointsToStandard} points needed to reach standard of ${healthScore.standard}`}>
            {pointsToStandard} points to reach standard ({healthScore.standard})
          </span>
        )}
      </div>
    </div>
  );
};

export default HealthScoreCard;