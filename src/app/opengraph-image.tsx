import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Coração da marca (mesmo path do icon.svg), renderizado em branco.
const HEART_PATH =
  "M16 25s-9.5-6.2-9.5-12C6.5 9.5 8.9 7.1 12 7.1c1.7 0 3.3.8 4 2.1.7-1.3 2.3-2.1 4-2.1 3.1 0 5.5 2.4 5.5 5.9 0 5.8-9.5 12-9.5 12z";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #128a6e 0%, #1cab88 55%, #34c7a0 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "96px",
              height: "96px",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.16)",
            }}
          >
            <svg width={64} height={64} viewBox="0 0 32 32">
              <path d={HEART_PATH} fill="#ffffff" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "46px", fontWeight: 800 }}>
            Desenvolva
            <span style={{ color: "#c8f1e4" }}>TEA</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "68px",
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#eafaf5" }}>
            Saúde · Educação · Inclusão
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
