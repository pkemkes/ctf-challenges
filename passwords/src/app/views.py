import os
from app import app
from flask import render_template, Response
from base64 import b64encode


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
PASSWORD = os.getenv("PASSWORD")
assert PASSWORD is not None, "PASSWORD is not set!"


@app.route("/", methods=["GET"])
def index() -> Response:
    challenge = enc_flag()
    return render_template("index.html", difficulty=DIFFICULTY,
                           challenge=challenge)


def enc_flag():
    chall = "crypt:" + FLAG
    return b64encode(bytes([ord(chall[i]) ^ ord(PASSWORD[i % len(PASSWORD)])
                            for i in range(len(chall))])).decode()
