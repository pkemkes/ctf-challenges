var alphabetInput = document.getElementById("alphabet");
var maxPasswordLenInput = document.getElementById("password-length");
var maxPasswordLenIncButton = document.getElementById("pw-len-up");
var maxPasswordLenDecButton = document.getElementById("pw-len-down");
var minMaxPasswordLen = 1;
var maxMaxPasswordLen = 20;
var isRegularLoginMode = true;
var trySecretDecode = true;

function DeduplicateString(input) {
    return Array.from(new Set(input.split(""))).join("");
}

function GetAlphabet() {
    return DeduplicateString(alphabetInput.value);
}

function CalcNumberOfPasswords() {
    let alphabet = GetAlphabet();
    let maxPasswordLen = maxPasswordLenInput.innerHTML;
    let numberOfPasswords = 0;
    for (let i = 1; i <= maxPasswordLen; i++) {
        numberOfPasswords += Math.pow(alphabet.length, i);
    }
    return numberOfPasswords;
}

function* AlphabetIndicesGenerator(alphaLen, passwordLen) {
    let indices = new Array(passwordLen).fill(0);
    yield indices;
    let lastElemInd = indices.length - 1;
    let numOfPasswords = Math.pow(alphaLen, passwordLen);
    for (let i = 0; i < numOfPasswords - 1; i++) {
        indices[lastElemInd] += 1;
        for (let j = lastElemInd; j > 0; j--) {
            if (indices[j] < alphaLen) break;
            indices[j] = 0;
            indices[j-1] += 1; 
        }
        yield indices;
    }
}

function GetPasswordFromIndices(indices, alphabet) {
    let password = "";
    for (let i of indices) {
        password += alphabet[i];
    }
    return password;
}

function* PasswordGenerator() {
    let alphabet = GetAlphabet();
    if (!alphabet) return;
    let alphaLen = alphabet.length;
    let maxPasswordLen = maxPasswordLenInput.innerHTML;
    for (let passwordLen = 1; passwordLen <= maxPasswordLen; passwordLen++)
    {
        for (let alphabetIndices of AlphabetIndicesGenerator(alphaLen, passwordLen)) {
            yield GetPasswordFromIndices(alphabetIndices, alphabet);
        }
    }
}

function IsEnoughInputForTesting() {
    if (GetAlphabet().length === 0) {
        successMessageField.innerHTML = "> Bitte Buchstaben zum Generieren der Passwörter im Alphabet-Feld einfügen."
        successMessageField.style.color = "red";
        return false;
    }
    return true;
}

function IncMaxPwLen() {
    let len = parseInt(maxPasswordLenInput.innerHTML);
    if (len >= maxMaxPasswordLen) return;
    maxPasswordLenInput.innerHTML = len + 1;
    DisplayPasswords(true);
}

function DecMaxPwLen() {
    let len = parseInt(maxPasswordLenInput.innerHTML);
    if (len <= minMaxPasswordLen) return;
    maxPasswordLenInput.innerHTML = len - 1;
    DisplayPasswords(true);
}

function AddSpecificEventListeners() {
    alphabetInput.addEventListener("input", () => DisplayPasswords(true));
    maxPasswordLenDecButton.addEventListener("click", DecMaxPwLen);
    maxPasswordLenIncButton.addEventListener("click", IncMaxPwLen);
}
