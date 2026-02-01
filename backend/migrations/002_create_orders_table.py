"""
Create orders table migration
"""

def upgrade(conn):
    """Create the orders table with all required fields"""
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_avatar TEXT,
            order_date DATE NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Pending', 'Completed', 'Refunded')),
            total_amount REAL NOT NULL,
            payment_status TEXT NOT NULL CHECK(payment_status IN ('Paid', 'Unpaid')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create indexes for better query performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status)")
    
    conn.commit()
    print("✅ Created orders table with indexes")


def downgrade(conn):
    """Drop the orders table"""
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS orders")
    conn.commit()
    print("✅ Dropped orders table")
