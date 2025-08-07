from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from src.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, unique=True, index=True, nullable=False)
    hostname = Column(String, nullable=True)
    os = Column(String, nullable=True)
    status = Column(String, default="active", nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    nmap_scans = relationship(
        "NmapScan", back_populates="asset", cascade="all, delete-orphan"
    )
    openvas_scans = relationship(
        "OpenVasScan", back_populates="asset", cascade="all, delete-orphan"
    )

    # Table constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive', 'decommissioned')",
            name="chk_asset_status",
        ),
        Index("idx_assets_status", "status"),
        Index("idx_assets_created_at", "created_at"),
        Index("idx_assets_updated_at", "updated_at"),
    )
