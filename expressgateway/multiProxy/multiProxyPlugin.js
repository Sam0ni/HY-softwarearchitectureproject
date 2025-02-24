module.exports = {
  version: "0.0.1",
  policies: ["multiProxy"],
  init: function (pluginContext) {
    let policy = require("../config/policies/multiProxy");
    pluginContext.registerPolicy(policy);
  },
};
