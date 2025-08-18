"use client"

import { createSupabaseClient } from "@/lib/supabase"

const STORAGE_KEY = "dth:favorites"

export type FavoriteToolId = string

export async function loadServerFavorites(): Promise<Set<FavoriteToolId>> {
  try {
    const supabase = createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Set()
    const { data, error } = await supabase
      .from('user_tool_favorites')
      .select('tool_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) return new Set()
    return new Set((data || []).map((r: any) => r.tool_id as string))
  } catch {
    return new Set()
  }
}

export async function toggleServerFavorite(toolId: string, shouldFavorite: boolean): Promise<void> {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (shouldFavorite) {
    try {
      await supabase.from('user_tool_favorites').insert({ user_id: user.id, tool_id: toolId })
    } catch {}
  } else {
    try {
      await supabase.from('user_tool_favorites').delete().eq('tool_id', toolId).eq('user_id', user.id)
    } catch {}
  }
}

// Local storage helpers for offline/anon persistence
export function loadLocalFavorites(): Set<FavoriteToolId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveLocalFavorites(favs: Set<FavoriteToolId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favs)))
  } catch {}
}


