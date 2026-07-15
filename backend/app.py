"""Brainwave GK — Flask backend.

Run:
    pip install -r requirements.txt
    python app.py
Serves API on http://localhost:5000
"""
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from questions import QUESTIONS

app = Flask(__name__)
CORS(app)

CATEGORIES = ["Mixed", "History", "Science", "Geography", "Sports",
              "Arts & Literature", "Technology", "Culture"]


@app.get("/api/categories")
def categories():
    counts = {}
    for c in CATEGORIES:
        counts[c] = len(QUESTIONS) if c == "Mixed" else \
            sum(1 for q in QUESTIONS if q["category"] == c)
    return jsonify({"categories": CATEGORIES, "counts": counts,
                    "total": len(QUESTIONS)})


@app.get("/api/question")
def question():
    category = request.args.get("category", "Mixed")
    difficulty = request.args.get("difficulty", "medium")
    asked = set(request.args.getlist("asked"))

    pool = [q for q in QUESTIONS
            if (category == "Mixed" or q["category"] == category)
            and q["difficulty"] == difficulty]
    if not pool:
        pool = [q for q in QUESTIONS if category == "Mixed" or q["category"] == category]
    if not pool:
        pool = QUESTIONS

    fresh = [q for q in pool if q["question"] not in asked] or pool
    return jsonify(random.choice(fresh))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
