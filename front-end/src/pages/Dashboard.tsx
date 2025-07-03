import { Link } from "react-router-dom";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SecurityIcon from "@mui/icons-material/Security";
import BarChartIcon from "@mui/icons-material/BarChart";
import BugReportIcon from "@mui/icons-material/BugReport";
import PieChartIcon from "@mui/icons-material/PieChart";
import AppHeader from "../components/AppHeader";

// Mock data
const healthScore = {
    score: 68,
    classification: "C",
    lastWeek: 72,
    standard: 70,
};

const scoreChange = healthScore.score - healthScore.lastWeek;
const percentToStandard =
    healthScore.standard > healthScore.score
        ? healthScore.standard - healthScore.score
        : 0;

const errorsToWatch = [
    {
        name: "Unpatched Vulnerability",
        trend: "down",
        change: -5,
        type: "Software",
        id: 1,
    },
    {
        name: "Weak Password Policy",
        trend: "down",
        change: -3,
        type: "Policy",
        id: 2,
    },
];

const threatsSummary = {
    week: {
        total: 18,
        impactful: [
            {
                id: 101,
                name: "SQL Injection",
                type: "RCE",
                increase: 4,
            },
            {
                id: 102,
                name: "Open Port Detected",
                type: "Network",
                increase: 2,
            },
        ],
    },
    month: {
        total: 52,
        impactful: [
            {
                id: 201,
                name: "Phishing Attempt",
                type: "Social Engineering",
                increase: 7,
            },
            {
                id: 202,
                name: "DDOS Attack",
                type: "DDOS",
                increase: 3,
            },
        ],
    },
};

const commonThreats = [
    { name: "SQL Injection", count: 12 },
    { name: "Phishing", count: 9 },
    { name: "Open Port", count: 7 },
];

const attackedAssets = [
    { name: "Web Server", count: 10 },
    { name: "Database", count: 8 },
    { name: "User Accounts", count: 6 },
];

const attackMethods = [
    { name: "RCE", count: 11 },
    { name: "DDOS", count: 8 },
    { name: "Brute Force", count: 5 },
];

const Dashboard: React.FC = () => {
    return (
        <>
        <AppHeader />
            <div className="bg-gray-50 p-6">
                <h1 className="mb-6 text-3xl font-bold text-blue-700 flex items-center gap-2">
                    <SecurityIcon className="text-blue-600" />
                    Dashboard Overview
                </h1>

                {/* Health Score Section */}
                <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-lg bg-white p-6 shadow flex flex-col items-center">
                        <span className="text-5xl font-extrabold text-blue-700">{healthScore.score}</span>
                        <span className="mt-2 text-lg font-semibold text-gray-600">
                            Health Score
                            <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm font-bold">
                                {healthScore.classification}
                            </span>
                        </span>
                        <span className="mt-2 text-gray-500 text-sm">
                            {scoreChange >= 0 ? (
                                <span className="flex items-center text-green-600">
                                    <ArrowUpwardIcon fontSize="small" /> +{scoreChange} vs last week
                                </span>
                            ) : (
                                <span className="flex items-center text-red-600">
                                    <ArrowDownwardIcon fontSize="small" /> {scoreChange} vs last week
                                </span>
                            )}
                        </span>
                        <span className="mt-2 text-gray-500 text-sm">
                            {percentToStandard > 0
                                ? `${percentToStandard} points to reach standard (70)`
                                : "Meets standard"}
                        </span>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow col-span-2">
                        <div className="mb-2 text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <WarningAmberIcon className="text-yellow-500" />
                            Errors to Watch (Downward Trend)
                        </div>
                        <ul>
                            {errorsToWatch.map((err) => (
                                <li key={err.id} className="flex items-center gap-3 mb-2">
                                    <TrendingDownIcon className="text-red-500" />
                                    <span className="font-medium">{err.name}</span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {err.type}
                                    </span>
                                    <span className="text-red-600 text-sm flex items-center">
                                        {err.change}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Threats Summary */}
                <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <BugReportIcon className="text-blue-600" />
                            Threats Detected (Last Week)
                        </div>
                        <div className="mb-2 text-2xl font-bold text-blue-700">{threatsSummary.week.total}</div>
                        <div className="mb-2 text-gray-600 font-medium">Most Impactful:</div>
                        <ul>
                            {threatsSummary.week.impactful.map((threat) => (
                                <li key={threat.id} className="flex items-center gap-2 mb-1">
                                    <Link
                                        to={`/threats/${threat.id}`}
                                        className="text-blue-700 hover:underline font-semibold"
                                    >
                                        {threat.name}
                                    </Link>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {threat.type}
                                    </span>
                                    <span className="flex items-center text-green-600 text-xs">
                                        <TrendingUpIcon fontSize="small" /> +{threat.increase}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <BugReportIcon className="text-blue-600" />
                            Threats Detected (Last Month)
                        </div>
                        <div className="mb-2 text-2xl font-bold text-blue-700">{threatsSummary.month.total}</div>
                        <div className="mb-2 text-gray-600 font-medium">Most Impactful:</div>
                        <ul>
                            {threatsSummary.month.impactful.map((threat) => (
                                <li key={threat.id} className="flex items-center gap-2 mb-1">
                                    <Link
                                        to={`/threats/${threat.id}`}
                                        className="text-blue-700 hover:underline font-semibold"
                                    >
                                        {threat.name}
                                    </Link>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {threat.type}
                                    </span>
                                    <span className="flex items-center text-green-600 text-xs">
                                        <TrendingUpIcon fontSize="small" /> +{threat.increase}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Charts Section */}
                <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <BarChartIcon className="text-blue-600" />
                            Common Threats by Frequency
                        </div>
                        <ul>
                            {commonThreats.map((t) => (
                                <li key={t.name} className="flex justify-between items-center mb-1">
                                    <span>{t.name}</span>
                                    <span className="font-bold text-blue-700">{t.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <PieChartIcon className="text-blue-600" />
                            Most Attacked Asset Types
                        </div>
                        <ul>
                            {attackedAssets.map((a) => (
                                <li key={a.name} className="flex justify-between items-center mb-1">
                                    <span>{a.name}</span>
                                    <span className="font-bold text-blue-700">{a.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                            <BarChartIcon className="text-blue-600" />
                            Common Attack Methods
                        </div>
                        <ul>
                            {attackMethods.map((m) => (
                                <li key={m.name} className="flex justify-between items-center mb-1">
                                    <span>{m.name}</span>
                                    <span className="font-bold text-blue-700">{m.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Dashboard;

