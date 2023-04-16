import os
from app import app
from flask import render_template, Response, request, jsonify
from werkzeug.exceptions import BadRequest


def parse_difficulty(difficulty: str) -> int:
    try:
        diff_int = int(difficulty)
    except ValueError:
        raise Exception("DIFFICULTY is not a number")
    if diff_int < 0 or diff_int > 1:
        raise Exception("DIFFICULTY is not set to a supported value (0-1).")
    return diff_int


DIFFICULTY = os.getenv("DIFFICULTY")
assert DIFFICULTY is not None, "DIFFICULTY is not set!"
DIFFICULTY = parse_difficulty(DIFFICULTY)
FLAG = os.getenv("FLAG")
assert FLAG is not None, "FLAG is not set!"
phishing_elements = [
        "m2-00", "m2-02", "m2-03", "m2-04",
        "m4-00", "m4-02", "m4-03", "m4-04", "m4-05", "m4-06"
    ] if DIFFICULTY == 0 else [
        "m1-00", "m1-10", "m3-06", "m4-00", "m4-11"
    ]


@app.route("/", methods=["GET"])
def index() -> Response:
    return render_template("index.html", difficulty=DIFFICULTY)


@app.route("/check", methods=["POST"])
def check() -> Response:
    marked = request.get_json()
    correct = len([m for m in marked if m in phishing_elements])
    incorrect = len([m for m in marked if m not in phishing_elements])
    missed = len([m for m in phishing_elements if m not in marked])
    data = { "correct": correct, "incorrect": incorrect, "missed": missed }
    if incorrect == 0 and missed == 0:
        data["flag"] = FLAG
    return jsonify(data), 200


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return "Bad request!", 400
