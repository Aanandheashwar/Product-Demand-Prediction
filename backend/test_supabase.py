import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL", "")
key = os.environ.get("SUPABASE_KEY", "")

print(f"URL: {url}")
print(f"KEY: {key[:10]}...")

try:
    client = create_client(url, key)
    print("Client created successfully.")
    res = client.table("predictions").select("*").limit(1).execute()
    print("Query executed successfully.")
    print(f"Data: {res.data}")
except Exception as e:
    print(f"Error: {e}")
