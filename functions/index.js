const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin"); // Admin SDK import

admin.initializeApp(); // Initialize Admin SDK

setGlobalOptions({maxInstances: 10});

exports.testAdmin = onRequest(async (req, res) => {
  try {
    const users = await admin.auth().listUsers(); // Fetch all users
    res.send(`Number of users in your project: ${users.users.length}`);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
});
