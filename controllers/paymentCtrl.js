const Stripe = require('stripe');
const libs = require('../libs/queries');
const db = require("../models/index");
const axios = require('axios');
require('dotenv').config();

const { stripe_key, base_url, image_baseUrl } = process.env;
const stripe = new Stripe(stripe_key);





const connectStripe = async (req, res) => {
  try {
    const userData = req.creds;
    const { id, profile_type, email, first_name, last_name, stripe_account_id, stripe_customer_id } = req.creds;
    console.log('--stripe_account_id---', stripe_account_id);
    // if (stripe_account_id) {
    //   return res.status(404).json({ code: 404, message: "stripe account is already connected" })
    // }
    if(!email){
      return res.status(400).json({ code: 400, message: "email is required to connect stripe account." })
    }
    let stripe_acc_id = stripe_account_id;

    if (!stripe_account_id) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      console.log("--Connected Account ID:---", account?.id);

      stripe_acc_id = account.id;

      const update_dt = {
        stripe_account_id: account.id,
        // stripe_enabled: 1,
      }
      const user = await libs.updateData(userData, update_dt)
    } else {

      const check_bank_account = await stripe.accounts.retrieve(stripe_acc_id);
      console.log("------capabilities------:", check_bank_account.capabilities);
      console.log("----Bank account data------:", check_bank_account.external_accounts.data);

      if (check_bank_account.external_accounts?.data?.length > 0 && (check_bank_account.capabilities.card_payments == 'active' && check_bank_account.capabilities.transfers == 'active')) {
        console.log("Bank account exists:", check_bank_account.external_accounts.data[0].id);

        const update_dt = {
          // stripe_account_id: account.id,
          stripe_enabled: '1',
        }
        const user = await libs.updateData(userData, update_dt)

        return res.status(400).json({ code: 400, message: "stripe account is already connected" })
      } else {
        console.log("No bank account added yet.");
      }
    }
    // Create customer if doesn't exist
    if (!stripe_customer_id) {
      const userName = `${first_name || ''} ${last_name || ''}`;
      const customer = await createStripeCustomer(userName, email, id);
      userData.stripe_customer_id = customer.id;
      await userData.save();
    }


    const accountLink = await stripe.accountLinks.create({
      account: stripe_acc_id, // This is the connected account ID
      refresh_url: `${base_url}/cancel`, // where to send user if they leave or fail
      return_url: `${base_url}/payment/stripeConnected`, // where to send user after completing
      type: 'account_onboarding',
    });

    return res.status(200).json({ code: 200, message: 'This link will expire in 5 minutes', data: accountLink.url });
  } catch (err) {
    console.error("Error in connectStripe >>", err?.message)
    console.error("----errr--------", err)
    res.status(500).json({ code: 500, message: 'Error creating account', error: err.message });
  }
};

//need to add stripe details in users database
const stripeConnected = async (req, res) => {
  try {
    res.render('stripeConnected');
  } catch (err) {
    console.error("Error in createStripeCustomer", err)
    res.status(500).json({ code: 500, message: 'Error creating customer', error: err.message });
  }
};


const createStripeCustomer = async (userName, email, id) => {
  try {
    if (!userName || !email || !id) {
      throw new Error("Missing required parameters: userName, email, or id");
    }
    const customer = await stripe.customers.create({
      email: email,
      name: userName,
      metadata: {
        user_id: id  // user'id database user.id
      }
    });
    return customer;
  } catch (err) {
    console.error("Error in createStripeCustomer", err)
    throw err;
  }
};


