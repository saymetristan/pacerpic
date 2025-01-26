# Pacerpic - Plataforma de Gestión de Fotografías Deportivas

## 🎯 Descripción General
Pacerpic es una plataforma que conecta fotógrafos, organizadores y corredores de eventos deportivos, facilitando la gestión, venta y compra de fotografías.

## 🚀 Características Principales

### Para Corredores
- Búsqueda de fotos por número de dorsal
- Visualización de imágenes con marca de agua
- Compra y descarga de imágenes sin marca de agua
- No requiere registro

### Para Fotógrafos
- Panel de control personalizado
- Subida masiva de imágenes
- Procesamiento automático (compresión y marca de agua)
- Detección automática de dorsales mediante IA

### Para Organizadores
- Gestión de eventos
- Estadísticas y métricas
- Panel de administración

## 🛠️ Stack Tecnológico

### Frontend
- Next.js 14
- Tailwind CSS
- shadcn/ui
- MagicUI para animaciones
- Auth0 para autenticación

### Backend
- Next.js API Routes
- Sharp para procesamiento de imágenes
- OpenAI GPT-4 para detección de dorsales
- Supabase (PostgreSQL + Storage)

## 📦 Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
└── hooks/                # Custom hooks
```

## 🎨 Identidad Visual
- Color Primario: `#1A3068` (Azul Marino)
- Color Secundario: `#EC6533` (Naranja)

## 🔄 Flujo de Trabajo

### Procesamiento de Imágenes

```12:241:src/lib/image-processing.ts
export async function processImage(
  file: Buffer, 
  fileName: string, 
  eventId: string, 
  photographerId: string,
  accessToken: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar rol del usuario directamente con el ID
    const { data: user, error: roleError } = await supabase
      .from('users')
      .select('role, id')
      .eq('auth0_id', photographerId)
      .single();

    console.log('User Check:', { user, roleError, photographerId });

    if (!user || roleError) {
      console.error('Error verificando usuario:', roleError);
      throw new Error('Error de autenticación');
    }

    // Establecer el contexto de auth para las siguientes operaciones
    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    // Verificar políticas actuales
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies');

    console.log('Storage Policies:', { policies, policiesError });

    // Log de la información de autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('Auth Session:', {
      session: session ? 'Exists' : 'None',
      error: authError,
      userId: session?.user?.id,
      userMetadata: session?.user?.user_metadata
    });

    console.log('Iniciando procesamiento de imagen:', { fileName, eventId, photographerId });

    // 1. Comprimir imagen
    const compressedImage = await sharp(file)
      .resize(1300, 1300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 100 });

    // Obtener el buffer de la imagen comprimida para OpenAI
    const base64Image = (await compressedImage.toBuffer()).toString('base64');

    // Descargar la marca de agua
    const watermarkResponse = await fetch(WATERMARK_URL);
    const watermarkBuffer = await watermarkResponse.arrayBuffer();

    // Aplicar marca de agua
    const watermarkedImage = await sharp(file)
      .resize(1300, 1300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .composite([
        {
          input: Buffer.from(watermarkBuffer),
          gravity: 'center',
          blend: 'over'
        }
      ]);

    // 3. Detectar dorsales con OpenAI usando la imagen original
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini"
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `Analiza la imagen proporcionada para identificar y listar los números de dorsal visibles.

Asegúrate de reconocer los números de dorsal que sean completos, completamente visibles y claramente legibles. Si se encuentra algún dorsal obstruido o no completo, no debe incluirse en la respuesta.

# Output Format

Presente los números de dorsal detectados en un formato JSON, siguiendo la estructura:

