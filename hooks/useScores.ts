export async function useScores(difficulty: string = 'easy') {
    const config = useRuntimeConfig() as unknown as {
    public: {
      supabaseUrl: string
      supabaseAnonKey: string
    }
  }

  const url = `${config.public.supabaseUrl}/rest/v1/scores?difficulty=eq.${difficulty}&order=score.desc&limit=10`

  const res = await fetch(url, {
    headers: {
      apikey: config.public.supabaseAnonKey,
      Authorization: `Bearer ${config.public.supabaseAnonKey}`,
    }
  })

  if (!res.ok) {
    console.error('[useScores] Failed to fetch scores:', await res.text())
    return []
  }

  return await res.json()
}