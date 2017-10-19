DEFAULT_TIMEOUT = 10000;

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

  async clear(timeout=DEFAULT_TIMEOUT) {
    return (await this.ms.triggerPlugin("electrodes-model", "clear-electrodes",
      undefined, timeout));
  }

  async reset(timeout=DEFAULT_TIMEOUT) {
    return (await this.ms.triggerPlugin("electrodes-model", "reset-electrodes",
      undefined, timeout));
  }

}

module.exports = Electrodes;
