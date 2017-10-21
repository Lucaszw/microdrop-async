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

  async reset(timeout=DEFAULT_TIMEOUT) {
    const msg = {
      __head__: {plugin_name: this.ms.name}
    };
    return (await this.ms.triggerPlugin("electrodes-model", "reset-electrodes",
      msg, timeout));
  }

  async putChannels(channels, timeout=DEFAULT_TIMEOUT) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      channels: channels
    };
    return (await this.ms.putPlugin("electrodes-model", "channels",
      msg, timeout));
  }

  async putElectrodes(electrodes, timeout=DEFAULT_TIMEOUT) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      electrodes: electrodes
    };
    return (await this.ms.putPlugin("electrodes-model", "electrodes",
      msg, timeout));
  }

}

module.exports = Electrodes;
