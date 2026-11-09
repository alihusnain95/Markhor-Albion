import brooklynBridge from "@/assets/personal/usa-brooklyn-bridge.jpg.asset.json";
import lowerManhattan from "@/assets/personal/usa-lower-manhattan.jpg.asset.json";
import oculus from "@/assets/personal/usa-oculus.jpg.asset.json";

export type PersonalPhoto = {
  url: string;
  caption: string;
};

// Personal photographs taken by the site owner, grouped by destination slug.
// Add an entry here and the destination page's "photos" tab shows it.
export const PERSONAL_PHOTOS: Record<string, PersonalPhoto[]> = {
  "new-york": [
    { url: brooklynBridge.url, caption: "Brooklyn Bridge" },
    { url: lowerManhattan.url, caption: "Lower Manhattan skyline" },
    { url: oculus.url, caption: "Oculus, World Trade Center Transportation Hub" },
  ],
};
