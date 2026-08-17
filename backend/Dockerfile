FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make start.sh executable and set it as the container startup command
RUN chmod +x start.sh
CMD ["./start.sh"]