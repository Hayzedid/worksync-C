// Our global overrides
import "./globals.css";
import { Providers } from "../components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FullCalendar CSS via CDN - required for calendar functionality */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/index.global.min.css"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.19/index.global.min.css"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.19/index.global.min.css"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/list@6.1.19/index.global.min.css"
        />
        
        {/* Clipboard API polyfill to prevent errors in development */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && !navigator.clipboard) {
              navigator.clipboard = {
                writeText: function(text) {
                  return new Promise(function(resolve) {
                    console.warn('Clipboard API not available, text not copied:', text);
                    resolve();
                  });
                },
                readText: function() {
                  return Promise.resolve('');
                }
              };
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
              const originalWriteText = navigator.clipboard.writeText;
              navigator.clipboard.writeText = function(text) {
                return originalWriteText.call(this, text).catch(function(error) {
                  console.warn('Clipboard write failed, likely due to permissions policy:', error.message);
                  return Promise.resolve();
                });
              };
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
