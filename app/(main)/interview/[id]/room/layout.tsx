/**
 * Room layout — overrides with empty chrome.
 * The `data-interview-room="active"` attribute is picked up by the
 * interview layout's `:has()` CSS rule to hide the site navbar and footer
 * from the very first server-rendered paint, eliminating the flash.
 */
export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-interview-room="active">{children}</div>;
}
