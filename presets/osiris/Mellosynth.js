module.exports = {
  reverb: 0.4,
  name: 'Mellosynth',
  vibratoFrequency: 105 / 60 * 4,
  vibratoAmount: 4,
  volume: 0.8,
  portamentoTime: 60,
  filterType: 'highpass',
  filterFrequency: 50,
  delay: {
    feedback: 0.3,
    time: 105 / 60 / 4.01,
  },
  envelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    amount: 1,
    offset: 0
  },
  filterEnvelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    amount: 1,
    offset: 0
  },
  oscillator1: {
    type: 'sawtooth',
    pitch: -24,
    volume: 1
  },
  oscillator2: {
    type: 'sawtooth',
    pitch: -23.999,
    volume: 1
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: -24.001,
    volume: 1
  }
}
