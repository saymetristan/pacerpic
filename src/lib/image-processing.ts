import sharp from 'sharp';
import OpenAI from 'openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processImage(
  file: Buffer, 
  fileName: string, 
  eventId: string, 
  photographerId: string,
  accessToken: string
) {
  try {
    const supabase = createServerComponentClient({ 
      cookies,
      options: {
        db: {
          schema: 'public'
        },
        auth: {
          persistSession: false
        }
      }
    });

    console.log('Iniciando procesamiento de imagen:', { fileName, eventId, photographerId });

    // 1. Comprimir imagen
    const compressedImage = await sharp(file)
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 });

    // Obtener el buffer de la imagen comprimida para OpenAI
    const compressedBuffer = await compressedImage.toBuffer();

    // 2. Añadir marca de agua a una copia de la imagen comprimida
    const watermarkedImage = await sharp(compressedBuffer).composite([{
      input: process.cwd() + '/public/watermark.png',
      gravity: 'center',
      opacity: 0.5
    }]);

    // 3. Detectar dorsales con OpenAI usando la imagen comprimida
    const base64Image = compressedBuffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": "Analiza la imagen proporcionada y determina qué números de dorsal se pueden ver. Proporciona la respuesta de forma estructurada.\n\n# Output Format\n\nEntregue la respuesta en formato JSON, incluyendo exclusivamente los números de dorsal visibles.\n\n```json\n{\n  \"dorsal_number\": [123, 456, 789]  // Reemplace estos números de ejemplo con los dorsales que detecte en la imagen.\n}\n```\n\n# Notes\n\n- Solamente deben incluirse números de dorsal visibles y claramente legibles.\n- Si no se detectan dorsales en la imagen, la respuesta debe ser un array vacío:\n\n```json\n{\n  \"dorsal_number\": []\n}\n```"
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

    const { dorsal_number: dorsals } = JSON.parse(response.choices[0].message.content);
    console.log('Dorsales detectados:', dorsals);

    // 4. Guardar imágenes en Supabase Storage
    const originalPath = `originals/${eventId}/${fileName}`;
    const compressedPath = `compressed/${eventId}/${fileName}`;
    console.log('Rutas de almacenamiento:', { originalPath, compressedPath });

    // Subir imagen original
    const { data: originalData, error: originalError } = await supabase.storage
      .from('originals')
      .upload(originalPath, file, {
        cacheControl: '3600',
        upsert: true  // Cambiado a true para sobrescribir si existe
      });

    if (originalError) {
      console.error('Error subiendo imagen original:', originalError);
      throw originalError;
    }

    console.log('Respuesta de subida original:', originalData);

    // Subir imagen comprimida
    const { data: compressedData, error: compressedError } = await supabase.storage
      .from('compressed')
      .upload(compressedPath, await watermarkedImage.toBuffer(), {
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
    const dorsalInserts = dorsals.map(dorsal => ({
      image_id: image.id,
      dorsal_number: dorsal.toString(),
      confidence: 1.0 // Por ahora usamos confianza máxima ya que GPT-4 no nos da este valor
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