import heroAttabad from "@/assets/hero-attabad.jpg";
import { LANDMARK_IMAGES } from "@/lib/landmark-images";
import dPakistan from "@/assets/d-pakistan.jpg";
import dItaly from "@/assets/d-italy.jpg";
import dNorway from "@/assets/d-norway.jpg";
import dColombia from "@/assets/d-colombia.jpg";
import dTurkey from "@/assets/d-turkey.jpg";
import dPoland from "@/assets/d-poland.jpg";
import dEngland from "@/assets/d-england.jpg";
import dUae from "@/assets/d-uae.jpg";
import dQatar from "@/assets/d-qatar.jpg";
import dHK from "@/assets/d-hongkong.jpg";
import dMacau from "@/assets/d-macau.jpg";
import dShanghai from "@/assets/d-shanghai.jpg";
import dBeijing from "@/assets/d-beijing.jpg";
import dKartarpur from "@/assets/d-kartarpur.jpg";
import dFaisalabad from "@/assets/d-faisalabad.jpg";
import dSaudi from "@/assets/d-saudi.jpg";
import dLondon from "@/assets/d-london.jpg";
import dLahore from "@/assets/d-lahore.jpg";
import dUsa from "@/assets/d-usa.jpg";
import tileWorld from "@/assets/tile-world.jpg";
import tileThinking from "@/assets/tile-thinking.jpg";
import tileGallery from "@/assets/tile-gallery.jpg";
import heroAliNight from "@/assets/home-hero-ali.png";
export const HOME_HERO_IMAGE = dHK;
import uMoen from "@/assets/u-mohenjodaro.jpg";
import uTaxila from "@/assets/u-taxila.jpg";
import uTakht from "@/assets/u-takhtibahi.jpg";
import uLahore from "@/assets/u-lahorefort.jpg";
import uMakli from "@/assets/u-makli.jpg";
import uRohtas from "@/assets/u-rohtas.jpg";
import pKhewra from "@/assets/p-khewra.jpg";
import pMinar from "@/assets/p-minar.jpg";
import pMuz from "@/assets/p-muzaffarabad.jpg";
import pNeelum from "@/assets/p-neelum.jpg";
import pK2 from "@/assets/p-k2.jpg";
import pFairy from "@/assets/p-fairymeadows.jpg";
import pBadshahi from "@/assets/p-badshahi.jpg";

export const HERO_IMAGE = heroAttabad;

/** Illustrative photography (not the owner's own photos) keyed by record slug / reference. */
export const DESTINATION_IMAGES: Record<string, string> = {
  ...LANDMARK_IMAGES,
  pakistan: dPakistan, italy: dItaly, norway: dNorway, colombia: dColombia, turkey: dTurkey, poland: dPoland,
  england: dEngland, "united-kingdom": dEngland, "united-arab-emirates": dUae, qatar: dQatar,
  "hong-kong": dHK, macau: dMacau, shanghai: dShanghai, beijing: dBeijing,
  kartarpur: dKartarpur, faisalabad: dFaisalabad, "saudi-arabia": dSaudi, london: dLondon, lahore: dLahore,
  usa: dUsa, "united-states": dUsa, "united-states-of-america": dUsa,
};
export const DESTINATION_TAGLINES: Record<string, string> = {
  pakistan: "Mountains, culture & history", italy: "Art, architecture & cuisine", norway: "Fjords & natural wonders",
  colombia: "Nature, cities & adventures", turkey: "History at the crossroads", poland: "Old towns & long histories",
  england: "History & home", "united-kingdom": "History & home", "united-arab-emirates": "Skylines & desert", qatar: "Corniche & culture",
  "hong-kong": "Skylines & nightlife", macau: "History & culture", shanghai: "Skyscrapers & modern China",
  beijing: "History & heritage", kartarpur: "Spiritual journey", faisalabad: "Family & roots",
  "saudi-arabia": "History & exploration", london: "Home", lahore: "Mughal landmarks & old city",
  usa: "Landmarks & skylines", "united-states": "Landmarks & skylines", "united-states-of-america": "Landmarks & skylines",
};
/** Thumbnails for the homepage category tiles. */
export const TILE_IMAGES = {
  journey: heroAttabad, world: tileWorld, thinking: tileThinking, gallery: tileGallery,
};
export const UNESCO_IMAGES: Record<string, string> = {
  "138": uMoen, "139": uTaxila, "140": uTakht, "171": uLahore, "143": uMakli, "586": uRohtas,
};
export const PAKISTAN_IMAGES: Record<string, string> = {
  "khewra-salt-mine": pKhewra, "minar-e-pakistan": pMinar, muzaffarabad: pMuz, "neelum-valley": pNeelum,
  k2: pK2, "attabad-lake": heroAttabad, "fairy-meadows": pFairy, "badshahi-mosque": pBadshahi,
  "mohenjo-daro": uMoen, taxila: uTaxila, "takht-i-bahi": uTakht, "lahore-fort": uLahore, "makli-necropolis": uMakli, "rohtas-fort": uRohtas,
};

export function flagUrl(iso2: string | null | undefined, slug?: string) {
  const sub: Record<string, string> = { england: "gb-eng", scotland: "gb-sct", wales: "gb-wls", "northern-ireland": "gb-nir" };
  const code = (slug && sub[slug]) || iso2?.toLowerCase();
  return code ? `https://flagcdn.com/w160/${code}.png` : null;
}
