# Plan de Tareas para Integrar Tags en PacerPic

1. **Creación de Campos y Relaciones en la Base de Datos (Revisar)**
   - Confirmar que existan:
     - Tabla `tags`
     - Tabla `user_tags`
     - Tabla `image_tags`
   - Verificar llaves foráneas y restricciones (unique, primary keys, etc.).

2. **Ajustes de Backend (Endpoints y Lógica)**
   - Crear un endpoint para obtener tags disponibles para un usuario en concreto (basado en su user_id).
   - Crear un endpoint para asignar un tag a una imagen (image_id + tag_id).
   - Manejar el caso de bulk assignments: múltiples imágenes a un tag o viceversa.

3. **Actualizaciones en la Interfaz de Subida (Upload Page)**
   - Agregar un selector de tags (multi-select) que muestre al usuario solo los tags que le pertenecen.
   - Permitir que, al subir nuevas imágenes, se asigne un tag de forma opcional.  
   - Posibilidad de hacer “bulk tagging” (tags simultáneos a varias imágenes).

4. **Actualizaciones en la Página de Galería (Event Page)**
   - Incorporar un filtro por tag disponible (se obtiene de la DB o del usuario).
   - Mostrar únicamente imágenes que tengan el tag seleccionado.

5. **Validaciones y Permisos**
   - Asegurar que solamente el usuario propietario de los tags los pueda asignar.
   - Manejar errores de seguridad o de asignación de tags inexistentes.

6. **Pruebas y QA**
   - Comprobar que el proceso de asignar tags en la subida de imágenes funcione en distintos escenarios (varios tags, varios usuarios).
   - Testear el filtro en la galería con tags relacionados e irrelevantes.

7. **Documentación**
   - Actualizar README o un archivo de documentación técnica explicando:
     - Nuevas rutas y ejemplos de uso.
     - Nuevo flujo de asignación de tags a usuarios e imágenes.
     - Ejemplos de filtrado en la galería.