var securityWarningLink = document.getElementById("security-warning-link");
var securityWarningLinkButton = document.getElementById("security-warn-link-button");
var securityWarningAttachment = document.getElementById("security-warning-attachment");
var securityWarningAttachmentButton = document.getElementById("security-warn-attachment-button");
var unreadNumBox = document.getElementById("unread-num");
var accountInbox = document.getElementById("account-inbox");
var accountSent = document.getElementById("account-sent");
var accountTrash = document.getElementById("account-trash");
var inbox = document.getElementById("inbox");
var mailBox = document.getElementById("mail-box");
var emptyBox = document.getElementById("empty-box");
var mailRows = Array.from(document.getElementsByClassName("mail-row"));
var mailContents = Array.from(document.getElementsByClassName("content-box"));
var links = Array.from(document.getElementsByClassName("link"));
var attachments = Array.from(document.getElementsByClassName("attachment"));
var markableElements = Array.from(document.getElementsByClassName("markable"));
var markerBtn = document.getElementById("marker-btn");
var checkBtn = document.getElementById("check-btn");
var resultsTable = document.getElementById("check-results");
var resultsCorrect = document.getElementById("results-correct");
var resultsIncorrect = document.getElementById("results-incorrect");
var resultsMissed = document.getElementById("results-missed");
var flagBox = document.getElementById("flag-box");
var markerIsSelected = false;
var readMailNums = [];

function SetCookie(key, data) {
    document.cookie = key + "=" + JSON.stringify(data) + "; SameSite=strict";
}

function GetCookieValue(key) {
    return document.cookie.split(";")
        .map(c => c.trim())
        .filter(c => c.startsWith(key + "="))[0];
}

function SetReadStatus(mailNum) {
    mailRows[mailNum].children[1].children[0].src = "/static/images/read.png";
    Array.from(mailRows[mailNum].children).slice(2, 5)
        .forEach(m => m.classList.remove("unread-mail"));
    if (!readMailNums.includes(mailNum)) {
        readMailNums.push(mailNum);
        SetCookie("read", readMailNums);
        SetReadStatusToInbox();
    }
}

function ShowMailBox() {
    mailBox.style.display = "flex";
    emptyBox.style.display = "none";
    accountInbox.classList.add("active-account-dir");
    accountSent.classList.remove("active-account-dir");
    accountTrash.classList.remove("active-account-dir");
}
function ShowSentBox() {
    mailBox.style.display = "none";
    emptyBox.style.display = "block";
    mailContents.forEach(m => m.style.display = "none");
    accountInbox.classList.remove("active-account-dir");
    accountSent.classList.add("active-account-dir");
    accountTrash.classList.remove("active-account-dir");
}

function ShowTrashBox() {
    mailBox.style.display = "none";
    emptyBox.style.display = "block";
    mailContents.forEach(m => m.style.display = "none");
    accountInbox.classList.remove("active-account-dir");
    accountSent.classList.remove("active-account-dir");
    accountTrash.classList.add("active-account-dir");
}

function ShowMail(mailNum) {
    for (let i = 0; i < mailRows.length; i++) {
        if (i == mailNum)
        {
            mailRows[i].classList.add("active-mail");
            mailContents[i].style.display = "grid";
            SetReadStatus(i);
        }
        else {
            mailRows[i].classList.remove("active-mail");
            mailContents[i].style.display = "none";
        }
    }
}

function GetMarkedElementIds() {
    return markableElements.filter(m => Array.from(m.classList).includes("marked")).map(m => m.id);
}

function GetMailRowNum(element) {
    return parseInt(element.id.split("-")[0].split("m")[1]);
}

function AddToCounter(element, count) {
    let rowNum = GetMailRowNum(element);
    mailRows[rowNum].children[0].innerHTML = parseInt(mailRows[rowNum].children[0].innerHTML) + count;
}

function ToggleMarking(element) {
    if (Array.from(element.classList).includes("marked")) {
        element.classList.remove("marked");
        AddToCounter(element, -1);
        SetCookie("marked", GetMarkedElementIds());
    }
    else {
        element.classList.add("marked");
        AddToCounter(element, 1);
        SetCookie("marked", GetMarkedElementIds());
    }
}

function ToggleMarkingEvent(eventSource) {
    if (!markerIsSelected) return;
    ToggleMarking(eventSource.currentTarget);
}

function ShowLinkSecurityWarning() {
    if (markerIsSelected) return;
    securityWarningLink.style.display = "block";
}

