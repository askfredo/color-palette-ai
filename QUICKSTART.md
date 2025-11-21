# Guía de Inicio Rápido

## Configuración Inicial (5 minutos)

### Paso 1: Instalar dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

### Paso 3: Configurar variables de entorno

Edita el archivo `.env` y reemplaza `your_gemini_api_key_here` con tu API key:

```env
GEMINI_API_KEY=AIzaSy...tu_api_key_aqui
```

### Paso 4: Iniciar el servidor

```bash
npm run dev
```

Deberías ver:

```
┌─────────────────────────────────────────────┐
│                                             │
│   🎨 Color Palette AI Backend API          │
│                                             │
└─────────────────────────────────────────────┘

Server running on port: 3001
Environment: development
API Base URL: http://localhost:3001/api/colors
```

## Probar el API

### Opción 1: Usando el script de prueba

```bash
./test-api.sh
```

### Opción 2: Prueba manual con cURL

```bash
# Generar un color
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Un azul océano profundo"}'
```

### Opción 3: Usando un navegador

Abre en tu navegador:
```
http://localhost:3001/api/colors/health
```

## Próximos Pasos

1. Lee la documentación completa en `README.md`
2. Revisa los ejemplos en `EXAMPLES.md`
3. Integra el API en tu aplicación Android

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is required"
- Verifica que el archivo `.env` existe en la carpeta `backend/`
- Verifica que la variable `GEMINI_API_KEY` está configurada correctamente
- Reinicia el servidor después de modificar `.env`

### Error: "Failed to generate color"
- Verifica que tu API key de Gemini es válida
- Verifica que tienes conexión a internet
- Verifica los logs del servidor para más detalles

### Puerto 3001 ya en uso
- Cambia el puerto en `.env`:
  ```env
  PORT=3002
  ```

## Contacto y Soporte

Para reportar problemas o hacer preguntas, abre un issue en el repositorio.
