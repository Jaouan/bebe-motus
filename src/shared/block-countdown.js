export const blockCountdown = (errorElement, buttons) => {
  Object.values(buttons).forEach((buttons) => (buttons.disabled = true));
  const hideErrorAndCallback = () => {
    errorElement.className = "error hide";
    Object.values(buttons).forEach((buttons) => (buttons.disabled = false));
  };

  const decrease = (countdown) => {
    errorElement.innerText = `Loupé... Vous êtes bloqué pendant ${countdown} seconde${
      countdown > 1 ? "s" : ""
    }.`;
    countdown > 0
      ? setTimeout(() => decrease(countdown - 1), 1000)
      : hideErrorAndCallback();
  };

  decrease(window.$$bt);
  errorElement.className = "error show";

  window.ga("send", "event", "blocked", "1");
};
