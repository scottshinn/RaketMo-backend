const libs = require('./queries');
const ERROR = require('../config/responseMsgs').ERROR;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
require('dotenv').config()
const Models = require("../models/index");
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs =require('fs');

const { paypal_mode, paypal_client_id, paypal_secret_key } = process.env;

const generateAccessToken = async (saveData, token_info, secret_key) => {
  try {
    let tokenPayload = { id: token_info.id };

    if (token_info.email) { tokenPayload.email = token_info.email }
    if (token_info.mobile_number) { tokenPayload.mobile_number = token_info.mobile_number }

    console.log('-----------tokenPayload-----------', tokenPayload);
    const gen_token = jwt.sign(tokenPayload, secret_key);
    console.log('-----------gen_token-----------', gen_token);

    let update = { access_token: gen_token };

    if (token_info.device_token) { update.device_token = token_info.device_token }
    if (token_info.device_type) { update.device_type = token_info.device_type };
    if (token_info.profile_type) { update.profile_type = token_info.profile_type };

    // console.log('---------saveData----------', saveData);

    let updatedData = await libs.setData(saveData, update);
    return updatedData;
  } catch (err) {
    console.log('-----token-err----', err);
    throw err;
  }
};


const verify_token = (scope) => {
  return async (req, res, next) => {
    try {
      let secretKey = null;
      let model = null;

      if (scope == 'users') { model = Models.users, secretKey = process.env.user_secretKey }
      // if (scope == 'drivers') { model = Models.drivers, secretKey = process.env.driver_secretKey }

      let token = req.headers.authorization;
      if (!token) return ERROR.TOKEN_REQUIRED(res);

      const decoded = jwt.verify(token, secretKey);
      console.log('------decoded-------', decoded);

      if (decoded) {
        const creds = await libs.getData(model, { where: { access_token: token } });
        if (creds) {
          req.creds = creds;
          next();
        } else { return ERROR.UNAUTHORIZED(res) }
      } else { return ERROR.INVALID_TOKEN(res); }
    } catch (err) {
      return ERROR.ERROR_OCCURRED(res, err)
    }
  }
}


const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw error;
  }
}

const compPassword = async (password, dbPassword) => {
  try {
    return await bcrypt.compare(password, dbPassword);
  } catch (err) {
    throw err
  }
}


const send_mail = (data) => {
  console.log('--------send_mail data-------', data);
  const transporter = nodeMailer.createTransport({
    // host: "gmail",
    // port: 587,
    // secure: false,
    // requireTLS: true,
    host: 'send.smtp.com', 
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false // Only use this if your SMTP uses a self-signed certificate
    }
    // auth: {
    //   user: '',
    //   pass: ''
    // },
  });

  const mailData = {
    from: "support@rakett.app",  
    to: data.email,
    subject: data.subject
  }
  // console.log('-------data mail-------',data);
  if (data.html) { mailData.html = data.html }
  if (data.text) { mailData.text = data.text }

  transporter.sendMail(mailData, function (error, info) {
    if (error) {
      console.log("-------error-------", error)
    } else {
      console.log('-----Email-sent----' + info.response);
      res.status(200).json({
        "success": 1,
        "code": 200,
        "message": "Mail sent successfully to given email",
        "body": { 'Email sent': info.response }
      });
    }
  });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public', 'uploads');
    
    // ✅ Ensure './public/uploads' exists
    console.log('----------uploadPath-------',uploadPath);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    console.log('----------uploadPath2-------',uploadPath);

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1000)}${file.originalname}`;
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage: storage });


const admin_auth = async (req, res, next) => {
  // console.log('------------req.session-------------',req.session);
  // console.log('------------admin-------------',req.session.admin);
  // console.log('------------role-------------',req.session.role);
  if (req.session && req.session.role == 'admin') {
    const verify = await libs.getData(Models.admins, { where: { id: req.session.admin.id } });
    if (verify) {
      return next();
    };
  } else {
    return res.redirect('/admin/login');
  }
};

const baseUrl = 'https://api-m.sandbox.paypal.com'

const generatePaypalToken = async () => {
  try {
    if (!paypal_client_id || !paypal_secret_key) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      paypal_client_id + ":" + paypal_secret_key,
    ).toString("base64");

    const response = await axios.post(`${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
    );

    // console.log('---------response.data---------',response.data.token.access_token);
    console.log('---------generatePaypalToken---------', response.data.access_token);
    // const dt = response.json();
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error.data);
  }
};

const createOrder = async () => {
  const paypalToken = await generatePaypalToken();
  const url = `${baseUrl}/v2/checkout/orders`
  const response = await axios(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${paypalToken}`
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: "100.00"
        }
      }]
    })
  })
  const data = await response.json();
  console.log('-------createOrder---------', data);
  return data
}


const capturePayment = async (orderId) => {
  const paypalToken = await generatePaypalToken();
  const url = `${baseUrl}/v2/checkout/orders/${orderId}/capture`
  const response = await axios(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${paypalToken}`
    }
  })
  const data = await response.json();
  console.log('-------data-------', data);
  return data;
}

// const generatePaypalToken = async () => {
//   try {
//     if (!paypal_client_id || !paypal_secret_key) {
//       throw new Error("MISSING_API_CREDENTIALS");
//     }
//     const auth = Buffer.from(
//       paypal_client_id + ":" + paypal_secret_key,
//     ).toString("base64");

//     const response = await axios({
//       url:`https://api-m.sandbox.paypal.com/v1/oauth2/token`,
//       method:"post",
//       data:'grant_type=client_credentials',
//       auth:{
//         username:paypal_client_id,
//         password:paypal_secret_key
//       }
//     })

//     console.log('------------auth-------------',auth);
//     return response.data
//   } catch (error) {
//     console.error("Failed to generate Access Token:", error.data);
//   }
// };


module.exports = {
  generateAccessToken, verify_token, securePassword, compPassword, send_mail, upload, admin_auth, generatePaypalToken, capturePayment, createOrder
}
