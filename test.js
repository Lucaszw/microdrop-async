var _ = require("lodash");
var MicrodropAsync = require("./MicrodropAsync");
var m = new MicrodropAsync();
var p = m.protocol;
var pm = m.pluginManager;

var action = process.argv[2];

var getLastProtocol = async () => {
  var protocols = await p.protocols();
  var len = protocols.length;
  var name = protocols[len-1].name;
  var protocol = await p.getProtocolByName(name);
  console.log("success", protocol);
  return protocol;
}

var deleteProtocol = async () => {
  var protocols = await p.protocols();
  console.log("protocols", protocols);
  var len = protocols.length;
  var name = protocols[len-1].name;
  console.log("name", name);
  var payload = await p.deleteProtocol(name);
  console.log("success", payload);
  return payload;
};
var loadProtocol = async () => {
  var protocols = await p.protocols();
  var protocol = protocols[0];
  output = await p.loadProtocol(protocol);
  if (output.requireConfirmation) {
    console.log("Already exists, giving confirmation to override");
    output = await p.loadProtocol(protocol, true);
  }
  console.log("success", output);
  return output;
};

var newProtocol = async () => {
  const protocol = await p.newProtocol();
  console.log(protocol);
};

var skeletons = async() => {
  const skeletons = await p.protocol_skeletons();
  console.log(skeletons);
};

var protocols = async() => {
  const protocols = await p.protocols();
  console.log(protocols);
}

var processPlugins = async() => {
  const plugins = await pm.getProcessPlugins();
  console.log("plugins", plugins);
}

var runningPlugins = async() => {
  const plugins = await pm.getRunningProcessPlugins();
  console.log("running plugins", plugins);
}

var findDeviceInfoPlugin = async() => {
  const name = "device_info_plugin";
  const plugins = await pm.findProcessPluginByName(name);
  console.log(name, plugins);
}

var checkDeviceInfoStatus = async() => {
  const name = "device_info_plugin";
  const runningState = await pm.checkStatusOfPluginWithName(name);
  console.log(name, "state", runningState);
}

var startDeviceInfoPlugin = async () => {
  const name = "device_info_plugin";
  const status = await pm.checkStatusOfPluginWithName(name);
  console.log("running status before: ", status);
  const state = await pm.startProcessPluginByName(name);
  console.log(state);
}

var stopDeviceInfoPlugin = async () => {
  const name = "device_info_plugin";
  const status = await pm.checkStatusOfPluginWithName(name);
  console.log("running status before: ", status);
  const state = await pm.stopProcessPluginByName(name);
  console.log(state);
}


if (action == "protocol:load") loadProtocol();
if (action == "protocol:new") newProtocol();
if (action == "protocol:del") deleteProtocol();
if (action == "protocol:skeletons") skeletons();
if (action == "protocol:protocols") protocols();
if (action == "manager:processPlugins") processPlugins();
if (action == "manager:runningPlugins") runningPlugins();
if (action == "manager:findPlugin") findDeviceInfoPlugin();
if (action == "manager:checkPluginState") checkDeviceInfoStatus();
if (action == "manager:startPlugin") startDeviceInfoPlugin();
if (action == "manager:stopPlugin") stopDeviceInfoPlugin();
