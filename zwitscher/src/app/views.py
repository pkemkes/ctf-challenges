import os
import shutil
from app import app
from flask import render_template, Response, request, session, redirect, flash, jsonify, send_from_directory
import sqlite3
from datetime import datetime
from dataclasses import dataclass
from typing import List
from werkzeug.utils import secure_filename
import random
import string


app.secret_key = os.urandom(32)
FLAG1 = os.getenv("FLAG1")
assert FLAG1 is not None, "FLAG1 is not set!"
FLAG2 = os.getenv("FLAG2")
assert FLAG2 is not None, "FLAG2 is not set!"
DATADIR = os.getenv("DATADIR")
assert DATADIR is not None, "DATADIR is not set!"
SOFT_RESET_PATH = os.getenv("SOFT_RESET_PATH")
assert SOFT_RESET_PATH is not None, "SOFT_RESET_PATH is not set!"
HARD_RESET_PATH = os.getenv("HARD_RESET_PATH")
assert HARD_RESET_PATH is not None, "HARD_RESET_PATH is not set!"
FLAG1 = os.getenv("FLAG1")
assert FLAG1 is not None, "FLAG1 is not set!"
os.makedirs(DATADIR, exist_ok=True)
DATABASE_PATH = os.path.join(DATADIR, "zwitscher.db")
DATABASE_PATH_RO = f"file:{DATABASE_PATH}?mode=ro"
DEFAULT_PFP = "default-pfp.png"
PFPDIR = os.path.join(DATADIR, "pfp")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


@dataclass
class Zwitsch:
    text: str
    user_id: int
    timestamp: int
    zwitsch_id: int = None
    username: str = None
    nickname: str = None
    profile_pic: str = None


def random_str(l):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(l))


def try_parse_int(int_str: str) -> int | None:
    try:
        return int(int_str)
    except (ValueError, TypeError):
        return None


def get_user(username: str, password: str) -> int | None:
    query = f"SELECT user_id FROM users WHERE username = '{username}' AND password = '{password}'"
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        try:
            cur.execute(query)
            result = cur.fetchone()
            return result if result is None else result[0]
        except sqlite3.Error as e:
            flash(f"Datenbankfehler<br>\"{e}\"<br>bei folgendem Query:<br>{query}")
            return None


def get_user_safe(username: str, password: str) -> int | None:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute(f"SELECT user_id FROM users WHERE username = ? AND password = ?", [username, password])
        result = cur.fetchone()
    return result if result is None else result[0]


def update_nickname(user_id: int, nickname: str) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("UPDATE users SET nickname = ? WHERE user_id = ?", (nickname, user_id))


def update_pfp(user_id: int, filename: str) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("UPDATE users SET profile_pic = ? WHERE user_id = ?", (filename, user_id))


def update_secret(user_id: int, secret: str) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("INSERT OR IGNORE INTO secrets(user_id, secret) VALUES(?,?)", (user_id, secret))
        cur.execute("UPDATE secrets SET secret = ? WHERE user_id = ?", (secret, user_id))


def add_user(username: str, password: str, suppress_flash: bool = False) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        try:
            cur.execute("INSERT INTO users(username, password, nickname, profile_pic) VALUES(?,?,?,?)", (username, password, username, DEFAULT_PFP))
        except sqlite3.Error:
            if not suppress_flash:
                flash("Dieser Benutzer existiert bereits")


def get_userinfo(user_id: int) -> List[any] | None:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute(
            "SELECT nickname, username, profile_pic FROM users WHERE user_id = ?", (user_id, )
        )
        return cur.fetchone()


def get_secret(user_id: int) -> str:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute(
            "SELECT secret FROM secrets WHERE user_id = ?", (user_id, )
        )
        result = cur.fetchone()
    return "" if result is None else result[0]


def add_zwitsch(new_zwitsch: Zwitsch) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        try:
            cur.execute(
                "INSERT INTO zwitsches(text, user_id, timestamp) VALUES(?,?,?)",
                (new_zwitsch.text, new_zwitsch.user_id, new_zwitsch.timestamp)
            )
        except sqlite3.Error as e:
            flash(f"Datenbankfehler:<br>\"{e}\"")


def get_like_count(zwitsch_id: int) -> int:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        try:
            cur.execute("SELECT COUNT(*) FROM likes WHERE zwitsch_id = ?", (zwitsch_id, ))
            return cur.fetchone()
        except sqlite3.Error:
            return 0


def enrich_with_data(zwitsches: List[List[any]]) -> None:
    userinfo_cache = {}
    enriched_zwitsches = []
    for zwitsch in zwitsches:
        user_id = zwitsch[2]
        userinfo = userinfo_cache.get(user_id)
        if userinfo is None:
            userinfo = get_userinfo(user_id)
            userinfo_cache[user_id] = userinfo
        likes = get_like_count(zwitsch[0])
        z = zwitsch + userinfo + likes
        enriched_zwitsches.append(z)
    return enriched_zwitsches


