import React from "react";
import { ComputerDesktopIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import CoverageCard from "./CoverageCard";

interface AssetManagementTabProps {
  data: {
    coverage: any;
    asset_intelligence: {
      active_assets: number;
      inactive_assets: number;
      os_distribution: Array<{
        os: string;
        count: number;
      }>;
    };
  };
}

const AssetManagementTab: React.FC<AssetManagementTabProps> = ({ data }) => {
  return (
    <section className="py-6" aria-labelledby="assets-section-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ComputerDesktopIcon className="text-blue-600 h-5 w-5" />
        </div>
        <div>
          <h2
            id="assets-section-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Asset Management
          </h2>
          <p className="text-gray-600">
            Coverage analysis and asset intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoverageCard coverage={data.coverage} />

        {/* Asset Intelligence Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartPieIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Asset Intelligence
                </h3>
                <p className="text-sm text-gray-600">
                  Operating system distribution and asset status
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.asset_intelligence.active_assets}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Active Assets
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {data.asset_intelligence.inactive_assets}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Inactive Assets
                </div>
              </div>
            </div>

            {data.asset_intelligence.os_distribution.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  OS Distribution
                </h4>
                <div className="space-y-2">
                  {data.asset_intelligence.os_distribution
                    .slice(0, 5)
                    .map((os, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {os.os}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {os.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssetManagementTab;
