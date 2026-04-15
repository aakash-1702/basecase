"use client";

interface GitHubRoomNavbarProps {
  repoName: string;
  userDesignation: string;
}

export function GitHubRoomNavbar({
  repoName,
  userDesignation,
}: GitHubRoomNavbarProps) {
  return (
    <div
      style={{
        height: 52,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#111111",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {/* Left: GitHub Interview label with git-branch icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Git branch SVG icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#f5f5f5",
            letterSpacing: "0.02em",
          }}
        >
          GitHub Interview
        </span>
      </div>

      {/* Center: Repo name */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          color: "#71717a",
          letterSpacing: "0.02em",
        }}
      >
        {repoName}
      </div>

      {/* Right: User designation */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "12px",
          color: "#71717a",
          letterSpacing: "0.04em",
        }}
      >
        {userDesignation}
      </div>
    </div>
  );
}
