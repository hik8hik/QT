"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page-wrapper">
      <div className="error-card">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button className="btn" style={{ marginTop: "1rem" }} onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
