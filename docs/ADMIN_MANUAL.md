# AmpShare Administrator Manual

## Introduction

This manual is intended for administrators of the AmpShare application. It covers administrative tasks such as user management, apartment management, system configuration, and monitoring.

Access to administrative features typically requires an account with the 'admin' role.

## 1. Accessing the Admin Panel

Administrative functions are usually grouped within an Admin Panel or a dedicated section of the application.

*   **URL**: The admin panel might be accessible via a specific path, such as `/admin` or `/admin/dashboard`.
*   **Login**: You must log in with an administrator account.

## 2. User Management

Administrators are responsible for managing user accounts within AmpShare.

### 2.1. Viewing Users

*   Navigate to the user management section (e.g., `/admin/users`).
*   Here you will see a list of all registered users, typically including their username, name, email, assigned apartment, and role.
*   Search and filter functionalities may be available to quickly find specific users.

### 2.2. Creating New Users

1.  Go to the user creation form (often an "Add User" or "Invite User" button).
2.  Fill in the required user details:
    *   **Username**: A unique identifier for the user to log in.
    *   **Full Name**: The user's display name.
    *   **Email** (Optional but recommended): For notifications or password recovery.
    *   **Initial Password**: Set a strong temporary password.
    *   **Apartment ID**: Assign the user to an existing apartment.
    *   **Role**: Assign a role (e.g., 'user' or 'admin').
    *   **Force Password Change**: It is highly recommended to check this option, requiring the user to change their password upon first login.
3.  Submit the form to create the user account.

*(Backend Reference: `createUser` function in `src/lib/db.ts`)*

### 2.3. Editing User Details

1.  From the user list, select the user you wish to edit.
2.  You can typically update:
    *   Full Name
    *   Email
    *   Apartment Assignment
    *   Role
    *   Force Password Change status
3.  Save the changes.

*(Backend Reference: `updateUser` function in `src/lib/db.ts`)*

### 2.4. Resetting User Passwords

If a user forgets their password, an administrator can reset it:

1.  Find the user in the user management section.
2.  Select the option to reset the password.
3.  Provide a new temporary password.
4.  It is strongly recommended to also enable "Force Password Change" so the user must set a new private password on their next login.
5.  Communicate the temporary password securely to the user.

*(Backend Reference: `updateUser` function in `src/lib/db.ts`, specifically updating the password field)*

### 2.5. Deleting Users

1.  Locate the user to be deleted.
2.  Select the delete option. You may be asked to confirm this action.
3.  **Caution**: Deleting a user is often irreversible and may have implications for their past schedule entries or other associated data (though current DB schema uses `FOREIGN KEY` constraints that might restrict deletion if user has related records, or cascade if configured).

*(Backend Reference: `deleteUser` function in `src/lib/db.ts`)*

## 3. Apartment Management

Administrators can manage the apartment entities within the system.

### 3.1. Viewing Apartments

*   A section in the admin panel (e.g., `/admin/apartments`) should list all configured apartments.

### 3.2. Creating New Apartments

1.  Navigate to the apartment creation form.
2.  Enter the required details:
    *   **Apartment ID (Optional)**: A unique identifier (e.g., 'stensvoll', 'nowak'). If not provided, one may be auto-generated.
    *   **Apartment Name**: A descriptive name (e.g., "Stensvoll Household", "Nowak Residence").
3.  Submit the form.

*(Backend Reference: `createApartment` function in `src/lib/db.ts`)*

### 3.3. Editing Apartment Details

1.  Select the apartment to edit.
2.  Currently, only the apartment `name` is typically editable.
3.  Save changes.

*(Backend Reference: `updateApartment` function in `src/lib/db.ts`)*

### 3.4. Deleting Apartments

1.  Select the apartment to delete.
2.  Confirm the action.
3.  **Caution**: Deleting an apartment may be restricted if users are still assigned to it or if it has associated schedule entries. The system should provide appropriate warnings or prevent deletion in such cases.

*(Backend Reference: `deleteApartment` function in `src/lib/db.ts`)*

## 4. Appliance Management

Administrators may need to manage the list of available appliances.

### 4.1. Viewing Appliances
*   Access the appliance management section (e.g., `/admin/appliances`).
*   This will display a list of all configured appliances with their IDs, names, and icons.

### 4.2. Adding New Appliances
1.  Go to the appliance creation form.
2.  Provide:
    *   **Appliance ID**: A unique ID (e.g., 'car_charger_2', 'air_conditioner').
    *   **Appliance Name**: A user-friendly name (e.g., "Second Car Charger", "Living Room AC").
    *   **Icon** (Optional): An emoji or icon representation.
