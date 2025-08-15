FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:7860/ || exit 1

CMD ["python", "app.py"]
