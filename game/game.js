'use strict';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1560, H = 1000;
const board = { x: 475, y: 365, cell: 99, n: 5 };
const palette = { ink: '#193f40', muted: '#6c7266', paper: '#fffaf0', coral: '#ac4b36', green: '#577655', gold: '#e6bb72' };
const rack = {x:56,y:339,w:242,h:76,gap:9};
const stationScene=typeof Image!=='undefined'?new Image():null;
if(stationScene)stationScene.src='assets/midnight-station.png';
document.fonts?.load('16px "DM Sans"');document.fonts?.load('40px "Instrument Serif"');
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
const music = { beat: -1, step: 0, bar: 0, track:0, chord:'Dm9', phase: 0, pulses: {}, customer: 0, encore: 0, meter: 0, lastTick: performance.now() };
let state = { screen: 'title', mode:'story',rush:false,tempo:96,solo:null,reaction:null, level: 0, pieces: [], stock: {}, active: null, rotation: 0, score: 0, lives: 3, combo: 0, timer: 180, paused: false, help: false, sound: true, history: [], results: [], nextId: 1 };
let pointer = {x:-100,y:-100,down:false}, buttons = [], elapsed = 0, particles = [], toast = null;
let best = 0;
try { best = Number(localStorage.getItem('bento-rhapsody-best') || 0); } catch {}
function rect(x,y,w,h,r=16,fill=palette.paper,stroke=null) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
function text(s,x,y,size=20,color=palette.ink,align='left',weight=500) {
  ctx.font=`${weight} ${size}px "DM Sans", "Segoe UI", sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);
}
function headline(s,x,y,size=42,color=palette.ink,align='left',italic=false){ctx.font=`${italic?'italic ':''}400 ${size}px "Instrument Serif",Georgia,serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);}
function wrap(s,x,y,width,size=19,color=palette.ink,line=27) {
  let row=''; for(const word of s.split(' ')){const trial=row+word+' ';ctx.font=`500 ${size}px "DM Sans",sans-serif`;if(ctx.measureText(trial).width>width&&row){text(row,x,y,size,color);y+=line;row=word+' ';}else row=trial;}text(row,x,y,size,color);return y+line;
}
function button(label,x,y,w,h,action,style='dark',enabled=true) {
  const hover=pointer.x>=x&&pointer.x<=x+w&&pointer.y>=y&&pointer.y<=y+h;
  const fill=!enabled?'#d8d7c9':style==='light'?'#fff7e5':style==='coral'?(hover?'#ed8270':palette.coral):(hover?'#3b6263':palette.ink);
  rect(x,y+4,w,h,12,'#d6c5a4');rect(x,y,w,h,12,fill,style==='light'?'#ddd2b8':null);
  text(label,x+w/2,y+h/2,18,style==='light'?palette.ink:enabled?'#fff9e9':'#8d9488','center',700);
  buttons.push({x,y,w,h,action,enabled});
}
function tone(freq=440,length=.1,type='sine',volume=.035) {
  if(state.sound)choir.sfx(freq<250?'error':freq<430?'rotate':'pick');
}
function resetMusic(){choir.reset();music.beat=-1;music.bar=0;music.track=0;music.pulses={};music.customer=0;}
function currentArrangement(){const e=evaluate();return state.pieces.map(p=>({...p,singing:e.singers.has(p.id),grumpy:e.grumpy.has(p.id),solo:state.solo?.type===p.type,spotlit:rehearsal().spots.some(([x,y])=>occupied(p).some(([a,b])=>a===x&&b===y))}));}
function musicStep(plan){
  if(!plan){const pieces=state.screen==='encore'?state.results[0]?.pattern||[]:currentArrangement();plan=choir.score(pieces,0,0,state.screen==='encore');}
  music.beat=plan.beat;music.step=plan.step;music.bar=plan.bar;music.track=plan.track;music.chord=plan.chord;
  for(const p of plan.pulses)music.pulses[p.id]={life:1,type:p.type,grumpy:p.grumpy};
  if(plan.pulses.length&&state.screen!=='play')music.customer=1;
}
choir.onStep(musicStep);
function updateMusic(dt){
  updateConcert(dt);
  if(!state.paused&&!state.help){if(state.solo){state.solo.life-=dt;if(state.solo.life<=0)state.solo=null;}if(state.reaction){state.reaction.life-=dt;if(state.reaction.life<=0)state.reaction=null;}}
  for(const [id,p]of Object.entries(music.pulses)){p.life-=dt*3;if(p.life<=0)delete music.pulses[id];}
  music.customer=Math.max(0,music.customer-dt*3);
  music.meter=choir.level();
  const playing=!state.paused&&!state.help&&['play','served','encore'].includes(state.screen);
  choir.setPlaying(playing);if(!playing)return;
  if(state.screen==='encore')music.encore+=dt;
  const pattern=state.screen==='play'?currentArrangement():state.results.at(-1)?.pattern||[];
  choir.setArrangement(pattern,{concert:state.screen==='encore',songs:state.results.map(r=>r.pattern)});
  choir.tick(dt);
}
// Keep the choir in time even when rendering a frame takes longer than a beat.
window.setInterval?.(()=>{const now=performance.now();const dt=Math.min(.2,(now-music.lastTick)/1000);music.lastTick=now;updateMusic(dt);},25);
function toggleSound(){state.sound=!state.sound;choir.setEnabled(state.sound);}
function setPause(value){state.paused=value;state.active=null;if(value)choir.hush();}
function toggleHelp(){state.help=!state.help;state.active=null;choir.hush();}
function cells(shape,rotation=0){let a=shape.map(p=>p.slice());for(let r=0;r<rotation%4;r++)a=a.map(([x,y])=>[-y,x]);const minX=Math.min(...a.map(p=>p[0])),minY=Math.min(...a.map(p=>p[1]));return a.map(([x,y])=>[x-minX,y-minY]);}
function occupied(p){return cells(byFood[p.type].shape,p.rot).map(([x,y])=>[p.x+x,p.y+y]);}
function valid(type,x,y,rot,exclude=null){const taken=new Set([...state.pieces.filter(p=>p.id!==exclude).flatMap(occupied),...rehearsal().blocked].map(p=>p.join(',')));return cells(byFood[type].shape,rot).every(([a,b])=>x+a>=0&&x+a<5&&y+b>=0&&y+b<5&&!taken.has(`${x+a},${y+b}`));}
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
  const legal=pieces.every(p=>occupied(p).every(([x,y])=>!rehearsal().blocked.some(([a,b])=>a===x&&b===y)));
  return {grid,counts,moods,pairs,bonds,conflicts,area,pieceCount:pieces.length,grumpy,singers,beatSet,rhythm:beatSet.size,ready:legal&&needs&&area>=recipe.cells&&bonds>=recipe.bonds&&conflicts<=recipe.conflicts&&beatSet.size>=recipe.beats};
}
function burst(x,y,color,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:Math.cos(i/n*Math.PI*2)*70,vy:Math.sin(i/n*Math.PI*2)*70-35,life:1,color,born:performance.now()});}
function notify(msg,good=true){toast={text:msg,life:3,good};tone(good?660:170,.14);}
function remember(){if(concert?.done)concert=null;state.history.push(JSON.stringify({pieces:state.pieces,stock:state.stock}));if(state.history.length>35)state.history.shift();}
function undo(){const prev=state.history.pop();if(prev){concert=null;Object.assign(state,JSON.parse(prev));state.active=null;saveJam();tone(330);}}
function startLevel(){concert=null;const carried=state.mode==='story'&&state.level===5?state.pieces.map(p=>({...p})):[];state.pieces=[];state.stock=Object.fromEntries(foods.map(f=>[f.id,rehearsal().menu.includes(f.id)?3:0]));state.active=null;state.rotation=0;state.history=[];state.solo=null;state.reaction=null;state.timer=recipes[state.level].time;state.screen='play';state.paused=false;state.help=false;resetMusic();if(state.mode==='story'){if(carried.length)for(const p of carried)seedPiece(p.type,p.x,p.y,p.rot);else for(const [type,x,y,rot]of rehearsals[state.level].seed)seedPiece(type,x,y,rot);}}
function startGame(){state.mode='story';state.tempo=96;choir.setTempo(96);state.level=0;state.score=0;state.lives=3;state.combo=0;state.results=[];state.nextId=1;startLevel();}
function deliver(){
  if(state.screen!=='play'||state.paused||state.help||state.mode==='jam')return;
  const e=evaluate();if(!e.ready){notify('Check the order, the rival voices and the singing beats.',false);return;}
  const grade=rating(e),earned=(concert?.done?concert.bonus:0)+500+e.area*20+e.bonds*110+e.rhythm*100+(state.rush?Math.floor(state.timer)*2:0)+state.combo*100+(grade.stars-1)*250;
  const pattern=currentArrangement().map(p=>({...p,grumpy:false,solo:false}));
  state.score+=earned;state.combo++;state.results.push({name:recipes[state.level].name,earned,performance:concert?.done?{hits:concert.hits,perfect:concert.perfect,bonus:concert.bonus,medal:concert.medal}:null,stars:grade.stars,bonds:e.bonds,area:e.area,rhythm:e.rhythm,pattern});state.active=null;state.screen=state.level===5?'encore':'served';music.encore=0;resetMusic();choir.sfx('serve');burst(770,470,'#edb14b',35);
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
function beatStrip(x,y,width,beatSet,height=23){
  const gap=7,w=(width-gap*4)/5;
  for(let i=0;i<5;i++){const live=i===music.beat,filled=beatSet.has(i);rect(x+i*(w+gap),y,w,height,8,live?'#e8b955':filled?'#5b8c76':'#e5d7ba');text(`${i+1}${filled?' ♪':''}`,x+i*(w+gap)+w/2,y+height/2,14,filled&&!live?'#fff8e7':palette.ink,'center',800);}
}
function resultOverlay(){
  buttons=[];
  ctx.fillStyle='#203c3cef';ctx.fillRect(0,173,W,H-173);const success=state.screen==='served',r=recipes[state.level];
  rect(405,227,750,625,27,palette.paper);headline(success?'A first bite. A new voice.':'Even great bands miss a train.',780,281,39,palette.ink,'center');
  if(success){
    foods.forEach((f,i)=>{const pulse=Math.max(0,...Object.values(music.pulses).filter(p=>p.type===f.id).map(p=>p.life));ingredient(f.id,555+i*90,375,75,1,i,true,pulse);});
    text('♪',605,475,42,palette.coral,'center');ctx.save();ctx.translate(780,462);ctx.scale(.56,.56);customer(0,0,r.mood);ctx.restore();text('♫',950,475,42,palette.green,'center');
    text(`${r.customer} joins your chorus.`,780,546,20,palette.green,'center',800);wrap(`“${r.memory}”`,486,589,600,21,palette.ink,26);
    const last=state.results.at(-1);if(last.performance)text(`${last.performance.medal} · ${last.performance.hits}/8 notes · ${last.performance.perfect} perfect`,780,682,13,palette.green,'center',700);text(`${'★'.repeat(last.stars||1)}${'☆'.repeat(3-(last.stars||1))}   +${last.earned.toLocaleString('en-US')} points`,780,653,21,'#987037','center',700);
    button('NEXT LISTENER  →',550,702,460,57,()=>{state.level++;startLevel();},'coral');
  }else{ingredient('rice',780,405,145,-1,0);text(state.lives>0?'Departure came before the chorus was ready.':'Three missed orders. The kitchen needs a rest.',780,543,21,palette.muted,'center');text(`Your set: ${state.score.toLocaleString('en-US')} points`,780,600,28,palette.ink,'center',800);button(state.lives>0?'TRY THIS TRACK AGAIN':'START A NEW SET',550,702,460,57,()=>state.lives>0?startLevel():startGame(),'coral');}
  button('Back to the title',630,787,300,38,()=>{state.screen='title';choir.hush();},'light');
}
function encoreScreen(){
  header();text('YOU DIDN\'T JUST PACK LUNCH. YOU PACKED A BAND.',780,222,17,palette.coral,'center',800);
  headline('The Midnight Bites',780,291,99,palette.ink,'center');
  text('Live from the last train / six lunchboxes, one bento rhapsody',780,344,22,palette.muted,'center');
  const active=music.track,travel=music.encore%45,offset=travel>37?-((travel-37)**2)*30:0;
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
  text(`TOUR COMPLETE · ${state.score.toLocaleString('en-US')} POINTS · ${state.results.reduce((n,r)=>n+(r.performance?.hits||0),0)} / 48 LIVE NOTES`,780,779,23,palette.ink,'center',700);
  beatStrip(553,822,454,new Set([0,1,2,3,4]),29);
  button('PLAY ANOTHER SET',396,890,355,57,startGame,'coral');button('REPLAY THE ENCORE',782,890,355,57,()=>{music.encore=0;resetMusic();},'light');
  text(`6 / 6 songs delivered  ·  ${state.results.reduce((n,r)=>n+(r.stars||1),0)} / 18 encore tickets  ·  Your own arrangements are playing`,780,980,16,palette.muted,'center');
}
function guideOverlay(){
  buttons=[];ctx.fillStyle='#203c3cf2';ctx.fillRect(0,173,W,827);rect(320,210,920,725,28,palette.paper);
  headline('How to conduct your lunch',780,269,48,palette.ink,'center');text('A puzzle you can hear. A song you can rearrange.',780,317,21,palette.muted,'center');
  const rows=[['1  PACK','Choose from the left. Click or drag into the box. R rotates, Z undoes, Delete removes. Cozy has no clock; Rush does. Free Jam saves your own song.'],['2  PAIR','Edges count, corners do not. Friends unlock singing; rivals grumble. Clear the set list to serve. Get every food type singing for a bonus ticket.'],['3  PLAY','Happy players on golden stages earn another ticket. Move up or down for new notes. Press Space to take a solo. Free Jam also lets you change the tempo.']];
  rows.forEach(([title,body],i)=>{const y=386+i*132;rect(365,y-25,830,116,16,i%2?'#f1e7cf':'#f8edd5');text(title,390,y+7,19,palette.coral,'left',800);wrap(body,590,y-2,570,20,palette.ink,27);});
  text('Match the set list, then PLAY THE CHORUS with A/S/D. Your six songs become the train\'s final concert.',780,810,17,palette.green,'center',700);
  text('Sound is optional. Mouths, syllables and beat lights show the whole score.',780,844,18,palette.muted,'center');
  button('LET\'S JAM  →',580,878,400,38,toggleHelp,'coral');
}
function render(){
  const status=evaluate();canvas.setAttribute('aria-label',`Bento Rhapsody. ${state.mode}. ${state.help?'guide':state.paused?'paused':state.screen}. Order ${state.level+1} of 6. ${status.area} spaces, ${status.bonds} happy duets, ${status.conflicts} rivals, ${status.rhythm} of ${recipes[state.level].beats} singing beats. ${status.ready?'Ready to serve.':''} ${concert?.active?'Live performance: A/S/D, '+concert.hits+' of 8 notes.':concert?.done?'Performance complete: '+concert.hits+' of 8 notes.':''} ${state.sound?'Sound on.':'Sound off.'}`);
  buttons=[];background();if(state.screen==='title')titleScreen();else if(state.screen==='encore')encoreScreen();else{gameplay();if(['served','missed','gameover'].includes(state.screen))resultOverlay();}
  for(const p of particles){const age=(performance.now()-p.born)/1000;if(age>.8)continue;ctx.globalAlpha=1-age/.8;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();}ctx.globalAlpha=1;
  if(toast){rect(440,184,680,48,14,toast.good?'#dce9d5':'#f4d0bb');text(toast.text,780,208,18,palette.ink,'center',700);}
  if(state.paused){buttons=[];ctx.fillStyle='#233d40ee';ctx.fillRect(0,173,W,827);rect(500,370,560,260,25,palette.paper);text('A little intermission.',780,433,34,palette.ink,'center',800);button('BACK TO THE JAM',620,500,320,58,()=>setPause(false),'coral');}
  if(state.help)guideOverlay();
  if(concert?.active&&!state.paused&&!state.help)drawConcert();
}
function pos(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',event=>{
  if(event.button===2)return;
  const downPosition=pos(event);pointer={...downPosition,down:true,startX:downPosition.x,startY:downPosition.y};canvas.focus();choir.unlock();canvas.setPointerCapture?.(event.pointerId);
  for(const b of [...buttons].reverse()){if(b.enabled&&pointer.x>=b.x&&pointer.x<=b.x+b.w&&pointer.y>=b.y&&pointer.y<=b.y+b.h){b.action();render();return;}}
  if(state.screen!=='play'||state.paused||state.help||concert?.active)return;
  for(let i=0;i<foods.length;i++){const y=rack.y+i*(rack.h+rack.gap);if(pointer.x>=rack.x&&pointer.x<rack.x+rack.w&&pointer.y>=y&&pointer.y<=y+rack.h){const f=foods[i];if(state.stock[f.id]>0){state.active={type:f.id};state.rotation=0;choir.sing(f.id,choir.pitch(f.id,2),{volume:.16});}render();return;}}
  const x=Math.floor((pointer.x-board.x)/board.cell),y=Math.floor((pointer.y-board.y)/board.cell);
  if(x>=0&&x<5&&y>=0&&y<5){const p=evaluate().grid[y][x];if(state.active){place(x-(state.active.grabX||0),y-(state.active.grabY||0));}else if(p){state.active={type:p.type,id:p.id,grabX:x-p.x,grabY:y-p.y};state.rotation=p.rot;tone(380);}}
  render();
});
function place(x,y){const a=state.active;if(!a||!valid(a.type,x,y,state.rotation,a.id)){notify(rehearsal().blocked.some(([a,b])=>a===x&&b===y)?'That seat is reserved for tea.':'That little singer needs more room.',false);return;}
  const before=evaluate();
  remember();if(a.id){const p=state.pieces.find(p=>p.id===a.id);Object.assign(p,{x,y,rot:state.rotation});}else{state.pieces.push({id:state.nextId++,type:a.type,x,y,rot:state.rotation});state.stock[a.type]--;}
  state.active=null;const e=evaluate();reactToMove(before,e);saveJam();burst(board.x+(x+.5)*board.cell,board.y+(y+.5)*board.cell,e.conflicts?'#d5777f':'#82ad83',9);choir.sfx(e.conflicts?'error':'place');
  render();
}
canvas.addEventListener('pointermove',event=>{Object.assign(pointer,pos(event));});
canvas.addEventListener('pointerup',event=>{const p=pos(event);const moved=Math.hypot(p.x-pointer.startX,p.y-pointer.startY)>8;if(state.screen==='play'&&!concert?.active&&!state.paused&&!state.help&&state.active&&pointer.down&&moved){const x=Math.floor((p.x-board.x)/board.cell)-(state.active.grabX||0),y=Math.floor((p.y-board.y)/board.cell)-(state.active.grabY||0);if(x>=0&&x<5&&y>=0&&y<5)place(x,y);}pointer.down=false;});
canvas.addEventListener('pointercancel',()=>{pointer.down=false;});
canvas.addEventListener('contextmenu',event=>{event.preventDefault();if(state.active&&!state.help&&!state.paused)state.rotation=(state.rotation+1)%4;});
window.addEventListener('keydown',event=>{
  if(['r','R','z','Z','h','H','Escape','Enter','Delete','Backspace',' '].includes(event.key))event.preventDefault();
  if(event.repeat)return;choir.unlock();
  if(concert?.active){event.preventDefault();if(event.key==='Escape'){setPause(!state.paused);}else concertHit(event.key);render();return;}
  if(event.key.toLowerCase()==='h'){toggleHelp();render();return;}
  if(event.key==='Escape'){if(state.help)toggleHelp();else if(state.active)state.active=null;else if(state.screen==='play')setPause(!state.paused);render();return;}
  if(state.help)return;
  if(event.key==='Enter'&&state.screen==='title'){startGame();render();return;}
  if(state.screen!=='play'||state.paused)return;
  if(event.key===' '){spotlight();render();return;}
  if(event.key.toLowerCase()==='r'&&state.active){state.rotation=(state.rotation+1)%4;state.active.grabX=0;state.active.grabY=0;tone(420);}
  if(event.key.toLowerCase()==='z')undo();if(event.key==='Enter')performOrServe();if(event.key==='Delete'||event.key==='Backspace')removeSelected();
  render();
});
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
  if(state.screen==='play'&&!concert?.active&&state.mode==='story'&&state.rush&&!state.paused&&!state.help){state.timer-=dt;if(state.timer<=0){state.timer=0;timeout();}}
  particles.forEach(p=>{p.life-=dt*1.3;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;});particles=particles.filter(p=>p.life>0);if(toast){toast.life-=dt;if(toast.life<0)toast=null;}
  render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

