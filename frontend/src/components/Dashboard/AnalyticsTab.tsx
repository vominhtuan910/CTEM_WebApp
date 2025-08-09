import React from "react";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";

interface AnalyticsTabProps {
  data: {
    trends: {
      findings_trend: string;
      findings_change: string;
      current_period: number;
      previous_period: number;
    };
    scan_statistics: {
      success_rate: number;
      total_openvas_scans: number;
      total_nmap_scans: number;
      failed_scans: number;
    };
    status_breakdown: {
      validated: number;
      not_validated: number;
      false_positive: number;
      exploitable: number;
    };
  };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ data }) => {
  return (
    <section className="py-6" aria-labelledby="analytics-section-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-100 rounded-lg">
          <ChartBarSquareIcon className="text-violet-600 h-5 w-5" />
        </div>
        <div>
          <h2
            id="analytics-section-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Security Analytics
          </h2>
          <p className="text-gray-600">Trends and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Vulnerability Trends
            </h3>
            <p className="text-sm text-gray-600">30-day comparison</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <div
                className={`text-3xl font-bold ${
                  data.trends.findings_trend === "up"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {data.trends.findings_trend === "up" ? "↗" : "↘"}{" "}
                {data.trends.findings_change}
              </div>
              <div className="text-sm text-gray-600">
                {data.trends.findings_trend === "up"
                  ? "Increase"
                  : "Decrease"}{" "}
                from last period
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {data.trends.current_period}
                </div>
                <div className="text-xs text-gray-600">Current</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {data.trends.previous_period}
                </div>
                <div className="text-xs text-gray-600">Previous</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Statistics Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Scan Performance
            </h3>
            <p className="text-sm text-gray-600">
              Overall scan statistics
            </p>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">
                {data.scan_statistics.success_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  OpenVAS Scans
                </span>
                <span className="text-sm font-medium">
                  {data.scan_statistics.total_openvas_scans}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Network Scans
                </span>
                <span className="text-sm font-medium">
                  {data.scan_statistics.total_nmap_scans}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Failed Scans
                </span>
                <span className="text-sm font-medium text-red-600">
                  {data.scan_statistics.failed_scans}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Finding Status
            </h3>
            <p className="text-sm text-gray-600">
              Validation and exploitation status
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Validated</span>
                <span className="text-sm font-medium text-green-600">
                  {data.status_breakdown.validated}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Not Validated
                </span>
                <span className="text-sm font-medium text-yellow-600">
                  {data.status_breakdown.not_validated}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  False Positive
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {data.status_breakdown.false_positive}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Exploitable</span>
                <span className="text-sm font-medium text-red-600">
                  {data.status_breakdown.exploitable}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsTab;
