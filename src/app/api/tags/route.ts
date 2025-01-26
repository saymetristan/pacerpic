import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '@auth0/nextjs-auth0'

interface Tag {
  tags: {
    id: string;
    name: string;
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Debug: Obtener el usuario
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', session.user.sub)
      .single()

    console.log('Auth0 sub:', session.user.sub)
    console.log('DB User:', dbUser)
    console.log('User Error:', userError)

    if (!dbUser || userError) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    // Debug: Obtener tags
    const { data: tags, error: tagsError } = await supabase
      .from('user_tags')
      .select(`
        tags (
          id,
          name
        )
      `)
      .eq('user_id', dbUser.id) as { data: Tag[] | null, error: any }

    console.log('User ID:', dbUser.id)
    console.log('Tags:', tags)
    console.log('Tags Error:', tagsError)

    if (tagsError) {
      return NextResponse.json({ error: tagsError.message }, { status: 500 })
    }

    const formattedTags = tags?.map(t => ({
      id: t.tags.id,
      name: t.tags.name
    })) || []

    return NextResponse.json({ tags: formattedTags })
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