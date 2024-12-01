-- Esquema inicial de la base de datos para PacerPic
-- ============= TABLAS =============

-- Tabla de eventos
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  date DATE NOT NULL,
  location VARCHAR,
  organizer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de imágenes
CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  photographer_id UUID REFERENCES auth.users(id),
  original_url TEXT NOT NULL,
  compressed_url TEXT NOT NULL,
  dorsal_number VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de ventas
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_id UUID REFERENCES images(id),
  buyer_email VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  download_url TEXT,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
); 