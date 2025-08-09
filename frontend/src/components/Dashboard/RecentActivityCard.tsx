import React from "react";
import {
  BugAntIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { RecentActivityCardProps } from "../../types/dashboard.types";

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  recentActivity,
}) => {
  const activityItems = [
    {
      label: "New Findings",
      value: recentActivity.new_findings_7d,
      icon: <BugAntIcon className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Vulnerabilities discovered in the last 7 days",
    },
    {
      label: "Scans Completed",
      value: recentActivity.scans_completed_7d,
      icon: <MagnifyingGlassIcon className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Total scans completed in the last 7 days",
    },
    {
      label: "Vulnerability Scans",
      value: recentActivity.openvas_scans_7d,
      icon: <ComputerDesktopIcon className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Vulnerability scans performed",
    },
    {
      label: "Network Scans",
      value: recentActivity.nmap_scans_7d,
      icon: <ComputerDesktopIcon className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Network discovery scans performed",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClockIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Recent Activity
            </h3>
            <p className="text-xs text-gray-600">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {activityItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                  <div className={item.color}>{item.icon}</div>
                </div>
                <div className={`text-xl font-bold ${item.color}`}>
                  {item.value}
                </div>
              </div>

              <div className="mb-2">
                <div className="font-semibold text-sm text-gray-900">
                  {item.label}
                </div>
              </div>

              {/* Activity indicator */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  {item.value > 0 ? (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-500">
                    {item.value > 0 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Total security events this week
            </div>
            <div className="text-lg font-bold text-gray-900">
              {recentActivity.new_findings_7d +
                recentActivity.scans_completed_7d}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCard;
