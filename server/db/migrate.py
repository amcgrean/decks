import sqlite3

db_path = r'C:\Users\amcgrean\python\form\decks\server\data\beisser.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE products ADD COLUMN slug TEXT")
    print("Added slug")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE products ADD COLUMN image_url TEXT")
    print("Added image_url")
except Exception as e:
    print(e)

conn.commit()
conn.close()
print("Migration done")
