var usernameInput = document.getElementById("login-username");
var passwordInput = document.getElementById("login-password");
var hiddenUsername = document.getElementById("pw-challenge-username").innerHTML;
var hiddenChecksum = document.getElementById("pw-challenge-checksum").innerHTML;
var loginBox = document.getElementById("login-box");
var profileBox = document.getElementById("profile-box");
var flagBox = document.getElementById("flag-box");
var loginButton = document.getElementById("login-button");
var loginMessageBox = document.getElementById("login-message-box");
var hackToolUsernameInput = document.getElementById("hack-tool-mail");
var passwordsOutput = document.getElementById("passwords");
var numOfPasswordsText = document.getElementById("num-of-passwords-text");
var numOfPasswordsOutput = document.getElementById("num-of-passwords");
var knownPT = document.getElementById("pw-known-pt").innerHTML;
var challenge = atob(document.getElementById("pw-challenge").innerHTML);
var outerLoadingBar = document.getElementById("outer-loading-bar");
var innerLoadingBar = document.getElementById("inner-loading-bar");
var loadingPercentage = document.getElementById("loading-percentage");
var hackButton = document.getElementById("hack-button");
var successMessageField = document.getElementById("success-msg");
var breakBruteForce = false;
var interruptedBruteForce = false;
var passwordsDisplayGen = undefined;
var loadingBarIntervals = CalcLoadingBarIntervals();
var loadingBarPercentage = 0;

function DisplayPasswords(reset) {
    if (reset) {
        let numOfPasswords = CalcNumberOfPasswords();
        numOfPasswordsText.style.display = "inline";
        numOfPasswordsOutput.innerHTML = numOfPasswords.toLocaleString();
        numOfPasswordsOutput.style.display = "inline";
        passwordsOutput.style.display = "flex";
        passwordsOutput.innerHTML = "";
        passwordsDisplayGen = PasswordGenerator();
    }
    for (let i = 0; i < 100; i++) {
        let nextPasswords = passwordsDisplayGen.next();
        if (nextPasswords.done) return;
        let passwordSpan = document.createElement("span");
        passwordSpan.innerHTML = nextPasswords.value;
        passwordsOutput.appendChild(passwordSpan);
    }
}

function CalcChecksum(decoded) {
    return Array.from(decoded).map(c => c.charCodeAt()).reduce((sum, x) => sum + x, 0)
}

function DecodeChallenge(password) {
    decoded = "";
    let keyLen = password.length;
    for (let i = 0; i < challenge.length; i++) {
        decoded += String.fromCharCode(challenge[i].charCodeAt() ^ password[i%keyLen].charCodeAt());
        if (i == knownPT.length-1 && decoded != knownPT) {
            return null;
        }
    }
    if (CalcChecksum(decoded) !== parseInt(hiddenChecksum)) return null;
    return decoded;
}

function ReverseFancyExpFunc(y) {
    return -Math.log(1 - (y / 1.1)) / 2.398;
}

function CalcLoadingBarIntervals() {
    let intervals = new Array(10000);
    for (let i = 1; i <= 10000; i++) {
        intervals[i-1] = ReverseFancyExpFunc(i/10000);
    }
    return intervals;
}

function UpdateLoadingBar(percentage) {
    let displayNum = percentage.toFixed(2) + "%";
    loadingPercentage.innerHTML = displayNum;
    innerLoadingBar.style.width = displayNum;
}

function SetHackButtonToStop() {
    hackButton.className = "stop-button";
    hackButton.value = "STOP";
    hackButton.removeEventListener("click", BruteForce);
    hackButton.addEventListener("click", BreakBruteForce);
}

function SetHackButtonToHack() {
    hackButton.className = "hack-button";
    hackButton.value = "HACK";
    hackButton.removeEventListener("click", BreakBruteForce);
    hackButton.addEventListener("click", BruteForce);
}

