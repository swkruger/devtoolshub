import { NextRequest, NextResponse } from "next/server"
import { getUserTimezones, createUserTimezone } from "@/lib/services/user-timezones"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const timezones = await getUserTimezones(userId)
    return NextResponse.json(timezones)
  } catch (error) {
    console.error('Error fetching user timezones:', error)
    return NextResponse.json(
      { error: "Failed to fetch user timezones" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, timezone, label, display_order, is_default } = body

    if (!userId || !timezone || !label) {
      return NextResponse.json(
        { error: "User ID, timezone, and label are required" },
        { status: 400 }
      )
    }

    const newTimezone = await createUserTimezone(userId, {
      timezone,
      label,
      display_order,
      is_default
    })

    return NextResponse.json(newTimezone, { status: 201 })
  } catch (error) {
    console.error('Error creating user timezone:', error)
    
    if (error instanceof Error && error.message.includes('already added')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create user timezone" },
      { status: 500 }
    )
  }
}