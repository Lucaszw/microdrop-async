class Protocol {
  constructor(ms) {
      this.ms = ms;
  }

  getProtocolByName(name) {
    return new Promise((resolve, reject) => {
      return this.protocols().then((protocols) => {
        for (var i=0;i<protocols.length;i++) {
          if (protocols[i].name == name) {
            resolve(protocols[i]);
          }
        }
        reject("Protocol not found");
      });
    });
  }

  protocols(timeout=10000) {
    return this.ms.getState("protocol-model", "protocols");
  }

  protocol_skeletons(timeout=10000) {
    return this.ms.getState("protocol-model", "protocol-skeletons");
  }

  newProtocol(timeout=10000) {
    // Create a new Microdrop Protocol
    const msg = { __head__: {plugin_name: this.ms.name} }
    return this.ms.triggerPlugin("protocol-model", "new-protocol",
      msg, timeout);
  }

  deleteProtocol(name, timeout=10000) {
    // TODO: Change delete-protocol to require only name in payload
    const msg = {
      __head__: {plugin_name: this.ms.name},
      protocol: {name: name}
    };
    return this.ms.triggerPlugin("protocol-model", "delete-protocol",
      msg, timeout);
  }

  changeProtocol(name, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      name: name
    };
    return this.ms.triggerPlugin("protocol-model", "change-protocol",
      msg, timeout);
  }

  loadProtocol(protocol, overwrite=false, timeout=10000) {
    const msg = {
      __head__: {plugin_name: this.ms.name},
      protocol: protocol,
      overwrite: overwrite
    };
    return this.ms.triggerPlugin("protocol-model", "load-protocol",
      msg, timeout);
  }

}

module.exports = Protocol;
