import { NextRequest, NextResponse } from "next/server"
import { updateUserTimezone, deleteUserTimezone } from "@/lib/services/user-timezones"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, label, display_order } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const updatedTimezone = await updateUserTimezone(userId, id, {
      label,
      display_order
    })

    return NextResponse.json(updatedTimezone)
  } catch (error) {
    console.error('Error updating user timezone:', error)
    return NextResponse.json(
      { error: "Failed to update user timezone" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    await deleteUserTimezone(userId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user timezone:', error)
    
    if (error instanceof Error && error.message.includes('Cannot delete default')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete user timezone" },
      { status: 500 }
    )
  }
}