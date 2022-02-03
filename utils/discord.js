const axios = require("axios");
const url = process.env.DISCORD_WEBHOOKS_URL;

const discord_bot = ({ username = "error bot express mongo utility", error, req = null }) => {
  let body = null;
  let user = null;
  let route = null;
  if (req) {
    body = req.body;
    user = req.user;
    route = req.url;
  }
  const content = `
    route =>${route}
    error message =>${error.message}
    body =>${JSON.stringify(body)}
    user =>${JSON.stringify(user)}
    ${error}`;
  axios.post(url, {
    username,
    content: `
        ---------------------------------
        There is an error 👉 👉 ${content}`,
  });
};

module.exports = discord_bot;
