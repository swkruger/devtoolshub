import { NextRequest, NextResponse } from 'next/server';
import { JwtSnippetsService } from '@/lib/services/jwt-snippets';
import { authServer } from '@/lib/auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const service = new JwtSnippetsService();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const snippet = await service.getSnippet(user.id, params.id);
    return NextResponse.json({ snippet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  try {
    const snippet = await service.updateSnippet(user.id, params.id, data);
    return NextResponse.json({ snippet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await service.deleteSnippet(user.id, params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // PATCH will be used to toggle favorite
  const user = await authServer.getUserProfile();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const snippet = await service.toggleFavorite(user.id, params.id);
    return NextResponse.json({ snippet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 