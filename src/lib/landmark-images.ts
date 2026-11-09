import landmark0 from "@/assets/landmarks/albania.jpg.asset.json";
import landmark1 from "@/assets/landmarks/austria.jpg.asset.json";
import landmark2 from "@/assets/landmarks/bahrain-generated.jpg";
import landmark3 from "@/assets/landmarks/belarus.jpg.asset.json";
import landmark4 from "@/assets/landmarks/belgium.jpg.asset.json";
import landmark5 from "@/assets/landmarks/bosnia-and-herzegovina.jpg.asset.json";
import landmark6 from "@/assets/landmarks/bulgaria.jpg.asset.json";
import landmark7 from "@/assets/landmarks/china.jpg.asset.json";
import landmark8 from "@/assets/landmarks/costa-rica.jpg.asset.json";
import landmark9 from "@/assets/landmarks/croatia.jpg.asset.json";
import landmark10 from "@/assets/landmarks/cyprus.jpg.asset.json";
import landmark11 from "@/assets/landmarks/czech-republic.jpg.asset.json";
import landmark12 from "@/assets/landmarks/denmark.jpg.asset.json";
import landmark13 from "@/assets/landmarks/doha-generated.jpg";
import landmark14 from "@/assets/landmarks/estonia.jpg.asset.json";
import landmark15 from "@/assets/landmarks/finland.jpg.asset.json";
import landmark16 from "@/assets/landmarks/france-wide.jpg";
import landmark17 from "@/assets/landmarks/germany.jpg.asset.json";
import landmark18 from "@/assets/landmarks/gibraltar.jpg.asset.json";
import landmark19 from "@/assets/landmarks/hungary.jpg.asset.json";
import landmark20 from "@/assets/landmarks/isle-of-man.jpg.asset.json";
import landmark21 from "@/assets/landmarks/kazakhstan-generated.jpg";
import landmark22 from "@/assets/landmarks/kyrgyzstan.jpg.asset.json";
import landmark23 from "@/assets/landmarks/latvia.jpg.asset.json";
import landmark24 from "@/assets/landmarks/lithuania.jpg.asset.json";
import landmark25 from "@/assets/landmarks/moldova.jpg.asset.json";
import landmark26 from "@/assets/landmarks/morocco-generated.jpg";
import landmark27 from "@/assets/landmarks/netherlands.jpg.asset.json";
import landmark28 from "@/assets/landmarks/northern-cyprus.jpg.asset.json";
import landmark29 from "@/assets/landmarks/northern-ireland.jpg.asset.json";
import landmark30 from "@/assets/landmarks/portugal.jpg.asset.json";
import landmark31 from "@/assets/landmarks/romania.jpg.asset.json";
import landmark32 from "@/assets/landmarks/russia.jpg.asset.json";
import landmark33 from "@/assets/landmarks/scotland.jpg.asset.json";
import landmark34 from "@/assets/landmarks/serbia.jpg.asset.json";
import landmark35 from "@/assets/landmarks/slovakia.jpg.asset.json";
import landmark36 from "@/assets/landmarks/spain.jpg.asset.json";
import landmark37 from "@/assets/landmarks/sweden.jpg.asset.json";
import landmark38 from "@/assets/landmarks/ukraine.jpg.asset.json";
import landmark39 from "@/assets/landmarks/uzbekistan.jpg.asset.json";
import landmark40 from "@/assets/landmarks/vatican-city.jpg.asset.json";
import landmark41 from "@/assets/landmarks/wales.jpg.asset.json";

