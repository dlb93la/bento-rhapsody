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
  text(state.mode==='jam'?'FREE JAM / NO RULES, JUST GROOVE':state.rush?'THE MIDNIGHT RUSH':'THE EDIBLE JAZZ CLUB / COZY',440,43,13,'#b2c1b0','left',600);
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
    const x=rack.x,y=rack.y+i*(rack.h+rack.gap),selected=state.active?.type===f.id,available=rehearsal().menu.includes(f.id),packed=available&&state.stock[f.id]<3;ctx.save();if(!available)ctx.globalAlpha=.35;
    rect(x,y,rack.w,rack.h,8,selected?'#ecebd8':packed?'#f0f0df':'#f7efdf',selected?'#5e795c':'#e1d2b8');
    rect(x+5,y+6,60,62,6,window.BentoArt.colors[f.id][0]+'80');ingredient(f.id,x+35,y+37,61,selected?1:0,i);
    text(f.name,x+75,y+19,17,palette.ink,'left',750);text(choir.voices[f.id].role,x+75,y+41,12,palette.muted);if(available)text(`♥ ${byFood[f.friend].name}`,x+75,y+61,11,palette.green);
    text(`×${state.stock[f.id]}`,x+rack.w-10,y+22,13,palette.muted,'right',700);
    if(!available)text('Later in the story',x+75,y+61,11,palette.muted);ctx.restore();
  });
  wrap(state.active?`${byFood[state.active.type].nick} avoids ${byFood[byFood[state.active.type].enemy].name}. Space: try a solo.`:'Touch a friend: find your voice. Gold stages earn an extra ticket.',60,878,225,14,palette.muted,21);
  button('HOW TO JAM · H',58,928,238,32,toggleHelp,'light');
}
function liveArrangement(e){
  const x=347,y=924,w=751,active=new Set(state.pieces.map(p=>p.type));rect(x,y,w,47,8,'#e8eddb','#cbd3b5');
  text('♫',367,y+23,23,palette.green,'center');text('Live arrangement',390,y+16,14,palette.ink,'left',700);
  text(state.solo?`${byFood[state.solo.type].nick} is taking a solo!`:`${active.size} layers · ${e.singers.size} singing · ${choir.bpm} BPM · ${music.chord}`,390,y+34,11,palette.muted);
  button(concert?.done?'RETRY A/S/D':'SOLO · SPACE',747,y+8,153,28,concert?.done?retryConcert:spotlight,'light',state.pieces.length>0);
  for(let i=0;i<20;i++){const h=4+music.meter*17*(.4+.6*Math.abs(Math.sin(elapsed*4+i*2)));rect(x+w-155+i*6.4,y+24-h/2,3,h,2,active.size?'#729a79':'#bcc4ae');}
}
function gameplay(){
  const r=recipes[state.level],e=evaluate();header();
  stationBackdrop(40,101,1480,131);text(state.mode==='jam'?'FREE JAM · YOUR SONG AUTOSAVES':`TRACK 0${state.level+1} / 06 · ${rehearsal().tag}`,66,127,12,'#f8d797','left',700);headline(state.mode==='jam'?'Make a little joyful noise.':r.name,64,183,64,'#fff2d7');
  text(state.mode==='jam'?'TRY A TEMPO. TAKE A SOLO.':rehearsal().blocked.length?'TWO SEATS RESERVED FOR TEA.':'MAKE FRIENDS. STEAL THE SPOTLIGHT.',1495,203,12,'#fae5b8','right',700);
  rect(40,251,271,727,12,palette.paper,'#dfcfb4');rect(331,251,794,727,12,palette.paper,'#dfcfb4');rect(1145,251,375,727,12,palette.paper,'#dfcfb4');
  drawPantry();text('YOUR COMPOSITION',353,281,12,'#895e42','left',800);headline('The band\'s lunchbox',353,313,39);text(state.mode==='jam'?`${e.area} / 25 spaces`:`${e.area} / ${r.cells} packed`,1101,311,13,palette.muted,'right');
  beatStrip(board.x,328,495,e.beatSet,15);window.BentoArt.tray(ctx,board.x,board.y,board.cell);
  state.pieces.forEach(p=>drawPiece(p,e.moods[p.id]||0,state.active?.id===p.id?.7:1));
  drawStageFeatures(e);drawPerformanceCard();
  if(!state.pieces.length&&!rehearsal().blocked.length){headline('Your first little song',722,577,35,'#e5d5ac','center');text('Choose a food and give it a place.',722,616,16,'#bbcab0','center');text('Friends bring out the voice.',722,646,14,'#a4b8a3','center');}
  if(music.beat>=0){ctx.fillStyle='#f0d29714';ctx.fillRect(board.x+music.beat*99,board.y,99,495);ctx.fillStyle='#e6bd70';ctx.fillRect(board.x+music.beat*99+7,board.y+491,85,2);}
  if(state.active&&pointer.x>board.x-12&&pointer.x<board.x+510&&pointer.y>board.y-12&&pointer.y<board.y+510){
    const x=Math.floor((pointer.x-board.x)/99)-(state.active.grabX||0),y=Math.floor((pointer.y-board.y)/99)-(state.active.grabY||0),shape=cells(byFood[state.active.type].shape,state.rotation),ok=valid(state.active.type,x,y,state.rotation,state.active.id);
    ctx.save();window.BentoArt.outline(ctx,shape,99,board.x+x*99,board.y+y*99);ctx.fillStyle=ok?'#f2d69d50':'#c96f6a75';ctx.fill();ctx.strokeStyle=ok?'#ffdf9b':'#f4a6a2';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.stroke();ctx.restore();
  }
  const message=state.reaction?.text||(state.active?`${byFood[state.active.type].nick} · choose a place`:'Move a piece to change the arrangement.');
  ctx.save();ctx.beginPath();ctx.rect(348,888,570,30);ctx.clip();text(message,353,904,13,state.reaction?.good===false?palette.coral:palette.muted);ctx.restore();
  button('↶ Z',928,888,52,28,undo,'light',state.history.length>0);button('R ↻',989,888,48,28,()=>{state.rotation=(state.rotation+1)%4;choir.sfx('rotate');},'light',!!state.active);button('×',1046,888,52,28,removeSelected,'light',!!state.active?.id);
  liveArrangement(e);
  text(state.mode==='jam'?'THE ROOM IS YOURS':'TONIGHT\'S LISTENER',1168,282,12,'#895e42','left',800);headline(state.mode==='jam'?'Off the clock':r.customer,1168,319,38);text(state.mode==='jam'?'No departures. No wrong songs.':r.role,1168,349,13,palette.muted);
  if(state.mode==='jam')ingredient('rice',1451,323,73,1,0,true,music.customer);else{ctx.save();ctx.translate(1451,322);ctx.scale(.45,.45);customer(0,0,r.mood);ctx.restore();}
  wrap(rehearsal().tip,1168,391,325,16,palette.ink,23);
  if(state.mode==='jam'){jamPanel(e);text('CLICK / DRAG · R ROTATE · Z UNDO · SPACE SOLO · H GUIDE',780,992,11,palette.muted,'center');return;}
  let y=491;text('THE SET LIST',1168,y-26,12,'#895e42','left',800);
  for(const [id,n]of Object.entries(r.needs)){const done=(e.counts[id]||0)>=n;ingredient(id,1183,y+3,31,done?1:0,2);text(byFood[id].name,1208,y,14);text(done?'✓':`0 / ${n}`,1495,y,15,done?palette.green:palette.muted,'right',700);y+=28;}
  y=Math.max(y+18,594);ctx.strokeStyle='#e2d7bf';ctx.beginPath();ctx.moveTo(1168,y-10);ctx.lineTo(1496,y-10);ctx.stroke();
  const rules=[['Packed spaces',`${e.area} / ${r.cells}`,e.area>=r.cells],['Happy duets',`${e.bonds} / ${r.bonds}`,e.bonds>=r.bonds],['Singing entries',`${e.rhythm} / ${r.beats}`,e.rhythm>=r.beats],['Rival neighbors',`${e.conflicts} / 0`,e.conflicts===0]];
  for(const [label,value,done]of rules){text(label,1168,y,14,palette.muted);text(value,1495,y,17,done?palette.green:palette.coral,'right',750);y+=28;}
  const grade=rating(e);text(`ENCORE TICKETS  ${'★'.repeat(grade.stars)}${'☆'.repeat(3-grade.stars)}`,1168,789,13,'#927244','left',750);text(`+1 every voice · +1 gold stages (${grade.lit}/${grade.spotGoal})`,1168,810,11,palette.muted);
  const fraction=state.timer/r.time;rect(1168,829,327,7,4,'#e8dec8');rect(1168,829,state.rush?Math.max(0,327*fraction):327,7,4,fraction<.25&&state.rush?palette.coral:'#729471');
  text(state.rush?`${Math.ceil(state.timer)}s to departure`:'Cozy set · take your time',1168,855,13,palette.muted);text(`COMBO ×${state.combo+1}`,1495,855,12,palette.coral,'right',750);
  button(e.ready?(concert?.done?'SERVE THE SONG  →':'PLAY THE CHORUS  →'):'BUILD YOUR CHORUS',1168,891,327,50,performOrServe,'coral',e.ready);text(concert?.done?`${concert.medal} · +${concert.bonus} pts`:'PACK → PAIR → PLAY A/S/D → SERVE',1332,958,12,palette.muted,'center');
  text('CLICK / DRAG TO PACK   ·   R ROTATE   ·   Z UNDO   ·   SPACE SOLO   ·   H GUIDE   ·   ESC PAUSE',780,992,11,palette.muted,'center');
}
function removeSelected(){if(state.active?.id){remember();const p=state.pieces.find(p=>p.id===state.active.id);state.pieces=state.pieces.filter(q=>q.id!==p.id);state.stock[p.type]++;state.active=null;saveJam();}}
function drawStageFeatures(e){
  for(const [x,y]of rehearsal().spots){const p=e.grid[y]?.[x],lit=p&&e.singers.has(p.id),xx=board.x+(x+.83)*99,yy=board.y+(y+.18)*99;rect(xx-10,yy-10,20,20,6,lit?'#f7d587':'#d7bd7b55');text('★',xx,yy+1,14,lit?'#7d5b23':'#ddc48e','center',800);}
  if(rehearsal().blocked.length){const x=board.x+2*99,y=board.y+2*99;rect(x+3,y+3,93,192,7,'#7c705f');ctx.strokeStyle='#a9957244';ctx.lineWidth=2;for(let i=8;i<190;i+=14){ctx.beginPath();ctx.moveTo(x+7,y+i);ctx.lineTo(x+89,y+i-20);ctx.stroke();}rect(x+25,y+34,49,110,12,'#d9c39b','#5b5747');rect(x+28,y+23,43,18,4,'#a47b52');text('TEA',x+49,y+83,13,'#6e6148','center',700);text('Reserved',x+49,y+169,11,'#eadbbc','center');}
}
function jamPanel(e){
  headline('Your tiny studio',1168,496,33);text('Every arrangement is worth hearing.',1168,534,14,palette.muted);
  const values=[['Players in the box',state.pieces.length],['Happy voices',e.singers.size],['Duets',e.bonds],['Rival neighbors',e.conflicts]];
  values.forEach(([s,n],i)=>{text(s,1168,587+i*38,16,palette.muted);text(String(n),1495,587+i*38,22,palette.ink,'right',750);});
  button(`TEMPO  ${state.tempo} BPM  ↻`,1168,753,327,44,changeTempo,'light');button('CLEAR THE BOX',1168,814,327,42,clearJam,'light');
  button('BACK TO THE TITLE',1168,891,327,50,()=>{saveJam();state.screen='title';choir.setPlaying(false);},'coral');text('Saved here, in this browser.',1332,958,13,palette.muted,'center');
}
function titleScreen(){
  stationBackdrop(0,0,W,H);
  text('♫',132,171,38,'#edcd89','center');text('A LITTLE MIDNIGHT MUSIC',165,171,15,'#e9d1a2','left',700);
  headline('Bento',101,292,142,'#fff1d1');headline('Rhapsody',100,416,142,'#ecc57c','left',true);
  wrap('Pack a puzzle. Conduct the chorus. Six passengers. One last-train concert.',110,536,435,26,'#f9ebce',38);
  button('START THE SESSION  →',110,688,330,61,startGame,'coral');button('HOW TO JAM',460,688,194,61,toggleHelp,'light');
  button('FREE JAM  ♫',110,769,234,43,startJam,'light');button(state.rush?'RUSH · WITH A CLOCK':'COZY · NO CLOCK',362,769,292,43,()=>{state.rush=!state.rush;},'light');
  text('6 puzzle tracks · 48 live notes · Cozy / Rush / Free Jam',111,843,17,'#e9d7b7');
  rect(102,890,580,67,10,'#0e2d33c9','#66715a');
  foods.forEach((f,i)=>ingredient(f.id,147+i*95,923,71,1,i,true,Math.max(0,Math.sin(elapsed*2-i))*.6));
  text('THE MIDNIGHT BITES / DEBUT SESSION',1510,962,12,'#ffe6b7','right',700);
  if(best)text(`Best set: ${best.toLocaleString('en-US')} points`,110,977,13,'#f2d49c');
}
