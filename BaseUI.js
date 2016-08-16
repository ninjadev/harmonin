(function(global) {
  'use strict';
  class BaseUI {
    constructor(channel) {
      this.channel = channel;
      this.domElement = document.createElement('div');
    }

    update() {
    }
  }

  global.BaseUI = BaseUI;
})(this);
