"""
Krushak Bani - Crop History Router (crop_history.py)
Implements multi-season farm journal, plot-wise crop records, yield tracking and profit ledger.
"""

import sqlite3
import os
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/crop-history", tags=["Crop History"])

DB_PATH = os.path.join(os.path.dirname(__file__), "krushak_crop_history.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crop_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            season TEXT NOT NULL,
            plot_name TEXT NOT NULL,
            crop_name_en TEXT NOT NULL,
            crop_name_or TEXT NOT NULL,
            variety TEXT,
            area_acres REAL,
            sowing_date TEXT,
            harvest_date TEXT,
            yield_quintals REAL,
            yield_per_acre REAL,
            total_expenses_inr REAL,
            net_revenue_inr REAL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

class CropHistoryEntry(BaseModel):
    year: int
    season: str
    plot_name: str
    crop_name_en: str
    crop_name_or: str
    variety: Optional[str] = "Standard"
    area_acres: Optional[float] = 1.0
    sowing_date: Optional[str] = ""
    harvest_date: Optional[str] = ""
    yield_quintals: Optional[float] = 0.0
    total_expenses_inr: Optional[float] = 0.0
    net_revenue_inr: Optional[float] = 0.0
    notes: Optional[str] = ""

@router.get("/entries")
def get_crop_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM crop_history ORDER BY year DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/entries")
def add_crop_history(entry: CropHistoryEntry):
    yield_per_acre = round((entry.yield_quintals or 0) / (entry.area_acres or 1), 1) if (entry.area_acres or 0) > 0 else 0

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO crop_history (
            year, season, plot_name, crop_name_en, crop_name_or, variety, area_acres, 
            sowing_date, harvest_date, yield_quintals, yield_per_acre, total_expenses_inr, 
            net_revenue_inr, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry.year,
        entry.season,
        entry.plot_name,
        entry.crop_name_en,
        entry.crop_name_or,
        entry.variety,
        entry.area_acres,
        entry.sowing_date,
        entry.harvest_date,
        entry.yield_quintals,
        yield_per_acre,
        entry.total_expenses_inr,
        entry.net_revenue_inr,
        entry.notes
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "SUCCESS", "id": new_id, "entry": entry}

@router.delete("/entries/{entry_id}")
def delete_crop_history(entry_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM crop_history WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return {"status": "DELETED", "id": entry_id}
