class Interval {
  constructor(period) {
    this.period = parseInt(period) || 10;
    this.register = [];
    this.second = 0;
  }
  countUp() {
    ++this.second;
  }
  registerFunction(second, fn) {
    this.register[second] = fn;
  }
  tick() {
    this.countUp();
    console.log('this.second', this.second);
    if (typeof this.register[this.second] === 'function') {
      this.register[this.second]();
    }
    if (this.second === this.period) {
      this.reset();
    }
  }
  start() {
    setInterval(() => {
      this.tick();
    }, 1000);
  }
  reset() {
    this.second = 0;
  }
}
module.exports = Interval;
