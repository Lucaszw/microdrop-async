const mqtt = require('mqtt')
const NodeMqttClient = require('@mqttclient/node');

const Protocol = require('./microdrop-async/Protocol');

class MicrodropAsync extends NodeMqttClient {
    constructor(){
        super("localhost", 1883, "microdrop");
        this.protocol = new Protocol(this);
    }
    listen() {
      this.trigger("client-ready", null);
    }

    get filepath() {
      return __dirname;
    }

    clientReady(timeout=1000) {
      return new Promise ((resolve, reject) => {
        if (this.client.connected) {
          resolve(true);
        }else {
          this.on("client-ready", (e) => {
            resolve(true);
          });
        }
        setTimeout(() => {reject("Reached timeout")}, timeout );
      });
    }

    getMsg(buf) {
      if (!buf.toString().length) return false;
      try {
        const msg = JSON.parse(buf.toString());
        return msg;
      } catch (e) {
        return false;
      }
    }

    triggerPlugin(receiver, action, val, timeout=2000) {
      const topic = `microdrop/trigger/${receiver}/${action}`;
      return new Promise((resolve, reject) => {
        return this.clientReady().then(() => {
          return this.clearSubscriptions().then(() => {
            this.onNotifyMsg(receiver, action, (payload) => {
              resolve(payload);
            });
            this.sendMessage(topic, val);
          });
        });
        setTimeout(()=> {
          reject(`<triggerPlugin>#${receiver}#${action}::Timeout`)},
          timeout);
      });
    }

    getState(sender, property) {
      const topic = `microdrop/${sender}/state/${property}`;
      return new Promise((resolve, reject) => {
        return this.clientReady().then(() => {
          return this.clearSubscriptions().then(() => {
            this.client.on("message", (t, buf) => {
              if (t != topic) return;
              const msg = this.getMsg(buf);
              if (msg) {resolve(msg);}
              else {reject("Could not read message in topic payload");}
            });
            this.client.subscribe(topic);
          });
        });
      });
    }

    clearSubscriptions(timeout=2000) {
      const promises = new Array(this.subscriptions.length);
      const url = `mqtt://${this.host}:${this.port}`;

      return new Promise((resolve, reject) => {
        this.subscriptions = [];
        this.client.end(true, () => {
          console.log("Client disconnected..");
          this.client = mqtt.connect(url);
          this.client.on('message', this.onMessage.bind(this));
          this.client.on('connect', () => {
            console.log("Client connected...");
            this.trigger("client-ready", null);
            resolve(this.client);
          });
        });
        setTimeout(() => {reject("Timeout")}, timeout);
      });
    }

    unsubscribe(sub) {
      return new Promise((resolve, reject) => {
        this.client.unsubscribe(sub, (e) => {
          resolve(e);
        });
      });
    }
}

module.exports = MicrodropAsync;
