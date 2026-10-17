
export const config = {
  // Base URL for all /api/* requests (includes /api suffix)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  // Raw server root — used to construct file/document download URLs
  serverBaseUrl: import.meta.env.VITE_SERVER_BASE_URL,

  // Base URL for announcement/news-feed images served by the backend
  imageBaseUrl: import.meta.env.VITE_IMAGE_BASE_URL,

  // ─── Company Identity ─────────────────────────────────────────────────────
  companyWebsite: import.meta.env.VITE_COMPANY_WEBSITE,
  companyEmail: import.meta.env.VITE_COMPANY_EMAIL,
  companyHrEmail: import.meta.env.VITE_COMPANY_HR_EMAIL,

  // ─── Razorpay ─────────────────────────────────────────────────────────────
  // Company name shown inside the Razorpay checkout popup
  razorpayCompanyName: import.meta.env.VITE_RAZORPAY_COMPANY_NAME,

  // Finance email pre-filled in the Razorpay payment form
  razorpayPrefillEmail: import.meta.env.VITE_RAZORPAY_PREFILL_EMAIL,

  // ─── Third-party APIs ─────────────────────────────────────────────────────
  // OpenStreetMap Nominatim reverse geocoding — swap for a self-hosted or
  // commercial provider (Google, Mapbox) in production at scale.
  nominatimApiUrl:
    import.meta.env.VITE_NOMINATIM_API_URL ||
    "https://nominatim.openstreetmap.org/reverse",
};
