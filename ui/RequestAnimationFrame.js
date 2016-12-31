class RequestAnimationFrame {
  constructor() {
    this.handlers = [];
  }

  on(handler) {
    this.handlers.push(handler);
    if(this.handlers.length == 1) {
      requestAnimationFrame(() => this.loop());
    }
  }

  off(handler) {
    for(let i = 0; i < this.handlers.length; i++) {
      if(handler == this.handlers[i]) {
        this.handlers[i] = this.handlers[this.handlers.length - 1];
        this.handlers.pop();
        break;
      }
    }
  }

  loop() {
    if(this.handlers.length) {
      requestAnimationFrame(() => this.loop());
    }
    for(let handler of this.handlers) {
      handler();
    }
  }
}


module.exports = new RequestAnimationFrame()
