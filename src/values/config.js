const VENDOR_TYPES = {
  CLUB: "Club",
  RESTAURANT: "Restaurant",
  EVENT: "Event",
  ACTIVITY: "Activity",
  SERVICE: "Service",
  HOTELS: "Hotels",
};

const CATEGORIES = {
  EXQUISITE: "EXQUISITE",
  EXPERIENCE: "EXPERIENCE",
  SERVICE: "SERVICE",
};

const SCREEN_CONFIG = {
  [CATEGORIES.EXQUISITE]: {
    tabs: [
      { name: "NIGHT CLUBS", serviceType: VENDOR_TYPES.CLUB },
      { name: "RESTAURANTS", serviceType: VENDOR_TYPES.RESTAURANT },
      { name: "EVENTS", serviceType: VENDOR_TYPES.EVENT },
    ],
    color: "#161A46",
    secColor: "#0d102b",
    placeholder: "Find Exquisite...",
    name: "Exquisites",
    categoryColor: "#5A0C1A",
    categoryTitle: "Restaurant and club booking",
  },
  [CATEGORIES.EXPERIENCE]: {
    tabs: [
      { name: "ACTIVITIES", serviceType: VENDOR_TYPES.ACTIVITY },
      { name: "LUXURY STAYS", serviceType: VENDOR_TYPES.HOTEL },
    ],
    color: "#1B342F",
    secColor: "#122622",
    placeholder: "Find Experiences...",
    name: "Experiences",
    categoryColor: "#2B5A51",
    categoryTitle: "Activities",
  },
  [CATEGORIES.SERVICE]: {
    tabs: [{ name: "SERVICES", serviceType: VENDOR_TYPES.SERVICE }],
    color: "#5A0C1A",
    secColor: "#420913",
    placeholder: "Find Services...",
    name: "Ease",
    categoryColor: "#161A46",
    categoryTitle: "Services at your doorstep",
  },
};

const ORDER_STATUS_COLORS = {
  PENDING: {
    title: "PENDING",
    color: "rgba(186, 186, 0, 0.5)",
  },
  CONFIRMED: {
    title: "CONFIRMED",
    color: "rgba(86, 150, 86, 0.5)",
  },
  CANCELLED: {
    title: "CANCELLED",
    color: "rgba(219, 131, 131, 0.5)",
  },
  ACTIVE: {
    title: "ACTIVE",
    color: "rgba(146, 146, 255, 0.5)",
  },
};

export const configs = {
  // Production Urls
  BASE_URL: "https://api.mufasa.ae:8000/api",
  PUBLIC_URL: "https://api.mufasa.ae:8000/public",

  // Dev urls
  // BASE_URL: "https://dev.mufasa.ae:8080/api",
  // PUBLIC_URL: "https://dev.mufasa.ae:8080/public",

  MAPS_API_KEY: "AIzaSyBRSp45Ts8HgzF2lomN91g5s4naDx2IMeg",
  GOOGLE_WEB_CLIENT_ID:
    "889989888054-p8cqgeqrck0evinb8nv5n08q2jiiqjn2.apps.googleusercontent.com",
  FONTS: {
    PRIMARY_FONT: "Montserrat-Regular",
    PRIMARY_ITALIC: "Montserrat-Italic",
    PRIMARY_MEDIUM: "Montserrat-Regular",
    PRIMARY_MEDIUM_ITALIC: "Montserrat-MediumItalic",
    CORMORANT_GARAMOND_REGULAR: "CormorantGaramond-Regular",
    SECONDARY_FONT: "Quantify",
  },
  COLORS: {
    darkBlue: "#00051B",
    whitePrimary: "#FFFFFF",
    whiteAccent: "#FFFFFFC0",
    goldenDark: "#C6A45E",
    goldenLight: "#E0BF89",
    goldenRegular: "#C2AC79",
    inputBackground: "#FFFFFF20",
    verifiedGreen: "#65DC41",
  },
  STRINGS: {
    copyright: "©Mufasa UAE",
    appName: "Mufasa",
  },
  APP_INFO: {
    VERSION: "1.0",
  },
  VENDOR_TYPES,
  CATEGORIES,
  SCREEN_CONFIG,
  ORDER_STATUS_COLORS,
};
