'use strict';
// Original, offline formant synthesis: pitched breath through vowel resonators.
// No speech service, recordings, samples or pre-existing songs are used.
window.BentoChoir = (() => {
  const voices = {
    rice: { syllable: 'PON', role: 'warm bass', base: 48, vowel: [450, 900, 2200], wave: 'sawtooth', length: .40 },
    salmon: { syllable: 'SHA', role: 'silky tenor', base: 60, vowel: [750, 1200, 2600], wave: 'sawtooth', length: .35 },
    egg: { syllable: 'LA', role: 'sunny soprano', base: 72, vowel: [800, 1300, 2800], wave: 'triangle', length: .46 },
    broccoli: { syllable: 'TUK', role: 'beatbox', base: 55, vowel: [350, 1700, 2900], wave: 'square', length: .14 },
    tofu: { syllable: 'OO', role: 'velvet alto', base: 60, vowel: [300, 650, 2400], wave: 'sawtooth', length: .49 },
    ume: { syllable: 'MI', role: 'tiny diva', base: 79, vowel: [300, 2200, 3000], wave: 'triangle', length: .28 },
  };
  let context, master, analyser, compressor, enabled = true;
  const sources = new Set();
  const scope = new Uint8Array(256);
  const scale = [0, 2, 4, 7, 9];
  function unlock() {
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        master = context.createGain();
        master.gain.value = enabled ? .72 : 0;
        compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 16;
        compressor.ratio.value = 5;
        compressor.attack.value = .008;
        compressor.release.value = .18;
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        master.connect(compressor);
        compressor.connect(analyser);
        analyser.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
      return context;
    } catch { return null; }
  }
  function setEnabled(value) {
    enabled = value;
    if (master) master.gain.setTargetAtTime(enabled ? .72 : 0, context.currentTime, .025);
  }
  function hush() {
    for (const source of sources) { try { source.stop(); } catch {} }
    sources.clear();
  }
  function pitch(type, row = 2) { return voices[type].base + scale[Math.max(0, Math.min(4, 4 - row))]; }
  function sing(type, midi, options = {}) {
    if (!enabled || !context || context.state !== 'running') return;
    const v = voices[type];
    const start = context.currentTime + (options.delay || 0);
    const duration = options.duration || v.length;
    const volume = options.volume ?? .21;
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const envelope = context.createGain();
    const pan = context.createStereoPanner();
    pan.pan.value = Math.max(-.65, Math.min(.65, options.pan || 0));
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(volume, start + .025);
    envelope.gain.setValueAtTime(volume * .7, start + duration * .46);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    envelope.connect(pan); pan.connect(master);
    const oscillator = context.createOscillator();
    oscillator.type = v.wave;
    oscillator.frequency.setValueAtTime(frequency * (options.grumpy ? 1.055 : .985), start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * (options.grumpy ? .88 : 1), start + duration * .72);
    const vibrato = context.createOscillator();
    const depth = context.createGain();
    vibrato.frequency.value = type === 'ume' ? 7 : 5.2;
    depth.gain.value = options.grumpy ? 18 : 4;
    vibrato.connect(depth); depth.connect(oscillator.detune);
    const nodes = [envelope, pan, depth];
    for (let i = 0; i < v.vowel.length; i++) {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = v.vowel[i]; filter.Q.value = 4 + i * 2;
      const mix = context.createGain(); mix.gain.value = [.78, .40, .16][i];
      oscillator.connect(filter); filter.connect(mix); mix.connect(envelope);
      nodes.push(filter, mix);
    }
    const body = context.createGain(); body.gain.value = type === 'broccoli' ? .14 : .23;
    oscillator.connect(body); body.connect(envelope); nodes.push(body);
    for (const source of [oscillator, vibrato]) {
      sources.add(source); source.start(start); source.stop(start + duration + .03);
      source.onended = () => { sources.delete(source); source.disconnect(); };
    }
    oscillator.onended = () => {
      sources.delete(oscillator); oscillator.disconnect();
      for (const node of nodes) node.disconnect();
    };
  }
  function whistle(beat = 0) {
    if (!enabled || !context || context.state !== 'running') return;
    sing('tofu', [79, 76, 74, 72, 67][beat % 5], { duration: .36, volume: .12, pan: .35 });
  }
  function level() {
    if (!analyser || !enabled) return 0;
    analyser.getByteTimeDomainData(scope);
    let sum = 0; for (const x of scope) sum += ((x - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(sum / scope.length) * 9);
  }
  return { voices, unlock, setEnabled, hush, pitch, sing, whistle, level };
})();
