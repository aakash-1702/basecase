export default function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The workspace is a fixed-height app view: hide the marketing footer. */}
      <style>{`
        body:has([data-hide-footer]) footer {
          display: none !important;
        }
      `}</style>
      <div data-hide-footer="true">{children}</div>
    </>
  );
}
