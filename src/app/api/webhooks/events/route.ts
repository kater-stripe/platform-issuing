import { NextRequest, NextResponse } from 'next/server';
import { webhookEventStorage } from '@/lib/webhook-storage';

export async function GET() {
  try {
    // Return the stored webhook events
    const events = webhookEventStorage.getEvents();
    const count = webhookEventStorage.getEventCount();
    
    return NextResponse.json({
      success: true,
      events: events,
      count: count
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      events: [],
      count: 0,
      error: 'Failed to retrieve events'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Store the event using shared storage
    webhookEventStorage.addEvent(eventData);
    
    return NextResponse.json({
      success: true,
      message: 'Event stored successfully',
      count: webhookEventStorage.getEventCount()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to store event'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear all webhook events
    const clearedCount = webhookEventStorage.clearEvents();
    
    return NextResponse.json({
      success: true,
      message: `All ${clearedCount} events cleared`,
      count: 0
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear events'
    }, { status: 500 });
  }
} 