const add_card = async (req, res) => {
  try {
    const userData = req.creds
    const { id, email, first_name, stripe_account_id, stripe_customer_id } = req.creds;

    const { payment_token, card_number, exp_month, exp_year, cvc } = req.body;  //payment_token = 'tok_visa'
    console.log('-------req.body------', req.body);
    // if (!card_number || !exp_month || !exp_year || !cvc) {
    if (!payment_token) {
      return res.status(404).json({ code: 404, message: 'payment_token is req.' });
    }
    // Create customer if doesn't exist
    if (!stripe_customer_id) {
      const customer = await createStripeCustomer(first_name, email, id);
      userData.stripe_customer_id = customer.id;
      await userData.save();
    }
    // Check if card already exists for the customer
    const checkCardExist = await checkCardOfCustomer(userData.stripe_customer_id, payment_token);
    console.log('------checkCardExist----', checkCardExist.status);
    if (checkCardExist.status == false) {
      return res.status(404).json({ code: 404, message: checkCardExist.message });
    }
    const createCard = await stripe.customers.createSource(userData.stripe_customer_id, {
      source: payment_token,
    });

    // Save card to DB
    await libs.createData(db.userCards, {
      user_id: id,
      stripe_customer_id: userData.stripe_customer_id,
      stripe_card_id: createCard.id,
      brand: createCard.brand,
      last4: createCard.last4,
      exp_month: createCard.exp_month,
      exp_year: createCard.exp_year,
      is_default: false
    });

    return res.status(200).json({ code: 200, message: "Card added successfully", data: createCard, created_card_id: createCard.id });
  } catch (error) {
    console.error('Error in add_card:', error);
    res.status(500).json({ code: 500, message: 'Error creating customer', error: error.message });
  }
}


const checkCardOfCustomer = async (customerId, paymentToken) => {
  try {
    const token = await stripe.tokens.retrieve(paymentToken);
    const fingerprint = token.card.fingerprint;
    const addedCards = await stripe.customers.listSources(customerId, { object: 'card' });
    for (const card of addedCards.data) {
      if (card.fingerprint === fingerprint) {
        return {
          status: false,
          message: "This card detail is already added. Please use different card detail to add new card."
        }
      }
    }
    return { status: true, message: "Card checked successfully" };
  } catch (error) {
    console.error('Error attaching card:', error);
    return { status: false, data: error };
  }
};


const list_all_card = async (req, res) => {
  try {
    const userData = req.creds;

    // Create customer if doesn't exist
    if (!userData.stripe_customer_id) {
      const customer = await createStripeCustomer(userData.first_name, userData.email, userData.id);
      userData.stripe_customer_id = customer.id;
      await userData.save();
      return res.status(200).json({ code: 200, message: "Card not found", data: [] });
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userData.stripe_customer_id,
      type: 'card',
    });
    console.log("Customer Cards:", paymentMethods.data);
    res.status(200).json({ code: 200, message: "Get all cards", data: paymentMethods.data });
  } catch (error) {
    console.error('Error attaching card:', error);
    res.status(500).json({ code: 500, message: 'list_all_card err', error: error.message });
  }
};

const update_card = async (req, res) => {
  try {
    const { id, stripe_account_id, stripe_customer_id } = req.creds;
    const { name, card_id } = req.body;
    console.log('------req.body-----', req.body);
    console.log('------stripe_account_id-----', stripe_account_id);

    const customerSource = await stripe.customers.updateSource(
      // stripe_account_id,
      stripe_customer_id,
      card_id,
      { name: name, }
    );

    res.status(200).json({ code: 200, message: 'Card updated successfully', data: customerSource });

  } catch (err) {
    console.error('Error attaching default card:', err);
    res.status(500).json({ code: 500, message: 'Internal Server Error', error: err.message });
  }
};

const delete_card = async (req, res) => {
  try {
    const { id, stripe_account_id, stripe_customer_id } = req.creds;
    const { card_id } = req.body;
    console.log('------req.body-----', req.body);

    if (!card_id) {
      return res.status(404).json({ code: 404, message: "card_id is required" })
    }
    const customerSource = await stripe.customers.deleteSource(
      stripe_customer_id,
      card_id
    );

    res.status(200).json({ code: 200, message: 'Card updated successfully', data: customerSource });

  } catch (err) {
    console.error('Error attaching default card:', err);
    res.status(500).json({ code: 500, message: 'Internal Server Error', error: err.message });
  }
};

// const send_payment = async (req, res) => {
//   try {
//     const userData = req.creds;
//     const { amount, currency, card_id, description, capture = true, worker_id, booking_id } = req.body;

