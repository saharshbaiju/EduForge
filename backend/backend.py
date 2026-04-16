from flask import Flask
import requests
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
import mysql.connector
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        autocommit=os.getenv("DB_AUTOCOMMIT") == "True"
    )

db = get_db()

CORS(app, origins=["http://localhost:5173"])
cursor = db.cursor()












































































































































































