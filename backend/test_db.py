# import psycopg2

# # Test connection WITHOUT database name first
# try:
#     conn = psycopg2.connect(
#         host="127.0.0.1",
#         port=5432,
#         user="postgres",
#         password="admin",
#         database="postgres"   # connect to default DB
#     )
#     print("✅ Connected to PostgreSQL successfully!")
    
#     conn.autocommit = True
#     cursor = conn.cursor()
    
#     # Create the database
#     db_name = "AI_Document_Processing_RAG_FastAPI_NextJS"
#     cursor.execute(f'SELECT 1 FROM pg_database WHERE datname = %s', (db_name,))
#     exists = cursor.fetchone()
    
#     if exists:
#         print(f"✅ Database '{db_name}' already exists!")
#     else:
#         cursor.execute(f'CREATE DATABASE "{db_name}"')
#         print(f"✅ Database '{db_name}' created successfully!")
    
#     cursor.close()
#     conn.close()
    
# except Exception as e:
#     print(f"❌ Error: {e}")



# # Add this to test_db.py after creating DB, or run separately
# import psycopg2

# conn = psycopg2.connect(
#     host="127.0.0.1",
#     port=5432,
#     user="postgres",
#     password="admin",
#     database="AI_Document_Processing_RAG_FastAPI_NextJS"
# )
# conn.autocommit = True
# cursor = conn.cursor()

# cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
# cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
# print("✅ Extensions created!")

# cursor.close()
# conn.close()





import psycopg2

# Step 1: Create database
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    user="postgres",
    password="admin",
    database="postgres"
)
conn.autocommit = True
cursor = conn.cursor()

db_name = "AI_Document_Processing_RAG_FastAPI_NextJS"
cursor.execute('SELECT 1 FROM pg_database WHERE datname = %s', (db_name,))
exists = cursor.fetchone()

if exists:
    print(f"Database already exists!")
else:
    cursor.execute(f'CREATE DATABASE "{db_name}"')
    print(f"Database created!")

cursor.close()
conn.close()






# Step 2: Enable extensions in the new database
conn2 = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    user="postgres",
    password="admin",
    database="AI_Document_Processing_RAG_FastAPI_NextJS"
)
conn2.autocommit = True
cursor2 = conn2.cursor()

cursor2.execute('CREATE EXTENSION IF NOT EXISTS vector;')
print("pgvector extension enabled!")

cursor2.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
print("uuid-ossp extension enabled!")

cursor2.close()
conn2.close()

print("\nAll done! Now run: alembic upgrade head")