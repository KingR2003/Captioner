import "./global.css";

export const metadata = {
  title: "Remotion Captioner",
  description: "Auto caption generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
