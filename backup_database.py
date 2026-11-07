import os
import json
import datetime
from sqlalchemy import create_engine, text

def serialize_val(val):
    if isinstance(val, (datetime.datetime, datetime.date, datetime.time)):
        return val.isoformat()
    return val

def run_backup():
    from backend.app.database.connection import engine
    
    backup_dir = os.path.abspath("database_backup")
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print(f"Starting database backup at {timestamp}...")
    
    with engine.connect() as conn:
        tables_res = conn.execute(text("SHOW TABLES;"))
        tables = [r[0] for r in tables_res.fetchall()]
        print(f"Found {len(tables)} tables in MySQL: {tables}")
        
        full_backup = {}
        sql_dump_lines = [f"-- NMART Database Backup - {timestamp}\n"]
        
        for table in tables:
            # Get CREATE TABLE DDL
            ddl_res = conn.execute(text(f"SHOW CREATE TABLE `{table}`;")).fetchone()
            create_ddl = ddl_res[1] if ddl_res else ""
            sql_dump_lines.append(f"-- Table: {table}\n{create_ddl};\n")
            
            # Get rows
            rows_res = conn.execute(text(f"SELECT * FROM `{table}`;"))
            col_names = list(rows_res.keys())
            rows_data = []
            for r in rows_res.fetchall():
                row_dict = {col: serialize_val(val) for col, val in zip(col_names, r)}
                rows_data.append(row_dict)
            
            full_backup[table] = {
                "ddl": create_ddl,
                "columns": col_names,
                "row_count": len(rows_data),
                "rows": rows_data
            }
            print(f"  - Backed up `{table}`: {len(rows_data)} rows")
        
        # Save JSON backup
        json_file = os.path.join(backup_dir, f"nmart_backup_{timestamp}.json")
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(full_backup, f, indent=2)
        print(f"Saved JSON backup to {json_file}")
        
        # Save SQL DDL
        sql_file = os.path.join(backup_dir, f"nmart_schema_{timestamp}.sql")
        with open(sql_file, "w", encoding="utf-8") as f:
            f.write("\n".join(sql_dump_lines))
        print(f"Saved SQL schema to {sql_file}")
        
        # Also copy nmart.db if exists
        if os.path.exists("nmart.db"):
            import shutil
            sqlite_backup = os.path.join(backup_dir, f"nmart_sqlite_{timestamp}.db")
            shutil.copy2("nmart.db", sqlite_backup)
            print(f"Copied local nmart.db to {sqlite_backup}")

    print("Backup completed successfully!")

if __name__ == "__main__":
    run_backup()

