import React from "react";
import {
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { VulnerableAssetsCardProps } from "../../types/dashboard.types";

const VulnerableAssetsCard: React.FC<VulnerableAssetsCardProps> = ({
  vulnerableAssets,
  title = "Most Vulnerable Assets",
}) => {
  const getRiskLevel = (count: number) => {
    if (count >= 10)
      return {
        level: "Critical",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    if (count >= 5)
      return {
        level: "High",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    if (count >= 2)
      return {
        level: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { level: "Low", color: "text-blue-600", bgColor: "bg-blue-100" };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ComputerDesktopIcon className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              Assets with the highest vulnerability count
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {vulnerableAssets.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-gray-600">No vulnerable assets found</div>
            <div className="text-sm text-gray-500 mt-1">
              All assets appear to be secure or haven't been scanned yet.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {vulnerableAssets.slice(0, 10).map((asset, index) => {
              const risk = getRiskLevel(asset.vulnerability_count);

              return (
                <div
                  key={`${asset.ip}-${index}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">
                          {asset.ip}
                        </div>
                        {asset.hostname !== "Unknown" && (
                          <div className="text-sm text-gray-600">
                            ({asset.hostname})
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${risk.bgColor} ${risk.color}`}
                        >
                          {risk.level} Risk
                        </div>
                        <div className="text-sm text-gray-600">
                          {asset.vulnerability_count}{" "}
                          {asset.vulnerability_count === 1
                            ? "vulnerability"
                            : "vulnerabilities"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${risk.color}`}>
                        {asset.vulnerability_count}
                      </div>
                      <div className="text-xs text-gray-500">findings</div>
                    </div>

                    {asset.vulnerability_count >= 5 && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {vulnerableAssets.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {
                    vulnerableAssets.filter((a) => a.vulnerability_count >= 10)
                      .length
                  }
                </div>
                <div className="text-xs text-gray-600">Critical Risk</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {
                    vulnerableAssets.filter(
                      (a) =>
                        a.vulnerability_count >= 5 && a.vulnerability_count < 10
                    ).length
                  }
                </div>
                <div className="text-xs text-gray-600">High Risk</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {
                    vulnerableAssets.filter((a) => a.vulnerability_count < 5)
                      .length
                  }
                </div>
                <div className="text-xs text-gray-600">Medium/Low Risk</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VulnerableAssetsCard;