def get_zwitsches(text_search: str = None) -> List[any]:
    query = "SELECT * FROM zwitsches"
    if text_search:
        query += f" WHERE text LIKE '%{text_search}%'"
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        try:
            cur.execute(query)
            zwitsches = cur.fetchall()
        except sqlite3.Error as e:
            flash(f"Datenbankfehler<br>\"{e}\"<br>bei folgendem Query:<br>{query}")
            return []
    try:
        zwitsches = enrich_with_data(zwitsches)
        return list(reversed(zwitsches))
    except:
        flash(f"Konnte Ergebnis von Query<br>{query}<br>nicht verarbeiten. Ergebnis lautete:<br>{zwitsches}")
        return []


def get_user_zwitsches(user_id: int) -> List[any]:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM zwitsches WHERE user_id = ?", (user_id, ))
        zwitsches = cur.fetchall()
    zwitsches = enrich_with_data(zwitsches)
    return list(reversed(zwitsches))


def add_like(zwitsch_id: int, user_id: int) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("INSERT OR IGNORE INTO likes (zwitsch_id, user_id) VALUES (?,?)", (zwitsch_id, user_id))


def remove_like(zwitsch_id: int, user_id: int) -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("DELETE FROM likes WHERE zwitsch_id = ? AND user_id = ?", (zwitsch_id, user_id))


def is_liked_by(zwitsch_id: int, user_id: int) -> bool:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM likes WHERE zwitsch_id = ? AND user_id = ?", (zwitsch_id, user_id))
        return cur.fetchone()[0] > 0


