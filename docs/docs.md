# Documentación Central del Proyecto: Pacerpic

---

## Visión del Proyecto
**Pacerpic** es una plataforma para la gestión y compra de fotografías en eventos deportivos. Se centra en tres tipos de usuarios principales: corredores, fotógrafos y organizadores de eventos. El MVP permitirá:
- **Corredores:** Buscar, visualizar y comprar fotos relacionadas con su dorsal sin necesidad de registrarse.
- **Fotógrafos:** Subir imágenes que serán procesadas automáticamente.
- **Organizadores:** Gestionar eventos y monitorear estadísticas básicas.

---

## Objetivos del MVP
1. Proveer una experiencia simplificada para corredores, permitiendo buscar y adquirir imágenes sin registro.
2. Implementar un flujo eficiente de subida y procesamiento de imágenes para fotógrafos.
3. Gestionar pagos con **Openpay** y asegurar la entrega de fotos sin marca de agua tras la compra.
4. Establecer una arquitectura modular y fácil de escalar.

---

## Flujo del Usuario

### Corredores
1. Ingresan su número de dorsal en el formulario de búsqueda.
2. Visualizan imágenes comprimidas con marca de agua relacionadas con su dorsal.
3. Seleccionan las imágenes que desean comprar y añaden al carrito.
4. Realizan el pago mediante Openpay.
5. Reciben un correo electrónico con enlaces temporales para descargar las imágenes sin marca de agua.

### Fotógrafos
1. Se registran e inician sesión.
2. Suben imágenes de los eventos mediante un formulario.
3. Las imágenes se comprimen automáticamente y se les añade una marca de agua.
4. Las imágenes procesadas se asocian a dorsales utilizando un modelo LLM.

### Organizadores
1. Se registran e inician sesión.
2. Crean y gestionan eventos.
3. Acceden a estadísticas básicas como:
   - Número de imágenes subidas.
   - Número de imágenes compradas por dorsal.

---

## Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (Forcemos la instalacion de la version 14, porque buscamos estabilidad. Usemos el comando npx create-next-app@14.2.18)
- **Bibliotecas de UI:**
  - **shadcn/ui:** Para componentes estilizados.
  - **MagicUI:** Para animaciones avanzadas.
- **Estilización:** Tailwind CSS
- **Autenticación:** Auth0

### Backend
- **Framework:** Next.js API Routes
- **Procesamiento de Imágenes:** Sharp
- **Almacenamiento de Imágenes:** Supabase Storage
- **Base de Datos:** Supabase PostgreSQL
- **Pagos:** Openpay o Stripe

### Herramientas Adicionales
- **Redis:** Para gestionar colas de trabajos en el procesamiento de imágenes (opcional en este MVP si la carga de imágenes es baja, pero recomendado si los fotógrafos suben muchas imágenes simultáneamente).

---

## Arquitectura del Sistema

### Frontend (Next.js)
- Páginas públicas para corredores.
- Dashboard privado para fotógrafos y organizadores.
- Formularios y galerías interactivas.

### Backend (Next.js API Routes)
- Rutas para subir imágenes, buscar imágenes y manejar pagos.

### Procesamiento de Imágenes
- **Compresión y Marcas de Agua:** Uso de Sharp.
- **Etiquetado de Dorsales:** Uso de OpenAI GPT-4o.

### Base de Datos (Supabase PostgreSQL)
- Tablas para usuarios, imágenes y eventos.
- Relación entre imágenes y dorsales.

### Pagos y Descargas
- **Pagos:** Openpay.
- **Entrega:** Generación de enlaces únicos para descargas tras el pago.

---

## Flujo de Procesos Técnicos

### 1. Subida y Procesamiento de Imágenes
1. El fotógrafo sube una imagen a través del frontend.
2. La imagen se almacena en Supabase Storage (`originals/`).
3. Un trigger Comprime la imagen (1000x1000 px máx.) 
4. Se envía la imagen original a OpenAI para etiquetar el dorsal.
5. Se añade una marca de agua. y Almacena la imagen comprimida y con marca de agua en `compressed/`.
6. Se guarda la referencia en la base de datos.

### 2. Búsqueda de Imágenes
1. El corredor ingresa un número de dorsal en el formulario.
2. Una consulta a la base de datos devuelve las imágenes relacionadas con ese dorsal.
3. El frontend muestra una galería de previsualización con imágenes comprimidas.

### 3. Compra de Imágenes
1. El corredor selecciona imágenes y las añade al carrito.
2. El sistema genera un resumen del pedido y redirige al proveedor de pagos (MercadoPago u Openpay).
3. Tras el pago:
   - Un webhook actualiza el estado del pedido.
   - Se generan enlaces únicos para descargar imágenes sin marca de agua.
   - Los enlaces se envían al correo del comprador.

---

## Módulos Clave del Proyecto

### Frontend
1. **Páginas Públicas:**
   - `/public/search.js`: Búsqueda de imágenes por dorsal.
2. **Dashboard:**
   - `/dashboard/photographer/upload.js`: Subida de imágenes para fotógrafos.
   - `/dashboard/organizer/events.js`: Gestión de eventos para organizadores.
3. **Componentes Reutilizables:**
   - Navbar, Sidebar, Galería, Carrito, Modal.

### Backend
1. **Rutas API:**
   - `/api/images/upload.ts`: Maneja la subida y procesamiento de imágenes.
   - `/api/images/search.ts`: Devuelve imágenes asociadas a un dorsal.
   - `/api/payments/create.ts`: Genera preferencias de pago.
   - `/api/payments/webhook.ts`: Recibe notificaciones de pagos.
2. **Colas de Trabajo (Redis, opcional):**
   - Gestionar procesamiento masivo de imágenes en segundo plano.

---

## Plan de Desarrollo

### Semana 1: Configuración Inicial
1. Configurar Next.js con Tailwind CSS, shadcn/ui, magic ui y supabase authenticathion.
2. Configurar Supabase para almacenamiento y base de datos.

### Semana 2: Funcionalidad para Corredores
1. Implementar `/public/search.js` para búsqueda por dorsal.
2. Crear la galería de previsualización con imágenes comprimidas.

### Semana 3: Subida y Procesamiento de Imágenes
1. Implementar `/api/images/upload.ts` para manejar la subida.
2. Configurar compresión y marcas de agua con Sharp.
3. Integrar OpenAI para etiquetado de dorsales.

### Semana 4: Pagos y Descargas
1. Implementar `/api/payments/create.ts` y redirección a MercadoPago u Openpay.
2. Configurar `/api/payments/webhook.ts` para manejar notificaciones.
3. Generar enlaces únicos para descargas tras el pago.

### Semana 5: Pruebas e Integración
1. Conectar frontend y backend.
2. Probar el flujo completo para corredores y fotógrafos.
3. Ajustar detalles de UX y mensajes de estado.
HOLA