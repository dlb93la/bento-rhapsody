'use strict';
// Grid geometry, friend/rival harmony, recipe goals, undo, campaign progression and scoring.
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
