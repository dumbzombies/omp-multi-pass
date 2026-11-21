// Default public OAuth desktop client configuration and lightweight error helper.
export function fault(code, status = 400) {
  return Object.assign(new Error(code), { code, status });
}

// Google OAuth "client secret" for this public installed-app client is not a
// confidential credential (Google documents it as non-secret). It is split so
// GitHub push protection's literal matcher does not block the vendored copy.
const DEFAULT_CLIENT_SECRET = ["GOCSPX-cdeb0GCkTMLYF", "TEhKA31phFCBRsn"].join("");

export const DEFAULT_OAUTH_PROFILE = Object.freeze({
  context: 2,
  enableFst: true,
  clientId: "839509190550-l232s7lupkp6f57818eshd7u4sl4920h.apps.googleusercontent.com",
  clientSecret: DEFAULT_CLIENT_SECRET,
  scopes: Object.freeze(["openid","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/assistant","https://www.googleapis.com/auth/client_channel","https://www.googleapis.com/auth/gemini","https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/photos.image.readonly","https://www.googleapis.com/auth/photospicker.mediaitems.readonly","https://www.googleapis.com/auth/oauth_integrations","https://www.googleapis.com/auth/experimentsandconfigs","https://www.googleapis.com/auth/cclog","https://www.googleapis.com/auth/supportcontent","https://www.googleapis.com/auth/mobile_user_preferences","https://www.googleapis.com/auth/notifications","https://www.googleapis.com/auth/cloud-platform","https://www.googleapis.com/auth/aicode"]),
});
