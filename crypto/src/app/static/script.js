var textareaEnc = document.getElementById("text-enc");
var textareaDec = document.getElementById("text-dec");

var KEY = 5;

var DICT = {};

function build_caesar_dict(key) {
    add_to_caesar_dict(key, "a", "z");
    add_to_caesar_dict(key, "A", "Z");
}

function add_to_caesar_dict(key, first, last) {
    for (let i = first.charCodeAt(); i <= last.charCodeAt(); i++) {
        DICT[String.fromCharCode(i)] = String.fromCharCode(move_by(i, key, first, last));
    }
}

function move_by(charCode, key, first, last) {
    let base = first.charCodeAt();
    let mod = last.charCodeAt() - base;
    return ((charCode - base + key) % mod) + base;
}

function decrypt() {
    let enc = textareaEnc.value;
    let dec = "";
    for (const c of enc) {
        dec += c in DICT ? DICT[c] : c;
    }
    textareaDec.value = dec;
}

build_caesar_dict(5);

textareaEnc.addEventListener("keyup", decrypt);

decrypt();