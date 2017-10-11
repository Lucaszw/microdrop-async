const WebMixins = new Object();

const IsJsonString = (str) => {
  try { JSON.parse(str);} catch (e) {return false;}
  return true;
}

WebMixins.newMessage = function(topic) {
  return new Promise((resolve, reject) => {
    this.client.onMessageArrived = (msg) => {
      if (msg.destinationName != topic) return;
      const payloadIsValid = IsJsonString(msg.payloadString);
      if (payloadIsValid) resolve(JSON.parse(msg.payloadString));
      if (!payloadIsValid) reject("<MicrodropAsync>::Payload Invalid");
    }
    this.client.subscribe(topic);
  });
}

WebMixins.clearSubscriptions = function(timeout=2000) {
  // Remove all crossroad routes
  this.removeAllRoutes();

  // Unsubscribe to all previous messages:
  const unsubscribe = (prev=null) => {
    return new Promise((resolve, reject) => {
      this.client.unsubscribe("#",{
        onSuccess: () => {
          this.subscriptions = [];
          resolve(this.subscriptions);
        },
        onFailure: () => {
          reject(this.subscriptions);
        }
      });
    });
  };
  // Disconnect client:
  const disconnect = (prev=null) => {
    return new Promise((resolve, reject) => {
      this.client.onConnectionLost = () => {
        resolve(this.client.isConnected());
      }
      this.client.disconnect();
    });
  };
  // Reconnect client:
  const connect = (prev=null) => {
    return new Promise((resolve, reject) => {
      this.client.connect({
        onSuccess: () => {resolve(this.client.isConnected())},
        onFailure: () => {reject(this.client.isConnected())}
      });
    });
  };
  const makeRequest = async () => {
    await unsubscribe();
    await disconnect();
    await connect();
    return this.client;
  }

  return makeRequest();
}

module.exports = WebMixins;