3.  Submit to add the appliance.

*(Backend Reference: `createAppliance` function in `src/lib/db.ts`)*

### 4.3. Editing Appliances
1.  Select an appliance from the list.
2.  You can typically update the `name` and `icon`.
3.  Save changes.

*(Backend Reference: `updateAppliance` function in `src/lib/db.ts`)*

### 4.4. Deleting Appliances
1.  Select an appliance to delete.
2.  Confirm the action.
3.  **Caution**: Deleting an appliance might be restricted if it's part of existing schedule entries. Consider implications before deleting.

*(Backend Reference: `deleteAppliance` function in `src/lib/db.ts`)*

## 5. Schedule & Conflict Management (Admin Overview)

While users manage their own schedules, administrators have a broader view and override capabilities.

### 5.1. Viewing All Schedules
*   Administrators can typically access the [Combined Schedule Display](#) (e.g., `/schedule/combined`) to see all bookings across all apartments.
*   Filtering options should allow admins to narrow down views by apartment, user, or appliance.

### 5.2. Managing Conflicts
*   A dedicated conflict management page (e.g., `/admin/conflicts` or integrated into the combined schedule) allows admins to view all detected scheduling conflicts.
*   For each conflict, details like involved entries, conflict type, and suggested resolutions (if any) should be visible.
*   **Resolving Conflicts**: Administrators can:
    *   Accept AI-suggested resolutions.
    *   Manually edit or delete schedule entries involved in the conflict.
    *   Mark conflicts as 'resolved' or 'ignored' with optional notes.

*(Backend Reference: CRUD operations for `ScheduleEntry` and `Conflict` in `src/lib/db.ts`)*

### 5.3. Manually Adjusting Schedules
*   Administrators may have privileges to directly edit or delete any user's schedule entries if necessary (e.g., to resolve persistent conflicts or accommodate emergencies).

## 6. System Configuration (Conceptual)

Depending on the application's complexity, there might be a system configuration panel for administrators. This could include:

*   **Conflict Rules**: Parameters for conflict detection (e.g., maximum concurrent appliance power draw, peak hour definitions).
*   **AI Integration**: Settings for any AI-powered features (if applicable).
*   **Notification Settings**: Default notification settings or templates.
*   **Database Connection**: (More advanced) Settings related to the database, though for SQLite this is simpler.

These settings would likely be stored in configuration files or a dedicated section of the database.

## 7. Monitoring and Logs

Administrators should be aware of how to monitor the application's health and access logs.

*   **Application Logs**: If running via Docker Compose (as per `INSTALLATION_DOCKER_COMPOSE.md`), logs can be accessed using `docker-compose logs -f app`.
*   **System Metrics**: Depending on the deployment, tools for monitoring CPU, memory, and network usage might be available.
*   **Error Tracking**: Integration with error tracking services (e.g., Sentry) can provide proactive alerts for application errors.

## 8. Database Management (SQLite)

AmpShare uses an SQLite database, which is file-based.

*   **Location**: The database file (`ampshare.db`) is typically stored in a `data` directory within the application root (e.g., `/app/data/ampshare.db` inside the Docker container, persisted via a volume).
*   **Backup**: Regular backups of the `ampshare.db` file are crucial. The method depends on your deployment environment.
    *   If using Docker volumes, ensure the volume itself is part of your backup strategy.
    *   You can manually copy the `ampshare.db` file when the application is not actively writing to it, or use SQLite's `.backup` command if direct access is possible.
*   **Schema Migrations**: As the application evolves, database schema changes (migrations) might be necessary. These are currently defined in the `initializeDb` function in `src/lib/db.ts`. For more complex changes, a formal migration tool/scripts would be introduced.

## 9. Security Considerations for Administrators

*   **Strong Passwords**: Use strong, unique passwords for administrator accounts.
*   **Principle of Least Privilege**: Only grant admin rights to users who absolutely require them.
*   **Regularly Review Admin Accounts**: Ensure admin accounts are still necessary and active.
*   **JWT Secrets**: As mentioned in the installation guide, `JWT_SECRET` and `NEXTAUTH_SECRET` in `docker-compose.yml` (or your `.env` file) **MUST** be changed from defaults and kept secure.
*   **Keep Software Updated**: Ensure the operating system, Docker, Node.js, and all application dependencies are regularly updated to patch security vulnerabilities.

---

This Admin Manual provides guidance on common administrative tasks. For technical details on deployment, refer to the `INSTALLATION_DOCKER_COMPOSE.md`.
