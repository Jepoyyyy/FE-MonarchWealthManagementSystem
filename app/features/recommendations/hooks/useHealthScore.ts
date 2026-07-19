import { useState, useEffect } from 'react';
import { RecommendationApi } from '../api';
import type { HealthScoreDTO } from '../recommendations.types';

export function useHealthScore() {
  const [health, setHealth] = useState<HealthScoreDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchHealth() {
      try {
        setLoading(true);
        const res = await RecommendationApi.health();
        if (mounted) {
          setHealth(res.data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load health score');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchHealth();
    return () => { mounted = false; };
  }, []);

  return { health, loading, error };
}
