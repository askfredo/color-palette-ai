# Ejemplos de Uso del API

## Casos de Uso Reales

### A. Generación de Colores desde Descripciones

#### Ejemplo 1: Color pastel suave
```bash
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Un verde menta más suave pero con tono pastel"
  }'
```

#### Ejemplo 2: Color inspirado en marca
```bash
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Un rojo Ferrari pero un poco más oscuro"
  }'
```

#### Ejemplo 3: Color emocional/conceptual
```bash
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Necesito un color que se sienta como amanecer cálido en la playa"
  }'
```

#### Ejemplo 4: Color natural
```bash
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "El azul profundo del océano Pacífico al atardecer"
  }'
```

#### Ejemplo 5: Color vintage/retro
```bash
curl -X POST http://localhost:3001/api/colors/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Rosa chicle de los años 80, pero más vibrante"
  }'
```

### B. Extracción de Paletas desde Imágenes

#### Ejemplo 1: Paleta vibrante de una foto
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/landscape.jpg" \
  -F "mode=vibrant" \
  -F "colorCount=5"
```

#### Ejemplo 2: Paleta pastel de un outfit
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/outfit.png" \
  -F "mode=pastel" \
  -F "colorCount=4"
```

#### Ejemplo 3: Paleta vintage de una foto antigua
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/vintage-photo.jpg" \
  -F "mode=vintage" \
  -F "colorCount=6"
```

#### Ejemplo 4: Paleta minimal de diseño interior
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/interior.jpg" \
  -F "mode=minimal" \
  -F "colorCount=3"
```

#### Ejemplo 5: Paleta flat design de un logotipo
```bash
curl -X POST http://localhost:3001/api/colors/extract-palette \
  -F "image=@/path/to/logo.png" \
  -F "mode=flat" \
  -F "colorCount=4"
```

### C. Recomendaciones de Paletas por Estilo

#### Ejemplo 1: Paleta profesional/corporativa
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "professional",
    "count": 3
  }'
```

#### Ejemplo 2: Paleta de lujo con color base
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "luxury",
    "baseColor": "#1A1A1A",
    "count": 3
  }'
```

#### Ejemplo 3: Paleta para videojuego retro
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "retro",
    "count": 5
  }'
```

#### Ejemplo 4: Paleta kawaii/cute
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "kawaii",
    "count": 4
  }'
```

#### Ejemplo 5: Paleta complementaria desde un color
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "complementary",
    "baseColor": "#FF5733",
    "count": 3
  }'
```

#### Ejemplo 6: Paleta análoga
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "analogous",
    "baseColor": "#3498DB",
    "count": 3
  }'
```

#### Ejemplo 7: Paleta triádica
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "triadic",
    "baseColor": "#E74C3C",
    "count": 3
  }'
```

#### Ejemplo 8: Paleta monocromática
```bash
curl -X POST http://localhost:3001/api/colors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "style": "monochromatic",
    "baseColor": "#9B59B6",
    "count": 3
  }'
```

## Ejemplos con JavaScript/TypeScript

### Usando Fetch API

```typescript
// Generar color desde descripción
async function generateColor(description: string) {
  const response = await fetch('http://localhost:3001/api/colors/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });

  const data = await response.json();
  return data;
}

// Uso
const result = await generateColor('Un azul cielo profundo');
console.log(result.color.hex); // "#0080FF"
```

```typescript
// Extraer paleta de imagen
async function extractPalette(imageFile: File, mode = 'vibrant', colorCount = 5) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('mode', mode);
  formData.append('colorCount', colorCount.toString());

  const response = await fetch('http://localhost:3001/api/colors/extract-palette', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data;
}

// Uso (en un componente React con input file)
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const palette = await extractPalette(file, 'pastel', 5);
    console.log(palette.palette);
  }
};
```

```typescript
// Obtener recomendaciones
async function getRecommendations(style: string, baseColor?: string, count = 3) {
  const response = await fetch('http://localhost:3001/api/colors/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ style, baseColor, count }),
  });

  const data = await response.json();
  return data;
}

// Uso
const recommendations = await getRecommendations('luxury', '#000000', 3);
recommendations.recommendations.forEach(rec => {
  console.log(rec.name);
  console.log(rec.colors.map(c => c.hex));
});
```

## Ejemplos con Axios

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/colors';

// Generar color
const generateColor = async (description: string) => {
  const { data } = await axios.post(`${API_BASE}/generate`, { description });
  return data;
};

// Extraer paleta
const extractPalette = async (imageFile: File, mode = 'vibrant', colorCount = 5) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('mode', mode);
  formData.append('colorCount', colorCount.toString());

  const { data } = await axios.post(`${API_BASE}/extract-palette`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Recomendaciones
const getRecommendations = async (
  style: string,
  baseColor?: string,
  count = 3
) => {
  const { data } = await axios.post(`${API_BASE}/recommendations`, {
    style,
    baseColor,
    count,
  });
  return data;
};
```

