import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Job } from 'bull';

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
  job?: Job
) {
  try {
    console.log('🔄 Iniciando procesamiento de imagen:', fileName);
    
    // Verificar buffer
    if (!file || file.length === 0) {
      throw new Error('Buffer inválido');
    }
    console.log('✅ Buffer verificado:', file.length, 'bytes');

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

    console.log('🔄 Generando copia para IA...');
    const aiCopyBuffer = await sharp(file)
      .resize(1300, 1300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    console.log('✅ Copia para IA generada');

    await job?.progress(20);

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

    await job?.progress(40);

    // 3. Comprimir imagen original a <5MB (ajustar calidad si quieres más control)
    let compressedOriginal = await sharp(file)
      .jpeg({ quality: 85, chromaSubsampling: '4:2:0', mozjpeg: true })
      .toBuffer();
    while (compressedOriginal.byteLength > 5 * 1024 * 1024) {
      compressedOriginal = await sharp(compressedOriginal)
        .jpeg({ quality: 75, chromaSubsampling: '4:2:0', mozjpeg: true })
        .toBuffer();
    }

    await job?.progress(60);

    // 4. Detectar orientación y aplicar watermark
    const meta = await sharp(compressedOriginal).metadata();
    const isVertical = (meta.height || 0) > (meta.width || 0);
    const watermarkUrl = isVertical ? WATERMARK_VERTICAL : WATERMARK_HORIZONTAL;
    const wmResponse = await fetch(watermarkUrl);
    const watermarkBuf = Buffer.from(await wmResponse.arrayBuffer());
    const resizedWM = await sharp(watermarkBuf)
      .resize(meta.width, meta.height, { fit: 'fill' })
      .png()
      .toBuffer();
    const finalImageWithWM = await sharp(compressedOriginal)
      .composite([{ input: resizedWM, gravity: 'center' }])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    await job?.progress(80);

    // 5. Subir a buckets (ejemplo: bucket originals y compressed)
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    const { error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, finalImageWithWM, {
        cacheControl: '3600',
        upsert: true
      });
    if (originalError) {
      throw originalError;
    }

    const { error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, finalImageWithWM, {
        cacheControl: '3600',
        upsert: true
      });
    if (compressedError) {
      throw compressedError;
    }

    // 6. Registrar en BD
    const { data: newImage, error: insertError } = await supabase
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