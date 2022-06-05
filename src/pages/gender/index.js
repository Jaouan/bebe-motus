import "./gender.css";
import "../../images/gender.png";

import template from "./gender.partial.html";
import { blockCountdown } from "../../shared/block-countdown";

export default {
  template,
  controller: (pageRoot, navigate) => {
    const errorElement = pageRoot.getElementsByClassName("error")[0];
    const genderButtons = {
      boy: document.getElementById("boy-button"),
      girl: document.getElementById("girl-button"),
    };
    const otherGender = Object.keys(genderButtons).find(
      (gender) => gender !== window.$$eg
    );

    genderButtons[window.$$eg].addEventListener("click", () => {
      window.ga("send", "event", "answer-gender", window.$$eg);
      navigate("weight");
    });
    genderButtons[otherGender].addEventListener("click", () => {
      window.ga("send", "event", "answer-gender", otherGender);
      blockCountdown(errorElement, Object.values(genderButtons));
    });
  },
};