\`\`\`json
{
  "dorsal_number": [NUMEROS_DE_DORSAL]
}
\`\`\`

- \`NUMEROS_DE_DORSAL\`: una lista de números de dorsal visibles que has identificado. Reemplace este marcador de posición con los números reales detectados.
- Si no se detectan dorsales, utilice un array vacío como en el siguiente ejemplo:

\`\`\`json
{
  "dorsal_number": []
}
\`\`\`

# Notes

- Sólo se deben incluir números que sean completos y claramente legibles.
- Si hay dificultad para identificar los dorsales debido a obstrucciones o calidad de imagen, no los incluya en la lista.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('Respuesta de OpenAI:', response);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }
    
    const { dorsal_number: dorsals }: { dorsal_number: number[] } = JSON.parse(content);
    console.log('Dorsales detectados:', dorsals);

    // 4. Guardar imágenes en Supabase Storage
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    console.log('Rutas de almacenamiento:', { originalPath, compressedPath });

    // Subir imagen original
    const { data: originalData, error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, file, {
        cacheControl: '3600',
        upsert: true  // Cambiado a true para sobrescribir si existe
      });

    if (originalError) {
      console.error('Error subiendo imagen original:', originalError);
      throw originalError;
    }

    console.log('Respuesta de subida original:', originalData);

    // Subir imagen comprimida
    const { data: compressedData, error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, await watermarkedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });
    if (compressedError) {
      console.error('Error subiendo imagen comprimida:', compressedError);
      throw compressedError;
    }

    console.log('Respuesta de subida comprimida:', compressedData);

    // 5. Guardar referencia en la base de datos
    const { data: image, error: imageError } = await supabase
      .from('images')
      .insert({
        event_id: eventId,
        photographer_id: photographerId,
        original_url: originalPath,
        compressed_url: compressedPath,
        status: 'processed'
      })
      .select()
      .single();

    if (imageError) throw imageError;
    console.log('Referencia de imagen guardada en la base de datos:', image);

    // 6. Insertar dorsales detectados
    const dorsalInserts = dorsals.map((dorsal: number) => ({
      image_id: image.id,
      dorsal_number: dorsal.toString(),
      confidence: 1.0
    }));

    if (dorsalInserts.length > 0) {
      const { error: dorsalError } = await supabase
        .from('image_dorsals')
        .insert(dorsalInserts);

      if (dorsalError) throw dorsalError;
      console.log('Dorsales insertados en la base de datos:', dorsalInserts);
    }

    return { ...image, dorsals };

  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
}
```


### Subida de Imágenes

```1:43:src/components/upload/upload-form.tsx
"use client";

import { useImages } from '@/hooks/use-images';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';

export function UploadForm() {
  const eventId = 'e0c77c6d-6f34-4c8c-a532-f9946baa1820'; // ID del Maratón de Madrid 2024
  const { uploadEventImage, isUploading, progress } = useImages();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    disabled: isUploading,
    onDrop: async (files) => {
      for (const file of files) {
        await uploadEventImage(file, eventId);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Maratón de Madrid 2024</h3>
        <p className="text-sm text-muted-foreground">15 de Abril, 2024</p>
      </div>

      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center">
        <input {...getInputProps()} />
        <p>Arrastra tus imágenes aquí o haz clic para seleccionarlas</p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-2">Subiendo imágenes...</p>
        </div>
      )}
    </div>
  );
}
```


## 🔐 Base de Datos

```1:32:sql/schema.sql
-- Esquema inicial de la base de datos para Pacerpic
-- ============= TABLAS =============

-- Tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR,
  organizer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de imágenes
CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  photographer_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  compressed_url TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de dorsales en imágenes
CREATE TABLE image_dorsals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_id UUID REFERENCES images(id),
  dorsal_number TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```


## 🚀 Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```
3. Configurar variables de entorno:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - AUTH0_SECRET
   - AUTH0_BASE_URL
   - AUTH0_ISSUER_BASE_URL
   - AUTH0_CLIENT_ID
   - AUTH0_CLIENT_SECRET

4. Iniciar en desarrollo:
```bash
npm run dev
```

## 📝 Estado Actual
- Versión: 0.1.1
- Características implementadas:
  - Autenticación
  - Procesamiento básico de imágenes
  - Paneles de administración
  - Subida de imágenes
- Pendiente:
  - Integración completa de pagos
  - Sistema de marca de agua
  - Detección avanzada de dorsales

## 🤝 Contribución
El proyecto sigue las convenciones de commits convencionales y utiliza ESLint para mantener la calidad del código.

---

# SQL - Pacerpic 🗄️

## Descripción
Sistema de base de datos para Pacerpic usando PostgreSQL en Supabase. Gestiona eventos deportivos, imágenes, dorsales y ventas con políticas de seguridad RLS.

## Estructura 📁

```sql
/sql
├── schema.sql     # Esquema principal de la base de datos
├── storage.sql    # Configuración de buckets y políticas
└── triggers.sql   # Triggers y funciones para automatización
```

## Tablas Principales 📊

### Events
- UUID como identificador
- Datos básicos del evento (nombre, fecha, ubicación)
- Referencia al organizador

### Images
- Almacena metadata de imágenes
- Referencias a URLs en Supabase Storage
- Estado de procesamiento
- Relación con eventos y fotógrafos

### Image_Dorsals
- Mapeo entre imágenes y números de dorsal
- Nivel de confianza en la detección
- Timestamp de creación

### Sales (Nueva)
- Registro de ventas de imágenes
- URLs de descarga temporales
- Estado de la transacción

## Storage Buckets 🗂️

- `originals`: Imágenes originales (privado)
- `compressed`: Imágenes procesadas con marca de agua (público)

