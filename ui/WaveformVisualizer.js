const React = require('react');
const RequestAnimationFrame = require('./RequestAnimationFrame');


class WaveformVisualizer extends React.Component {

  constructor() {
    super();
    this.loop = () => this.updateVisualizer();
    this.connected = false;
  }

  onDisconnect() {
    this.connected = false;
  }

  onConnect() {
    this.connected = true;
  }

  updateVisualizer() {
    this.analyserNode.getFloatTimeDomainData(this.visualiserArray);
    let max = 0;
    for(let i = 0; i < this.visualiserArray.length; i++) {
      max = Math.max(max, Math.abs(this.visualiserArray[i]));
    }
    this.ctx.drawImage(this.canvas, 0, 1);
    this.ctx.fillStyle = '#3b4449';
    this.ctx.fillRect(0, 0, this.canvas.width, 1);
    if(!this.connected) {
      return;
    }
    if(max > 1) {
      this.ctx.fillStyle = '#ff9130';
    } else if(max > 0.7) {
      this.ctx.fillStyle = '#ffd440';
    } else {
      this.ctx.fillStyle = '#c6f54c';
    }
    this.ctx.fillRect(
      this.canvas.width / 2 - this.canvas.width * max / 2,
      0,
      this.canvas.width * max,
      1);
  }

  componentDidMount() {
    this.analyserNode = this.props.audioNode.context.createAnalyser(256);
    this.props.audioNode.connect(this.analyserNode);
    this.connected = true;
    this.visualiserArray = new Float32Array(this.analyserNode.fftSize);
    this.ctx = this.canvas.getContext('2d');
    RequestAnimationFrame.on(this.loop);
  }

  componentWillUnmount() {
    RequestAnimationFrame.off(this.loop);
  }

  render() {
    return (
      <canvas
        width={this.props.width}
        height={this.props.height}
        ref={canvas => this.canvas = canvas}
        />
    );
  }
}

module.exports = WaveformVisualizer;
