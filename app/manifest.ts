import type { MetadataRoute } from "next";

const { appName, description } = {
  appName: "DNS",
  description:
    "Delta Neutral Stocks on Solana",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: description,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#f5f5f5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}