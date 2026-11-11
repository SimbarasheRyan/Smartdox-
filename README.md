# Smartdox

A web-based files and records management system built for the JSC Commercial Court as a final year project. Smartdox helps manage, track and retrieve court files and records securely. All data in the demo system is fictional.

## Features

- Upload and manage documents and files
- Secure user authentication with role-based access control
- Audit trail that tracks document activity
- Fast search and retrieval of records
- Document versioning and history

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django, Django REST Framework (Python) |
| Frontend | React, Vite (JavaScript) |
| Database | SQLite (development) |

## Project Structure

```
Smartdox-/
├── backend/            # Django REST API
│   ├── accounts/       # Authentication and permissions
│   ├── documents/      # Document management
│   ├── audit/          # Audit trail
│   └── smartdox/       # Project settings
└── frontend/           # React application
```

## Getting Started

Requirements: Python 3, Node.js with npm, Git.

### Backend

```
cd backend
pip install -r requirements.txt
export DJANGO_SECRET_KEY="your-own-long-random-string"
python manage.py migrate
python manage.py runserver
```

### Frontend

```
cd frontend
npm install
npm run dev
```

## Security

- The Django secret key is read from the `DJANGO_SECRET_KEY` environment variable and is not stored in the repo.
- Access is controlled by user roles, and document actions are recorded in the audit trail.

## Author

Simbarashe Maponga
GitHub: [SimbarasheRyan](https://github.com/SimbarasheRyan)
