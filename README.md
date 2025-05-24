# MedBlock - Patient Registration System

A frontend-only patient registration application built with Angular, Bootstrap, and Pglite for persistent, synchronized data storage.

## Features

- Patient Registration and Management
- Raw SQL Query Interface
- Persistent Local Storage
- Multi-Tab Synchronization

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medblock
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Navigate to `http://localhost:4200` in your browser.

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── database.service.ts
│   │   │   └── sync.service.ts
│   │   └── guards/
│   ├── features/
│   │   ├── patient/
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── sql-query/
│   │       ├── components/
│   │       └── services/
│   ├── shared/
│   │   ├── components/
│   │   ├── models/
│   │   └── utils/
│   └── app.component.ts
```

## Development

### Running Tests

```bash
ng test
```

### Building for Production

```bash
ng build
```

## Technologies Used

- Angular 17
- Bootstrap 5
- Pglite
- RxJS
- TypeScript

## License

This project is licensed under the MIT License.
