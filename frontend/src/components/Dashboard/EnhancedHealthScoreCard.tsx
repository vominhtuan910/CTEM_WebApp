import React from "react";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HealthScoreCardProps } from "../../types/dashboard.types";

const EnhancedHealthScoreCard: React.FC<HealthScoreCardProps> = ({
  healthScore,
  totalFindings,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) {
      return <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />;
    } else if (score >= 60) {
      return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />;
    } else {
      return <ShieldExclamationIcon className="h-8 w-8 text-red-600" />;
    }
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return "from-emerald-50 to-emerald-100";
    if (score >= 80) return "from-green-50 to-green-100";
    if (score >= 70) return "from-yellow-50 to-yellow-100";
    if (score >= 60) return "from-orange-50 to-orange-100";
    return "from-red-50 to-red-100";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getScoreIcon(healthScore.score)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Security Health Score
              </h3>
              <p className="text-sm text-gray-600">
                Overall security posture assessment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`px-6 py-8 bg-gradient-to-br ${getScoreBackground(
          healthScore.score
        )}`}
      >
        <div className="text-center">
          {/* Score Display */}
          <div className="mb-6">
            <div
              className={`text-6xl font-bold ${getScoreColor(
                healthScore.score
              )} mb-2`}
            >
              {healthScore.score}
            </div>
            <div className="text-lg font-medium text-gray-700">
              {healthScore.classification}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  healthScore.score >= 90
                    ? "bg-emerald-500"
                    : healthScore.score >= 80
                    ? "bg-green-500"
                    : healthScore.score >= 70
                    ? "bg-yellow-500"
                    : healthScore.score >= 60
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${healthScore.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {totalFindings}
              </div>
              <div className="text-sm text-gray-600">Total Findings</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {healthScore.classification}
              </div>
              <div className="text-sm text-gray-600">Risk Level</div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            Last updated: {formatDate(healthScore.last_updated)}
          </div>
        </div>
      </div>

      {/* Footer with Recommendations */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="text-sm">
          {healthScore.score >= 90 ? (
            <div className="text-emerald-700">
              <strong>Excellent!</strong> Your security posture is strong.
              Continue monitoring.
            </div>
          ) : healthScore.score >= 80 ? (
            <div className="text-green-700">
              <strong>Good!</strong> Minor improvements recommended for optimal
              security.
            </div>
          ) : healthScore.score >= 70 ? (
            <div className="text-yellow-700">
              <strong>Fair.</strong> Address medium and high severity
              vulnerabilities.
            </div>
          ) : healthScore.score >= 60 ? (
            <div className="text-orange-700">
              <strong>Poor.</strong> Immediate attention required for critical
              vulnerabilities.
            </div>
          ) : (
            <div className="text-red-700">
              <strong>Critical!</strong> Urgent remediation needed for security
              vulnerabilities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedHealthScoreCard;
