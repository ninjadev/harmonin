var Osiris = require('./channels/Osiris');
var Sampler = require('./channels/Sampler')
const ChannelUI = require('./ui/ChannelUI');
const React = require('react');
const ReactDOM = require('react-dom');
const WaveformVisualizer = require('./ui/WaveformVisualizer');

import {Tabs} from 'react-tabs';
Tabs.setUseDefaultStyles(false);

var audioContext = new AudioContext();

var channels = [
  new Osiris(audioContext, require('./presets/osiris/MotionBass')),
  new Osiris(audioContext, require('./presets/osiris/MotionChords')),
  new Osiris(audioContext, require('./presets/osiris/MotionLead')),
  new Osiris(audioContext, require('./presets/osiris/MotionBell')),
  new Sampler(audioContext, {
    volume: 5,
    filename: 'data/kick.wav'
  }),
  new Sampler(audioContext, {
    volume: 10,
    filename: 'data/snare.wav'
  }),
  new Sampler(audioContext, {
    reverb: 0.25,
    volume: 1,
    filename: 'data/hihat.wav'
  }),
  new Sampler(audioContext, {
    reverb: .5,
    volume: 20,
    filename: 'data/crash.wav'
  })
]

const masterOutputNode = audioContext.createGain();
masterOutputNode.connect(audioContext.destination);

var reverbNode = audioContext.createConvolver();
reverbNode.connect(masterOutputNode);
(function() {
  var request = new XMLHttpRequest();
  request.open('GET', 'data/irHall.ogg', true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      reverbNode.buffer = buffer;
    },
    function(e){console.log(e)});
  }
  request.send();
})();

for(var channel of channels) {
  channel.outputNode.connect(masterOutputNode);
  channel.reverbSendNode.connect(reverbNode);
}

var eventTimingLoopNode = audioContext.createScriptProcessor(256, 1, 1);
eventTimingLoopNode.connect(audioContext.destination);
var time = audioContext.currentTime;
var oldTime = time;
var deltaTime = 0;
eventTimingLoopNode.onaudioprocess = function() {
  time = audioContext.currentTime;
  deltaTime += time - oldTime;
  oldTime = time;
  var step = 256 / audioContext.sampleRate;
  while(deltaTime >= step) {
    deltaTime -= step;
    tick(time, step);
  }
};

var midiFile;

function tick(time, stepSize) {
  if(midiFile) {
    midiFile.play_forward(stepSize * 1000);
  }
  for(var channel of channels) {
    channel.tick(time);
  }
}

/*
var oReq = new XMLHttpRequest();
oReq.open("GET", "/harmonin2.mid");
oReq.responseType = "arraybuffer";
oReq.onload = function (oEvent) {
  var arrayBuffer = oReq.response;
  if (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    midiFile = new Midi(byteArray);
    midiFile.add_callback(e => {
      onMidiEvent(e.midi_channel, e.type, e.note_number, e.velocity);
    });
  }
};

oReq.send(null);
*/
function onMidiEvent(channel, type, note, velocity) {

  switch(type) {
    case 0x9:
      channels[channel].noteOn(note, velocity);
      break;
    case 0x8:
      channels[channel].noteOff(note, velocity);
      break;
    case 0xB:
      if(channel in channels) {
        channels[channel].mod(note, velocity);
      }
      break;
  }
}

navigator.requestMIDIAccess({}).then(function(midiAccess) {
  var midi = midiAccess;

  for(var input of midi.inputs.values()) {
    input.addEventListener('midimessage', e => {
      var channel = e.data[0] & 0xf;
      var type = (e.data[0] & 0xf0) >> 4;
      var note = e.data[1];
      var velocity = e.data[2];
      onMidiEvent(channel, type, note, velocity);
    });
  }

}, function(e) {
  console.log(e);  
})

class Harmonin extends React.Component {

  constructor() {
    super();
    this.state = {
      masterVisualizerHeight: 0
    };
  }

  resize() {
    this.setState({
      masterVisualizerHeight: window.innerHeight - 30
    });
  }

  componentDidMount() {
    window.addEventListener('resize',  e => { this.resize(); });
    this.resize();
  }

  render() {
    return (
      <div>
        {channels.map(channel =>
          <ChannelUI
            channel={channel}
            key={channel.id}
            />)}

        <div
          className="master-visualizer visualizer"
          ref={ref => this.masterVisualizerWrapper = ref}
          >
          <WaveformVisualizer
            audioNode={masterOutputNode}
            width={100}
            height={this.state.masterVisualizerHeight}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Harmonin />, document.querySelector('#container'));
