import sharp from 'sharp';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Usar URL de Supabase para la marca de agua
const WATERMARK_VERTICAL = `https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/vertical-juntos.png`;
const WATERMARK_HORIZONTAL = `https://wdddgjpmoxhfzehbhlvf.supabase.co/storage/v1/object/public/publib-pacerpic-image/horizontal-juntos.png`;

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

    // Verificar rol del usuario directamente con el ID
    const { data: user, error: roleError } = await supabase
      .from('users')
      .select('role, id')
      .eq('auth0_id', `auth0|${photographerId}`)
      .single();

    console.log('User Check:', { user, roleError, photographerId });

    if (!user || roleError) {
      console.error('Error verificando usuario:', roleError);
      throw new Error('Error de autenticación');
    }

    // Establecer el contexto de auth para las siguientes operaciones
    supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: '',
    });

    // Verificar políticas actuales
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies');

    console.log('Storage Policies:', { policies, policiesError });

    // Log de la información de autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('Auth Session:', {
      session: session ? 'Exists' : 'None',
      error: authError,
      userId: session?.user?.id,
      userMetadata: session?.user?.user_metadata
    });

    console.log('Iniciando procesamiento de imagen:', { fileName, eventId, photographerId });

    // Obtener dimensiones de la imagen original
    const metadata = await sharp(file).metadata();
    const isVertical = (metadata.height || 0) > (metadata.width || 0);
    
    // Descargar el marco según orientación
    const watermarkResponse = await fetch(isVertical ? WATERMARK_VERTICAL : WATERMARK_HORIZONTAL);
    const watermarkBuffer = await watermarkResponse.arrayBuffer();

    // Versión reducida para OpenAI (sin marco)
    const compressedImage = await sharp(file)
      .resize(1300, 1300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 });

    // Aplicar marco a imagen original
    const watermarkedImage = await sharp(file)
      .composite([
        {
          input: Buffer.from(watermarkBuffer),
          gravity: 'center',
          blend: 'over'
        }
      ]);

    // Obtener el buffer de la imagen comprimida para OpenAI
    const base64Image = (await compressedImage.toBuffer()).toString('base64');

    // 3. Detectar dorsales con OpenAI usando la imagen original
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `Analiza la imagen proporcionada para identificar y listar los números de dorsal visibles.

Asegúrate de reconocer los números de dorsal que sean completos, completamente visibles y claramente legibles. Si se encuentra algún dorsal obstruido o no completo, no debe incluirse en la respuesta.

# Output Format

Presente los números de dorsal detectados en un formato JSON, siguiendo la estructura:

\`\`\`json
{
  "dorsal_number": [NUMEROS_DE_DORSAL]
}
\`\`\`

- \`NUMEROS_DE_DORSAL\`: una lista de números de dorsal visibles que has identificado. Reemplace este marcador de posición con los números reales detectados.
- Si no se detectan dorsales, utilice un array vacío como en el siguiente ejemplo:

\`\`\`json
{
  "dorsal_number": []
}
\`\`\`

# Notes

- Sólo se deben incluir números que sean completos y claramente legibles.
- Si hay dificultad para identificar los dorsales debido a obstrucciones o calidad de imagen, no los incluya en la lista.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: {
        "type": "json_object"
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('Respuesta de OpenAI:', response);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }
    
    const { dorsal_number: dorsals }: { dorsal_number: number[] } = JSON.parse(content);
    console.log('Dorsales detectados:', dorsals);

    // 4. Guardar imágenes en Supabase Storage
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    console.log('Rutas de almacenamiento:', { originalPath, compressedPath });

    // Subir imagen original (CON marco)
    const { data: originalData, error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, await watermarkedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });

    if (originalError) {
      console.error('Error subiendo imagen original:', originalError);
      throw originalError;
    }

    console.log('Respuesta de subida original:', originalData);

    // Subir imagen comprimida (SIN marco)
    const { data: compressedData, error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, await compressedImage.toBuffer(), {
        cacheControl: '3600',
        upsert: true
      });

    if (compressedError) {
      console.error('Error subiendo imagen comprimida:', compressedError);
      throw compressedError;
    }

    console.log('Respuesta de subida comprimida:', compressedData);

    // 5. Guardar referencia en la base de datos
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

    if (imageError) throw imageError;
    console.log('Referencia de imagen guardada en la base de datos:', image);

    // 6. Insertar dorsales detectados
    const dorsalInserts = dorsals.map((dorsal: number) => ({
      image_id: image.id,
      dorsal_number: dorsal.toString(),
      confidence: 1.0
    }));

    if (dorsalInserts.length > 0) {
      const { error: dorsalError } = await supabase
        .from('image_dorsals')
        .insert(dorsalInserts);

      if (dorsalError) throw dorsalError;
      console.log('Dorsales insertados en la base de datos:', dorsalInserts);
    }

    return { ...image, dorsals };

  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
} 