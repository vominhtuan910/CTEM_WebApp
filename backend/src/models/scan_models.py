from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    ForeignKey,
    CheckConstraint,
    Index,
    Float,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class NmapScan(Base):
    __tablename__ = "nmap_scans"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    scan_date = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    ports = Column(JSON)  # e.g. [{"port":22,"service":"ssh"}]
    os = Column(String, nullable=True)
    status = Column(String, default="completed", nullable=False)
    scan_duration = Column(Float, nullable=True)  # Duration in seconds
    command_used = Column(String, nullable=True)  # Nmap command that was used

    # Relationships
    asset = relationship("Asset", back_populates="nmap_scans")

    # Table constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('running', 'completed', 'failed', 'cancelled')",
            name="chk_nmap_scan_status",
        ),
        Index("idx_nmap_scans_asset_id", "asset_id"),
        Index("idx_nmap_scans_scan_date", "scan_date"),
        Index("idx_nmap_scans_status", "status"),
    )