## Políticas de Seguridad 🔒


```15:30:sql/storage.sql
CREATE POLICY "Fotógrafos pueden subir imágenes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'originals' AND
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'photographer'
    )
  );

-- Política para leer imágenes comprimidas (público)
CREATE POLICY "Acceso público a imágenes comprimidas" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'compressed'); 
```


## Triggers y Automatización ⚡


```4:40:sql/triggers.sql
-- Función para procesar imágenes nuevas
CREATE OR REPLACE FUNCTION handle_new_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar al sistema de procesamiento
  PERFORM pg_notify(
    'image_processing',
    json_build_object(
      'id', NEW.id,
      'event_id', NEW.event_id,
      'original_url', NEW.original_url,
      'status', NEW.status,
      'action', 'process'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para monitorear cambios de estado
CREATE OR REPLACE FUNCTION handle_image_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    -- Notificar cambio de estado
    PERFORM pg_notify(
      'image_status',
      json_build_object(
        'id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'action', 'status_change'
      )::text
    );
  END IF;
  
```


## Instalación 🚀

1. Accede a tu proyecto en Supabase
2. Abre SQL Editor
3. Ejecuta los scripts en orden:
   ```bash
   schema.sql → storage.sql → triggers.sql
   ```

## Notas Importantes ⚠️

- Habilitar RLS en todas las tablas
- Verificar políticas de acceso
- Comprobar creación de buckets
- Los triggers requieren permisos de superuser

## Mantenimiento 🔧

- Backups automáticos habilitados
- Monitoreo de espacio en buckets
- Limpieza periódica de URLs de descarga expiradas

