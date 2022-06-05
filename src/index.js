import "./index.css";
import "./answers";

import router from "./router";

setTimeout(() => {
  document.body.style.display = "";
  router.navigate("intro");
}, 0);
