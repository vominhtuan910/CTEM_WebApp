import React from "react";
import {
  ChartPieIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CoverageCardProps } from "../../types/dashboard.types";

const CoverageCard: React.FC<CoverageCardProps> = ({ coverage }) => {
  const getCoverageStatus = (percentage: number) => {
    if (percentage >= 90)
      return {
        status: "Excellent",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
      };
    if (percentage >= 75)
      return {
        status: "Good",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (percentage >= 50)
      return {
        status: "Fair",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { status: "Poor", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const coverageStatus = getCoverageStatus(coverage.coverage_percentage);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ChartPieIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Scan Coverage
            </h3>
            <p className="text-sm text-gray-600">
              Asset scanning coverage in the last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Coverage Percentage */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold ${coverageStatus.color} mb-2`}>
            {coverage.coverage_percentage}%
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${coverageStatus.bgColor} ${coverageStatus.color}`}
          >
            {coverage.coverage_percentage >= 75 ? (
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            )}
            {coverageStatus.status} Coverage
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                coverage.coverage_percentage >= 90
                  ? "bg-emerald-500"
                  : coverage.coverage_percentage >= 75
                  ? "bg-green-500"
                  : coverage.coverage_percentage >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${coverage.coverage_percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Coverage Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {coverage.scanned_assets}
            </div>
            <div className="text-sm text-green-700 font-medium">
              Scanned Assets
            </div>
            <div className="text-xs text-green-600 mt-1">Recently scanned</div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {coverage.unscanned_assets}
            </div>
            <div className="text-sm text-red-700 font-medium">
              Unscanned Assets
            </div>
            <div className="text-xs text-red-600 mt-1">Need attention</div>
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {coverage.total_assets}
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Assets</div>
          <div className="text-xs text-gray-500 mt-1">In your environment</div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm">
            {coverage.coverage_percentage >= 90 ? (
              <div className="text-emerald-700">
                <strong>Excellent coverage!</strong> Your scanning strategy is
                working well.
              </div>
            ) : coverage.coverage_percentage >= 75 ? (
              <div className="text-green-700">
                <strong>Good coverage.</strong> Consider scanning the remaining{" "}
                {coverage.unscanned_assets} assets.
              </div>
            ) : coverage.coverage_percentage >= 50 ? (
              <div className="text-yellow-700">
                <strong>Fair coverage.</strong> {coverage.unscanned_assets}{" "}
                assets need scanning for better security visibility.
              </div>
            ) : (
              <div className="text-red-700">
                <strong>Poor coverage!</strong> {coverage.unscanned_assets}{" "}
                assets are unscanned. Schedule scans immediately.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageCard;
