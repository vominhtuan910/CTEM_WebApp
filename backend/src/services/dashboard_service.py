from typing import List
from datetime import datetime
from ..models.dashboard_models import (
    DashboardData, HealthScore, ThreatsSummary, MetricItem,
    ErrorToWatch, Threat, TrendDirection
)

class DashboardService:
    def __init__(self):
        # In a real application, this would connect to various data sources
        # For now, we'll use sample data
        pass

    async def get_dashboard_data(self) -> DashboardData:
        """Get complete dashboard data"""
        return DashboardData(
            healthScore=await self.get_health_score(),
            errorsToWatch=await self.get_errors_to_watch(),
            threatsSummary=await self.get_threats_summary(),
            commonThreats=await self.get_common_threats(),
            attackedAssets=await self.get_attacked_assets(),
            attackMethods=await self.get_attack_methods()
        )

    async def get_health_score(self) -> HealthScore:
        """Get security health score"""
        return HealthScore(
            score=68,
            classification="C",
            lastWeek=72,
            standard=70
        )

    async def get_threats_summary(self) -> ThreatsSummary:
        """Get threats summary"""
        return ThreatsSummary(
            week={
                "total": 18,
                "impactful": [
                    Threat(id=101, name="SQL Injection", type="RCE", increase=4),
                    Threat(id=102, name="Open Port Detected", type="Network", increase=2)
                ]
            },
            month={
                "total": 52,
                "impactful": [
                    Threat(id=201, name="Phishing Attempt", type="Social Engineering", increase=7),
                    Threat(id=202, name="DDOS Attack", type="DDOS", increase=3)
                ]
            }
        )

    async def get_metrics(self) -> dict:
        """Get all dashboard metrics"""
        return {
            "commonThreats": await self.get_common_threats(),
            "attackedAssets": await self.get_attacked_assets(),
            "attackMethods": await self.get_attack_methods()
        }

    async def get_errors_to_watch(self) -> List[ErrorToWatch]:
        """Get errors to watch list"""
        return [
            ErrorToWatch(
                id=1,
                name="Unpatched Vulnerability",
                trend=TrendDirection.down,
                change=-5,
                type="Software"
            ),
            ErrorToWatch(
                id=2,
                name="Weak Password Policy",
                trend=TrendDirection.down,
                change=-3,
                type="Policy"
            )
        ]

    async def get_common_threats(self) -> List[MetricItem]:
        """Get common threats metrics"""
        return [
            MetricItem(name="SQL Injection", count=12),
            MetricItem(name="Phishing", count=9),
            MetricItem(name="Open Port", count=7)
        ]

    async def get_attacked_assets(self) -> List[MetricItem]:
        """Get attacked assets metrics"""
        return [
            MetricItem(name="Web Server", count=10),
            MetricItem(name="Database", count=8),
            MetricItem(name="User Accounts", count=6)
        ]

    async def get_attack_methods(self) -> List[MetricItem]:
        """Get attack methods metrics"""
        return [
            MetricItem(name="RCE", count=11),
            MetricItem(name="DDOS", count=8),
            MetricItem(name="Brute Force", count=5)
        ] 