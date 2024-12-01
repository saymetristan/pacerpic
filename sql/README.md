# SQL Scripts para PacerPic

Este directorio contiene los scripts SQL necesarios para configurar la base de datos y el almacenamiento en Supabase.

## Archivos

- `schema.sql`: Definición de tablas y relaciones
- `storage.sql`: Configuración de buckets y políticas de almacenamiento

## Cómo aplicar

1. Accede al panel de Supabase
2. Ve a SQL Editor
3. Copia y pega el contenido de cada archivo
4. Ejecuta los scripts en el siguiente orden:
   - Primero `schema.sql`
   - Luego `storage.sql`

## Notas importantes

- Asegúrate de habilitar RLS (Row Level Security) en todas las tablas
- Verifica que los buckets se hayan creado correctamente en la sección Storage
- Comprueba las políticas de acceso en la sección Authentication 