export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide nav/footer only when [data-interview-room="active"] is present */}
      <style>{`
        body:has([data-interview-room="active"]) footer,
        body:has([data-interview-room="active"]) nav {
          display: none !important;
        }
      `}</style>
      <div>{children}</div>
    </>
  );
}
