// Our global overrides
import "./globals.css";
// TODO: Re-add FullCalendar CSS via verified CDN or package paths.
// Temporary removal to avoid Module not found errors during dev build.
import { Providers } from "../components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FullCalendar CSS served locally to avoid cross-origin issues */}
        <link rel="stylesheet" href="/fullcalendar/daygrid.css" />
        <link rel="stylesheet" href="/fullcalendar/timegrid.css" />
        <link rel="stylesheet" href="/fullcalendar/list.css" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
