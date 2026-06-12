import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { playerId, matchId, homeScore, awayScore } = await req.json();

        if (!playerId || !matchId || homeScore == null || awayScore == null) {
            return Response.json({ error: 'Missing required fields: playerId, matchId, homeScore, awayScore' }, { status: 400 });
        }

        const existing = await base44.asServiceRole.entities.Prediction.filter({ playerId, matchId });

        if (existing.length > 0) {
            // Update the most recent one
            const sorted = existing.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
            await base44.asServiceRole.entities.Prediction.update(sorted[0].id, { homeScore: +homeScore, awayScore: +awayScore });
            return Response.json({ success: true, action: 'updated', id: sorted[0].id });
        } else {
            const created = await base44.asServiceRole.entities.Prediction.create({ playerId, matchId, homeScore: +homeScore, awayScore: +awayScore });
            return Response.json({ success: true, action: 'created', id: created.id });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});