import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const HEART_PATH =
  "M16 25s-9.5-6.2-9.5-12C6.5 9.5 8.9 7.1 12 7.1c1.7 0 3.3.8 4 2.1.7-1.3 2.3-2.1 4-2.1 3.1 0 5.5 2.4 5.5 5.9 0 5.8-9.5 12-9.5 12z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1cab88",
        }}
      >
        <svg width={116} height={116} viewBox="0 0 32 32">
          <path d={HEART_PATH} fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
