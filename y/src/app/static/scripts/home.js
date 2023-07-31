var yeetsBox = document.getElementById("yeets");

function UnixToRelative(unixtime) {
    if (isNaN(unixtime)) return "vor langer Zeit";
    let diff = Math.floor(new Date() / 1000) - parseInt(unixtime);
    if (diff < 60) return "vor " + diff + " Sekunde" + (diff == 1 ? "" : "n");
    diff = Math.floor(diff / 60);
    if (diff < 60) return "vor " + diff + " Minute" + (diff == 1 ? "" : "n");
    diff = Math.floor(diff / 60);
    if (diff < 24) return "vor " + diff + " Stunde" + (diff == 1 ? "" : "n");
    diff = Math.floor(diff / 24);
    if (diff < 31) return "vor " + diff + " Tag" + (diff == 1 ? "" : "en");
    return "vor langer Zeit";
}

function ReplaceTimestamps() {
    Array.from(document.getElementsByClassName("timestamp")).forEach(
        t => t.innerHTML = UnixToRelative(t.innerHTML)
    );
}

async function IsLikedByMe(yeetId) {
    let resp = await fetch("/is-liked-by-me?" + new URLSearchParams({ z: yeetId }), {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    if (!resp.ok){
        return false;
    };
    let result = await resp.json();
    return result["a"];
}

async function Like(yeetId) {
    await fetch("/like?z=" + yeetId);
    window.location.reload();
}

async function Unlike(yeetId) {
    await fetch("/unlike?z=" + yeetId);
    window.location.reload();
}

function AddLikeButtonEventListener(yeet) {
    let yeetId = Array.from(yeet.children).filter(c => c.classList.contains("yeet-id"))[0].innerHTML;
    let likes = Array.from(yeet.children).filter(c => c.classList.contains("likes"))[0];
    let likeBtn = Array.from(likes.children).filter(c => c.classList.contains("like-btn"))[0];
    IsLikedByMe(yeetId).then(res => {
        if (res) {
            likeBtn.src = "/static/images/liked.png";
            likeBtn.addEventListener("click", async () => await Unlike(yeetId));
        }
        else {
            likeBtn.addEventListener("click", async () => await Like(yeetId));
        }
    });
}

function AddProfileLinkEventListener(yeet) {
    let userId = Array.from(yeet.children).filter(c => c.classList.contains("user-id"))[0].innerHTML;
    let topLineElems = Array.from(yeet.children).filter(c => c.classList.contains("top-line"))[0].children;
    let clickableElems = Array.from(topLineElems).filter(c => c.classList.contains("nickname") || c.classList.contains("username"));
    let pfp = Array.from(yeet.children).filter(c => c.classList.contains("pfp"))[0]
    clickableElems = clickableElems.concat([pfp]);
    clickableElems.forEach(e => e.addEventListener("click", () => window.location = "/user?id=" + userId));
}

function AddYeetEventListeners() {
    Array.from(document.getElementsByClassName("yeet")).forEach(z => {
        AddLikeButtonEventListener(z);
        AddProfileLinkEventListener(z);
    });
}

function GetCurrentPage() {
    let currentPage = window.location.search.substring(1).split("&")
        .map(s => s.split("=")).filter(p => p[0] == "p")[0];
    currentPage = currentPage == undefined ? 0 : currentPage[1];
    return isNaN(currentPage) || currentPage < 0 ? 0 : parseInt(currentPage); 
}

function GetLastPage() {
    let yeetCount = document.getElementById("yeet-count").innerHTML;
    if (yeetCount == 0) return 0;
    yeetCount = isNaN(yeetCount) || yeetCount < 0 ? 0 : parseInt(yeetCount);
    return Math.floor((yeetCount-1) / 10);
}

function ChangePage(page) {
    let search = window.location.search.substring(1).split("&").map(s => s.split("="));
    if (search.map(s => s[0]).includes("p")) {
        var searchParams = search.map(s => s[0] != "p" ? s : [s[0], page]).map(s => s.join("=")).join("&");
    }
    else {
        var searchParams = search.concat([["p", page]]).map(s => s.join("=")).join("&");
    }
    window.location = window.location.pathname + "?" + searchParams;
}

function CreatePageSelector(page, label = undefined) {
    let e = document.createElement("div");
    e.classList.add("page-selector");
    e.classList.add("clickable");
    e.addEventListener("click", () => ChangePage(page));
    e.innerHTML = label == undefined ? page : label;
    return e;
}

function AdjustPageSelector() {
    let pageSelect = document.getElementById("yeet-page-select");
    let lastPage = GetLastPage();
    if (lastPage == 0) {
        document.getElementById("feed").removeChild(pageSelect);
        return;
    };
    let currentPage = GetCurrentPage();
    document.getElementById("current").innerHTML = currentPage;
    for (let i = currentPage-1; i > currentPage-3 && i >= 0; i--) {
        pageSelect.prepend(CreatePageSelector(i));
    }
    for (let i = currentPage+1; i < currentPage+3 && i <= lastPage; i++) {
        pageSelect.append(CreatePageSelector(i));
    }
    if (currentPage > 2) {
        pageSelect.prepend(CreatePageSelector(0, "⇤"));
    }
    if (currentPage < lastPage - 2) {
        pageSelect.append(CreatePageSelector(lastPage, "⇥"));
    }
}

function ShowSearchQ() {
    let searchQ = document.getElementById("search-q");
    if (searchQ == undefined) return;
    let q = window.location.search.substring(1).split("&").map(s => s.split("=")).filter(s => s[0] == "q")[0];
    if (q == undefined) return;
    searchQ.innerHTML = q[1];    
}

function AddBreaksToFlashes() {
    let errors = Array.from(document.getElementsByClassName("error"));
    errors.forEach(e => {
        e.innerHTML = e.innerHTML.replaceAll("&lt;br&gt;", "<br>");
    })
}

function DisplayCharCount() {
    let yeetInput = document.getElementById("yeet-input");
    let currentCharsDisplay = document.getElementById("current-chars");
    let charCount = yeetInput.value.length;
    currentCharsDisplay.innerHTML = charCount;
    if (charCount >= 280) {
        currentCharsDisplay.style.color = "red";
    }
    else {
        currentCharsDisplay.style.color = "white";
    }
}

function InitAll() {
    ReplaceTimestamps();
    AddYeetEventListeners();
    AdjustPageSelector();
    ShowSearchQ();
    AddBreaksToFlashes();
}

let closeBtn = document.getElementById("close-btn");
if (closeBtn != undefined) {
    closeBtn.addEventListener("click", () => {
        document.getElementById("error-box").style.display = "none";
    })
}
let editBtn = document.getElementById("edit-btn");
if (editBtn != undefined) {
    let userId = document.getElementById("user-id").innerHTML;
    editBtn.addEventListener("click", () => window.location = "/edit?id=" + userId);
}
document.getElementById("logo").addEventListener("click", () => window.location = "/");
document.getElementById("feed-btn").addEventListener("click", () => window.location = "/");
document.getElementById("profile-btn").addEventListener("click", () => window.location = "/user");
document.getElementById("logout-btn").addEventListener("click", () => window.location = "/logout");
let yeetInput = document.getElementById("yeet-input");
if (yeetInput != undefined) {
    yeetInput.addEventListener("keypress", e => { 
        if (e.key !== "Enter") return;
        e.preventDefault();
        document.getElementById("yeet-form").submit();
    });
    yeetInput.addEventListener("input", DisplayCharCount);
}
window.onload = InitAll;