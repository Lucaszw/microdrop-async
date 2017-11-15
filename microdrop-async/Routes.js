const lo = require('lodash');

DEFAULT_TIMEOUT = 10000;

class Routes {
  constructor(ms) {
      this.ms = ms;
  }

  async clear(routes, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Routes::clear>"; console.log(LABEL);
    try {
      if (!lo.isArray(routes)) throw("expected arg1 to be array of routes")

      const uuids = _.map(rotues, 'uuid');

      let routes = await this.routes(timeout);
      routes = lo.filter(routes, (r)=>!lo.includes(uuids, r.uuid));

      const msg = {
        __head__: {plugin_name: this.ms.name},
        routes: routes
      };
      const payload = await this.ms.putPlugin("routes-model", "routes", msg, timeout);
      return payload.response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e]));
    }
  }

  async routes(timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Routes::routes>"; console.log(LABEL);
    try {
      const routes = await this.ms.getState("routes-model", "routes", timeout);
      return routes;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, routes]));
    }
  }

  async execute(routes, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Routes::execute>"; console.log(LABEL);
    const msg = {};
    try {
      if (!lo.isArray(routes)) throw("arg 1 should be an array");
      if (!routes[0].start) throw("routes should contain 'start' attribute");
      if (!routes[0].path) throw("routes should contain 'path' attribute");

      lo.set(msg, "__head__.plugin_name", this.ms.name);
      lo.set(msg, "routes", routes);

      const d = await this.ms.triggerPlugin("routes-model", "execute", msg, timeout);
      return d;
    } catch (e) {
      throw([LABEL, e, {args: [routes]}]);
    }
  }

  async putRoutes(routes, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Routes::putRoutes>";
    try {
      if (!lo.isArray(routes)) throw("arg1 should be an array");
      const msg = {
        __head__: {plugin_name: this.ms.name},
        routes: routes
      };
      const payload = await this.ms.putPlugin("routes-model", "routes", msg, timeout);
      return payload.response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e]));
    }
  }

  async putRoute(start, path, timeout=DEFAULT_TIMEOUT) {
    const LABEL = "<MicrodropAsync::Routes::putRoute>";
    try {
      const r = start;
      if (lo.isObject(start)) { start = r.start; path = r.path; }
      if (!lo.isString(start)) throw("arg 1 should be string");
      if (!lo.isArray(path)) throw("arg 2 should be array");
      const msg = {
        __head__: {plugin_name: this.ms.name},
        start: start,
        path: path
      };
      const payload = await this.ms.putPlugin("routes-model", "route", msg, timeout);
      return payload.response;
    } catch (e) {
      throw(lo.flattenDeep([LABEL, e]));
    }
  }

}
module.exports = Routes;
