'use strict';
// Newly composed for Bento Rhapsody. Zoud informed the layered-band approach,
// not this score or source. One audio-clock transport, changing arrangements.
window.BentoChoir = (() => {
  let BPM = 96, EIGHTH = 60 / BPM / 2;const ENTRIES = [0, 2, 3, 5, 6];
  const voices = {
    rice: { syllable: 'PON', role: 'upright bass', base: 48, vowel: [430, 860, 2300], color: '#d8cda4' },
    salmon: { syllable: 'SHA', role: 'muted brass', base: 60, vowel: [700, 1180, 2500], color: '#cf8468' },
    egg: { syllable: 'LA', role: 'electric piano', base: 72, vowel: [750, 1260, 2800], color: '#e4b95e' },
    broccoli: { syllable: 'TUK', role: 'brush drums', base: 55, vowel: [380, 1600, 2900], color: '#749b78' },
    tofu: { syllable: 'OO', role: 'nylon guitar', base: 60, vowel: [300, 680, 2350], color: '#c3ac8b' },
    ume: { syllable: 'MI', role: 'vibes & scat', base: 79, vowel: [300, 2200, 3100], color: '#ad626e' },
  };
  // Dm9 - G13 - Cmaj9 - A7sus - Fmaj9 - Em7 - Dm9 - A7.
  const harmony = [
    { name: 'Dm9', root: 38, notes: [62, 65, 69, 72, 76] },
    { name: 'G13', root: 43, notes: [62, 65, 69, 71, 76] },
    { name: 'Cmaj9', root: 36, notes: [60, 64, 67, 71, 74] },
    { name: 'A7sus', root: 33, notes: [61, 64, 67, 69, 74] },
    { name: 'Fmaj9', root: 41, notes: [60, 64, 67, 69, 72] },
    { name: 'Em7', root: 40, notes: [59, 62, 67, 71, 74] },
    { name: 'Dm9', root: 38, notes: [60, 62, 65, 69, 76] },
    { name: 'A7', root: 33, notes: [61, 64, 67, 71, 73] },
  ];
  const melody = [
    [-1, 2, 3, -1, 4, 2, -1, 1], [3, -1, 4, 3, -1, 1, 2, -1],
    [2, 3, -1, 4, -1, 2, 1, -1], [-1, 2, 1, -1, 3, 2, 0, 1],
    [4, -1, 3, 2, -1, 1, 2, -1], [3, -1, 4, -1, 2, 1, -1, 0],
    [-1, 1, 2, -1, 3, 4, 2, -1], [2, -1, 1, 0, -1, 1, 2, 3],
  ];
  let context, master, band, effects, analyser, compressor, noise, pluckWave;
  let enabled = true, playing = false, concert = false, index = 0, nextTime = 0;
  let pattern = [], arrangements = [], visualQueue = [], listener = () => {}, lastAt = 0, fallback = 0;
  const playingSources = new Set(), trace = [];
  const scope = new Uint8Array(256);
  const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
  function arrangementFor(bar) { return concert && arrangements.length ? arrangements[Math.floor(bar / 2) % arrangements.length] : pattern; }
  function pitch(type, row = 2, bar = 0) {
    const note = harmony[bar % 8].notes[Math.max(0, Math.min(4, 4 - row))];
    return note + (type === 'rice' ? -24 : type === 'ume' ? 12 : 0);
  }
  function score(pieces, bar, step, isConcert = false) {
    const chord = harmony[bar % 8], notes = [], pulses = [];
    const add = (kind, type, midi, duration, gain, delay = 0, pan = 0) => notes.push({kind, type, midi, duration, gain, delay, pan});
    for (const type of Object.keys(voices)) {
      const group = pieces.filter(p => p.type === type);
      if (!group.length) continue;
      const lead = group.find(p => p.singing) || group[0];
      const happy = group.some(p => p.singing), angry = group.every(p => p.grumpy);
      const solo=pieces.some(p=>p.solo),featured=group.some(p=>p.solo);
      const energy = (angry ? .12 : happy ? 1 : .38)*(solo?(featured?1.35:.28):1);
      const pan = (lead.x - 2) * .16, variation = (4 - lead.y) % 3;
      if (type === 'rice' && [0, 3, 4, 6].includes(step)) {
        const walk = [0, 7, 12, bar % 2 ? 10 : 5][[0, 3, 4, 6].indexOf(step)];
        add('bass',type,chord.root+walk,.47,.19*energy,0,pan);
      }
      if (type === 'broccoli') {
        add('hat',type,0,step===7?.13:.055,.032*energy,0,pan);
        if(step===0||step===4)add('kick',type,0,.25,.23*energy,0,pan);
        if(step===2||step===6)add('brush',type,0,.20,.105*energy,0,pan);
        if(step===7&&bar%2)add('kick',type,0,.17,.07*energy,.06,pan);
      }
      if (type === 'egg' && [0, 3, 6].includes(step)) {
        chord.notes.slice(0,4).forEach((n,i)=>add('rhodes',type,n,.83,.035*energy,i*.009,pan));
      }
      if (type === 'tofu' && step % 2 === 1) {
        chord.notes.slice(0,4).forEach((n,i)=>add('guitar',type,n,.44,.032*energy,i*.014,pan));
        if(step===5)add('guitar',type,chord.notes[variation]+12,.39,.026*energy,.08,pan);
      }
      if (type === 'salmon') {
        const degree = melody[bar%8][(step + lead.x * 2) % 8];
        if(degree>=0)add('brass',type,chord.notes[(degree+variation)%5],step===7?.48:.25,.065*energy,.012,pan);
      }
      if (type === 'ume' && [1,4,7].includes(step)) {
        const n=chord.notes[(step+variation+bar)%5]+12;
        add('vibes',type,n,.74,.055*energy,.018,pan);
      }
      if(featured&&happy&&[1,3,5,7].includes(step))add(type==='salmon'?'brass':'vibes',type,chord.notes[(step+bar)%5]+(type==='rice'?0:12),.32,.065,0,pan);
      if(happy&&group.some(p=>p.spotlit)&&step===7&&bar%2===1)add('vibes',type,chord.notes[4]+12,.44,.045,.08,pan);
      // The food's actual position controls its sung entry, not just the backing.
      const entrances=group.filter(p=>ENTRIES[p.x]===step&&(p.singing||p.grumpy));
      entrances.forEach(p=>{
        pulses.push({id:p.id,type,grumpy:!!p.grumpy});
        if(p.grumpy){if(bar%2===0)add('grumble',type,pitch(type,p.y,bar)-1,.16,.045,0,(p.x-2)*.18);}
        else add('vocal',type,pitch(type,p.y,bar),type==='broccoli'?.14:.39,.085/Math.sqrt(entrances.length)*(solo&&!featured?.3:1),.015,(p.x-2)*.18);
      });
    }
    if(isConcert&&step===0&&bar%2===0)add('whistle','tofu',harmony[bar%8].notes[4]+12,.78,.055,.04,.3);
    if(isConcert&&[2,6].includes(step))add('brush','broccoli',0,.12,.025,0,-.25);
    return {notes,pulses,chord:chord.name,bar,step,beat:Math.max(0,ENTRIES.findLastIndex(s=>s<=step)),track:Math.floor(bar/2)%Math.max(1,arrangements.length)};
  }
  function build() {
    const Constructor=window.AudioContext||window.webkitAudioContext;
    if(!Constructor)return null;
    context=new Constructor({latencyHint:'interactive'});
    master=context.createGain();master.gain.value=enabled?.72:0;
    compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=4;compressor.attack.value=.006;compressor.release.value=.22;
    analyser=context.createAnalyser();analyser.fftSize=256;
    band=context.createGain();band.gain.value=.82;effects=context.createGain();effects.gain.value=.65;
    band.connect(master);effects.connect(master);master.connect(compressor);compressor.connect(analyser);analyser.connect(context.destination);
    const delay=context.createDelay(.5),filter=context.createBiquadFilter(),wet=context.createGain();
    delay.delayTime.value=60/BPM*.375;filter.type='lowpass';filter.frequency.value=2500;wet.gain.value=.105;
    band.connect(delay);delay.connect(filter);filter.connect(wet);wet.connect(master);
    noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
    const data=noise.getChannelData(0);let seed=197781,last=0;
    for(let i=0;i<data.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;last=(last+((seed>>>0)/2147483648-1)*.4)/1.4;data[i]=last*1.8;}
    const a=new Float32Array(18),b=new Float32Array(18);for(let i=1;i<b.length;i++)b[i]=(i%2?1:.45)/i**1.7;
    pluckWave=context.createPeriodicWave(a,b);
    nextTime=context.currentTime+.07;
    return context;
  }
  function unlock() {
    try {if(!context)build();if(context?.state==='suspended')context.resume().catch(()=>{});return context;}catch{return null;}
  }
  function register(sources,nodes,end,at) {
    let remaining=sources.length;
    sources.forEach(source=>{playingSources.add(source);source.onended=()=>{playingSources.delete(source);if(--remaining===0)nodes.forEach(n=>{try{n.disconnect();}catch{}});};source.start(at);source.stop(end);});
  }
  function makeEnvelope(at,duration,gain,pan,destination,attack=.008) {
    const env=context.createGain(),stereo=context.createStereoPanner();
    stereo.pan.value=pan;env.gain.setValueAtTime(.0001,at);env.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),at+attack);
    env.gain.exponentialRampToValueAtTime(Math.max(.00015,gain*.54),at+Math.max(attack+.01,duration*.36));env.gain.exponentialRampToValueAtTime(.0001,at+duration);
    env.connect(stereo);stereo.connect(destination);return {env,stereo};
  }
  function instrument(event,at,destination=band) {
    const {kind,type,midi,duration,gain,pan}=event;
    if(gain<.0001)return;
    const start=at+(event.delay||0), end=start+duration+.035;
    const {env,stereo}=makeEnvelope(start,duration,gain,pan||0,destination,kind==='brass'?.032:.006);
    const nodes=[env,stereo],sources=[];
    const oscillator=(wave,note,weight=1,detune=0)=>{
      const o=context.createOscillator(),g=context.createGain();
      if(wave==='pluck')o.setPeriodicWave(pluckWave);else o.type=wave;
      o.frequency.setValueAtTime(frequency(note),start);o.detune.value=detune;g.gain.value=weight;o.connect(g);nodes.push(o,g);sources.push(o);return {o,g};
    };
    if(['hat','brush'].includes(kind)){
      const source=context.createBufferSource(),f=context.createBiquadFilter();source.buffer=noise;f.type=kind==='hat'?'highpass':'bandpass';f.frequency.value=kind==='hat'?5600:1650;f.Q.value=.65;source.connect(f);f.connect(env);sources.push(source);nodes.push(source,f);
      if(kind==='brush'){const {g}=oscillator('triangle',51,.22);g.connect(env);}
    }else if(kind==='kick'){
      const {o,g}=oscillator('sine',48);o.frequency.setValueAtTime(142,start);o.frequency.exponentialRampToValueAtTime(44,start+.12);g.connect(env);
    }else if(kind==='vocal'||kind==='grumble'){
      const {o,g}=oscillator('sawtooth',midi,.8);
      o.frequency.setValueAtTime(frequency(midi)*.97,start);o.frequency.exponentialRampToValueAtTime(frequency(midi)*(kind==='grumble'?.91:1),start+.12);
      voices[type].vowel.forEach((v,i)=>{const f=context.createBiquadFilter(),mix=context.createGain();f.type='bandpass';f.frequency.value=v;f.Q.value=5+i*2;mix.gain.value=[.7,.32,.12][i];g.connect(f);f.connect(mix);mix.connect(env);nodes.push(f,mix);});
      const body=context.createGain();body.gain.value=.10;g.connect(body);body.connect(env);nodes.push(body);
      const {g:fundamental}=oscillator('sine',midi,.32);fundamental.connect(env);
      if(type==='salmon'||type==='broccoli'){
        const air=context.createBufferSource(),high=context.createBiquadFilter(),breath=context.createGain();air.buffer=noise;high.type='highpass';high.frequency.value=type==='salmon'?3200:1600;breath.gain.setValueAtTime(.16,start);breath.gain.exponentialRampToValueAtTime(.0001,start+.085);air.connect(high);high.connect(breath);breath.connect(env);sources.push(air);nodes.push(air,high,breath);
      }
    }else if(kind==='rhodes'||kind==='vibes'){
      const {o,g}=oscillator('sine',midi);g.connect(env);
      const mod=context.createOscillator(),depth=context.createGain();mod.frequency.value=frequency(midi)*(kind==='rhodes'?2:3.99);depth.gain.setValueAtTime(frequency(midi)*.8,start);depth.gain.exponentialRampToValueAtTime(2,start+.22);mod.connect(depth);depth.connect(o.frequency);nodes.push(mod,depth);sources.push(mod);
      const {g:shine}=oscillator('sine',midi+12,.13);shine.connect(env);
    }else{
      const f=context.createBiquadFilter();f.type='lowpass';f.Q.value=.65;f.frequency.setValueAtTime(kind==='bass'?1100:kind==='brass'?2450:3600,start);f.frequency.exponentialRampToValueAtTime(kind==='bass'?350:1400,start+duration);f.connect(env);nodes.push(f);
      const {o,g}=oscillator(kind==='guitar'?'pluck':kind==='bass'?'triangle':kind==='whistle'?'sine':'sawtooth',midi);g.connect(f);
      if(kind==='bass'){const {g:body}=oscillator('sine',midi,.4);body.connect(f);}
      if(kind==='brass'||kind==='whistle'){
        const lfo=context.createOscillator(),depth=context.createGain();lfo.frequency.value=5.4;depth.gain.setValueAtTime(0,start);depth.gain.linearRampToValueAtTime(9,start+.16);lfo.connect(depth);depth.connect(o.detune);nodes.push(lfo,depth);sources.push(lfo);
      }
    }
    register(sources,nodes,end,start);
  }
  function dispatch(step,at){
    const bar=Math.floor(step/8),part=step%8,plan=score(arrangementFor(bar),bar,part,concert);
    if(context&&enabled&&context.state==='running')plan.notes.forEach(event=>instrument(event,at));
    visualQueue.push({at,plan});
    trace.push({bar,step:part,chord:plan.chord,notes:plan.notes.length,types:[...new Set(plan.notes.map(n=>n.type))]});if(trace.length>96)trace.shift();
  }
  function tick(dt=.025){
    if(!playing)return;
    if(context?.state==='running'){
      const now=context.currentTime;if(nextTime<now-.15)nextTime=now+.04;
      while(nextTime<now+.12){dispatch(index,nextTime);nextTime+=EIGHTH*(index%2===0?1.12:.88);index=(index+1)%384;}
      while(visualQueue.length&&visualQueue[0].at<=now+.015)listener(visualQueue.shift().plan);
    }else{
      fallback+=dt;const interval=EIGHTH*(index%2===0?1.12:.88);
      if(fallback>=interval){fallback%=interval;const bar=Math.floor(index/8);listener(score(arrangementFor(bar),bar,index%8,concert));index=(index+1)%384;}
    }
  }
  function hush(){for(const source of playingSources){try{source.stop();}catch{}}playingSources.clear();visualQueue=[];}
  function setPlaying(value){
    if(playing===value)return;playing=value;
    if(!value)hush();else{nextTime=context?context.currentTime+.04:0;fallback=EIGHTH;}
  }
  function setEnabled(value){enabled=value;if(master)master.gain.setTargetAtTime(value?.72:0,context.currentTime,.02);}
  function setArrangement(pieces,options={}){pattern=pieces;concert=!!options.concert;arrangements=options.songs||[];}
  function reset(){index=0;fallback=0;visualQueue=[];nextTime=context?context.currentTime+.04:0;hush();}
  function sing(type,midi,options={}){if(context&&enabled&&context.state==='running')instrument({kind:'vocal',type,midi,duration:options.duration||.3,gain:(options.volume??.15)*.6,pan:options.pan||0,delay:options.delay||0},context.currentTime+.005,effects);}
  function sfx(name){
    if(!context||!enabled||context.state!=='running')return;
    const notes=name==='place'?[62,69,74]:name==='error'?[46,45]:name==='serve'?[65,69,72,76]:name==='rotate'?[69,74]:[74];
    notes.forEach((midi,i)=>instrument({kind:'guitar',type:'tofu',midi,duration:.22,gain:.05,pan:0,delay:i*.032},context.currentTime+.006,effects));
  }
  function level(){if(!analyser||!enabled)return 0;analyser.getByteTimeDomainData(scope);let n=0;for(const x of scope)n+=((x-128)/128)**2;return Math.min(1,Math.sqrt(n/scope.length)*5);}
  function whistle(beat=0){if(context&&enabled)instrument({kind:'whistle',type:'tofu',midi:[81,79,76,74,72][beat%5],duration:.7,gain:.06,pan:.3},context.currentTime+.01);}
  return {voices,pitch,unlock,setEnabled,hush,sing,sfx,whistle,level,setArrangement,setPlaying,reset,tick,score,entries:ENTRIES,get bpm(){return BPM;},setTempo(value){BPM=Math.max(60,Math.min(132,Number(value)||96));EIGHTH=60/BPM/2;},onStep(fn){listener=fn;},get diagnostics(){return {playing,enabled,bar:Math.floor(index/8),step:index%8,sources:playingSources.size,trace:trace.slice()};}};
})();
