import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Auto Pinned Tabs",
    permissions: ["bookmarks", "storage"],
    action: {
      default_popup: "popup/index.html"
    },
  },
});
