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
function beatStrip(x,y,width,beatSet,height=23){
  const gap=7,w=(width-gap*4)/5;
  for(let i=0;i<5;i++){const live=i===music.beat,filled=beatSet.has(i);rect(x+i*(w+gap),y,w,height,8,live?'#e8b955':filled?'#5b8c76':'#e5d7ba');text(`${i+1}${filled?' ♪':''}`,x+i*(w+gap)+w/2,y+height/2,14,filled&&!live?'#fff8e7':palette.ink,'center',800);}
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
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
  if(state.screen==='play'&&!concert?.active&&state.mode==='story'&&state.rush&&!state.paused&&!state.help){state.timer-=dt;if(state.timer<=0){state.timer=0;timeout();}}
  particles.forEach(p=>{p.life-=dt*1.3;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;});particles=particles.filter(p=>p.life>0);if(toast){toast.life-=dt;if(toast.life<0)toast=null;}
  render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

