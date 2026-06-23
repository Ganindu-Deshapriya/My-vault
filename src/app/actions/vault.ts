'use server'

import { createClient } from '@/lib/supabase/server'

export type VaultItemType = 'password' | 'api_key' | 'note' | 'card'

export interface VaultItemRow {
  id: string
  user_id: string
  item_type: VaultItemType
  title: string
  encrypted_data: string
  created_at: string
  updated_at: string
  favorite: boolean
  tags: string[]
}

export async function getVaultItems(): Promise<VaultItemRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .order('favorite', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) return []
  return data
}

export async function createVaultItem(params: {
  item_type: VaultItemType
  title: string
  encrypted_data: string
  tags?: string[]
  favorite?: boolean
}): Promise<{ data?: VaultItemRow; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('vault_items')
    .insert({
      user_id: user.id,
      item_type: params.item_type,
      title: params.title,
      encrypted_data: params.encrypted_data,
      tags: params.tags || [],
      favorite: params.favorite || false,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateVaultItem(
  id: string,
  params: Partial<{
    title: string
    encrypted_data: string
    tags: string[]
    favorite: boolean
  }>
): Promise<{ data?: VaultItemRow; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vault_items')
    .update({ ...params, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteVaultItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('vault_items').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vault_items')
    .update({ favorite })
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}
