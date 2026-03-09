export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        body:has([data-interview-room]) footer,
        body:has([data-interview-room]) nav {
          display: none !important;
        }
      `}</style>
      <div data-interview-room="true">{children}</div>
    </>
  );
}
