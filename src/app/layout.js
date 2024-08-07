import './globals.css'; // Mengimpor Tailwind CSS

export const metadata = {
  title: 'Smart AI Discover',
  description: 'Realtime data from Firebase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
