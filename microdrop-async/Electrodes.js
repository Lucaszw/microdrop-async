class Electrodes {
  constructor(ms) {
    this.ms = ms;
  }

  async channels() {
    return (await this.ms.getState("electrodes-model", "channels"));
  }
  
  async electrodes() {
    return (await this.ms.getState("electrodes-model", "electrodes"));
  }

}

module.exports = Electrodes;