function ShowAttachmentSecurityWarning() {
    if (markerIsSelected) return;
    securityWarningAttachment.style.display = "block";
}

function ShowLinkHover(eventSource) {
    let linkHoverBox = document.getElementById(eventSource.srcElement.id + "-link-hover");
    linkHoverBox.style.display = "block";
}

function HiveLinkHover(eventSource) {
    let linkHoverBox = document.getElementById(eventSource.srcElement.id + "-link-hover");
    linkHoverBox.style.display = "none";
}

function EnableMarker(mailContent) {
    mailContent.style.cursor = "url('/static/images/marker.png'), auto";
    mailContent.style.WebkitUserSelect = "none";
    mailContent.style.MozUserSelect = "none";
    mailContent.style.msUserSelect = "none";
    mailContent.style.userSelect = "none";
    links.forEach(l => l.classList.remove("pointer-cursor"));
    attachments.forEach(l => l.classList.remove("pointer-cursor"));
}

function DisableMarker(mailContent) {
    mailContent.style.cursor = "auto";
    mailContent.style.WebkitUserSelect = null;
    mailContent.style.MozUserSelect = null;
    mailContent.style.msUserSelect = null;
    mailContent.style.userSelect = null;
    links.forEach(l => l.classList.add("pointer-cursor"));
    attachments.forEach(l => l.classList.add("pointer-cursor"));
}

function ToggleMarker() {
    if (markerIsSelected) {
        markerBtn.classList.remove("marker-btn-active");
        markerBtn.classList.add("marker-btn-inactive");
        mailContents.forEach(DisableMarker);
        markableElements.forEach(m => m.classList.remove("markable-hover"));
        markerIsSelected = false;
    }
    else {
        markerBtn.classList.add("marker-btn-active");
        markerBtn.classList.remove("marker-btn-inactive");
        mailContents.forEach(EnableMarker);
        markableElements.forEach(m => m.classList.add("markable-hover"));
        markerIsSelected = true;
    }
}

async function CheckMarked() {
    let response = await fetch("/check", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(GetMarkedElementIds())
    });
    if (!response.ok) {
        return;
    }
    let respData = await response.json();
    resultsCorrect.innerHTML = respData.correct;
    resultsIncorrect.innerHTML = respData.incorrect;
    resultsMissed.innerHTML = respData.missed;
    if (respData.flag) {
        flagBox.innerHTML = respData.flag;
        flagBox.style.display = "block";
    }
    resultsTable.style.display = "block";
}

function LoadMarkedElementsFromCookie() {
    let markedCookie = GetCookieValue("marked");
    if (markedCookie) {
        let marked = JSON.parse(markedCookie.split("marked=")[1]);
        marked.map(m => document.getElementById(m)).forEach(ToggleMarking);
    }
}

function LoadReadStatusFromCookie() {
    let readCookie = GetCookieValue("read");
    if (readCookie) {
        let read = JSON.parse(readCookie.split("read=")[1]);
        readMailNums = read;
        read.forEach(SetReadStatus);
    }
}

function SetReadStatusToInbox() {
    let numberOfUnread = mailRows.length - readMailNums.length;
    unreadNumBox.innerHTML = numberOfUnread;
    if (numberOfUnread == 0) {
        inbox.classList.remove("contains-unread");
    }
    else {
        inbox.classList.add("contains-unread");
    }
}

function Initialize() {
    LoadMarkedElementsFromCookie();
    LoadReadStatusFromCookie();
    SetReadStatusToInbox();
}

accountInbox.addEventListener("click", ShowMailBox);
accountSent.addEventListener("click", ShowSentBox);
accountTrash.addEventListener("click", ShowTrashBox);
for (let i = 0; i < mailRows.length; i++) {
    mailRows[i].addEventListener("click", () => ShowMail(i));
}
markableElements.forEach(m => m.addEventListener("click", ToggleMarkingEvent));
links.forEach(l => l.addEventListener("mouseover", ShowLinkHover));
links.forEach(l => l.addEventListener("mouseout", HiveLinkHover));
links.forEach(l => l.addEventListener("click", ShowLinkSecurityWarning));
attachments.forEach(l => l.addEventListener("click", ShowAttachmentSecurityWarning));
securityWarningLinkButton.addEventListener("click", () => securityWarningLink.style.display = "none");
securityWarningAttachmentButton.addEventListener("click", () => securityWarningAttachment.style.display = "none");
markerBtn.addEventListener("click", ToggleMarker);
checkBtn.addEventListener("click", CheckMarked);
window.onload = Initialize;