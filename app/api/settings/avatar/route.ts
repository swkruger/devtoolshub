import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const avatarFile = formData.get('avatar') as File
    const userId = formData.get('userId') as string

    if (!avatarFile) {
      return NextResponse.json({ error: 'No avatar file provided' }, { status: 400 })
    }

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Get current avatar URL to delete old file
    const { data: currentProfile } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    // Generate unique filename
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Clean up old avatar file if it exists
    if (currentProfile?.avatar_url) {
      try {
        const oldFileName = currentProfile.avatar_url.split('/').pop()
        if (oldFileName && oldFileName.includes(userId)) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName])
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup old avatar:', cleanupError)
        // Don't fail the request if cleanup fails
      }
    }

    return NextResponse.json({ 
      avatarUrl: publicUrl,
      message: 'Avatar uploaded successfully' 
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
