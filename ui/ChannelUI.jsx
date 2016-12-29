const React = require('react');
const Knob = require('./Knob.jsx');
const OsirisUI = require('./OsirisUI');
const SamplerUI = require('./SamplerUI');


class ChannelUI extends React.Component {

  constructor() {
    super();
    this.state = {
      titleA: '',
      titleB: ''
    };
  }

  updateVisualizer() {
    requestAnimationFrame(() => this.updateVisualizer());
    this.props.channel.outputAnalyserNode.getFloatTimeDomainData(this.visualiserArray);
    let max = 0;
    for(let i = 0; i < this.visualiserArray.length; i++) {
      max = Math.max(max, Math.abs(this.visualiserArray[i]));
    }
    this.visualizerCtx.drawImage(this.visualizerCanvas, 0, 1);
    this.visualizerCtx.fillStyle = '#3b4449';
    this.visualizerCtx.fillRect(0, 0, this.visualizerCanvas.width, 1);
    this.visualizerCtx.fillStyle = '#c6f54c';
    this.visualizerCtx.fillRect(
        this.visualizerCanvas.width / 2 - this.visualizerCanvas.width * max / 2,
        0,
        this.visualizerCanvas.width * max,
        1);
  }

  componentDidMount() {
    this.visualiserArray = new Float32Array(this.props.channel.outputAnalyserNode.fftSize);
    this.visualizerCtx = this.visualizerCanvas.getContext('2d');
    const titleB = this.props.channel.constructor.name == 'Sampler'
                 ? this.props.channel.settings.filename
                 : this.props.channel.settings.name
    this.setState({
      titleA: this.props.channel.constructor.name,
      titleB: titleB
    });
    this.updateVisualizer();
  }

  render() {
    return (
      <div className="channel-container">
        <div className="name">
          {this.state.titleA}
          <span className="patch-name">{this.state.titleB}</span>
        </div>
        <div className="base-panel">
          <div className="visualizer">
            <canvas
              ref={canvas => this.visualizerCanvas = canvas}
              width="20"
              height="50"
              />
          </div>
          <Knob
            name="Volume"
            audioParam={this.props.channel.outputNode.gain}
            mapping="linear"
            min={0}
            max={1}
          />
          <Knob
            name="Reverb"
            audioParam={this.props.channel.reverbSendNode.gain}
            mapping="linear"
            min={0}
            max={1}
            />
          <Knob
            name="Filter frq."
            audioParam={this.props.channel.filter.frequency}
            mapping="square"
            min={0}
            max={21000}
            />
          <Knob
            name="Delay time"
            audioParam={this.props.channel.delay.delayTime}
            mapping="linear"
            min={0}
            max={1}
            />
          <Knob
            name="Delay amount"
            audioParam={this.props.channel.delayGain.gain}
            mapping="linear"
            min={0}
            max={1}
            />
          </div>

          {this.props.channel.constructor.name == 'Osiris' ? 
            <OsirisUI channel={this.props.channel} />
          :''}

          {this.props.channel.constructor.name == 'Sampler' ?
            <SamplerUI channel={this.props.channel} />
          :''}
        </div>
    );
  }
}

module.exports = ChannelUI;
