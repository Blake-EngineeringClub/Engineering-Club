// Option B: Disappear after a set time (e.g., 3 seconds)
setTimeout(function() {
    document.getElementById('overlay').remove();
}, 3000);

const SHEET_ID = '1Px4bbtqKRQvFQvBrIiExjfzFkDHtGRb8_s2NpXWr7AE'; // Replace this!
const QUESTION_SHEET = 'Sheet1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${QUESTION_SHEET}`;

const ANSWER_SHEET = 'Sheet2'; 
const URL2 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ANSWER_SHEET}`;

let questions = [];
let answers = [];
let currentQuestionIndex = 0;
let reds = 0;
let blues = 0;
let greens = 0;
let yellows = 0;
let category = 0;
let questionNo = 0;

const decoder = new TextDecoder();
let port = "";
let keepReading = false;
let stream;
let reader;
let textDecoder;
let readableStreamClosed;


const clues = [];
const connect = document.getElementById('connect');
const question = document.getElementById('question');
const questionBox = document.getElementById('questionBox');
const qtitle = document.getElementById('header-back');
const header = document.getElementById('header');
const main = document.getElementById('main');
const redMinus = document.getElementById('redMinus');
const redPlus = document.getElementById('redPlus');
const blueMinus = document.getElementById('blueMinus');
const bluePlus = document.getElementById('bluePlus');
const greenMinus = document.getElementById('greenMinus');
const greenPlus = document.getElementById('greenPlus');
const yellowMinus = document.getElementById('yellowMinus');
const yellowPlus = document.getElementById('yellowPlus');
const redScore = document.getElementById('redScore');
const blueScore = document.getElementById('blueScore');
const greenScore = document.getElementById('greenScore');
const yellowScore = document.getElementById('yellowScore');

const answerBtn = document.getElementById('answerBtn');



redMinus.addEventListener('click',rmclick);
redPlus.addEventListener('click',rpclick);
blueMinus.addEventListener('click',bmclick);
bluePlus.addEventListener('click',bpclick);
greenMinus.addEventListener('click',gmclick);
greenPlus.addEventListener('click',gpclick);
yellowMinus.addEventListener('click',ymclick);
yellowPlus.addEventListener('click',ypclick);
answerBtn.addEventListener('click',showAnswer);

connect.addEventListener('click', async (event) => {
    const filters = [
        { usbVendorId: 12346, usbProductId: 16385 }
    ];
    port = await navigator.serial.requestPort({filters}); 
    await port.open({ baudRate: 115200 });
    
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    
    const writer = textEncoder.writable.getWriter();
    
    await writer.write("C1000");
    
    writer.close();
    await writableStreamClosed;     
    
    writer.releaseLock();
    
    keepReading = true;

});

questionBox.addEventListener('click', (event) => {
    main.classList.remove('is-flipped');
    header.classList.remove('is-flipped');
    sendReady();
});

fetchQuestions();
fetchAnswers();

console.log(questions);
let cat = ["questionA","questionB","questionC","questionD","questionE","questionF"];
for (let i = 0; i < 6; i++) {
    clues[i]=[];
    for (let j = 1; j < 6; j++) {
        let clueId = cat[i]+j;
        let x = this.myListener.bind(this,i,j);
        clues[i][j]=document.getElementById(clueId);
        clues[i][j].addEventListener('click',x);
    }
}

function showAnswer (event){
    alert(answers[category].answer[questionNo]);
    event.stopPropagation();
}

function rmclick(){
    reds -= 100;
    redScore.innerText = reds;
}

function rpclick(){
    reds += 100;
    redScore.innerText = reds;
}

function bmclick(){
    blues -= 100;
    blueScore.innerText = blues;
}

function bpclick(){
    blues += 100;
    blueScore.innerText = blues;
}

function gmclick(){
    greens -= 100;
    greenScore.innerText = greens;
}

function gpclick(){
    greens += 100;
    greenScore.innerText = greens;
}

function ymclick(){
    yellows -= 100;
    yellowScore.innerText = yellows;
}

function ypclick(){
    yellows += 100;
    yellowScore.innerText = yellows;
}

async function fetchQuestions() {
    try {
        const response = await fetch(URL);
        const text = await response.text();
        // Google Sheets returns a JSON structure wrapped in a function call
        const json = JSON.parse(text.substr(47).slice(0, -2));        
        questions = json.table.rows.map(row => ({
            question: [row.c[0].v, row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v, row.c[5].v]
        }));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchAnswers() {
    try {
            const response = await fetch(URL2);
            const text = await response.text();
            // Google Sheets returns a JSON structure wrapped in a function call
            const json = JSON.parse(text.substr(47).slice(0, -2));        
            answers = json.table.rows.map(row => ({
                answer: [row.c[0].v, row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v, row.c[5].v]
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
}

function myListener(x,y){
    question.innerText = questions[y].question[x];
    qtitle.innerText = questions[0].question[x]+" "+ (y*100);
    main.classList.add('is-flipped');
    header.classList.add('is-flipped');
    category = y;
    questionNo = x;
}

async function sendReady(){
    keepReading = false;
    
    serOut.textContent = "connecting...";
    serOut.style.backgroundColor = "grey"

    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

    const writer = textEncoder.writable.getWriter();

    await writer.write("ready\n");
    
    writer.close();
    await writableStreamClosed;     
    
    writer.releaseLock();

    keepReading = true;

}
