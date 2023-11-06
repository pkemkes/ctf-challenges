var forgotPasswordButton = document.getElementById("forgot-password-button");
var returnToLoginButton = document.getElementById("return-to-login-button");
var restoreLoginButton = document.getElementById("restore-login-button");
var regularLogin = document.getElementById("regular-login");
var backupLogin = document.getElementById("backup-login");
var isRegularLoginMode = true;
var trySecretDecode = false;

function SwitchModeForgotPassword() {
    regularLogin.style.display = "none";
    backupLogin.style.display = "flex";
    loginMessageBox.innerHTML = "";
    isRegularLoginMode = false;
    trySecretDecode = true;
}

function SwitchModeLogin() {
    regularLogin.style.display = "flex";
    backupLogin.style.display = "none";
    loginMessageBox.innerHTML = "";
    isRegularLoginMode = true;
    trySecretDecode = false;
}

function AddSpecificEventListeners() {
    forgotPasswordButton.addEventListener("click", SwitchModeForgotPassword);
    returnToLoginButton.addEventListener("click", SwitchModeLogin);
    restoreLoginButton.addEventListener("click", Login);
    securityAnswerInput.addEventListener("keypress", e => { if (e.key === "Enter") { Login(); }});
}