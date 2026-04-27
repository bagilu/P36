
const signals=[
{text:'競爭品牌降價20%',importance:'important',impact:'crisis'},
{text:'環保商品搜尋量上升',importance:'important',impact:'opportunity'},
{text:'CEO生日上新聞',importance:'noise',impact:'none'},
{text:'港口罷工導致物流停擺',importance:'important',impact:'crisis'},
{text:'產品開箱影片爆紅',importance:'important',impact:'opportunity'},
{text:'粉專新增10個按讚',importance:'noise',impact:'none'}
];

let current=null;
let score=0;
let timer=60;
let gameRunning=false;
let awaitingImpact=false;

function randomSignal(){
 current=signals[Math.floor(Math.random()*signals.length)];
 document.getElementById('fallingBox').innerText=current.text;
 awaitingImpact=false;
}

function startGame(){
score=0; timer=60; gameRunning=true;
updateScore();
randomSignal();
let t=setInterval(()=>{
 timer--;
 document.getElementById('timer').innerText=timer;
 if(timer<=0){
  clearInterval(t);
  gameRunning=false;
  document.getElementById('status').innerText='遊戲結束';
 }
},1000);

let speed=4000;
function loop(){
 if(!gameRunning)return;
 randomSignal();
 speed=Math.max(1800,speed-120);
 setTimeout(loop,speed);
}
setTimeout(loop,speed);
}

function judgeImportance(ans){
if(!gameRunning||!current)return;
if(ans===current.importance){
 score+=10;
 document.getElementById('status').innerText='第一階段正確';
 if(ans==='important'){awaitingImpact=true; return;}
}else{
 score-=5;
 document.getElementById('status').innerText='判斷錯誤';
}
updateScore();
randomSignal();
}

function judgeImpact(ans){
if(!awaitingImpact||!gameRunning)return;
if(ans===current.impact){score+=10;document.getElementById('status').innerText='商機/危機正確';}
else {score-=5;document.getElementById('status').innerText='第二階段錯誤';}
awaitingImpact=false;
updateScore();
randomSignal();
}

function updateScore(){
document.getElementById('score').innerText='Score:'+score;
}
