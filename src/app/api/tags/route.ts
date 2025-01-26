import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '@auth0/nextjs-auth0'

interface Tag {
  tags: {
    id: string;
    name: string;
  }
}

interface SupabaseResponse {
  data: Tag[] | null;
  error: {
    message: string;
  } | null;
}

export async function GET() {
  try {
    const session = await getSession()
    console.log("Session:", session?.user)

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Debug usuario
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')  // Cambiado para ver todos los campos
      .eq('auth0_id', session.user.sub)
      .single()

    console.log("DB User completo:", dbUser)
    console.log("User Error:", userError)

    if (!dbUser || userError) {
      return NextResponse.json({ 
        error: 'Usuario inválido', 
        details: userError,
        auth0_id: session.user.sub 
      }, { status: 400 })
    }

    // 2. Debug consulta de tags
    const { data: userTags, error: tagsError } = await supabase
      .from('user_tags')
      .select('*')
      .eq('user_id', dbUser.auth0_id)

    console.log("User Tags raw:", userTags)
    console.log("Tags Error:", tagsError)

    // 3. Si hay user_tags, obtener los tags
    if (userTags?.length) {
      const { data: tags, error: tagsDetailError } = await supabase
        .from('tags')
        .select('*')
        .in('id', userTags.map(ut => ut.tag_id))

      console.log("Tags finales:", tags)
      console.log("Tags Detail Error:", tagsDetailError)

      return NextResponse.json({ tags: tags || [] })
    }

    return NextResponse.json({ tags: [] })
  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Data esperada en el body: { tagId, imageIds: string[] }
    const body = await request.json()
    const { tagId, imageIds } = body

    if (!tagId || !imageIds?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificamos que el tag pertenezca al usuario
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!dbUser || userError) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    const { data: ownership } = await supabase
      .from('user_tags')
      .select('id')
      .match({ user_id: dbUser.id, tag_id: tagId })
      .maybeSingle()

    if (!ownership) {
      return NextResponse.json({ error: 'No tienes permiso para este tag' }, { status: 403 })
    }

    // Insertamos registros en image_tags (bulk)
    // Asumiendo que no queremos duplicados; si los permites, quita 'upsert: false'
    const payload = imageIds.map((imgId: string) => ({
      tag_id: tagId,
      image_id: imgId
    }))

    const { error: insertError } = await supabase
      .from('image_tags')
      .upsert(payload)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, assigned: imageIds.length }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
} 