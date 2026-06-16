import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const base44Admin = base44.asServiceRole;

    const [predictions, officialResults] = await Promise.all([
      base44Admin.entities.Prediction.list(),
      base44Admin.entities.OfficialResult.list(),
    ]);

    const lockedMatchIds = new Set(officialResults.map(r => r.matchId));

    // Find all locked predictions not yet marked final
    const toFinalize = predictions.filter(p =>
      lockedMatchIds.has(p.matchId) && p.status !== 'final'
    );

    // Group by playerId+matchId — if dupes remain, keep latest by created_date, delete rest
    const groups = {};
    for (const p of toFinalize) {
      const key = `${p.playerId}__${p.matchId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }

    let deleted = 0;
    let finalized = 0;
    const errors = [];

    for (const [key, preds] of Object.entries(groups)) {
      const sorted = preds.slice().sort((a, b) => {
        const at = a.created_date ? new Date(a.created_date).getTime() : 0;
        const bt = b.created_date ? new Date(b.created_date).getTime() : 0;
        return bt - at;
      });

      const keeper = sorted[0];
      const stale = sorted.slice(1);

      for (const s of stale) {
        try {
          await base44Admin.entities.Prediction.delete(s.id);
          deleted++;
          await new Promise(r => setTimeout(r, 400));
        } catch (e) {
          errors.push(`delete ${s.id}: ${e.message}`);
        }
      }

      try {
        await base44Admin.entities.Prediction.update(keeper.id, { status: 'final' });
        finalized++;
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        errors.push(`finalize ${keeper.id}: ${e.message}`);
      }
    }

    return Response.json({ deleted, finalized, remaining: toFinalize.length, errors: errors.slice(0, 10) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});