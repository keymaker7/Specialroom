// Keep-alive service to prevent server from sleeping
export class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pingUrl: string;
  private readonly intervalMinutes: number;

  constructor(baseUrl: string, intervalMinutes = 10) {
    this.pingUrl = `${baseUrl}/api/health`;
    this.intervalMinutes = intervalMinutes;
  }

  start() {
    if (this.intervalId) {
      console.log('Keep-alive service is already running');
      return;
    }

    const intervalMs = this.intervalMinutes * 60 * 1000;
    
    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(this.pingUrl);
        console.log(`Keep-alive ping: ${response.status} at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Keep-alive ping failed:', error);
      }
    }, intervalMs);

    console.log(`Keep-alive service started - pinging every ${this.intervalMinutes} minutes`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Keep-alive service stopped');
    }
  }
}

// External keep-alive using UptimeRobot (free service)
export const setupExternalKeepAlive = () => {
  console.log(`
🔄 KEEP-ALIVE SETUP INSTRUCTIONS:
  
1. Visit: https://uptimerobot.com/
2. Create free account (allows 50 monitors)
3. Add HTTP(s) monitor:
   - URL: [YOUR_RAILWAY_DOMAIN]/api/health
   - Interval: 5 minutes
   - Alert contacts: your email

This will ping your server every 5 minutes to prevent sleep mode.
  `);
}; 