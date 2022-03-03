// Import data
import { speakerArray } from "./data.js";

//Set local storage key 
const LOCAL_STORAGE_SCORE_KEY = 'typing.highScores';
//Check for high score array in local storage, if there isn't one, initialize empty array.
let highScores = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SCORE_KEY)) || [];

// elements
const mainContent = document.querySelector('body');
const gameContainer = document.querySelector('.main-container')
const themeIcon = document.querySelector('#theme-toggle-icon');
const quote = document.querySelector('.quote');
const speaker = document.querySelector('.speaker');
const scoreTemplate = document.querySelector('#score-template');
const modal = document.querySelector('.success-modal');
const completionMessage = document.querySelector('.congrats');
const modalClose = document.querySelector('.close');
const modalRestart = document.querySelector('.restart');
const highScoreBody = document.querySelector('.high-scores-body');

// user input
const themeButton = document.querySelector('.theme-toggle');
const startBtn = document.querySelector('.start-btn');
const userInput = document.querySelector('.user-input')

// Event Listener
themeIcon.addEventListener('click', toggleTheme);
startBtn.addEventListener('click', startGame);
userInput.addEventListener('input', captureInput);
// Modal buttons
modalClose.addEventListener('click', hideModal);
modalRestart.addEventListener('click', startGame);


// Theme toggle functionality
function toggleTheme(){
    mainContent.classList.toggle('body-dark')
    themeButton.classList.toggle('theme-button-dark');
    themeIcon.classList.toggle('theme-button-dark');
    startBtn.classList.toggle('start-btn-light')
    if (themeIcon.classList.contains('fa-sun')) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
}


/*************** Global Variables *************************************/
let words = [];
let wordIndex = 0;
let startTime = Date.now();
let userId = 1;
let currentScore = 0;
let gameEnd = true;
userInput.disabled = true;

/*************** Start game *************************************/
function startGame(){
    let quoteObj = getQuoteObject(speakerArray);
    let quotedSpeaker = quoteObj[0];
    let specificQuote = quoteObj[1];

    // Clear text input if text present from previous game and focus on the input. 
    userInput.disabled = false;
    userInput.value = '';
    userInput.focus();
    startBtn.innerHTML = 'Start';
    currentScore = 0;
    wordIndex = 0;
    userId = Math.floor(Math.random() * 1000)
    gameEnd = false;
    hideModal();
   //Clear completion message if previously set 
   completionMessage.innerHTML = '';

    // Split quote into an array of words
    words = specificQuote.split(' ');

    // map each word to its own span element
    const spanWords = words.map(word => `<span> ${word} </span>`);
    
    // Display the quote in the quote element
    quote.innerHTML = spanWords.join('');

    // Set the speaker element to display the quoted speaker
    speaker.innerHTML = `- ${quotedSpeaker}`;

    // Highlight the first word of the word array
    quote.childNodes[0].className = 'highlight';

    startTime = new Date().getTime();
    console.log([quoteObj, startTime])
}

/*************** Random Quote generator *************************************/
// Returns random number between 0 and the length of the given array
function randNum(array){
    return Math.floor(Math.random() * array.length);
}

// Returns random quote based on array length
function getQuoteObject(array){
    // get a random object from the array
    let quoteObj = array[randNum(array)];
    // Get the person who was quoted
    let speaker = quoteObj.speaker;
    // retrieve the array of quotes associated with the speaker
    let quoteArray = quoteObj.quoteArray;
    // Get a random quote from that array of quotes
    let quote = quoteArray[randNum(quoteArray)];
    return [speaker, quote];
}



/************************************* Gather typing input *************************************/
function captureInput(){
    let currentWord = words[wordIndex];
    let typedValue = userInput.value;
    // end game condition
    if(typedValue === currentWord && wordIndex === words.length - 1){
        currentScore += currentWord.length;
        renderScores();
        gameOver();
    }else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
        userInput.value = '';
        // move to the next word & update current score
        wordIndex++;
        currentScore += currentWord.length;
        // reset the class name for all elements in quote
        for (const wordElement of quote.childNodes) {
            wordElement.className = '';
        }
        // highlight the new word
        quote.childNodes[wordIndex].className = 'highlight';
    } else if (currentWord.startsWith(typedValue)) {
    
        // currently correct
        // highlight the next word
        userInput.className = '';
    } else {
        // error state
        userInput.className = 'error';
        // subtract points
        currentScore -= 2;
    } 
}
// End game 
function gameOver(){
    let elapsedTime = (new Date().getTime() - startTime) / 1000;
    let winnerMessage = `Player ${userId} finished in ${elapsedTime} seconds. \n Total score: ${currentScore}`;
    completionMessage.innerText = winnerMessage;

    userInput.value = '';
    userInput.disabled = true;
    startBtn.innerHTML = 'Restart';
    const newScore = createHighScore(userId,elapsedTime,currentScore);
    highScores.push(newScore);
    saveAndRender();
    gameEnd = true;
    showModal();
    console.log(highScores);
}

// // /*************** Save input into local storage *************************************/
function createHighScore(id ,time,score){
    return {id: id, time: time, score: score }
}

function save(){
    localStorage.setItem(LOCAL_STORAGE_SCORE_KEY, JSON.stringify(highScores));
}

function saveAndRender(){
    save();
    renderScores();
}





function renderScores(){
    clearElement(highScoreBody);
   Object.entries(highScores).sort((a,b) => b[1].score - a[1].score).splice(0,10).forEach(score => {
        // console.log(score);
        const scoreElement = document.importNode(scoreTemplate.content, true);
        const rank = scoreElement.querySelector('.rank');
        const time = scoreElement.querySelector('.time');
        const playerScore = scoreElement.querySelector('.score');
        rank.append(score[1].id)
        time.append(score[1].time);
        playerScore.append(score[1].score);
        highScoreBody.appendChild(scoreElement);
    });
}

function clearElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}

/*************** Modal open and close *************************************/
function showModal(){
    modal.classList.remove('hidden');
    modal.classList.add('show');
    gameContainer.classList.add('blur-filter');
}

function hideModal(){
    modal.classList.remove('show');
    modal.classList.add('hidden');
    gameContainer.classList.remove('blur-filter')
}

renderScores();









