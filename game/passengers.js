'use strict';
// Original animated passenger portraits and facial expressions.
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
