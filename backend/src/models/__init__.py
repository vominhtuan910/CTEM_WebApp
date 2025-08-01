from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

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

class NmapScan(Base):
    __tablename__ = "nmap_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    scan_date = Column(DateTime, default=datetime.utcnow)
    ports = Column(JSON)  # e.g. [{"port":22,"service":"ssh"}]
    os = Column(String, nullable=True)
    
    # Relationships
    asset = relationship("Asset", back_populates="nmap_scans")

class OpenVasScan(Base):
    __tablename__ = "openvas_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    scan_date = Column(DateTime, default=datetime.utcnow)
    report_xml = Column(Text)  # raw XML string or path to file
    
    # Relationships
    asset = relationship("Asset", back_populates="openvas_scans")
    findings = relationship("Finding", back_populates="openvas_scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(Integer, primary_key=True, index=True)
    openvas_scan_id = Column(Integer, ForeignKey("openvas_scans.id"))
    cve_id = Column(String)
    title = Column(String)
    severity = Column(String)
    cvss_score = Column(Float, nullable=True)
    status = Column(String, default="NOT_VALIDATED")  # NOT_VALIDATED, VALIDATED, NOT_CONFIRM
    exploit_command = Column(String, nullable=True)  # optional data from searchsploit or Metasploit
    
    # Relationships
    openvas_scan = relationship("OpenVasScan", back_populates="findings")
