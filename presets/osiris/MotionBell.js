module.exports = {
  reverb: 0,
  name: 'Motion Bell',
  vibratoFrequency: 0,
  vibratoAmount: 0,
  volume: 2,
  portamentoTime: 0,
  filterType: 'highpass',
  filterFrequency: 300,
  delay: {
    time: 105 / 60 / 4,
    feedback: 0.5
  },
  envelope: {
    delay: 0,
    attack: 0,
    hold: 0,
    decay: 30,
    sustain: 0.2,
    release: 200,
    amount: 1,
    offset: 0
  },
  oscillator1: {
    type: 'sawtooth',
    pitch: -0.2,
    volume: 0.5
  },
  oscillator2: {
    type: 'triangle',
    pitch: 0.2,
    volume: 0.5
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: 46,
    volume: 0.1
  }
}
