import { DashboardData } from '../types/dashboard.types';

export const mockDashboardData: DashboardData = {
  healthScore: {
    score: 68,
    classification: "C",
    lastWeek: 72,
    standard: 70,
  },

  errorsToWatch: [
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
  ],

  threatsSummary: {
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
  },

  commonThreats: [
    { name: "SQL Injection", count: 12 },
    { name: "Phishing", count: 9 },
    { name: "Open Port", count: 7 },
  ],

  attackedAssets: [
    { name: "Web Server", count: 10 },
    { name: "Database", count: 8 },
    { name: "User Accounts", count: 6 },
  ],

  attackMethods: [
    { name: "RCE", count: 11 },
    { name: "DDOS", count: 8 },
    { name: "Brute Force", count: 5 },
  ],
};

// Utility function to simulate API delay
export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate occasional errors (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return mockDashboardData;
};