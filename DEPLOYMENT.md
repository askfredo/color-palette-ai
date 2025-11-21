# Guía de Despliegue

## Opciones de Despliegue

### Opción 1: Railway (Recomendado - Gratis para comenzar)

Railway es perfecto para Node.js y tiene integración automática con GitHub.

#### Pasos:

1. Crea una cuenta en [Railway.app](https://railway.app/)

2. Instala Railway CLI (opcional):
   ```bash
   npm i -g @railway/cli
   ```

3. Desde tu proyecto:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

4. Configura las variables de entorno en Railway dashboard:
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` (tu dominio frontend)

5. Railway te dará una URL automática como: `https://tu-proyecto.up.railway.app`

### Opción 2: Render

Render ofrece hosting gratuito para APIs.

#### Pasos:

1. Crea una cuenta en [Render.com](https://render.com/)

2. Crea un nuevo "Web Service"

3. Conecta tu repositorio de GitHub

4. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `GEMINI_API_KEY`
     - `NODE_ENV=production`

5. Deploy automático cada vez que hagas push

### Opción 3: Vercel

Vercel soporta funciones serverless de Node.js.

#### Pasos:

1. Instala Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Desde el directorio `backend/`:
   ```bash
   vercel
   ```

3. Configura variables de entorno:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

4. Crea `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/server.js"
       }
     ]
   }
   ```

### Opción 4: VPS (DigitalOcean, AWS EC2, etc.)

Para mayor control y escalabilidad.

#### Pasos:

1. Crea un droplet/instancia con Ubuntu

2. Instala Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clona tu repositorio:
   ```bash
   git clone tu-repo.git
   cd backend
   npm install
   npm run build
   ```

4. Instala PM2 para mantener el proceso activo:
   ```bash
   sudo npm install -g pm2
   pm2 start dist/server.js --name color-palette-api
   pm2 startup
   pm2 save
   ```

5. Configura Nginx como reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. Configura SSL con Let's Encrypt:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```

### Opción 5: Docker

Containeriza tu aplicación para despliegue consistente.

#### Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### .dockerignore:

```
node_modules
npm-debug.log
.env
dist
```

#### Construir y ejecutar:

```bash
# Construir imagen
docker build -t color-palette-api .

# Ejecutar container
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=tu_api_key \
  -e NODE_ENV=production \
  color-palette-api
```

#### Docker Compose:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://tu-frontend.com
    restart: unless-stopped
```

## Configuración de Producción

### Variables de Entorno

Asegúrate de configurar estas variables en producción:

```env
# Server
PORT=3001
NODE_ENV=production

# Gemini API
GEMINI_API_KEY=tu_api_key_real

# CORS
ALLOWED_ORIGINS=https://tu-frontend.com,https://www.tu-frontend.com

# Upload
MAX_FILE_SIZE=5242880
```

### Seguridad

1. **Nunca commitees el archivo `.env`** - Usa `.gitignore`

2. **Usa HTTPS en producción** - Configura SSL/TLS

3. **Configura CORS correctamente** - Solo permite orígenes confiables

4. **Rate limiting** (opcional):
   ```bash
   npm install express-rate-limit
   ```

   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // límite de 100 requests
   });

   app.use('/api/', limiter);
   ```

5. **Monitoreo y logging** - Implementa herramientas como:
   - Sentry (errores)
   - LogRocket (sesiones)
   - Winston (logs estructurados)

### Optimizaciones

1. **Compresión**:
   ```bash
   npm install compression
   ```

   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Caché** con Redis:
   ```bash
   npm install redis
   ```

   ```typescript
   import { createClient } from 'redis';

   const redis = createClient();
   await redis.connect();

   // Cache color generations
   const cached = await redis.get(`color:${description}`);
   if (cached) return JSON.parse(cached);
   ```

3. **CDN** - Usa un CDN para servir assets estáticos

## Monitoreo

### Health Checks

Configura health checks en tu plataforma:

```
GET https://tu-api.com/api/colors/health
```

Debe responder `200 OK` con:
```json
{
  "success": true,
  "message": "Color Palette AI API is running",
  "timestamp": "..."
}
```

### Alertas

Configura alertas para:
- Tiempo de respuesta > 5s
- Tasa de errores > 5%
- Uso de CPU > 80%
- Uso de memoria > 90%

## Costos Estimados

### Railway (Tier Gratis)
- $0/mes hasta 500 horas
- Perfecto para comenzar

### Render (Tier Gratis)
- $0/mes
- 750 horas/mes gratis

### DigitalOcean
- Desde $6/mes (droplet básico)
- Escalable según necesidad

### AWS EC2
- Desde $3.5/mes (t3.micro)
- 12 meses gratis con cuenta nueva

## Dominio Personalizado

1. Compra un dominio en:
   - Namecheap
   - Google Domains
   - Cloudflare

2. Configura DNS:
   ```
   A record: @ -> IP del servidor
   A record: api -> IP del servidor
   ```

3. Tu API estará en: `https://api.tu-dominio.com`

## Backup y Recuperación

Aunque el backend es stateless (no tiene DB), considera:

1. **Backup del código** - GitHub/GitLab
2. **Variables de entorno** - Vault o gestores de secretos
3. **Logs** - Centraliza con CloudWatch, Papertrail, etc.

## Checklist de Deployment

- [ ] Código compilado sin errores (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] CORS configurado para producción
- [ ] SSL/HTTPS habilitado
- [ ] Health check funcionando
- [ ] Rate limiting configurado (opcional)
- [ ] Monitoreo configurado
- [ ] Logs centralizados
- [ ] Dominio personalizado configurado (opcional)
- [ ] Documentación actualizada con nueva URL

## Testing en Producción

Después del deployment, prueba con:

```bash
# Health check
curl https://tu-api.com/api/colors/health

# Generate color
curl -X POST https://tu-api.com/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Un azul océano profundo"}'

# Recommendations
curl -X POST https://tu-api.com/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{"style": "professional", "count": 2}'
```

## Soporte y Troubleshooting

### Problema: "Cannot connect to API"
- Verifica que el servidor esté corriendo
- Verifica firewall y reglas de seguridad
- Verifica configuración de CORS

### Problema: "GEMINI_API_KEY not found"
- Verifica variables de entorno en plataforma
- Verifica que `.env` no está en `.gitignore` para producción

### Problema: "Rate limit exceeded" (Gemini)
- Implementa caché para reducir llamadas
- Considera upgrade del plan de Gemini
- Implementa rate limiting en tu API

---

**¡Tu API está lista para producción!** 🚀

Elige la opción de deployment que mejor se ajuste a tus necesidades.
