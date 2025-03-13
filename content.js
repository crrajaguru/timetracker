function parseTime(timeStr) {
    if (!timeStr) return null; // If time is missing
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
        let timeOut = parseTime(timeOutText) || currentTime; // Use current time if TimeOut is missing
        
        if (timeIn) {
            totalMilliseconds += (timeOut - timeIn);
        }
    });

    let totalMinutes = Math.floor(totalMilliseconds / 60000);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}

document.addEventListener("mouseover", (event) => {
    let tr = event.target.closest("tr");
    if (tr) {
        let totalTime = calculateTime(tr);
        tr.title = `Total Time: ${totalTime}`;
    }
});
