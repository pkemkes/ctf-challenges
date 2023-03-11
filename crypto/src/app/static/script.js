var textEnc = document.getElementById("text-enc");
var textDec = document.getElementById("text-dec");
var keyBox = document.getElementById("key");
var arrowUp = document.getElementById("arrow-up");
var arrowDown = document.getElementById("arrow-down");
var toLetters = document.getElementsByClassName("to");

Number.prototype.mod = function(n) {
    "use strict";
    return ((this % n) + n) % n;
};

var DICT = {};
var M = 26;

function parseKey(keyStr) {
    if (typeof keyStr != "string") return false;
    let key = parseInt(keyStr);
    if (isNaN(keyStr) || isNaN(key) || key < 0 || key >= M) {
        throw "invalid key " + keyStr;
    }
    return key;
}

function moveBy(charCode, key, first, last) {
    let base = first.charCodeAt();
    let m = last.charCodeAt() - base + 1;
    return ((charCode - base - key).mod(m)) + base;
}

function addToCesarDict(key, first, last) {
    for (let i = first.charCodeAt(); i <= last.charCodeAt(); i++) {
        DICT[String.fromCharCode(i)] = String.fromCharCode(moveBy(i, key, first, last));
    }
}

function updateCaesarDict() {
    let key = parseKey(keyBox.innerHTML);
    addToCesarDict(key, "a", "z");
    addToCesarDict(key, "A", "Z");
}

function decrypt() {
    try {
        updateCaesarDict();
    }
    catch(err) {
        console.error(err);
        return;
    }
    let enc = textEnc.innerHTML;
    let dec = "";
    for (const c of enc) {
        dec += c in DICT ? DICT[c] : c;
    }
    textDec.innerHTML = dec;
}

function changeOrder(key) {
    for (let i = 0; i < toLetters.length; i++) {
        let accessor = (i + key).mod(M);
        toLetters[accessor].style.order = i;
    }
}

function changeKey(inc) {
    try {
        var key = parseKey(keyBox.innerHTML)
    }
    catch(err) {
        console.error(err);
        return;
    }
    key = (inc ? key + 1 : key - 1).mod(M);
    keyBox.innerHTML = key;
    changeOrder(key);
    decrypt();
}

arrowUp.addEventListener("click", () => changeKey(true));
arrowDown.addEventListener("click", () => changeKey(false));

decrypt();

document.getElementById("js-warning").style.display = "none";