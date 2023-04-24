var task = document.getElementById("task");
var highscore = document.getElementById("highscore");
var usernameInput = document.getElementById("username");
var levelSelect = document.getElementById("level-select");
var speechBubble = document.getElementById("speech-bubble");
var triangle = document.getElementById("triangle");
var askOutput = document.getElementById("ask-output");
var askInput = document.getElementById("ask-input");
var sendBtn = document.getElementById("send-btn");
var viris = document.getElementsByClassName("viri");
var active = true;
var intervalIsCleared = true;
var waitingForResponse = false;
var disableInterval = undefined;

var normalColor = "rgb(255, 246, 168)";
var winColor = "rgb(144, 255, 133)";

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function HideSpeechBubble() {
    if (speechBubble.style.display == "flex") {
        speechBubble.style.display = "none";
    }
}

function ShowSpeechBubble() {
    if (speechBubble.style.display != "flex") {
        speechBubble.style.display = "flex";
    }
}

function ShowViri(viriNum) {
    for (let i = 0; i < viris.length; i++) {
        viris[i].style.display = i == viriNum ? "block" : "none";
    }
}

function LoadViri() {
    let level = levelSelect.selectedIndex;
    for (let i = 0; i < viris.length; i++) {
        viris[i].src = "/static/images/viris/" + level + "_" + i + ".png";
    }
}

async function LoadHighscore() {
    let resp = await fetch("/getScore?" + new URLSearchParams({ 
            l: levelSelect.selectedIndex
        }), {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    if (!resp.ok) return;
    let respData = await resp.json();
    while (highscore.childElementCount > 1) {
        highscore.removeChild(highscore.lastChild);
    }
    Array.from(respData).forEach(d => {
        let [username, score] = d;
        let tr = document.createElement("tr");
        let usernameTd = document.createElement("td");
        usernameTd.innerHTML = username;
        tr.appendChild(usernameTd);
        let scoreTd = document.createElement("td");
        scoreTd.innerHTML = score;
        tr.appendChild(scoreTd);
        highscore.appendChild(tr);
    })
}

async function LoadLevel() {
    await LoadHighscore();
    await LoadPrompt();
    LoadViri();
}

async function Say(respData) {
    askOutput.innerHTML = "";
    words = Array.from(respData.a.split(" "));
    if (respData.f == "length") words.push("...")
    let i = 0;
    do {
        if (askOutput.innerHTML != "") {
            await new Promise(r => setTimeout(r, 100));
            askOutput.innerHTML += " "
        }
        ShowViri(randomIntFromInterval(1,4));
        askOutput.innerHTML += words[i];
        i++;
    } while (i < words.length);
    ShowViri(0);
}

function SetWinSpeechBubble() {
    if (askOutput.style.backgroundColor == winColor) return;
    askOutput.style.backgroundColor = winColor;
    triangle.style.background = "linear-gradient(to bottom right, #fff 0%, #fff 50%, " + winColor + " 50%, " + winColor + " 100%)"
}

function SetNormalSpeechBubble() {
    if (askOutput.style.backgroundColor == normalColor) return;
    askOutput.style.backgroundColor = normalColor;
    triangle.style.background = "linear-gradient(to bottom right, #fff 0%, #fff 50%, " + normalColor + " 50%, " + normalColor + " 100%)"
}

function Disable() {
    active = false;
    sendBtn.classList.remove("active-send-btn");
    sendBtn.classList.add("inactive-send-btn");
}

function Enable() {
    sendBtn.classList.remove("inactive-send-btn");
    sendBtn.classList.add("active-send-btn");
    sendBtn.innerHTML = "Absenden";
    active = true;
}

function Timeout() {
    Disable();
    let disableSeconds = 10;
    intervalIsCleared = false;
    disableInterval = setInterval(() => {
        if (disableSeconds > 0) {
            sendBtn.innerHTML = --disableSeconds;
        } else {
            if (!waitingForResponse){ 
                Enable(); 
            }
            else {
                sendBtn.innerHTML = "Bitte warten..."
            }
            intervalIsCleared = true;
            clearInterval(disableInterval);
        }
    }, 1000);
}

async function Ask() {
    if (!active) return;
    Timeout();
    HideSpeechBubble();
    waitingForResponse = true;
    ShowViri(5);
    let q = askInput.value;
    let resp = await fetch("/ask?" + new URLSearchParams({ 
            q: q,
            l: levelSelect.selectedIndex,
            u: usernameInput.value
        }), {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    waitingForResponse = false;
    if (!active && intervalIsCleared) Enable();
    SetNormalSpeechBubble();
    ShowSpeechBubble();
    if (!resp.ok) {
        askOutput.innerHTML = "<i>Konnte Nachricht nicht laden. Bitte versuche es erneut.</i>";
        return;
    }
    let respData = await resp.json();
    await Say(respData);
    if (respData.win) {
        await new Promise(r => setTimeout(r, 1000));
        await LoadHighscore();
        SetWinSpeechBubble();
    }
}

async function LoadPrompt() {
    let resp = await fetch("/getPrompt?" + new URLSearchParams({ 
            l: levelSelect.selectedIndex
        }), {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    if (!resp.ok) {
        task.innerHTML = "<i>Konnte Anweisung nicht laden. Bitte lade die Seite neu.</i>";
        return;
    }
    let respData = await resp.json();
    task.innerHTML = respData.prompt;
}

window.onload = LoadLevel;
sendBtn.addEventListener("click", Ask);
askInput.addEventListener("keypress", e => { 
    if (e.key !== "Enter") return; 
    e.preventDefault();
    document.activeElement.blur();
    Ask();
});

levelSelect.addEventListener("change", LoadLevel);

document.getElementById("js-warning").style.display = "none";