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
PHISHING_ELEMS = os.getenv("PHISHING_ELEMS")
assert PHISHING_ELEMS is not None, "PHISHING_ELEMS is not set!"
phishing_elements = PHISHING_ELEMS.split(",")
OPTIONAL_ELEMS = os.getenv("OPTIONAL_ELEMS")
assert OPTIONAL_ELEMS is not None, "OPTIONAL_ELEMS is not set!"
optional_elements = OPTIONAL_ELEMS.split(",")
FLAG = os.getenv("FLAG")
assert FLAG is not None, "FLAG is not set!"


@app.route("/", methods=["GET"])
def index() -> Response:
    return render_template("index.html", difficulty=DIFFICULTY)


@app.route("/check", methods=["POST"])
def check() -> Response:
    marked = request.get_json()
    correct = len([m for m in marked if m in phishing_elements])
    incorrect = len([m for m in marked if m not in phishing_elements 
                     and m not in optional_elements])
    missed = len([m for m in phishing_elements if m not in marked])
    data = { "correct": correct, "incorrect": incorrect, "missed": missed }
    if incorrect == 0 and missed == 0:
        data["flag"] = FLAG
    return jsonify(data), 200


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return "Bad request!", 400
