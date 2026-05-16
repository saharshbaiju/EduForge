from datetime import date, timedelta
import json
import math
import os
import secrets

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from werkzeug.security import check_password_hash, generate_password_hash

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

load_dotenv()

TABLES_READY = False

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        autocommit=os.getenv("DB_AUTOCOMMIT") == "True",
    )

# CORS Configuration
FRONTEND_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "https://jolly-river-0583b0500.7.azurestaticapps.net",
    "http://localhost:5174",
    "http://127.0.0.1:5173"
]

CORS(
    app,
    origins=FRONTEND_ORIGINS,
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

@app.before_request
def log_request_info():
    logger.info("Headers: %s", request.headers)
    logger.info("Origin: %s", request.headers.get('Origin'))
    logger.info("Method: %s", request.method)

@app.after_request
def add_cors_headers(response):
    # Ensure CORS headers are present even if flask-cors missed them for some reason
    origin = request.headers.get('Origin')
    if origin in FRONTEND_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

LEVEL_THRESHOLD = 120


def normalize_url(url):
    if not url:
        return ""
    normalized = str(url).strip()
    if not normalized:
        return ""
    if normalized.startswith(("http://", "https://")):
        return normalized
    return f"https://{normalized}"


def parse_skills(raw_skills):
    if raw_skills is None:
        return []
    if isinstance(raw_skills, list):
        return [skill.strip() for skill in raw_skills if str(skill).strip()]
    if isinstance(raw_skills, str):
        raw_skills = raw_skills.strip()
        if not raw_skills:
            return []
        try:
            parsed = json.loads(raw_skills)
            if isinstance(parsed, list):
                return [skill.strip() for skill in parsed if str(skill).strip()]
        except json.JSONDecodeError:
            return [skill.strip() for skill in raw_skills.split(",") if skill.strip()]
    return []


def to_skill_blob(skills):
    return json.dumps(parse_skills(skills))


def ensure_tables():
    global TABLES_READY

    if TABLES_READY:
        return

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        print("Table 'users' ensured.")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS streak (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                login_date DATE NOT NULL,
                UNIQUE KEY unique_user_date (username, login_date)
            )
            """
        )
        print("Table 'streak' ensured.")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                video_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) DEFAULT 'Untitled Note',
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY user_video (username, video_id)
            )
            """
        )
        print("Table 'notes' ensured.")
        try:
            cursor.execute(
                "ALTER TABLE notes ADD COLUMN title VARCHAR(255) DEFAULT 'Untitled Note'"
            )
        except mysql.connector.Error:
            pass
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                display_name VARCHAR(255) NOT NULL,
                bio TEXT,
                role_title VARCHAR(255) DEFAULT 'Future-ready Learner',
                profile_image_url TEXT,
                location VARCHAR(255) DEFAULT 'Remote',
                timezone VARCHAR(120) DEFAULT 'Asia/Kolkata',
                website VARCHAR(255),
                verified TINYINT(1) DEFAULT 1,
                skills JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        print("Table 'user_profiles' ensured.")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS social_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                github VARCHAR(255),
                linkedin VARCHAR(255),
                portfolio VARCHAR(255),
                twitter VARCHAR(255),
                youtube VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        print("Table 'social_links' ensured.")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS user_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                xp_score INT DEFAULT 0,
                total_watch_seconds INT DEFAULT 0,
                learning_score INT DEFAULT 0,
                watch_consistency INT DEFAULT 0,
                note_taking INT DEFAULT 0,
                communication INT DEFAULT 0,
                problem_solving INT DEFAULT 0,
                course_completion INT DEFAULT 0,
                strengths JSON,
                weak_areas JSON,
                achievements JSON,
                learning_insights JSON,
                status_badge VARCHAR(120) DEFAULT 'New Learner',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        print("Table 'user_stats' ensured.")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_activity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                item_type VARCHAR(80) NOT NULL,
                reference_id VARCHAR(120),
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                progress INT DEFAULT 0,
                status_label VARCHAR(120),
                item_count INT DEFAULT 0,
                display_order INT DEFAULT 0,
                clickable TINYINT(1) DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        print("Table 'learning_activity' ensured.")
        try:
            cursor.execute(
                "ALTER TABLE learning_activity ADD COLUMN reference_id VARCHAR(120)"
            )
        except mysql.connector.Error:
            pass
        try:
            cursor.execute(
                "ALTER TABLE user_stats ADD COLUMN xp_score INT DEFAULT 0"
            )
        except mysql.connector.Error:
            pass
        try:
            cursor.execute(
                "ALTER TABLE user_stats ADD COLUMN total_watch_seconds INT DEFAULT 0"
            )
        except mysql.connector.Error:
            pass
        db.commit()
        TABLES_READY = True
    finally:
        cursor.close()
        db.close()


