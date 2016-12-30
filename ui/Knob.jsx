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
            this.startValue + (this.dragOffset - e.touches[i].clientY) / 127,
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

  onTouchStart(e) {
    this.startValue = this.state.value;
    this.dragOffset = e.touches[e.touches.length - 1].clientY;
    this.currentTouchId = e.touches[e.touches.length - 1].identifier;
  }

  setDenormalizedValue(denormalizedValue) {
    this.setValue(this.normalizeValue(denormalizedValue));
  }

  setValue(value, shouldUpdateAudioParam) {
    value = Math.max(0, value);
    value = Math.min(1, value);
    value = (value * 127 | 0) / 127;
    this.setState({
      value: value
    });
    if(this.props.max > 127 || this.props.min < -127) {
      this.setState({
        inputValue: (this.denormalizeValue(value) | 0)
      });
    } else {
      this.setState({
        inputValue: (this.denormalizeValue(value) * 100 | 0) / 100
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
        >
        <div className="knob">
          <input
            min="0"
            max="1"
            ref={input => this.input = input}
            value={this.state.inputValue}
            />
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="23"
              style={{
                strokeDashoffset: (1 - this.state.value) * 157 | 0
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
