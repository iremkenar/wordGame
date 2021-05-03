//Selecting Elements
const $wordContainer = document.querySelector('.word-container');
const $displayListLength = document.querySelector('.list-length');
const $startButton = document.querySelector('#start-btn');
const $timerEl = document.querySelector('#timer');
//Initial Variables
let usedNameData = [];
let nameData = [];
let countdown;
let lastLetter;
let firstLetter;
let computerAnswer;
let winner;
let timeOut;
let isGameOver = false;
$startButton.disabled = true;

//Get name data
fetch('newnames.json')
  .then((data) => data.json())
  .then((data) => {
    nameData = data;
    $startButton.disabled = false;
  });

//Start game
$startButton.addEventListener('click', () => {
  usedNameData = [];
  countdown;
  lastLetter;
  firstLetter;
  computerAnswer;
  winner;
  timeOut;
  isGameOver = false;
  $displayListLength.innerHTML = '';
  $wordContainer.innerHTML = '';
  computerSpeak(lastLetter);
});

//Computer says a name
function computerSpeak(lastLetter) {
  if (usedNameData.length === 0) {
    // random answer for computer
    computerAnswer = nameData[Math.floor(Math.random() * nameData.length - 1)];
  } else {
    let possibility = Math.random() * 100;
    if (possibility < 70) {
      computerName = nameData.filter(
        (name) => name[0].toLowerCase() === lastLetter
      );
      computerAnswer =
        computerName[Math.floor(Math.random() * computerName.length - 1)];
    } else {
      computerAnswer =
        computerName[Math.floor(Math.random() * computerName.length - 1)];
      gameOver('player');
    }
  }
  //random time for the computer's answer
  const randomTime = Math.floor(Math.random() * 5);
  roundTimer(randomTime);
  //computer speaks when random time is 0
  timeOut = setTimeout(() => {
    if (!isGameOver) {
      const computer = new SpeechSynthesisUtterance(computerAnswer);
      // If Turkish works with the browser
      computer.lang = 'tr-TR';
      computer.pitch = 1;
      computer.volume = 1;
      window.speechSynthesis.speak(computer);
      $wordContainer.textContent = computerAnswer;
      usedNameData.push(computerAnswer);
      lastLetter = computerAnswer[computerAnswer.length - 1];
      computer.addEventListener('end', function () {
        roundTimer(8);
        recognizePlayerSpeech(lastLetter);
      });
    }
  }, randomTime * 1000);
}

//Player says a name
function recognizePlayerSpeech(lastLetter) {
  //speech recognition for the player
  window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechRecognition = new SpeechRecognition();
  speechRecognition.start();

  //when player gives an answer
  speechRecognition.addEventListener('result', (e) => {
    const transcript = e.results[0][0].transcript;
    firstLetter = transcript[0].toLowerCase();
    //Control if speech recognition fails
    if (e.results[0][0].confidence < 0.6) {
      gameOver('computer');
      //Check if name is correct
    } else if (
      firstLetter === lastLetter &&
      nameData.includes(transcript) &&
      !usedNameData.includes(transcript)
    ) {
      usedNameData.push(transcript);
      $wordContainer.textContent = transcript;
      lastLetter = transcript[transcript.length - 1];
      computerSpeak(lastLetter);
    } else {
      gameOver('computer');
    }
  });
}

// Game Over
function gameOver(winner) {
  isGameOver = true;
  $displayListLength.textContent = usedNameData.length;
  $wordContainer.textContent = `Game Over: ${winner} won!`;
  usedNameData = [];
  clearInterval(countdown);
  clearTimeout(timeOut);
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
