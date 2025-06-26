export async function submitScore(nickname: string, score: number, difficulty: string) {
  const config = useRuntimeConfig() as unknown as {
    public: {
      supabaseUrl: string
      supabaseAnonKey: string
    }
  }

  const res = await fetch(`${config.public.supabaseUrl}/rest/v1/scores`, {
    method: 'POST',
    headers: {
      apikey: config.public.supabaseAnonKey,
      Authorization: `Bearer ${config.public.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ nickname, score, difficulty })
  })

  if (!res.ok) {
    console.error('[submitScore] Error:', await res.text())
    return null
  }

  return await res.json()
}