import React from "react";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import TopThreatsCard from "./TopThreatsCard";
import VulnerableAssetsCard from "./VulnerableAssetsCard";

interface ThreatIntelligenceTabProps {
  data: {
    top_cves: any[];
    vulnerable_assets: any[];
  };
}

const ThreatIntelligenceTab: React.FC<ThreatIntelligenceTabProps> = ({ data }) => {
  return (
    <section className="py-6" aria-labelledby="threats-section-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <ShieldExclamationIcon className="text-red-600 h-5 w-5" />
        </div>
        <div>
          <h2
            id="threats-section-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Threat Intelligence
          </h2>
          <p className="text-gray-600">
            Vulnerability analysis and asset risk assessment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopThreatsCard topCVEs={data.top_cves} />
        <VulnerableAssetsCard vulnerableAssets={data.vulnerable_assets} />
      </div>
    </section>
  );
};

export default ThreatIntelligenceTab;
