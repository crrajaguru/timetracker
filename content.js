let dailyWorkMinutes = 480; // Default 8 hours

// Load settings
if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(['workHours'], (result) => {
        if (result.workHours) {
            dailyWorkMinutes = result.workHours * 60;
        }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.workHours) {
            dailyWorkMinutes = changes.workHours.newValue * 60;
        }
    });
}

function parseTime(timeStr) {
    if (!timeStr || !timeStr.includes(":")) return null;
    let [time, period] = timeStr.trim().split(" ");
    if (!time || !period) return null;
    let [hours, minutes] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return new Date().setHours(hours, minutes, 0, 0);
}

function calculateTime(dayRow) {
    // dayRow is the Outer TR containing the day's info
    // We need to find the nested table with class 'table-condensed' inside this row
    let nestedTable = dayRow.querySelector(".table-condensed");

    // If no nested table found (shouldn't happen based on structure, but for safety)
    // or if it has no rows
    let defaultRemaining = `${Math.floor(dailyWorkMinutes / 60)}h ${dailyWorkMinutes % 60}m`;
    if (!nestedTable) return { totalTime: "0h 0m", remainingTime: defaultRemaining };

    let timeRows = nestedTable.querySelectorAll("tbody tr");
    let totalMilliseconds = 0;
    let currentTime = new Date().getTime();

    for (let i = 0; i < timeRows.length; i++) {
        let row = timeRows[i];
        // Ensure row has enough cells
        if (row.cells.length < 2) continue;

        let timeInText = row.cells[0]?.innerText.trim();
        let timeOutText = row.cells[1]?.innerText.trim();

        // Skip rows without valid time format (e.g. headers or empty rows)
        if (!timeInText || !timeInText.includes(":")) continue;

        let timeIn = parseTime(timeInText);
        // If parseTime returned null/NaN (though current parseTime implementation returns timestamp with NaN if invalid input, let's assume valid based on includes(':'))
        // Better safety:
        if (isNaN(timeIn)) continue;

        let timeOut = parseTime(timeOutText);

        // HANDLE DUPLICATE/GHOST PUNCHES:
        // If TimeOut is missing (still active?), check if the NEXT row is a valid punch-in at the same/later time.
        // This handles the case where the machine logs a phantom "In" that gets stuck open, but a real record follows immediately.
        if (!timeOut && i + 1 < timeRows.length) {
            let nextRow = timeRows[i + 1];
            let nextTimeInText = nextRow.cells[0]?.innerText.trim();
            if (nextTimeInText && nextTimeInText.includes(":")) {
                let nextTimeIn = parseTime(nextTimeInText);
                // If the next row starts at the same time or later, assume this current row is a duplicate/error and skip it.
                if (!isNaN(nextTimeIn) && nextTimeIn >= timeIn) {
                    console.log("Skipping duplicate/broken row:", timeInText);
                    continue;
                }
            }
        }

        // If timeOut is missing, use current time
        let effectiveTimeOut = timeOut || currentTime;

        // Prevent negative time calculation (if entry is in future relative to machine/system time)
        if (effectiveTimeOut > timeIn) {
            totalMilliseconds += (effectiveTimeOut - timeIn);
        }
    }

    let totalMinutes = Math.floor(totalMilliseconds / 60000);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    let remainingMinutes = Math.max(0, dailyWorkMinutes - totalMinutes);
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
    let target = event.target;
    let tr = target.closest("tr");

    if (tr) {
        // We need to find the "Day Row" (Outer TR).
        // If we are inside the nested table (table-condensed), the closest TR is an inner row.
        // We need to go up to the nested table, and then find the TR containing that table.
        if (tr.closest(".table-condensed")) {
            tr = tr.closest(".table-condensed").closest("tr");
        }

        // If we still don't have a TR, or if this TR doesn't look like a Day Row (check for nested table presence?)
        // The Day Row should contain a .table-condensed
        if (!tr || !tr.querySelector(".table-condensed")) return;

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
    let tr = event.target.closest("tr");
    if (tr) {
        // Resolve to Day Row for consistency
        if (tr.closest(".table-condensed")) {
            tr = tr.closest(".table-condensed").closest("tr");
        }

        // Check if the mouse moved to an element inside the same Day Row
        let relatedTarget = event.relatedTarget;
        if (relatedTarget && tr && tr.contains(relatedTarget)) {
            return;
        }
        popup.style.display = "none";
    }
});