## Ejemplos de Integración en Android (Kotlin)

```kotlin
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.MultipartBody
import okhttp3.RequestBody

// Data classes
data class ColorDescriptionRequest(val description: String)

data class ColorInfo(
    val hex: String,
    val rgb: RGB,
    val hsl: HSL
)

data class RGB(val r: Int, val g: Int, val b: Int)
data class HSL(val h: Int, val s: Int, val l: Int)

data class ColorResponse(
    val success: Boolean,
    val color: ColorInfo,
    val variations: ColorVariations,
    val description: String,
    val confidence: Double
)

data class StyleRecommendationRequest(
    val style: String,
    val baseColor: String? = null,
    val count: Int = 3
)

// API Interface
interface ColorPaletteApi {
    @POST("colors/generate")
    suspend fun generateColor(
        @Body request: ColorDescriptionRequest
    ): ColorResponse

    @Multipart
    @POST("colors/extract-palette")
    suspend fun extractPalette(
        @Part image: MultipartBody.Part,
        @Part("mode") mode: RequestBody,
        @Part("colorCount") colorCount: RequestBody
    ): PaletteResponse

    @POST("colors/recommendations")
    suspend fun getRecommendations(
        @Body request: StyleRecommendationRequest
    ): RecommendationResponse
}

// Retrofit instance
object ApiClient {
    private const val BASE_URL = "http://your-server-ip:3001/api/"

    val api: ColorPaletteApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ColorPaletteApi::class.java)
    }
}

// Uso en ViewModel
class ColorViewModel : ViewModel() {
    fun generateColor(description: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.api.generateColor(
                    ColorDescriptionRequest(description)
                )
                // Usar response.color.hex
            } catch (e: Exception) {
                // Manejar error
            }
        }
    }

    fun extractPalette(imageUri: Uri, mode: String = "vibrant") {
        viewModelScope.launch {
            try {
                val file = uriToFile(imageUri)
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                val body = MultipartBody.Part.createFormData("image", file.name, requestFile)
                val modeBody = mode.toRequestBody("text/plain".toMediaTypeOrNull())
                val countBody = "5".toRequestBody("text/plain".toMediaTypeOrNull())

                val response = ApiClient.api.extractPalette(body, modeBody, countBody)
                // Usar response.palette
            } catch (e: Exception) {
                // Manejar error
            }
        }
    }

    fun getRecommendations(style: String, baseColor: String? = null) {
        viewModelScope.launch {
            try {
                val response = ApiClient.api.getRecommendations(
                    StyleRecommendationRequest(style, baseColor, 3)
                )
                // Usar response.recommendations
            } catch (e: Exception) {
                // Manejar error
            }
        }
    }
}
```

## Uso en Composables (Jetpack Compose)

```kotlin
@Composable
fun ColorGeneratorScreen(viewModel: ColorViewModel = viewModel()) {
    var description by remember { mutableStateOf("") }
    var generatedColor by remember { mutableStateOf<ColorInfo?>(null) }

    Column {
        TextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Describe tu color") }
        )

        Button(onClick = {
            viewModel.generateColor(description)
        }) {
            Text("Generar")
        }

        generatedColor?.let { color ->
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .background(Color(android.graphics.Color.parseColor(color.hex)))
            )
        }
    }
}
```

## Manejo de Errores

```typescript
async function safeGenerateColor(description: string) {
  try {
    const response = await fetch('http://localhost:3001/api/colors/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('Error generating color:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
```

## Tips de Uso

1. **Descripciones efectivas**: Sé específico pero natural
   - ✅ "Un azul océano profundo al atardecer"
   - ✅ "Rosa pastel suave como algodón de azúcar"
   - ❌ "Color bonito"

2. **Modos de imagen**: Elige según tu necesidad
   - `vibrant`: Diseños modernos, apps, branding enérgico
   - `pastel`: UI suave, apps infantiles, diseño delicado
   - `vintage`: Diseños retro, fotografía antigua
   - `minimal`: UI minimalista, diseño limpio
   - `flat`: Material Design, UI moderna

3. **Estilos de recomendaciones**: Contextualiza tu uso
   - `professional`: Sitios corporativos, fintech, B2B
   - `luxury`: Moda, joyería, hoteles premium
   - `retro`: Videojuegos, apps nostálgicas
   - `kawaii`: Apps juveniles, productos cute
   - Teoría del color: `complementary`, `analogous`, `triadic`, `monochromatic`
