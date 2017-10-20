const lo = require('lodash');

let fs, path;
try {
  fs = require('fs');
  path = require('path');
} catch (e) {};

DEFAULT_TIMEOUT = 10000;


class Device {
  constructor(ms) {
    this.ms = ms;
  }

  async device() {
    const LABEL = "<MicrodropAsync::Device::device>"; console.log(LABEL);
    try {
      const response = await this.ms.getState("device-model", "device");
      return response;
    } catch (e) {
      throw([LABEL, e]);
    }
  }

  async electrodes() {
    const LABEL = "<MicrodropAsync::Device::channels>"; console.log(LABEL);
    try {
      const device = await this.ms.getState("device-model", "device");
      const obj = device.channels_by_electrode;
      return lo.zipObject(obj.index, obj.values);
    } catch (e) {
      throw([LABEL, e]);
    }
  }

  async channels() {
    const LABEL = "<MicrodropAsync::Device::channels>"; console.log(LABEL);
    try {
      const device = await this.ms.getState("device-model", "device");
      const obj = device.electrodes_by_channel;
      return lo.zipObject(obj.index, obj.values);
    } catch (e) {
      throw([LABEL, e]);
    }
  }

  async putDevice(device, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Device::putDevice>"; console.log(LABEL);
    try {
      const msg = {
        __head__: {plugin_name: this.ms.name},
        device: device
      };
      const response = await this.ms.putPlugin("device-model", "device", msg,
        timeout);
      return response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e]));
    }
  }

  async startDeviceInfoPlugin() {
    return (await this.ms.pluginManager.
      startProcessPluginByName("device_info_plugin"));
  }

  async stopDeviceInfoPlugin() {
    return (await this.ms.pluginManager.
      stopProcessPluginByName("device_info_plugin"));
  }

  async loadFromFile(file, name, timeout=DEFAULT_TIMEOUT) {
    const LABEL = `<MicrodropAsync::Device::loadFromFile>`;
    console.log(LABEL);
    try {
      const msg = {
        __head__: {plugin_name: this.ms.name},
        file: file,
        name: name
      };
      const response = await this.ms.triggerPlugin("device-model",
        "load-device", msg, timeout);
      return response;
    } catch (e) {
      throw([LABEL, e]);
    }
  }

  async loadFromFilePath(filePath, timeout=DEFAULT_TIMEOUT) {
    const LABEL = `<MicrodropAsync::Device::loadFromFilePath>`;
    console.log(LABEL);
    try {
      if (this.ms.environment == "web") {
        thow(`${LABEL} cannot load from file via web client`);
      }
      const _filePath = path.resolve(filePath);

      // Ensure device info plugin is running
      await this.startDeviceInfoPlugin();

      // Create promise to read file
      const read = () => {
        return new Promise((resolve, reject) => {
          return fs.readFile(_filePath, 'utf8', (err,data) => {
            if (err) {
              reject([`${LABEL} failed to read file`, err]);
            }
            resolve(data);
          });
      })};

      // Read file
      const file = await read();
      const name = path.parse(path.basename(_filePath)).name;

      return (await this.loadFromFile(file, name, timeout));
    } catch (e) {
      throw([LABEL, e]);
    }
  }

  async loadFromFilePrompt(timeout=DEFAULT_TIMEOUT) {
    const LABEL = `<Device#loadFromFilePrompt>`;
    if (this.ms.environment == 'node') {
      thow(`${LABEL} cannot load from fileprompt via node client`);
    }

    const prompt = () => {
      return new Promise((resolve, reject) => {
        const elem = document.createElement("input");
        elem.setAttribute("type", "file");
        elem.onchange = (e) => {
          resolve(elem.files[0]);
        };
        elem.click();
      });
    };

    const input = await prompt();

    // Ensure device info plugin is running
    await this.startDeviceInfoPlugin();

    // Create promise to read file;
    const read = (input) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({name: input.name, file: reader.result});
        }
        reader.readAsText(input);
      });
    };

    const f = await read(input);
    return (await this.loadFromFile(f.file, f.name, timeout));
  }

}

module.exports = Device;
