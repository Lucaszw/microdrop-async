const mqtt = require('mqtt')

const NodeMixins = new Object();

NodeMixins.getMsg = function(buf) {
  if (!buf.toString().length) return false;
  try {
    const msg = JSON.parse(buf.toString());
    return msg;
  } catch (e) {
    return false;
  }
}

NodeMixins.newMessage = function(topic) {
  return new Promise((resolve, reject) => {
    this.client.on("message", (t, buf) => {
      if (t != topic) return;
      const msg = this.getMsg(buf);
      if (msg) resolve(msg);
      if (!msg) reject(`<MicrodropAsync.Node>#newMessage Message Malformed`);
    });
    this.client.subscribe(topic);
  });
}

NodeMixins.clearSubscriptions = function(timeout=10000) {
  const url = `mqtt://${this.host}:${this.port}`;
  this.removeAllRoutes();

  return new Promise((resolve, reject) => {
    this.subscriptions = [];
    this.client.end(true, () => {
      this.client = mqtt.connect(url);
      this.client.on('message', this.onMessage.bind(this));
      this.client.on('connect', () => {
        this.trigger("client-ready", null);
        resolve(this.client);
      });
    });
    setTimeout(() => {
      reject(`<MicrodropAsync.Node>#clearSubscriptions Timeout (${timeout})`)
    }, timeout);
  });
}

module.exports = NodeMixins;
