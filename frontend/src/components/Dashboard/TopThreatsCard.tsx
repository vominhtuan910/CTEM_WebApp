import React from "react";
import {
  ShieldExclamationIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { TopThreatsCardProps } from "../../types/dashboard.types";

const TopThreatsCard: React.FC<TopThreatsCardProps> = ({
  topCVEs,
  title = "Top CVE Threats",
}) => {
  const handleCVEClick = (cveId: string) => {
    // Open CVE details in new tab
    window.open(
      `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`,
      "_blank"
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              Most frequently found vulnerabilities
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {topCVEs.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <ShieldExclamationIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-gray-600">No CVE threats found</div>
            <div className="text-sm text-gray-500 mt-1">
              This is good news! No known CVEs detected.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {topCVEs.slice(0, 10).map((cve, index) => (
              <div
                key={cve.cve_id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleCVEClick(cve.cve_id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {cve.cve_id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Found in {cve.count}{" "}
                      {cve.count === 1 ? "asset" : "assets"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {cve.count}
                    </div>
                    <div className="text-xs text-gray-500">instances</div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {topCVEs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing top {Math.min(topCVEs.length, 10)} CVEs
              </div>
              <div className="text-sm text-gray-600">
                Total unique CVEs: {topCVEs.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopThreatsCard;
