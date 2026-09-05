import './globals.css';

export const metadata = {
  title: 'HumblBar — Protein for You. Hope for a Child. | VIP Founding Waitlist',
  description: '15g Clean Protein, 0g Added Sugar, 100% Whole Ingredients. Take our 60-second Snack DNA quiz and pledge a child meal with every bar.',
  keywords: 'protein bar, clean protein, medjool dates, healthy snacks, child meal donation, humblbar'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
