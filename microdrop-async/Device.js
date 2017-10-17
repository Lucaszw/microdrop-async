let fs, path;
try {
  fs = require('fs');
  path = require('path');
} catch (e) {};

class Device {
  constructor(ms) {
    this.ms = ms;
  }

  async startDeviceInfoPlugin() {
    return (await this.ms.pluginManager.
      startProcessPluginByName("device_info_plugin"))
  }

  async stopDeviceInfoPlugin() {
    return (await this.ms.pluginManager.
      stopProcessPluginByName("device_info_plugin"))
  }

  async loadFromFile(file, name, timeout=10000) {
    const LABEL = `<Device#loadFromFile>`;
    const msg = {
      __head__: {plugin_name: this.ms.name},
      file: file,
      name: name
    };
    return (await this.ms.triggerPlugin("device-model",
      "load-device", msg, timeout));
  }

  async loadFromFilePath(filePath, timeout=10000) {
    const LABEL = `<Device#loadFromFilePath>`;
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
  }

  async loadFromFilePrompt(timeout=10000) {
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
    console.log("loading...", f);
    return (await this.loadFromFile(f.file, f.name, timeout));
  }

}

module.exports = Device;
