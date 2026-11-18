'use strict';
// The packed arrangement becomes an eight-note call-and-response performance.
let concert=null;
const stageKeys=['a','s','d'];
const voiceLane=type=>['rice','salmon'].includes(type)?0:['egg','broccoli'].includes(type)?1:2;
function performOrServe(){
  if(state.screen!=='play'||state.paused||state.help||!evaluate().ready)return;
  if(concert?.done){deliver();return;}
  const singers=currentArrangement().filter(p=>p.singing).sort((a,b)=>a.x-b.x||a.y-b.y);
  if(!singers.length)return;
  const beat=60/choir.bpm;
  concert={active:true,done:false,time:0,beat,notes:Array.from({length:8},(_,i)=>{const p=singers[i%singers.length];return {at:beat*(3+i),lane:voiceLane(p.type),type:p.type,row:p.y,hit:false,miss:false};}),hits:0,perfect:0,combo:0,bestCombo:0,feedback:'Listen to the count-in. Then answer!',flash:0};
  state.active=null;state.solo=null;resetMusic();
}
function concertHit(key){
  if(!concert?.active||state.paused||state.help)return;
  const lane=stageKeys.indexOf(key.toLowerCase());if(lane<0)return;
  const window=state.rush?.18:.25;
  const note=concert.notes.filter(n=>!n.hit&&!n.miss&&n.lane===lane).sort((a,b)=>Math.abs(a.at-concert.time)-Math.abs(b.at-concert.time))[0];
  concert.flash=.22;
  if(note&&Math.abs(note.at-concert.time)<=window){
    const perfect=Math.abs(note.at-concert.time)<=.11;note.hit=true;concert.hits++;concert.perfect+=Number(perfect);concert.combo++;concert.bestCombo=Math.max(concert.bestCombo,concert.combo);concert.feedback=perfect?'PERFECT!':'IN THE GROOVE';
    state.solo={type:note.type,life:.45};choir.sing(note.type,choir.pitch(note.type,note.row),{duration:.28,volume:.19});burst(530,440+lane*104,byFood[note.type].color,12);
  }else{concert.combo=0;concert.feedback='Listen, then answer on the ring.';choir.sfx('rotate');}
}
function updateConcert(dt){
  if(!concert?.active||state.paused||state.help)return;
  concert.time+=dt;concert.flash=Math.max(0,concert.flash-dt);
  for(const n of concert.notes)if(!n.called&&concert.time>=n.at-concert.beat){n.called=true;choir.sing(n.type,choir.pitch(n.type,n.row),{duration:.18,volume:.09});}
  for(const n of concert.notes)if(!n.hit&&!n.miss&&concert.time>n.at+.25){n.miss=true;concert.combo=0;concert.feedback='Keep going. The next note is yours.';}
  if(concert.time>concert.notes.at(-1).at+.6){
    concert.active=false;concert.done=true;concert.bonus=concert.hits*100+concert.perfect*75+concert.bestCombo*25;
    concert.medal=concert.hits===8?'STANDING OVATION':concert.hits>=5?'IN THE GROOVE':'FIRST REHEARSAL';
    notify(`${concert.medal} · ${concert.hits}/8 notes · +${concert.bonus} performance bonus`);
  }
}
function drawConcert(){
  if(!concert?.active)return;
  buttons=[];ctx.fillStyle='#09272eea';ctx.fillRect(20,240,1520,738);rect(268,270,1024,662,22,'#103d43','#c9aa68');
  text('PACK IT. HEAR IT. PLAY IT.',780,309,14,'#e6c37d','center',800);headline('Conduct your edible chorus',780,357,51,'#fff0cb','center');
  text('Your food placement wrote these notes. Answer as each note reaches the ring.',780,397,17,'#cbd8c2','center');
  const names=['BASS & BRASS','PIANO & BRUSHES','GUITAR & VIBES'];
  for(let lane=0;lane<3;lane++){
    const y=468+lane*104;rect(310,y-37,940,78,12,lane%2?'#20525a':'#17464e');
    text(stageKeys[lane].toUpperCase(),352,y,30,'#ffe7a5','center',800);text(names[lane],408,y-23,11,'#c0d0bf','left',700);
    ctx.strokeStyle='#96b5a15c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(450,y);ctx.lineTo(1220,y);ctx.stroke();
    ctx.strokeStyle=concert.flash?'#fff0a7':'#edc37b';ctx.lineWidth=4;ctx.beginPath();ctx.arc(530,y,29,0,Math.PI*2);ctx.stroke();
    button(stageKeys[lane].toUpperCase()+' · TAP',310,y+17,104,24,()=>concertHit(stageKeys[lane]),'light');
    ctx.save();ctx.beginPath();ctx.rect(451,y-35,770,70);ctx.clip();
    for(const n of concert.notes){if(n.lane!==lane||n.hit)continue;const x=530+(n.at-concert.time)*230;if(x<460||x>1220)continue;ingredient(n.type,x,y,53,n.miss?-1:1,n.row,true,.45);text('♪',x,y-28,15,'#f8d58d','center');}
    ctx.restore();
  }
  const count=concert.time<concert.beat*3?`${Math.max(1,Math.ceil(3-concert.time/concert.beat))} · COUNT IN`:concert.feedback;
  text(count,780,789,23,'#ffe4a1','center',800);text(`${concert.hits} / 8 NOTES     ·     COMBO ×${concert.combo}     ·     ${choir.bpm} BPM`,780,827,17,'#d3dfc9','center',700);
  button('SERVE WITHOUT THE BONUS',544,864,472,38,()=>{concert=null;deliver();},'light');
}
function drawPerformanceCard(){
  if(state.mode==='jam')return;
  const x=350;rect(x,380,106,475,10,'#143d43');text('LIVE',x+53,405,13,'#e9c77e','center',800);text('SCORE',x+53,425,11,'#c8d5c3','center',700);
  const e=evaluate();
  for(let lane=0;lane<3;lane++){
    const y=477+lane*107;const members=state.pieces.filter(p=>voiceLane(p.type)===lane&&e.singers.has(p.id));
    rect(x+12,y-18,82,57,8,members.length?'#4c7869':'#294c51');text(stageKeys[lane].toUpperCase(),x+53,y,21,members.length?'#ffe2a1':'#91a7a0','center',800);
    text(members.length?'♪ READY':'REST',x+53,y+51,10,'#ccd6bd','center',700);
  }
  text(concert?.done?`${concert.hits}/8`:'8 NOTES',x+53,797,16,'#ffe1a1','center',800);text(concert?.done?'RECORDED':'TO PLAY',x+53,823,10,'#c9d6bc','center',700);
}

function retryConcert(){if(state.screen!=='play'||state.mode==='jam'||state.paused||state.help)return;concert=null;performOrServe();}
