-- Triggers para procesamiento de imágenes
-- ============= FUNCIONES =============

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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============= TRIGGERS =============

-- Trigger para nuevas imágenes
DROP TRIGGER IF EXISTS on_image_created ON images;
CREATE TRIGGER on_image_created
  AFTER INSERT ON images
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_image();

-- Trigger para cambios de estado
DROP TRIGGER IF EXISTS on_image_updated ON images;
CREATE TRIGGER on_image_updated
  AFTER UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION handle_image_status_change();

-- ============= POLÍTICAS RLS =============

-- Política para subir imágenes (fotógrafos, admin y organizadores)
CREATE POLICY "Usuarios autorizados pueden subir imágenes" ON images
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('photographer', 'admin', 'organizer')
    )
  );

-- Política para actualizar estado
DROP POLICY IF EXISTS "Sistema y admin pueden actualizar estado" ON images;
CREATE POLICY "Sistema y admin pueden actualizar estado" ON images
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'service_role')
    )
  )
  WITH CHECK (true);

-- Política para leer imágenes
CREATE POLICY "Todos pueden ver imágenes procesadas" ON images
  FOR SELECT TO public
  USING (status = 'processed');