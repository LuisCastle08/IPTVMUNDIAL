# HOLA ESTE ES UN PRUEBA DE REPRODUCTOR DE TV GRATUITO 
# Fue hecho con Angular +20 y Node.js
los enlaces que se muestran fueron obtenidos del repositorio  [iptv-org](https://github.com/iptv-org/iptv).

## Estructura del proyecto

```
iptv-platform/
├── backend/
│   ├── controllers/
│   │   └── channels.controller.js   
│   ├── routes/
│   │   └── channels.routes.js     
│   ├── .env                         
│   ├── app.js                       
│   ├── package.json
│   └── server.js                    
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── channel-list/  
    │   │   │   └── player/         
    │   │   ├── models/
    │   │   │   └── channel.model.ts 
    │   │   ├── services/
    │   │   │   └── channels.service.ts 
    │   │   ├── app.component.*     
    │   ├── environments/
    │   ├── index.html
    │   ├── main.ts                  
    │   └── styles.css              
    ├── angular.json
    ├── package.json
    ├── proxy.conf.json              ← Proxy dev → backend :3000
    └── tsconfig.json
```

---

## Inicio rápido (Desarrollo local)

### Requisitos previos
- Node.js >= 18
- npm >= 9
- Angular CLI v20: `npm install -g @angular/cli@20`
# RECOMIENDO DESCARGAR EL REPOSITORIO Y LUEGO SEPARAR LAS CARPETAS FRONT-END Y BACK-END

### 1. Backend

```bash
cd backend
npm install
npm run dev          # Nodemon en http://localhost:3000
```

Endpoints disponibles:
| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/countries` | Lista de países disponibles |
| GET | `/api/channels/:country` | Canales del país (ej: `mx`, `us`, `es`) |
| GET | `/api/channels/:country?group=News` | Filtrado por categoría |
| GET | `/api/channels/:country?page=2&limit=50` | Paginación |

### 2. Frontend

```bash
cd frontend
npm install
npm start            # Angular DevServer en http://localhost:4200

o

ng s -h 0.0.0.0

Ese se utiliza para que los dispositivos en la misma red puedan entrar a la web
http... + IP del equipo + : 4200
http.//192.168.x.x:4200

```

El `proxy.conf.json` redirige `/api/*` → `http://localhost:3000` automáticamente.