function IsCorrectUsername() {
    let username = hackToolUsernameInput.value;
    if (!username) {
        successMessageField.innerHTML = "> Bitte eine E-Mail Adresse eingeben."
        successMessageField.style.color = "red";
        return false;
    }
    if (username !== hiddenUsername) {
        successMessageField.innerHTML = "> Zu dieser E-Mail existiert kein Benutzer."
        successMessageField.style.color = "red";
        return false;
    }
    return true;
}

function BruteForce() {
    if (!IsCorrectUsername()) return;
    if (!IsEnoughInputForTesting()) return;
    outerLoadingBar.style.display = "inline";
    breakBruteForce = false;
    interruptedBruteForce = false;
    UpdateLoadingBar(0);
    successMessageField.innerHTML = "";
    SetHackButtonToStop();
    let foundPassword = "";
    let gen = PasswordGenerator();
    let numOfPasswords = CalcNumberOfPasswords();
    let intervalCount = 0;
    let intervalLen = 100000;
    let lastLoadingBarIntervalInd = 0;
    let bruteForceInterval = setInterval(() => {
        if (breakBruteForce) {
            clearInterval(bruteForceInterval);
            UpdateLoadingBar(interruptedBruteForce ? 0 : 100);
            SetHackButtonToHack();
            if (foundPassword){
                successMessageField.innerHTML = "> Passwort gefunden: " + foundPassword;
                successMessageField.style.color = "lime";
            } 
            else {
                successMessageField.innerHTML = "> Kein Passwort gefunden :(";
                successMessageField.style.color = "red";
            }
            return;
        }
        for (let i = 0; i < intervalLen; i++) {
            let nextPassword = gen.next();
            if (nextPassword.done) {
                breakBruteForce = true;
                break;
            }
            let decoded = DecodeChallenge(nextPassword.value);
            if (i % 100 == 0) {
                let currPassword = (intervalCount*intervalLen) + i;
                if ((currPassword / numOfPasswords) > loadingBarIntervals[lastLoadingBarIntervalInd]) {
                    lastLoadingBarIntervalInd += 1;
                    UpdateLoadingBar(lastLoadingBarIntervalInd / 100);
                }
            }
            if (decoded) {
                loadingBarPercentage = 100;
                foundPassword = nextPassword.value;
                breakBruteForce = true;
                break;
            }
        }
        intervalCount++;
    }, 20);
}

function BreakBruteForce() {
    loadingBarPercentage = 0;
    breakBruteForce = true;
    interruptedBruteForce = true;
}

function IsScrolledToBottom(element) {
    return (element.clientHeight + element.scrollTop) - element.scrollHeight;
}

function Login() {
    let username = usernameInput.value;
    let password = passwordInput.value;
    if (!username){
        loginMessageBox.innerHTML = "Bitte eine E-Mail Adresse eingeben.";
        return;
    }
    if (username !== hiddenUsername) {
        loginMessageBox.innerHTML = "Zu dieser E-Mail existiert kein Benutzer.";
        return;
    };
    if (!password){
        loginMessageBox.innerHTML = "Bitte ein Passwort eingeben.";
        return;
    }
    let decoded = DecodeChallenge(password);
    if (!decoded) {
        loginMessageBox.innerHTML = "Falsches Passwort.";
        return;
    }
    loginBox.style.display = "none";
    profileBox.style.display = "flex";
    flagBox.innerHTML = decoded.substring(knownPT.length);
}

loginButton.addEventListener("click", Login);
usernameInput.addEventListener("keypress", e => { if (e.key === "Enter") Login() });
passwordInput.addEventListener("keypress", e => { if (e.key === "Enter") Login() });
hackButton.addEventListener("click", BruteForce);
passwordsOutput.addEventListener("scroll", () => {
    if (IsScrolledToBottom(passwordsOutput)) DisplayPasswords(false);
});
AddSpecificEventListeners();

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