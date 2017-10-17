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
const Device = require('./microdrop-async/Device');
const Protocol = require('./microdrop-async/Protocol');
const PluginManager = require('./microdrop-async/PluginManager');

class MicrodropAsync extends MqttClient {
    constructor(){
      super();
      this.environment = environment;
      if (environment == 'web') lo.extend(this, WebMixins);
      if (environment == 'node') lo.extend(this, NodeMixins);
      this.protocol = new Protocol(this);
      this.pluginManager = new PluginManager(this);
      this.device = new Device(this);
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

    triggerPlugin(receiver, action, val, timeout=10000) {
      const makeRequest = async () => {
        try {
          await this.clientReady();
          await this.clearSubscriptions();
        } catch (e) {
          throw([`<MicrodropAsync>#${receiver}#${action}`, e]);
        }
        const result = await this.callTrigger(receiver, action, val, timeout);
        return result;
      }
      return makeRequest();
    }

    getState(sender, property) {
      const topic = `microdrop/${sender}/state/${property}`;
      const makeRequest = async () => {
        try {
          await this.clientReady();
          await this.clearSubscriptions();
        } catch (e) {
          throw([`<MicrodropAsync>#${sender}#${property}`, e]);
        }
        const result = await this.newMessage(topic);
        return result;
      };
      return makeRequest();
    }

    callTrigger(receiver, action, val, timeout=10000) {
      const topic = `microdrop/trigger/${receiver}/${action}`;
      const LABEL =`<MicrodropAsync#callTrigger> ${receiver}#${action}`;

      return new Promise((resolve, reject) => {
        this.onNotifyMsg(receiver, action, (payload) => {
          if (this.environment == "node") {
            resolve(payload);
            return;
          }
          // XXX: Need to migrate WebMqttClient to accept only json payloads
          let payloadJSON;
          try {
            payloadJSON = JSON.parse(payload);
            console.error(`${LABEL} String payloads are being depricated`);
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
