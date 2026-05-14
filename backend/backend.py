from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import date

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



CORS(app, origins=["http://localhost:5173"])


@app.route("/signup", methods=["POST"])
def signup():
    db = get_db()
    cursor = db.cursor()
    data = request.json
    username = data.get("username")
    password = data.get("password")

    password_hashed = generate_password_hash(password)
    
    try:
        cursor.execute("INSERT INTO users (username,password_hash) values (%s,%s);",(username,password_hashed))
        db.commit()
        cursor.close()
        return jsonify({"msg": "registered"}), 201
        
    except mysql.connector.IntegrityError as e:
        print(e) 
        return jsonify({"error": "User already exists"}), 409
    finally:
        cursor.close()
        db.close()



@app.route("/login",methods = ["POST"])
def login():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    loginData = request.json
    username = loginData.get("username")
    password = loginData.get("password")
    
        
    try:
        cursor.execute("SELECT password_hash FROM users WHERE username = %s ",(username,))
        user = cursor.fetchone()
        if user:
            stored_password = user['password_hash']
            if check_password_hash(stored_password,password):
                today = date.today()
                cursor.execute(
                    "INSERT IGNORE INTO streak (username, login_date) VALUES (%s, %s)",
                    (username, today)
                )
                db.commit()
                return jsonify({"msg":"LOGIN SUCCESSFUL"}),200
            else:
              return jsonify({"error":"Invalid Password"}),401
        else:
            return jsonify({"error": "User doesn't exist"}), 404
    except Exception as e:
        return jsonify({"error":str(e)}),401
    finally:
        cursor.close()
        db.close()

@app.route("/streak/<username>", methods=["GET"])
def get_streak(username):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT login_date FROM streak WHERE username = %s",
        (username,)
    )

    dates = [str(row[0]) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify({"dates": dates})



if __name__ == "__main__":
    app.run(port=5000, debug=True)
