# 🎨 Color Palette AI Backend

Backend API potenciado por IA (Gemini 2.5 Flash) para generación inteligente de paletas de colores.

## Características

### A. Generación de colores desde descripción natural
- Convierte descripciones en lenguaje natural a colores HEX precisos
- Genera variaciones automáticas (más claro, más oscuro, saturado, desaturado)
- Incluye RGB, HSL y vista previa

### B. Extracción de paletas desde imágenes
- Analiza imágenes para extraer colores dominantes, secundarios y acentos
- Modos: pastel, vibrant, vintage, minimal, flat, web-safe
- Soporta múltiples formatos de imagen

### C. Recomendaciones basadas en estilos
- Sugiere paletas según teoría del color y estilos de diseño
- Estilos: professional, luxury, retro, kawaii, complementary, analogous, triadic, monochromatic, minimal, vibrant
- Incluye casos de uso y descripciones

## Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
# o
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del directorio `backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Gemini API Configuration
GEMINI_API_KEY=tu_api_key_de_gemini

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Upload Configuration
MAX_FILE_SIZE=5242880
```

Para obtener una API key de Gemini:
1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Crea un nuevo proyecto
3. Genera una API key
4. Copia la key al archivo `.env`

### 3. Ejecutar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`

## API Endpoints

### 1. Generar color desde descripción

**Endpoint:** `POST /api/colors/generate`

**Request:**
```json
{
  "description": "Un verde menta más suave pero con tono pastel"
}
```

**Response:**
```json
{
  "success": true,
  "color": {
    "hex": "#B4E7CE",
    "rgb": { "r": 180, "g": 231, "b": 206 },
    "hsl": { "h": 151, "s": 54, "l": 81 }
  },
  "variations": {
    "base": { "hex": "#B4E7CE", "rgb": {...}, "hsl": {...} },
    "lighter": { "name": "Lighter", "hex": "#D4F3E6", "rgb": {...}, "hsl": {...} },
    "darker": { "name": "Darker", "hex": "#94DBB6", "rgb": {...}, "hsl": {...} },
    "saturated": { "name": "More Saturated", "hex": "#9AEBD2", "rgb": {...}, "hsl": {...} },
    "desaturated": { "name": "Less Saturated", "hex": "#CEE3DA", "rgb": {...}, "hsl": {...} }
  },
  "description": "Verde menta suave con tonos pastel, refrescante y delicado.",
  "confidence": 0.92
}
```

**Ejemplos de descripciones:**
- "Quiero un verde menta más suave pero con tono pastel"
- "Un rojo Ferrari pero un poco más oscuro"
- "Necesito un color que se sienta como 'amanecer cálido en la playa'"
- "Azul océano profundo"
- "Rosa chicle de los 80s"

### 2. Extraer paleta desde imagen

**Endpoint:** `POST /api/colors/extract-palette`

**Request:** (multipart/form-data)
- `image` (file): Archivo de imagen (JPG, PNG, etc.)
- `mode` (string, opcional): Modo de extracción. Default: "vibrant"
  - Opciones: `pastel`, `vibrant`, `vintage`, `minimal`, `flat`, `web-safe`
- `colorCount` (number, opcional): Cantidad de colores. Default: 5 (min: 2, max: 10)

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/image.jpg" \
  -F "mode=vibrant" \
  -F "colorCount=5"
