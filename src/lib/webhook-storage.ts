// Shared webhook event storage for demo purposes
// In a real application, this would be a database

interface WebhookEvent {
  id: string;
  type: string;
  created: number;
  timestamp: string;
  data: any;
  account: string | null;
  authorization_decision?: any;
}

// In-memory storage for demo purposes
let webhookEvents: WebhookEvent[] = [];

export const webhookEventStorage = {
  // Add a new event
  addEvent: (eventData: WebhookEvent) => {
    // Add the event to the beginning of the array
    webhookEvents.unshift(eventData);
    
    // Keep only the last 50 events
    webhookEvents = webhookEvents.slice(0, 50);
    
    console.log(`📝 Stored webhook event: ${eventData.type} (${eventData.id})`);
    console.log(`   Total events in storage: ${webhookEvents.length}`);
  },

  // Get all events
  getEvents: (): WebhookEvent[] => {
    return [...webhookEvents]; // Return a copy
  },

  // Get recent events (last N)
  getRecentEvents: (limit: number = 50): WebhookEvent[] => {
    return webhookEvents.slice(0, limit);
  },

  // Clear all events
  clearEvents: () => {
    const count = webhookEvents.length;
    webhookEvents = [];
    console.log(`🗑️ Cleared ${count} webhook events from storage`);
    return count;
  },

  // Get event count
  getEventCount: (): number => {
    return webhookEvents.length;
  }
}; 