@app.before_request
def init_tables():
    ensure_tables()


def calculate_xp_gain(watch_time_seconds, streak_days, current_xp):
    w = max(float(watch_time_seconds or 0), 0.0)
    s = max(int(streak_days or 0), 0)
    score = max(float(current_xp or 0), 0.0)
    x1 = secrets.randbelow(60)

    # multiplier = (min(s-1, 16) * 1.05)
    # Ensure multiplier is at least 1 to avoid zeroing out XP on day 1
    multiplier = max(min(s - 1, 16) * 1.05, 1.0)

    # logistic_factor = min(1 / (1 + math.exp((score // 3600) * (score - 15))), 1)
    exponent = (score // 3600) * (score - 15)
    # Cap exponent to avoid overflow in math.exp
    exponent = max(min(exponent, 100), -100)
    logistic_factor = min(1.0 / (1.0 + math.exp(exponent)), 1.0)

    # Formula: (w * 0.02) * multiplier * logistic_factor + (min(w // 1800, 1) * x1)
    xp_gain = (w * 0.02) * multiplier * logistic_factor + (min(w // 1800, 1) * x1)
    
    return int(round(xp_gain))


def seed_profile(username):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT username FROM user_profiles WHERE username = %s", (username,))
        if not cursor.fetchone():
            default_skills = json.dumps([])
            cursor.execute(
                """
                INSERT INTO user_profiles
                (username, display_name, bio, role_title, profile_image_url, location, timezone, website, verified, skills)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    username,
                    username,
                    "",
                    "Learner",
                    "",
                    "",
                    "Asia/Kolkata",
                    "",
                    1,
                    default_skills,
                ),
            )

        cursor.execute("SELECT username FROM social_links WHERE username = %s", (username,))
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO social_links (username, github, linkedin, portfolio, twitter, youtube)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    username,
                    "",
                    "",
                    "",
                    "",
                    "",
                ),
            )

        cursor.execute("SELECT username FROM user_stats WHERE username = %s", (username,))
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO user_stats
                (username, xp_score, total_watch_seconds, learning_score, watch_consistency, note_taking, communication, problem_solving, course_completion, strengths, weak_areas, achievements, learning_insights, status_badge)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    username,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    json.dumps([]),
                    json.dumps([]),
                    json.dumps([]),
                    json.dumps([]),
                    "New Learner",
                ),
            )

        db.commit()
    finally:
        cursor.close()
        db.close()


def get_profile_payload(username):
    seed_profile(username)
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM user_profiles WHERE username = %s", (username,))
        profile = cursor.fetchone()
        cursor.execute("SELECT * FROM social_links WHERE username = %s", (username,))
        socials = cursor.fetchone()

        profile_payload = {
            "username": profile["username"],
            "display_name": profile["display_name"],
            "bio": profile["bio"] or "",
            "role_title": profile["role_title"] or "",
            "profile_image_url": profile["profile_image_url"] or "",
            "location": profile["location"] or "",
            "timezone": profile["timezone"] or "",
            "website": profile["website"] or "",
            "verified": bool(profile["verified"]),
            "skills": parse_skills(profile["skills"]),
        }

        social_payload = {
            "github": socials["github"] if socials else "",
            "linkedin": socials["linkedin"] if socials else "",
            "portfolio": socials["portfolio"] if socials else "",
            "twitter": socials["twitter"] if socials else "",
            "youtube": socials["youtube"] if socials else "",
        }

        return {"profile": profile_payload, "socials": social_payload}
    finally:
        cursor.close()
        db.close()


def compute_streak_stats(username):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT login_date FROM streak WHERE username = %s ORDER BY login_date DESC",
            (username,),
        )
        dates = [row[0] for row in cursor.fetchall()]
    finally:
        cursor.close()
        db.close()

    if not dates:
        return {"current_streak": 0, "dates": [], "monthly_sessions": 0}

    date_set = {entry for entry in dates}
    today = date.today()
    probe = today if today in date_set else today - timedelta(days=1)
    streak = 0

    while probe in date_set:
        streak += 1
        probe -= timedelta(days=1)

    month_start = today.replace(day=1)
    monthly_sessions = len([entry for entry in dates if entry >= month_start])

    return {
        "current_streak": streak,
        "dates": [str(entry) for entry in sorted(date_set)],
        "monthly_sessions": monthly_sessions,
    }


def apply_xp_update(username, watch_time_seconds):
    seed_profile(username)
    streak_stats = compute_streak_stats(username)
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT xp_score, total_watch_seconds FROM user_stats WHERE username = %s",
            (username,),
        )
        stat_row = cursor.fetchone() or {"xp_score": 0, "total_watch_seconds": 0}

        xp_gain = calculate_xp_gain(
            watch_time_seconds,
            streak_stats["current_streak"],
            stat_row["xp_score"],
        )
        total_watch_seconds = stat_row["total_watch_seconds"] + max(int(watch_time_seconds or 0), 0)
        xp_score = stat_row["xp_score"] + xp_gain
        learning_score = min(100, max(1, 40 + xp_score // 12))
        watch_consistency = min(
            100,
            max(1, 30 + streak_stats["current_streak"] * 8 + total_watch_seconds // 900),
        )

        cursor.execute(
            """
            UPDATE user_stats
            SET xp_score = %s,
                total_watch_seconds = %s,
                learning_score = %s,
                watch_consistency = %s
            WHERE username = %s
            """,
            (
                xp_score,
                total_watch_seconds,
                learning_score,
                watch_consistency,
                username,
            ),
        )
        db.commit()

        return {
            "xp_gain": xp_gain,
            "xp_score": xp_score,
            "total_watch_seconds": total_watch_seconds,
            "current_streak": streak_stats["current_streak"],
        }
    finally:
        cursor.close()
        db.close()


def upsert_recent_video_activity(username, video_id, title, channel_title, watch_time_seconds):
    if not video_id or not title or int(watch_time_seconds or 0) <= 0:
        return

    progress = min(100, max(6, int((max(int(watch_time_seconds or 0), 0) / 900) * 100)))
    watched_minutes = max(int(round((watch_time_seconds or 0) / 60)), 0)
    status_label = f"Watched {watched_minutes} min" if watched_minutes else "Quick view"

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT id, item_count
            FROM learning_activity
            WHERE username = %s AND item_type = 'recent_video' AND reference_id = %s
            """,
            (username, video_id),
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                """
                UPDATE learning_activity
                SET title = %s,
                    subtitle = %s,
                    progress = LEAST(100, GREATEST(progress, %s)),
                    status_label = %s,
                    item_count = %s,
                    clickable = 1
                WHERE id = %s
                """,
                (
                    title,
                    channel_title or "",
                    progress,
                    status_label,
                    int(existing[1] or 0) + 1,
                    existing[0],
                ),
            )
        else:
            cursor.execute(
                """
                INSERT INTO learning_activity
                (username, item_type, reference_id, title, subtitle, progress, status_label, item_count, display_order, clickable)
                VALUES (%s, 'recent_video', %s, %s, %s, %s, %s, %s, %s, 1)
                """,
                (
                    username,
                    video_id,
                    title,
                    channel_title or "",
                    progress,
                    status_label,
                    1,
                    1,
                ),
            )

        cursor.execute(
            """
            SELECT id
            FROM learning_activity
            WHERE username = %s AND item_type = 'recent_video'
            ORDER BY updated_at DESC
            """,
            (username,),
        )
        ids = [row[0] for row in cursor.fetchall()]

        for order, activity_id in enumerate(ids[:6], start=1):
            cursor.execute(
                "UPDATE learning_activity SET display_order = %s WHERE id = %s",
                (order, activity_id),
            )

        if len(ids) > 6:
            removable_ids = ids[6:]
            cursor.executemany(
                "DELETE FROM learning_activity WHERE id = %s",
                [(activity_id,) for activity_id in removable_ids],
            )

        db.commit()
    finally:
        cursor.close()
        db.close()


def build_stats_payload(username):
    seed_profile(username)
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM user_stats WHERE username = %s", (username,))
        stat_row = cursor.fetchone()

        cursor.execute(
            """
            SELECT id, item_type, reference_id, title, subtitle, progress, status_label, item_count, clickable, updated_at
            FROM learning_activity
            WHERE username = %s
            ORDER BY updated_at DESC, display_order ASC
            """,
            (username,),
        )
        activity_rows = cursor.fetchall()

        cursor.execute(
            """
            SELECT video_id, content, updated_at, title
            FROM notes
            WHERE username = %s
            ORDER BY updated_at DESC
            LIMIT 4
            """,
            (username,),
        )
        note_rows = cursor.fetchall()
    finally:
        cursor.close()
        db.close()

    streak_stats = compute_streak_stats(username)
    note_count = len(note_rows)
    completed_videos = len([row for row in activity_rows if row["item_type"] == "recent_video" and (row["progress"] or 0) >= 70])
    monthly_learning = min(100, max(stat_row["course_completion"], streak_stats["monthly_sessions"] * 9))
    watch_consistency = min(100, max(stat_row["watch_consistency"], streak_stats["current_streak"] * 11))
    note_taking = min(100, max(stat_row["note_taking"], note_count * 18))
    
    xp_score = stat_row.get("xp_score") or 0
    
    xp_level = max(1, xp_score // LEVEL_THRESHOLD + 1)
    xp_progress = xp_score % LEVEL_THRESHOLD
    total_watch_seconds = stat_row.get("total_watch_seconds") or 0

    metric_values = {
        "XP Score": min(100, int((xp_progress / LEVEL_THRESHOLD) * 100)),
        "Learning Score": max(stat_row["learning_score"], int((watch_consistency + note_taking + stat_row["problem_solving"]) / 3)),
        "Watch Consistency": watch_consistency,
        "Note Taking": note_taking,
        "Problem Solving": stat_row["problem_solving"],
        "Course Completion": max(stat_row["course_completion"], completed_videos * 15),
    }

    metrics = [
        {"title": title, "value": min(100, value), "suffix": "%"}
        for title, value in metric_values.items()
    ]

    overall_score = round(sum(item["value"] for item in metrics) / len(metrics))

    def activity_items(item_type):
        return [
            {
                "id": row["id"],
                "reference_id": row.get("reference_id") or "",
                "title": row["title"],
                "subtitle": row["subtitle"] or "",
                "progress": row["progress"] or 0,
                "status": row["status_label"] or "",
                "count": row["item_count"] or 0,
                "clickable": bool(row["clickable"]),
                "updated_at": row["updated_at"].strftime("%b %d") if row["updated_at"] else "",
            }
            for row in activity_rows
            if row["item_type"] == item_type
        ][:6]

    recent_notes = []
    for index, note in enumerate(note_rows, start=1):
        content = (note["content"] or "").strip()
        excerpt = content.replace("\n", " ")
        recent_notes.append(
            {
                "id": f"note-{index}",
                "reference_id": note["video_id"],
                "title": note["title"] or f"Video Note {index}",
                "subtitle": excerpt[:90] + ("..." if len(excerpt) > 90 else "") if excerpt else "Start capturing your learning takeaways.",
                "progress": min(100, max(18, len(content) // 8 if content else 18)),
                "status": "Synced",
                "count": len(content.split()) if content else 0,
                "clickable": True,
                "updated_at": note["updated_at"].strftime("%b %d") if note["updated_at"] else "",
            }
        )

    if not recent_notes:
        recent_notes = [
            {
                "id": "note-empty",
                "title": "No notes yet",
                "subtitle": "Open a video and save notes to start building your knowledge base.",
                "progress": 8,
                "status": "Waiting",
                "count": 0,
                "clickable": False,
                "updated_at": "",
            }
        ]

    recently_watched = activity_items("recent_video")
    if not recently_watched:
        recently_watched = [
            {
                "id": "watch-empty",
                "reference_id": "",
                "title": "No watched videos yet",
                "subtitle": "Start a learning session and return from the player to log watch time and earn XP.",
                "progress": 0,
                "status": "Waiting",
                "count": 0,
                "clickable": False,
                "updated_at": "",
            }
        ]

    comparison = [
        {"label": "Current streak", "value": streak_stats["current_streak"], "max": 14, "display": f"{streak_stats['current_streak']} days"},
        {"label": "Monthly learning", "value": monthly_learning, "max": 100, "display": f"{monthly_learning}%"},
        {"label": "Note activity", "value": note_taking, "max": 100, "display": f"{note_taking}%"},
        {"label": "Videos completed", "value": completed_videos, "max": 8, "display": f"{completed_videos} videos"},
    ]

    return {
        "metrics": metrics,
        "overall_score": overall_score,
        "xp": {
            "score": xp_score,
            "level": xp_level,
            "progress": xp_progress,
            "level_threshold": LEVEL_THRESHOLD,
            "next_level_at": xp_level * LEVEL_THRESHOLD,
            "watch_time_seconds": total_watch_seconds,
            "watch_time_hours": round(total_watch_seconds / 3600, 1),
        },
        "performance": {
            "strengths": parse_skills(stat_row["strengths"]),
            "weak_areas": parse_skills(stat_row["weak_areas"]),
            "achievements": parse_skills(stat_row["achievements"]),
            "learning_insights": parse_skills(stat_row["learning_insights"]),
            "status_badge": stat_row["status_badge"],
        },
        "comparison": comparison,
        "panels": {
            "recently_watched": recently_watched,
            "recent_notes": recent_notes,
        },
        "heatmap_dates": streak_stats["dates"],
        "streak": streak_stats["current_streak"],
    }


@app.route("/signup", methods=["POST"])
def signup():
    db = get_db()
    cursor = db.cursor()
    data = request.json or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    password_hashed = generate_password_hash(password)

    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, password_hashed),
        )
        db.commit()
        seed_profile(username)
        return jsonify({"msg": "registered"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "User already exists"}), 409
    finally:
        cursor.close()
        db.close()


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    login_data = request.json or {}
    username = (login_data.get("username") or "").strip()
    password = login_data.get("password") or ""

    try:
        cursor.execute(
            "SELECT password_hash FROM users WHERE username = %s",
            (username,),
        )
        user = cursor.fetchone()
        if user:
            stored_password = user["password_hash"]
            if check_password_hash(stored_password, password):
                today = date.today()
                cursor.execute(
                    "INSERT IGNORE INTO streak (username, login_date) VALUES (%s, %s)",
                    (username, today),
                )
                db.commit()
                seed_profile(username)
                return jsonify({"msg": "LOGIN SUCCESSFUL"}), 200
            return jsonify({"error": "Invalid Password"}), 401
        return jsonify({"error": "User doesn't exist"}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 401
    finally:
        cursor.close()
        db.close()


@app.route("/streak/<username>", methods=["GET"])
def get_streak(username):
    streak_stats = compute_streak_stats(username)
    return jsonify({"dates": streak_stats["dates"]})


@app.route("/notes/<username>", methods=["GET"])
def get_all_notes(username):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM notes WHERE username = %s ORDER BY updated_at DESC",
            (username,),
        )
        notes = cursor.fetchall()
        return jsonify(notes), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


@app.route("/notes/<username>/<video_id>", methods=["GET"])
def get_notes(username, video_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM notes WHERE username = %s AND video_id = %s",
            (username, video_id),
        )
        note = cursor.fetchone()
        return jsonify(note if note else {"content": "", "title": ""}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


@app.route("/notes", methods=["POST"])
def save_notes():
    db = get_db()
    cursor = db.cursor()
    data = request.json or {}
    username = data.get("username")
    video_id = data.get("video_id")
    content = data.get("content")
    title = data.get("title", "Untitled Note")

    try:
        query = """
            INSERT INTO notes (username, video_id, content, title)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE content = VALUES(content), title = VALUES(title)
        """
        cursor.execute(query, (username, video_id, content, title))
        db.commit()
        return jsonify({"msg": "Note saved"}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


@app.route("/profile/<username>", methods=["GET"])
def get_profile(username):
    try:
        payload = get_profile_payload(username)
        return jsonify(payload), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/profile/update", methods=["POST"])
def update_profile():
    data = request.json or {}
    current_username = (data.get("username") or "").strip()
    new_username = (data.get("display_name") or data.get("new_username") or current_username).strip()

    if not current_username:
        return jsonify({"error": "Username is required"}), 400

    seed_profile(current_username)

    db = get_db()
    cursor = db.cursor()

    try:
        profile_image_url = normalize_url(data.get("profile_image_url"))
        website = normalize_url(data.get("website"))
        skills_blob = to_skill_blob(data.get("skills"))

        cursor.execute(
            """
            UPDATE user_profiles
            SET username = %s,
                display_name = %s,
                bio = %s,
                role_title = %s,
                profile_image_url = %s,
                location = %s,
                timezone = %s,
                website = %s,
                skills = %s
            WHERE username = %s
            """,
            (
                new_username,
                new_username,
                data.get("bio") or "",
                data.get("role_title") or "Learning Architect",
                profile_image_url,
                data.get("location") or "Remote",
                data.get("timezone") or "Asia/Kolkata",
                website,
                skills_blob,
                current_username,
            ),
        )

        if new_username != current_username:
            cursor.execute(
                "UPDATE users SET username = %s WHERE username = %s",
                (new_username, current_username),
            )
            cursor.execute(
                "UPDATE social_links SET username = %s WHERE username = %s",
                (new_username, current_username),
            )
            cursor.execute(
                "UPDATE user_stats SET username = %s WHERE username = %s",
                (new_username, current_username),
            )
            cursor.execute(
                "UPDATE learning_activity SET username = %s WHERE username = %s",
                (new_username, current_username),
            )
            cursor.execute(
                "UPDATE notes SET username = %s WHERE username = %s",
                (new_username, current_username),
            )
            cursor.execute(
                "UPDATE streak SET username = %s WHERE username = %s",
                (new_username, current_username),
            )

        db.commit()
        return jsonify({"msg": "Profile updated", "username": new_username}), 200
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


@app.route("/profile/socials", methods=["POST"])
def update_socials():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    socials = data.get("socials") or {}

    if not username:
        return jsonify({"error": "Username is required"}), 400

    seed_profile(username)

    github = normalize_url(socials.get("github") or data.get("github"))
    linkedin = normalize_url(socials.get("linkedin") or data.get("linkedin"))
    portfolio = normalize_url(socials.get("portfolio") or data.get("portfolio"))
    twitter = normalize_url(socials.get("twitter") or data.get("twitter"))
    youtube = normalize_url(socials.get("youtube") or data.get("youtube"))

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO social_links (username, github, linkedin, portfolio, twitter, youtube)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                github = VALUES(github),
                linkedin = VALUES(linkedin),
                portfolio = VALUES(portfolio),
                twitter = VALUES(twitter),
                youtube = VALUES(youtube)
            """,
            (username, github, linkedin, portfolio, twitter, youtube),
        )
        db.commit()
        return jsonify({"msg": "Social links updated"}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


@app.route("/profile/stats/<username>", methods=["GET"])
def get_profile_stats(username):
    try:
        return jsonify(build_stats_payload(username)), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/profile/xp", methods=["POST", "OPTIONS"])
def update_profile_xp():
    data = request.json or {}
    username = (data.get("username") or "").strip()
    watch_time_seconds = data.get("watch_time_seconds") or 0
    video_id = (data.get("video_id") or "").strip()
    title = (data.get("title") or "").strip()
    channel_title = (data.get("channel_title") or "").strip()

    if not username:
        return jsonify({"error": "Username is required"}), 400

    try:
        payload = apply_xp_update(username, watch_time_seconds)
        if int(watch_time_seconds or 0) > 0:
            upsert_recent_video_activity(
                username,
                video_id,
                title,
                channel_title,
                watch_time_seconds,
            )
        return jsonify(payload), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT 
                up.username, 
                up.display_name, 
                up.profile_image_url, 
                up.role_title,
                us.xp_score,
                us.status_badge
            FROM user_profiles up
            JOIN user_stats us ON up.username = us.username
            ORDER BY us.xp_score DESC
            LIMIT 50
            """
        )
        leaderboard = cursor.fetchall()
        
        # Add level information
        for entry in leaderboard:
            entry["level"] = max(1, (entry["xp_score"] or 0) // LEVEL_THRESHOLD + 1)
            
        return jsonify(leaderboard), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        cursor.close()
        db.close()


if __name__ == "__main__":
    ensure_tables()
    app.run(port=5000, debug=True)
