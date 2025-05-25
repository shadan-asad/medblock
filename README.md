# MedBlock Patient Management Application

MedBlock is a simple web application for managing patient records, built with Angular 17, Bootstrap for styling, and PGlite for browser-based SQL data storage.

Live URL: https://medblock-chi.vercel.app/

## Features

*   Display a list of patients.
*   Add new patient records with form validation.
*   View details of a specific patient.
*   Edit existing patient records.
*   Delete patient records.
*   Persistence of patient data across page refreshes using IndexedDB via PGlite.
*   A basic SQL query interface (read-only) for inspecting data.

## Technologies Used

*   Angular 17+
*   Bootstrap 5+
*   PGlite (PostgreSQL in the browser)
*   TypeScript
*   HTML
*   SCSS

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (v18 or higher recommended)
*   npm (comes with Node.js)
*   Angular CLI (v17 or higher)

If you don't have Angular CLI installed globally, you can install it using npm:

```bash
sudo npm install -g @angular/cli
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
    (Note: This step is not applicable if you are already in the project directory.)

2.  **Install project dependencies:**
    ```bash
    npm install
    ```
    This will install Angular, Bootstrap, PGlite, and other necessary packages.

3.  **Ensure PGlite assets are accessible:**
    The application fetches `pglite.wasm` and `pglite.data` from the `/pglite/` path. Make sure these files are copied to your `public` directory (or equivalent static assets directory) during the build process if not handled automatically by your build setup (like Vite with Angular 17+).

## Running the Application

To start the development server, run:

```bash
ng serve
```

Open your web browser and navigate to `http://localhost:4200/`. The application will load and display the patient list.

## Database (PGlite)

MedBlock uses PGlite to provide a client-side PostgreSQL database stored in your browser's IndexedDB. The database is initialized and seeded with some mock data on the first run.

### Viewing Database in Browser

You can inspect the PGlite database using your browser's Developer Tools:

1.  Open Developer Tools (`F12`).
2.  Go to the **Application** (Chrome/Edge) or **Storage** (Firefox/Safari) tab.
3.  Expand **IndexedDB**.
4.  Find and expand the database named `medblock-db`.
5.  Select the `patients` object store to view the data.

## SQL Query Page

Navigate to the 'Query' page from the navbar. This page provides a read-only interface to execute `SELECT` SQL queries against the PGlite database.

## Project Structure

The project follows a standard Angular modular architecture:

*   `src/app/components/`: Contains reusable UI components (patient list, detail, add).
*   `src/app/services/`: Contains services for data handling and database interaction (`PatientService`, `DatabaseService`).
*   `src/app/models/`: Defines data models (`Patient`).
*   `src/app/`: Contains the main application logic and routing (`app.component`, `app.routes`, `app.config`).
*   `public/pglite/`: (Ensure PGlite assets are here or configured to be served statically).

## Further Development

*   Implement the edit functionality in `patient-detail.component` (TODO in code).
*   Add more robust form validation.
*   Implement delete confirmation.
*   Enhance the SQL query editor with syntax highlighting or more advanced features.
*   Add sorting and pagination to the patient list.
*   Implement relationships between tables (e.g., appointments).
*   Add user authentication/authorization (Note: Client-side storage like IndexedDB is not suitable for sensitive data or multi-user scenarios without a backend).
