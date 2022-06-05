
import intro from "./pages/intro";
import weight from "./pages/weight";
import gender from "./pages/gender";
import { motusHelp, motus } from "./pages/motus";

const root = document.getElementById("root");

const pages = {
  intro,
  gender,
  weight,
  motusHelp,
  motus,
};

const navigate = (page) => {
  const previousPage = root.getElementsByTagName("div");
  const newPage = pages[page];
  root.className = "page-out";
  setTimeout(() => {
    previousPage.length && root.removeChild(...previousPage);
    root.innerHTML = newPage.template;
    const pageHtmlElement = root.getElementsByTagName("div")[0];
    pageHtmlElement.id = `page-${page}`;
    pageHtmlElement.className = "page";
    newPage.controller && newPage.controller(pageHtmlElement, navigate);
    newPage.controller = false; // Avoid double init.
    document
      .querySelectorAll(`button[navigate]`)
      .forEach((element) =>
        element.addEventListener("click", () =>
          navigate(element.getAttribute("navigate"))
        )
      );
    setTimeout(() => (root.className = "page-in"), 0);
    window.ga("set", "page", `/${page === "intro" ? "" : page}`);
    window.ga("send", "pageview");
  }, 250);
  pages[page];
};

export default {
  navigate,
};
