import os
from app import app
from flask import render_template, Response

FLAG = os.getenv("FLAG")


@app.route("/", methods=["GET"])
def index() -> Response:
    return render_template("index.html")
