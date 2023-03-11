import os
from app import app
from flask import render_template, Response
from random import randint

TEXT_TO_DECRYPT = os.getenv("TEXT_TO_DECRYPT")


def move_by(letter_ord: int, key: int, start: int, end: int) -> int:
    return ((letter_ord - start + key) % (end - start + 1)) + start


def enc(text: str, key: int) -> str:
    char_dict = {}
    for start, end in [("a", "z"), ("A", "Z")]:
        char_dict.update({chr(c): chr(move_by(c, key, ord(start), ord(end)))
                          for c in range(ord(start), ord(end)+1)})
    return "".join(char_dict.get(c, c) for c in text)


def get_enc(text_to_dec: str) -> str:
    key = randint(5, 25)
    return enc(text_to_dec, key)


@app.route("/", methods=["GET"])
def index() -> Response:
    enc_text = get_enc(TEXT_TO_DECRYPT)
    return render_template("index.html", enc=enc_text)
