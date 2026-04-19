// const express = require("express");
// const router = express.Router();

// router.use(require("./workerRoute"));
// router.use(require("./jobPosterRoute"));
// router.use(require("./adminRoute"));
// router.use(require("./paymentRoutes"));

// module.exports = router;

module.exports={
    workerRoute: require('./workerRoute'),
    jobPosterRoute: require('./jobPosterRoute'),
    adminRoute: require('./adminRoute'),
    paymentRoutes: require('./paymentRoutes'),
}
