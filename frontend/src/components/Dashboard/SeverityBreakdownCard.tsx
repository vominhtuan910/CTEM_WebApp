import React from "react";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { SeverityBreakdownCardProps } from "../../types/dashboard.types";

const SeverityBreakdownCard: React.FC<SeverityBreakdownCardProps> = ({
  severityBreakdown,
  totalFindings,
}) => {
  const severityData = [
    {
      level: "Critical",
      count: severityBreakdown.critical,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      icon: <ShieldExclamationIcon className="h-5 w-5" />,
      percentage:
        totalFindings > 0
          ? (severityBreakdown.critical / totalFindings) * 100
          : 0,
    },
    {
      level: "High",
      count: severityBreakdown.high,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
      icon: <ExclamationTriangleIcon className="h-5 w-5" />,
      percentage:
        totalFindings > 0 ? (severityBreakdown.high / totalFindings) * 100 : 0,
    },
    {
      level: "Medium",
      count: severityBreakdown.medium,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      icon: <InformationCircleIcon className="h-5 w-5" />,
      percentage:
        totalFindings > 0
          ? (severityBreakdown.medium / totalFindings) * 100
          : 0,
    },
    {
      level: "Low",
      count: severityBreakdown.low,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      icon: <CheckCircleIcon className="h-5 w-5" />,
      percentage:
        totalFindings > 0 ? (severityBreakdown.low / totalFindings) * 100 : 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vulnerability Severity Breakdown
            </h3>
            <p className="text-sm text-gray-600">
              Distribution of findings by severity level
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {totalFindings}
            </div>
            <div className="text-sm text-gray-600">Total Findings</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {severityData.map((severity) => (
            <div
              key={severity.level}
              className={`rounded-lg border ${severity.borderColor} ${severity.bgColor} p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={severity.color}>{severity.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {severity.level}
                    </div>
                    <div className="text-sm text-gray-600">
                      {severity.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${severity.color}`}>
                    {severity.count}
                  </div>
                  <div className="text-sm text-gray-600">findings</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    severity.level === "Critical"
                      ? "bg-red-500"
                      : severity.level === "High"
                      ? "bg-orange-500"
                      : severity.level === "Medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${severity.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {severityBreakdown.critical + severityBreakdown.high}
              </div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {severityBreakdown.medium + severityBreakdown.low}
              </div>
              <div className="text-sm text-gray-600">Low Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeverityBreakdownCard;
