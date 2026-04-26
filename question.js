
const SHEET_ID = '1Px4bbtqKRQvFQvBrIiExjfzFkDHtGRb8_s2NpXWr7AE'; // Replace this!
const SHEET_NAME = 'Sheet1'; 
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function fetchQuestions() {
    try {
        const response = await fetch(URL);
        const text = await response.text();
        // Google Sheets returns a JSON structure wrapped in a function call
        const json = JSON.parse(text.substr(47).slice(0, -2));
        //const json = await response.json();
        
        questions = json.table.rows.map(row => ({
            question: row.c[0].v,
            options: [row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v],
            answer: row.c[5].v
        }));

        document.getElementById('loader').classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');
        showQuestion();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function showQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question').innerText = q.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => selectAnswer(btn, opt, q.answer);
        container.appendChild(btn);
    });
}

function selectAnswer(btn, selected, correct) {
    const buttons = document.querySelectorAll('#options-container button');
    buttons.forEach(b => b.disabled = true); // Prevent double clicking

    if (selected === correct) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
    }
    document.getElementById('next-btn').classList.remove('hidden');
}

document.getElementById('next-btn').onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        document.getElementById('next-btn').classList.add('hidden');
        showQuestion();
    } else {
        showResults();
    }
};

function showResults() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('score-text').innerText = `You got ${score} out of ${questions.length}`;
}

fetchQuestions();
