
import brooklynBridge from "@/assets/personal/usa-brooklyn-bridge.jpg.asset.json";
import lowerManhattan from "@/assets/personal/usa-lower-manhattan.jpg.asset.json";
import oculus from "@/assets/personal/usa-oculus.jpg.asset.json";

export type PersonalPhoto = {
  url: string;
  caption: string;
};

// Personal photographs grouped by destination.
export const PERSONAL_PHOTOS: Record<string, PersonalPhoto[]> = {
  "new-york": [
    { url: brooklynBridge.url, caption: "Brooklyn Bridge" },
    { url: lowerManhattan.url, caption: "Lower Manhattan skyline" },
    { url: oculus.url, caption: "Oculus, World Trade Center Transportation Hub" },
  ],
  "ukraine": [
    {
      url: "/.jpg.png",
      caption: "Exploring Lviv, Ukraine — Beyond Borders",
    },
  ],
};
