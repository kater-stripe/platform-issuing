import { NextResponse } from 'next/server';

export async function GET() {
  // Create HTML page that clears localStorage and redirects
  const resetHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resetting Demo...</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Resetting Demo...</h2>
        <p>Clearing all demo data and redirecting to homepage...</p>
      </div>
      
      <script>
        // Clear all localStorage keys used by the demo
        const keysToRemove = [
              'stripe-demo-state',
    'demo-account-id',
    'demo-company-name',
    'demo-cards',
    'demo-transactions'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Also clear any other demo-specific keys
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith('demo-')) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('Demo state has been reset');
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      </script>
    </body>
    </html>
  `;

  return new NextResponse(resetHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST() {
  // Also support POST requests for programmatic resets
  return GET();
} 