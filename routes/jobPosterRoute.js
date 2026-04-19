const express = require('express');
const router = express.Router();
const jobPosterCtrl = require('../controllers/jobPosterCtrl');

const CONFIG = require('../config/scope')

const {signupUserValid,editJobPosterValid,sendMsgValid} = require('../config/joiValidations');

const {verify_token,upload} =require('../libs/commonFunc');

/* GET home page. */

router.get('/', (req,res)=>{
    res.render('success')
    // res.render('socketTest')
})
router.get('/cancel', (req,res)=>{
    console.log('------req.query-------',req.query);
    console.log('------req.body-------',req.body);
    res.render('error')
})

router.post('/user/signup',upload.single("profile_image"),jobPosterCtrl.signup)

// router.put('/user/editProfile',verify_token(CONFIG.SCOPE.users),upload.single("profile_image"),jobPosterCtrl.editProfile);
router.put('/user/editProfile',
    verify_token(CONFIG.SCOPE.users),
    upload.fields([
        {name:"profile_image",maxCount:1},
        {name:"work_imgs",maxCount:5},
        {name:"job_imgs",maxCount:6},
        {name:"work_video_thumbnail",maxCount:1},
        {name:"job_video_thumbnail",maxCount:1},
    ]),
    jobPosterCtrl.editProfile);

router.put('/user/completeProfile',
    verify_token(CONFIG.SCOPE.users),
    upload.fields([
        {name:"work_imgs",maxCount:5},
        {name:"job_imgs",maxCount:6},
        {name:"work_video_thumbnail",maxCount:1},
        {name:"job_video_thumbnail",maxCount:1},
    ]),
    jobPosterCtrl.completeProfile) 
    
router.get('/user/verifyEmail', jobPosterCtrl.verifyEmail)

router.post('/user/login', jobPosterCtrl.login);
router.post('/user/socialLogin', jobPosterCtrl.socialLogin);

router.get('/user/logout', verify_token(CONFIG.SCOPE.users),jobPosterCtrl.logout);

router.post('/user/changePassword',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.changePassword);
router.post('/user/forgotPassword',jobPosterCtrl.forgotPassword);
router.post('/user/deleteAccount',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteAccount);

router.post('/user/createRoom',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.createRoom);
router.post('/user/sendMessage',verify_token(CONFIG.SCOPE.users),upload.array("msg_img"),jobPosterCtrl.sendMessage);
router.post('/user/deleteRoom',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteRoom);
router.get('/user/getAllRooms',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getAllRooms);
router.get('/user/getAllMessages',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getAllMessages);
router.get('/user/is_seen',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.is_seen);


router.post('/user/blockUnblock',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.blockUnblock);
router.get('/user/myBlockList',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.myBlockList);
router.post('/user/rateNow',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.rateNow);
router.post('/user/update_location',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.update_location);
router.get('/user/reportsListing',jobPosterCtrl.reportsListing);
router.post('/user/report',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.report);
router.get('/user/categoriesListing',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.categoriesListing);
router.get('/user/getSheduledMetting',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getSheduledMetting);
router.get('/user/getAllNotifications',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getAllNotifications);
router.put('/user/deleteNotification',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteNotification);
router.get('/user/changeRole',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.changeRole);

router.get('/user/getMyProfile',
    verify_token(CONFIG.SCOPE.users),
    jobPosterCtrl.getMyProfile);

//from thi we will get both rating for jobposter and worker
router.get('/user/workerAllRating',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.workerAllRating);
router.post('/user/subscribe',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.subscribe);


router.post('/jobPoster/shareJob',verify_token(CONFIG.SCOPE.users),upload.array("msg_img"),jobPosterCtrl.shareJob);

router.post('/jobPoster/addJob',verify_token(CONFIG.SCOPE.users), upload.array("job_image"), jobPosterCtrl.addJob);
router.get('/jobPoster/myJobs',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.myJobs);
router.get('/jobPoster/jobDetail',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.jobDetail);
router.get('/jobPoster/deleteJob',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteJob);
router.put('/jobPoster/editJob',verify_token(CONFIG.SCOPE.users),upload.array("job_image"),jobPosterCtrl.editJob);
router.get('/jobPoster/viewApplicants',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.viewApplicants);
router.put('/jobPoster/updateApplicantStatus',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.updateApplicantStatus);
router.get('/jobPoster/viewProfile_PreviousWork',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.viewProfile_PreviousWork);
router.get('/jobPoster/checkAvailability',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.checkAvailability);
router.post('/jobPoster/sheduleMetting',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.sheduleMetting);
router.put('/jobPoster/editAppointment',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.editAppointment);
router.put('/jobPoster/deleteAppointment',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteAppointment);


router.get('/jobPoster/searchWorker',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.searchWorker);
router.post('/jobPoster/addRecentSearch',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.addRecentSearch);
router.get('/jobPoster/getRecentSearches',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getRecentSearches);
router.put('/jobPoster/deleteRecentSearch',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.deleteRecentSearch);

router.get('/jobPoster/findBothNearOrRecentWorkers',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.findBothNearOrRecentWorkers);
router.get('/jobPoster/findNearOrRecentWorkers',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.findNearOrRecentWorkers);
router.get('/jobPoster/getSubscribe',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getSubscribe);

router.get('/jobPoster/share_users_lisitng',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.share_users_lisitng);



router.post('/stripe/skip', verify_token(CONFIG.SCOPE.users),jobPosterCtrl.skipStripe);


// router.get('/jobPoster/get-Profile', verify_token(CONFIG.SCOPE.users), jobPosterCtrl.jobPosterProfile);

// router.put('/user/editProfile',verify_token(CONFIG.SCOPE.users),upload.single('profile_image'),jobPosterCtrl.editjobPosterProfile);

// router.put('/jobPoster/uploadIdAndDocuments',verify_token(CONFIG.SCOPE.users),upload.fields([{name:'id_image',maxCount:1},{name:'document_image',maxCount:1}]), jobPosterCtrl.uploadIdAndDocuments);

// router.get('/jobPoster/getAllProperties',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.getAllProperties);

// router.get('/jobPoster/getSingleProperty',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.getSingleProperty);

// router.get('/jobPoster/addRemove_Favourite',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.addRemove_Favourite);

// router.get('/jobPoster/getAllfavourites',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.getAllfavourites);

// router.get('/jobPoster/getAllNotifications',verify_token(CONFIG.SCOPE.users), jobPosterCtrl.getAllNotifications);

// router.post('/jobPoster/requestForBooking',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.requestForBooking);

// router.get('/jobPoster/pendingBookings',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.pendingBookings);

// router.get('/jobPoster/acceptedBookings',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.acceptedBookings);

// router.get('/jobPoster/bookingsDetail',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.bookingsDetail);


// router.get('/jobPoster/getAllMessages',verify_token(CONFIG.SCOPE.users),jobPosterCtrl.getAllMessages);





router.get('/user/accountDeletion',jobPosterCtrl.accountDeletion);
router.post('/user/sendOtp',jobPosterCtrl.sendOtp);

router.post('/user/account_Deletion',jobPosterCtrl.account_Deletion);









module.exports = router;


