export interface UserTimezone {
  id: string
  user_id: string
  timezone: string
  label: string
  display_order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserTimezoneData {
  timezone: string
  label: string
  display_order?: number
  is_default?: boolean
}

export interface UpdateUserTimezoneData {
  label?: string
  display_order?: number
}

export interface TimezoneSlot {
  id: string
  timezone: string
  label: string
  isDefault?: boolean
}

export interface TimezoneStats {
  total: number
  oldest: string | null
  newest: string | null
}