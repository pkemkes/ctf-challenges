import os
from app import app
from flask import render_template, Response
from base64 import b64encode
import random, string


def parse_difficulty(difficulty: str) -> int:
    try:
        diff_int = int(difficulty)
    except ValueError:
        raise Exception("DIFFICULTY is not a number")
    if diff_int < 1 or diff_int > 2:
        raise Exception("DIFFICULTY is not set to a supported value (1-2).")
    return diff_int


DIFFICULTY = os.getenv("DIFFICULTY")
assert DIFFICULTY is not None, "DIFFICULTY is not set!"
DIFFICULTY = parse_difficulty(DIFFICULTY)
FLAG = os.getenv("FLAG")
assert FLAG is not None, "FLAG is not set!"
PASSWORD = os.getenv("PASSWORD")
assert PASSWORD is not None, "PASSWORD is not set!"
USERNAME = os.getenv("USERNAME")
assert USERNAME is not None, "USERNAME is not set!"


@app.route("/", methods=["GET"])
def index() -> Response:
    known_pt = gen_rnd_str(len(PASSWORD))
    challenge, checksum = enc_flag(known_pt)
    return render_template("index.html", difficulty=DIFFICULTY,
                           challenge=challenge, known_pt=known_pt, 
                           checksum=checksum, username=USERNAME)


def enc_flag(known_pt: str) -> str:
    chall = known_pt + FLAG
    return b64encode(bytes([ord(chall[i]) ^ ord(PASSWORD[i % len(PASSWORD)])
                            for i in range(len(chall))])).decode(), sum(ord(c) for c in chall)


def gen_rnd_str(len: int) -> str:
    return "".join(random.choice(string.ascii_lowercase) for _ in range(len))
