var _ = require("lodash");
var MicrodropAsync = require("./MicrodropAsync");
var m = new MicrodropAsync();
var p = m.protocol;
var action = process.argv[2];

var deleteProtocol = async () => {
  var protocols = await p.protocols();
  var len = protocols.length;
  var name = protocols[len-1].name;
  var protocol = await p.getProtocolByName(name);
  var payload = await p.deleteProtocol(name);
  console.log(payload);
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

if (action == "new") newProtocol();
if (action == "del") deleteProtocol();
if (action == "skeletons") skeletons();
if (action == "protocols") protocols();
