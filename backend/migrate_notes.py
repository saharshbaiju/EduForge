import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        autocommit=os.getenv("DB_AUTOCOMMIT") == "True"
    )

def create_notes_table():
    db = get_db()
    cursor = db.cursor()
    
    query = """
    CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        video_id VARCHAR(50) NOT NULL,
        content TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_video (username, video_id)
    );
    """
    
    try:
        cursor.execute(query)
        db.commit()
        print("Notes table created or already exists.")
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    create_notes_table()