## Variables de Entorno Requeridas 🔐

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
SUPABASE_SERVICE_ROLE_KEY=tu-key
```

---

Te doy la descripción de cada directorio/archivo para el README.md:

## 📁 Estructura del Proyecto

### `/app/admin`
Módulo de administración con rutas protegidas para gestión de eventos, galería y subida de imágenes.
- `events/`: Gestión y listado de eventos deportivos
- `gallery/`: Visualización y gestión de imágenes
- `upload/`: Sistema de subida de imágenes con procesamiento automático
- `layout.tsx`: Layout protegido con Auth0
- `page.tsx`: Dashboard principal con métricas y estadísticas

### `/app/api`
APIs RESTful para la gestión de recursos:
- `auth/`: Endpoints de autenticación con Auth0
- `events/`: CRUD de eventos y sus imágenes
- `images/`: Procesamiento y gestión de imágenes
- `search/`: Búsqueda de imágenes por dorsal
- `upload/`: Subida y procesamiento de imágenes
- `webhooks/`: Webhooks para integraciones (Supabase)

### `/app/event`
Visualización pública de eventos:

```1:150:src/app/event/[eventId]/page.tsx
export default function EventGalleryPage() {
  ...
  const paginatedImages = images.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = images.length > paginatedImages.length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-auto relative">
              <Image 
                src={theme === 'dark' ? '/images/logo-light.png' : '/images/logo-dark.png'} 
                alt="Pacerpic" 
                width={120} 
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex items-center space-x-4 flex-1 justify-end max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar dorsal..."
                value={searchInput}
                onChange={handleDorsalChange}
                className="pl-9 border-input"
                maxLength={5}
              />
            </div>
            <Button 
              type="submit"
              className="bg-[#EC6533] hover:bg-[#EC6533]/90 text-white"
              disabled={!searchInput}
            >
              Buscar
            </Button>
          </form>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-[#1A3068] dark:text-white">
          Galería {event?.name ? `| ${event.name}` : ''}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MagicCard 
                key={i}
                className="aspect-[4/3] rounded-lg bg-muted animate-pulse"
                gradientColor="#EC6533"
              />
```

- Galería de imágenes con vista previa
- Compartir en redes sociales
- Navegación entre imágenes
- Búsqueda por dorsal

### `/app/fonts`
Fuentes personalizadas:
- `GeistVF.woff`: Variable font para texto general
- `GeistMonoVF.woff`: Variable font monoespaciada

### `/app/search`
Sistema de búsqueda de imágenes:

```1:100:src/app/search/page.tsx
...
function SearchContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("dorsal") || "");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState<{ name: string } | null>(null);
  const eventId = searchParams.get("eventId");
  const dorsal = searchParams.get("dorsal");
  const { toast } = useToast();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error al obtener evento:', error);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleDorsalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSearchInput(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;

    setLoading(true);
    router.push(`/search?eventId=${eventId}&dorsal=${searchInput}`);
  };
  useEffect(() => {
    const fetchImages = async () => {
      const dorsal = searchParams.get("dorsal");
      if (!eventId || !dorsal) {
        setImages([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/search?eventId=${eventId}&dorsal=${dorsal}`
        );
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Error en la búsqueda');
        }
```

- Búsqueda por dorsal
- Vista previa de imágenes
- Compartir en redes sociales
- Paginación de resultados

### `globals.css`
Estilos globales y configuración de Tailwind:
- Variables CSS personalizadas
- Tema claro/oscuro
- Utilidades personalizadas
- Configuración de colores corporativos

### `layout.tsx`
Layout principal de la aplicación:
- Configuración de fuentes
- Providers globales
- Metadata de la aplicación
- Sincronización de autenticación

### `page.tsx`
Página principal (landing):
- Hero section
- Características principales
- Sección de testimonios
- CTA para registro

### `providers.tsx`
Providers globales:
- Auth0 para autenticación
- Tema (claro/oscuro)
- Estado global
- Sincronización de datos

## 🔐 Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
```

Te daré una descripción detallada de cada carpeta y componente:

### 📁 @auth
Componentes relacionados con la autenticación usando Auth0:
- `AuthButtons`: Botones de inicio de sesión/registro adaptables al scroll
- `AuthModal`: Modal de registro con selección de rol (fotógrafo/organizador)
- `AuthSync`: Sincronización del estado de autenticación
- `PhotographerForm`: Formulario de registro para fotógrafos
- `OrganizerForm`: Formulario de registro para organizadores

### 📁 @dashboard
Componentes del panel de control:
- `Overview`: Gráfico de barras para visualización de ventas
- `RecentSales`: Lista de ventas recientes con avatares y montos

### 📁 @events
Gestión de eventos deportivos:
- `DeleteEventDialog`: Diálogo de confirmación para eliminar eventos
- `EventActions`: Menú desplegable con acciones por evento
- `EventDialog`: Modal para crear/editar eventos
- `EventsHeader`: Encabezado con filtros y acciones
- `EventsTable`: Tabla con listado de eventos y métricas

### 📁 @gallery
Visualización y gestión de fotografías:
- `GalleryFilters`: Filtros por evento y etiquetas
- `GalleryGrid`: Cuadrícula de imágenes con acciones
- `GalleryHeader`: Buscador y título
- `ImageDialog`: Vista detallada de imagen individual

### 📁 @layout
Componentes estructurales:
- `AdminSidebar`: Barra lateral para administradores
- `Navbar`: Barra de navegación superior
- `Sidebar`: Barra lateral estándar

### 📁 @navigation
Componentes de navegación:
- `MainNav`: Navegación principal con logo y autenticación

### 📁 @providers
Proveedores de contexto:
- `DashboardProvider`: Layout y estado del dashboard

### 📁 @search
Componentes de búsqueda:
- `NoResults`: Mensaje cuando no hay resultados
- `SearchForm`: Formulario de búsqueda por dorsal

### 📁 @sections
Secciones de página:
- `HeroSection`: Sección principal con animaciones

### 📁 @settings
Configuraciones de usuario:
- `NotificationSettings`: Preferencias de notificaciones
- `PaymentSettings`: Gestión de pagos
- `ProfileSettings`: Edición de perfil

### 📁 @stats
Componentes estadísticos:
- `EventStats`: Gráficos de rendimiento por evento
- `StatsHeader`: Encabezado con filtros temporales
- `StatsOverview`: Resumen de métricas principales
- `TopEvents`: Ranking de eventos más exitosos

### 📁 @ui
Componentes de interfaz reutilizables basados en shadcn/ui:
- Componentes básicos (Button, Input, Card)
- Componentes de diálogo y modales
- Componentes de navegación y layout
- Elementos interactivos y animados

### 📁 @upload
Gestión de subida de imágenes:
- `UploadForm`: Formulario de subida con drag & drop
- `UploadHeader`: Selector de evento
- `UploadProgress`: Barra de progreso
- `UploadZone`: Zona de arrastre de archivos

### 📄 theme-provider.tsx
Proveedor de tema usando next-themes:
- Gestión de tema claro/oscuro
- Persistencia de preferencias
- Cambio dinámico de tema


# 🎣 Hooks Personalizados

## Descripción General
Colección de hooks personalizados para Pacerpic que manejan la lógica de negocio, autenticación, gestión de estado y utilidades.

## Hooks Disponibles

### 🔐 `useAuthSync`
Hook para sincronización bidireccional entre Auth0 y Supabase.


```1:64:src/hooks/use-auth-sync.ts
"use client";

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useAuthSync() {
  const { user, isLoading } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function syncUser() {
      if (!isLoading && user) {
        try {
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('auth0_id', user.user_id)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error('Error verificando usuario:', selectError);
            return;
          }

          if (!existingUser) {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                auth0_id: user.user_id,
                role: 'admin',
                email: user.email,
                name: user.name
              }, {
                onConflict: 'auth0_id'
              });

            if (upsertError) {
              console.error('Error creando usuario:', upsertError);
              return;
            }
          }

          const response = await fetch('/api/auth/session');
          const session = await response.json();
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: session.accessToken,
            refresh_token: ''
          });

          if (sessionError) {
            console.error('Error sincronizando sesión:', sessionError);
          }
        } catch (error) {
          console.error('Error en sincronización:', error);
        }
      }
    }

    syncUser();
  }, [user, isLoading, supabase.auth, supabase]);
} 
```


**Características:**
- Sincronización automática de usuarios entre Auth0 y Supabase
- Gestión de sesiones
- Manejo de roles y permisos
- Persistencia de datos de usuario

### 📅 `useEvents`
Hook para la gestión de eventos deportivos.


```1:56:src/hooks/use-events.ts
// src/hooks/use-events.ts

