class MidiKeyboard {
  constructor(fireMidiEvent) {
    this.fireMidiEvent = fireMidiEvent;
    this.channel = 0;
    this.activeNotes = {};
    this.noteOffset = 36 + 3;

    this.keymap = {
      90: 0,
      83: 1,
      88: 2,
      68: 3,
      67: 4,
      86: 5,
      71: 6,
      66: 7,
      72: 8,
      78: 9,
      75: 10,
      77: 11,
      188: 12,
      76: 13,
      190: 14,
      192: 15,
      189: 16,

      81: 12,
      50: 13,
      87: 14,
      51: 15,
      69: 16,
      82: 17,
      53: 18,
      84: 19,
      54: 20,
      89: 21,
      55: 22,
      85: 23,
      73: 24,
      57: 25,
      79: 26,
      48: 27,
      80: 28,
      221: 29,
      219: 30,
      186: 31
    };
  }

  attach() {
    document.addEventListener('keydown', e => {
      if(!(e.which in this.keymap)) {
        return;
      }
      const note = this.keymap[e.which] + this.noteOffset;
      if(note in this.activeNotes) {
        return;
      }
      this.activeNotes[note] = true;
      this.fireMidiEvent(this.channel, 0x9, note, 127);
    });
    document.addEventListener('keyup', e => {
      if(!(e.which in this.keymap)) {
        return;
      }
      const note = this.keymap[e.which] + this.noteOffset;
      delete this.activeNotes[note];
      this.fireMidiEvent(this.channel, 0x8, note, 127);
    });
  }
}

module.exports = MidiKeyboard;
