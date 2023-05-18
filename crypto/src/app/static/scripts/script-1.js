var textEnc = document.getElementById("text-enc");
var textDec = document.getElementById("text-dec");

var isCorrectDrag = false;

function getDecDict() {
    let encLetters = placeholderLetters.map(l => l.innerHTML);
    let decDict = {};
    for (let i = 0; i < 26; i++) {
        let decLetter = String.fromCharCode("A".charCodeAt() + i);
        let encLetter = encLetters[i];
        if (encLetter == " ") continue;
        decDict[decLetter] = encLetter;
        decDict[decLetter.toLowerCase()] = encLetter.toLowerCase();
    }
    return decDict;
}

function decrypt() {
    let decDict = getDecDict();
    let dec = "";
    for (const c of textEnc.innerHTML) {
        if (isDecryptable(c)){
            dec += c in decDict ? decryptedStyle(decDict[c]) : c;
        }
        else {
            dec += decryptedStyle(c);
        }
    }
    textDec.innerHTML = dec;
}

function decryptedStyle(c) {
    return "<span class=\"dec-letter\">" + c + "</span>";
}

function isDecryptable(c) {
    return ("a".charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= "z".charCodeAt()) || 
        ("A".charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= "Z".charCodeAt())
}

var toLetters = Array.from(document.getElementsByClassName("to"));
var placeholderLetters = Array.from(document.getElementsByClassName("placeholder"));

var swappedLetters = {};

function handleDragStart(e) {
    this.style.opacity = "0.4";
    dragSrcE1 = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
    isCorrectDrag = true;
}

function handleDragEnd() {
    if (this.style.opacity != "0") this.style.opacity = "1";
    placeholderLetters.forEach(l => l.classList.remove("over"));
    isCorrectDrag = false;
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter() {
    this.classList.add("over");
}

function handleDragLeave() {
    this.classList.remove("over");
}

function handleRestore() {
    let toRestore = swappedLetters[this.innerHTML];
    delete swappedLetters[this.innerHTML];
    toRestore.innerHTML = this.innerHTML;
    toRestore.style.opacity = "1";
    toRestore.draggable = true;
    toRestore.style.cursor = "move";
    this.innerHTML = " ";
    this.removeEventListener("click", handleRestore);
    this.style.cursor = "auto";
    this.classList.remove("clickable");
    this.addEventListener("dragover", handleDragOver);
    this.addEventListener("dragenter", handleDragEnter);
    this.addEventListener("dragleave", handleDragLeave);
    this.addEventListener("drop", handleDrop);
    decrypt();
}

function handleDrop(e) {
    if (!isCorrectDrag) return;
    e.stopPropagation();
    dragSrcE1.innerHTML = this.innerHTML;
    dragSrcE1.style.opacity = "0";
    dragSrcE1.draggable = false;
    dragSrcE1.style.cursor = "auto";
    this.innerHTML = e.dataTransfer.getData("text/html");
    this.addEventListener("click", handleRestore);
    this.style.cursor = "pointer";
    this.classList.add("clickable");
    swappedLetters[this.innerHTML] = dragSrcE1;
    this.removeEventListener("dragover", handleDragOver);
    this.removeEventListener("dragenter", handleDragEnter);
    this.removeEventListener("dragleave", handleDragLeave);
    this.removeEventListener("drop", handleDrop);
    decrypt();
    return false;
}

toLetters.forEach(l => {
    l.addEventListener("dragstart", handleDragStart);
    l.addEventListener("dragend", handleDragEnd);
});

placeholderLetters.forEach(l => {
    l.addEventListener("dragover", handleDragOver);
    l.addEventListener("dragenter", handleDragEnter);
    l.addEventListener("dragleave", handleDragLeave);
    l.addEventListener("drop", handleDrop);
});

decrypt();