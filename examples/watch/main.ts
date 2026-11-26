import { createApp } from "vue";
import Demo from "./WatchDemo.vue";
import Gallery from "./WearGallery.vue";
import "@hanhanawa/wear-m3e-vue/style.css";

const mode = import.meta.env.MODE;
const catalog =
  mode === "catalog" ||
  (mode !== "demo" && new URLSearchParams(location.search).has("catalog"));

document.title = catalog ? "Wear M3E component catalog" : "Wear Vue demo";
createApp(catalog ? Gallery : Demo).mount("#app");
