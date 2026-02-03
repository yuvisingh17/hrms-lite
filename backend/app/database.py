from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client["hrms"]

employees_collection = db["employees"]
attendance_collection = db["attendance"]
