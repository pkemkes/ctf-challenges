var clock = document.getElementById("time");

function UpdateClock() {
    var now = new Date();
    var time = now.getHours() + ":" + now.getMinutes().toString().padStart(2, "0");
    let clockTime = clock.innerHTML;
    if (clockTime != time) {
        clock.innerHTML = time;
    }
}

UpdateClock();
setInterval(UpdateClock, 1000);

document.getElementById("js-warning").style.display = "none";