module.exports = {
  reverb: 0,
  name: 'Club Stonk',
  vibratoFrequency: 0,
  volume: 0.3,
  portamentoTime: 0,
  filterType: 'lowpass',
  filterFrequency: 8000,
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
    decay: 20,
    sustain: 0.09,
    release: 100,
    amount: 1,
    offset: 0
  },
  oscillator1: {
    type: 'sine',
    pitch: 0,
    volume: 1
  },
  oscillator2: {
    type: 'square',
    pitch: 0,
    volume: 0.25
  },
  oscillator3: {
    type: 'sawtooth',
    pitch: 24,
    volume: 0
  }
}
