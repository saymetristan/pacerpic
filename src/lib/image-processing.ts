import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
const WATERMARK_VERTICAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoVerticalv2.png';
const WATERMARK_HORIZONTAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoHorizontalv2.png';
const WATERMARK_HORIZONTAL169 = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcohorizontal169.png';
const WATERMARK_VERTICAL169 = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcovertical169.png';
const WATERMARK_CUADRADO = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcounouno.png'

export async function processImage(
  file: Buffer, 
  fileName: string, 
  eventId: string, 
  photographerId: string,
  accessToken: string,
  tag?: string
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

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role,id')
      .eq('auth0_id', photographerId)
      .single();

    if (!user || userError) {
      throw new Error('Error de autenticación');
    }

    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    // 1. Generar copia para OpenAI y comprimida
    const compressedBuffer = await sharp(file)
      .resize(1300, 1300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 2. Procesar con OpenAI
    const base64AI = compressedBuffer.toString('base64');
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

    // 3. Procesar imagen original con marca de agua
    const meta = await sharp(file).metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;
    const aspectRatio = width / height;
    const isVertical = height > width;

    let watermarkUrl;
    if (isVertical) {
      // Para imágenes verticales
      if (Math.abs(aspectRatio - 1) < 0.1) {
        watermarkUrl = WATERMARK_CUADRADO;
      } else {
        watermarkUrl = Math.abs(aspectRatio - 9/16) < Math.abs(aspectRatio - 3/4) 
          ? WATERMARK_VERTICAL169 
          : WATERMARK_VERTICAL;
      }
    } else {
      // Para imágenes horizontales
      if (Math.abs(aspectRatio - 1) < 0.1) {
        watermarkUrl = WATERMARK_CUADRADO;
      } else {
        watermarkUrl = Math.abs(aspectRatio - 16/9) < Math.abs(aspectRatio - 4/3) 
          ? WATERMARK_HORIZONTAL169 
          : WATERMARK_HORIZONTAL;
      }
    }

    const wmResponse = await fetch(watermarkUrl);
    const watermarkBuf = Buffer.from(await wmResponse.arrayBuffer());

    const resizedWM = await sharp(watermarkBuf)
      .resize(meta.width, meta.height, { fit: 'fill' })
      .png()
      .toBuffer();

    const finalImageWithWM = await sharp(file)
      .composite([{ input: resizedWM, gravity: 'center' }])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    // 4. Subir imágenes
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;

    console.log('Rutas de almacenamiento:', { originalPath, compressedPath });

    // Subir imagen original con marca de agua
    const { data: originalData, error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, finalImageWithWM, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    console.log('Respuesta de subida original:', {
      data: originalData,
      error: originalError,
      contentType: 'image/jpeg',
      size: finalImageWithWM.length
    });

    if (originalError) throw originalError;

    // Subir versión comprimida
    const { data: compressedData, error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, compressedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    console.log('Respuesta de subida comprimida:', {
      data: compressedData,
      error: compressedError,
      contentType: 'image/jpeg',
      size: compressedBuffer.length
    });

    if (compressedError) throw compressedError;

    // Obtener URLs públicas para verificación
    const originalUrl = supabase.storage.from('originals').getPublicUrl(originalPath);
    const compressedUrl = supabase.storage.from('compressed').getPublicUrl(compressedPath);

    console.log('URLs generadas:', {
      original: originalUrl,
      compressed: compressedUrl
    });

    // 6. Registrar en BD
    const { data: newImage, error: insertError } = await supabase
      .from('images')
      .insert({
        event_id: eventId,
        photographer_id: photographerId,
        original_url: originalPath,
        compressed_url: compressedPath,
        status: 'processed',
        tag: tag || null
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
    throw err;
  }
}