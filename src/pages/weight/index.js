import "./weight.css";
import "../../images/weight.png";

import template from "./weight.partial.html";
import { blockCountdown } from "../../shared/block-countdown";

export default {
  template,
  controller: (pageRoot, navigate) => {
    const errorElement = pageRoot.getElementsByClassName("error")[0];
    const weightInput = document.getElementById("weight-input");
    const weightButton = document.getElementById("weight-button");
    weightInput.addEventListener(
      "keyup",
      (e) => e.key === "Enter" && weightButton.click()
    );
    weightButton.addEventListener("click", () => {
      Math.abs(window.$$ew - weightInput.value) / window.$$ew < 0.02
        ? navigate("motusHelp")
        : blockCountdown(errorElement, [weightButton]);
      window.ga("send", "event", "answer-weight", weightInput.value);
    });
  },
};
