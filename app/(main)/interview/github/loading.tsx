export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#08080F" }}
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500/60"
            style={{
              animation: `ghDotBounce 1.2s ease-in-out ${index * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
