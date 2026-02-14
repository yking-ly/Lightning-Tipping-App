# Dockerfile for Backend
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY .env .env

WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]
