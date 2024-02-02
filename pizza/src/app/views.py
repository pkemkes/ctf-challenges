import os
from app import app
from flask import render_template, Response, request, redirect, flash


app.secret_key = os.urandom(32)
FLAG = os.getenv("FLAG")
assert FLAG is not None, "FLAG is not set!"
PRICE_PIZZA_1 = 4.20
PRICE_PIZZA_2 = 6.90
PRICE_PIZZA_3 = 6.50


@app.route("/", methods=["GET"])
def index() -> str:
    return render_template("index.html", data={
        "pricePizza1": PRICE_PIZZA_1,
        "pricePizza2": PRICE_PIZZA_2,
        "pricePizza3": PRICE_PIZZA_3
    })


@app.route('/buy', methods=['POST'])
def buy() -> Response:
    if int(request.form['pizza1']) < 0 or int(request.form['pizza2']) < 0 or int(request.form['pizza3']) < 0:
        flash("Du kannst keine negativen Pizzen bestellen!")
        return redirect("/")
    elif int(request.form['pizza1']) + int(request.form['pizza2']) + int(request.form['pizza3']) <= 0:
        flash("Bitte bestelle mindestens eine Pizza!")
        return redirect("/")
    elif (int(request.form['pizza1']) * PRICE_PIZZA_1 + int(request.form['pizza2']) * PRICE_PIZZA_2
          + int(request.form['pizza3']) * PRICE_PIZZA_3) + float(request.form['tip']) <= 0:
        flash(FLAG)
    return redirect(f'/success?pizza1={request.form["pizza1"]}&pizza2={request.form["pizza2"]}&pizza3=' +
                    f'{request.form["pizza3"]}&tip={request.form["tip"]}')


@app.route('/success', methods=['GET'])
def success() -> str:
    return render_template("success.html", data={
        "pizza1": {
            "price": PRICE_PIZZA_1,
            "amount": int(request.args.get("pizza1"))
        },
        "pizza2": {
            "price": PRICE_PIZZA_2,
            "amount": int(request.args.get("pizza2"))
        },
        "pizza3": {
            "price": PRICE_PIZZA_3,
            "amount": int(request.args.get("pizza3"))
        },
        "tip": float(request.args.get("tip"))
    })
