// Option B: Disappear after a set time (e.g., 3 seconds)
setTimeout(function() {
    document.getElementById('overlay').remove();
}, 3000);
const clues = [];
const question = document.getElementById('question');
const qtitle = document.getElementById('qtitle');

let cat = ["A","B","C","D","E","F"];

for (let i = 0; i < 7; i++) {
    clues[i]=[];
    for (let j = 0; j < 6; j++) {
        let clueId = cat[i]+j;
        let x = this.myListener.bind(this,i,j);
        console.log(clueId);
        clues[i][j]=document.getElementById(clueId);
        clues[i][j].addEventListener('click',x);
    }
}

function myListener(x,y){
    question.innerText = x;
    qtitle.innerText = y
}
