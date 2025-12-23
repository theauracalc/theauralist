import { createClient } from '@supabase/supabase-js'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let cachedFingerprint = localStorage.getItem('aura_fingerprint')
let cachedUserId = localStorage.getItem('aura_user_id')

export async function getFingerprint() {
  if (cachedFingerprint) return cachedFingerprint
  
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  cachedFingerprint = result.visitorId
  localStorage.setItem('aura_fingerprint', cachedFingerprint)
  return cachedFingerprint
}

export async function getAnonymousUserId() {
  // Return cached user ID immediately if available
  if (cachedUserId) return parseInt(cachedUserId)
  
  const fingerprint = await getFingerprint()
  
  const { data: existing } = await supabase
    .from('people')
    .select('id')
    .eq('fingerprint', fingerprint)
    .maybeSingle()
  
  if (existing) {
    cachedUserId = existing.id.toString()
    localStorage.setItem('aura_user_id', cachedUserId)
    return existing.id
  }
  
  const { data: newUser } = await supabase
    .from('people')
    .insert({
      name: `Anon_${fingerprint.slice(0, 8)}`,
      fingerprint,
      approved: true,
      score: 150,
      base_score: 150
    })
    .select('id')
    .single()
  
  if (newUser) {
    cachedUserId = newUser.id.toString()
    localStorage.setItem('aura_user_id', cachedUserId)
    return newUser.id
  }
}
