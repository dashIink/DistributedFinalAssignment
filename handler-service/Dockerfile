FROM python:3.11.6-slim

RUN pip install --upgrade pip

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY src/ .

ENTRYPOINT ["python", "./main.py"]