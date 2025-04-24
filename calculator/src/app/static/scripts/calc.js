document.addEventListener('DOMContentLoaded', function() {
    Array.from(document.getElementsByClassName('output')).forEach(element => {
        // Check if content needs scrolling
        if (element.scrollHeight > element.clientHeight) {
            element.classList.add('long-result');
        }
    });
});