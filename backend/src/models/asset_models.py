from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database import Base

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, unique=True, index=True)
    hostname = Column(String, nullable=True)
    os = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    nmap_scans = relationship("NmapScan", back_populates="asset", cascade="all, delete-orphan")
    openvas_scans = relationship("OpenVasScan", back_populates="asset", cascade="all, delete-orphan")
