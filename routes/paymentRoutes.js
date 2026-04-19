const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/paymentCtrl');
const { verify_token } = require('../libs/commonFunc');
const CONFIG = require('../config/scope')



// Stripe Api's

router.get('/payment/connect_stripe', verify_token(CONFIG.SCOPE.users),paymentCtrl.connectStripe);

router.get('/payment/stripeConnected', paymentCtrl.stripeConnected );

router.post('/payment/add_card',  verify_token(CONFIG.SCOPE.users), paymentCtrl.add_card );

router.get('/payment/list_all_card',  verify_token(CONFIG.SCOPE.users), paymentCtrl.list_all_card);

router.post('/payment/update_card',  verify_token(CONFIG.SCOPE.users), paymentCtrl.update_card);

router.post('/payment/delete_card',  verify_token(CONFIG.SCOPE.users), paymentCtrl.delete_card);

router.post('/payment/send_payment',  verify_token(CONFIG.SCOPE.users), paymentCtrl.send_payment);

router.get('/payment/disconnect_stripe',  verify_token(CONFIG.SCOPE.users), paymentCtrl.disconnectStripe );


router.get('/payment/stripe_login', verify_token(CONFIG.SCOPE.users),paymentCtrl.loginStripeAccount);










module.exports = router;