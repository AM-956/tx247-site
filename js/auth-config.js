/*
 * TX247 website accounts — ACTIVATION CONFIG
 * ==========================================
 * "Login with Discord" stays INACTIVE (buttons link to the explanation on
 * how-it-works.html) until the two values marked ACTIVATION below are set.
 * Full checklist: space-engineers/site-backend/DISCORD-LINK-SPEC.md §8.
 *
 * Note: clientId is PUBLIC by design (it appears in every authorize URL).
 * The client SECRET is not — it lives only in the backend's environment.
 */
window.TX247_AUTH = {
  // ACTIVATION 1 of 2: Discord OAuth application Client ID
  // (Discord Developer Portal -> TX247 Website app -> OAuth2 -> Client ID)
  clientId: "",

  // ACTIVATION 2 of 2: base URL of the TX247 site backend, no trailing slash
  // (e.g. "https://api.tx247.space")
  apiBase: "",

  // TX247 Galactic Coalition Discord server — already correct, do not change.
  guildId: "781263746509045791"
};
