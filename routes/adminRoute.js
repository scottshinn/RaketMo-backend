const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');

const CONFIG = require('../config/scope')

const {upload,admin_auth} =require('../libs/commonFunc');

/* GET home page. */

// router.post('/admin/login', signupadminValid, adminCtrl.login )

router.get('/admin/termsAndConditions', adminCtrl.termsAndConditions);
router.get('/admin/privacyPolicy', adminCtrl.privacyPolicy);
router.get('/admin/aboutUs', adminCtrl.aboutUs);



router.get('/sessionData', (req,res)=>{
    res.status(200).json({sessionData:req.session.admin, cookieData: req.cookies});
    // res.status(200).json({data:req.session});
});

router.get('/admin/login', adminCtrl.getloginPage);
router.post('/admin/login', adminCtrl.login);

router.get('/admin/logout',admin_auth, adminCtrl.logout);

router.get('/admin/getChangePasswordPage',admin_auth, adminCtrl.getChangePasswordPage);
router.post('/admin/changePassword',  admin_auth, adminCtrl.changePassword);

// router.get('/admin/forgotPassword', adminCtrl.getForgotPswrdPage);
// router.post('/admin/forgotPassword', adminCtrl.forgotPassword);

router.get('/admin/renderProfile', admin_auth, adminCtrl.renderProfile);
router.get('/admin/getEditProfilePage',admin_auth, adminCtrl.getEditProfilePage);
router.post('/admin/editProfile',admin_auth, upload.single('profile_image'), adminCtrl.editProfile);

router.post('/admin/addCategory', adminCtrl.addCategory);
router.get('/admin/getCategories', adminCtrl.getCategories);
router.post('/admin/addReports', adminCtrl.addReports);

router.get('/admin/renderWorkers',admin_auth, adminCtrl.renderWorkers);
router.get('/admin/getAllWorkersJobs',admin_auth, adminCtrl.getAllWorkersJobs);

router.get('/admin/renderJobposters', admin_auth,  adminCtrl.renderJobposters);
router.get('/admin/getAllPostedJobs',   adminCtrl.getAllPostedJobs);    //admin_auth,

router.get('/admin/viewApplicants', admin_auth,  adminCtrl.viewApplicants);

router.get('/admin/renderReports', admin_auth,  adminCtrl.renderReports);

router.get('/admin/massPushPage', admin_auth,  adminCtrl.massPushPage); 
router.post('/admin/sendMassPush', admin_auth,  adminCtrl.sendMassPush);

router.get('/admin/enableDisableUser', admin_auth, adminCtrl.enableDisableUser);
router.get('/admin/enableDisableJob',  adminCtrl.enableDisableJob);

router.get('/admin/getSubscriptions', admin_auth, adminCtrl.getSubscriptions);

router.get('/admin/verifiedUsers', admin_auth, adminCtrl.verifiedUsers);

router.get('/admin/verificationRequest', admin_auth,  adminCtrl.verificationRequest);

router.get('/admin/get-requested-users', admin_auth,  adminCtrl.getRequestedUsers);

router.post('/admin/proof-accept-reject', admin_auth,  adminCtrl.proofAcceptReject);

router.post("/admin/testTwilio", adminCtrl.testTwilio);

router.post('/admin/addOrUpdateCategory', upload.single('category_icon'), adminCtrl.addOrUpdateCategory);









module.exports = router;
