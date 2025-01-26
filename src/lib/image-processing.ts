import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Job } from 'bull';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
const WATERMARK_VERTICAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoVerticalv2.png';
const WATERMARK_HORIZONTAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoHorizontalv2.png';
const WATERMARK_HORIZONTAL169 = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcohorizontal169.png'
const WATERMARK_VERTICAL169 = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcovertical169.png'

export async function processImage(
  file: Buffer, 
  fileName: string, 
  eventId: string, 
  photographerId: string,
  accessToken: string,
  job?: Job
) {
  try {
    console.log('🔄 Iniciando procesamiento de imagen:', fileName);
    
    // Verificar buffer y formato
    if (!file || file.length === 0) {
      throw new Error('Buffer inválido');
    }
    
    try {
      await sharp(file).metadata();
    } catch (err) {
      throw new Error('Formato de imagen no válido');
    }
    console.log('✅ Buffer verificado:', file.length, 'bytes');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          fetch: fetch.bind(globalThis),
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      }
    );

    // Verificar conexión a Supabase
    try {
      await supabase.auth.getSession();
      console.log('✅ Conexión a Supabase OK');
    } catch (err) {
      console.error('❌ Error conectando a Supabase:', err);
      throw err;
    }

    console.log('🔍 Verificando usuario:', photographerId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role,id')
      .eq('auth0_id', photographerId)
      .single();

    if (!user || userError) {
      console.error('❌ Error de autenticación:', userError);
      throw new Error('Error de autenticación');
    }

    console.log('✅ Usuario verificado, procesando imagen...');
    
    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    await job?.progress(10);

    // Obtener metadata para detectar relación de aspecto
    const meta = await sharp(file).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    const aspectRatio = width / height;

    // Determinar orientación y relación de aspecto
    const isVertical = height > width;
    const is169 = Math.abs(aspectRatio - 16/9) < Math.abs(aspectRatio - 4/3);
    
    // Seleccionar watermark adecuado
    const watermarkUrl = isVertical 
      ? (is169 ? WATERMARK_VERTICAL169 : WATERMARK_VERTICAL)
      : (is169 ? WATERMARK_HORIZONTAL169 : WATERMARK_HORIZONTAL);

    // Procesar imagen para IA primero
    const processedBufferForAI = await sharp(file)
      .resize(1300, 1300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    await job?.progress(30);

    // Procesar con OpenAI usando la imagen procesada
    const base64AI = processedBufferForAI.toString('base64');
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: `Analiza la imagen proporcionada para identificar y listar los números de dorsal visibles.

Asegúrate de reconocer los números de dorsal que sean completos y legibles. Si se encuentra algún dorsal obstruido, no lo incluyas.

# Output Format

\`\`\`json
{
  "dorsal_number": [NUMEROS_DE_DORSAL]
}
\`\`\`

- Si no se detectan dorsales, usa un array vacío.`
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64AI}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
      max_tokens: 2048
    });

    const { dorsal_number: dorsals } = JSON.parse(aiResponse.choices[0].message.content || '{}') || {
      dorsal_number: []
    };

    await job?.progress(50);

    // Aplicar marca de agua sobre imagen original
    const wmResponse = await fetch(watermarkUrl);
    const watermarkBuf = Buffer.from(await wmResponse.arrayBuffer());
    const resizedWM = await sharp(watermarkBuf)
      .resize(width, height, { 
        fit: 'contain',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    const finalImageWithWM = await sharp(file)
      .composite([{ 
        input: resizedWM, 
        gravity: 'center',
        blend: 'over'
      }])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    await job?.progress(70);

    // Generar versión comprimida para preview
    const compressedBuffer = await sharp(finalImageWithWM)
      .resize(1024, null, { fit: 'inside' })
      .jpeg({ quality: 60 })
      .toBuffer();

    // 5. Subir a buckets con transformación previa
    const originalUrl = `${eventId}/${fileName}`;
    const compressedUrl = `${eventId}/${fileName}`;
    
    // Subir versiones pre-transformadas
    const { error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalUrl, finalImageWithWM, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '3600',
        duplex: 'half',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    if (originalError) throw originalError;

    const { error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedUrl, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: 'public, max-age=31536000'
      });
    if (compressedError) throw compressedError;

    // Obtener URLs públicas directas
    const { data: { publicUrl: originalUrlData } } = supabase.storage
      .from('originals')
      .getPublicUrl(originalUrl);
      
    const { data: { publicUrl: compressedUrlData } } = supabase.storage
      .from('compressed')
      .getPublicUrl(compressedUrl);

    // 6. Registrar en BD con rutas relativas
    const { data: newImage, error: insertError } = await supabase
      .from('images')
      .insert({
        event_id: eventId,
        photographer_id: photographerId,
        original_url: originalUrl,  // Sin /originals/
        compressed_url: compressedUrl, // Sin /compressed/
        status: 'processed'
      })
      .select()
      .single();
    if (insertError) {
      throw insertError;
    }

    // 7. Guardar dorsales detectados
    const dorsalRecords = dorsals?.map((d: number) => ({
      image_id: newImage.id,
      dorsal_number: d.toString(),
      confidence: 1.0
    }));
    if (dorsalRecords?.length) {
      const { error: dorsalError } = await supabase
        .from('image_dorsals')
        .insert(dorsalRecords);
      if (dorsalError) {
        throw dorsalError;
      }
    }

    return { ...newImage, dorsals };
  } catch (err) {
    console.error('❌ Error en processImage:', err);
    throw err;
  }
}

async function uploadWithRetry(bucket: string, path: string, file: Buffer, attempts = 3) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  for (let i = 0; i < attempts; i++) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600',
          duplex: 'half'
        });
      
      if (!error) return;
      
      if (i === attempts - 1) throw error;
      
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      
    } catch (err) {
      if (i === attempts - 1) throw err;
      continue;
    }
  }
}