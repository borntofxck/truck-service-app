import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Автоком 54",
    short_name: "Автоком 54",
    description:
      "Грузовой автосервис в Новосибирске: ремонт грузовиков, прицепов и спецтехники.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#18181b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
