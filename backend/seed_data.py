"""
Seed the database with mock order data
"""
import sqlite3
import os
from datetime import datetime, timedelta
import random

DATABASE_PATH = os.getenv("DATABASE_PATH", "app.db")

# Sample data
CUSTOMERS = [
    {"name": "Esther Kiehn", "avatar": None},
    {"name": "Denise Kuhn", "avatar": None},
    {"name": "Clint Hoppe", "avatar": None},
    {"name": "Darin Deckow", "avatar": None},
    {"name": "Jacquelyn Robel", "avatar": None},
    {"name": "Erin Bins", "avatar": None},
    {"name": "Gretchen Quitz", "avatar": None},
    {"name": "Stewart Kulas", "avatar": None},
    {"name": "Sarah Johnson", "avatar": None},
    {"name": "Michael Chen", "avatar": None},
    {"name": "Emily Rodriguez", "avatar": None},
    {"name": "David Kim", "avatar": None},
    {"name": "Jessica Martinez", "avatar": None},
    {"name": "James Wilson", "avatar": None},
    {"name": "Lisa Anderson", "avatar": None},
]

STATUSES = ['Pending', 'Completed', 'Refunded']
PAYMENT_STATUSES = ['Paid', 'Unpaid']

# Weight the distribution to match the design (more completed orders)
STATUS_WEIGHTS = [0.25, 0.65, 0.10]  # 25% Pending, 65% Completed, 10% Refunded


def seed_orders(count=240):
    """Seed the database with mock orders"""
    
    if not os.path.exists(DATABASE_PATH):
        print(f"❌ Database not found at {DATABASE_PATH}")
        print("Please run migrations first: python migrate.py upgrade")
        return
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check if orders table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
    if not cursor.fetchone():
        print("❌ Orders table does not exist. Please run migrations first.")
        conn.close()
        return
    
    # Clear existing orders
    cursor.execute("DELETE FROM orders")
    print("🗑️  Cleared existing orders")
    
    print(f"🌱 Seeding {count} orders...")
    
    for i in range(1, count + 1):
        order_number = f"#ORD{1000 + i}"
        customer = random.choice(CUSTOMERS)
        
        # Generate dates within the last 30 days
        days_ago = random.randint(0, 30)
        order_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        
        # Use weighted random for status
        status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]
        
        # Generate realistic amounts
        amount = round(random.uniform(10.00, 1000.00), 2)
        
        # Payment status logic: Completed orders are usually paid
        if status == 'Completed':
            payment_status = 'Paid' if random.random() > 0.1 else 'Unpaid'
        elif status == 'Refunded':
            payment_status = 'Paid'  # Refunded orders were paid
        else:  # Pending
            payment_status = 'Unpaid' if random.random() > 0.3 else 'Paid'
        
        cursor.execute("""
            INSERT INTO orders (
                order_number, customer_name, customer_avatar, order_date,
                status, total_amount, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            order_number,
            customer["name"],
            customer["avatar"],
            order_date,
            status,
            amount,
            payment_status
        ))
        
        if i % 50 == 0:
            print(f"  ✓ Created {i} orders...")
    
    conn.commit()
    
    # Print statistics
    cursor.execute("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
    stats = cursor.fetchall()
    
    print(f"\n✅ Successfully seeded {count} orders!")
    print("\n📊 Statistics:")
    for status, count in stats:
        print(f"  {status}: {count}")
    
    cursor.execute("SELECT payment_status, COUNT(*) as count FROM orders GROUP BY payment_status")
    payment_stats = cursor.fetchall()
    print("\n💰 Payment Status:")
    for payment_status, count in payment_stats:
        print(f"  {payment_status}: {count}")
    
    conn.close()


if __name__ == "__main__":
    import sys
    
    count = 240
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print("Usage: python seed_data.py [count]")
            sys.exit(1)
    
    seed_orders(count)
