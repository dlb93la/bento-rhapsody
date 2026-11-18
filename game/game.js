'use strict';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1560, H = 1000;
const board = { x: 522, y: 272, cell: 91, n: 5 };
const palette = { ink: '#233d40', muted: '#6d7b72', paper: '#fff9e9', coral: '#dc6555', green: '#568b6c', gold: '#e6af4b' };
const foods = [
  { id: 'rice', name: 'Rice', nick: 'Kome', color: '#fffcdf', shadow: '#d8dab8', shape: [[0,0],[1,0],[0,1]], kind: 'rice', friend: 'salmon', enemy: 'tofu' },
  { id: 'salmon', name: 'Salmon', nick: 'Sake', color: '#f3947e', shadow: '#d76555', shape: [[0,0],[1,0],[2,0]], kind: 'fish', friend: 'rice', enemy: 'egg' },
  { id: 'egg', name: 'Tamago', nick: 'Tama', color: '#f6cb62', shadow: '#dca83c', shape: [[0,0],[1,0]], kind: 'egg', friend: 'broccoli', enemy: 'salmon' },
  { id: 'broccoli', name: 'Broccoli', nick: 'Buro', color: '#8fb689', shadow: '#598b69', shape: [[0,0],[0,1],[1,1]], kind: 'broccoli', friend: 'egg', enemy: 'ume' },
  { id: 'tofu', name: 'Tofu', nick: 'Fuku', color: '#f0ddc3', shadow: '#cbb597', shape: [[0,0],[1,0],[0,1],[1,1]], kind: 'tofu', friend: 'ume', enemy: 'rice' },
  { id: 'ume', name: 'Umeboshi', nick: 'Ume', color: '#ce6c79', shadow: '#a44e63', shape: [[0,0]], kind: 'ume', friend: 'tofu', enemy: 'broccoli' }
];
const byFood = Object.fromEntries(foods.map(f => [f.id, f]));
const recipes = [
  { name: 'A little duet', customer: 'Haru', role: 'The schoolkid', line: 'Mom used to hum on the way home. Let Rice and Salmon sing on two different beats.', needs: {rice:1,salmon:1}, cells: 6, bonds: 1, beats: 2, conflicts: 0, time: 180, memory: 'That sounds like home. PON... SHA!', mood: 'student' },
  { name: 'Garden percussion', customer: 'Midori', role: 'The gardener', line: 'My garden is quiet tonight. Pair Tamago with Broccoli. Give their duet a little rhythm.', needs: {egg:1,broccoli:1}, cells: 10, bonds: 2, beats: 2, conflicts: 0, time: 190, memory: 'Even my flowers would dance to this.', mood: 'gardener' },
  { name: 'Velvet & vinegar', customer: 'Sora', role: 'The illustrator', line: 'A soft OO and a tiny MI. Spread happy singers over three beats. Rice needs a friend, too.', needs: {tofu:1,ume:1,rice:1}, cells: 12, bonds: 2, beats: 3, conflicts: 0, time: 210, memory: 'I can hear the colors again.', mood: 'artist' },
  { name: 'Sunday harmony', customer: 'Akiko', role: 'The grandmother', line: 'A little bass. A little beatbox. Keep the rival voices apart and let three beats sing.', needs: {rice:1,salmon:1,egg:1,broccoli:1}, cells: 15, bonds: 3, beats: 3, conflicts: 0, time: 220, memory: 'My husband always sang off-key. I loved it.', mood: 'grandma' },
  { name: 'Six voices, one box', customer: 'Ren', role: 'The neighboring chef', line: 'The whole menu wants an audition. All six foods, four singing beats. Now that is a band.', needs: {rice:1,salmon:1,egg:1,broccoli:1,tofu:1,ume:1}, cells: 18, bonds: 3, beats: 4, conflicts: 0, time: 240, memory: 'We should take this kitchen on tour.', mood: 'chef' },
  { name: 'The last-train rhapsody', customer: 'Yuki', role: 'The last passenger', line: 'Some days you just need to hear someone happy. One full lunchbox. One last song.', needs: {rice:1,salmon:1,egg:1,broccoli:1,tofu:1,ume:1}, cells: 22, bonds: 4, beats: 4, conflicts: 0, time: 270, memory: 'Wait... the whole train is singing.', mood: 'traveler' }
];
const choir = window.BentoChoir;
const music = { beat: -1, phase: 0, bar: 0, pulses: {}, customer: 0, encore: 0, meter: 0, lastTick: performance.now() };
let state = { screen: 'title', level: 0, pieces: [], stock: {}, active: null, rotation: 0, score: 0, lives: 3, combo: 0, timer: 180, paused: false, help: false, sound: true, history: [], results: [], nextId: 1 };
let pointer = {x:-100,y:-100,down:false}, buttons = [], elapsed = 0, particles = [], toast = null;
let best = 0;
try { best = Number(localStorage.getItem('bento-rhapsody-best') || 0); } catch {}
function rect(x,y,w,h,r=16,fill=palette.paper,stroke=null) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
function text(s,x,y,size=20,color=palette.ink,align='left',weight=500) {
  ctx.font=`${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);
}
function wrap(s,x,y,width,size=19,color=palette.ink,line=27) {
  let row=''; for(const word of s.split(' ')){const trial=row+word+' ';ctx.font=`500 ${size}px "Trebuchet MS",sans-serif`;if(ctx.measureText(trial).width>width&&row){text(row,x,y,size,color);y+=line;row=word+' ';}else row=trial;}text(row,x,y,size,color);return y+line;
}
function button(label,x,y,w,h,action,style='dark',enabled=true) {
  const hover=pointer.x>=x&&pointer.x<=x+w&&pointer.y>=y&&pointer.y<=y+h;
  const fill=!enabled?'#d8d7c9':style==='light'?'#fff7e5':style==='coral'?(hover?'#ed8270':palette.coral):(hover?'#3b6263':palette.ink);
  rect(x,y+4,w,h,12,'#d6c5a4');rect(x,y,w,h,12,fill,style==='light'?'#ddd2b8':null);
  text(label,x+w/2,y+h/2,18,style==='light'?palette.ink:enabled?'#fff9e9':'#8d9488','center',700);
  buttons.push({x,y,w,h,action,enabled});
}
function tone(freq=440,length=.1,type='sine',volume=.035) {
  if(state.sound)choir.sing('egg',69+12*Math.log2(freq/440),{duration:length,volume:volume*2});
}
function resetMusic(){choir.hush();music.beat=-1;music.phase=.44;music.bar=0;music.pulses={};music.customer=0;}
function musicStep(){
  music.beat=(music.beat+1)%5;if(music.beat===0)music.bar++;
  let pattern=[];
  if(state.screen==='play'){
    const e=evaluate();pattern=state.pieces.map(p=>({...p,singing:e.singers.has(p.id),grumpy:e.grumpy.has(p.id)}));
  }else if(state.screen==='served')pattern=state.results.at(-1)?.pattern||[];
  else if(state.screen==='encore')pattern=state.results[(music.bar-1)%state.results.length]?.pattern||[];
  const section=pattern.filter(p=>p.x===music.beat&&(p.singing||p.grumpy));
  for(const p of section){
    music.pulses[p.id]={life:1,type:p.type,grumpy:p.grumpy};
    choir.sing(p.type,choir.pitch(p.type,p.y),{pan:(p.x-2)*.22,volume:.25/Math.sqrt(Math.max(1,section.length)),grumpy:p.grumpy,duration:p.grumpy?.19:undefined});
  }
  if(section.length&&state.screen!=='play'){
    music.customer=1;
    choir.sing(section[0].type,choir.pitch(section[0].type,section[0].y)-12,{volume:.065,duration:.25,pan:-.3});
  }
  if(state.screen==='encore'){
    if(music.beat===0)choir.whistle((music.bar-1)%5);
    if(music.beat===1||music.beat===4)choir.sing('broccoli',43,{volume:.13,duration:.1});
  }
}
function updateMusic(dt){
  for(const [id,p]of Object.entries(music.pulses)){p.life-=dt*3;if(p.life<=0)delete music.pulses[id];}
  music.customer=Math.max(0,music.customer-dt*3);
  music.meter=choir.level();
  if(state.paused||state.help||!['play','served','encore'].includes(state.screen))return;
  if(state.screen==='encore')music.encore+=dt;
  music.phase+=dt;
  if(music.phase>=.44){music.phase%=.44;musicStep();}
}
// Keep the choir in time even when rendering a frame takes longer than a beat.
window.setInterval?.(()=>{const now=performance.now();const dt=Math.min(.2,(now-music.lastTick)/1000);music.lastTick=now;updateMusic(dt);},25);
function toggleSound(){state.sound=!state.sound;choir.setEnabled(state.sound);}
function setPause(value){state.paused=value;state.active=null;if(value)choir.hush();}
function toggleHelp(){state.help=!state.help;state.active=null;choir.hush();}
function cells(shape,rotation=0){let a=shape.map(p=>p.slice());for(let r=0;r<rotation%4;r++)a=a.map(([x,y])=>[-y,x]);const minX=Math.min(...a.map(p=>p[0])),minY=Math.min(...a.map(p=>p[1]));return a.map(([x,y])=>[x-minX,y-minY]);}
function occupied(p){return cells(byFood[p.type].shape,p.rot).map(([x,y])=>[p.x+x,p.y+y]);}
function valid(type,x,y,rot,exclude=null){const taken=new Set(state.pieces.filter(p=>p.id!==exclude).flatMap(occupied).map(p=>p.join(',')));return cells(byFood[type].shape,rot).every(([a,b])=>x+a>=0&&x+a<5&&y+b>=0&&y+b<5&&!taken.has(`${x+a},${y+b}`));}
function evaluate(pieces=state.pieces){
  const grid=Array.from({length:5},()=>Array(5).fill(null)),counts={}, moods={}, pairs=new Map();let area=0;
  pieces.forEach(p=>{counts[p.type]=(counts[p.type]||0)+1;moods[p.id]=0;occupied(p).forEach(([x,y])=>{if(grid[y]&&x>=0&&x<5){grid[y][x]=p;area++;}});});
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){const a=grid[y][x];if(!a)continue;for(const [dx,dy] of [[1,0],[0,1]]){const b=grid[y+dy]?.[x+dx];if(b&&a.id!==b.id){const key=[a.id,b.id].sort((a,b)=>a-b).join('-');if(!pairs.has(key)){const relation=byFood[a.type].friend===b.type?1:byFood[a.type].enemy===b.type?-1:0;pairs.set(key,{a,b,relation});moods[a.id]+=relation;moods[b.id]+=relation;}}}}
  const bonds=[...pairs.values()].filter(p=>p.relation===1).length,conflicts=[...pairs.values()].filter(p=>p.relation===-1).length;
  const grumpy=new Set([...pairs.values()].filter(p=>p.relation===-1).flatMap(p=>[p.a.id,p.b.id]));
  const singers=new Set(pieces.filter(p=>moods[p.id]>0&&!grumpy.has(p.id)).map(p=>p.id));
  const beatSet=new Set(pieces.filter(p=>singers.has(p.id)).map(p=>p.x));
  for(const id of grumpy)moods[id]=-1;
  const recipe=recipes[state.level];const needs=Object.entries(recipe.needs).every(([id,n])=>(counts[id]||0)>=n);
  return {grid,counts,moods,pairs,bonds,conflicts,area,grumpy,singers,beatSet,rhythm:beatSet.size,ready:needs&&area>=recipe.cells&&bonds>=recipe.bonds&&conflicts<=recipe.conflicts&&beatSet.size>=recipe.beats};
}
function burst(x,y,color,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:Math.cos(i/n*Math.PI*2)*70,vy:Math.sin(i/n*Math.PI*2)*70-35,life:1,color,born:performance.now()});}
function notify(msg,good=true){toast={text:msg,life:3,good};tone(good?660:170,.14);}
function remember(){state.history.push(JSON.stringify({pieces:state.pieces,stock:state.stock}));if(state.history.length>35)state.history.shift();}
function undo(){const prev=state.history.pop();if(prev){Object.assign(state,JSON.parse(prev));state.active=null;tone(330);}}
function startLevel(){state.pieces=[];state.stock=Object.fromEntries(foods.map(f=>[f.id,3]));state.active=null;state.rotation=0;state.history=[];state.timer=recipes[state.level].time;state.screen='play';state.paused=false;state.help=false;resetMusic();}
function startGame(){state.level=0;state.score=0;state.lives=3;state.combo=0;state.results=[];state.nextId=1;startLevel();}
function deliver(){
  if(state.screen!=='play'||state.paused||state.help)return;
  const e=evaluate();if(!e.ready){notify('Check the order, the rival voices and the singing beats.',false);return;}
  const earned=500+e.area*20+e.bonds*110+e.rhythm*100+Math.floor(state.timer)*2+state.combo*100;
  const pattern=state.pieces.map(p=>({...p,singing:e.singers.has(p.id),grumpy:false}));
  state.score+=earned;state.combo++;state.results.push({name:recipes[state.level].name,earned,bonds:e.bonds,area:e.area,rhythm:e.rhythm,pattern});state.active=null;state.screen=state.level===5?'encore':'served';music.encore=0;resetMusic();burst(770,470,'#edb14b',35);
  if(state.score>best){best=state.score;try{localStorage.setItem('bento-rhapsody-best',best);}catch{}}
}
function timeout(){state.lives--;state.combo=0;state.active=null;state.screen=state.lives<=0?'gameover':'missed';choir.hush();tone(150,.35);}
function face(x,y,size,mood=0,seed=0,singing=0){
  const bounce=Math.sin(elapsed*2.7+seed)*size*.025;y+=bounce;
  ctx.save();ctx.translate(x,y);ctx.strokeStyle='#493d3d';ctx.fillStyle='#493d3d';ctx.lineWidth=Math.max(1.5,size*.055);ctx.lineCap='round';
  const blink=Math.sin(elapsed*.68+seed)>0.995;
  for(const side of [-1,1]){let ex=side*size*.17;if(mood>0){ctx.beginPath();ctx.arc(ex,-size*.03,size*.065,Math.PI,Math.PI*2);ctx.stroke();}else if(blink){ctx.beginPath();ctx.moveTo(ex-3,-2);ctx.lineTo(ex+3,-2);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(ex,-size*.04,size*.033,size*.055,0,0,Math.PI*2);ctx.fill();}}
  ctx.fillStyle='rgba(226,107,119,.48)';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*size*.28,size*.08,size*.075,size*.04,0,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#684646';ctx.beginPath();if(singing>0){ctx.fillStyle=mood<0?'#80667d':'#714752';ctx.ellipse(0,size*.14,size*.10,size*(.075+singing*.085),0,0,7);ctx.fill();ctx.fillStyle='#efa5a1';ctx.beginPath();ctx.ellipse(0,size*.20,size*.055,size*.028,0,0,7);ctx.fill();}else if(mood<0){ctx.arc(0,size*.24,size*.09,Math.PI*1.16,Math.PI*1.84);}else if(mood>0){ctx.arc(0,size*.065,size*.105,0,Math.PI);}else{ctx.arc(0,size*.08,size*.065,0,Math.PI);}ctx.stroke();
  if(mood<0){ctx.strokeStyle='#668d93';ctx.beginPath();ctx.moveTo(size*.38,-size*.24);ctx.quadraticCurveTo(size*.50,-size*.02,size*.38,-size*.02);ctx.stroke();}ctx.restore();
}
function ingredient(type,x,y,size,mood=0,seed=0,showFace=true,singing=0){
  const f=byFood[type];ctx.save();ctx.translate(x,y-singing*5);const s=size;ctx.rotate(Math.sin(elapsed*(mood<0?17:2)+seed)*(mood<0?.05:.025));ctx.scale(1+singing*.045,1+singing*.045);
  ctx.shadowColor='rgba(73,52,24,.12)';ctx.shadowBlur=5;ctx.shadowOffsetY=3;
  if(f.kind==='rice'){ctx.beginPath();ctx.moveTo(-s*.42,s*.27);ctx.quadraticCurveTo(-s*.55,s*.12,-s*.28,-s*.23);ctx.quadraticCurveTo(0,-s*.62,s*.25,-s*.25);ctx.quadraticCurveTo(s*.55,s*.15,s*.42,s*.30);ctx.quadraticCurveTo(0,s*.47,-s*.42,s*.27);ctx.fillStyle=f.color;ctx.fill();ctx.shadowBlur=0;rect(-s*.20,s*.12,s*.40,s*.25,4,'#395a48');}
  else if(f.kind==='fish'){rect(-s*.45,-s*.34,s*.9,s*.70,s*.18,f.color);ctx.shadowBlur=0;ctx.strokeStyle='#ffe7c0';ctx.lineWidth=s*.055;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-s*.37+i*s*.22,-s*.25);ctx.bezierCurveTo(-s*.05+i*s*.22,-s*.14,-s*.10+i*s*.22,s*.18,s*.18+i*s*.22,s*.27);ctx.stroke();}}
  else if(f.kind==='egg'){ctx.fillStyle='#fffbe8';ctx.beginPath();ctx.ellipse(0,0,s*.45,s*.35,.1,0,Math.PI*2);ctx.fill();ctx.fillStyle=f.color;ctx.beginPath();ctx.ellipse(0,0,s*.27,s*.23,0,0,Math.PI*2);ctx.fill();}
  else if(f.kind==='broccoli'){rect(-s*.10,0,s*.20,s*.40,5,'#afc797');for(const [a,b,r]of[[-.23,-.05,.23],[.23,-.05,.23],[0,-.22,.26],[0,0,.29]]){ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(s*a,s*b,s*r,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;ctx.strokeStyle='#649973';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-s*.18,-s*.12,s*.1,3,5);ctx.stroke();}
  else if(f.kind==='tofu'){rect(-s*.39,-s*.34,s*.78,s*.7,s*.12,f.color);ctx.shadowBlur=0;rect(-s*.33,-s*.27,s*.66,s*.11,5,'#fff6db');ctx.fillStyle='#c7ad8c';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(Math.sin(i*9)*s*.28,Math.cos(i*7)*s*.22,s*.018,0,7);ctx.fill();}}
  else {ctx.fillStyle=f.color;ctx.beginPath();ctx.ellipse(0,s*.025,s*.36,s*.34,0,0,7);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#a65369';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-s*.02,s*.02,s*.24,3.4,5.3);ctx.stroke();ctx.fillStyle='#7b9b66';ctx.beginPath();ctx.ellipse(s*.12,-s*.32,s*.16,s*.07,-.6,0,7);ctx.fill();}
  ctx.shadowBlur=0;if(showFace)face(0,0,s*.70,mood,seed,singing);ctx.restore();
}
function background(){
  ctx.fillStyle='#f3e8cf';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#263e44';ctx.fillRect(0,0,W,173);
  for(let i=0;i<15;i++){const x=i*125;rect(x+18,28,70,115,5,'#324e54');ctx.fillStyle='#f2c075';ctx.globalAlpha=.23;ctx.fillRect(x+25,50,5,60);ctx.globalAlpha=1;}
  // A wooden counter, with fixed grain so offline captures stay reproducible.
  ctx.fillStyle='#e9cc99';ctx.fillRect(0,805,W,195);for(let i=0;i<30;i++){ctx.strokeStyle=i%3===0?'#d0aa7330':'#fff6da40';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,812+i*7);ctx.bezierCurveTo(450,802+i*7,1100,830+i*7,W,810+i*7);ctx.stroke();}
  for(let i=0;i<8;i++){ctx.fillStyle='#e06855';ctx.fillRect(40+i*192,0,156,15);}
}
function header(){
  text('LAST TRAIN / LIVE FOOD CHOIR',74,46,16,'#f4c77b','left',700);text('BENTO RHAPSODY',74,96,46,'#fff4da','left',800);
  text('Pack a lunchbox. Accidentally start a band.',77,141,19,'#bdc9bd');
  for(let i=0;i<9;i++){const h=5+Math.max(music.meter,Math.sin(elapsed*4+i)*.08)*(22+i%3*9);rect(771+i*11,125-h,6,h,3,'#e8bd78');}
  rect(930,43,175,88,14,'#355258');text('ENCORE POINTS',950,65,12,'#b9ccc2','left',700);text(state.score.toLocaleString('en-US'),950,100,30,'#f8d69b','left',800);
  rect(1122,43,165,88,14,'#355258');text('TRACK / ORDER',1143,65,12,'#b9ccc2','left',700);text(`${state.level+1} / 6`,1143,100,30,'#fff4dc','left',800);
  text('♥'.repeat(state.lives)+'♡'.repeat(3-state.lives),1320,75,31,'#f09b8b');button(state.sound?'SOUND ON':'SOUND OFF',1320,108,153,37,toggleSound,'light');
}
function customer(x,y,kind){
  ctx.save();ctx.translate(x,y);const bob=Math.sin(elapsed*1.8)*3;ctx.translate(0,bob);
  rect(-68,30,136,75,40,kind==='chef'?'#d9e0d1':kind==='gardener'?'#83a78b':'#dc8a77');
  ctx.fillStyle='#354848';ctx.beginPath();ctx.ellipse(0,-10,68,74,0,0,7);ctx.fill();ctx.fillStyle='#f5d7b4';ctx.beginPath();ctx.ellipse(0,0,53,60,0,0,7);ctx.fill();
  ctx.fillStyle=kind==='grandma'?'#d6d2bf':'#374442';ctx.beginPath();ctx.ellipse(0,-39,56,27,0,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(-41,-22,15,42,.3,0,7);ctx.fill();
  face(0,9,95,['served','encore'].includes(state.screen)?1:0,3,music.customer);
  if(kind==='chef'){rect(-56,-66,112,27,8,'#fff8e4');for(let i=-1;i<=1;i++){ctx.fillStyle='#fff8e4';ctx.beginPath();ctx.arc(i*31,-69,25,0,7);ctx.fill();}}
  if(kind==='gardener'){ctx.fillStyle='#c4a16a';ctx.beginPath();ctx.ellipse(0,-48,88,12,0,0,7);ctx.fill();rect(-50,-86,100,35,20,'#d9b884');}
  if(kind==='grandma'){ctx.strokeStyle='#877d65';ctx.lineWidth=3;for(const s of [-1,1]){ctx.beginPath();ctx.arc(s*18,3,16,0,7);ctx.stroke();}}
  ctx.restore();
}
function drawPiece(p,mood,alpha=1){
  const a=occupied(p),pulse=music.pulses[p.id]?.life||0;ctx.save();ctx.globalAlpha=alpha;
  if(pulse){ctx.shadowColor=mood<0?'#a289b5':'#fff7c1';ctx.shadowBlur=20*pulse;}
  for(const [x,y]of a){const xx=board.x+x*board.cell,yy=board.y+y*board.cell;rect(xx+4,yy+5,board.cell-8,board.cell-10,16,byFood[p.type].shadow);rect(xx+4,yy+2,board.cell-8,board.cell-11,16,byFood[p.type].color,pulse?'#fff8d5':mood<0?'#98729d':null);}
  ctx.shadowBlur=0;const center=a[Math.floor(a.length/2)],xx=board.x+(center[0]+.5)*board.cell,yy=board.y+(center[1]+.5)*board.cell;
  ingredient(p.type,xx,yy,73,mood,p.id,true,pulse);
  if(mood!==0)text(mood>0?'♪':'!',board.x+(a[0][0]+.14)*board.cell,board.y+(a[0][1]+.18)*board.cell,21,mood>0?'#ba5869':'#80566c','center',800);
  if(pulse){rect(xx-30,yy-49-pulse*9,60,23,9,mood<0?'#775c7c':'#fff7d8');text(mood<0?'GRR':choir.voices[p.type].syllable,xx,yy-37-pulse*9,13,mood<0?'#fff5e9':palette.ink,'center',800);}ctx.restore();
}
function beatStrip(x,y,width,beatSet,height=23){
  const gap=7,w=(width-gap*4)/5;
  for(let i=0;i<5;i++){const live=i===music.beat,filled=beatSet.has(i);rect(x+i*(w+gap),y,w,height,8,live?'#e8b955':filled?'#5b8c76':'#e5d7ba');text(`${i+1}${filled?' ♪':''}`,x+i*(w+gap)+w/2,y+height/2,14,filled&&!live?'#fff8e7':palette.ink,'center',800);}
}
function gameplay(){
  const r=recipes[state.level], e=evaluate();header();
  rect(55,202,370,566,22,'#fff8e7','#ded0b6');text('TONIGHT\'S LISTENER',82,235,13,palette.muted,'left',700);
  customer(240,365,r.mood);text(r.customer,240,496,29,palette.ink,'center',800);text(r.role,240,526,16,palette.muted,'center');
  wrap(r.line,86,566,303,19,palette.ink,27);
  const fraction=state.timer/r.time;rect(84,686,310,12,6,'#e9dfc6');rect(84,686,Math.max(0,310*fraction),12,6,fraction<.25?palette.coral:'#8cae8d');text(`${Math.ceil(state.timer)}s to departure`,86,721,17,palette.muted);text(`COMBO ×${state.combo+1}`,391,721,16,palette.coral,'right',800);
  text(r.name,750,211,25,palette.ink,'center',800);beatStrip(board.x,235,455,e.beatSet,18);
  rect(board.x-24,board.y-18,board.cell*5+48,board.cell*5+40,24,'#b55e4b');rect(board.x-13,board.y-7,board.cell*5+26,board.cell*5+16,16,'#e1b681');
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){rect(board.x+x*board.cell+3,board.y+y*board.cell+3,board.cell-6,board.cell-6,13,(x+y)%2?'#f9e7c0':'#f4ddb3');ctx.fillStyle='#ddc39b';ctx.beginPath();ctx.arc(board.x+(x+.5)*board.cell,board.y+(y+.5)*board.cell,2,0,7);ctx.fill();}
  state.pieces.forEach(p=>drawPiece(p,e.moods[p.id]||0,state.active?.id===p.id?.5:1));
  if(music.beat>=0){rect(board.x+music.beat*91+3,board.y+3,85,447,13,'#fff5ad25');ctx.fillStyle='#f7dc85';ctx.fillRect(board.x+music.beat*91+6,board.y+446,79,4);}
  if(state.active&&pointer.x>board.x-30&&pointer.x<board.x+510&&pointer.y>board.y-30&&pointer.y<board.y+510){const x=Math.floor((pointer.x-board.x)/board.cell),y=Math.floor((pointer.y-board.y)/board.cell);const ok=valid(state.active.type,x,y,state.rotation,state.active.id);for(const [dx,dy]of cells(byFood[state.active.type].shape,state.rotation)){rect(board.x+(x+dx)*board.cell+5,board.y+(y+dy)*board.cell+5,board.cell-10,board.cell-10,12,ok?'#8cac8c99':'#de706c88');}}
  rect(1083,202,420,566,22,'#fff9eb','#ded0b6');text('THE SET LIST',1110,238,15,palette.muted,'left',700);text('A meal with a melody.',1110,273,23,palette.ink,'left',700);
  let y=315;for(const [id,n]of Object.entries(r.needs)){const done=(e.counts[id]||0)>=n;ingredient(id,1137,y,41,done?1:0,2);text(`${byFood[id].name}`,1174,y,18);text(`${Math.min(e.counts[id]||0,n)}/${n} ${done?'✓':''}`,1471,y,18,done?palette.green:palette.muted,'right',700);y+=35;}
  y=Math.max(y+8,420);
  const rules=[['Packed spaces',`${e.area}/${r.cells}`,e.area>=r.cells],['Happy duets',`${e.bonds}/${r.bonds}`,e.bonds>=r.bonds],['Rival neighbors',`${e.conflicts} / 0`,e.conflicts===0],['Singing beats',`${e.rhythm}/${r.beats}`,e.rhythm>=r.beats]];
  for(const [label,value,done]of rules){text(label,1110,y,17,palette.muted);text(value,1470,y,22,done?palette.green:palette.coral,'right',800);y+=30;}
  beatStrip(1110,y+3,365,e.beatSet,22);
  if(y<=550)wrap('A food enters on its leftmost column. Friends unlock its voice. Move it to change the song.',1110,y+53,350,17,palette.muted,24);
  button(e.ready?'SERVE THE SONG  →':'BUILD YOUR CHORUS',1110,696,365,46,deliver,'coral',e.ready);
  button('↶ Undo · Z',502,762,183,42,undo,'light',state.history.length>0);button('Rotate · R',699,762,144,42,()=>{state.rotation=(state.rotation+1)%4;tone(370);},'light',!!state.active);button('Remove',856,762,141,42,()=>{if(state.active?.id){remember();const p=state.pieces.find(p=>p.id===state.active.id);state.pieces=state.pieces.filter(p=>p.id!==p.id);state.stock[p.type]++;state.active=null;}},'light',!!state.active?.id);
  drawPantry();
  if(state.active){const f=byFood[state.active.type];text(`${f.nick}: ${choir.voices[f.id].syllable}  /  loves ${byFood[f.friend].name}  /  avoids ${byFood[f.enemy].name}  /  left-right = beat, up-down = pitch`,780,976,16,palette.ink,'center',700);}else text('CLICK or DRAG to pack  ·  R rotate  ·  Z undo  ·  H guide  ·  Esc pause  /  LEFT-RIGHT: BEAT · UP-DOWN: PITCH',780,976,16,palette.ink,'center');
}
function drawPantry(){
  text('THE EDIBLE LINEUP',64,834,14,'#715d43','left',800);text('Touch a friend to sing. Touch a rival to grumble. Five columns, five beats.',1494,834,16,'#715d43','right');
  foods.forEach((f,i)=>{const x=62+i*248, selected=state.active?.type===f.id;rect(x,858,235,94,17,selected?'#fff9e8':'#f7e7c7',selected?palette.coral:'#d5b883');ingredient(f.id,x+48,904,69,selected?1:0,i);text(f.name,x+94,884,18,palette.ink,'left',800);text(`♥ ${byFood[f.friend].name}`,x+94,910,13,palette.green);text(`${choir.voices[f.id].syllable} / ${choir.voices[f.id].role}`,x+18,937,12,palette.muted);text(`×${state.stock[f.id]}`,x+209,936,15,palette.muted,'right',700);});
}
function titleScreen(){
  header();text('COZY PACKING  ×  EDIBLE CHOIR',780,224,17,palette.coral,'center',800);text('Your lunch has a sound check.',780,285,50,palette.ink,'center',800);
  text('Pack food friends. Compose their chorus. Catch the last train.',780,338,23,palette.muted,'center');
  for(let i=0;i<10;i++){const x=130+i*143,y=410+Math.sin(elapsed+i)*30;ctx.globalAlpha=.16;text(i%2?'♫':'♪',x,y,40,palette.green,'center');}ctx.globalAlpha=1;
  rect(391,397,778,280,30,'#b75e4e');rect(408,411,744,247,22,'#f6dcb0');
  foods.forEach((f,i)=>{const x=470+(i%3)*248,y=476+Math.floor(i/3)*126;rect(x-33,y-37,236,105,17,'#fff0d1');ingredient(f.id,x+25,y+15,88,1,i,true,Math.max(0,Math.sin(elapsed*3-i*1.1))*.8);text(f.nick,x+90,y+2,23,palette.ink,'left',800);text(`${choir.voices[f.id].syllable} / ${choir.voices[f.id].role}`,x+90,y+34,12,palette.green);});
  text('ONE LUNCHBOX. FIVE BEATS. SIX VERY SMALL EGOS.',780,710,17,palette.coral,'center',800);
  button('START THE SOUND CHECK  →',475,756,435,64,startGame,'coral');button('HOW TO JAM · H',936,756,245,64,toggleHelp,'light');
  text('Six listeners. Six original songs. One accidental band.',780,864,21,palette.muted,'center');text(`Best set: ${best.toLocaleString('en-US')} points`,780,909,18,palette.ink,'center',700);
}
function resultOverlay(){
  buttons=[];
  ctx.fillStyle='#203c3cef';ctx.fillRect(0,173,W,H-173);const success=state.screen==='served',r=recipes[state.level];
  rect(405,227,750,625,27,palette.paper);text(success?'A first bite. A new voice.':'Even great bands miss a train.',780,281,31,palette.ink,'center',800);
  if(success){
    foods.forEach((f,i)=>{const pulse=Math.max(0,...Object.values(music.pulses).filter(p=>p.type===f.id).map(p=>p.life));ingredient(f.id,555+i*90,375,75,1,i,true,pulse);});
    text('♪',605,475,42,palette.coral,'center');ctx.save();ctx.translate(780,462);ctx.scale(.56,.56);customer(0,0,r.mood);ctx.restore();text('♫',950,475,42,palette.green,'center');
    text(`${r.customer} joins your chorus.`,780,546,20,palette.green,'center',800);wrap(`“${r.memory}”`,486,589,600,21,palette.ink,26);
    const last=state.results.at(-1);text(`+${last.earned.toLocaleString('en-US')} points  /  ${last.rhythm} singing beats`,780,653,19,palette.muted,'center',700);
    button('NEXT LISTENER  →',550,702,460,57,()=>{state.level++;startLevel();},'coral');
  }else{ingredient('rice',780,405,145,-1,0);text(state.lives>0?'Departure came before the chorus was ready.':'Three missed orders. The kitchen needs a rest.',780,543,21,palette.muted,'center');text(`Your set: ${state.score.toLocaleString('en-US')} points`,780,600,28,palette.ink,'center',800);button(state.lives>0?'TRY THIS TRACK AGAIN':'START A NEW SET',550,702,460,57,()=>state.lives>0?startLevel():startGame(),'coral');}
  button('Back to the title',630,787,300,38,()=>{state.screen='title';choir.hush();},'light');
}
function encoreScreen(){
  header();text('YOU DIDN\'T JUST PACK LUNCH. YOU PACKED A BAND.',780,222,17,palette.coral,'center',800);
  text('THE MIDNIGHT BITES',780,291,69,palette.ink,'center',800);
  text('Live from the last train / six lunchboxes, one bento rhapsody',780,344,22,palette.muted,'center');
  const active=(music.bar+5)%6,travel=music.encore%30,offset=travel>22?-((travel-22)**2)*30:0;
  ctx.save();ctx.translate(offset,0);
  for(let i=0;i<6;i++){
    const x=54+i*205,live=i===active,r=recipes[i];
    rect(x,427,199,246,20,live?'#548273':'#395b5e');rect(x+12,448,175,153,17,live?'#fff1bf':'#e9d9b8');
    text(r.customer,x+99,467,14,palette.ink,'center',800);
    ctx.save();ctx.translate(x+99,521);ctx.scale(.38,.38);customer(0,0,r.mood);ctx.restore();
    const recorded=state.results[i].pattern,lead=recorded.find(p=>p.singing&&p.type===['rice','egg','tofu','rice','broccoli','tofu'][i])||recorded.find(p=>p.singing);
    const partner=lead&&recorded.find(p=>p.singing&&p.type===byFood[lead.type].friend);
    const duet=[lead,partner].filter(Boolean);
    duet.forEach((p,n)=>ingredient(p.type,x+66+n*66,579,48,1,i+n,true,live?music.customer:Math.max(0,Math.sin(elapsed*3+i))*.35));
    text(live?'ON THE MIC':'BACKING VOCALS',x+99,631,11,live?'#ffe39b':'#c6d6c8','center',800);
    for(const wx of [45,153]){ctx.fillStyle='#233b40';ctx.beginPath();ctx.arc(x+wx,683,21,0,7);ctx.fill();ctx.strokeStyle='#aabfb5';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+wx,683,10,elapsed*3,elapsed*3+Math.PI*1.5);ctx.stroke();}
    const onBeat=recorded.find(p=>p.singing&&p.x===music.beat);
    if(live&&onBeat)text(choir.voices[onBeat.type].syllable,x+99,399-Math.sin(elapsed*5)*5,22,palette.coral,'center',800);
  }
  const engine=1292;rect(engine,462,209,206,24,'#d97560');rect(engine+27,401,123,102,17,'#df9470');rect(engine+44,421,88,64,10,'#fff0c5');rect(engine+140,426,32,63,8,'#304d50');rect(engine-9,646,238,24,8,'#2d4b4c');
  for(const wx of [42,153]){ctx.fillStyle='#233b40';ctx.beginPath();ctx.arc(engine+wx,680,27,0,7);ctx.fill();}
  face(engine+93,555,138,1,7,music.customer);text('♪',engine+155,370-Math.sin(elapsed*4)*10,43,palette.coral,'center');
  for(let i=0;i<8;i++)text(i%2?'♫':'♪',95+i*180,390-Math.sin(elapsed*2+i)*25,24,'#b29564','center');
  ctx.restore();ctx.fillStyle='#82948b';ctx.fillRect(0,713,W,5);ctx.fillRect(0,730,W,3);
  text('Every lunchbox found its voice. Every passenger joined in.',780,779,23,palette.ink,'center',700);
  beatStrip(553,822,454,new Set([0,1,2,3,4]),29);
  button('PLAY ANOTHER SET',396,890,355,57,startGame,'coral');button('REPLAY THE ENCORE',782,890,355,57,()=>{music.encore=0;resetMusic();},'light');
  text(`6 / 6 songs delivered  ·  ${state.score.toLocaleString('en-US')} points  ·  Your own arrangements are playing`,780,980,16,palette.muted,'center');
}
function guideOverlay(){
  buttons=[];ctx.fillStyle='#203c3cf2';ctx.fillRect(0,173,W,827);rect(320,210,920,725,28,palette.paper);
  text('How to conduct your lunch',780,269,38,palette.ink,'center',800);text('A puzzle you can hear. A song you can rearrange.',780,317,21,palette.muted,'center');
  const rows=[['1  PACK','Choose a food, then click or drag it into the box. R rotates it. Z undoes. Click a placed food to move or remove it.'],['2  PAIR','Touching friends sing. Rival neighbors grumble and silence their happy voice. Edges count; corners do not.'],['3  COMPOSE','A piece enters on its leftmost column: beats 1 to 5. Move it up or down to change its pitch. Spread happy voices across the required number of beats.']];
  rows.forEach(([title,body],i)=>{const y=386+i*132;rect(365,y-25,830,116,16,i%2?'#f1e7cf':'#f8edd5');text(title,390,y+7,19,palette.coral,'left',800);wrap(body,590,y-2,570,20,palette.ink,27);});
  text('Match the set list, then SERVE THE SONG. Your six songs become the train\'s final concert.',780,810,17,palette.green,'center',700);
  text('Sound is optional. Mouths, syllables and beat lights show the whole score.',780,844,18,palette.muted,'center');
  button('LET\'S JAM  →',580,878,400,38,toggleHelp,'coral');
}
function render(){
  const status=evaluate();canvas.setAttribute('aria-label',`Bento Rhapsody. ${state.help?'guide':state.paused?'paused':state.screen}. Order ${state.level+1} of 6. ${status.area} spaces, ${status.bonds} happy duets, ${status.conflicts} rivals, ${status.rhythm} of ${recipes[state.level].beats} singing beats. ${status.ready?'Ready to serve.':''} ${state.sound?'Sound on.':'Sound off.'}`);
  buttons=[];background();if(state.screen==='title')titleScreen();else if(state.screen==='encore')encoreScreen();else{gameplay();if(['served','missed','gameover'].includes(state.screen))resultOverlay();}
  for(const p of particles){const age=(performance.now()-p.born)/1000;if(age>.8)continue;ctx.globalAlpha=1-age/.8;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();}ctx.globalAlpha=1;
  if(toast){rect(440,184,680,48,14,toast.good?'#dce9d5':'#f4d0bb');text(toast.text,780,208,18,palette.ink,'center',700);}
  if(state.paused){buttons=[];ctx.fillStyle='#233d40ee';ctx.fillRect(0,173,W,827);rect(500,370,560,260,25,palette.paper);text('A little intermission.',780,433,34,palette.ink,'center',800);button('BACK TO THE JAM',620,500,320,58,()=>setPause(false),'coral');}
  if(state.help)guideOverlay();
}
function pos(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',event=>{
  if(event.button===2)return;
  const downPosition=pos(event);pointer={...downPosition,down:true,startX:downPosition.x,startY:downPosition.y};canvas.focus();choir.unlock();canvas.setPointerCapture?.(event.pointerId);
  for(const b of [...buttons].reverse()){if(b.enabled&&pointer.x>=b.x&&pointer.x<=b.x+b.w&&pointer.y>=b.y&&pointer.y<=b.y+b.h){b.action();render();return;}}
  if(state.screen!=='play'||state.paused||state.help)return;
  for(let i=0;i<foods.length;i++){if(pointer.x>=62+i*248&&pointer.x<297+i*248&&pointer.y>=858&&pointer.y<=952){const f=foods[i];if(state.stock[f.id]>0){state.active={type:f.id};state.rotation=0;choir.sing(f.id,choir.pitch(f.id,2),{volume:.23});}render();return;}}
  const x=Math.floor((pointer.x-board.x)/board.cell),y=Math.floor((pointer.y-board.y)/board.cell);
  if(x>=0&&x<5&&y>=0&&y<5){const p=evaluate().grid[y][x];if(state.active){place(x,y);}else if(p){state.active={type:p.type,id:p.id};state.rotation=p.rot;tone(380);}}
  render();
});
function place(x,y){const a=state.active;if(!a||!valid(a.type,x,y,state.rotation,a.id)){notify('That little singer needs more room.',false);return;}
  remember();if(a.id){const p=state.pieces.find(p=>p.id===a.id);Object.assign(p,{x,y,rot:state.rotation});}else{state.pieces.push({id:state.nextId++,type:a.type,x,y,rot:state.rotation});state.stock[a.type]--;}
  state.active=null;const e=evaluate();burst(board.x+(x+.5)*board.cell,board.y+(y+.5)*board.cell,e.conflicts?'#d5777f':'#82ad83',9);tone(e.conflicts?220:620,.12);
  render();
}
canvas.addEventListener('pointermove',event=>{Object.assign(pointer,pos(event));});
canvas.addEventListener('pointerup',event=>{const p=pos(event);const moved=Math.hypot(p.x-pointer.startX,p.y-pointer.startY)>8;if(state.screen==='play'&&!state.paused&&!state.help&&state.active&&pointer.down&&moved){const x=Math.floor((p.x-board.x)/board.cell),y=Math.floor((p.y-board.y)/board.cell);if(x>=0&&x<5&&y>=0&&y<5)place(x,y);}pointer.down=false;});
canvas.addEventListener('pointercancel',()=>{pointer.down=false;});
canvas.addEventListener('contextmenu',event=>{event.preventDefault();if(state.active&&!state.help&&!state.paused)state.rotation=(state.rotation+1)%4;});
window.addEventListener('keydown',event=>{
  if(['r','R','z','Z','h','H','Escape','Enter',' '].includes(event.key))event.preventDefault();
  if(event.repeat)return;choir.unlock();
  if(event.key.toLowerCase()==='h'){toggleHelp();render();return;}
  if(event.key==='Escape'){if(state.help)toggleHelp();else if(state.screen==='play')setPause(!state.paused);render();return;}
  if(state.help)return;
  if(event.key==='Enter'&&state.screen==='title'){startGame();render();return;}
  if(state.screen!=='play'||state.paused)return;
  if(event.key.toLowerCase()==='r'&&state.active){state.rotation=(state.rotation+1)%4;tone(420);}
  if(event.key.toLowerCase()==='z')undo();if(event.key==='Enter')deliver();
  render();
});
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
  if(state.screen==='play'&&!state.paused&&!state.help){state.timer-=dt;if(state.timer<=0){state.timer=0;timeout();}}
  particles.forEach(p=>{p.life-=dt*1.3;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;});particles=particles.filter(p=>p.life>0);if(toast){toast.life-=dt;if(toast.life<0)toast=null;}
  render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

