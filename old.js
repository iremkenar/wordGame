//Selecting Elements
const $wordContainer = document.querySelector('.word-container');
const $displayListLength = document.querySelector('.list-length');
const $startButton = document.querySelector('#start-btn');
const $timerEl = document.querySelector('#timer');
let wordList = [];
let nameData = [];
let countdown;
let lastLetter;
let firstLetter;
let computerAnswer;
let winner;

//get name data
fetch('newnames.json')
  .then((data) => data.json())
  .then((data) => {
    nameData = data;
  });

//player saying the name
function recognizePlayerSpeech(lastLetter) {
  //setting speech recognition for the player
  window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechRecognition = new SpeechRecognition();
  speechRecognition.start();
  // speechRecognition.interimResults = false;
  console.log(speechRecognition);

  //when player gives the answer
  speechRecognition.addEventListener('result', (e) => {
    console.log(e);
    const transcript = e.results[0][0].transcript;
    firstLetter = transcript[0].toLowerCase();
    console.log(transcript);
    // speechRecognition.onerror = function (event) {
    //   console.log('Error occurred in recognition: ');
    // };
    if (e.results[0][0].confidence < 0.6) {
      console.log('confidence level below 0.6');
      gameOver('computer');
    } else if (
      firstLetter === lastLetter &&
      nameData.includes(transcript) &&
      !wordList.includes(transcript)
    ) {
      wordList.push(transcript);
      $wordContainer.textContent = transcript;
      lastLetter = transcript[transcript.length - 1];
      computerSpeak(lastLetter);
      console.log(`player: ${wordList}`);
    } else {
      console.log(wordList);
      gameOver('computer');
    }
  });
}

//computer saying the name
$startButton.addEventListener('click', computerSpeak);

function computerSpeak(lastLetter) {
  if (wordList.length === 0) {
    // random answer for computer
    // console.log(lastLetter);
    computerAnswer = nameData[Math.floor(Math.random() * nameData.length - 1)];
    console.log(computerAnswer);
  } else {
    console.log(lastLetter);
    let possibility = Math.random() * 100;
    if (possibility < 70) {
      computerName = nameData.filter(
        (name) => name[0].toLowerCase() === lastLetter
      );
      computerAnswer =
        computerName[Math.floor(Math.random() * computerName.length - 1)];
    } else {
      gameOver('player');
    }
  }

  //random time for the computer's answer
  const randomTime = Math.floor(Math.random() * 5);
  roundTimer(randomTime);
  // computer speaks when random time is 0
  setTimeout(() => {
    const computer = new SpeechSynthesisUtterance(computerAnswer);
    window.speechSynthesis.speak(computer);
    $wordContainer.textContent = computerAnswer;
    wordList.push(computerAnswer);
    lastLetter = computerAnswer[computerAnswer.length - 1];
    console.log(`computer: ${wordList}`);
    computer.addEventListener('end', function () {
      roundTimer(8);
      recognizePlayerSpeech(lastLetter);
    });
  }, randomTime * 1000);
}

//Game Over
function gameOver(winner) {
  $displayListLength.textContent = wordList.length;
  // $timerEl.classList.add('hidden');
  $wordContainer.textContent = `Game Over ${winner} won!`;
  wordList = [];
  clearInterval(countdown);
}

//Timer
function roundTimer(seconds) {
  //restart the timer
  clearInterval(countdown);

  const now = Date.now();
  const then = now + seconds * 1000;
  displayTimeLeft(seconds);

  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    if (secondsLeft < 0) {
      clearInterval(countdown);
      return;
    }
    displayTimeLeft(secondsLeft);
  }, 1000);
}

function displayTimeLeft(seconds) {
  const remainderSeconds = seconds % 60;
  const display = `00:0${remainderSeconds}`;
  $timerEl.textContent = display;
}

// get list of languages on browser
// const getVoices = () => {
//   return new Promise((resolve) => {
//     let voices = speechSynthesis.getVoices();
//     if (voices.length) {
//       resolve(voices);
//       return;
//     }
//     speechSynthesis.onvoiceschanged = () => {
//       voices = speechSynthesis.getVoices();
//       resolve(voices);
//     };
//   });
// };

// const printVoicesList = async () => {
//   (await getVoices()).forEach((voice) => {
//     console.log(voice.name, voice.lang);
//   });
// };

// printVoicesList();
