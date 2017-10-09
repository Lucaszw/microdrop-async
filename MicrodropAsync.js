const NodeMqttClient = require('@mqttclient/node');

const Protocol = require('./microdrop-async/Protocol');

class MicrodropAsync extends NodeMqttClient {
    constructor(){
        super("localhost", 1883, "microdrop");
        this.protocol = new Protocol(this);
    }

    get filepath() {
      return __dirname;
    }

}

module.exports = MicrodropAsync;
