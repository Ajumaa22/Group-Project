import "../styles/globals.css";

export const metadata = {
  title: "Momenta",
  description: "Social Media Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}