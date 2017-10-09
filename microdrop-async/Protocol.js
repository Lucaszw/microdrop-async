class Protocol {
    constructor(ms) {
        this.ms = ms;
    }

    newProtocol() {
      // Create a new Microdrop Protocol
      this.ms.sendMessage(`microdrop/trigger/protocol-model/new-protocol`);
    }
}

module.exports = Protocol;
