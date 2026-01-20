<div align="center">
  <img src="https://raw.githubusercontent.com/django/django/master/django/contrib/admin/static/admin/img/icon-unknown.svg" width="80" height="80" alt="Medicos Backend Logo" />
  <h1>⚙️ Medicos API Engine</h1>
  <p><strong>Secure & Scalable Backend for Pharmaceutical Management</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Django-5.1.x-092E20?logo=django&logoColor=white&style=for-the-badge" alt="Django" />
    <img src="https://img.shields.io/badge/Rest_Framework-3.15-A30000?logo=django&logoColor=white&style=for-the-badge" alt="DRF" />
    <img src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white&style=for-the-badge" alt="Python" />
    <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white&style=for-the-badge" alt="SQLite" />
  </div>

  <br />

  [API Reference](#-api-architecture) •
  [Security Tracking](#-security--audit) •
  [Development Guide](#-setup--deployment)
</div>

<hr />

## 🌟 Overview

The **Medicos API Engine** is a robust RESTful API built with **Django** and **Django REST Framework (DRF)**. It serves as the central intelligence for the Medicos Dashboard, handling complex inventory logic, secure authentication, transactional billing, and automated security auditing.

### 🛡️ Security & Audit
This backend includes integrated **Access Auditing**. Every frontend interaction is heartbeated to the backend to track user-agent, IP address, and deployment hostnames, ensuring complete visibility over project distribution.

<br />

## 🚀 Core Modules

| App | Description |
| :--- | :--- |
| **👤 Users** | Staff management, role-based access (RBAC), and login auditing. |
| **💊 Medicines** | Inventory catalog, stock level monitoring, and categorization. |
| **📑 Transactions** | (Internal/Pending) Billing lifecycle and sales history tracking. |

<br />

## 🛠️ Tech Stack

- **Framework:** [Django 5.1+](https://www.djangoproject.com/)
- **API Engine:** [Django REST Framework](https://www.django-rest-framework.org/)
- **Language:** [Python 3.13+](https://www.python.org/)
- **Auth:** Token-based Authentication
- **Audit:** Custom Middleware-level Access Tracking

<br />

## 🏁 Setup & Deployment

### Prerequisites
- Python 3.13+
- Virtual Environment tool (venv/conda)

### Installation

1. **Enter the backend directory**
   ```bash
   cd djangoBackend
   ```

2. **Setup Virtual Environment**
   ```bash
   python -m venv .venv
   source .venv/Scripts/activate # Windows
   ```

3. **Install Dependencies**
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

4. **Database Initialization**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py seed_medicines # Custom seed command
   ```

5. **Run Server**
   ```bash
   python manage.py runserver
   ```

<br />

## 📂 Project Structure

```bash
djangoBackend/
├── 📂 apps/             # Domain-specific applications
│   ├── 📂 medicines/    # Inventory logic
│   └── 📂 users/        # Auth & Access Audit tracking
├── 📂 project/          # Root configuration (Settings, URLs, WSGI)
├── 📄 manage.py         # Admin entry point
└── 📄 db.sqlite3        # Local development database
```

<br />

## 📄 Copyright & License
**Copyright © 2026 Anurag Shankar Maurya. All rights reserved.**

This backend engine and its source code are **Proprietary**. Unauthorized copying, reverse engineering, or redistribution of this software is strictly prohibited.

<hr />

<div align="center">
  <sub>Developed by Anurag Shankar Maurya</sub>
</div>
