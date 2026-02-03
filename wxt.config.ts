import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Auto Pinned Tabs",
    permissions: ["bookmarks", "tabs", "storage"],
    options_ui: {
      open_in_tab: true,
    },
    action: {
      default_popup: "popup/index.html"
    },
  },
});
