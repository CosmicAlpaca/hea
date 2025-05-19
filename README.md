# Healthcare Management System - Microservices

This project is a microservices-based healthcare management system.

## Services

*   **API Gateway (Nginx):** Routes requests to appropriate services.
*   **Auth Service (Django):** Manages user authentication and authorization.
*   **Patient Service (Django):** Manages patient-related functionalities like appointments.
*   **Doctor Service (Django):** Manages doctor-related functionalities (e.g., viewing schedules).
*   **Chatbot Service (Django):** Provides a simple AI chatbot for general queries.
*   **Frontend (React):** User interface for interacting with the system.

## Setup and Run

1.  Ensure Docker and Docker Compose are installed.
2.  From the `healthcare_system` root directory, run:
    ```bash
    docker-compose up --build
    ```
3.  The frontend will be accessible at `http://localhost` (or `http://localhost:3000`).
    The API gateway listens on port 80.

## Important Notes
*   Default superuser for `auth_service` (if created by `docker-compose` command):
    *   Username: `admin`
    *   Password: `adminpassword`
*   **SECRET KEYS**: The `SECRET_KEY` in `auth_project/settings.py` is used for JWT signing. Other services (`patient_service`, `doctor_service`) use `AUTH_SERVICE_JWT_SECRET_KEY` in their settings to verify these JWTs. **These keys MUST match and should be replaced with strong, unique secrets managed via environment variables in a production setting.** The current default keys are placeholders and insecure.