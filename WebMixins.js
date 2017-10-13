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
      if (!payloadIsValid) {
        reject("<MicrodropAsync.Web>#newMessage Payload Invalid")};
    }
    this.client.subscribe(topic);
  });
}

WebMixins.clearSubscriptions = function(timeout=10000) {
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
          reject(
            [`<MicrodropAsync.Web>#clearSubscriptions Failed`,
              this.subscriptions]);
        }
      });
    });
  };
  // Disconnect client:
  const disconnect = (prev=null, timeout=10000) => {
    return new Promise((resolve, reject) => {
      this.client.onConnectionLost = () => {
        resolve(this.client.isConnected());
      }
      this.client.disconnect();
      setTimeout(()=>{
        reject(`<MicrodropAsync.Web>#disconnect Timeout (${timeout})`);
      }, timeout);
    });
  };
  // Reconnect client:
  const connect = (prev=null) => {
    return new Promise((resolve, reject) => {
      this.client.connect({
        onSuccess: () => {
          // Re-add client event bindings (removed after disconnect)
          this.client.onMessageArrived = this.onMessageArrived.bind(this);
          resolve(this.client.isConnected())
        },
        onFailure: () => {
          reject([`<MicrodropAsync.Web>#connect Failure`,
            this.client.isConnected()])}
      });
    });
  };
  const makeRequest = async () => {
    try {
      await unsubscribe();
      await disconnect();
      await connect();
    }catch(e) {
      throw([`<MicrodropAsync.Web>#clearSubscriptions Failure`, e ]);
    }
    return this.client;
  }

  return makeRequest();
}

module.exports = WebMixins;
