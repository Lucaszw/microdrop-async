const lo = require("lodash");

const WebMixins = require('./WebMixins');
const NodeMixins = require('./NodeMixins');

let MqttClient, environment;
try {
  MqttClient = require('@mqttclient/web');
  environment = 'web';
} catch (e) {
  MqttClient = require('@mqttclient/node');
  environment = 'node';
}
const Electrodes = require('./microdrop-async/Electrodes');
const Device = require('./microdrop-async/Device');
const Protocol = require('./microdrop-async/Protocol');
const PluginManager = require('./microdrop-async/PluginManager');
const Routes = require('./microdrop-async/Routes');
const Steps = require('./microdrop-async/Steps');

class MicrodropAsync extends MqttClient {
    constructor(){
      super();
      this.environment = environment;
      if (environment == 'web') lo.extend(this, WebMixins);
      if (environment == 'node') lo.extend(this, NodeMixins);
      this.electrodes = new Electrodes(this);
      this.device = new Device(this);
      this.pluginManager = new PluginManager(this);
      this.protocol = new Protocol(this);
      this.routes = new Routes(this);
      this.steps = new Steps(this);
      this._name = this.generateId();
    }
    listen() {
      this.trigger("client-ready", null);
    }

    get name() {
      return this._name;
    }

    get filepath() {
      if (environment == 'web') return "web";
      if (environment == 'node') return __dirname;
    }

    generateId() {
      return `microdrop-async-${Date.now()}-${Math.ceil(Math.random()*100)}`;
    }

    clientReady(timeout=10000) {
      return new Promise ((resolve, reject) => {
        if (this.connected) {
          resolve(true);
        }else {
          this.on("client-ready", (e) => {
            resolve(true);
          });
        }
        setTimeout(() => {
          reject(`<MicrodropAsync>#ClientReady Timeout (${timeout})`)},
            timeout );
      });
    }

    async triggerPlugin(receiver, action, val, timeout=10000) {
      try {
        await this.clientReady();
        await this.clearSubscriptions();
      } catch (e) {
        throw([`<MicrodropAsync>#${receiver}#${action}`, e]);
      }
      const result = await this.callAction(receiver, action,
        val, "trigger", timeout);
      return result;
    }

    async putPlugin(receiver, property, val, timeout=10000) {
      const LABEL = `<MicrodropAsync#putPlugin>`;
      try {
        await this.clientReady(timeout);
        await this.clearSubscriptions(timeout);
      } catch (e) {
        throw([`${LABEL} ${receiver}#${property}`, e]);
      }
      return (await this.callAction(receiver, property, val, "put", timeout));
    }

    async getState(sender, property) {
      const topic = `microdrop/${sender}/state/${property}`;
      try {
        await this.clientReady();
        await this.clearSubscriptions();
      } catch (e) {
        throw([`<MicrodropAsync>#${sender}#${property}`, e]);
      }
      const result = await this.newMessage(topic);
      return result;
    }

    callAction(receiver, action, val, type="trigger", timeout=10000) {
      return new Promise((resolve, reject) => {
        const topic = `microdrop/${type}/${receiver}/${action}`;
        const LABEL =`<MicrodropAsync#callAction> ${receiver}#${action}`;
        this.onNotifyMsg(receiver, action, (payload) => {
          if (this.environment == "node") {
            resolve(payload);
            return;
          }
          // XXX: Need to migrate WebMqttClient to accept only json payloads
          let payloadJSON;
          try {
            payloadJSON = JSON.parse(payload);
            console.warn(`${LABEL} String payloads are being depricated`);
          } catch (e) {
            payloadJSON = payload;
          }
          resolve(payloadJSON);
        });
        this.sendMessage(topic, val);
        setTimeout(() => {
          reject(`${LABEL}::Timeout (${timeout})`);
        }, timeout);
      });
    }
}

module.exports = MicrodropAsync;