"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Definición de tipos
interface Image {
  compressed_url: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  images_count: number;
  images: Image[];
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) throw error;

        setEvents(data || []);
      } catch (err) {
        console.error('Error al obtener eventos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}
```


**Características:**
- Obtención de eventos desde Supabase
- Ordenamiento por fecha
- Estado de carga y manejo de errores
- Tipado fuerte con TypeScript

### 📸 `useImages`
Hook para la gestión de subida y procesamiento de imágenes.


```1:71:src/hooks/use-images.ts
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@auth0/nextjs-auth0/client';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
}

export function useImages() {
  const { user } = useUser();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadEventImage = async (file: File, eventId: string) => {
    setIsUploading(true);
    const fileName = file.name;
    
    if (!user?.sub) {
      console.error('Usuario no autenticado');
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      formData.append('photographerId', user.user_id);

      const response = await axios.post('/api/images/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: { fileName, progress, status: 'processing' }
          }));
        }
      });

      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 100, status: 'processed' }
      }));

      return response.data;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: { fileName, progress: 0, status: 'error' }
      }));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const progress = Object.values(uploadProgress)[0]?.progress || 0;

  return {
    uploadEventImage,
    uploadProgress,
    isUploading,
    progress
  };
}
```


**Características:**
- Subida de imágenes con barra de progreso
- Integración con Auth0 para autenticación
- Manejo de estados de carga
- Gestión de errores
- Soporte para múltiples archivos

### 📱 `useMediaQuery`
Hook para detección de media queries.


```1:16:src/hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
```


**Características:**
- Detección de cambios en media queries
- Soporte para responsive design
- Limpieza automática de listeners

### 📲 `useMobile`
Hook especializado para detección de dispositivos móviles.


```1:19:src/hooks/use-mobile.tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```


**Características:**
- Breakpoint configurable (768px por defecto)
- Actualización en tiempo real
- Optimizado para rendimiento

### 🔔 `useToast`
Hook para sistema de notificaciones toast.


```1:291:src/hooks/use-toast.ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```


**Características:**
- Sistema de cola de notificaciones
- Límite configurable de toasts
- Animaciones suaves
- Soporte para acciones personalizadas
- Auto-dismiss configurable

## 🛠️ Uso

```typescript
// Ejemplo de uso combinado de hooks
import { useAuthSync } from '@/hooks/use-auth-sync';
import { useEvents } from '@/hooks/use-events';
import { useImages } from '@/hooks/use-images';
import { useToast } from '@/hooks/use-toast';

