function parseTime(timeStr) {
    if (!timeStr) return null;
    let [time, period] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return new Date().setHours(hours, minutes, 0, 0);
}

function calculateTime(trElement) {
    let timeRows = trElement.querySelectorAll("tbody tr");
    let totalMilliseconds = 0;
    let currentTime = new Date().getTime();

    timeRows.forEach(row => {
        let timeInText = row.cells[0]?.innerText.trim();
        let timeOutText = row.cells[1]?.innerText.trim();

        let timeIn = parseTime(timeInText);
        let timeOut = parseTime(timeOutText) || currentTime;

        if (timeIn) {
            totalMilliseconds += (timeOut - timeIn);
        }
    });

    let totalMinutes = Math.floor(totalMilliseconds / 60000);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    let remainingMinutes = Math.max(0, 480 - totalMinutes); // 8 hours = 480 minutes
    let remainingHours = Math.floor(remainingMinutes / 60);
    let remainingMins = remainingMinutes % 60;

    return {
        totalTime: `${hours}h ${minutes}m`,
        remainingTime: `${remainingHours}h ${remainingMins}m`
    };
}

// Create tooltip popup once (global element)
const popup = document.createElement("div");
popup.style.cssText = `
    position: absolute;
    background: #fff;
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    display: none;
    width: 250px;
    font-family: Arial, sans-serif;
    z-index: 10000;
`;
popup.innerHTML = `
    <img id="popupImage" src="" style="width: 36px; height: 36px; border-radius: 50%;">
    <div style="display: inline-block; vertical-align: middle; margin-left: 10px;">
        <strong id="popupName"></strong>
    </div>
    <hr style="margin: 10px 0;">
    <p><b>Total Time:</b> <span id="popupTotalTime"></span></p>
    <p><b>Remaining:</b> <span id="popupRemainingTime"></span></p>
`;
document.body.appendChild(popup);

document.addEventListener("mouseover", (event) => {
    let tr = event.target.closest("tr");
    if (tr) {
        let times = calculateTime(tr);
        let name = document.querySelector(".account-name")?.innerText.trim();
        let imgSrc = document.querySelector(".user-avatar img")?.src;

        if (!name || !imgSrc) return;

        document.getElementById("popupName").innerText = name;
        document.getElementById("popupImage").src = imgSrc;
        document.getElementById("popupTotalTime").innerText = times.totalTime;
        document.getElementById("popupRemainingTime").innerText = times.remainingTime;

        popup.style.display = "block";
        popup.style.top = `${event.pageY + 10}px`;
        popup.style.left = `${event.pageX + 10}px`;
    }
});

document.addEventListener("mouseout", (event) => {
    if (!event.target.closest("tr")) {
        popup.style.display = "none";
    }
});
