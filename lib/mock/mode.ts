/**
 * Mock mode = run the whole UI with no database, auth provider, Judge0 or
 * Redis. Enabled with `MOCK_MODE=true`, or automatically when there is no
 * DATABASE_URL (unless MOCK_MODE=false is set explicitly).
 *
 * Safe to import from server, edge (proxy.ts) and client code.
 */
export const MOCK_MODE =
  process.env.MOCK_MODE === "true" ||
  (process.env.MOCK_MODE !== "false" && !process.env.DATABASE_URL);
