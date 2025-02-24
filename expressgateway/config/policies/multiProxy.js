module.exports = {
  name: "multiProxy",
  policy: (actionParams) => {
    return async (req, res, next) => {
      const axios = require("axios");
      const responseData = [];

      try {
        let urls = Object.values(actionParams);
        urls.pop();
        const newUrls = urls.map((url) => {
          return url.replace(
            /\/:([^/]+)/g,
            (_, paramName) =>
              `/${req.params[paramName]}` || `/${req.query[paramName]}` || ""
          );
        });
        const responses = await Promise.all(
          newUrls.map((url) => axios.get(url))
        );

        const responseData = responses.map((response) => response.data);

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json({ data: responseData });
      } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Failed to fetch data from services" });
      }
    };
  },
};