```

**Response:**
```json
{
  "success": true,
  "palette": [
    {
      "hex": "#3B5998",
      "rgb": { "r": 59, "g": 89, "b": 152 },
      "hsl": { "h": 221, "s": 44, "l": 41 },
      "percentage": 45.5,
      "role": "dominant"
    },
    {
      "hex": "#8B9DC3",
      "rgb": { "r": 139, "g": 157, "b": 195 },
      "hsl": { "h": 221, "s": 32, "l": 65 },
      "percentage": 25.0,
      "role": "secondary"
    },
    {
      "hex": "#DFE3EE",
      "rgb": { "r": 223, "g": 227, "b": 238 },
      "hsl": { "h": 224, "s": 30, "l": 90 },
      "percentage": 15.5,
      "role": "accent"
    }
  ],
  "mode": "vibrant",
  "totalColors": 3
}
```

**Modos disponibles:**
- `pastel`: Colores suaves, delicados, alta luminosidad
- `vibrant`: Colores vibrantes, saturados, llamativos
- `vintage`: Colores retro, apagados, tonos sepia
- `minimal`: Colores minimalistas, neutros, paleta reducida
- `flat`: Colores planos, modernos, estilo Material Design
- `web-safe`: Colores compatibles con navegadores web

### 3. Obtener recomendaciones por estilo

**Endpoint:** `POST /api/colors/recommendations`

**Request:**
```json
{
  "style": "luxury",
  "baseColor": "#1A1A1A",
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "style": "luxury",
  "recommendations": [
    {
      "name": "Elegancia Nocturna",
      "colors": [
        { "hex": "#1A1A1A", "rgb": {...}, "hsl": {...} },
        { "hex": "#D4AF37", "rgb": {...}, "hsl": {...} },
        { "hex": "#FFFFFF", "rgb": {...}, "hsl": {...} },
        { "hex": "#4B0082", "rgb": {...}, "hsl": {...} }
      ],
      "description": "Paleta lujosa que combina negro profundo con dorado y púrpura real",
      "useCases": [
        "Marcas de moda de lujo",
        "Sitios web de joyería premium",
        "Apps de lifestyle exclusivo"
      ]
    },
    {
      "name": "Platino Sofisticado",
      "colors": [
        { "hex": "#2C2C2C", "rgb": {...}, "hsl": {...} },
        { "hex": "#C0C0C0", "rgb": {...}, "hsl": {...} },
        { "hex": "#8B4789", "rgb": {...}, "hsl": {...} }
      ],
      "description": "Combinación elegante de grises metálicos con toques de púrpura",
      "useCases": [
        "Hoteles boutique",
        "Productos tech premium",
        "Marcas de cosmética de lujo"
      ]
    }
  ],
  "totalOptions": 2
}
```

**Estilos disponibles:**
- `professional`: Paletas corporativas, serias, confiables
- `luxury`: Paletas lujosas, elegantes, premium
- `retro`: Paletas retro, videojuegos 8-bit, nostálgicas
- `kawaii`: Paletas tiernas, dulces, juveniles
- `complementary`: Colores complementarios (opuestos en rueda)
- `analogous`: Colores análogos (adyacentes en rueda)
- `triadic`: Colores triádicos (equidistantes en rueda)
- `monochromatic`: Variaciones del mismo tono
- `minimal`: Paletas minimalistas, limpias, simples
- `vibrant`: Paletas vibrantes, energéticas, llamativas

### 4. Health Check

**Endpoint:** `GET /api/colors/health`

**Response:**
```json
{
  "success": true,
  "message": "Color Palette AI API is running",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   └── colorController.ts      # Lógica de endpoints
│   ├── services/
│   │   └── geminiService.ts        # Integración con Gemini AI
│   ├── utils/
│   │   ├── colorUtils.ts           # Conversión de colores
│   │   └── validators.ts           # Validación y manejo de errores
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── routes/
│   │   └── colorRoutes.ts          # Definición de rutas
│   └── server.ts                   # Punto de entrada
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Utilidades de Conversión de Colores

El backend incluye utilidades completas para trabajar con colores:

```typescript
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  createColorInfo,
  generateColorVariations,
  getComplementaryColor,
  getAnalogousColors,
  getTriadicColors,
  getMonochromaticPalette,
  getContrastRatio
} from './utils/colorUtils';

// Conversión
const rgb = hexToRgb('#FF5733'); // { r: 255, g: 87, b: 51 }
const hsl = hexToHsl('#FF5733'); // { h: 11, s: 100, l: 60 }

// Teoría del color
const complementary = getComplementaryColor('#FF5733');
const analogous = getAnalogousColors('#FF5733');
const triadic = getTriadicColors('#FF5733');
const monochromatic = getMonochromaticPalette('#FF5733', 5);

// Accesibilidad
const contrastRatio = getContrastRatio('#FFFFFF', '#000000'); // 21
```

## Manejo de Errores

Todos los endpoints devuelven respuestas consistentes:

**Éxito:**
```json
{
  "success": true,
  "...": "datos específicos del endpoint"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": "Detalles adicionales (solo en desarrollo)"
}
```

**Códigos de estado HTTP:**
- `200`: Éxito
- `400`: Error de validación o request inválido
- `404`: Ruta no encontrada
- `413`: Archivo muy grande
- `500`: Error interno del servidor

## Seguridad

El backend implementa las siguientes medidas de seguridad:

- Helmet.js para headers de seguridad
- CORS configurado con orígenes permitidos
- Validación de entrada con express-validator
- Límite de tamaño de archivos (5MB por defecto)
- Validación de tipos de archivo (solo imágenes)
- Variables de entorno para datos sensibles

## Ejemplo de Integración con Android

```kotlin
// Kotlin/Android example
data class ColorRequest(val description: String)

suspend fun generateColor(description: String): ColorResponse {
    val retrofit = Retrofit.Builder()
        .baseUrl("http://your-server:3001/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val api = retrofit.create(ColorApi::class.java)
    return api.generateColor(ColorRequest(description))
}

interface ColorApi {
    @POST("colors/generate")
    suspend fun generateColor(@Body request: ColorRequest): ColorResponse
}
```

## Desarrollo

### Scripts disponibles

```bash
npm run dev      # Desarrollo con auto-reload
npm run build    # Compilar TypeScript
npm start        # Ejecutar versión compilada
npm run lint     # Ejecutar linter
```

### Testing

Para probar la API puedes usar:

**cURL:**
```bash
# Generar color
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"Un azul océano profundo"}'

# Recomendaciones
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{"style":"kawaii","count":3}'
```

**Postman / Insomnia:** Importa las colecciones desde los ejemplos arriba.

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.
