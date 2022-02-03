const json_web_token = require("jsonwebtoken");

const sort_position_no = async (model) => {
  const all_data = await model.find({ is_active: true });
  for (let i = 0; i < all_data.length; i++) {
    all_data[i].position_no = all_data[i].position_no + 1;
    await all_data[i].save();
  }
};

const jwt_generator = (payload) => {
  const token = json_web_token.sign(payload, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_LIFE_TIME });
  const refresh_token = json_web_token.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_TOKEN_LIFE_TIME });
  return { token, refresh_token };
};
const jwt_generator_reset = (payload) => {
  const token = json_web_token.sign(payload, process.env.RESET_PWD_SECRET_KEY, { expiresIn: process.env.RESET_PWD_TOKEN_LIFE_TIME });
  return { token };
};

module.exports = { sort_position_no, jwt_generator, jwt_generator_reset };
