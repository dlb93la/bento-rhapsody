'use strict';
// Six short situations, rather than six copies of the same empty-box checklist.
const rehearsals = [
  {tag:'FIND YOUR FIRST DUET',tip:'Rice is waiting for Salmon. Touch their edges, then listen.',menu:['rice','salmon'],seed:[],blocked:[],spots:[[2,0]],spotGoal:1},
  {tag:'RESCUE THE REHEARSAL',tip:'These two arrived at opposite ends. Bring them together, then grow the groove.',menu:['egg','broccoli'],seed:[['egg',0,0,0],['broccoli',3,1,0]],blocked:[],spots:[[1,1],[3,2]],spotGoal:1},
  {tag:'A VERY AWKWARD AUDITION',tip:'Rice and Tofu are arguing. Move them apart and find a friend for each.',menu:['rice','salmon','tofu','ume'],seed:[['tofu',0,0,0],['rice',2,0,0],['ume',0,3,0]],blocked:[],spots:[[0,4],[4,1]],spotGoal:1},
  {tag:'MIND THE TEA',tip:'Akiko brought a thermos. Build the chorus around the two reserved seats.',menu:['rice','salmon','egg','broccoli'],seed:[],blocked:[[2,2],[2,3]],spots:[[0,3],[4,0]],spotGoal:1},
  {tag:'EVERYONE GETS AN AUDITION',tip:'Six personalities, one box. Can you get every voice singing?',menu:['rice','salmon','egg','broccoli','tofu','ume'],seed:[['ume',4,4,0]],blocked:[],spots:[[3,0],[1,3]],spotGoal:2},
  {tag:'ONE LAST ENCORE',tip:'Your last arrangement is already here. Fill the last seats and send the band home.',menu:['rice','salmon','egg','broccoli','tofu','ume'],seed:[],blocked:[],spots:[[4,2],[0,4]],spotGoal:2},
];
function rehearsal(){return state.mode==='jam'?{tag:'YOUR BOX. YOUR RULES.',tip:'Try a new neighbor, change the tempo, or press Space to give one player a solo.',menu:foods.map(f=>f.id),blocked:[],spots:[[1,1],[3,3]],spotGoal:2}:rehearsals[state.level];}
function seedPiece(type,x,y,rot=0){
  if(!valid(type,x,y,rot)||state.stock[type]<=0)return false;
  state.pieces.push({id:state.nextId++,type,x,y,rot});state.stock[type]--;return true;
}
function startJam(){
  state.mode='jam';state.level=0;startLevel();
  let saved;try{saved=JSON.parse(localStorage.getItem('bento-rhapsody-jam-v1'));}catch{}
  if(Array.isArray(saved))for(const p of saved.slice(0,18)){if(p&&byFood[p.type]&&[p.x,p.y,p.rot].every(Number.isInteger)&&p.rot>=0&&p.rot<4)seedPiece(p.type,p.x,p.y,p.rot);}
  if(!state.pieces.length){seedPiece('rice',0,0);seedPiece('salmon',2,0);}
  state.history=[];state.reaction={text:'A little room to make a little noise.',good:true,life:3};
}
function saveJam(){if(state.mode==='jam')try{localStorage.setItem('bento-rhapsody-jam-v1',JSON.stringify(state.pieces.map(({type,x,y,rot})=>({type,x,y,rot}))));}catch{}}
function changeTempo(){const tempos=[76,96,120];state.tempo=tempos[(tempos.indexOf(state.tempo)+1)%3];choir.setTempo(state.tempo);}
function clearJam(){if(state.mode!=='jam')return;remember();state.pieces=[];state.active=null;state.stock=Object.fromEntries(foods.map(f=>[f.id,3]));saveJam();}
function spotlight(){
  if(state.screen!=='play'||state.paused||state.help)return;
  const type=state.active?.type||state.pieces.at(-1)?.type;
  if(!type)return;
  if(!state.pieces.some(p=>p.type===type)){notify(`Give ${byFood[type].nick} a place in the box first.`,false);return;}
  state.solo={type,life:5};state.reaction={text:`${byFood[type].nick} takes the solo!`,good:true,life:2.5};
  choir.sing(type,choir.pitch(type,2),{duration:.36,volume:.14});
}
function rating(e=evaluate()){
  const allHappy=e.pieceCount>1&&Object.keys(e.counts).every(type=>[...e.pairs.values()].some(p=>p.relation===1&&((p.a.type===type&&e.singers.has(p.a.id))||(p.b.type===type&&e.singers.has(p.b.id)))));
  const lit=rehearsal().spots.filter(([x,y])=>e.grid[y]?.[x]&&e.singers.has(e.grid[y][x].id)).length;
  const spotGoal=rehearsal().spotGoal;
  return {allHappy,lit,spotGoal,stars:1+Number(allHappy)+Number(lit>=spotGoal)};
}
function reactToMove(before,after){
  const litBefore=rehearsal().spots.filter(([x,y])=>before.grid[y]?.[x]&&before.singers.has(before.grid[y][x].id)).length;
  const litAfter=rating(after).lit;
  if(after.conflicts>before.conflicts)state.reaction={text:'Wrong neighbor! Those two need their own space.',good:false,life:3};
  else if(after.bonds>before.bonds){const pairs=[...after.pairs.values()].filter(p=>p.relation===1);const pair=pairs.find(p=>!before.pairs.has([p.a.id,p.b.id].sort((a,b)=>a-b).join('-')));state.reaction={text:pair?`${byFood[pair.a.type].nick} + ${byFood[pair.b.type].nick}: a new duet!`:'The chorus just got bigger!',good:true,life:3};}
  else if(before.conflicts>after.conflicts)state.reaction={text:'Peace at last. Now find their friends.',good:true,life:3};
  else if(litAfter>litBefore)state.reaction={text:'A happy voice found the golden stage!',good:true,life:3};
  else if(after.ready&&!before.ready)state.reaction={text:'That is a song worth serving.',good:true,life:3};
}