//     // Validate required fields
//     // if (!amount || !card_id || !worker_id || !booking_id) {
//     //   return res.status(404).json({ code: 404, message: 'amount,card_id,worker_id,booking_id are required fields' });
//     // }
//     // Create customer if doesn't exist
//     if (!userData.stripe_customer_id) {
//       const customer = await createStripeCustomer(userData.first_name, userData.email, userData.id);
//       userData.stripe_customer_id = customer.id;
//       await userData.save();
//     }
//     // Convert amount to cents/pence (Stripe uses smallest currency unit)
//     const amountInCents = Math.round(parseFloat(Number(amount)) * 100);

//     // Check if the card exists for this customer
//     try {
//       await stripe.customers.retrieveSource(userData.stripe_customer_id, card_id);
//     } catch (error) {
//       return res.status(404).json({ code: 404, message: 'Card not found for this customer' });
//     }

//     // Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: currency?.toLowerCase() || 'usd',
//       customer: userData.stripe_customer_id,
//       payment_method: card_id,
//       description: description || `Charge for ${userData.email}`,
//       confirm: true,
//       automatic_payment_methods: {
//         enabled: true,
//         allow_redirects: 'never', // 🔐 avoid UPI/wallets
//       },
//       metadata: {
//         user_id: userData.id,
//         user_email: userData.email
//       }
//     });

//     res.status(200).json({code:200,message:paymentIntent.status, data: paymentIntent });


//     // const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
//     // console.log('-------charge-----', charge);
//     // if (!charge.balance_transaction) {
//       // Wait and try again after 1 second
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       const chargeRetry = await stripe.charges.retrieve(paymentIntent.latest_charge);
//       const balanceTxn = await stripe.balanceTransactions.retrieve(chargeRetry.balance_transaction);
//       console.log('💰-----Fee:-----', balanceTxn);
//     // }

//     const history_dt = {
//       user_id: userData.id,
//       worker_id: worker_id || null,
//       booking_id: booking_id ||null,
//       amount: amount,
//       stripe_fee: balanceTxn.fee/100,
//       net_fee: balanceTxn.net/100,
//       currency: currency?.toLowerCase() || 'usd',
//       stripe_payment_intent_id: paymentIntent.id,
//       stripe_customer_id: userData.stripe_customer_id,
//       card_id: card_id,
//       status: paymentIntent.status,
//       description: description,
//       metadata: paymentIntent.metadata
//     }

//     // Create payment record in database
//     const paymentRecord = await libs.createData(db.payments, history_dt);

//     // let msg = null;
//     // Handle different payment intent statuses
//     // switch (paymentIntent.status) {
//     //   case 'succeeded':
//     //     msg = "Payment succeeded"
//     //     return res.status(200).json({
//     //       code: 200, message: 'Payment succeeded',
//     //       // data: paymentIntent 
//     //     });
//     //   case 'requires_action':
//     //     // msg= 'Payment requires additional action''
//     //     return res.status(200).json({
//     //       code: 200, message: 'Payment requires additional action',
//     //       // data: {
//     //       //   client_secret: paymentIntent.client_secret,
//     //       //   requires_action: true,
//     //       //   payment_intent_id: paymentIntent.id
//     //       // }
//     //     });
//     //   case 'requires_payment_method':
//     //     // msg= 'Payment failed. Please try another payment method';'Payment failed. Please try another payment method'
//     //     return res.status(400).json({
//     //       code: 400, message: 'Payment failed. Please try another payment method',
//     //       // data: paymentIntent
//     //     });
//     //   default:
//     //     return res.status(400).json({
//     //       code: 400, message: `Payment status: ${paymentIntent.status}`,
//     //       // data: paymentIntent
//     //     });
//     // }

//     // return res.status(200).json({ code: 200, message: 'Payment succeeded', data: paymentIntent });

//   } catch (error) {
//     console.error('Error in send_charge_payment:', error);

//     // Handle specific Stripe errors
//     if (error.type === 'StripeCardError') {
//       return res.status(400).json({ code: 400, message: error.message })
//     }

//     res.status(500).json({
//       code: 500,
//       message: 'Error processing payment',
//       error: error.message
//     });
//   }
// };


