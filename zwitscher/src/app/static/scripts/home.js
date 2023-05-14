var zwitschesBox = document.getElementById("zwitsches");

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

async function IsLikedByMe(zwitschId) {
    let resp = await fetch("/is-liked-by-me?" + new URLSearchParams({ z: zwitschId }), {
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

async function Like(zwitschId) {
    await fetch("/like?z=" + zwitschId);
    window.location.reload();
}

async function Unlike(zwitschId) {
    await fetch("/unlike?z=" + zwitschId);
    window.location.reload();
}

function AddLikeButtonEventListener(zwitsch) {
    let zwitschId = Array.from(zwitsch.children).filter(c => c.classList.contains("zwitsch-id"))[0].innerHTML;
    let likes = Array.from(zwitsch.children).filter(c => c.classList.contains("likes"))[0];
    let likeBtn = Array.from(likes.children).filter(c => c.classList.contains("like-btn"))[0];
    IsLikedByMe(zwitschId).then(res => {
        if (res) {
            likeBtn.src = "/static/images/liked.png";
            likeBtn.addEventListener("click", async () => await Unlike(zwitschId));
        }
        else {
            likeBtn.addEventListener("click", async () => await Like(zwitschId));
        }
    });
}

function AddProfileLinkEventListener(zwitsch) {
    let userId = Array.from(zwitsch.children).filter(c => c.classList.contains("user-id"))[0].innerHTML;
    let topLineElems = Array.from(zwitsch.children).filter(c => c.classList.contains("top-line"))[0].children;
    let clickableElems = Array.from(topLineElems).filter(c => c.classList.contains("nickname") || c.classList.contains("username"));
    let pfp = Array.from(zwitsch.children).filter(c => c.classList.contains("pfp"))[0]
    clickableElems = clickableElems.concat([pfp]);
    clickableElems.forEach(e => e.addEventListener("click", () => window.location = "/user?id=" + userId));
}

function AddZwitschEventListeners() {
    Array.from(document.getElementsByClassName("zwitsch")).forEach(z => {
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
    let zwitschCount = document.getElementById("zwitsch-count").innerHTML;
    if (zwitschCount == 0) return 0;
    zwitschCount = isNaN(zwitschCount) || zwitschCount < 0 ? 0 : parseInt(zwitschCount);
    return Math.floor((zwitschCount-1) / 10);
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
    let pageSelect = document.getElementById("zwitsch-page-select");
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
    let zwitschInput = document.getElementById("zwitsch-input");
    let currentCharsDisplay = document.getElementById("current-chars");
    let charCount = zwitschInput.value.length;
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
    AddZwitschEventListeners();
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
let zwitschInput = document.getElementById("zwitsch-input");
if (zwitschInput != undefined) {
    zwitschInput.addEventListener("keypress", e => { 
        if (e.key !== "Enter") return;
        e.preventDefault();
        document.getElementById("zwitsch-form").submit();
    });
    zwitschInput.addEventListener("input", DisplayCharCount);
}
window.onload = InitAll;