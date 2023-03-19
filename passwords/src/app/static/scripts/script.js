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

document.getElementById("js-warning").style.display = "none";