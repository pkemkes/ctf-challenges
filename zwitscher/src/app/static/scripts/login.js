var textVerb = document.getElementById("text-verb");
var form = document.getElementById("form");
var submitButton = document.getElementById("submit-btn");
var switchButton = document.getElementById("switch-btn");

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
    } 
    else {
        textVerb.innerHTML = "einloggen";
        submitButton.value = "Einloggen";
        switchButton.value = "Registrieren";
        form.action = "/login";
        currentMode = "login";
    } 
});

window.onload = AddBreaksToFlashes;