import React from "react";
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { AlertsCardProps } from "../../types/dashboard.types";

const AlertsCard: React.FC<AlertsCardProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <ShieldExclamationIcon className="h-5 w-5" />;
      case "danger":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case "critical":
        return {
          text: "text-red-600",
          bg: "bg-red-100",
          border: "border-red-200",
          badge: "bg-red-500",
        };
      case "danger":
        return {
          text: "text-red-600",
          bg: "bg-red-100",
          border: "border-red-200",
          badge: "bg-red-500",
        };
      case "warning":
        return {
          text: "text-yellow-600",
          bg: "bg-yellow-100",
          border: "border-yellow-200",
          badge: "bg-yellow-500",
        };
      default:
        return {
          text: "text-blue-600",
          bg: "bg-blue-100",
          border: "border-blue-200",
          badge: "bg-blue-500",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <BellIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Security Alerts
              </h3>
              <p className="text-sm text-gray-600">
                Critical items requiring attention
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {alerts.length}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <ShieldExclamationIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-green-600 font-medium">All Clear!</div>
            <div className="text-sm text-gray-500 mt-1">
              No critical alerts at this time.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const colors = getAlertColors(alert.type);

              return (
                <div
                  key={index}
                  className={`border ${colors.border} ${colors.bg} rounded-lg p-4`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${colors.text} mt-0.5`}>
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${colors.text}`}>
                          {alert.title}
                        </h4>
                        <div
                          className={`${colors.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}
                        >
                          {alert.count}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {alert.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          <strong>Recommended action:</strong> {alert.action}
                        </div>
                        <div className={`text-xs font-medium ${colors.text}`}>
                          {alert.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {alerts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {
                    alerts.filter(
                      (a) => a.type === "critical" || a.type === "danger"
                    ).length
                  }
                </div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {alerts.filter((a) => a.type === "warning").length}
                </div>
                <div className="text-xs text-gray-600">Warning</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {alerts.filter((a) => a.type === "info").length}
                </div>
                <div className="text-xs text-gray-600">Info</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsCard;
