const express = require('express');
const router = express.Router();
const workerCtrl = require('../controllers/workerCtrl');

const CONFIG = require('../config/scope')
const {WorkerAppliedJobsValid} = require('../config/joiValidations');

const {verify_token,upload} =require('../libs/commonFunc');

/* GET home page. */

router.get('/', (req,res)=>{
    res.render('success')
    // res.render('socketTest')
})
router.get('/cancel', (req,res)=>{
    res.render('error')
})
 
// 0 = not uploaded, 1 = uploaded, 2 = accept, 3 = reject

router.post('/worker/identityProof',
    verify_token(CONFIG.SCOPE.users),
    upload.single("identity_proof"),
    workerCtrl.identityProof);

router.post('/worker/skipIdentityProof',
  verify_token(CONFIG.SCOPE.users),
  workerCtrl.skipIdentityProof
);

router.get('/worker/getAllJobs',verify_token(CONFIG.SCOPE.users),workerCtrl.getAllJobs);

router.post('/worker/applyJob',verify_token(CONFIG.SCOPE.users),workerCtrl.applyJob);
router.get('/worker/getMyAppliedJob',verify_token(CONFIG.SCOPE.users), workerCtrl.getMyAppliedJob);
// router.get('/worker/viewApplicantProfile',verify_token(CONFIG.SCOPE.users),workerCtrl.viewApplicantProfile);
router.get('/worker/viewJobPoster_PreviousWork',verify_token(CONFIG.SCOPE.users),workerCtrl.viewJobPoster_PreviousWork);
router.get('/worker/jobPosterAllRating',verify_token(CONFIG.SCOPE.users),workerCtrl.jobPosterAllRating);
router.post('/worker/addAvailability',verify_token(CONFIG.SCOPE.users),workerCtrl.addAvailability);
router.put('/worker/editAvailability',verify_token(CONFIG.SCOPE.users),workerCtrl.editAvailability);
router.put('/worker/acceptDeclined',verify_token(CONFIG.SCOPE.users),workerCtrl.acceptDeclined);
router.put('/worker/dislikeJob',verify_token(CONFIG.SCOPE.users),workerCtrl.dislikeJob);
router.post('/worker/subscribe',verify_token(CONFIG.SCOPE.users),workerCtrl.subscribe);
router.post('/worker/subscribeTopUser',verify_token(CONFIG.SCOPE.users),workerCtrl.subscribeTopUser);

router.get('/worker/getSubscribe',verify_token(CONFIG.SCOPE.users),workerCtrl.getSubscribe);

router.get('/worker/jobDetail',verify_token(CONFIG.SCOPE.users),workerCtrl.jobDetail);

// router.post('/worker/applieJob',verify_token(CONFIG.SCOPE.users),workerCtrl.applieJob);

router.put('/worker/toggleRole', verify_token(CONFIG.SCOPE.users), workerCtrl.toggleRole);


router.post('/worker/completeJobFromWorker', verify_token(CONFIG.SCOPE.users), workerCtrl.completeJobFromWorker);




module.exports = router;