export const LANDMARK_IMAGES: Record<string, string> = {
  "albania": landmark0.url,
  "austria": landmark1.url,
  "bahrain": landmark2,
  "belarus": landmark3.url,
  "belgium": landmark4.url,
  "bosnia-and-herzegovina": landmark5.url,
  "bulgaria": landmark6.url,
  "china": landmark7.url,
  "costa-rica": landmark8.url,
  "croatia": landmark9.url,
  "cyprus": landmark10.url,
  "czech-republic": landmark11.url,
  "denmark": landmark12.url,
  "doha": landmark13,
  "estonia": landmark14.url,
  "finland": landmark15.url,
  "france": landmark16,
  "germany": landmark17.url,
  "gibraltar": landmark18.url,
  "hungary": landmark19.url,
  "isle-of-man": landmark20.url,
  "kazakhstan": landmark21,
  "kyrgyzstan": landmark22.url,
  "latvia": landmark23.url,
  "lithuania": landmark24.url,
  "moldova": landmark25.url,
  "morocco": landmark26,
  "netherlands": landmark27.url,
  "northern-cyprus": landmark28.url,
  "northern-ireland": landmark29.url,
  "portugal": landmark30.url,
  "romania": landmark31.url,
  "russia": landmark32.url,
  "scotland": landmark33.url,
  "serbia": landmark34.url,
  "slovakia": landmark35.url,
  "spain": landmark36.url,
  "sweden": landmark37.url,
  "ukraine": landmark38.url,
  "uzbekistan": landmark39.url,
  "vatican-city": landmark40.url,
  "wales": landmark41.url,
};

