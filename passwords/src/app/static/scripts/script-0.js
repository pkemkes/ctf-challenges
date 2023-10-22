var forgotPasswordButton = document.getElementById("forgot-password-button");
var returnToLoginButton = document.getElementById("return-to-login-button");
var restoreLoginButton = document.getElementById("restore-login-button");
var regularLogin = document.getElementById("regular-login");
var usernameInput = document.getElementById("login-username");
var passwordInput = document.getElementById("login-password");
var loginMessageBox = document.getElementById("login-message-box");
var loginButton = document.getElementById("login-button");
var backupLogin = document.getElementById("backup-login");
var securityAnswerIntput = document.getElementById("login-security-answer");

function FakeLogin() {
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
    loginMessageBox.innerHTML = "Falsches Passwort.";
}

function ForgotPassword() {
    regularLogin.style.display = "none";
    backupLogin.style.display = "flex";
    loginMessageBox.innerHTML = "";
}

function ReturnToLogin() {
    regularLogin.style.display = "flex";
    backupLogin.style.display = "none";
    loginMessageBox.innerHTML = "";
}

function RestoreLogin() {
    let username = usernameInput.value;
    let securityAnswer = securityAnswerIntput.value;
    if (!username){
        loginMessageBox.innerHTML = "Bitte eine E-Mail Adresse eingeben.";
        return;
    }
    if (username !== hiddenUsername) {
        loginMessageBox.innerHTML = "Zu dieser E-Mail existiert kein Benutzer.";
        return;
    };
    if (!securityAnswer){
        loginMessageBox.innerHTML = "Bitte eine Antwort eingeben.";
        return;
    }
    let decoded = DecodeChallenge(securityAnswer);
    if (!decoded) {
        loginMessageBox.innerHTML = "Falsche Antwort.";
        return;
    }
    loginBox.style.display = "none";
    profileBox.style.display = "flex";
    flagBox.innerHTML = decoded.substring(knownPT.length);
}

function IsRegularLoginActive() {
    return false;
}

function AddSpecificEventListeners() {
    console.log("here");
    loginButton.addEventListener("click", FakeLogin);
    console.log("loginButton");
    console.log(loginButton);
    usernameInput.addEventListener("keypress", e => { if (e.key === "Enter") FakeLogin() });
    console.log("usernameInput");
    console.log(usernameInput);
    passwordInput.addEventListener("keypress", e => { if (e.key === "Enter") FakeLogin() });
    console.log("passwordInput");
    console.log(passwordInput);
    forgotPasswordButton.addEventListener("click", ForgotPassword);
    console.log("forgotPasswordButton");
    console.log(forgotPasswordButton);
    returnToLoginButton.addEventListener("click", ReturnToLogin);
    restoreLoginButton.addEventListener("click", RestoreLogin);
}