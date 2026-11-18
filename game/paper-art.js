'use strict';
// Original articulated paper food. Shapes remain editable and animate in code.
window.BentoArt = (() => {
  const colors={rice:['#f6e8c2','#d4c095'],salmon:['#db9475','#ae614a'],egg:['#edc56e','#bb8b40'],broccoli:['#7d9d76','#466e58'],tofu:['#dfc7a1','#b59471'],ume:['#bc7480','#8d465f']};
  const ink='#4d4034';
  function box(c,x,y,w,h,r,fill,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
  function ellipse(c,x,y,rx,ry,fill,stroke=null,rotation=0){c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}}
  function path(c,points,fill,stroke=ink,width=1.6){c.beginPath();points(c);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
  function facial(c,mood,sing,t,seed){
    c.save();c.lineCap='round';c.lineWidth=2;c.strokeStyle=ink;c.fillStyle=ink;
    const blink=Math.sin(t*.9+seed)>.997;
    for(const side of [-1,1]){
      const x=side*12;
      if(mood>0||blink){c.beginPath();c.moveTo(x-3,0);c.quadraticCurveTo(x,-5,x+3,0);c.stroke();}
      else {ellipse(c,x,-1,2.2,3.2,ink);ellipse(c,x+.6,-2.2,.65,.9,'#fff6df');}
      if(mood<0){c.beginPath();c.moveTo(x-side*4,-7);c.lineTo(x+side*3,-4);c.stroke();}
      ellipse(c,side*22,7,5,2.6,'#d7877a66');
    }
    if(sing>.05){ellipse(c,0,10,5,4+sing*6,ink);ellipse(c,1,13,2.8,1.5,'#d58983');}
    else {c.beginPath();if(mood<0){c.moveTo(-4,13);c.quadraticCurveTo(0,6,4,13);}else{c.moveTo(-4,8);c.quadraticCurveTo(0,15,4,8);}c.stroke();}
    c.restore();
  }
  function food(c,type,x,y,size,mood=0,t=0,sing=0,seed=0){
    const scale=size/110,[base,shade]=colors[type];
    c.save();c.translate(x,y-Math.sin(t*2.5+seed)*1.2-sing*3);c.scale(scale,scale);c.rotate(Math.sin(t*(mood<0?13:1.8)+seed)*(mood<0?.035:.022));
    ellipse(c,1,43,36,5,'#3c302125');
    // Paper arms and feet: the food is a performer rather than a static icon.
    c.lineWidth=2.4;c.lineCap='round';c.strokeStyle=shade;
    for(const side of [-1,1]){c.beginPath();c.moveTo(side*30,8);c.quadraticCurveTo(side*47,10-sing*15,side*43,20-sing*33);c.stroke();ellipse(c,side*43,20-sing*33,3,3,'#f2d7a8',shade);}
    c.shadowColor='#49351b30';c.shadowBlur=3;c.shadowOffsetY=3;
    if(type==='rice'){
      path(c,p=>{p.moveTo(-39,29);p.bezierCurveTo(-51,14,-25,-29,-8,-43);p.quadraticCurveTo(0,-51,10,-41);p.bezierCurveTo(25,-28,50,15,39,29);p.quadraticCurveTo(0,43,-39,29);},base,'#b6a782',1.6);
      c.shadowBlur=0;for(let i=0;i<39;i++){const xx=Math.sin(i*9.7)*30,yy=Math.cos(i*6.3)*26-4;if(Math.abs(xx)<(39-Math.max(0,-yy)*.5)){ellipse(c,xx,yy,1.2,2.5,i%2?'#fff6d9':'#d5c79f',null,i*.7);}}
      path(c,p=>{p.moveTo(-20,12);p.quadraticCurveTo(0,16,20,12);p.lineTo(22,34);p.quadraticCurveTo(0,40,-22,33);p.closePath();},'#344f45','#263e38');
      c.strokeStyle='#71806a';c.lineWidth=.7;for(let i=0;i<10;i++){c.beginPath();c.moveTo(-17+i*3.5,19);c.lineTo(-16+i*3.5,31);c.stroke();}
      c.translate(0,-5);
    }else if(type==='salmon'){
      path(c,p=>{p.moveTo(-43,-22);p.quadraticCurveTo(-44,-35,-25,-36);p.lineTo(32,-33);p.quadraticCurveTo(45,-26,44,-11);p.lineTo(40,27);p.quadraticCurveTo(16,40,-37,29);p.closePath();},base,'#a55f49',1.8);
      c.shadowBlur=0;path(c,p=>{p.moveTo(-41,19);p.quadraticCurveTo(0,33,42,18);p.lineTo(40,29);p.quadraticCurveTo(2,43,-38,30);p.closePath();},'#b7775b',null);
      c.save();c.beginPath();c.roundRect(-40,-32,81,60,14);c.clip();c.lineWidth=5;c.strokeStyle='#f9dbb0';
      for(let i=-2;i<5;i++){c.beginPath();c.moveTo(-66+i*23,-40);c.bezierCurveTo(-36+i*23,-20,-40+i*23,1,-2+i*23,35);c.stroke();}
      c.restore();c.translate(0,-2);
    }else if(type==='egg'){
      path(c,p=>{p.moveTo(-47,11);p.bezierCurveTo(-55,-4,-37,-20,-22,-24);p.bezierCurveTo(-9,-44,16,-32,28,-24);p.bezierCurveTo(52,-27,57,-3,47,17);p.bezierCurveTo(36,37,-3,38,-21,30);p.quadraticCurveTo(-40,36,-47,11);},'#f6e8c5','#c3ae83');
      c.shadowBlur=0;ellipse(c,0,-1,29,25,base,'#ca9c4b');ellipse(c,-10,-12,9,4,'#fae6a2',null,-.4);c.translate(1,-1);
    }else if(type==='broccoli'){
      path(c,p=>{p.moveTo(-12,-3);p.lineTo(-16,35);p.quadraticCurveTo(0,47,18,35);p.lineTo(12,-9);p.closePath();},'#b5bf8b','#708963');
      for(const [xx,yy,r] of [[-29,-7,22],[28,-5,22],[-15,-26,23],[14,-28,24],[0,-3,28]])ellipse(c,xx,yy,r,r*.9,base,'#4e7457');
      c.shadowBlur=0;for(let i=0;i<26;i++)ellipse(c,Math.sin(i*7.1)*33,Math.cos(i*4.9)*22-19,1.8,2,i%3?'#a3b08a':'#4f7959');
      c.translate(0,-3);
    }else if(type==='tofu'){
      path(c,p=>{p.moveTo(-37,-30);p.lineTo(26,-35);p.lineTo(43,-21);p.lineTo(40,28);p.lineTo(-26,37);p.lineTo(-40,20);p.closePath();},base,'#ac8e6a');
      c.shadowBlur=0;path(c,p=>{p.moveTo(-37,-30);p.lineTo(26,-35);p.lineTo(43,-21);p.lineTo(-22,-16);p.closePath();},'#f5e5c2','#c5ad88',1);
      path(c,p=>{p.moveTo(43,-21);p.lineTo(40,28);p.lineTo(-26,37);p.lineTo(-22,-16);p.closePath();},'#e6d2ad','#bba17a',1);
      for(let i=0;i<13;i++)ellipse(c,Math.sin(i*8)*25,Math.cos(i*5)*20+3,1.5,1.2,'#bda47d');
      box(c,-27,-34,44,4,2,'#88915d');c.translate(4,3);
    }else{
      path(c,p=>{p.moveTo(-36,2);p.bezierCurveTo(-36,-31,-13,-36,1,-30);p.bezierCurveTo(23,-38,44,-12,35,12);p.bezierCurveTo(28,44,-25,46,-36,2);},base,'#874960');
      c.shadowBlur=0;c.strokeStyle='#9e5566';c.lineWidth=1.4;for(let i=0;i<5;i++){c.beginPath();c.ellipse(Math.sin(i*4)*13,Math.cos(i*5)*8,19+i*2,23,-.4+i*.2,.3,1.5);c.stroke();}
      path(c,p=>{p.moveTo(0,-32);p.quadraticCurveTo(18,-55,36,-38);p.quadraticCurveTo(28,-23,0,-32);},'#7e996b','#526f50');
      c.strokeStyle='#c2ba83';c.beginPath();c.moveTo(6,-33);c.lineTo(28,-39);c.stroke();c.translate(0,3);
    }
    c.shadowBlur=0;c.shadowOffsetY=0;facial(c,mood,sing,t,seed);c.restore();
  }
  function outline(c,shape,cell,x,y){
    const taken=new Set(shape.map(p=>p.join(','))),edges=[];
    for(const [a,b] of shape){
      if(!taken.has(`${a},${b-1}`))edges.push([[a,b],[a+1,b]]);
      if(!taken.has(`${a+1},${b}`))edges.push([[a+1,b],[a+1,b+1]]);
      if(!taken.has(`${a},${b+1}`))edges.push([[a+1,b+1],[a,b+1]]);
      if(!taken.has(`${a-1},${b}`))edges.push([[a,b+1],[a,b]]);
    }
    const points=[],remaining=edges.slice();let edge=remaining.shift();if(!edge)return;
    points.push(edge[0]);let end=edge[1];while(remaining.length){points.push(end);const i=remaining.findIndex(e=>e[0][0]===end[0]&&e[0][1]===end[1]);if(i<0)break;edge=remaining.splice(i,1)[0];end=edge[1];}
    const vertices=points.map(([a,b])=>[x+a*cell,y+b*cell]);
    c.beginPath();
    vertices.forEach(([vx,vy],i)=>{
      const prev=vertices[(i+vertices.length-1)%vertices.length],next=vertices[(i+1)%vertices.length];
      const before=[vx+(prev[0]-vx)*.055,vy+(prev[1]-vy)*.055],after=[vx+(next[0]-vx)*.055,vy+(next[1]-vy)*.055];
      if(i===0)c.moveTo(...before);else c.lineTo(...before);c.quadraticCurveTo(vx,vy,...after);
    });c.closePath();
  }
  function piece(c,shape,type,x,y,cell,selected=false,pulse=0,angry=false){
    c.save();outline(c,shape,cell,x,y);
    const [base,shade]=colors[type],gradient=c.createLinearGradient(x,y,x+cell*3,y+cell*3);gradient.addColorStop(0,base);gradient.addColorStop(1,shade);
    c.shadowColor='#071f2670';c.shadowBlur=4;c.shadowOffsetY=3;c.fillStyle=gradient;c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
    c.strokeStyle=selected?'#ffe7a2':angry?'#8e5e75':'#203d39';c.lineWidth=selected?4:3;c.lineJoin='round';c.stroke();
    c.save();c.clip();
    for(let i=0;i<50;i++){const xx=x+((i*73.19)%280),yy=y+((i*41.73)%280);c.fillStyle=i%2?'#fff1cc18':'#4e3e2610';c.fillRect(xx,yy,2+(i%3),1);}
    if(pulse){c.fillStyle=`rgba(255,244,188,${pulse*.17})`;c.fillRect(x,y,cell*4,cell*4);}
    c.restore();outline(c,shape,cell,x,y);c.strokeStyle='#fbe5b066';c.lineWidth=1;c.stroke();c.restore();
  }
  function tray(c,x,y,cell,n=5){
    const w=cell*n;
    // Lacquered cherry wood, brass hinges, stitched carrying sleeve.
    c.save();c.shadowColor='#523b2845';c.shadowBlur=15;c.shadowOffsetY=8;
    const wood=c.createLinearGradient(x-30,y,x+w,y+w);wood.addColorStop(0,'#bd835c');wood.addColorStop(.52,'#a36446');wood.addColorStop(1,'#754733');
    box(c,x-27,y-24,w+54,w+55,24,wood,'#67412f');c.shadowBlur=0;c.shadowOffsetY=0;
    c.strokeStyle='#ecc18e99';c.lineWidth=1;c.setLineDash([3,4]);c.beginPath();c.roundRect(x-19,y-17,w+38,w+39,18);c.stroke();c.setLineDash([]);
    const lining=c.createRadialGradient(x+w*.4,y+w*.3,1,x+w*.5,y+w*.5,w*.8);lining.addColorStop(0,'#365c53');lining.addColorStop(1,'#173f40');
    box(c,x-3,y-3,w+6,w+6,11,lining,'#553b2d');
    c.strokeStyle='#e8d8b01c';c.lineWidth=1;for(let i=1;i<n;i++){c.beginPath();c.moveTo(x+i*cell,y);c.lineTo(x+i*cell,y+w);c.moveTo(x,y+i*cell);c.lineTo(x+w,y+i*cell);c.stroke();}
    for(const xx of [x+cell*.8,x+cell*3.9]){box(c,xx,y-29,23,14,3,'#dfb479','#715136');box(c,xx+3,y-27,17,3,1,'#f0d098');}
    c.restore();
  }
  return {food,tray,piece,outline,colors};
})();
