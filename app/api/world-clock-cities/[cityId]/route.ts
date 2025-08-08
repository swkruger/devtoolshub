import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth'
import { 
  removeUserWorldClockCity, 
  updateUserWorldClockCity 
} from '@/lib/services/world-clock-cities'

interface RouteParams {
  params: {
    cityId: string
  }
}

/**
 * PATCH /api/world-clock-cities/[cityId]
 * Update a specific city in the authenticated user's World Clock (label, order, etc.)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { cityId } = params
    const body = await request.json()
    
    if (!cityId || typeof cityId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid city ID provided' },
        { status: 400 }
      )
    }
    
    // Validate update data
    const { custom_label, display_order } = body
    const updateData: any = {}
    
    if (custom_label !== undefined) {
      updateData.custom_label = custom_label
    }
    
    if (display_order !== undefined) {
      updateData.display_order = display_order
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update data provided' },
        { status: 400 }
      )
    }
    
    const result = await updateUserWorldClockCity(user.id, cityId, updateData)
    
    return NextResponse.json({ 
      success: true,
      city: result,
      message: 'City updated successfully' 
    })
  } catch (error) {
    console.error('Error updating world clock city:', error)
    
    return NextResponse.json(
      { error: 'Failed to update city' }, 
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/world-clock-cities/[cityId]
 * Remove a specific city from the authenticated user's World Clock
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authServer.getUserProfile()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    const { cityId } = params
    
    if (!cityId || typeof cityId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid city ID provided' },
        { status: 400 }
      )
    }
    
    await removeUserWorldClockCity(user.id, cityId)
    
    return NextResponse.json({ 
      success: true,
      message: 'City removed from World Clock successfully' 
    })
  } catch (error) {
    console.error('Error removing world clock city:', error)
    

    
    return NextResponse.json(
      { error: 'Failed to remove city from World Clock' }, 
      { status: 500 }
    )
  }
}