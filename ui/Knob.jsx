const React = require('react');

class Knob extends React.Component {

  constructor() {
    super();
    this.state = {
      value: 0,
      inputValue: 0 
    };
  }

  normalizeLinear(denormalizedValue) {
    var delta = this.props.max - this.props.min;
    return (denormalizedValue - this.props.min) / delta;
  }

  denormalizeLinear(normalizedValue) {
    var delta = this.props.max - this.props.min;
    return normalizedValue * delta + this.props.min;
  }

  normalizeSquare(denormalizedValue) {
    return Math.pow(this.normalizeLinear(denormalizedValue), .5);
  }

  denormalizeSquare(normalizedValue) {
    return this.denormalizeLinear(Math.pow(normalizedValue, 2));
  }

  componentWillReceiveProps(newProps) {
    this.setValue(this.normalizeValue(this.props.audioParam.value));
  }

  update() {
    this.setValue(this.normalizeValue(this.props.audioParam.value));
    this.forceUpdate();
  }

  componentDidMount() {
    this.denormalizeValue = {
      linear: this.denormalizeLinear,
      square: this.denormalizeSquare
    }[this.props.mapping];
    this.normalizeValue = {
      linear: this.normalizeLinear,
      square: this.normalizeSquare
    }[this.props.mapping];

    this.setValue(this.normalizeValue(this.props.audioParam.value));

    this.dragging = false;
    this.startValue = 0;
    this.dragOffset = 0;

    document.body.addEventListener('mouseup', () => {
      this.dragging = false;
    });

    document.body.addEventListener('touchmove', e => {
      for(let i = 0; i < e.touches.length; i++) {
        if(e.touches[i].identifier == this.currentTouchId) {
          e.preventDefault();
          var shouldUpdateAudioParam = true;
          this.setValue(
            this.startValue + (this.dragOffset - e.touches[i].clientY) / 127 / 2,
            shouldUpdateAudioParam);
          break;
        }
      }
    });

    document.body.addEventListener('touchend', e => {
      if(!e.touches.length) {
        this.currentTouchId = undefined;
      }
      for(let i = 0; i < e.touches.length; i++) {
        console.log(e.touches[i].identifier, this.currentTouchId);
        if(e.touches[i].identifier == this.currentTouchId) {
          this.currentTouchId = undefined;
          break;
        }
      }
    });

    document.body.addEventListener('mousemove', e => {
      if(this.dragging) {
        var shouldUpdateAudioParam = true;
        this.setValue(
          this.startValue + (this.dragOffset - e.clientY) / 127,
          shouldUpdateAudioParam);
      }
    });
  }

  onMouseDown(e) {
    this.dragging = true;
    this.startValue = this.state.value;
    this.dragOffset = e.clientY;
    e.preventDefault();
  }

  onDoubleClick(e) {
    this.input.focus();
    this.input.select();
  }

  onTouchStart(e) {
    this.startValue = this.state.value;
    this.dragOffset = e.touches[e.touches.length - 1].clientY;
    this.currentTouchId = e.touches[e.touches.length - 1].identifier;
  }

  setDenormalizedValue(denormalizedValue, shouldUpdateAudioParam) {
    this.setState({
      value: this.normalizeValue(denormalizedValue)
    });
    if(shouldUpdateAudioParam) {
      this.props.audioParam.value = denormalizedValue;
    }
    if(this.props.onChange) {
      this.props.onChange(this.props.audioParam.value);
    }
  }

  setValue(value, shouldUpdateAudioParam) {
    value = Math.max(0, value);
    value = Math.min(1, value);
    this.setState({
      value: value
    });
    if(this.props.max > 127 || this.props.min < -127) {
      this.setState({
        inputValue: (this.denormalizeValue(value) | 0)
      });
    } else {
      this.setState({
        inputValue: (this.denormalizeValue(value) * 1000 | 0) / 1000
      });
    }
    if(shouldUpdateAudioParam) {
      this.props.audioParam.value = this.denormalizeValue(value);
    }

    if(this.props.onChange) {
      this.props.onChange(this.props.audioParam.value);
    }
  }

  render() {
    return (
      <div
        className="knob-container"
        onMouseDown={e => this.onMouseDown(e)}
        onTouchStart={e => this.onTouchStart(e)}
        onDoubleClick={e => this.onDoubleClick(e)}
        >
        <div className="knob">
          <input
            ref={input => this.input = input}
            value={this.state.inputValue}
            onChange={e => { this.setState({inputValue: e.target.value}); this.setDenormalizedValue(+e.target.value, true)}}
            onBlur={e => { if(e.target.value == '') { this.setState({inputValue: this.props.min}); this.setDenormalizedValue(+this.props.min, true)}}}
            />
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="23"
              style={{
                strokeDashoffset: (1 - this.state.value) * 144.51326206513048
              }}
              />
          </svg>
        </div>
        <div className="knob-name">
          {this.props.name}
        </div>
      </div>
    );
  }
}

module.exports = Knob;
