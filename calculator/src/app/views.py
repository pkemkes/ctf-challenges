import os
import sys
from typing import List, Tuple
from app import app
from flask import render_template, Response, request, redirect, flash
from openai import OpenAI

from app.calculate import eval_expression

import json_logging
import logging


prompts = [
    [
        ""
    ]
]

def parse_difficulty(difficulty: str) -> int:
    try:
        diff_int = int(difficulty)
    except ValueError:
        raise Exception("DIFFICULTY is not a number")
    if diff_int < 0 or diff_int > 3:
        raise Exception("DIFFICULTY is not set to a supported value (0-3).")
    return diff_int

app.secret_key = os.urandom(32)

DIFFICULTY = os.getenv("DIFFICULTY")
assert DIFFICULTY is not None, "DIFFICULTY is not set!"
DIFFICULTY = parse_difficulty(DIFFICULTY)

if DIFFICULTY == 3:
    assert os.getenv("APIKEY") is not None, "APIKEY is not set! Difficulty 3 requires an API key!"
client = OpenAI(api_key=os.getenv("APIKEY", "placeholder-api-key"))
os.unsetenv("APIKEY")

json_logging.init_non_web(enable_json=True)
logger = logging.getLogger("calcs-logger")
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler(sys.stdout))


@app.route("/", methods=["GET", "POST"])
def index() -> Response:
    if request.method == "POST":
        expression = request.form.get("expression")
        if expression:
            if DIFFICULTY == 2 and "subprocess.check_output" in expression.lower():
                logger.info("Filtered expression", extra={"props": { "expression": expression }})
                flash({"type": "Eingabe", "value": expression})
                flash({"type": "Warnung", "value": "Bösartige Eingabe! Berechnung abgelehnt."})
            else:
                if DIFFICULTY == 3:
                    flash({"type": "Ursprüngliche Eingabe", "value": expression})
                    expression = ai_sanitize(expression)
                    flash({"type": "Gefilterte Eingabe", "value": expression})
                else:
                    flash({"type": "Eingabe", "value": expression})
                result = eval_expression(expression)
                flash({"type": "Ergebnis", "value": result})
                log_props = { "expression": expression, "result": result }
                logger.info("New calculation", extra={"props": log_props})
    return render_template("calc.html", difficulty=DIFFICULTY)


@app.route("/blog", methods=["GET"])
def blog() -> Response:
    return render_template("blog.html")


def ai_sanitize(expression: str) -> str:
    prompt = "Du bist ein Schutzmechanismus für einen Taschenrechner. " + \
        "Du nimmst Eingaben vom Benutzer entgegen. " + \
        "Nimm diese Eingabe und entferne die Stellen, die nicht zu einer Berechnung gehören. " + \
        "Gib alles übrige zurück. Wenn nichts übrig bleibt, gib '1+1' zurück."
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": expression}
        ],
        max_tokens=500,
        temperature=0.1
    ).choices[0].message.content
    logger.info("AI sanitization done", extra={"expression": expression, "result": resp})
    return resp
