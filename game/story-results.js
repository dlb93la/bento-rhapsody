'use strict';
// Six passenger outcomes, recorded train encore, restart and player guide.
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