def select_by_page(zwitsches: List[any], p: int | None, z_len: int) -> List[any]:
    if p is not None and p >= 0 and p <= ((z_len - 1) // 10):
        return zwitsches[p*10:(p+1)*10]
    else:
        return zwitsches[:10]


def delete_all_zwitsches() -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("DELETE FROM zwitsches WHERE user_id != 1")
        cur.execute("DELETE FROM likes WHERE zwitsch_id != 1")


def drop_all_tables() -> None:
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.execute("DROP TABLE IF EXISTS users")
        cur.execute("DROP TABLE IF EXISTS zwitsches")
        cur.execute("DROP TABLE IF EXISTS secrets")
        cur.execute("DROP TABLE IF EXISTS likes")


def delete_pfp_dir() -> None:
    shutil.rmtree(PFPDIR)


def create_initial_pfps() -> None:
    os.makedirs(PFPDIR, exist_ok=True)
    for fn in os.listdir("pfp"):
        shutil.copyfile(os.path.join("pfp", fn), os.path.join(PFPDIR, fn))


def create_tables() -> None:
    with open("db_init.sql") as f:
        db_init_script = f.read()
    with sqlite3.connect(DATABASE_PATH) as con:
        cur = con.cursor()
        cur.executescript(db_init_script)


def create_init_state() -> None:
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        num_users = cur.fetchone()[0]
    if num_users == 0:
        add_user("admin", FLAG2, True)
        update_nickname(1, "Leon Moschus")
        update_pfp(1, "doge.png")
        update_secret(1, FLAG1)
    with sqlite3.connect(DATABASE_PATH_RO, uri=True) as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM zwitsches")
        num_zwitsches = cur.fetchone()[0]
    if num_zwitsches == 0:
        add_zwitsch(Zwitsch(f"Endlich habe ich meine neue Social Media Platform aufgesetzt: Zwitscher 🚀💯", 1, int(datetime.now().timestamp())))
        add_like(1, 1)


def init() -> None:
    create_initial_pfps()
    create_tables()
    create_init_state()


@app.route("/", methods=["GET"])
def index() -> str:
    if session.get("user_id") is None:
        return render_template("login.html")
    q = request.args.get("q")
    zwitsches = get_zwitsches(q)
    z_len = len(zwitsches)
    p = try_parse_int(request.args.get("p", "0"))
    zwitsches = select_by_page(zwitsches, p, z_len)
    mode = "zwitsches" if q is None else "search"
    return render_template("home.html", mode=mode, zwitsches=zwitsches, z_len=z_len)


@app.route("/login", methods=["POST"])
def login() -> Response:
    username = request.form.get("username")
    password = request.form.get("password")
    if not username:
        flash("Bitte Benutzernamen eingeben")
    elif not password:
        flash("Bitte Passwort eingeben")
    else:
        user_id = get_user(username, password)
        if user_id is None:
            flash("Benutzername oder Passwort falsch")
        elif user_id == 1:
            flash("Dieses Benutzerkonto ist vorübergehend deaktiviert.")
        else:
            session["user_id"] = user_id
    return redirect("/")


@app.route("/logout", methods=["GET"])
def logout() -> Response:
    session.clear()
    return redirect("/")


@app.route("/register", methods=["POST"])
def register() -> Response:
    username = request.form.get("username")
    password = request.form.get("password")
    if not username:
        flash("Bitte Benutzernamen eingeben")
    elif not password:
        flash("Bitte Passwort eingeben")
    else:
        add_user(username, password)
    return redirect("/")


@app.route("/user", methods=["GET"])
def user() -> Response:
    own_user_id = session.get("user_id")
    if own_user_id is None:
        return redirect("/")
    user_id = try_parse_int(request.args.get("id"))
    if user_id is None:
        user_id = own_user_id
    userinfo = get_userinfo(user_id)
    if userinfo is None:
        flash("Konnte angegebenen Benutzer nicht finden")
        return redirect("/")
    zwitsches = get_user_zwitsches(user_id)
    z_len = len(zwitsches)
    p = try_parse_int(request.args.get("p", "0"))
    zwitsches = select_by_page(zwitsches, p, z_len)
    return render_template(
        "home.html", mode="profile", userinfo=userinfo, zwitsches=zwitsches, z_len=z_len, 
        user_id=user_id, is_own_profile=own_user_id == user_id
    )


@app.route("/edit", methods=["GET"])
def edit() -> Response:
    user_id = try_parse_int(request.args.get("id"))
    if user_id is None:
        flash("Konnte angegebenen Benutzer nicht finden")
        return redirect("/")
    userinfo = get_userinfo(user_id)
    if userinfo is None:
        flash("Konnte angegebenen Benutzer nicht finden")
        return redirect("/")
    secret = get_secret(user_id)
    return render_template("home.html", mode="edit", userinfo=userinfo, user_id=user_id, secret=secret)


@app.route("/update-user", methods=["POST"])
def update_user() -> Response:
    user_id = session.get("user_id")
    if user_id is None:
        flash("Konnte angegebenen Benutzer nicht finden")
        return redirect("/")
    if user_id == 1:
        flash("Diese Benutzerkonto ist vorübergehend eingefroren")
        return redirect("/")
    pfp = request.files.get("pfp")
    if pfp is not None and pfp.filename != "":
        extension = pfp.filename.split(".")[-1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            flash(f"Dateiendung nicht erlaubt. Erlaubt sind nur: {ALLOWED_EXTENSIONS}")
            return redirect("/")
        filename = secure_filename(f"{random_str(20)}.{extension}")
        pfp.save(os.path.join(PFPDIR, filename))
        update_pfp(user_id, filename)
    nickname = request.form.get("nickname")
    if nickname is not None and nickname != "":
        update_nickname(user_id, nickname)
    secret = request.form.get("secret")
    if secret is not None and secret != "":
        update_secret(user_id, secret)
    return redirect("/user")


@app.route("/zwitsch", methods=["POST"])
def zwitsch() -> Response:
    text = request.form.get("text")
    user_id = session.get("user_id")
    if text is None or text == "":
        flash("Kann keinen Zwitsch ohne Text speichern.")
    elif len(text) > 280:
        flash("Dieser Zwitsch überschreitet das Limit von 280 Zeichen.")
    elif user_id is None:
        flash("Anmeldung ist nicht valide")
    else:
        timestamp = int(datetime.now().timestamp())
        add_zwitsch(Zwitsch(text, user_id, timestamp))
    return redirect("/")


@app.route("/like", methods=["GET"])
def like() -> Response:
    z = try_parse_int(request.args.get("z"))
    user_id = session.get("user_id")
    if z is None or user_id is None:
        return "invalid input", 400
    add_like(z, user_id)
    return "liked", 200


@app.route("/unlike", methods=["GET"])
def unlike() -> Response:
    z = try_parse_int(request.args.get("z"))
    user_id = session.get("user_id")
    if z is None or user_id is None:
        return "invalid input", 400
    remove_like(z, user_id)
    return "unliked", 200


@app.route("/is-liked-by-me", methods=["GET"])
def is_liked_by_me() -> Response:
    z = try_parse_int(request.args.get("z"))
    user_id = session.get("user_id")
    if z is None or user_id is None:
        return "invalid input", 400
    data = { "a": is_liked_by(z, user_id) }
    return jsonify(data)


@app.route('/pfp/<path:filename>')
def pfp(filename):
    return send_from_directory(PFPDIR, filename)


@app.route(SOFT_RESET_PATH)
def soft_reset() -> Response:
    delete_all_zwitsches()
    return redirect("/")


@app.route(HARD_RESET_PATH)
def hard_reset() -> Response:
    drop_all_tables()
    delete_pfp_dir()
    init()
    return redirect("/logout")


init()
