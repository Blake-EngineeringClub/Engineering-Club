// Option B: Disappear after a set time (e.g., 3 seconds)
setTimeout(function() {
    document.getElementById('overlay').remove();
}, 3000);

const SHEET_ID = '1Px4bbtqKRQvFQvBrIiExjfzFkDHtGRb8_s2NpXWr7AE'; // Replace this!
const SHEET_NAME = 'Sheet1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const clues = [];
const question = document.getElementById('question');
const qtitle = document.getElementById('qtitle');
const main = document.getElementById('main');



async function fetchQuestions() {
    try {
        const response = await fetch(URL);
        const text = await response.text();
        // Google Sheets returns a JSON structure wrapped in a function call
        const json = JSON.parse(text.substr(88).slice(0, -2));        
        questions = json.table.rows.map(row => ({
            question: [row.c[0].v, row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v, row.c[5].v]
        }));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

console.log(questions[1]);
let cat = ["questionA","questionB","questionC","questionD","questionE","questionF"];
for (let i = 0; i < 6; i++) {
    clues[i]=[];
    for (let j = 1; j < 6; j++) {
        let clueId = cat[i]+j;
        let x = this.myListener.bind(this,cat[i],j);
        clues[i][j]=document.getElementById(clueId);
        clues[i][j].addEventListener('click',x);
    }
}

function myListener(x,y){
    const q = questions[y-1];
     console.log(q);
    question.innerText = q[x];
    qtitle.innerText = y;
    main.classList.add('is-flipped');
}
