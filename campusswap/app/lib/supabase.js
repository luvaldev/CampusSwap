import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Sanitizar la URL para quitar comillas accidentales de copiar y pegar en Vercel
const supabaseUrl = rawUrl ? rawUrl.replace(/^['"]|['"]$/g, '').trim() : ""
const isValidUrl = supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://")

if (!isValidUrl || !supabaseKey) {
  console.warn("Faltan o están mal configuradas las variables de entorno de Supabase")
}

export const supabase = (isValidUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

