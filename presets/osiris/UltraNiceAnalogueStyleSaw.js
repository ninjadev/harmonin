module.exports = {
  reverb: 0,
  name: 'Ultra Nice Analogue Style Saw',
  vibratoFrequency: 0,
  volume: 0.3,
  portamentoTime: 0,
  filterType: 'lowpass',
  filterFrequency: 3000,
  envelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    amount: 1,
    offset: 1
  },
  filterEnvelope: {
    delay: 0,
    attack: 10,
    hold: 50,
    decay: 100,
    sustain: 0.5,
    release: 100,
    amount: 0.2
  },
  oscillator1: {
    type: 'sawtooth',
    pitch: -24 - 12,
    volume: 1
  },
  oscillator2: {
    type: 'sawtooth',
    pitch: -24 - 12,
    volume: 1
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: -24 - 12,
    volume: 1
  }
}
