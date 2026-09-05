import { NextResponse } from 'next/server';
import { getAllSubmissions, deleteSubmissionById, getDashboardMetrics } from '@/lib/storage';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const archetype = searchParams.get('archetype') || 'all';
    const metricsOnly = searchParams.get('metrics') === 'true';

    if (metricsOnly) {
      const metrics = await getDashboardMetrics();
      return NextResponse.json({ success: true, metrics });
    }

    const [items, metrics] = await Promise.all([
      getAllSubmissions({ search, type, archetype }),
      getDashboardMetrics()
    ]);

    return NextResponse.json({
      success: true,
      items,
      metrics
    });
  } catch (error) {
    console.error('API /api/responses GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve submissions.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    await deleteSubmissionById(id);
    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('API /api/responses DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
