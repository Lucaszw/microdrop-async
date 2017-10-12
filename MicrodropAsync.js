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

const Protocol = require('./microdrop-async/Protocol');

class MicrodropAsync extends MqttClient {
    constructor(){
      super();
      if (environment == 'web') lo.extend(this, WebMixins);
      if (environment == 'node') lo.extend(this, NodeMixins);
      this.protocol = new Protocol(this);
    }
    listen() {
      console.log("Listening...");
      this.trigger("client-ready", null);
    }

    get filepath() {
      if (environment == 'web') return "web";
      if (environment == 'node') return __dirname;
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

    triggerPlugin(receiver, action, val, timeout=2000) {
      const makeRequest = async () => {
        await this.clientReady();
        await this.clearSubscriptions();
        const result = await this.callTrigger(receiver, action, val, timeout);
        return result;
      }
      return makeRequest();
    }

    getState(sender, property) {
      const topic = `microdrop/${sender}/state/${property}`;
      const makeRequest = async () => {
        await this.clientReady();
        await this.clearSubscriptions();
        const result = await this.newMessage(topic);
        return result;
      };
      return makeRequest();
    }

    callTrigger(receiver, action, val, timeout=10000) {
      const topic = `microdrop/trigger/${receiver}/${action}`;
      return new Promise((resolve, reject) => {
        this.onNotifyMsg(receiver, action, (payload) => {
          resolve(payload);
        });
        this.sendMessage(topic, val);
        setTimeout(()=> {
          reject(`<triggerPlugin>#${receiver}#${action}::Timeout (${timeout})`)
        }, timeout);
      });
    }
}

module.exports = MicrodropAsync;
