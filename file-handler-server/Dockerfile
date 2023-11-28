# Use an official Python runtime as a parent image
FROM python:3.11.5-slim as builder

# Set environment variables to non-interactive
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt

# Use an official Python runtime as a parent image for the final build
FROM python:3.11.5-slim

# Create directory for the app user
RUN mkdir -p /home/app

# Create the app user
RUN groupadd -r app && \
    useradd -r -g app -d /home/app -s /sbin/nologin -c "Docker image user" app

# Set work directory
WORKDIR /home/app

# Install dependencies
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy project
COPY . .

# Chown all the files to the app user
RUN chown -R app:app /home/app

# Change to the app user
USER app

# Run the application
CMD ["python", "FileServer.py"]
