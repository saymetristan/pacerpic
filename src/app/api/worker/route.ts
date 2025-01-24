import { createClient } from '@supabase/supabase-js';
import '../../workers/image-processor';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

export async function GET() {
  console.log('🚀 Worker endpoint iniciado');
  return new Response('Worker running', { status: 200 });
} 