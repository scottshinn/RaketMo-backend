const FCM = require('fcm-push');
const {JWT} = require('google-auth-library')
const {google} = require('google-auth-library')
require('dotenv').config();
const apn = require('apn');
const admin = require('firebase-admin');
const serviceAccount = require('./rakett-27c73-firebase.json');
const axios = require('axios')
const path = require('path');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const sender = process.env.TWILIO_FROM;

const Twilioclient = twilio(accountSid, authToken);


// const sendNotifyToUser = async (data,deviceToken) => {
//     let fcm = new FCM(process.env.user_serverKey);
//     console.log('---------ToUser-deviceToken-------',deviceToken);

//     let message = {
//         to : deviceToken,
//         notification : {
//             title : data.title,
//             message : data.message,
//             pushType : data.pushType,
//             body : data,
//             sound : "default",
//             badge : 0,
//         },
//         data : data,
//         priority : 'high'
//     };
//     if(data.imageUrl){
//         message.notification.imageUrl= data.imageUrl
//     }

//     // if(data.booking_id || data.user_id){
//     //     message.notification.notificationData= data
//     // }

//     console.log("---------message usr---------",message)

//     fcm.send(message, function (err, result) {
//         if(err) {console.log("-----fcm err usr-------",err)}
//         else{console.log("-------fcm result usr----",result)}
//     });
// };


// Initialize the Firebase app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const SCOPES=['https://www.googleapis.com/auth/firebase.messaging'];
const client = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES
})
async function getAccessToken() {
  const tokens = await client.authorize();
  return tokens.access_token;
}

// notification: {
//   title : data.title,
//   body : data.message,
// },

// Function to send a push notification
const sendNotifyToUser = async (data,deviceToken) => {
  const token = await getAccessToken()
  const message = {
    message: {
      token: deviceToken,
      "data": {
        title : data.title || '',
        message : data.message || '',
        pushType : `${data.pushType || ''}`,
        imageUrl: data.imageUrl || '',
        sound : "default",
        room_id: `${data.room_id || ''}`,
        job_id: `${data.job_id || ''}`,
        other_user_id: `${data.other_user_id || ''}`,
        other_user_fullname: data.other_user_fullname || '',
        user_id: `${data.user_id || ''}`,
      }
    }
  };
  console.log('----message---------',message);
  
  axios.post(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, message, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(response => {
    console.log('Successfully sent message:', response.data);
  }).catch(error => {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    console.error('--------err--------:', error.response?.data?.error?.details);
  });
};


const sendNotifyTo_Ios = async (data,deviceToken) => {
    let options = {
        token: {
            key: __dirname+ "/AuthKey_UKSL4F7746.p8",
            keyId: "UKSL4F7746",
            teamId: "L4G67MKLRT"
        },
        // proxy: {
            // host: "192.168.10.92",
            // host: "161.97.132.85",
            // port: process.env.PORT
        // },
        production: true
    };
       
    let apnProvider = new apn.Provider(options);
    let note = new apn.Notification();
 
    // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    // note.badge = 3;
    note.sound = "ping.aiff";
    // note.alert = data.title;
    // note.alert = data.message;
    note.alert = {
        title: "",
        subtitle: data.title,
        body: data.message,
    }
    note.payload = data;
    note.topic = "com.raket.dharmainiapps";
    apnProvider.send(note, deviceToken).then((result) => {
        return console.log('---------res--------',JSON.stringify(result))
    })
};


const sendNotificationThroughTwilio = async (data, to) => {
  try {
    console.log("From", sender)
    console.log("To", to)
    console.log("Data", data)

    const title = data.title;
    const message = data.message;
    const body = `${title}\n${message}`;

    const response = await Twilioclient.messages.create({
      body,
      from: sender,
      to,
    });
    console.log('Twilio message SID:', response.sid);
    console.log(`Twilio Message Sent. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('Twilio Error:', error.message);
    if (error.code) console.error(`Twilio Code: ${error.code}`);
    throw error;
  }
};


// const fullMobileNumber = `${worker_job.worker.country_code}${worker_job.worker.mobile_number}`;
// if (fullMobileNumber) {
//   await Notify.sendNotificationThroughTwilio(data, fullMobileNumber);
// }


module.exports={sendNotifyToUser,sendNotifyTo_Ios, sendNotificationThroughTwilio};