export const LANDMARK_CREDITS: Record<string, { landmark: string; author: string; license: string; source: string; licenseUrl: string }> = {
  "germany": {
    "landmark": "Brandenburg Gate",
    "author": "Thomas Wolf , www.foto-tw.de",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_abends.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "serbia": {
    "landmark": "Church of Saint Sava",
    "author": "Npps90",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hram_svetog_save_beograd_0005_%28edited%29.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "ukraine": {
    "landmark": "Saint Sophia Cathedral, Kyiv",
    "author": "Rbrechko",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:80-391-0151_Kyiv_St.Sophia%27s_Cathedral_RB_18_2_%28cropped%29.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "bosnia-and-herzegovina": {
    "landmark": "Stari Most",
    "author": "Ramirez",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mostar_Old_Town_Panorama_2007.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "czech-republic": {
    "landmark": "Charles Bridge",
    "author": "A.Savin",
    "license": "FAL",
    "source": "https://commons.wikimedia.org/wiki/File:Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg",
    "licenseUrl": "http://artlibre.org/licence/lal/en"
  },
  "slovakia": {
    "landmark": "Bratislava Castle",
    "author": "C.Stadler/Bwag",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Bratislava_-_Burg_%28b%29.JPG",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "vatican-city": {
    "landmark": "St. Peter's Basilica",
    "author": "Alvesgaspar",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "spain": {
    "landmark": "Sagrada Família",
    "author": "Canaan",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:SF_maig_2_cropped.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "portugal": {
    "landmark": "Belém Tower",
    "author": "Alvesgaspar",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Torre_Bel%C3%A9m_April_2009-4a.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "romania": {
    "landmark": "Bran Castle",
    "author": "Dobre Cezar",
    "license": "CC BY-SA 3.0 ro",
    "source": "https://commons.wikimedia.org/wiki/File:Castelul_Bran2.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/ro/deed.en"
  },
  "albania": {
    "landmark": "Berat",
    "author": "Arianit",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Berat_57.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "denmark": {
    "landmark": "Nyhavn",
    "author": "European Commission",
    "license": "CC BY 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:The_Nyhavn_Canal_3.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
  },
  "uzbekistan": {
    "landmark": "Registan",
    "author": "Registan_-_Gusjer.jpg : Gustavo Jeronimo from Aranjuez, Spain derivative work: MrPanyGoff",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:RegistanSquare_Samarkand.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
  },
  "lithuania": {
    "landmark": "Trakai Island Castle",
    "author": "BigHead",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Traku_pilis_by_Augustas_Didzgalvis.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "latvia": {
    "landmark": "House of the Blackheads (Riga)",
    "author": "Diliff",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:House_of_Blackheads_at_Dusk_3%2C_Riga%2C_Latvia_-_Diliff.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "bulgaria": {
    "landmark": "Alexander Nevsky Cathedral, Sofia",
    "author": "Jose Ligero Loarte",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Catedral_de_Alejandro_Nevski_--_2019_--_Sof%C3%ADa%2C_Bulgaria.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "hungary": {
    "landmark": "Hungarian Parliament Building",
    "author": "Kilyann Le Hen",
    "license": "CC BY 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Hungarian_Parliament_Building_from_across_the_Danube%2C_2025-01-11.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0"
  },
  "moldova": {
    "landmark": "Orheiul Vechi",
    "author": "Alex Prodan md",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Stanca_deasupra_Rautului_Butuceni.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "costa-rica": {
    "landmark": "Arenal Volcano",
    "author": "Rhododendrites",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Arenal_volcano_%2870785p%29_%28cropped%29.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "sweden": {
    "landmark": "Stockholm City Hall",
    "author": "ArildV",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Stockholms_stadshus_February_2026_02.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "finland": {
    "landmark": "Helsinki Cathedral",
    "author": "Manster323",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Kirkko3.png",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
  },
  "estonia": {
    "landmark": "Alexander Nevsky Cathedral, Tallinn",
    "author": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Catedral_de_Alejandro_Nevsky%2C_Tallin%2C_Estonia%2C_2012-08-11%2C_DD_46.JPG",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "belarus": {
    "landmark": "Mir Castle Complex",
    "author": "Вадзім Новикаў",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "cyprus": {
    "landmark": "Petra tou Romiou",
    "author": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Roca_de_Afrodita%2C_Chipre%2C_2021-12-10%2C_DD_65.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "russia": {
    "landmark": "Saint Basil's Cathedral",
    "author": "Tsy1980",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Saint_Basil%27s_Cathedral_in_Moscow.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "austria": {
    "landmark": "Schönbrunn Palace",
    "author": "C.Stadler/Bwag",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wien_-_Schloss_Sch%C3%B6nbrunn.JPG",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "kyrgyzstan": {
    "landmark": "Burana Tower",
    "author": "Bernard Gagnon",
    "license": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Burana_Tower%2C_Kyrgyzstan.jpg",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
  },
  "netherlands": {
    "landmark": "Kinderdijk",
    "author": "Lucas Hirschegger",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:KinderdijkMolens02.jpg",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/"
  },
  "belgium": {
    "landmark": "Grand-Place",
    "author": "Celuici",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Grand-Place%2C_Brussels_-_panorama%2C_June_2018.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "china": {
    "landmark": "Great Wall of China",
    "author": "Severin.stalder",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "isle-of-man": {
    "landmark": "Peel Castle",
    "author": "Finn Bjorklid",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Isle_of_Man_Peel_Castle.jpg",
    "licenseUrl": ""
  },
  "croatia": {
    "landmark": "Walls of Dubrovnik",
    "author": "Miroslav.vajdic",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Dubrovnik_s_24.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "gibraltar": {
    "landmark": "Rock of Gibraltar",
    "author": "Gibnews.net",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Rock_of_Gibraltar_northwest.jpg",
    "licenseUrl": ""
  },
  "scotland": {
    "landmark": "Edinburgh Castle",
    "author": "Enric",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:City_of_Edinburgh_-_Edinburgh_Castle_-_20140421004403.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "wales": {
    "landmark": "Conwy Castle",
    "author": "Andrew Woodvine",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Conwy_Castle%2C_water_view1.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
  },
  "northern-cyprus": {
    "landmark": "Bellapais Abbey",
    "author": "Zairon",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kyrenia_-_Girne_Kloster_Bellapa%C3%ADs_Kirche_7.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "northern-ireland": {
    "landmark": "Giant's Causeway",
    "author": "code poet on flickr.",
    "license": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Causeway-code_poet-4.jpg",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0"
  }
};
