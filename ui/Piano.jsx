const React = require('react');
const RequestAnimationFrame = require('./RequestAnimationFrame');


class Piano extends React.Component {

  constructor() {
    super();
    this.loop = () => this.renderLoop();
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.topCtx = this.topCanvas.getContext('2d');
    RequestAnimationFrame.on(this.loop);
  }

  componentWillUnmount() {
    RequestAnimationFrame.off(this.loop);
  }

  renderLoop() {
    const width = 12;
    const noteOffset = 36 + 3;

    this.topCtx.fillStyle = 'black';
    this.topCtx.fillRect(0, 0, this.topCanvas.width, this.topCanvas.height);
    this.topCtx.strokeStyle = '#ddd';
    let i = -1;
    const activeNotes = {}
    for(let i = 0; i < this.props.channel.activeNotesCount; i++) {
      let note = this.props.channel.notes[i]; 
      activeNotes[note.note] = note;
    }
    for(let x = 0; x < this.topCanvas.width; x += width) {
      let offset = 0;
      let padding = 0;
      i++;
      switch(i % 12) {
        case 0:
          offset = 0;
          padding = width / 2;
          break;
        case 1:
        case 3:
        case 6:
        case 8:
        case 10:
          continue;
        case 2:
        case 7:
        case 9:
          offset = -width / 2;
          padding = width;
          break;
        case 4:
        case 11:
          offset = -width / 2;
          padding = width / 2;
          break;
        case 5:
          offset = 0;
          padding = width / 2;
          break;
      }
      this.topCtx.fillStyle = i % 12 ? '#e7ebf2' : '#c6cad1';
      if((i + noteOffset) in activeNotes && activeNotes[i + noteOffset].releaseTime == -1) {
        this.topCtx.fillStyle = '#ffca8e';
      }
      this.topCtx.fillRect(x + offset, 0, width + padding, this.topCanvas.height);
      this.topCtx.strokeRect(x + offset, 0, width + padding, this.topCanvas.height);
    }

    i = -1;
    for(let x = 0; x < this.topCanvas.width; x += width) {
      i++;
      switch(i % 12) {
        case 1:
        case 3:
        case 6:
        case 8:
        case 10:
        if((i + noteOffset) in activeNotes && activeNotes[i + noteOffset].releaseTime == -1) {
          this.topCtx.fillStyle = '#fe8025';
        } else {
          this.topCtx.fillStyle = '#3c3d3f';
        }
        this.topCtx.fillRect(x, 0, width, this.topCanvas.height / 5 * 3);
      }
    }

    this.ctx.drawImage(this.canvas, 0, 1);
    this.ctx.fillStyle = '#253237';
    this.ctx.fillRect(0, 0, this.canvas.width, 1);
    this.ctx.fillStyle = '#2e3e40';
    for(let x = 0; x < this.canvas.width; x += width) {
      this.ctx.fillRect(x, 0, 1, this.canvas.height);
    }
    for(let i = 0; i < this.props.channel.activeNotesCount; i++) {
      let note = this.props.channel.notes[i]; 
      if(note.releaseTime != -1) {
        this.ctx.fillStyle = 'grey';
      } else {
        this.ctx.fillStyle = '#abdab4';
      }
      this.ctx.fillRect((note.note - noteOffset) * width + width / 2 - note.gain.gain.value * width / 2, 0, note.gain.gain.value * width, 1);
    }
  }

  render() {
    return (
      <div>
        <canvas
          className="top-piano"
          ref={canvas => this.topCanvas = canvas}
          width="636"
          height="40"
          />
        <canvas
          className="piano"
          ref={canvas => this.canvas = canvas}
          width="637"
          height="200"
          />
      </div>
    );
  }
}

module.exports = Piano;
