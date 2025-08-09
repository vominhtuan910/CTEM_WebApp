import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import {
  ClipboardDocumentListIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";
import OverviewTab from "./OverviewTab";
import ThreatIntelligenceTab from "./ThreatIntelligenceTab";
import AssetManagementTab from "./AssetManagementTab";
import AnalyticsTab from "./AnalyticsTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

interface DashboardTabsProps {
  data: any;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ data }) => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabIconStyle = "h-5 w-5 mr-2";

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="dashboard tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 64,
              color: "rgb(75, 85, 99)",
              "&.Mui-selected": {
                color: "rgb(59, 130, 246)",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "rgb(59, 130, 246)",
              height: 3,
            },
          }}
        >
          <Tab
            label={
              <div className="flex items-center">
                <ClipboardDocumentListIcon className={tabIconStyle} />
                Overview
              </div>
            }
            id="dashboard-tab-0"
            aria-controls="dashboard-tabpanel-0"
          />
          <Tab
            label={
              <div className="flex items-center">
                <ShieldExclamationIcon className={tabIconStyle} />
                Threat Intelligence
              </div>
            }
            id="dashboard-tab-1"
            aria-controls="dashboard-tabpanel-1"
          />
          <Tab
            label={
              <div className="flex items-center">
                <ComputerDesktopIcon className={tabIconStyle} />
                Asset Management
              </div>
            }
            id="dashboard-tab-2"
            aria-controls="dashboard-tabpanel-2"
          />
          <Tab
            label={
              <div className="flex items-center">
                <ChartBarSquareIcon className={tabIconStyle} />
                Analytics
              </div>
            }
            id="dashboard-tab-3"
            aria-controls="dashboard-tabpanel-3"
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <OverviewTab
          data={{
            health_score: data.health_score,
            total_findings: data.total_findings,
            severity_breakdown: data.severity_breakdown,
            recent_activity: data.recent_activity,
          }}
        />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <ThreatIntelligenceTab
          data={{
            top_cves: data.top_cves,
            vulnerable_assets: data.vulnerable_assets,
          }}
        />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <AssetManagementTab
          data={{
            coverage: data.coverage,
            asset_intelligence: data.asset_intelligence,
          }}
        />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <AnalyticsTab
          data={{
            trends: data.trends,
            scan_statistics: data.scan_statistics,
            status_breakdown: data.status_breakdown,
          }}
        />
      </TabPanel>
    </Box>
  );
};

export default DashboardTabs;
