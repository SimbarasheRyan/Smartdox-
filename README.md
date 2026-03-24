Smartdox 📁⚖️
A web-based Files and Records Management System developed for the JSC Commercial Court. Smartdox streamlines the management, tracking, and retrieval of court files and records in a secure and efficient manner.
🚀 Features
Upload and manage court documents and files
Secure user authentication and role-based access control
Audit trail for tracking document activity
Search and retrieve records quickly
Document versioning and history
🛠️ Tech Stack
Layer
Technology
Backend
Django (Python)
Frontend
React (JavaScript)
Database
SQLite (development)
API
Django REST Framework
📁 Project Structure
Smartdox/
├── backend/        # Django REST API
│   ├── accounts/   # User authentication & permissions
│   ├── documents/  # Document management
│   ├── audit/      # Audit trail
│   └── smartdox/   # Project settings
└── frontend/       # React application
⚙️ Getting Started
Prerequisites
Python 3.x
Node.js & npm
Git
Backend Setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
Frontend Setup
cd frontend
npm install
npm run dev
🔐 Environment Variables
Create a .env file in both backend/smartdox/ and frontend/ with the required environment variables. See .env.example for reference.
👨‍💻 Author
Simbarashe Ryan
Final Year Project — JSC Commercial Court
📄 License
This project was developed as a final year project for the JSC Commercial Court. All rights reserved.O

