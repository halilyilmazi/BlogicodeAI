# BlogicodeAI REST API + statik web arayüzü (Node.js / Express)
# Build context: ../  (Halil-Yılmaz/) — hem backend hem frontend kopyalanır.
FROM node:20-slim

WORKDIR /app

# Önce sadece bağımlılık dosyaları (Docker katman önbelleği için)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Kaynak kod: REST API (backend) + Express'in servis ettiği statik web arayüzü (frontend)
COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend
ENV PORT=3000
EXPOSE 3000
CMD ["node", "index.js"]
