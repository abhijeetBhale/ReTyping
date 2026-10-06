import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "96px",
          backgroundColor: "#141414",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <span style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>
          {SITE_NAME}.
        </span>
        <span style={{ fontSize: 36, color: "#adadad", marginTop: 24 }}>
          Free online typing speed test.
        </span>
      </div>
    ),
    { ...size },
  );
}
