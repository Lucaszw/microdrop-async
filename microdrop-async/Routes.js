class Routes {
  constructor(ms) {
      this.ms = ms;
  }

  async startDropletPlanningPlugin() {
    return (await this.ms.pluginManager.
      startProcessPluginByName("droplet_planning_plugin"))
  }

  async stopDropletPlanningPlugin() {
    return (await this.ms.pluginManager.
      stopProcessPluginByName("droplet_planning_plugin"))
  }
}
module.exports = Routes;
