import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "ja",
    permissions: ["bookmarks", "storage"],
    action: {
      default_popup: "popup/index.html"
    },
  },
});
