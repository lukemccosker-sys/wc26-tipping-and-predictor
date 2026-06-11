import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = Deno.env.get("API_FOOTBALL_KEY");
    const resp = await fetch("https://v3.football.api-sports.io/fixtures?live=all&league=1&season=2026", {
      headers: { "x-apisports-key": apiKey }
    });
    const data = await resp.json();
    const fixtures = data?.response || [];

    // Get existing live matches to update/create/delete
    const existing = await base44.asServiceRole.entities.LiveMatch.list();

    // Build map of current live fixture IDs
    const liveIds = new Set(fixtures.map(f => String(f.fixture.id)));

    // Delete matches that are no longer live
    for (const em of existing) {
      if (!liveIds.has(em.fixtureId)) {
        await base44.asServiceRole.entities.LiveMatch.delete(em.id);
      }
    }

    // Upsert each live match
    for (const f of fixtures) {
      const fixtureId = String(f.fixture.id);
      const matchData = {
        fixtureId,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        homeScore: f.goals.home ?? 0,
        awayScore: f.goals.away ?? 0,
        minute: f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : f.fixture.status.short,
        status: f.fixture.status.short,
      };
      const existingMatch = existing.find(e => e.fixtureId === fixtureId);
      if (existingMatch) {
        await base44.asServiceRole.entities.LiveMatch.update(existingMatch.id, matchData);
      } else {
        await base44.asServiceRole.entities.LiveMatch.create(matchData);
      }
    }

    return Response.json({ updated: fixtures.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});