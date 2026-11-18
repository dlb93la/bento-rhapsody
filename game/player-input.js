'use strict';
// Mouse dragging, keyboard controls, placement feedback and accessible input shortcuts.
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
