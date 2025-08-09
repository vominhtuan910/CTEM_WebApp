from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from src.database import get_db
from src.models.vulnerability_models import Finding, OpenVasScan
from src.models.asset_models import Asset
from src.models.scan_models import NmapScan
from typing import Dict, List
from datetime import datetime, timedelta, timezone

router = APIRouter()


@router.get("/", response_model=Dict)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """Get comprehensive dashboard data"""
    try:
        # Basic counts
        total_assets = db.query(Asset).count()
        active_assets = db.query(Asset).filter(Asset.status == "active").count()
        total_findings = db.query(Finding).count()

        # Findings by severity
        critical_findings = (
            db.query(Finding).filter(Finding.severity == "Critical").count()
        )
        high_findings = db.query(Finding).filter(Finding.severity == "High").count()
        medium_findings = db.query(Finding).filter(Finding.severity == "Medium").count()
        low_findings = db.query(Finding).filter(Finding.severity == "Low").count()

        # Findings by status
        validated_findings = (
            db.query(Finding).filter(Finding.status == "VALIDATED").count()
        )
        not_validated_findings = (
            db.query(Finding).filter(Finding.status == "NOT_VALIDATED").count()
        )
        false_positive_findings = (
            db.query(Finding).filter(Finding.status == "FALSE_POSITIVE").count()
        )

        # Exploitable findings (those with exploit commands)
        exploitable_findings = (
            db.query(Finding).filter(Finding.exploit_command.isnot(None)).count()
        )

        # Calculate health score
        if total_findings > 0:
            risk_score = (
                critical_findings * 10
                + high_findings * 7
                + medium_findings * 4
                + low_findings * 1
            )
            max_possible_score = total_findings * 10
            health_score = (
                max(0, 100 - int((risk_score / max_possible_score) * 100))
                if max_possible_score > 0
                else 100
            )
        else:
            health_score = 100

        # Recent activity (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_findings = (
            db.query(Finding).filter(Finding.discovered_at >= seven_days_ago).count()
        )
        recent_scans = (
            db.query(OpenVasScan)
            .filter(OpenVasScan.scan_date >= seven_days_ago)
            .count()
        )
        recent_nmap_scans = (
            db.query(NmapScan).filter(NmapScan.scan_date >= seven_days_ago).count()
        )

        # Top vulnerabilities by CVE
        top_cves = (
            db.query(Finding.cve_id, func.count(Finding.id).label("count"))
            .filter(Finding.cve_id.isnot(None))
            .filter(Finding.cve_id != "")
            .group_by(Finding.cve_id)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        # Assets with most vulnerabilities
        assets_with_vulns = (
            db.query(
                Asset.ip, Asset.hostname, func.count(Finding.id).label("vuln_count")
            )
            .join(OpenVasScan, Asset.id == OpenVasScan.asset_id)
            .join(Finding, OpenVasScan.id == Finding.openvas_scan_id)
            .group_by(Asset.id, Asset.ip, Asset.hostname)
            .order_by(desc("vuln_count"))
            .limit(10)
            .all()
        )

        # Scan statistics
        total_openvas_scans = db.query(OpenVasScan).count()
        total_nmap_scans = db.query(NmapScan).count()
        completed_scans = (
            db.query(OpenVasScan).filter(OpenVasScan.status == "completed").count()
        )
        failed_scans = (
            db.query(OpenVasScan).filter(OpenVasScan.status == "failed").count()
        )

        # Asset coverage (assets scanned in last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        scanned_assets = (
            db.query(Asset)
            .join(OpenVasScan, Asset.id == OpenVasScan.asset_id)
            .filter(OpenVasScan.scan_date >= thirty_days_ago)
            .distinct()
            .count()
        )

        coverage_percentage = (
            (scanned_assets / total_assets * 100) if total_assets > 0 else 0
        )

        # OS distribution
        os_distribution = (
            db.query(Asset.os, func.count(Asset.id).label("count"))
            .filter(Asset.os.isnot(None))
            .group_by(Asset.os)
            .order_by(desc("count"))
            .limit(10)
            .all()
        )

        # Trending data (last 30 days vs previous 30 days)
        sixty_days_ago = datetime.now(timezone.utc) - timedelta(days=60)

        current_period_findings = (
            db.query(Finding).filter(Finding.discovered_at >= thirty_days_ago).count()
        )

        previous_period_findings = (
            db.query(Finding)
            .filter(
                and_(
                    Finding.discovered_at >= sixty_days_ago,
                    Finding.discovered_at < thirty_days_ago,
                )
            )
            .count()
        )

        findings_trend = (
            "up" if current_period_findings > previous_period_findings else "down"
        )
        findings_change = abs(current_period_findings - previous_period_findings)

        return {
            "success": True,
            "data": {
                # Core metrics
                "total_assets": total_assets,
                "active_assets": active_assets,
                "total_findings": total_findings,
                "health_score": {
                    "score": health_score,
                    "classification": get_health_classification(health_score),
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                },
                # Severity breakdown
                "severity_breakdown": {
                    "critical": critical_findings,
                    "high": high_findings,
                    "medium": medium_findings,
                    "low": low_findings,
                },
                # Status breakdown
                "status_breakdown": {
                    "validated": validated_findings,
                    "not_validated": not_validated_findings,
                    "false_positive": false_positive_findings,
                    "exploitable": exploitable_findings,
                },
                # Recent activity
                "recent_activity": {
                    "new_findings_7d": recent_findings,
                    "scans_completed_7d": recent_scans + recent_nmap_scans,
                    "openvas_scans_7d": recent_scans,
                    "nmap_scans_7d": recent_nmap_scans,
                },
                # Top threats
                "top_cves": [{"cve_id": cve[0], "count": cve[1]} for cve in top_cves],
                # Most vulnerable assets
                "vulnerable_assets": [
                    {
                        "ip": asset[0],
                        "hostname": asset[1] or "Unknown",
                        "vulnerability_count": asset[2],
                    }
                    for asset in assets_with_vulns
                ],
                # Scan statistics
                "scan_statistics": {
                    "total_openvas_scans": total_openvas_scans,
                    "total_nmap_scans": total_nmap_scans,
                    "completed_scans": completed_scans,
                    "failed_scans": failed_scans,
                    "success_rate": (completed_scans / total_openvas_scans * 100)
                    if total_openvas_scans > 0
                    else 0,
                },
                # Coverage metrics
                "coverage": {
                    "scanned_assets": scanned_assets,
                    "total_assets": total_assets,
                    "coverage_percentage": round(coverage_percentage, 1),
                    "unscanned_assets": total_assets - scanned_assets,
                },
                # Asset intelligence
                "asset_intelligence": {
                    "os_distribution": [
                        {"os": os[0], "count": os[1]} for os in os_distribution
                    ],
                    "active_assets": active_assets,
                    "inactive_assets": total_assets - active_assets,
                },
                # Trends
                "trends": {
                    "findings_trend": findings_trend,
                    "findings_change": findings_change,
                    "current_period": current_period_findings,
                    "previous_period": previous_period_findings,
                },
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_health_classification(score: int) -> str:
    """Get health classification based on score"""
    if score >= 90:
        return "Excellent"
    elif score >= 80:
        return "Good"
    elif score >= 70:
        return "Fair"
    elif score >= 60:
        return "Poor"
    else:
        return "Critical"


@router.get("/metrics", response_model=Dict)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get detailed metrics for charts and analytics"""
    try:
        # Severity distribution over time (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

        severity_timeline = []
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)

            daily_findings = (
                db.query(Finding)
                .filter(
                    and_(
                        Finding.discovered_at >= date, Finding.discovered_at < next_date
                    )
                )
                .all()
            )

            severity_timeline.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "critical": len(
                        [f for f in daily_findings if f.severity == "Critical"]
                    ),
                    "high": len([f for f in daily_findings if f.severity == "High"]),
                    "medium": len(
                        [f for f in daily_findings if f.severity == "Medium"]
                    ),
                    "low": len([f for f in daily_findings if f.severity == "Low"]),
                }
            )

        return {"success": True, "data": {"severity_timeline": severity_timeline}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts", response_model=Dict)
async def get_dashboard_alerts(db: Session = Depends(get_db)):
    """Get critical alerts and notifications"""
    try:
        alerts = []

        # Critical findings without validation
        critical_unvalidated = (
            db.query(Finding)
            .filter(
                and_(Finding.severity == "Critical", Finding.status == "NOT_VALIDATED")
            )
            .count()
        )

        if critical_unvalidated > 0:
            alerts.append(
                {
                    "type": "critical",
                    "title": "Critical Vulnerabilities Need Validation",
                    "message": f"{critical_unvalidated} critical vulnerabilities require validation",
                    "count": critical_unvalidated,
                    "action": "Review and validate critical findings",
                }
            )

        # Assets not scanned recently
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        unscanned_assets = (
            db.query(Asset)
            .filter(
                ~Asset.id.in_(
                    db.query(OpenVasScan.asset_id).filter(
                        OpenVasScan.scan_date >= thirty_days_ago
                    )
                )
            )
            .count()
        )

        if unscanned_assets > 0:
            alerts.append(
                {
                    "type": "warning",
                    "title": "Assets Need Scanning",
                    "message": f"{unscanned_assets} assets haven't been scanned in 30 days",
                    "count": unscanned_assets,
                    "action": "Schedule vulnerability scans",
                }
            )

        # Exploitable vulnerabilities
        exploitable = (
            db.query(Finding).filter(Finding.exploit_command.isnot(None)).count()
        )

        if exploitable > 0:
            alerts.append(
                {
                    "type": "danger",
                    "title": "Exploitable Vulnerabilities Found",
                    "message": f"{exploitable} vulnerabilities have known exploits",
                    "count": exploitable,
                    "action": "Prioritize remediation",
                }
            )

        return {
            "success": True,
            "data": {"alerts": alerts, "total_alerts": len(alerts)},
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
