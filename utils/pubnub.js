const PubNub = require("pubnub");

let pubnub = null;

const onStatus = (s, channel) => {
  if (s.category === "PNConnectedCategory") {
    console.log("Status: SUCCESS, Channel: " + channel);
  } else {
    console.log("Status: Failed, Channel: " + channel);
    console.log("Response: ", s);
  }
};

module.exports = {
  listen: (channel) => {
    if (pubnub) throw new Error("pubnub not registered correctly");
    if (!channel) throw new Error(channel + " required");
    return (callback) => {
      pubnub.subscribe({ channels: [channel] });
      pubnub.addListener({
        message: (response) => {
          if (response.channel !== channel) return;
          callback({ response, channel, payload: response.message });
        },
        status: (s) => onStatus(s, channel),
      });
      console.log("Listen Running, Pubnub Channel: " + channel);
    };
  },
  publish: (channel) => (message) => {
    if (pubnub) throw new Error("pubnub not registered correctly");
    pubnub.publish({ channel, message }, function (status, response) {
      if (status.error) {
        console.log(status, response, channel);
      }
    });
  },
  initPubnub: ({ PUBLISHKEY, SUBSCRIBEKEY, UUID }) => {
    pubnub = new PubNub({
      publishKey: PUBLISHKEY,
      subscribeKey: SUBSCRIBEKEY,
      uuid: UUID,
    });
  },
};
