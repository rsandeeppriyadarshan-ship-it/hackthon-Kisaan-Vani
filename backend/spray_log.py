"""
Krushak Bani - Spray Log Router (spray_log.py)
Implements:
- Feature 6: Spray Log (SQLite database backend)
  1) Table with product, crop, date, dose, area.
  2) Add entry and list entries.
  3) Warn if new spray is added too recently (< 7 days interval).
  4) Triggers Feature 9 (Safety Alert).
"""

import sqlite3
import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/spray-log", tags=["Spray Log"])

DB_PATH = os.path.join(os.path.dirname(__file__), "krushak_spray_log.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spray_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            crop_name TEXT NOT NULL,
            spray_date TEXT NOT NULL,
            dosage TEXT,
            field_area_acres REAL,
            target_pest_disease TEXT,
            applicator_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

class SprayEntry(BaseModel):
    product_name: str
    crop_name: str
    spray_date: str          # YYYY-MM-DD
    dosage: Optional[str] = ""
    field_area_acres: Optional[float] = 1.0
    target_pest_disease: Optional[str] = ""
    applicator_notes: Optional[str] = ""

@router.get("/entries")
def get_spray_entries():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM spray_records ORDER BY spray_date DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.post("/entries")
def add_spray_entry(entry: SprayEntry):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Check last spray date for the same crop to warn if too recent
    cursor.execute(
        "SELECT spray_date, product_name FROM spray_records WHERE crop_name = ? ORDER BY spray_date DESC LIMIT 1",
        (entry.crop_name,)
    )
    last_record = cursor.fetchone()

    warning_too_recent = None
    if last_record:
        try:
            last_date = datetime.strptime(last_record["spray_date"], "%Y-%m-%d").date()
            curr_date = datetime.strptime(entry.spray_date, "%Y-%m-%d").date()
            days_diff = (curr_date - last_date).days
            if 0 <= days_diff < 7:
                warning_too_recent = {
                    "is_warning": True,
                    "days_since_last": days_diff,
                    "last_product": last_record["product_name"],
                    "message_en": f"WARNING: {entry.crop_name} was sprayed only {days_diff} days ago with {last_record['product_name']}. Frequent spraying risks phytotoxicity and chemical residue. Observe minimum 7-10 day gap.",
                    "message_or": f"ସାବଧାନ: ଏହି ଫସଲରେ ମାତ୍ର {days_diff} ଦିନ ପୂର୍ବରୁ ସ୍ପ୍ରେ କରାଯାଇଥିଲା। ବାରମ୍ବାର ସ୍ପ୍ରେ କଲେ ଗଛ ପୋଡ଼ିଯିବା ଓ ବିଷାକ୍ତ ହେବାର ଆଶଙ୍କା ଥାଏ।"
                }
        except Exception:
            pass

    # Insert new entry
    cursor.execute("""
        INSERT INTO spray_records (product_name, crop_name, spray_date, dosage, field_area_acres, target_pest_disease, applicator_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        entry.product_name,
        entry.crop_name,
        entry.spray_date,
        entry.dosage,
        entry.field_area_acres,
        entry.target_pest_disease,
        entry.applicator_notes
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "status": "SUCCESS",
        "id": new_id,
        "entry": entry,
        "recurrence_warning": warning_too_recent,
        "trigger_safety_alert": True,  # Triggers feature 9
        "safety_reminder_en": "Please review the Post-Spray Poisoning Guide and take a bath with soap immediately after field application.",
        "safety_reminder_or": "ସ୍ପ୍ରେ ପରେ ସାଙ୍ଗେ ସାଙ୍ଗେ ସାବୁନ ଲଗାଇ ଗାଧୋଇ ପଡ଼ନ୍ତୁ ଏବଂ ସଫା ଲୁଗା ପିନ୍ଧନ୍ତୁ।"
    }

@router.delete("/entries/{entry_id}")
def delete_spray_entry(entry_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM spray_records WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return {"status": "DELETED", "id": entry_id}

@router.get("/export-csv")
def export_spray_log_csv():
    import csv
    import io
    from fastapi.responses import Response

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM spray_records ORDER BY spray_date DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Product Name", "Crop", "Spray Date", "Dosage", "Field Area (Acres)", "Target Pest/Disease", "Notes", "Created At"])
    for r in rows:
        writer.writerow([r["id"], r["product_name"], r["crop_name"], r["spray_date"], r["dosage"], r["field_area_acres"], r["target_pest_disease"], r["applicator_notes"], r["created_at"]])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=krushak_spray_log.csv"}
    )

