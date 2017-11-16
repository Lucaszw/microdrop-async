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

  async threeObject() {
    const LABEL = "<MicrodropAsync::Device::threeObject>"; console.log(LABEL);
    try {
      const response = await this.ms.getState("device-model", "three-object");
      return response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e]));
    }
  }
  async putThreeObject(threeObject, timeout=DEFAULT_TIMEOUT) {
    /* Send three js group object to backend for physics manipulation */
    const LABEL = "<MicrodropAsync::Device::putThreeObject>";
    try {
      const msg = {
        __head__: {plugin_name: this.ms.name},
        "three-object": threeObject
      };
      const response = await this.ms.putPlugin(
        "device-model", "three-object", msg, timeout);
      return response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e.toString()]));
    }
  }

  async getNeighbouringElectrodes(electrodeID, timeout=DEFAULT_TIMEOUT) {
    /* Get electrodes in all four directions */
    const LABEL = "<MicrodropAsync::Device::getNeighbouringElectrodes>";
    try {
      const msg = {
        __head__: {plugin_name: this.ms.name},
        electrodeId: electrodeID
      };
      const r = await this.ms.triggerPlugin(
        "device-model", "get-neighbouring-electrodes", msg, timeout
      );
      return r.response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e.toString()]));
    }
  }

  async electrodesFromRoutes(routes, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Device::electrodesFromRoutes>";
    const msg = {};
    try {
      if (!lo.isArray(routes)) throw("routes should be array");
      lo.set(msg, "__head__.plugin_name", this.ms.name);
      lo.set(msg, "routes", routes);
      const payload = await this.ms.triggerPlugin("device-model",
        "electrodes-from-routes", msg, timeout);
      return payload.response[0];
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e.toString()]));
    }
  }

  async electrodesFromRoute(start, path, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Device::electrodesFromRoute>";
    /* Either ("" || {start: "", path: []}, []) */
    try {
      if (lo.isPlainObject(start)) { start = arg1.start;  path = arg1.path}
      if (!lo.isString(start)) throw("start should be a string");
      if (!lo.isArray(path)) throw("path should be array");
      return await this.electrodesFromRoutes([{start, path}]);
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e.toString()]));
    }
  }

}

module.exports = Device;
