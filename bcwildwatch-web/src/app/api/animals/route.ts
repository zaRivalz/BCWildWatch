import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAnimals } from '@/lib/dataverse';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ animals: await getAnimals() });
  } catch {
    return NextResponse.json({ error: 'Failed to load animals.' }, { status: 502 });
  }
}
