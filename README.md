# 📺 IPTV Platform

Plataforma web de IPTV con listas públicas del repositorio [iptv-org](https://github.com/iptv-org/iptv).

- **Backend**: Express.js (Node.js, CommonJS, patrón MVC)
- **Frontend**: Angular 20 (Standalone Components, Signals, HLS.js)

---

## 📁 Estructura del proyecto

```
iptv-platform/
├── backend/
│   ├── controllers/
│   │   └── channels.controller.js   ← Parser M3U + llamadas a iptv-org
│   ├── routes/
│   │   └── channels.routes.js       ← Definición de rutas REST
│   ├── .env                         ← Variables de entorno (no subir a git)
│   ├── app.js                       ← Configuración Express + middlewares
│   ├── package.json
│   └── server.js                    ← Punto de entrada
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── channel-list/    ← Lista de canales con búsqueda y filtros
    │   │   │   └── player/          ← Reproductor HLS.js
    │   │   ├── models/
    │   │   │   └── channel.model.ts ← Interfaces TypeScript
    │   │   ├── services/
    │   │   │   └── channels.service.ts ← HTTP + Signals de estado
    │   │   ├── app.component.*      ← Layout raíz (2 columnas)
    │   ├── environments/
    │   ├── index.html
    │   ├── main.ts                  ← Bootstrap standalone
    │   └── styles.css               ← CSS global
    ├── angular.json
    ├── package.json
    ├── proxy.conf.json              ← Proxy dev → backend :3000
    └── tsconfig.json
```

---

## 🚀 Inicio rápido (Desarrollo local)

### Requisitos previos
- Node.js >= 18
- npm >= 9
- Angular CLI v20: `npm install -g @angular/cli@20`

### 1. Backend

```bash
cd backend
npm install
npm run dev          # Nodemon en http://localhost:3000
```

Endpoints disponibles:
| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/health` | Health check |
| GET | `/api/countries` | Lista de países disponibles |
| GET | `/api/channels/:country` | Canales del país (ej: `mx`, `us`, `es`) |
| GET | `/api/channels/:country?group=News` | Filtrado por categoría |
| GET | `/api/channels/:country?page=2&limit=50` | Paginación |

### 2. Frontend

```bash
cd frontend
npm install
npm start            # Angular DevServer en http://localhost:4200
```

El `proxy.conf.json` redirige `/api/*` → `http://localhost:3000` automáticamente.

---

## 🔧 Variables de entorno (Backend)

Edita `backend/.env`:

```env
PORT=3000
IPTV_ORG_BASE_URL=https://iptv-org.github.io/iptv/countries
ALLOWED_ORIGINS=http://localhost:4200
```

Para producción, cambia `ALLOWED_ORIGINS` a tu dominio real.

---

## 🏗️ Build de producción

### Backend
```bash
cd backend
node server.js       # O usa PM2: pm2 start server.js --name iptv-api
```

### Frontend
```bash
cd frontend
npm run build:prod   # Genera dist/iptv-platform-frontend/
```

Sirve el contenido de `dist/` con Nginx o cualquier servidor estático.

---

## 🌐 Notas sobre los streams

- Las listas M3U provienen de [iptv-org.github.io/iptv](https://iptv-org.github.io/iptv/).
- Algunos streams pueden estar temporalmente caídos o requerir VPN según la región.
- HLS.js maneja automáticamente el adaptive bitrate (ABR).
- Para streams `.ts` directos (no `.m3u8`), HLS.js también los soporta si el servidor envía el Content-Type correcto.

---

## 📋 API Response Format

```json
{
  "success": true,
  "country": "mx",
  "m3uUrl": "https://iptv-org.github.io/iptv/countries/mx.m3u",
  "total": 183,
  "page": 1,
  "limit": 200,
  "totalPages": 1,
  "groups": ["Cine", "Deportes", "Entretenimiento", "Noticias", ...],
  "channels": [
    {
      "id": "Canal5.mx",
      "name": "Canal 5",
      "logo": "https://...",
      "group": "Entretenimiento",
      "country": "MX",
      "language": "Spanish",
      "url": "https://stream.example.com/canal5.m3u8"
    }
  ]
}
```
