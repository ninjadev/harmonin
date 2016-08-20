module.exports = {
  reverb: 0.5,
  name: 'Square Pluck',
  vibratoFrequency: 0,
  vibratoAmount: 0,
  volume: 2,
  portamentoTime: 0,
  filterType: 'lowpass',
  filterFrequency: 3000,
  delay: {
    time: 105 / 60 / 4,
    feedback: 0.4
  },
  envelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 150,
    sustain: 0.05,
    release: 100,
    amount: 1,
    offset: 0
  },
  filterEnvelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 150,
    sustain: 0,
    release: 100,
    amount: 1,
    offset: 0
  },
  oscillator1: {
    type: 'sine',
    pitch: 0,
    volume: 0.5
  },
  oscillator2: {
    type: 'square',
    pitch: -12.02,
    volume: 0.8
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: -11.98,
    volume: 0.8
  }
}
