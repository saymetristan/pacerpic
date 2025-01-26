import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
const WATERMARK_VERTICAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoVerticalv2.png';
const WATERMARK_HORIZONTAL = 'https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/marcos-juntos/marcoHorizontalv2.png';

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

    // 1. Generar copia para OpenAI (temporal)
    const aiCopyBuffer = await sharp(file)
      .resize(1300, 1300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 2. Procesar con OpenAI
    const base64AI = aiCopyBuffer.toString('base64');
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
    const isVertical = (meta.height || 0) > (meta.width || 0);
    const watermarkUrl = isVertical ? WATERMARK_VERTICAL : WATERMARK_HORIZONTAL;
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

    // 4. Subir imagen con marca de agua
    const originalPath = `originals/${eventId}/${fileName}`;
    const { error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, finalImageWithWM, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (originalError) throw originalError;

    // 6. Registrar en BD
    const { data: newImage, error: insertError } = await supabase
      .from('images')
      .insert({
        event_id: eventId,
        photographer_id: photographerId,
        original_url: originalPath,
        compressed_url: originalPath,
        status: 'processed',
        tags: tag ? [tag] : []
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