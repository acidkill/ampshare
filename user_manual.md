# AmpShare User Manual

## Getting Started

Welcome to AmpShare! This manual will guide you through setting up and using the key features of the platform.

### Prerequisites

Before you begin, ensure you have the following:

*   A modern web browser (Chrome, Firefox, Safari, Edge)
*   An active user account (provided by your administrator)

### Logging In

1.  Open your web browser and navigate to the application's login page (typically found at the `/login` path).
2.  Enter your username and password in the provided fields.
3.  Click the "Login" button.

If you encounter issues logging in, please contact your administrator or refer to the [Troubleshooting](#troubleshooting) section.

### Changing Your Password

For security reasons, it is recommended to change your password after your initial login, especially if `forcePasswordChange` was set for your account.

1.  Navigate to the settings page (usually at the `/settings` path).
2.  Locate the "Password Change" section.
3.  Enter your current password.
4.  Enter your new password and confirm it.
5.  Click the "Change Password" button.

## Key Features

The application offers several key features to help you manage shared appliance usage efficiently.

### Dashboard

The Dashboard (accessible at the `/` path or `/dashboard`) provides an overview of your important information and quick access to frequently used features. The specific content of the dashboard may vary depending on your user role and ongoing activities.

### Scheduling Interface

The primary scheduling interface allows you to manage and view appliance usage for your apartment.

*   **Accessing Schedules**: Navigate to the `/schedule` page. You will typically see a view for your assigned apartment.
*   **Apartment Filtering**: If applicable and you have access to multiple views, use the Apartment Filter to select the specific apartment schedule you wish to view or manage.
*   **Appliance Selection**: Use the Appliance Selector (e.g., `ApplianceSelector.tsx`) to choose the appliance (Washer, Dryer, Dishwasher, Car Charger, etc.) for which you want to view or book time slots.
*   **Weekly View**: Schedules are generally displayed in a weekly grid format (e.g., `ScheduleGrid.tsx`). Each day is divided into hourly time slots (e.g., `TimeSlot.tsx`).
*   **Booking Time Slots**: Click on an available time slot for the selected appliance to book it. Your bookings will be associated with your user account.

### Combined Schedule Display

To get a comprehensive view of appliance usage across all managed apartments, AmpShare provides a Combined Schedule Display.

*   **Accessing**: Navigate to the `/schedule/combined` page (e.g., `CombinedScheduleView.tsx`).
*   **Purpose**: This view shows a merged schedule from all apartments, helping to identify potential conflicts or peak usage times.
*   **Color-Coding**: Bookings are color-coded, typically by apartment or user, to make it easy to distinguish between different households' usage.
*   **Legend**: A legend is provided to help you understand the color-coding scheme.
*   **Conflict Visualization**: This view may also highlight potential scheduling conflicts (see [Conflict Detection & Resolution](#conflict-detection--resolution)).

### Conflict Detection & Resolution

AmpShare aims to minimize scheduling conflicts and help resolve them when they occur.

*   **Conflict Detection**: The system automatically detects potential conflicts, such as:
    *   Multiple bookings for the same appliance at the same time within an apartment.
    *   Potential power overloads if too many high-consumption appliances are scheduled concurrently across apartments (based on system rules).
*   **Visualization**: Conflicts are typically visualized on the Combined Schedule Display or a dedicated `/conflicts` page.
*   **AI-Powered Recommendations**: The system may use AI (placeholder for now) to provide suggestions for resolving conflicts (e.g., suggesting alternative time slots).
*   **Manual Override**: Users, especially administrators, may have the ability to manually override or adjust schedules to resolve conflicts after reviewing the situation.

### Real-time Alerts & Notifications

AmpShare provides real-time alerts to keep you informed about appliance usage and important events.

*   **Appliance Start/Stop**: You might receive notifications when a scheduled appliance usage begins or ends.
*   **Potential Overloads**: If concurrent appliance usage across apartments is approaching a configured limit, you may receive a warning.
*   **Conflict Notifications**: Alerts regarding new or unresolved scheduling conflicts.
*   **Delivery**: Alerts are typically displayed as on-screen notifications (e.g., toasts or banners).
*   **Preferences**: You may be able to customize your alert preferences in the `/settings` page.

### Settings

The Settings page (found at the `/settings` path) allows you to customize various aspects of your user experience, including password changes and potentially alert preferences or theme settings.

### User Administration (Admin Only)

If you have administrative privileges, you can access the User Administration page (typically at `/admin/users` or similar) to manage user accounts, onboard new users, and manage apartment assignments. Detailed instructions for administrators are available in the Admin Manual.

## Troubleshooting

This section addresses common issues you might encounter.

### Unable to Log In

*   **Check your credentials:** Ensure you are using the correct username and password. Passwords are case-sensitive.
*   **Verify Caps Lock:** Make sure the Caps Lock key is not accidentally enabled.
*   **Contact Administrator:** If you have forgotten your password or your account is locked, contact your system administrator for assistance.

### Page Not Loading Correctly

*   **Refresh the page:** Try refreshing your browser window.
*   **Clear browser cache:** Clear your browser's cache and cookies and try accessing the page again.
*   **Try a different browser:** Test if the issue persists in another supported web browser.

### Issues with Specific Features

If you are experiencing problems with a particular feature, refer to the relevant section in this manual. If the issue is not addressed, contact support with details of the problem, including the page you were on and the steps you took.

### Reporting Bugs

If you discover a bug or unexpected behavior, please report it to your administrator or support team. Provide as much detail as possible, including:

*   The steps to reproduce the bug.
*   The expected outcome.
*   The actual outcome.
*   Your browser and operating system.

---

This user manual provides a general overview of the AmpShare application. Specific features and their availability may vary depending on your user role and system configuration.
