import { NextRequest, NextResponse } from 'next/server';
import { JwtSnippetsService } from '@/lib/services/jwt-snippets';
import { authServer } from '@/lib/auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const service = new JwtSnippetsService();

export async function GET(req: NextRequest) {
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const is_favorite = searchParams.get('is_favorite');
  const algorithm = searchParams.get('algorithm') || undefined;
  const tags = searchParams.getAll('tags');

  try {
    const snippets = await service.getSnippets(user.id, {
      search,
      is_favorite: is_favorite === undefined ? undefined : is_favorite === 'true',
      algorithm,
      tags: tags.length > 0 ? tags : undefined,
    });
    return NextResponse.json({ snippets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  try {
    const snippet = await service.createSnippet(user.id, data);
    return NextResponse.json({ snippet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 