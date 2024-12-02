export async function POST(req: Request) {
  const payload = await req.json()
  
  if (payload.type === 'image.processed') {
    // Actualizar UI via WebSocket
    // Notificar al usuario
  }
  
  return new Response('OK')
} 