import { NextRequest, NextResponse } from "next/server"
import { initializeDefaultTimezones } from "@/lib/services/user-timezones"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const defaultTimezones = await initializeDefaultTimezones(userId)
    return NextResponse.json(defaultTimezones, { status: 201 })
  } catch (error) {
    console.error('Error initializing default timezones:', error)
    return NextResponse.json(
      { error: "Failed to initialize default timezones" },
      { status: 500 }
    )
  }
}