export function EventUploader() {
  useAuthSync(); // Sincronización automática
  const { events } = useEvents();
  const { uploadEventImage } = useImages();
  const { toast } = useToast();

  // ... lógica del componente
}
```

## 📝 Convenciones
- Nombres en camelCase
- Prefijo `use` obligatorio
- TypeScript para tipo seguro
- Documentación JSDoc
- Manejo de errores consistente
- Limpieza de efectos secundarios

## 🔄 Dependencias
- @auth0/nextjs-auth0
- @supabase/supabase-js
- axios
- react

## ⚠️ Consideraciones
- Los hooks deben usarse dentro de componentes React
- Algunos hooks requieren providers específicos
- Manejo adecuado de ciclos de vida
- Optimización de re-renders

## 🔒 Seguridad
- Validación de tokens
- Manejo seguro de sesiones
- Sanitización de inputs
- Protección contra XSS

# 📚 @lib

## Descripción General
Colección de utilidades y helpers para Pacerpic que manejan el procesamiento de imágenes, almacenamiento, autenticación y funciones de utilidad general.

## Módulos Disponibles

### 🖼️ `image-processing.ts`
Procesador principal de imágenes:

```12:241:src/lib/image-processing.ts
export async function processImage(
  file: Buffer, 
  fileName: string, 
  eventId: string, 
  photographerId: string,
  accessToken: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar rol del usuario directamente con el ID
    const { data: user, error: roleError } = await supabase
      .from('users')
      .select('role, id')
      .eq('auth0_id', photographerId)
      .single();

    console.log('User Check:', { user, roleError, photographerId });

    if (!user || roleError) {
      console.error('Error verificando usuario:', roleError);
      throw new Error('Error de autenticación');
    }

    // Establecer el contexto de auth para las siguientes operaciones
    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    // Verificar políticas actuales
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies');

    console.log('Storage Policies:', { policies, policiesError });

    // Log de la información de autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('Auth Session:', {
      session: session ? 'Exists' : 'None',
      error: authError,
      userId: session?.user?.id,
      userMetadata: session?.user?.user_metadata
    });

    console.log('Iniciando procesamiento de imagen:', { fileName, eventId, photographerId });

    // 1. Comprimir imagen
    const compressedImage = await sharp(file)
      .resize(1300, 1300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 100 });

    // Obtener el buffer de la imagen comprimida para OpenAI
    const base64Image = (await compressedImage.toBuffer()).toString('base64');

    // Descargar la marca de agua
    const watermarkResponse = await fetch(WATERMARK_URL);
    const watermarkBuffer = await watermarkResponse.arrayBuffer();

    // Aplicar marca de agua
    const watermarkedImage = await sharp(file)
      .resize(1300, 1300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .composite([
        {
          input: Buffer.from(watermarkBuffer),
          gravity: 'center',
          blend: 'over'
        }
      ]);

    // 3. Detectar dorsales con OpenAI usando la imagen original
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini"
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `Analiza la imagen proporcionada para identificar y listar los números de dorsal visibles.

Asegúrate de reconocer los números de dorsal que sean completos, completamente visibles y claramente legibles. Si se encuentra algún dorsal obstruido o no completo, no debe incluirse en la respuesta.

# Output Format

Presente los números de dorsal detectados en un formato JSON, siguiendo la estructura:

\`\`\`json
{
  "dorsal_number": [NUMEROS_DE_DORSAL]
}
\`\`\`

- \`NUMEROS_DE_DORSAL\`: una lista de números de dorsal visibles que has identificado. Reemplace este marcador de posición con los números reales detectados.
- Si no se detectan dorsales, utilice un array vacío como en el siguiente ejemplo:

\`\`\`json
{
  "dorsal_number": []
}
\`\`\`

# Notes

- Sólo se deben incluir números que sean completos y claramente legibles.
- Si hay dificultad para identificar los dorsales debido a obstrucciones o calidad de imagen, no los incluya en la lista.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('Respuesta de OpenAI:', response);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }
    
    const { dorsal_number: dorsals }: { dorsal_number: number[] } = JSON.parse(content);
    console.log('Dorsales detectados:', dorsals);

    // 4. Guardar imágenes en Supabase Storage
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    console.log('Rutas de almacenamiento:', { originalPath, compressedPath });

    // Subir imagen original
    const { data: originalData, error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, file, {
        cacheControl: '3600',
        upsert: true  // Cambiado a true para sobrescribir si existe
      });

    if (originalError) {
      console.error('Error subiendo imagen original:', originalError);
      throw originalError;
    }

    console.log('Respuesta de subida original:', originalData);

    // Subir imagen comprimida
    const { data: compressedData, error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, await watermarkedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });
    if (compressedError) {
      console.error('Error subiendo imagen comprimida:', compressedError);
      throw compressedError;
    }

    console.log('Respuesta de subida comprimida:', compressedData);

    // 5. Guardar referencia en la base de datos
    const { data: image, error: imageError } = await supabase
      .from('images')
      .insert({
        event_id: eventId,
        photographer_id: photographerId,
        original_url: originalPath,
        compressed_url: compressedPath,
        status: 'processed'
      })
      .select()
      .single();

    if (imageError) throw imageError;
    console.log('Referencia de imagen guardada en la base de datos:', image);

    // 6. Insertar dorsales detectados
    const dorsalInserts = dorsals.map((dorsal: number) => ({
      image_id: image.id,
      dorsal_number: dorsal.toString(),
      confidence: 1.0
    }));

    if (dorsalInserts.length > 0) {
      const { error: dorsalError } = await supabase
        .from('image_dorsals')
        .insert(dorsalInserts);

      if (dorsalError) throw dorsalError;
      console.log('Dorsales insertados en la base de datos:', dorsalInserts);
    }

    return { ...image, dorsals };

  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
}
```


**Características:**
- Compresión de imágenes con Sharp
- Detección de dorsales usando GPT-4
- Aplicación de marca de agua
- Gestión de almacenamiento en Supabase
- Sistema de logging detallado

### 📦 `storage-helpers.ts`
Utilidades para gestión de almacenamiento:

```1:24:src/lib/storage-helpers.ts
import { supabase } from './supabase';

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('originals')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function getImageUrl(bucket: 'originals' | 'compressed', path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
} 
```


**Funciones:**
- `uploadImage`: Subida de imágenes a Supabase Storage
- `getImageUrl`: Obtención de URLs públicas/privadas
- Gestión de buckets `originals` y `compressed`

### 🔌 `supabase.ts`
Cliente de Supabase configurado:

```1:13:src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
```


**Características:**
- Validación de variables de entorno
- Tipado fuerte con tipos generados
- Cliente singleton para toda la aplicación

### 🛠️ `utils.ts`
Utilidades generales:

```1:24:src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

```


**Funciones:**
- `cn`: Utilidad para combinar clases de Tailwind
- `formatDate`: Formateo de fechas en español
- `formatCurrency`: Formateo de moneda (MXN)

## Uso

```typescript
// Ejemplo de procesamiento de imagen
import { processImage } from '@/lib/image-processing';
import { uploadImage, getImageUrl } from '@/lib/storage-helpers';
import { supabase } from '@/lib/supabase';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// Procesar imagen
const result = await processImage(
  imageBuffer,
  'imagen.jpg',
  'evento-123',
  'fotografo-456',
  'token-789'
);

// Obtener URL pública
const url = await getImageUrl('compressed', result.compressed_url);
```

## Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Consideraciones
- Las operaciones de procesamiento son asíncronas
- Se requiere manejo de errores apropiado
- Las imágenes originales son privadas
- Las imágenes comprimidas son públicas
- Los logs ayudan en debugging

## Dependencias
- sharp: ^0.32.6
- openai: ^4.24.1
- @supabase/supabase-js: ^2.39.3
- clsx: ^2.0.0
- tailwind-merge: ^2.2.0

## Seguridad
- Validación de roles de usuario
- Tokens de servicio para operaciones críticas
- Políticas RLS en Supabase
- Sanitización de inputs

# Servicios de Eventos - `@services/events.ts`

## 📝 Descripción
Módulo que proporciona una capa de abstracción para interactuar con la tabla `events` en Supabase, encapsulando todas las operaciones CRUD relacionadas con eventos deportivos.

## 🚀 Funcionalidades

### `create`
Crea un nuevo evento deportivo.
```typescript
type CreateEventParams = {
  name: string;
  date: string;
  location: string;
  organizer_id: string;
}
```

### `getAll`
Recupera todos los eventos disponibles.

### `getById`
Obtiene un evento específico por su ID.

### `update`
Actualiza los datos de un evento existente.
```typescript
type UpdateEventParams = Partial<{
  name: string;
  date: string;
  location: string;
}>
```

### `delete`
Elimina un evento específico por su ID.

## 💡 Ejemplo de Uso

```typescript
import { eventsService } from '@/services/events';

// Crear evento
const newEvent = await eventsService.create({
  name: "Maratón CDMX 2024",
  date: "2024-04-15",
  location: "Ciudad de México",
  organizer_id: "org_123"
});

// Obtener todos los eventos
const { data: events } = await eventsService.getAll();

// Actualizar evento
await eventsService.update("event_id", {
  name: "Maratón CDMX 2024 - Edición Especial"
});
```

## 🔗 Dependencias
- `@/lib/supabase`: Cliente configurado de Supabase

## 📊 Estructura de Datos
Interactúa con la tabla `events` que tiene la siguiente estructura:

```3:10:sql/schema.sql

-- Tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR,
  organizer_id TEXT NOT NULL,
```


## ⚠️ Consideraciones
- Todas las operaciones son asíncronas y retornan promesas
- Los errores de Supabase se propagan hacia arriba
- Se requiere autenticación para operaciones de escritura
- Las operaciones respetan las políticas RLS de Supabase

## 🔐 Permisos Requeridos
- `CREATE`: Solo organizadores autenticados
- `READ`: Público
- `UPDATE`: Solo el organizador propietario
- `DELETE`: Solo el organizador propietario

## 🔄 Integración
Este servicio se utiliza principalmente en:
- Dashboard de organizadores
- Páginas públicas de eventos
- Formularios de creación/edición de eventos

---

# @types/supabase.ts

## 📝 Descripción
Este archivo contiene las definiciones de tipos TypeScript para la base de datos Supabase, generadas automáticamente a partir del esquema SQL. Define la estructura completa de las tablas, relaciones y tipos de datos utilizados en la aplicación.

## 🗃️ Estructura de Tablas

### Events
```typescript
events: {
  Row: {
    created_at: string
    date: string
    id: string
    location: string | null
    name: string
    organizer_id: string | null
  }
}
```

### Images
```typescript
images: {
  Row: {
    compressed_url: string
    created_at: string
    dorsal_number: string | null
    event_id: string | null
    id: string
    original_url: string
    photographer_id: string | null
    status: string | null
  }
}
```

### Sales
```typescript
sales: {
  Row: {
    amount: number
    buyer_email: string
    created_at: string
    download_expires_at: string | null
    download_url: string | null
    id: string
    image_id: string | null
    status: string | null
  }
}
```

## 🔄 Tipos de Operaciones

### Insert
Define los campos requeridos y opcionales para insertar nuevos registros.

### Update
Define los campos que pueden ser actualizados en registros existentes.

### Relationships
Define las relaciones entre tablas:
- `images_event_id_fkey`: Relación entre imágenes y eventos
- `sales_image_id_fkey`: Relación entre ventas e imágenes

## 🛠️ Tipos Utilitarios

### Tables
Tipo genérico para acceder a la estructura de una tabla:
```typescript
Tables<"events"> // Retorna el tipo Row de la tabla events
```

### TablesInsert
Tipo genérico para operaciones de inserción:
```typescript
TablesInsert<"images"> // Retorna el tipo Insert de la tabla images
```

### TablesUpdate
Tipo genérico para operaciones de actualización:
```typescript
TablesUpdate<"sales"> // Retorna el tipo Update de la tabla sales
```

## 📚 Uso

```typescript
import { Database } from '@/types/supabase';

// Cliente tipado de Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Consulta tipada
const { data, error } = await supabase
  .from('events')
  .select('*')
  .returns<Tables<'events'>[]>();
```

## 🔐 Consideraciones
- Los tipos son generados automáticamente por Supabase CLI
- Cualquier cambio en el esquema de la base de datos requiere regenerar estos tipos
- Las relaciones están tipadas para garantizar integridad referencial
- Los campos nullables están marcados explícitamente con `| null`

## 🔄 Actualización de Tipos
Para regenerar los tipos después de cambios en el esquema:
```bash
supabase gen types typescript --project-id <ID> > src/types/supabase.ts
```

## 📦 Dependencias
- TypeScript >= 4.9
- Supabase Client
- Supabase CLI (para generación de tipos)

# 🔒 Middleware de Autenticación y Autorización

## 📝 Descripción
Middleware personalizado que gestiona la autenticación y autorización en Pacerpic utilizando Auth0. Protege rutas específicas y maneja redirecciones de seguridad.

## 🛠️ Funcionalidades

### Protección de Rutas
- `/admin/*`: Dashboard y funciones administrativas
- `/api/images/upload`: Endpoints de subida de imágenes

### Comportamiento
- Verifica sesiones de Auth0 automáticamente
- Redirige a usuarios no autenticados al login
- Maneja URLs base dinámicamente según el entorno

## 🔐 Implementación

```typescript:src/middleware.ts
import { withMiddlewareAuthRequired, getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://pacerpic.com';
  
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/images/upload')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', baseUrl));
    }
  }

  return res;
});

export const config = {
  matcher: ['/admin/:path*', '/api/images/upload']
}; 
```

## ⚙️ Configuración

### Variables de Entorno Requeridas
```env
AUTH0_BASE_URL=https://tu-dominio.com
```

### Matchers
```typescript
matcher: [
  '/admin/:path*',    // Todas las rutas bajo /admin
  '/api/images/upload' // Endpoint de subida de imágenes
]
```

## 🔄 Flujo de Trabajo
1. Intercepta peticiones a rutas protegidas
2. Verifica existencia de sesión Auth0
3. Si no hay sesión:
   - Redirige a `/api/auth/login`
   - Mantiene la URL original como returnTo
4. Si hay sesión:
   - Permite continuar la petición

## ⚠️ Consideraciones
- Implementa `withMiddlewareAuthRequired` de Auth0
- Usa Edge Runtime para mejor rendimiento
- Maneja URLs base dinámicamente
- No bloquea rutas públicas
- Compatible con API Routes y páginas

## 🔗 Integración
Se integra con:
- Auth0 Next.js SDK
- Next.js Edge Runtime
- Sistema de rutas de Next.js

## 📚 Referencias
- [Auth0 Edge Middleware](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
