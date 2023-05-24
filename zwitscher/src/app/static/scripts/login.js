var textVerb = document.getElementById("text-verb");
var form = document.getElementById("form");
var submitButton = document.getElementById("submit-btn");
var switchButton = document.getElementById("switch-btn");
var passwortNote = document.getElementById("password-note");

function AddBreaksToFlashes() {
    let errors = Array.from(document.getElementsByClassName("error"));
    errors.forEach(e => {
        e.innerHTML = e.innerHTML.replaceAll("&lt;br&gt;", "<br>");
    })
}

var currentMode = "login";

switchButton.addEventListener("click", () => {
    if (currentMode == "login") {
        textVerb.innerHTML = "registrieren";
        submitButton.value = "Registrieren";
        switchButton.value = "Einloggen"
        form.action = "/register";
        currentMode = "register";
        passwortNote.style.display = "block";
    } 
    else {
        textVerb.innerHTML = "einloggen";
        submitButton.value = "Einloggen";
        switchButton.value = "Registrieren";
        form.action = "/login";
        currentMode = "login";
        passwortNote.style.display = "none";
    } 
});

window.onload = AddBreaksToFlashes;