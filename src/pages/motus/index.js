import "./motus.css";
import "../../images/baby.png";

import motusTemplate from "./motus.partial.html";
import motusHelpTemplate from "./motus-help.partial.html";

import boardCreatedMp3 from "./sounds/board-created.mp3";
import victoryMp3 from "./sounds/victory.mp3";
import errorMp3 from "./sounds/error.mp3";
import matchExactMp3 from "./sounds/match-exact.mp3";
import matchWordMp3 from "./sounds/match-word.mp3";
import matchMissingMp3 from "./sounds/match-missing.mp3";
import jingleMp3 from "./sounds/jingle.mp3";

import { chunk } from "../../shared/array";

// Safari cannot play sound correctly. This wtf hack fixes it.
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

export const motusHelp = { template: motusHelpTemplate };

export const motus = {
  template: motusTemplate,
  controller: (pageRoot) => {
    const matchAudios = {
      missing: () => new Audio(matchMissingMp3),
      exact: () => new Audio(matchExactMp3),
      word: () => new Audio(matchWordMp3),
    };
    const emptyAudio = { play: () => {} };
    const boardCreatedAudio = new Audio(boardCreatedMp3);
    const victoryAudio = new Audio(victoryMp3);
    const errorAudio = new Audio(errorMp3);

    const lizaMode = window.location.hostname.includes("liza");
    const metrics = { tryCount: 0 };
    const $$en = window.$$en;
    const foundLetters = [...$$en].map((_) => ({}));
    foundLetters[0] = { letter: $$en[0] };

    const timeBetweenReveal = 750;

    const board = document.getElementById("board");
    const wordInput = document.getElementById("word-input");

    wordInput.setAttribute("maxlength", $$en.length);
    const submitButton = document.getElementById("submit-word-button");
    wordInput.addEventListener(
      "keyup",
      (e) => e.key === "Enter" && submitButton.click()
    );
    submitButton.addEventListener("click", () => submitWord());
    const submitWord = () =>
      wordInput.value.length === $$en.length &&
      revealBoard(
        resultWithHtmlElement(
          checkWord($$en, wordInput.value.toLowerCase(), true)
        )
      );

    const focusInput = () => {
      try {
        wordInput.focus();
        wordInput.click();
      } catch (e) {
        // Word input may be removed from DOM.
      }
    };
    board.addEventListener("click", () => focusInput());

    const revealBoard = (result, endMessage) => {
      submitButton.disabled = true;
      wordInput.value = "";

      insertHtmlElementInBoard(board, wordToHtmlElement(result), !endMessage);

      boardCreatedAudio.play();

      result.forEach((resultLetter, letterIndex) =>
        setTimeout(() => {
          resultLetter.htmlElement.getElementsByClassName(
            "letter"
          )[0].innerText = resultLetter.letter;
          resultLetter.htmlElement.className =
            resultLetter.htmlElement.className.replace("letter-hidden", "");
          matchAudios[resultLetter.match || "missing"]().play();
        }, 750 * (letterIndex + 2))
      );

      !endMessage &&
        (result.every((resultLetter) => resultLetter.match === "exact")
          ? victory(result)
          : retry(result));
    };

    const victory = (result) => {
      wordInput.disabled = true;
      setTimeout(() => {
        document.getElementById("motus-input").className = "hide";
        victoryAudio.play();

        // Safari is crap. Disable matches audio...
        lizaMode &&
          Object.keys(matchAudios).forEach(
            (audioKey) => (matchAudios[audioKey] = emptyAudio)
          );

        foundLetters.forEach((foundLetter) => (foundLetter.letter = false));
        setTimeout(() => {
          revealEndMessages(
            [
              "Bravo!",
              ...(lizaMode
                ? chunk("liza, veux-tu être la marraine?", $$en.length)
                : []),
            ].flat()
          );
        }, 1000);
      }, timeBetweenReveal * (result.length + 3));
      window.ga("send", "event", "motus-try", metrics.tryCount);
      window.ga("send", "event", "liza", "1");
    };

    const revealEndMessages = (messages) => {
      messages.forEach((word, wordIndex) =>
        setTimeout(
          () =>
            revealBoard(
              resultWithHtmlElement(
                checkWord($$en, word.padEnd($$en.length, " "))
              ),
              true
            ),
          wordIndex * 6000
        )
      );
    };

    const retry = (result) => {
      setTimeout(() => {
        submitButton.disabled = false;
        result.forEach((resultLetter, index) =>
          resultLetter.match === "exact"
            ? (foundLetters[index].letter = resultLetter.letter)
            : false
        );
        const line = [];
        line.push(
          ...foundLetters.map((foundLetter) => ({
            htmlElement: resultLetterToHtmlElement({}, true, foundLetter),
          }))
        );
        insertHtmlElementInBoard(board, wordToHtmlElement(line, true), true);
        setTimeout(() => errorAudio.play(), 0);
      }, timeBetweenReveal * (result.length + 2));
    };

    const resultLetterToHtmlElement = (
      resultLetter,
      playingLine,
      foundLetter
    ) => {
      const cellTd = document.createElement("td");
      cellTd.className = `letter-hidden board-cell`;
      const overlayDiv = document.createElement("div");
      overlayDiv.className = `overlay match-${resultLetter.match}`;
      const letterDiv = document.createElement("div");
      letterDiv.className = `letter`;
      const text = document.createTextNode(
        playingLine ? (foundLetter && foundLetter.letter) || "." : ""
      );
      letterDiv.appendChild(text);
      cellTd.appendChild(overlayDiv);
      cellTd.appendChild(letterDiv);
      return cellTd;
    };

    const wordToHtmlElement = (result, isPlaceHolder) => {
      const wordElement = document.createElement("tr");
      wordElement.className = isPlaceHolder ? "placeholder" : "";
      result.forEach((resultLetter) =>
        wordElement.appendChild(resultLetter.htmlElement)
      );
      return wordElement;
    };

    const resultWithHtmlElement = (result) =>
      result.map((resultLetter, letterIndex) => ({
        ...resultLetter,
        htmlElement: resultLetterToHtmlElement(
          resultLetter,
          true,
          foundLetters[letterIndex]
        ),
      }));

    const checkWord = ($$en, word, ga) => {
      metrics.tryCount++;
      ga && window.ga("send", "event", "answer-motus", word);

      const resultWithExactMatches = [...word].map((letter, letterIndex) => ({
        letter,
        match: letter === $$en[letterIndex] && "exact",
      }));

      [...$$en]
        .filter(
          (_, letterIndex) => !(resultWithExactMatches[letterIndex] || {}).match
        )
        .forEach(
          (remainingLetter) =>
            ((
              resultWithExactMatches.find(
                (resultLetter) =>
                  resultLetter.letter === remainingLetter && !resultLetter.match
              ) || {}
            ).match = "word")
        );

      return resultWithExactMatches;
    };

    const insertHtmlElementInBoard = (board, htmlElement, remove) => {
      const allBoardWords = board.getElementsByTagName("tr");
      const nextPlaceHolder = board.getElementsByClassName("placeholder")[0];
      board[nextPlaceHolder ? "insertBefore" : "appendChild"](
        htmlElement,
        nextPlaceHolder
      );
      (remove || nextPlaceHolder) &&
        board.removeChild(nextPlaceHolder || allBoardWords[0]);
    };

    [...Array(5)].forEach((_, placeHolderIndex) =>
      board.appendChild(
        wordToHtmlElement(
          [
            ...foundLetters.map((foundLetter) => ({
              htmlElement: resultLetterToHtmlElement(
                {},
                placeHolderIndex === 0,
                foundLetter
              ),
            })),
          ],
          true
        )
      )
    );

    new Audio(jingleMp3).play();
    focusInput();
  },
};
