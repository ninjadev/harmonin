module.exports = {
  reverb: 1,
  name: 'Wide Pad',
  vibratoFrequency: 0,
  vibratoAmount: 0,
  volume: 0.4,
  portamentoTime: 0,
  filterType: 'lowpass',
  filterFrequency: 15000,
  envelope: {
    delay: 0,
    attack: 1000,
    hold: 0,
    decay: 400,
    sustain: 1,
    release: 1000,
    amount: 1,
    offset: 0
  },
  filterEnvelope: {
    delay: 0,
    attack: 10000,
    hold: 0,
    decay: 10000,
    sustain: 0.2,
    release: 2000,
    amount: 0.8,
    offset: 0.18
  },
  oscillator1: {
    type: 'sawtooth',
    pitch: -12,
    volume: 0.8
  },
  oscillator2: {
    type: 'square',
    pitch: -11.85,
    volume: 0.2
  },
  oscillator3: {
    type: 'square',
    pitch: -12.15,
    volume: 0.2
  }
}
