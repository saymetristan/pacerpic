-- Configuración de Storage para PacerPic
-- Fecha: 2024-03-21

-- ============= BUCKETS =============

-- Crear buckets para imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('originals', 'originals', false),
  ('compressed', 'compressed', true);

-- ============= POLÍTICAS =============

-- Política para subir imágenes originales (solo fotógrafos)
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