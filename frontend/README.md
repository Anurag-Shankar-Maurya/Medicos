# Frontend — Local backend integration ✅

Quick steps to run the frontend against the Django backend:

1. Install backend dependencies (in your Python env):
   - pip install django-cors-headers
2. Run backend migrations (adds token table):
   - python manage.py migrate
3. Start the Django server:
   - python manage.py runserver 0.0.0.0:8000
4. Configure the frontend env (already added `.env`):
   - VITE_API_URL (defaults to http://127.0.0.1:8000/api)
   - VITE_USE_MOCK (set to `false` to use the real backend)
5. Start the frontend:
   - npm run dev

What I changed:
- Backend: enabled `rest_framework.authtoken`, added basic CORS (`django-cors-headers`) and return `token` on login.
- Frontend: `apiClient` now reads `VITE_API_URL` and `VITE_USE_MOCK`; it uses `Token <token>` auth header.

Notes:
- After changing `VITE_USE_MOCK` to `false`, the app's login will call `POST /api/users/auth/login/` and expect `{"token": "<token>", "user": {...}}`.
- If you want me to switch to JWT (SimpleJWT) instead, I can do that instead of DRF token.