const send_payment = async (userData, data) => {
  try {
    const { amount, currency, card_id, description, capture = true, worker_id, booking_id,worker_name } = data;
    console.log('--------data-------', data);
    // Validate required fields
    // if (!amount || !card_id || !worker_id || !booking_id) {
    //   return res.status(404).json({ code: 404, message: 'amount,card_id,worker_id,booking_id are required fields' });
    // }
    // Create customer if doesn't exist
    if (!userData.stripe_customer_id) {
      const customer = await createStripeCustomer(userData.first_name, userData.email, userData.id);
      userData.stripe_customer_id = customer.id;
      await userData.save();
    }
    // Convert amount to cents/pence (Stripe uses smallest currency unit)
    const amountInCents = Math.round(parseFloat(Number(amount)) * 100);

    console.log('----amountInCents-----', amountInCents);
    // Check if the card exists for this customer
    try {
      await stripe.customers.retrieveSource(userData.stripe_customer_id, card_id);
    } catch (error) {
      return { code: 404, message: 'Card not found for this customer' };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency?.toLowerCase() || 'usd',
      customer: userData.stripe_customer_id,
      payment_method: card_id,
      description: description || `Charge by ${userData.email}. not yet transfer to ${worker_name}`,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // 🔐 avoid UPI/wallets
      },
      metadata: {
        user_id: userData.id,
        user_email: userData.email
      }
    });

    // const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    // console.log('-------charge-----', charge);
    // if (!charge.balance_transaction) {
    // Wait and try again after 1 second
    await new Promise(resolve => setTimeout(resolve, 2000));
    const chargeRetry = await stripe.charges.retrieve(paymentIntent.latest_charge);
    console.log('------chargeRetry:-----', chargeRetry);

    if (!chargeRetry.balance_transaction) { await new Promise(resolve => setTimeout(resolve, 1000)); }
    const balanceTxn = await stripe.balanceTransactions.retrieve(chargeRetry.balance_transaction);
    console.log('💰-----Fee:-----', balanceTxn);
    // }

    const history_dt = {
      user_id: userData.id,
      worker_id: worker_id || null,
      booking_id: booking_id || null,
      amount: amount,
      stripe_fee: balanceTxn.fee / 100,
      net_fee: balanceTxn.net / 100,
      currency: currency?.toLowerCase() || 'usd',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: userData.stripe_customer_id,
      card_id: card_id,
      status: paymentIntent.status,
      description: description || `Payment for ${worker_name}`,
      metadata: paymentIntent.metadata
    }

    // Create payment record in database
    const paymentRecord = await libs.createData(db.payments, history_dt);

    return { code: 200, message: paymentIntent.status, data: paymentIntent };

    // let msg = null;
    // Handle different payment intent statuses
    // switch (paymentIntent.status) {
    //   case 'succeeded':
    //     msg = "Payment succeeded"
    //     return res.status(200).json({
    //       code: 200, message: 'Payment succeeded',
    //       // data: paymentIntent 
    //     });
    //   case 'requires_action':
    //     // msg= 'Payment requires additional action''
    //     return res.status(200).json({
    //       code: 200, message: 'Payment requires additional action',
    //       // data: {
    //       //   client_secret: paymentIntent.client_secret,
    //       //   requires_action: true,
    //       //   payment_intent_id: paymentIntent.id
    //       // }
    //     });
    //   case 'requires_payment_method':
    //     // msg= 'Payment failed. Please try another payment method';'Payment failed. Please try another payment method'
    //     return res.status(400).json({
    //       code: 400, message: 'Payment failed. Please try another payment method',
    //       // data: paymentIntent
    //     });
    //   default:
    //     return res.status(400).json({
    //       code: 400, message: `Payment status: ${paymentIntent.status}`,
    //       // data: paymentIntent
    //     });
    // }

    // return res.status(200).json({ code: 200, message: 'Payment succeeded', data: paymentIntent });

  } catch (error) {
    console.error('Error in send_charge_payment:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return { code: 404, message: error.message }
    }
    return { code: 500, message: 'Error processing payment', error: error.message };
  }
};



