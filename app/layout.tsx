import "./globals.css";

export const metadata = {
  title: "Book Club",
  description: "Monthly book club reviews"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}