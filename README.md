# harmonin

FL Studio to Web MIDI API bridge and all-in-one synthesizer built for js demos.

## Setup

- Clone the repo, and install dependencies using `npm` or `yarn`.
- To start harmonin, run `make`.
- This starts a web server at `localhost:8080`. Go there in a browser to use harmonin.

You can right away confirm that it is working by using your keyboard to trigger MIDI events (make sure vimium or similar is disabled).

## FL Bridge Setup Instructions

1. Install a virtual loopback midi cable, e.g. http://www.tobias-erichsen.de/software/loopmidi.html . 
   For OS X, this guide is helpful: https://www.ableton.com/en/help/article/using-virtual-MIDI-buses-live/ .
2. Select the proper MIDI in FL's MIDI settings (F10).
![](http://i.imgur.com/7VBuQbC.png)
3. Add a MIDI Out in the FL Channel rack.
![](http://i.imgur.com/6WJJCsK.png)
4. Open localhost:8080 in a browser and start playback in FL.
