import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkSync – Team Collaboration & Productivity Platform',
  description: 'WorkSync is the all-in-one platform for teams and individuals to manage projects, tasks, notes, and calendars. Collaborate in real time and get more done, together.',
  openGraph: {
    title: 'WorkSync – Team Collaboration & Productivity Platform',
    description: 'WorkSync is the all-in-one platform for teams and individuals to manage projects, tasks, notes, and calendars. Collaborate in real time and get more done, together.',
    url: 'http://localhost:3100/',
    siteName: 'WorkSync',
    images: [
      {
        url: '/vercel.svg',
        width: 1200,
        height: 630,
        alt: 'WorkSync Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkSync – Team Collaboration & Productivity Platform',
    description: 'WorkSync is the all-in-one platform for teams and individuals to manage projects, tasks, notes, and calendars. Collaborate in real time and get more done, together.',
    images: ['/vercel.svg'],
  },
};
