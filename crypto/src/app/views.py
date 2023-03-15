import os
from app import app
from flask import render_template, Response
from random import randint
from typing import Dict


def parse_difficulty(difficulty: str) -> int:
    try:
        diff_int = int(difficulty)
    except ValueError:
        raise Exception("DIFFICULTY is not a number")
    if diff_int < 0 or diff_int > 1:
        raise Exception("DIFFICULTY is not set to a supported value (0-1).")
    return diff_int


def check_key(key: str):
    if len(key) != 26:
        raise Exception("KEY is not 26 characters long")
    for i in range(26):
        expected_char = chr(ord("A") + i)
        if expected_char not in key:
            raise Exception(f"Missing character in key: {expected_char}")


TEXT_TO_DECRYPT = os.getenv("TEXT_TO_DECRYPT")
DIFFICULTY = os.getenv("DIFFICULTY")
assert DIFFICULTY is not None, "DIFFICULTY is not set!"
DIFFICULTY = parse_difficulty(DIFFICULTY)
KEY = os.getenv("KEY").upper()
assert DIFFICULTY == 0 or KEY is not None, "KEY is not set!"


def move_by(letter_ord: int, key: int, start: int, end: int) -> int:
    return ((letter_ord - start + key) % (end - start + 1)) + start


def get_caesar_char_dict(key: int) -> Dict[str, str]:
    char_dict = {}
    for start, end in [("a", "z"), ("A", "Z")]:
        char_dict.update({chr(c): chr(move_by(c, key, ord(start), ord(end)))
                          for c in range(ord(start), ord(end)+1)})
    return char_dict


def enc(char_dict: Dict[str, str]) -> str:
    return "".join(char_dict.get(c, c) for c in TEXT_TO_DECRYPT)


def get_caesar_enc() -> str:
    key = randint(5, 20)
    char_dict = get_caesar_char_dict(key)
    return enc(char_dict)


def get_substitution_char_dict() -> str:
    alphabet = "".join([chr(ord("A") + i) for i in range(26)])
    return dict(zip(alphabet + alphabet.lower(), KEY + KEY.lower()))


def get_substitution_enc() -> str:
    char_dict = get_substitution_char_dict()
    return enc(char_dict)


@app.route("/", methods=["GET"])
def index() -> Response:
    enc_text = get_caesar_enc() if DIFFICULTY == 0 else get_substitution_enc()
    return render_template("index.html", enc=enc_text, difficulty=DIFFICULTY)
