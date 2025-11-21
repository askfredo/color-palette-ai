# 🎨 Backend Color Palette AI - Resumen del Proyecto

## Lo que se ha creado

He desarrollado un **backend completo y profesional** para tu aplicación de paletas de colores con inteligencia artificial usando **Gemini 2.5 Flash**.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   └── colorController.ts       # Controladores de endpoints
│   ├── services/
│   │   └── geminiService.ts         # Servicio de integración con Gemini AI
│   ├── utils/
│   │   ├── colorUtils.ts            # Utilidades de conversión de colores
│   │   └── validators.ts            # Validadores y manejo de errores
│   ├── types/
│   │   └── index.ts                 # Definiciones TypeScript
│   ├── routes/
│   │   └── colorRoutes.ts           # Rutas de Express
│   └── server.ts                    # Servidor principal
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript
├── .env                             # Variables de entorno
├── .env.example                     # Plantilla de variables
├── .gitignore                       # Archivos a ignorar en git
├── README.md                        # Documentación completa
├── EXAMPLES.md                      # Ejemplos de uso detallados
├── QUICKSTART.md                    # Guía de inicio rápido
├── test-api.sh                      # Script de pruebas
└── SUMMARY.md                       # Este archivo
```

## Características Implementadas

### ✅ A. Generación de Colores desde Descripción Natural

**Endpoint:** `POST /api/colors/generate`

El usuario puede describir un color en lenguaje natural y la IA lo genera:

**Ejemplos:**
- "Un verde menta más suave pero con tono pastel" → `#B4E7CE`
- "Un rojo Ferrari pero un poco más oscuro" → `#B80000`
- "Color que se sienta como amanecer cálido en la playa" → `#FFB366`

**Respuesta incluye:**
- Color en HEX, RGB, HSL
- 4 variaciones (más claro, más oscuro, más saturado, menos saturado)
- Descripción del color generado
- Nivel de confianza de la IA

### ✅ B. Extracción de Paletas desde Imágenes

**Endpoint:** `POST /api/colors/extract-palette`

Analiza imágenes y extrae paletas armónicas con diferentes modos:

**Modos disponibles:**
- `pastel` - Colores suaves, delicados
- `vibrant` - Colores saturados, llamativos
- `vintage` - Tonos retro, apagados
- `minimal` - Paleta reducida, neutra
- `flat` - Estilo Material Design
- `web-safe` - Compatibles con navegadores

**La IA detecta:**
- Colores dominantes
- Colores secundarios
- Colores de acento
- Porcentajes de presencia

### ✅ C. Recomendaciones Inteligentes por Estilo

**Endpoint:** `POST /api/colors/recommendations`

Sugiere 3-7 paletas completas según el estilo solicitado:

**Estilos disponibles:**

**Por categoría:**
- `professional` - Paletas corporativas, serias
- `luxury` - Paletas elegantes, premium
- `retro` - Paletas de videojuegos 8-bit, nostálgicas
- `kawaii` - Paletas tiernas, dulces
- `minimal` - Paletas minimalistas, limpias
- `vibrant` - Paletas energéticas, llamativas

**Por teoría del color:**
- `complementary` - Colores opuestos en la rueda
- `analogous` - Colores adyacentes en la rueda
- `triadic` - Tres colores equidistantes
- `monochromatic` - Variaciones del mismo tono

**Cada recomendación incluye:**
- Nombre descriptivo
- 3-7 colores con HEX, RGB, HSL
- Descripción de uso
- Casos de uso específicos

## Tecnologías Utilizadas

- **Node.js + Express** - Framework de servidor
- **TypeScript** - Tipado estático
- **Gemini 2.5 Flash** - IA de Google para generación
- **Multer** - Manejo de uploads de imágenes
- **Sharp** - Procesamiento de imágenes
- **Express Validator** - Validación de requests
- **Helmet** - Seguridad HTTP
- **CORS** - Control de acceso
- **Morgan** - Logging de requests

## Utilidades de Conversión de Colores

El backend incluye funciones completas para trabajar con colores:

