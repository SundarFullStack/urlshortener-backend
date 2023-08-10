const urlRouter = require("express").Router();
const shortid = require("shortid");
const URL = require("../models/url");

/**
 * FOR CREATING SHORTURL USING SHORTID
 * METHOD - POST
 * REQUEST - URL & EMAIL
 */

urlRouter.post("/url", async (req, res) => {
  const body = req.body;
  await URL.deleteMany({});
  if (!body.url) return res.json({ error: "url is required" });
  const shortId = shortid(8);
  await URL.create({
    shortId: shortId,
    redirectURL: body.url,
    visitHistory: [],
    userEmail: body.userEmail,
  });
  return res.json({ id: shortId });
});

/**
 * FOR FETCHING TOTAL CLICK COUNT FROM SHORTED URL DATA
 * METHOD - GET
 * REQUEST - SHORTURL
 * RESPONSE - TOTALCLICKS OF URL
 */

urlRouter.get("/:shortId", async (req, res) => {
  const shortid = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortid },
    { $push: { visitHistory: { timestamp: Date.now() } } }
  );
  res.redirect(entry.redirectURL);
});

urlRouter.get("/analytics/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
});

/**
 * FOR FETCHING SHORTED URL DATA
 * METHOD -GET
 * REQUEST - EMAIL
 * RESPONSE - SHOIRTEDURL(SHORTID)
 */

urlRouter.get("/urlData/:email", async (request, response, next) => {
  const { email } = request.params;
  // console.log(email);
  URL.find(
    {
      userEmail: email,
    },
    { shortId: 1, email: 1 }
  )
    .then((result) => {
      if (result) {
        // console.log(result);
        return response.status(200).json({
          success: true,
          message: "DATA FETCHED SUCCESSFULLY",
          Data: result,
        });
      }
    })
    .catch((error) => {
      if (error) {
        return response.status(401).json({
          success: false,
          message: "ERROR IN FETCHING DATA",
          Error: error,
        });
      }
    });
});

module.exports = urlRouter;
