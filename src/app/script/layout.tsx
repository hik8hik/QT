export default function ScriptLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
