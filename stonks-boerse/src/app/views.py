import uuid
import os
import json
from multiprocessing import Lock
from app import app
from flask import render_template, make_response, request, redirect, Response, flash
from app.user_data import UserData
from typing import Tuple
from urllib.parse import quote


class FormDataException(Exception):
    pass


def parse_difficulty(difficulty: str) -> int:
    try:
        diff_int = int(difficulty)
    except ValueError:
        raise Exception("DIFFICULTY is not a number")
    if diff_int < 0 or diff_int > 1:
        raise Exception("DIFFICULTY is not set to a supported value (0-1).")
    return diff_int


app.secret_key = os.urandom(32)
NOT_ENOUGH_MONEY_MSG = "Dafür besitzt du nicht genug Geld!"
NOT_ENOUGH_STOCKS_MSG = "So viele Aktien besitzt du nicht!"
NOT_A_NUMBER_MSG = "Eine deiner Eingaben war keine Nummer!"
USER_COOKIE = "user_id"
USER_DATA_DIR = os.getenv("USER_DATA_DIR")
IMAGES_DIR = os.path.join("app", "static", "images")
assert USER_DATA_DIR is not None, "USER_DATA_DIR is not set!"
FLAG = os.getenv("FLAG")
assert FLAG is not None, "FLAG is not set!"
DIFFICULTY = os.getenv("DIFFICULTY")
assert DIFFICULTY is not None, "DIFFICULTY is not set!"
DIFFICULTY = parse_difficulty(DIFFICULTY)
os.makedirs(USER_DATA_DIR, exist_ok=True)
USER_LOCKS = {}


@app.route("/", methods=["GET"])
def index() -> Response:
    error = request.args.get("error")
    user_id = get_user_id()
    if user_id is None:
        return render_template("index.html", user_id_is_set=False)
    with get_lock(user_id):
        data = get_user_data(user_id)
    if data.balance > 1000 ** 5:  # 1,000,000,000,000,000
        flash(FLAG)
    resp = make_response(render_template("index.html", user_id_is_set=True,
                                         data=data, difficulty=DIFFICULTY))
    resp.set_cookie(USER_COOKIE, user_id)
    return resp


@app.route("/start")
def start() -> Response:
    resp = redirect("/")
    resp.set_cookie(USER_COOKIE, create_user_id())
    return resp


@app.route("/advance")
def advance() -> Response:
    user_id = get_user_id()
    if not user_id:
        return "No user ID found!", 400
    with get_lock(user_id):
        data = get_user_data(user_id)
        data.new_prices()
        write_user_data(data, user_id)
    return redirect("/")


@app.route("/buy", methods=["POST"])
def buy() -> Response:
    user_id = get_user_id()
    try:
        a, b, c = get_form_data()
    except FormDataException as e:
        flash(str(e))
        return redirect("/")
    with get_lock(user_id):
        data = get_user_data(user_id)
        cost = calc_cost(data, a, b, c)
        if cost > data.balance:
            flash(NOT_ENOUGH_MONEY_MSG)
            return redirect("/")
        data.amount_a += a
        data.amount_b += b
        data.amount_c += c
        data.balance = round(data.balance - cost, 2)
        write_user_data(data, user_id)
        return redirect("/")


@app.route("/sell", methods=["POST"])
def sell() -> Response:
    user_id = get_user_id()
    try:
        a, b, c = get_form_data()
    except FormDataException as e:
        flash(str(e))
        return redirect("/")
    with get_lock(user_id):
        data = get_user_data(user_id)
        if data.amount_a < a or data.amount_b < b or data.amount_c < c:
            flash(NOT_ENOUGH_STOCKS_MSG)
            return redirect("/")
        cost = calc_cost(data, a, b, c)
        data.amount_a -= a
        data.amount_b -= b
        data.amount_c -= c
        data.balance = round(data.balance + cost, 2)
        write_user_data(data, user_id)
        return redirect("/")


def get_lock(user_id: str) -> Lock:
    lock = USER_LOCKS.get(user_id)
    if lock is None:
        lock = Lock()
        USER_LOCKS[user_id] = lock
    return lock


def get_user_id() -> str:
    return request.cookies.get(USER_COOKIE)


def create_user_id() -> str:
    return str(uuid.uuid4())


def get_user_file_path(user_id: str) -> str:
    return os.path.join(USER_DATA_DIR, f"{user_id}.json")


def get_user_data(user_id: str) -> UserData:
    user_file = get_user_file_path(user_id)
    if os.path.exists(user_file):
        with open(user_file) as f:
            data = json.load(f)
        return UserData(**data)
    return UserData()


def write_user_data(data: UserData, user_id: str) -> None:
    with open(get_user_file_path(user_id), "w") as f:
        json.dump(data.to_dict(), f, indent=4)


def get_form_data() -> Tuple[int, int, int]:
    a = request.form.get("a", "0")
    b = request.form.get("b", "0")
    c = request.form.get("c", "0")
    a = "0" if a == "" else a
    b = "0" if b == "" else b
    c = "0" if c == "" else c
    if not all(
        amount.isdigit() or (amount.startswith("-") and amount[1:].isdigit())
        for amount in [a, b, c]
    ):
        raise FormDataException(NOT_A_NUMBER_MSG)
    return int(a), int(b), int(c)


def calc_cost(data: UserData, a: int, b: int, c: int) -> float:
    return a*data.values_a[-1] + b*data.values_b[-1] + c*data.values_c[-1]