```typescript
// Conversiones básicas
hexToRgb()
rgbToHex()
hexToHsl()
hslToHex()
rgbToHsl()
hslToRgb()

// Teoría del color
getComplementaryColor()      // Color complementario
getAnalogousColors()         // Colores análogos
getTriadicColors()           // Colores triádicos
getMonochromaticPalette()    // Paleta monocromática

// Variaciones
generateColorVariations()    // Genera variaciones automáticas

// Accesibilidad
getRelativeLuminance()       // Luminancia relativa
getContrastRatio()           // Ratio de contraste WCAG
```

## Seguridad y Validación

- Validación de entrada con express-validator
- Límite de tamaño de archivos (5MB)
- Solo permite archivos de imagen
- Headers de seguridad con Helmet
- CORS configurado
- Sanitización de inputs
- Manejo de errores robusto

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/colors/health` | Health check del servidor |
| POST | `/api/colors/generate` | Generar color desde descripción |
| POST | `/api/colors/extract-palette` | Extraer paleta de imagen |
| POST | `/api/colors/recommendations` | Obtener recomendaciones por estilo |

## Cómo Usar

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar API Key de Gemini
Edita `.env` y agrega tu API key de [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Iniciar servidor
```bash
npm run dev
```

### 4. Probar
```bash
./test-api.sh
```

## Integración con Android

El backend está diseñado para integrarse fácilmente con tu app Android. En `EXAMPLES.md` encontrarás:

- Ejemplos completos con Retrofit
- Data classes de Kotlin
- ViewModels de ejemplo
- Composables de Jetpack Compose

## Documentación

- **README.md** - Documentación completa del API
- **EXAMPLES.md** - Ejemplos detallados de uso (cURL, JavaScript, Kotlin)
- **QUICKSTART.md** - Guía rápida de instalación
- **test-api.sh** - Script de pruebas automáticas

## Próximos Pasos

1. **Obtener API Key de Gemini**
   - Ve a https://aistudio.google.com/apikey
   - Crea una API key
   - Agrégala al archivo `.env`

2. **Instalar y probar**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Integrar con Android**
   - Usa los ejemplos de Kotlin en `EXAMPLES.md`
   - Configura Retrofit con la URL de tu servidor
   - Implementa las pantallas de UI

4. **Desplegar en producción**
   - Opción 1: Railway, Render, o Vercel
   - Opción 2: VPS (DigitalOcean, AWS, etc.)
   - Opción 3: Docker container

## Características Destacadas

### Prompts Optimizados
Los prompts enviados a Gemini están optimizados para:
- Generar colores precisos y relevantes
- Responder en formato JSON estructurado
- Incluir descripciones útiles en español
- Manejar casos edge gracefully

### Respuestas Consistentes
Todas las respuestas del API siguen el mismo patrón:
```json
{
  "success": true/false,
  "...": "datos específicos"
}
```

### Manejo de Errores Robusto
- Validación de entrada
- Errores descriptivos
- Códigos HTTP apropiados
- Logs detallados en servidor

## Performance

- Conversiones de color optimizadas con memoización
- Validación temprana de datos
- Procesamiento eficiente de imágenes con Sharp
- Timeouts configurables

## Escalabilidad

El backend está diseñado para escalar:
- Arquitectura modular (servicios, controladores, rutas)
- TypeScript para mantenibilidad
- Fácil de containerizar con Docker
- Preparado para agregar caché (Redis)
- Listo para agregar base de datos

## Notas Importantes

1. **API Key de Gemini es requerida** - Sin ella el servidor no iniciará
2. **Gemini 2.5 Flash** tiene límites de uso gratuito - Revisa la documentación de Google
3. **Imágenes grandes** pueden tardar más en procesarse
4. **CORS** está configurado para localhost - Actualiza para producción

## Posibles Mejoras Futuras

- Agregar caché con Redis para respuestas frecuentes
- Implementar rate limiting por IP
- Agregar autenticación con JWT
- Guardar historial de colores en base de datos
- Agregar endpoints para guardar/compartir paletas
- Implementar webhooks para notificaciones
- Agregar soporte para más formatos de exportación
- Implementar análisis de accesibilidad WCAG

## Soporte

Si tienes preguntas o encuentras problemas:
1. Revisa la documentación en `README.md`
2. Consulta los ejemplos en `EXAMPLES.md`
3. Ejecuta el script de pruebas `./test-api.sh`
4. Revisa los logs del servidor para errores detallados

---

**¡Tu backend está listo para usar!** 🚀

Sigue las instrucciones en `QUICKSTART.md` para comenzar en menos de 5 minutos.
