"""
Migration: Create orders table
Version: 002
Description: Creates the orders table used for managing customer orders and seeds
a few sample orders to get started.
"""

import sqlite3
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_PATH


MIGRATION_NAME = "002_create_orders_table"


def upgrade():
    """Apply the migration."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Ensure migrations table exists
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    
    # Check if this migration has already been applied
    cursor.execute("SELECT 1 FROM _migrations WHERE name = ?", (MIGRATION_NAME,))
    if cursor.fetchone():
        print(f"Migration {MIGRATION_NAME} already applied. Skipping.")
        conn.close()
        return
    
    # Create orders table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL,
            order_date TEXT NOT NULL,
            status TEXT NOT NULL,
            total_amount REAL NOT NULL,
            payment_status TEXT NOT NULL
        )
        """
    )
    
    # Seed a few sample orders
    sample_orders = [
        ("#ORD1001", "John Doe", "2024-12-17", "Pending", 50.00, "Paid"),
        ("#ORD1002", "Jane Smith", "2024-12-18", "Completed", 75.50, "Paid"),
        ("#ORD1003", "Bob Johnson", "2024-12-19", "Refunded", 20.00, "Unpaid"),
    ]
    cursor.executemany(
        "INSERT INTO orders (order_number, customer_name, order_date, status, total_amount, payment_status) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        sample_orders,
    )
    
    # Record this migration
    cursor.execute("INSERT INTO _migrations (name) VALUES (?)", (MIGRATION_NAME,))
    
    conn.commit()
    conn.close()
    print(f"Migration {MIGRATION_NAME} applied successfully.")


def downgrade():
    """Revert the migration."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Drop orders table
    cursor.execute("DROP TABLE IF EXISTS orders")
    
    # Remove migration record
    cursor.execute("DELETE FROM _migrations WHERE name = ?", (MIGRATION_NAME,))
    
    conn.commit()
    conn.close()
    print(f"Migration {MIGRATION_NAME} reverted successfully.")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run database migration")
    parser.add_argument(
        "action",
        choices=["upgrade", "downgrade"],
        help="Migration action to perform"
    )
    
    args = parser.parse_args()
    
    if args.action == "upgrade":
        upgrade()
    elif args.action == "downgrade":
        downgrade()