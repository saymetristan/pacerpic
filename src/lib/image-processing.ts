import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WATERMARK_VERTICAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/vertical-juntos.png';
const WATERMARK_HORIZONTAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/horizontal-juntos.png';

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

    const { data: user, error: roleError } = await supabase
      .from('users')
      .select('role, id')
      .eq('auth0_id', photographerId)
      .single();

    if (!user || roleError) {
      throw new Error('Error de autenticación');
    }

    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    // Obtenemos metadatos: alto y ancho de la imagen original
    const metadata = await sharp(file).metadata();
    const isVertical = (metadata.height || 0) > (metadata.width || 0);

    // Esta imagen reducida va para OpenAI (máximo 1024x1024)
    const resizedForAI = await sharp(file)
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Descarga el watermark según la orientación
    const watermarkResponse = await fetch(isVertical ? WATERMARK_VERTICAL : WATERMARK_HORIZONTAL);
    const watermarkBuffer = await watermarkResponse.arrayBuffer();

    // Ajusta el watermark al tamaño exacto de la imagen original
    const resizedWatermark = await sharp(Buffer.from(watermarkBuffer))
      .resize(metadata.width, metadata.height, {
        fit: 'fill'
      })
      .png()
      .toBuffer();

    // Aplica el watermark sobre la imagen original
    const watermarkedImage = await sharp(file)
      .composite([
        {
          input: resizedWatermark,
          gravity: 'center'
        }
      ])
      .jpeg({ quality: 85 });

    // Llamada a OpenAI con la imagen reducida
    const base64Image = resizedForAI.toString('base64');
    const response = await openai.chat.completions.create({
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
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const { dorsal_number: dorsals } = JSON.parse(content);

    // Subimos imagen con watermark (original dimensions) a Supabase
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    
    const { error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, await watermarkedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });
    if (originalError) {
      throw originalError;
    }

    // Subimos la misma imagen con watermark al bucket compressed (puede ser la misma)
    const { error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, await watermarkedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });
    if (compressedError) {
      throw compressedError;
    }

    // Insertamos la referencia en la base de datos
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
    if (imageError) {
      throw imageError;
    }

    // Asociamos los dorsales detectados
    const dorsalInserts = dorsals.map((d: number) => ({
      image_id: image.id,
      dorsal_number: d.toString(),
      confidence: 1.0
    }));
    if (dorsalInserts.length > 0) {
      const { error: dorsalError } = await supabase
        .from('image_dorsals')
        .insert(dorsalInserts);
      if (dorsalError) {
        throw dorsalError;
      }
    }

    return { ...image, dorsals };
  } catch (error) {
    throw error;
  }
}