import React from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import EnhancedHealthScoreCard from "./EnhancedHealthScoreCard";
import SeverityBreakdownCard from "./SeverityBreakdownCard";
import RecentActivityCard from "./RecentActivityCard";

interface OverviewTabProps {
  data: {
    health_score: number;
    total_findings: number;
    severity_breakdown: any;
    recent_activity: any[];
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  return (
    <section className="py-6" aria-labelledby="overview-section-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <ClipboardDocumentListIcon className="text-emerald-600 h-5 w-5" />
        </div>
        <div>
          <h2
            id="overview-section-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Security Overview
          </h2>
          <p className="text-gray-600">
            Key metrics and health indicators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <EnhancedHealthScoreCard
            healthScore={data.health_score}
            totalFindings={data.total_findings}
          />
        </div>
        <div className="xl:col-span-1">
          <SeverityBreakdownCard
            severityBreakdown={data.severity_breakdown}
            totalFindings={data.total_findings}
          />
        </div>
        <div className="xl:col-span-1">
          <RecentActivityCard recentActivity={data.recent_activity} />
        </div>
      </div>
    </section>
  );
};

export default OverviewTab;
