from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database import Base

class NmapScan(Base):
    __tablename__ = "nmap_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    scan_date = Column(DateTime, default=datetime.utcnow)
    ports = Column(JSON)  # e.g. [{"port":22,"service":"ssh"}]
    os = Column(String, nullable=True)
    
    # Relationships
    asset = relationship("Asset", back_populates="nmap_scans")
