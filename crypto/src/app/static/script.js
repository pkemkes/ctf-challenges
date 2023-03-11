var textEnc = document.getElementById("text-enc");
var textDec = document.getElementById("text-dec");
var keyInput = document.getElementById("key");

Number.prototype.mod = function(n) {
    "use strict";
    return ((this % n) + n) % n;
};

var DICT = {};

function parseKey(keyStr) {
    if (typeof keyStr != "string") return false;
    let key = parseInt(keyStr);
    if (isNaN(keyStr) || isNaN(key) || key < 0 || key >= 26) {
        throw "invalid key " + keyStr;
    }
    return key;
}

function moveBy(charCode, key, first, last) {
    let base = first.charCodeAt();
    let m = last.charCodeAt() - base;
    return ((charCode - base - key).mod(m)) + base;
}

function addToCesarDict(key, first, last) {
    for (let i = first.charCodeAt(); i <= last.charCodeAt(); i++) {
        DICT[String.fromCharCode(i)] = String.fromCharCode(moveBy(i, key, first, last));
    }
}

function updateCaesarDict() {
    let key = parseKey(keyInput.value);
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

keyInput.addEventListener("input", decrypt);

decrypt();