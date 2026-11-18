'use strict';
// Paper-theater presentation. Game coordinates stay independent of display size.
function ingredient(type,x,y,size,mood=0,seed=0,showFace=true,singing=0){window.BentoArt.food(ctx,type,x,y,size,mood,elapsed,singing,seed);}
function background(){
  ctx.fillStyle='#f5eddd';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#ab8e5719';ctx.lineWidth=.6;
  for(let i=-H;i<W;i+=8){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
}
function stationBackdrop(x,y,w,h){
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.clip();
  if(stationScene?.complete&&stationScene.naturalWidth){const nw=stationScene.naturalWidth,nh=stationScene.naturalHeight,sw=Math.min(nw,nh*w/h),sh=Math.min(nh,nw*h/w);ctx.drawImage(stationScene,(nw-sw)/2,(nh-sh)*(h<250?.62:.5),sw,sh,x,y,w,h);}
  else{ctx.fillStyle='#173d47';ctx.fillRect(x,y,w,h);}
  const shade=ctx.createLinearGradient(x,y,x+w,y);shade.addColorStop(0,'#071e2de8');shade.addColorStop(.55,'#0d2b3570');shade.addColorStop(1,'#14303511');ctx.fillStyle=shade;ctx.fillRect(x,y,w,h);ctx.restore();
}
function header(){
  ctx.fillStyle='#103239';ctx.fillRect(0,0,W,82);ctx.fillStyle='#c39a63';ctx.fillRect(0,81,W,2);
  text('♫',43,40,31,'#eac987','center');headline('Bento',70,41,43,'#fff1d5');headline('Rhapsody',166,41,43,'#edc783','left',true);
  text('THE EDIBLE JAZZ CLUB',440,43,13,'#b2c1b0','left',600);
  rect(981,19,173,44,7,'#0c2b32','#6c6d4e');text(`${state.score.toLocaleString('en-US')} pts`,1067,41,18,'#f8e0a7','center',700);
  text('♥'.repeat(state.lives)+'♡'.repeat(3-state.lives),1183,40,23,'#e3a18e');
  button(state.sound?'♫ SOUND':'♫ MUTED',1317,22,133,37,toggleSound,'light');button('?',1466,22,45,37,toggleHelp,'light');
}
function drawPiece(p,mood,alpha=1){
  const shape=cells(byFood[p.type].shape,p.rot),a=occupied(p),pulse=music.pulses[p.id]?.life||0;ctx.save();ctx.globalAlpha=alpha;
  window.BentoArt.piece(ctx,shape,p.type,board.x+p.x*board.cell,board.y+p.y*board.cell,board.cell,state.active?.id===p.id,pulse,mood<0);
  const taken=new Set(shape.map(p=>p.join(',')));let bestRect={x:0,y:0,w:1,h:1,score:0};
  for(const [x,y] of shape)for(let w=1;w<=3;w++)for(let h=1;h<=3;h++){
    if(!Array.from({length:w*h},(_,i)=>taken.has(`${x+i%w},${y+Math.floor(i/w)}`)).every(Boolean))continue;
    const score=w*h-Math.abs(w-h*(p.type==='broccoli'?.7:1.4))*.05;if(score>bestRect.score)bestRect={x,y,w,h,score};
  }
  const xx=board.x+(p.x+bestRect.x+bestRect.w/2)*board.cell,yy=board.y+(p.y+bestRect.y+bestRect.h/2)*board.cell;
  ingredient(p.type,xx,yy,p.type==='tofu'?149:p.type==='ume'?87:p.type==='broccoli'?103:118,mood,p.id,true,pulse);
  const labelCell=a.at(-1);if(p.type!=='ume')text(byFood[p.type].nick,board.x+(labelCell[0]+.5)*board.cell,board.y+(labelCell[1]+.88)*board.cell,11,'#3c3d30','center',700);
  if(mood!==0)text(mood>0?'♪':'!',board.x+(a[0][0]+.14)*board.cell,board.y+(a[0][1]+.19)*board.cell,18,mood>0?'#426b50':'#76465c','center',800);
  if(pulse){const labelY=board.y+(a[0][1]+.16)*board.cell;rect(xx-27,labelY-9,54,21,7,mood<0?'#775c7c':'#fff7d8');text(mood<0?'GRR':choir.voices[p.type].syllable,xx,labelY+2,11,mood<0?'#fff5e9':palette.ink,'center',800);}ctx.restore();
}
function drawPantry(){
  text('CHOOSE YOUR PLAYERS',58,282,12,'#895e42','left',800);headline('The little band',58,312,33);
  foods.forEach((f,i)=>{
    const x=rack.x,y=rack.y+i*(rack.h+rack.gap),selected=state.active?.type===f.id,packed=state.stock[f.id]<3;
    rect(x,y,rack.w,rack.h,8,selected?'#ecebd8':packed?'#f0f0df':'#f7efdf',selected?'#5e795c':'#e1d2b8');
    rect(x+5,y+6,60,62,6,window.BentoArt.colors[f.id][0]+'80');ingredient(f.id,x+35,y+37,61,selected?1:0,i);
    text(f.name,x+75,y+19,17,palette.ink,'left',750);text(choir.voices[f.id].role,x+75,y+41,12,palette.muted);text(`♥ ${byFood[f.friend].name}`,x+75,y+61,11,palette.green);
    text(`×${state.stock[f.id]}`,x+rack.w-10,y+22,13,palette.muted,'right',700);
  });
  wrap('Touch a friend: find your voice. Touch a rival: lose your harmony.',60,878,225,14,palette.muted,21);
  button('HOW TO JAM · H',58,928,238,32,toggleHelp,'light');
}
function liveArrangement(e){
  const x=347,y=924,w=751,active=new Set(state.pieces.map(p=>p.type));rect(x,y,w,47,8,'#e8eddb','#cbd3b5');
  text('♫',367,y+23,23,palette.green,'center');text('Live arrangement',390,y+16,14,palette.ink,'left',700);
  text(`${active.size} layers · ${e.singers.size} singing · ${choir.bpm} BPM · ${music.chord}`,390,y+34,11,palette.muted);
  for(let i=0;i<20;i++){const h=4+music.meter*17*(.4+.6*Math.abs(Math.sin(elapsed*4+i*2)));rect(x+w-155+i*6.4,y+24-h/2,3,h,2,active.size?'#729a79':'#bcc4ae');}
}
function gameplay(){
  const r=recipes[state.level],e=evaluate();header();
  stationBackdrop(40,101,1480,131);text(`TRACK 0${state.level+1} / 06 · LAST TRAIN AT 23:48`,66,127,12,'#f8d797','left',700);headline(r.name,64,183,64,'#fff2d7');
  text('PACK A LITTLE. PLAY A LITTLE.',1495,203,12,'#fae5b8','right',700);
  rect(40,251,271,727,12,palette.paper,'#dfcfb4');rect(331,251,794,727,12,palette.paper,'#dfcfb4');rect(1145,251,375,727,12,palette.paper,'#dfcfb4');
  drawPantry();text('YOUR COMPOSITION',353,281,12,'#895e42','left',800);headline('The band\'s lunchbox',353,313,39);text(`${e.area} / ${r.cells} packed`,1101,311,13,palette.muted,'right');
  beatStrip(board.x,328,495,e.beatSet,15);window.BentoArt.tray(ctx,board.x,board.y,board.cell);
  state.pieces.forEach(p=>drawPiece(p,e.moods[p.id]||0,state.active?.id===p.id?.7:1));
  if(!state.pieces.length){headline('Your first little song',722,577,35,'#e5d5ac','center');text('Choose a food and give it a place.',722,616,16,'#bbcab0','center');text('Friends bring out the voice.',722,646,14,'#a4b8a3','center');}
  if(music.beat>=0){ctx.fillStyle='#f0d29714';ctx.fillRect(board.x+music.beat*99,board.y,99,495);ctx.fillStyle='#e6bd70';ctx.fillRect(board.x+music.beat*99+7,board.y+491,85,2);}
  if(state.active&&pointer.x>board.x-12&&pointer.x<board.x+510&&pointer.y>board.y-12&&pointer.y<board.y+510){
    const x=Math.floor((pointer.x-board.x)/99),y=Math.floor((pointer.y-board.y)/99),shape=cells(byFood[state.active.type].shape,state.rotation),ok=valid(state.active.type,x,y,state.rotation,state.active.id);
    ctx.save();window.BentoArt.outline(ctx,shape,99,board.x+x*99,board.y+y*99);ctx.fillStyle=ok?'#f2d69d50':'#c96f6a75';ctx.fill();ctx.strokeStyle=ok?'#ffdf9b':'#f4a6a2';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.restore();
  }
  text(state.active?`${byFood[state.active.type].nick} · choose a place`:'Move a piece to change the arrangement.',353,904,13,palette.muted);
  button('↶ Z',928,888,52,28,undo,'light',state.history.length>0);button('R ↻',989,888,48,28,()=>{state.rotation=(state.rotation+1)%4;choir.sfx('rotate');},'light',!!state.active);button('×',1046,888,52,28,removeSelected,'light',!!state.active?.id);
  liveArrangement(e);
  text('TONIGHT\'S LISTENER',1168,282,12,'#895e42','left',800);headline(r.customer,1168,319,38);text(r.role,1168,349,13,palette.muted);
  ctx.save();ctx.translate(1451,322);ctx.scale(.45,.45);customer(0,0,r.mood);ctx.restore();
  wrap(r.line,1168,391,325,16,palette.ink,23);
  let y=491;text('THE SET LIST',1168,y-26,12,'#895e42','left',800);
  for(const [id,n]of Object.entries(r.needs)){const done=(e.counts[id]||0)>=n;ingredient(id,1183,y+3,31,done?1:0,2);text(byFood[id].name,1208,y,14);text(done?'✓':`0 / ${n}`,1495,y,15,done?palette.green:palette.muted,'right',700);y+=28;}
  y=Math.max(y+18,594);ctx.strokeStyle='#e2d7bf';ctx.beginPath();ctx.moveTo(1168,y-10);ctx.lineTo(1496,y-10);ctx.stroke();
  const rules=[['Packed spaces',`${e.area} / ${r.cells}`,e.area>=r.cells],['Happy duets',`${e.bonds} / ${r.bonds}`,e.bonds>=r.bonds],['Singing entries',`${e.rhythm} / ${r.beats}`,e.rhythm>=r.beats],['Rival neighbors',`${e.conflicts} / 0`,e.conflicts===0]];
  for(const [label,value,done]of rules){text(label,1168,y,14,palette.muted);text(value,1495,y,17,done?palette.green:palette.coral,'right',750);y+=28;}
  const fraction=state.timer/r.time;rect(1168,829,327,7,4,'#e8dec8');rect(1168,829,Math.max(0,327*fraction),7,4,fraction<.25?palette.coral:'#729471');
  text(`${Math.ceil(state.timer)}s to departure`,1168,855,13,palette.muted);text(`COMBO ×${state.combo+1}`,1495,855,12,palette.coral,'right',750);
  button(e.ready?'SERVE THE SONG  →':'BUILD YOUR CHORUS',1168,891,327,50,deliver,'coral',e.ready);text('A meal worth an encore.',1332,958,13,palette.muted,'center');
  text('CLICK / DRAG TO PACK   ·   R ROTATE   ·   Z UNDO   ·   H GUIDE   ·   ESC PAUSE',780,992,11,palette.muted,'center');
}
function removeSelected(){if(state.active?.id){remember();const p=state.pieces.find(p=>p.id===state.active.id);state.pieces=state.pieces.filter(q=>q.id!==p.id);state.stock[p.type]++;state.active=null;}}
function titleScreen(){
  stationBackdrop(0,0,W,H);
  text('♫',132,171,38,'#edcd89','center');text('A LITTLE MIDNIGHT MUSIC',165,171,15,'#e9d1a2','left',700);
  headline('Bento',101,292,142,'#fff1d1');headline('Rhapsody',100,416,142,'#ecc57c','left',true);
  wrap('Pack food friends. Find their groove. Put a very small band on the last train.',110,536,435,26,'#f9ebce',38);
  button('START THE SESSION  →',110,688,330,61,startGame,'coral');button('HOW TO JAM',460,688,194,61,toggleHelp,'light');
  text('♫ Best with sound. Lovely without it.',111,786,17,'#e9d7b7');text('Six food voices · a little jazz · your own arrangement',111,821,14,'#b7c4b3');
  rect(102,890,580,67,10,'#0e2d33c9','#66715a');
  foods.forEach((f,i)=>ingredient(f.id,147+i*95,923,71,1,i,true,Math.max(0,Math.sin(elapsed*2-i))*.6));
  text('THE MIDNIGHT BITES / DEBUT SESSION',1510,962,12,'#ffe6b7','right',700);
  if(best)text(`Best set: ${best.toLocaleString('en-US')} points`,110,861,15,'#f2d49c');
}
