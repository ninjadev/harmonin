const React = require('react');


class Piano extends React.Component {

  constructor() {
    super();
    if(!Piano.IMAGE_CACHE) {
      Piano.IMAGE_CACHE = {};
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 650;
      canvas.height = 20;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const width = 5;
      ctx.fillStyle = 'black';
      for(let x = 0; x < canvas.width; x += width) {
        ctx.fillRect(x, 0, 1, canvas.height);
      }

      let i = 0;
      for(let x = 0; x < canvas.width; x += width) {
        i++;
        if(i % 7 == 0 || i % 7 == 3) {
          continue;
        }
        ctx.fillRect(x + 4, 0, 3, canvas.height / 5 * 3);
      }
      Piano.IMAGE_CACHE.piano = canvas.toDataURL();
    }
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.renderLoop();
  }

  renderLoop() {
    requestAnimationFrame(() => this.renderLoop());
    const width = 5;
    const innerWidth = width - 1;
    this.ctx.drawImage(this.canvas, 0, 1);
    this.ctx.fillStyle = '#253237';
    this.ctx.fillRect(0, 0, this.canvas.width, 1);
    this.ctx.fillStyle = '#abdab4';
    this.ctx.globalAlpha = 0.1;
    for(let x = 0; x < this.canvas.width; x += width) {
      this.ctx.fillRect(x, 0, 1, 1);
    }
    this.ctx.globalAlpha = 1;
    for(let i = 0; i < this.props.channel.activeNotesCount; i++) {
      let note = this.props.channel.notes[i]; 
      this.ctx.fillRect((note.note - 36) * width, 0, innerWidth / 2 + note.velocity / 127 * innerWidth, 1);
    }
  }

  render() {
    return (
      <div>
        <div style={{
          backgroundImage: Piano.IMAGE_CACHE ? 'url(' + Piano.IMAGE_CACHE.piano + ')' : '',
          width: '650px',
          height: '20px'
          }}/>
        <canvas
          className="piano"
          ref={canvas => this.canvas = canvas}
          width="650"
          height="200"
          />
      </div>
    );
  }
}

module.exports = Piano;
