var alphabetInput = document.getElementById("alphabet");
var passwordLenInput = document.getElementById("password-length");
var passwordsOutput = document.getElementById("passwords");
var numOfPasswordsText = document.getElementById("num-of-passwords-text");
var numOfPasswordsOutput = document.getElementById("num-of-passwords");
var passwordsText = document.getElementById("passwords-text");

function* PasswordGenerator(alphabet, passwordLen) {
    let alphaLen = alphabet.length;
    let numOfPasswords = Math.pow(alphaLen, passwordLen);
    for (let passwordIndex = 0; passwordIndex < numOfPasswords; passwordIndex++) {
        let password = "";
        for (let passwordPos = 0; passwordPos < passwordLen; passwordPos++) {
            let alphabetPos = Math.floor(passwordIndex / Math.pow(alphaLen, passwordPos)) % alphaLen;
            password = alphabet[alphabetPos] + password;
        }
        yield password;
    }
}

function DisplayFirstPasswords() {
    let alphabet = alphabetInput.value;
    let passwordLen = passwordLenInput.value;
    let numOfPasswords = Math.pow(alphabet.length, passwordLen);
    numOfPasswordsText.style.display = "inline";
    numOfPasswordsOutput.innerHTML = numOfPasswords.toLocaleString();
    numOfPasswordsOutput.style.display = "inline";
    let maxDisplayedPasswords = 10000;
    passwordsText.innerHTML = "Die ersten " + maxDisplayedPasswords.toLocaleString() + ":";
    passwordsText.style.display = "inline";
    passwordsOutput.innerHTML = "";
    passwordsOutput.style.display = "flex";
    let passwordIndex = 0;
    for (let password of PasswordGenerator(alphabet, passwordLen)) {
        if (passwordIndex >= 10000) break;
        let passwordSpan = document.createElement("span");
        passwordSpan.innerHTML = password;
        passwordsOutput.appendChild(passwordSpan);
        passwordIndex++;
    }
}

alphabetInput.addEventListener("input", DisplayFirstPasswords);
passwordLenInput.addEventListener("input", DisplayFirstPasswords);

var clocks = Array.from(document.getElementsByClassName("time"));

function UpdateClock(clock) {
    var now = new Date();
    var time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, "0");
    let clockTime = clock.innerHTML;
    if (clockTime != time) {
        clock.innerHTML = time;
    }
}

clocks.forEach(clock => {
    UpdateClock(clock);
    setInterval(() => UpdateClock(clock), 1000);
});

document.getElementById("js-warning").style.display = "none";