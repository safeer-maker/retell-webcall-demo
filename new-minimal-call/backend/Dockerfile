FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
# Build context is backend/, so requirements.txt is at root of context
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of backend source
COPY . /app

EXPOSE 7000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python -c "import urllib.request,sys; \
    urllib.request.urlopen('http://localhost:7000/health') or sys.exit(1)"

CMD ["python", "main.py"]
