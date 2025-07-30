from pydantic import BaseModel
from typing import List
from enum import Enum

class TrendDirection(str, Enum):
    up = "up"
    down = "down"

class HealthScore(BaseModel):
    score: int
    classification: str
    lastWeek: int
    standard: int

class ErrorToWatch(BaseModel):
    id: int
    name: str
    trend: TrendDirection
    change: int
    type: str

class Threat(BaseModel):
    id: int
    name: str
    type: str
    increase: int

class ThreatsSummary(BaseModel):
    week: dict
    month: dict

class MetricItem(BaseModel):
    name: str
    count: int

class DashboardData(BaseModel):
    healthScore: HealthScore
    errorsToWatch: List[ErrorToWatch]
    threatsSummary: ThreatsSummary
    commonThreats: List[MetricItem]
    attackedAssets: List[MetricItem]
    attackMethods: List[MetricItem] 