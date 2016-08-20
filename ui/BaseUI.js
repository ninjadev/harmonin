'use strict';

class BaseUI {
  constructor(channel) {
    this.channel = channel;
    this.domElement = document.createElement('div');
  }

  update() {
  }
}

module.exports = BaseUI;
