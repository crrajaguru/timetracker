document.addEventListener('DOMContentLoaded', () => {
    const workHoursInput = document.getElementById('workHours');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['workHours'], (result) => {
        if (result.workHours) {
            workHoursInput.value = result.workHours;
        }
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
        const hours = parseInt(workHoursInput.value, 10);
        if (hours > 0 && hours <= 24) {
            chrome.storage.sync.set({ workHours: hours }, () => {
                status.textContent = 'Saved!';
                setTimeout(() => {
                    status.textContent = '';
                }, 2000);
            });
        } else {
            status.style.color = 'red';
            status.textContent = 'Invalid hours';
        }
    });
});
