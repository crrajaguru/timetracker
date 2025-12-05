# Time Tracker for HRStop

A Chrome extension designed to help employees track their work hours on the HRStop portal. It automatically calculates total work time and remaining time for the day based on IN/OUT punches.

## Features

- **Automatic Calculation**: Instantly calculates total hours worked and remaining hours to reach your daily target.
- **Hover Tooltip**: Simply hover over any day's row in the attendance table to see a popup with your progress.
- **Configurable Work Hours**: Set your own daily work hour target (default is 8 hours) via the extension settings.
- **Smart Detection**: Correctly handles multiple punch-ins and punch-outs for a single day.

## Installation

1.  Clone or download this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click on **Load unpacked**.
5.  Select the directory containing this extension's files.

## Usage

1.  Log in to your **HRStop** account.
2.  Navigate to the Attendance page.
3.  **Hover** your mouse over any date row in the attendance table.
4.  A tooltip will appear showing:
    *   **Total Time**: The total duration you have worked so far that day.
    *   **Remaining**: How many hours/minutes are left to complete your daily target.

## Configuration

To change your daily work hour target:
1.  Click the **Time Tracker** extension icon in the Chrome toolbar.
2.  Enter your desired hours (e.g., 9) in the input field.
3.  Click **Save**.
4.  The calculation will update automatically on your next hover.
