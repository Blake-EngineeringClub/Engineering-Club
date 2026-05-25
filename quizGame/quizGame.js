const SHEET_ID = '1Px4bbtqKRQvFQvBrIiExjfzFkDHtGRb8_s2NpXWr7AE'; // Replace this!
const QUESTION_SHEET = 'Sheet1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${QUESTION_SHEET}`;

const ANSWER_SHEET = 'Sheet2'; 
const URL2 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ANSWER_SHEET}`;

let EOT = "\u000A";

let questions = [];
let answers = [];
let currentQuestionIndex = 0;
let reds = 0;
let blues = 0;
let greens = 0;
let yellows = 0;
let category = 0;
let questionNo = 0;
let keepReading = true;
let count = 0;
let state = "idle";
let serialState = "N";

const decoder = new TextDecoder();
let port = "";

let stream;
let reader;
let textDecoder;
let readableStreamClosed;


const clues = [];

const connectRed = document.getElementById('red_connect');
const connectBlue = document.getElementById('blue_connect');
const connectGreen = document.getElementById('green_connect');
const connectYellow = document.getElementById('yellow_connect');
const statusRed = document.getElementById('red_status');
const statusBlue = document.getElementById('blue_status');
const statusGreen = document.getElementById('green_status');
const statusYellow = document.getElementById('yellow_status');

const startBtn = document.getElementById('start');
const connectBtn = document.getElementById('connect');

const question = document.getElementById('question');
const answer = document.getElementById('answer-main');
const answerText = document.getElementById('answer-text');
const questionBox = document.getElementById('questionText');
const qtitle = document.getElementById('header-back');
const header = document.getElementById('header');
const main = document.getElementById('main');
const redBox = document.getElementById('red-box');
const blueBox = document.getElementById('blue-box');
const greenBox = document.getElementById('green-box');
const yellowBox = document.getElementById('yellow-box');
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

const timerText = document.getElementById('timer-text');

//const answerBtn = document.getElementById('answerBtn');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let timerInterval;

redMinus.addEventListener('click',rmclick);
redPlus.addEventListener('click',rpclick);
blueMinus.addEventListener('click',bmclick);
bluePlus.addEventListener('click',bpclick);
greenMinus.addEventListener('click',gmclick);
greenPlus.addEventListener('click',gpclick);
yellowMinus.addEventListener('click',ymclick);
yellowPlus.addEventListener('click',ypclick);
//answerBtn.addEventListener('click',showAnswer);

startBtn.addEventListener('click', start);
connectBtn.addEventListener('click', connect);

connectRed.addEventListener('click', redConnect);
connectBlue.addEventListener('click', blueConnect);
connectGreen.addEventListener('click', greenConnect);
connectYellow.addEventListener('click', yellowConnect);

questionBox.addEventListener('click', (event) => {
    main.classList.remove('is-flipped');
    header.classList.remove('is-flipped');
    answer.classList.remove('is-flipped');
    timerText.textContent = "";
    timerText.removeEventListener('click',showAnswer);
    resetBoxes();
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

function myListener(x,y){
    question.innerText = questions[y].question[x];
    qtitle.innerText = questions[0].question[x]+" "+ (y*100);
    answerText.innerText = answers[y].answer[x];
    main.classList.add('is-flipped');
    header.classList.add('is-flipped');
    //answerText.addEventListener('click',showAnswer);
    //answer.classList.add('is-flipped');
    sendQuestion();
    startTimer(120);
    readFromSerial();
    category = y;
    questionNo = x;
}

function start () {
    document.getElementById('overlay').remove();
    sendReady();
}

function connect() {
    connectSerial();
    document.getElementById('overlay2').remove();
    keepreading = true;
}

function startTimer(duration) {
    clearInterval(timerInterval); // Clear any existing timer
    timerText.textContent = "";
    let timer = duration, minutes, seconds;
    
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        // Add leading zeros if minutes/seconds are less than 10
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerText.textContent = minutes + ":" + seconds;
        //console.log(minutes + ":" + seconds)

        if (--timer < 0) {
            clearInterval(timerInterval);
            timerText.textContent = "Show Answer";
            timerText.addEventListener('click',showAnswer);
            //answer.classList.add('is-flipped');
        }
    }, 1000); // Update every 1 second (1000ms)
}


function showAnswer (event){
    //alert(answers[category].answer[questionNo]);
    answer.classList.add('is-flipped');
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

async function sendRed(){
    //await reader.cancel();    
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("connectRed\n"); 
    writer.close();
    await writableStreamClosed;      
    writer.releaseLock();
    keepReading = true;
}

async function sendBlue(){
    await reader.cancel();
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("connectBlue\n"); 
    writer.close();
    await writableStreamClosed;      
    writer.releaseLock();
    keepReading = true;
}

async function sendGreen(){
    await reader.cancel();    
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("connectGreen\n"); 
    writer.close();
    await writableStreamClosed;      
    writer.releaseLock();
    keepReading = true;
}

async function sendYellow(){
    await reader.cancel();    
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("connectYellow\n"); 
    writer.close();
    await writableStreamClosed;      
    writer.releaseLock();
    keepReading = true;
}


async function sendReady(){
    await reader.cancel();
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("ready\n"); 
    writer.close();
    await writableStreamClosed;      
    writer.releaseLock();
    keepReading = true;
}

 async function sendQuestion(){
    keepReading = false;
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write("question\n");
    writer.close();
    await writableStreamClosed;     
    writer.releaseLock();
    keepReading = true;
}

async function blueConnect() {
    if (serialState == "N"){
        connectSerial();
    }
    sendBlue();
    while (true) {
        if (keepReading){
        while (port.readable) {
            if (port.readable.locked){
                reader.cancel();
                await reader.releaseLock();
                reader = port.readable.getReader();
            }
            else{
                reader = port.readable.getReader();
            }
            let chunks = '';
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    const decoded = decoder.decode(value);
                    chunks += decoded;                
                    if (done || decoded.includes(EOT)) {
                         chunks = chunks.trim();
                        if (chunks != ""){
                            if (chunks == "blue connected"){
                                count++;
                                statusBlue.textContent = "blue connected";
                                statusBlue.style.backgroundColor = "blue";
                                return;
                            } else if(chunks == "timeout"){
                                statusBlue.textContent = "Connection Timed out";
                                //serOut.style.backgroundColor = "light blue"                                
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                keepReading = true;
            }
            await sleep(10); 
        }  
    }
        await sleep(10); 
    }
}
async function greenConnect() {
    if (serialState == "N"){
        connectSerial();
    }
    sendGreen();
    while (true) {
        if (keepReading){
        while (port.readable) {
            if (port.readable.locked){
                reader.cancel();
                await reader.releaseLock();
                reader = port.readable.getReader();
            }
            else{
                reader = port.readable.getReader();
            }
            let chunks = '';
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    const decoded = decoder.decode(value);
                    chunks += decoded;                
                    if (done || decoded.includes(EOT)) {
                         chunks = chunks.trim();
                        if (chunks != ""){
                            if (chunks == "green connected"){
                                count++;
                                statusGreen.textContent = "green done";
                                statusGreen.style.backgroundColor = "green";
                                return;
                            } else if(chunks == "timeout"){
                                statusGreen.textContent = "Connection Timed out";
                                //serOut.style.backgroundColor = "light greed"                                
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                keepReading = true;
            }
            await sleep(10); 
        }  
    }
        await sleep(10); 
    }
}
async function yellowConnect() {
    if (serialState == "N"){
        connectSerial();
    }
    sendYellow();
    while (true) {
        if (keepReading){
        while (port.readable) {
            if (port.readable.locked){
                reader.cancel();
                await reader.releaseLock();
                reader = port.readable.getReader();
            }
            else{
                reader = port.readable.getReader();
            }
            let chunks = '';
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    const decoded = decoder.decode(value);
                    chunks += decoded;                
                    if (done || decoded.includes(EOT)) {
                         chunks = chunks.trim();
                        if (chunks != ""){
                            if (chunks == "yellow connected"){
                                count++;
                                statusYellow.textContent = "yellow done";
                                statusYellow.style.backgroundColor = "yellow";
                                return;
                            } else if(chunks == "timeout"){
                                statusYellow.textContent = "Connection Timed out";
                                //serOut.style.backgroundColor = "light yellow"                                
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                keepReading = true;
            }
            await sleep(10); 
        }  
    }
        await sleep(10); 
    }
}

async function redConnect() {
    if (serialState == "N"){
        connectSerial();
    }
    sendRed();
    console.log(keepreading);
    while (true) {
        if (keepReading){
        while (port.readable) {
            if (port.readable.locked){
                reader.cancel();
                await reader.releaseLock();
                reader = port.readable.getReader();
            }
            else{
                reader = port.readable.getReader();
            }
            let chunks = '';
            console.log("reading started")
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    const decoded = decoder.decode(value);
                    chunks += decoded; 
                    if (done || decoded.includes(EOT)) {
                         chunks = chunks.trim();
                        console.log(chunks);
                        if (chunks != ""){
                            console.log(chunks);
                            if (chunks == "red connected"){
                                count++;
                                statusRed.textContent = "red done";
                                statusRed.style.backgroundColor = "red";
                                return;
                            } else if(chunks == "timeout"){
                                statusRed.textContent = "Connection Timed out";
                                //serOut.style.backgroundColor = " light red"                                
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                keepReading = true;
            }
            await sleep(10); 
        }  
    }
        await sleep(10); 
    }
}

async function connectSerial() { 
     const filters = [
         { usbVendorId: 12346, usbProductId: 16385 }
     ];
     port = await navigator.serial.requestPort({filters}); 
     await port.open({ baudRate: 115200 });
     serialState = "C";
     console.log("connected");
     return serialState;
 }

function ansRed(){
    clearInterval(timerInterval);
//    redBox.classList.add('greyed-out');
    blueBox.classList.add('greyed-out');
    greenBox.classList.add('greyed-out');
    yellowBox.classList.add('greyed-out');
    timerText.textContent = "Show Answer";
    timerText.addEventListener('click',showAnswer);

}

function ansBlue(){
    clearInterval(timerInterval);
    redBox.classList.add('greyed-out');
    //blueBox.classList.add('greyed-out');
    greenBox.classList.add('greyed-out');
    yellowBox.classList.add('greyed-out');
    timerText.textContent = "Show Answer";
    timerText.addEventListener('click',showAnswer);

}

function ansGreen(){
    clearInterval(timerInterval);
    redBox.classList.add('greyed-out');
    blueBox.classList.add('greyed-out');
    //greenBox.classList.add('greyed-out');
    yellowBox.classList.add('greyed-out');
    timerText.textContent = "Show Answer";
    timerText.addEventListener('click',showAnswer);

}

function ansYellow(){
    clearInterval(timerInterval);
    redBox.classList.add('greyed-out');
    blueBox.classList.add('greyed-out');
    greenBox.classList.add('greyed-out');
    //yellowBox.classList.add('greyed-out');
    timerText.textContent = "Show Answer";
    timerText.addEventListener('click',showAnswer);

}

function resetBoxes(){
    clearInterval(timerInterval);
    redBox.classList.remove('greyed-out');
    blueBox.classList.remove('greyed-out');
    greenBox.classList.remove('greyed-out');
    yellowBox.classList.remove('greyed-out');
    timerText.textContent = "";
    timerText.removeEventListener('click',showAnswer);
}

async function readFromSerial() {
    while (true) {

        if (keepReading){
        while (port.readable) {
            if (port.readable.locked){
                reader.cancel();
                await reader.releaseLock();
                reader = port.readable.getReader();
            }
            else{
                reader = port.readable.getReader();
            }
            let chunks = '';
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    const decoded = decoder.decode(value);
                    chunks += decoded;
                    if (done || decoded.includes(EOT)) {
                        chunks = chunks.trim();
                        console.log(chunks);
                        chunks = chunks.split("\n")[0].trim();
                        if (chunks != "")
                            //serOut.textContent = chunks;
                            if (chunks == "yellow"){
                                ansYellow();
                                //serOut.textContent = "yellow button pressed";
                                //serOut.style.backgroundColor = "yellow"
                            }
                            if (chunks == "blue"){
                                ansBlue();
                               // serOut.textContent = "blue button pressed";
                                //serOut.style.backgroundColor = "blue"
                            }
                            if (chunks == "red"){
                                ansRed();
                                //serOut.textContent = "red button pressed";
                                //serOut.style.backgroundColor = "red"
                            }
                            if (chunks == "green"){
                                ansGreen();
                               // serOut.textContent = "green button pressed";
                               // serOut.style.backgroundColor = "green"
                            }
                            return chunks;
                        break;
                    }
                }
                if (chunks != "")
                    serOut.textContent = chunks;
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                keepReading = true;
            }
            await sleep(10); 
        }  
    }
        await sleep(10); 
    }
}
