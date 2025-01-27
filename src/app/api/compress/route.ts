import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { file, fileName, eventId } = await req.json()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const buffer = Buffer.from(file, 'base64')
  const compressedBuffer = await sharp(buffer)
    .resize(1300, 1300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer()

  const compressedPath = `compressed/${eventId}/${fileName}`
  
  await supabase.storage
    .from('compressed')
    .upload(compressedPath, compressedBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  return Response.json({ success: true, path: compressedPath })
} 