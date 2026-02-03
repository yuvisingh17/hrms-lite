from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load .env only for local development
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable not set")

client = MongoClient(MONGO_URL)
db = client["hrms"]

employees_collection = db["employees"]
attendance_collection = db["attendance"]
