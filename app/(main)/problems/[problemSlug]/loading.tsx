export default function ProblemLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 0%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.03) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }

        .loading-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #080808;
          overflow: hidden;
        }

        .loading-topbar {
          height: 52px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(120, 53, 15, 0.3);
          flex-shrink: 0;
        }

        .loading-topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .loading-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .loading-nav {
          height: 44px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .loading-main {
          flex: 1;
          display: flex;
          overflow: hidden;
          padding: 20px;
          gap: 16px;
        }

        .loading-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }

        .loading-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .loading-editor {
          flex: 1;
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .loading-editor-header {
          height: 44px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .loading-editor-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-io {
          height: 180px;
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .loading-io-header {
          height: 40px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .loading-io-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-actions {
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="loading-page">
        {/* Top Bar */}
        <div className="loading-topbar">
          <div className="loading-topbar-left">
            <div className="skeleton" style={{ width: 280, height: 20 }} />
            <div
              className="skeleton"
              style={{ width: 70, height: 24, borderRadius: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: 80, height: 22, borderRadius: 5 }}
            />
          </div>
          <div className="loading-topbar-right">
            <div
              className="skeleton"
              style={{ width: 100, height: 32, borderRadius: 8 }}
            />
            <div
              className="skeleton"
              style={{ width: 90, height: 32, borderRadius: 8 }}
            />
          </div>
        </div>

        {/* Section Navigation */}
        <div className="loading-nav">
          <div
            className="skeleton"
            style={{ width: 90, height: 28, borderRadius: 6 }}
          />
          <div
            className="skeleton"
            style={{ width: 70, height: 28, borderRadius: 6 }}
          />
          <div
            className="skeleton"
            style={{ width: 60, height: 28, borderRadius: 6 }}
          />
          <div
            className="skeleton"
            style={{ width: 85, height: 28, borderRadius: 6 }}
          />
        </div>

        {/* Main Content */}
        <div className="loading-main">
          {/* Left Panel - Problem Description */}
          <div className="loading-left">
            {/* Company badges */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                className="skeleton"
                style={{ width: 70, height: 24, borderRadius: 5 }}
              />
              <div
                className="skeleton"
                style={{ width: 60, height: 24, borderRadius: 5 }}
              />
            </div>

            {/* Description paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton" style={{ width: "100%", height: 14 }} />
              <div className="skeleton" style={{ width: "95%", height: 14 }} />
              <div className="skeleton" style={{ width: "88%", height: 14 }} />
              <div className="skeleton" style={{ width: "92%", height: 14 }} />
              <div className="skeleton" style={{ width: "70%", height: 14 }} />
            </div>

            {/* Examples header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 16, height: 16, borderRadius: 4 }}
              />
              <div className="skeleton" style={{ width: 80, height: 14 }} />
            </div>

            {/* Example card 1 */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 80, height: 10, marginBottom: 12 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  className="skeleton"
                  style={{ width: "60%", height: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "45%", height: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "55%", height: 12 }}
                />
              </div>
            </div>

            {/* Example card 2 */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                className="skeleton"
                style={{ width: 80, height: 10, marginBottom: 12 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  className="skeleton"
                  style={{ width: "50%", height: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ width: "65%", height: 12 }}
                />
              </div>
            </div>

            {/* Input format */}
            <div style={{ marginTop: 8 }}>
              <div
                className="skeleton"
                style={{ width: 100, height: 10, marginBottom: 10 }}
              />
              <div
                style={{
                  background: "rgba(249,115,22,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: "2px solid rgba(249,115,22,0.3)",
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div
                    className="skeleton"
                    style={{ width: "80%", height: 12 }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "60%", height: 12 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="loading-right">
            {/* Code Editor */}
            <div className="loading-editor">
              <div className="loading-editor-header">
                <div
                  className="skeleton"
                  style={{ width: 100, height: 28, borderRadius: 6 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    className="skeleton"
                    style={{ width: 60, height: 28, borderRadius: 6 }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: 70, height: 28, borderRadius: 6 }}
                  />
                </div>
              </div>
              <div className="loading-editor-content">
                {/* Code lines */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div
                      className="skeleton"
                      style={{ width: 20, height: 14 }}
                    />
                    <div
                      className="skeleton"
                      style={{
                        width: `${Math.random() * 40 + 30}%`,
                        height: 14,
                        marginLeft:
                          i === 0 ? 0 : i % 3 === 0 ? 0 : i % 2 === 0 ? 16 : 32,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="loading-actions">
                <div
                  className="skeleton"
                  style={{ width: 70, height: 32, borderRadius: 6 }}
                />
                <div
                  className="skeleton"
                  style={{ width: 80, height: 32, borderRadius: 6 }}
                />
              </div>
            </div>

            {/* Input/Output Panel */}
            <div className="loading-io">
              <div className="loading-io-header">
                <div
                  className="skeleton"
                  style={{ width: 70, height: 24, borderRadius: 5 }}
                />
                <div
                  className="skeleton"
                  style={{ width: 60, height: 24, borderRadius: 5 }}
                />
              </div>
              <div className="loading-io-content">
                <div className="skeleton" style={{ width: 50, height: 10 }} />
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    padding: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      className="skeleton"
                      style={{ width: "40%", height: 12 }}
                    />
                    <div
                      className="skeleton"
                      style={{ width: "30%", height: 12 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
