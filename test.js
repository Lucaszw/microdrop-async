var _ = require("lodash");
var MicrodropAsync = require("./MicrodropAsync");
var m = new MicrodropAsync();
var p = m.protocol;
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

if (action == "load") loadProtocol();
if (action == "new") newProtocol();
if (action == "del") deleteProtocol();
if (action == "skeletons") skeletons();
if (action == "protocols") protocols();