const release_payment = async (getPayHistory, getWorker) => {
  try {
    const { id, user_id, worker_id, booking_id, net_fee, amount } = getPayHistory;  // net_fee: '96.8',
    const { stripe_account_id } = getWorker;
    // Convert amount to cents/pence (Stripe uses smallest currency unit)
    // const result = Number(net_fee) - (Number(net_fee) * 15 / 100);
    // console.log('-----result-------',result);
    // const amountInCents = Math.round(result * 100);

    // Calculate the amount after 15% deduction
    const result = Number(amount) * 0.85; // More accurate than subtracting 15%
    // const result = Number(amount) * 0.10; // More accurate than subtracting 90%
    console.log('--------result---------', result);
    // Round to nearest cent first, then convert to cents
    const amountInCents = Math.round(result * 100);

    console.log('---amountInCents worker_srtipe_acc_id---', amountInCents, stripe_account_id);

    // Ensure the amount is an integer (Stripe requirement)
    if (!Number.isInteger(amountInCents)) {
      return { code: 500, message: 'Amount must be an integer value in cents' };
    }

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: stripe_account_id,
      transfer_group: `booking_id_${booking_id}`,
      metadata: {
        booking_id,
        user_id: user_id,    // jobposter_id
        worker_id: worker_id
      }
    });
    console.log('----transfer-----', transfer);

    // Save to transfer_history
    await libs.createData(db.transfers, {
      worker_id: worker_id,
      booking_id: booking_id,
      stripe_transfer_id: transfer.id,
      amount: (transfer.amount / 100).toFixed(2),
      currency: transfer.currency,
      destination: transfer.destination,
      metadata: transfer.metadata
    });
    // getPayHistory.booking_status = 'Completed'
    // await getPayHistory.save();

    return { code: 200, message: "Payment transfer successfully", result: result }
  } catch (error) {
    console.error('Error in send_charge_payment:', error);
    return { code: 500, message: `Error: ${error.message}`, error: error.message };
  }
};




const loginStripeAccount = async (req, res) => {
  try {
    const { id, stripe_account_id } = req.creds;
    console.log("Entered into loginStripeAccount >>>", stripe_account_id, id);

    const STRIPE_CLIENT_REDIRECT_URL = process.env.STRIPE_CLIENT_REDIRECT_URL;
    const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;

    const stripeToken = await getSiteAccessToken(id);

    const loginUrl = `https://connect.stripe.com/oauth/authorize?client_id=${STRIPE_CLIENT_ID}&response_type=code&scope=read_write&redirect_uri=${STRIPE_CLIENT_REDIRECT_URL}&state=${stripeToken}`;

    const isConnected = stripe_account_id ? true : false;

    return res.status(200).json({
      status: 200,
      message: 'Link Generated successfully',
      stripe_link: loginUrl,
      is_connected: isConnected
    });
  } catch (err) {
    console.error("Error in loginStripeAccount >>", err)
    res.status(400).json({ code: 400, message: 'Something went wrong.', error: err.message });
  }
};
const getSiteAccessToken = async (userId) => {
  try {
    const stripeToken = 'Rakett' +
      Math.floor(Math.random() * 10) +
      Math.floor(Math.random() * 10) +
      Math.floor(Math.random() * 10) +
      Math.floor(Math.random() * 10) +
      Math.floor(Math.random() * 10);

    const userProfile = await libs.getData(db.users, {
      where: { id: userId }
    });

    if (userProfile) {

      let data = {
        stripe_token: stripeToken,
        stripe_enabled: 1
      }

      await libs.updateData(db.users,
        data,
        { where: { id: userId } });
    }
    return stripeToken;
  } catch (error) {
    console.error('Error generating site access token:', error);
    throw error;
  }
};
const disconnectStripe = async (req, res) => {
  try {
    const { id } = req.creds;

    const data = {
      stripe_enabled: 0,
      stripe_account_id: null,
      stripe_access_token: null,
      stripe_refresh_token: null,
      stripe_token: null
    }
    await libs.updateData(db.users, data, { where: { id: id } });

    return res.status(200).json({ status: 200, message: 'Stripe Disconnected successfully' });
  } catch (err) {
    console.error("Error in disconnectStripe >>", err)
    res.status(400).json({ code: 400, message: 'Something went wrong.', error: err.message });
  }
};



module.exports = {
  connectStripe, add_card, stripeConnected, list_all_card, update_card, delete_card, send_payment, loginStripeAccount, disconnectStripe, release_payment
};
