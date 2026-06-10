import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const POLL_INTERVAL = 15000;

export function usePoolData() {
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [officialResults, setOfficialResults] = useState([]);
  const [bracketPredictions, setBracketPredictions] = useState([]);
  const [poolSettings, setPoolSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async () => {
    const [pl, pr, or_, bp, ps] = await Promise.all([
      base44.entities.Player.list(),
      base44.entities.Prediction.list(),
      base44.entities.OfficialResult.list(),
      base44.entities.BracketPrediction.list(),
      base44.entities.PoolSettings.list(),
    ]);
    setPlayers(pl || []);
    setPredictions(pr || []);
    setOfficialResults(or_ || []);
    setBracketPredictions(bp || []);
    setPoolSettings(ps?.[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  return { players, predictions, officialResults, bracketPredictions, poolSettings, loading, refresh };
}