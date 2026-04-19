const db = require("../models/index");
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
require('dotenv').config();
const CONFIG = require('../config/scope');
const fs = require('fs');
const Notify = require('../libs/notifications');
const { Op, where } = require('sequelize');
const path = require('path');
const axios = require('axios');
const Stripe = require('stripe');
const paymentCtrl = require('./paymentCtrl');
const adminCtrl = require('./adminCtrl');
const { generateJobSummaryPDF } = require('../libs/pdf');

const { stripe_key, base_url, user_secretKey, image_baseUrl } = process.env;
const stripe = new Stripe(stripe_key);



// const {paypal_mode,paypal_client_id,paypal_secret_key,base_url,paypal_baseUrl}= process.env
// paypal.configure({
//   'mode': paypal_mode,
//   'client_id':paypal_client_id,
//   'client_secret':paypal_secret_key,
// })

// const signup = async (req, res) => {
//   try {
//     console.log('-----------req.body---------', req.body);
//     const { first_name, last_name, zip_code, yelp_account, username, country_code, mobile_number, email, password, experience_years, category_id, payment, profile_type, device_type, device_token } = req.body;

//     let profile_goal = req.body.profile_goal ? req.body.profile_goal : null;

//     if (!first_name && !last_name && !zip_code && !email && !password && !profile_type) {
//       return res.status(404).json({ "code": 404, "message": "first_name,last_name,zip_code,country_code,email,password,profile_type are required" })
//     }

//     const checkEmail = await libs.getData(db.users, { where: { email: email.toLowerCase(), deleted_at: null } });
//     if (checkEmail) {
//       return res.status(400).json({ "code": 400, "message": "Email is already registered" })
//     }

//     if(country_code && mobile_number){
//       const getMobile = await libs.getData(db.users, { where: { mobile_number: mobile_number, deleted_at: null } });
//       if (getMobile) {
//         if (getMobile.country_code != country_code) {
//           return res.status(400).json({ "code": 400, "message": "Invalid Mobile Number Format" })
//         }
//         return res.status(400).json({ "code": 400, "message": "Mobile number is already registered" })
//       }
//     }

//     const data = {
//       first_name: first_name,
//       last_name: last_name,
//       password: await commonFunc.securePassword(password),
//       zip_code: zip_code,
//       // yelp_account: yelp_account,
//       email: email,
//       profile_type: profile_type,
//       profile_goal: profile_goal
//     };

//     if(country_code && mobile_number){
//       data.country_code = country_code
//       data.mobile_number = mobile_number
//     }

//     // if (username?.trim()) { 
//     //   const getUsername = await libs.getData(db.users, {
//     //     where:{username: username}
//     //   });

//     //   if(getUsername){
//     //     return ERROR.USER_NAME_ALREADY_EXIST(res);
//     //   }
//     //   data.username = username
//     // }

//     if (req.file) {
//       data.profile_image = req.file.filename
//     }
//     if (experience_years) { data.experience_years = experience_years }
//     if (category_id) { data.category_id = category_id }
//     if (payment) { data.payment = payment }
//     if (device_type) { data.device_type = device_type }
//     if (device_token) { data.device_token = device_token }

//     const saveData = await libs.createData(db.users, data);
//     const token_info = { id: saveData.id, mobile_number: saveData.mobile_number, email: saveData.email };
//     const token = await commonFunc.generateAccessToken(saveData, token_info, user_secretKey);

//     const mailData = {
//       email: token.email,
//       subject: 'For account verification'
//     }
//     mailData.html = `<!DOCTYPE html><html><head><title>Raketmo</title></head><body><table style="width:70%;margin:auto"><tr style="background:linear-gradient(45deg,#7822a0,#3e55af);text-align:center"><td style="padding:10px 0px;color:gold">Raketmo</td></tr><tr><td style="font-size:20px;font-weight:600;color:#000;padding-top:20px">Hello ${saveData.first_name} ${saveData.last_name || ""}</td></tr><tr><td style="font-size:15px;font-weight:300;color:#000;padding-top:20px">For Account Verification</td></tr><tr><td style="font-size:18px;font-weight:500;color:#a5a5a5;padding-bottom:30px" aria-hidden="true" role="text">Email: ${mailData.email}</td></tr><tr><td>Verify your mail by clicking this Verify button:<a style="background:linear-gradient(45deg,#7822a0,#3e55af);border-radius:3px;color:#fff;text-decoration:none;padding:10px 40px" href="${base_url}/user/verifyEmail?access_token=${token.access_token}">Verify</a></td></tr><tr><td style="border-bottom:1px solid #c5c5c5;padding-bottom:30px"></td></tr><tr><td id="responseMessage" style="font-size:16px;font-weight:400;color:#000;padding-top:20px;"></td></tr><tr><td style="text-align:center;color:#000;font-size:20px;font-weight:600;padding-top:30px">Raketmo</td></tr><tr><td style="text-align:center;color:#a5a5a5;font-size:18px;font-weight:500;padding-top:10px">@ ${new Date(Date.now()).getFullYear()} Raketmo Email. All Rights Reserved</td></tr></table></body></html>`;

//     commonFunc.send_mail(mailData);
//     if (token.profile_image) {
//       token.profile_image = `${image_baseUrl}${token.profile_image}`;
//     };
//     return SUCCESS.DEFAULT(res, "Signup successfully,Please check your mail for verification link", token)
//   } catch (err) {
//     console.log('-----er------', err);
//     if (req.file) { fs.unlink(req.file.path, (err) => { if (err) return }) }
//     ERROR.ERROR_OCCURRED(res, err);
//   }
// };

const signup = async (req, res) => {
  try {
    console.log('-----------req.body---------', req.body);
    const { first_name, email, password, profile_type } = req.body;

    if (!first_name || !email || !password || !profile_type) {
      return res.status(400).json({
        code: 400,
        message: "first_name, email, password, and profile_type are required"
      });
    }

    const nameParts = first_name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || null;

    const checkEmail = await libs.getData(db.users, { where: { email: email.toLowerCase(), deleted_at: null } });
    if (checkEmail) {
      return res.status(400).json({ code: 400, message: "Email is already registered" });
    }

    const data = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: await commonFunc.securePassword(password),
      profile_type
    };

    const saveData = await libs.createData(db.users, data);
    const token_info = { id: saveData.id, email: saveData.email };
    const token = await commonFunc.generateAccessToken(saveData, token_info, user_secretKey);

    const mailData = {
      email: token.email,
      subject: 'For account verification'
    }
    mailData.html = `<!DOCTYPE html><html><head><title>Raketmo</title></head><body><table style="width:70%;margin:auto"><tr style="background:linear-gradient(45deg,#7822a0,#3e55af);text-align:center"><td style="padding:10px 0px;color:gold">Raketmo</td></tr><tr><td style="font-size:20px;font-weight:600;color:#000;padding-top:20px">Hello ${saveData.first_name} ${saveData.last_name || ""}</td></tr><tr><td style="font-size:15px;font-weight:300;color:#000;padding-top:20px">For Account Verification</td></tr><tr><td style="font-size:18px;font-weight:500;color:#a5a5a5;padding-bottom:30px" aria-hidden="true" role="text">Email: ${mailData.email}</td></tr><tr><td>Verify your mail by clicking this Verify button:<a style="background:linear-gradient(45deg,#7822a0,#3e55af);border-radius:3px;color:#fff;text-decoration:none;padding:10px 40px" href="${base_url}/user/verifyEmail?access_token=${token.access_token}">Verify</a></td></tr><tr><td style="border-bottom:1px solid #c5c5c5;padding-bottom:30px"></td></tr><tr><td id="responseMessage" style="font-size:16px;font-weight:400;color:#000;padding-top:20px;"></td></tr><tr><td style="text-align:center;color:#000;font-size:20px;font-weight:600;padding-top:30px">Raketmo</td></tr><tr><td style="text-align:center;color:#a5a5a5;font-size:18px;font-weight:500;padding-top:10px">@ ${new Date(Date.now()).getFullYear()} Raketmo Email. All Rights Reserved</td></tr></table></body></html>`;
    commonFunc.send_mail(mailData);

    return SUCCESS.DEFAULT(res, "Signup successfully,Please check your mail for verification link", token)

  } catch (err) {
    console.error('-----Error in Signup------', err);
    ERROR.ERROR_OCCURRED(res, err);
  }
};

// const editProfile = async (req, res) => {
//   try {
//     console.log('-----------req.body---------', req.body);
//     console.log('-----------req.files---------', req.files);
//     const { first_name, last_name, username, zip_code, yelp_account, experience_years, category_id, payment, country_code, mobile_number, longitude, latitude, address,skills,delete_imgs } = req.body;
//     const { id } = req.creds;

//     if (!first_name && !last_name && !username && !zip_code && !experience_years && !category_id && !payment && !req.file) {
//       return res.status(404).json({ "code": 404, "message": "first_name,last_name,zip_code,country_code,mobile_number,email,password profile_image atleast one is required" })
//     }
//     const data = {};

//     // if (username) { 
//     //   const getUsername = await libs.getData(db.users, {where:{
//     //     id: {[Op.not]: id}, username: username,
//     //   }});
//     //   if(getUsername){
//     //     return ERROR.USER_NAME_ALREADY_EXIST(res);
//     //   }
//     //   data.username = username 
//     // }

//     if (first_name) { data.first_name = first_name }
//     if (last_name) { data.last_name = last_name }
//     if (zip_code) { data.zip_code = zip_code }
//     // if (yelp_account) { data.yelp_account = yelp_account }
//     if (experience_years) { data.experience_years = Number(experience_years) }
//     if (category_id) { data.category_id = Number(category_id) }
//     if (payment) { data.payment = payment }
//     if (longitude) { data.longitude = Number(longitude) }
//     if (latitude) { data.latitude = Number(latitude) }
//     if (address) { data.address = address }
//     if (skills) { data.skills = skills }


//     console.log('-----------req.body---------', req.body);
//     if (req.files?.profile_image) {
//       data.profile_image = req.files.profile_image[0].filename
//     }
//     if (mobile_number) {
//       const getMobile = await libs.getData(db.users, { where: { id: { [Op.not]: id }, mobile_number: mobile_number, deleted_at: null } });
//       if (getMobile) {
//         if (getMobile.country_code != country_code) {
//           return res.status(400).json({ "code": 400, "message": "Invalid Mobile Number Format" })
//         }
//         return res.status(400).json({ "code": 400, "message": "Mobile number is already registered" })
//       }
//       data.country_code = country_code
//       data.mobile_number = mobile_number
//     }

//     console.log('------data-----', data);

//     const updatedata = await libs.updateData(req.creds, data);
//     if (updatedata.profile_image) {
//       updatedata.profile_image = `${process.env.image_baseUrl}${updatedata.profile_image}`;
//     };

//     if(delete_imgs){
//       const delete_imgs_ids = delete_imgs.split(',');
//       delete_imgs_ids?.forEach(async x=>{
//         await libs.destroyData(db.user_imgs,{where:{id: x}});
//       })
//     }

//     if (req.files?.work_imgs?.length) {
//       req.files?.work_imgs?.forEach(async x=>{
//         await libs.createData(db.user_imgs,{user_id: id,img: x.filename})
//       })
//     }


//     return SUCCESS.DEFAULT(res, "Profile updated successfully", updatedata)
//   } catch (err) {
//     console.log('-----er------', err);
//     if (req.file) { fs.unlink(req.file.path, (err) => { if (err) return }) }
//     ERROR.ERROR_OCCURRED(res, err);
//   }
// };

const editProfile = async (req, res) => {
  try {
    console.log('-----------req.body---------', req.body);
    console.log('-----------req.files---------', req.files);


    const workImg = (req.files?.work_imgs || []).map(file => file.filename);
    const jobImgs = (req.files?.job_imgs || []).map(file => file.filename);
    let work_video_thumbnail = (req.files?.work_video_thumbnail || []).map(file => file.filename);
    let job_video_thumbnail = (req.files?.job_video_thumbnail || []).map(file => file.filename);

    const {
      first_name, last_name, username, zip_code, yelp_account, experience_years, category_id, payment, longitude, latitude, address, skills, delete_imgs, user_introduction,
    } = req.body;

    let available_time_slots = req.body.available_time_slots || null;
    let projects_and_media_link = req.body.projects_and_media_link || null;
    let projects_and_media_case_study = req.body.projects_and_media_case_study || null;

    const { id } = req.creds;

    if (!first_name && !last_name && !username && !zip_code && !experience_years && !category_id && !payment && !req.file) {
      return res.status(404).json({
        code: 404,
        message: "first_name, last_name, zip_code, profile_image — at least one is required"
      });
    }

    const data = {};

    if (first_name) data.first_name = first_name;
    if (last_name) data.last_name = last_name;
    if (zip_code) data.zip_code = zip_code;
    if (experience_years) data.experience_years = Number(experience_years);
    if (payment) data.payment = payment;
    if (longitude) data.longitude = Number(longitude);
    if (latitude) data.latitude = Number(latitude);
    if (address) data.address = address;
    // if (available_time_slots) data.available_time_slots = available_time_slots;
    // if (projects_and_media_link) data.projects_and_media_link = projects_and_media_link;
    // if (projects_and_media_case_study) data.projects_and_media_case_study = projects_and_media_case_study;
    data.projects_and_media_link = projects_and_media_link || '';
    data.projects_and_media_case_study = projects_and_media_case_study || '';
    // if (work_video_thumbnail) data.work_video_thumbnail = work_video_thumbnail;
    // if (job_video_thumbnail) data.job_video_thumbnail = job_video_thumbnail;
    if (work_video_thumbnail.length) data.work_video_thumbnail = work_video_thumbnail.join(',');
    if (job_video_thumbnail.length) data.job_video_thumbnail = job_video_thumbnail.join(',');
    if (user_introduction) data.user_introduction = user_introduction;

    // ✅ Save category_id as comma-separated string
    if (category_id) {
      data.category_id = Array.isArray(category_id) ? category_id.join(',') : category_id;
    }

    // ✅ Save skills as comma-separated string
    if (skills) {
      data.skills = Array.isArray(skills)
        ? skills.join(',')
        : skills;
    }

    if (available_time_slots) {
      data.available_time_slots = Array.isArray(available_time_slots)
        ? available_time_slots.join(',')
        : (typeof available_time_slots === 'string' ? available_time_slots : '');
    }

    if (req.files?.profile_image) {
      data.profile_image = req.files.profile_image[0].filename;
    }

    // if (mobile_number) {
    //   const getMobile = await libs.getData(db.users, {
    //     where: {
    //       id: { [Op.not]: id },
    //       mobile_number: mobile_number,
    //       deleted_at: null
    //     }
    //   });

    //   if (getMobile) {
    //     if (getMobile.country_code !== country_code) {
    //       return res.status(400).json({
    //         code: 400,
    //         message: "Invalid Mobile Number Format"
    //       });
    //     }
    //     return res.status(400).json({
    //       code: 400,
    //       message: "Mobile number is already registered"
    //     });
    //   }

    //   data.country_code = country_code;
    //   data.mobile_number = mobile_number;
    // }else{
    //   data.country_code = null;
    //   data.mobile_number = null;
    // }

    console.log('------data-----', data);

    // ✅ Perform update
    const updatedata = await libs.updateData(req.creds, data);

    if (updatedata.profile_image) {
      updatedata.profile_image = `${process.env.image_baseUrl}${updatedata.profile_image}`;
    }

    if (updatedata.work_video_thumbnail) {
      updatedata.work_video_thumbnail = `${process.env.image_baseUrl}${updatedata.work_video_thumbnail}`;
    }

    if (updatedata.job_video_thumbnail) {
      updatedata.job_video_thumbnail = `${process.env.image_baseUrl}${updatedata.job_video_thumbnail}`;
    }

    // Delete selected work images
    if (delete_imgs) {
      const delete_imgs_ids = delete_imgs.split(',');
      for (const imgId of delete_imgs_ids) {
        await libs.destroyData(db.user_imgs, { where: { id: imgId } });
      }
    }

    if (req.body.delete_job_imgs) {
      const deleteJobImgIds = req.body.delete_job_imgs.split(',');
      for (const imgId of deleteJobImgIds) {
        await libs.destroyData(db.media_and_projects, { where: { id: imgId } });
      }
    }

    // Upload new work images
    if (workImg?.length) {
      for (const x of workImg) {
        await libs.createData(db.user_imgs, { user_id: id, img: x });
      }
    }

    if (jobImgs?.length) {
      for (const x of jobImgs) {
        await libs.createData(db.media_and_projects, { user_id: id, image: x });
      }
    }

    updatedata.category_id = updatedata.category_id?.toString();
    updatedata.skills = updatedata.skills?.toString();

    // ✅ Don't split category_id or skills — keep as string
    return SUCCESS.DEFAULT(res, "Profile updated successfully", updatedata);

  } catch (err) {
    console.log('-----er------', err);
    if (req.file) fs.unlink(req.file.path, () => { });
    ERROR.ERROR_OCCURRED(res, err);
  }
};

const completeProfile = async (req, res) => {
  try {
    console.log('-----------req.body---------', req.body);
    console.log('-----------req.files---------', req.files);

    const workImg = (req.files?.work_imgs || []).map(file => file.filename);
    const jobImgs = (req.files?.job_imgs || []).map(file => file.filename);
    let work_video_thumbnail = (req.files?.work_video_thumbnail || []).map(file => file.filename);
    let job_video_thumbnail = (req.files?.job_video_thumbnail || []).map(file => file.filename);

    const { experience_years, category_id, payment, longitude, latitude, address, skills, user_introduction } = req.body;
    const { id } = req.creds;

    let available_time_slots = req.body.available_time_slots || null;
    let projects_and_media_link = req.body.projects_and_media_link || null;
    let projects_and_media_case_study = req.body.projects_and_media_case_study || null;

    if (!experience_years || !category_id || !longitude || !latitude || !address) {
      return res.status(404).json({
        code: 404,
        message: "experience_years, category_id, longitude, latitude, and address are required"
      });
    }

    // Ensure category_id and skills are saved as comma-separated strings
    const formattedSkills = Array.isArray(skills)
      ? skills.join(',')                       // e.g., ['Node', 'React'] → "Node,React"
      : (typeof skills === 'string' ? skills : '');

    const formattedCategory = Array.isArray(category_id)
      ? category_id.join(',')                  // e.g., [1,2] → "1,2"
      : (typeof category_id === 'string' ? category_id : '');

    const formattedTimeSlots = Array.isArray(available_time_slots)
      ? available_time_slots.join(',')         // e.g., ['9:00', '10:00'] → "9:00,10:00"
      : (typeof available_time_slots === 'string' ? available_time_slots : '');

    const data = {
      isProfileCompleted: '1',
      experience_years: Number(experience_years),
      payment,
      longitude,
      latitude,
      address,
      category_id: formattedCategory,
      skills: formattedSkills,
      available_time_slots: formattedTimeSlots,
      projects_and_media_link: projects_and_media_link,
      projects_and_media_case_study: projects_and_media_case_study,
      work_video_thumbnail: work_video_thumbnail?.length ? work_video_thumbnail[0] : null,
      job_video_thumbnail: job_video_thumbnail?.length ? job_video_thumbnail[0] : null,
      user_introduction: user_introduction || null
    };

    const updatedata = await libs.updateData(req.creds, data);

    // Format profile_image URL
    if (updatedata.profile_image) {
      updatedata.profile_image = `${image_baseUrl}${updatedata.profile_image}`;
    }
    if (updatedata.work_video_thumbnail) {
      updatedata.work_video_thumbnail = `${image_baseUrl}${updatedata.work_video_thumbnail}`;
    }
    if (updatedata.job_video_thumbnail) {
      updatedata.job_video_thumbnail = `${image_baseUrl}${updatedata.job_video_thumbnail}`;
    }

    console.log("req.workImg", workImg)
    console.log("req.jobImgs", jobImgs)

    // Save profile images if any
    if (workImg?.length) {
      for (const file of workImg) {
        await libs.createData(db.user_imgs, { user_id: id, img: file });
      }
    }

    if (jobImgs?.length) {
      for (const file of jobImgs) {
        await libs.createData(db.media_and_projects, { user_id: id, image: file });
      }
    }

    // Format category_id and skills as comma-separated in response (even if stored that way)
    updatedata.category_id = updatedata.category_id?.toString();
    updatedata.skills = updatedata.skills?.toString();

    return SUCCESS.DEFAULT(res, "Data updated successfully", updatedata);
  } catch (err) {
    console.log('-----er------', err);
    if (req.file) fs.unlink(req.file.path, () => { });
    ERROR.ERROR_OCCURRED(res, err);
  }
};

// const completeProfile = async (req, res) => {
//   try {
//     console.log('-----------req.body---------', req.body);
//     console.log('-----------req.files---------', req.files);
//     const { experience_years, category_id, payment, longitude, latitude, address,skills } = req.body;
//     const {id} = req.creds;

//     if (!experience_years || !category_id|| !longitude || !latitude || !address) {
//       return res.status(404).json({ "code": 404, "message": "experience_years,category_id,longitude,latitude,address are required" })
//     }

//     const data = {
//       isProfileCompleted: '1',
//     };

//     if (experience_years) { data.experience_years = Number(experience_years) }
//     if (category_id) { data.category_id = Number(category_id) }
//     if (payment) { data.payment = payment }
//     if (longitude) { data.longitude = longitude }
//     if (latitude) { data.latitude = latitude }
//     if (address) { data.address = address }
//     if (skills) { data.skills = skills }

//     const updatedata = await libs.updateData(req.creds, data);

//     if (updatedata.profile_image) {
//       updatedata.profile_image = `${process.env.image_baseUrl}${updatedata.profile_image}`;
//     };
//     if(req.files?.length){
//       req.files?.forEach(async x=>{
//         await libs.createData(db.user_imgs,{user_id: id, img: x.filename})
//       })
//     }


//     return SUCCESS.DEFAULT(res, "Data updated successfully", updatedata)
//   } catch (err) {
//     console.log('-----er------', err);
//     if (req.file) { fs.unlink(req.file.path, (err) => { if (err) return }) }
//     ERROR.ERROR_OCCURRED(res, err);
//   }
// };

const verifyEmail = async (req, res) => {
  try {
    let getEmail = await libs.getData(db.users, { where: { access_token: req.query.access_token } });
    console.log('------------getEmail---------', getEmail);
    if (getEmail) {
      const updateVerify = await libs.updateData(db.users, { is_verified: 1 }, { where: { email: getEmail.email } });
      console.log('--------updateVerify-------', updateVerify);
      return res.render('success')
    }
    res.status(404).send('<h3>Token not found</h3>');
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err)
  }
};

const login = async (req, res) => {
  try {
    const { email, password, profile_type, device_type, device_token } = req.body;
    console.log('---------req.body------', req.body);
    if (!email || !password) return res.status(400).json({ code: 400, message: "email & password is required" });

    const getData = await libs.getData(db.users, { where: { email: email.toLowerCase(), deleted_at: null } });
    console.log('---------getData------', JSON.parse(JSON.stringify(getData)));

    // if (getData && getData.profile_type != profile_type) {
    //   return res.status(400).json({ code: 400, message: `This Email is already registered with ${getData.profile_type} flow` })
    // }

    if (getData) {
      if (getData.social_id) {
        let msg__ = getData.social_token == '0' ? 'google' : 'apple'
        return res.status(400).json({ code: 400, message: `This account is register using ${msg__} login` })
      }
      if (getData.is_verified == 0) {
        const mailData = {
          email: getData.email,
          subject: 'For account verification'
        }

        mailData.html = `<!DOCTYPE html><html><head><title>Raketmo</title></head><body><table style="width:70%;margin:auto"><tr style="background:linear-gradient(45deg,#7822a0,#3e55af);text-align:center"><td style="padding:10px 0px;color:gold">Raketmo</td></tr><tr><td style="font-size:20px;font-weight:600;color:#000;padding-top:20px">Hello ${getData.first_name} ${getData.last_name || ""}</td></tr><tr><td style="font-size:15px;font-weight:300;color:#000;padding-top:20px">For Account Verification</td></tr><tr><td style="font-size:18px;font-weight:500;color:#a5a5a5;padding-bottom:30px" aria-hidden="true" role="text">Email: ${mailData.email}</td></tr><tr><td>Verify your mail by clicking this Verify button:<a style="background:linear-gradient(45deg,#7822a0,#3e55af);border-radius:3px;color:#fff;text-decoration:none;padding:10px 40px" href="${base_url}/user/verifyEmail?access_token=${getData.access_token}">Verify</a></td></tr><tr><td style="border-bottom:1px solid #c5c5c5;padding-bottom:30px"></td></tr><tr><td id="responseMessage" style="font-size:16px;font-weight:400;color:#000;padding-top:20px;"></td></tr><tr><td style="text-align:center;color:#000;font-size:20px;font-weight:600;padding-top:30px">Raketmo</td></tr><tr><td style="text-align:center;color:#a5a5a5;font-size:18px;font-weight:500;padding-top:10px">@ ${new Date(Date.now()).getFullYear()} Raketmo Email. All Rights Reserved</td></tr></table></body></html>`;

        commonFunc.send_mail(mailData);
        return res.status(400).json({ code: 400, message: "Please verify your email address to log in." })
      }
      if (getData.action == "Disable") {
        return res.status(400).json({ code: 400, message: "Your account has been disabled by admin" })
      }
      // if (!getData.mobile_number) {
      //   return res.status(400).json({ code: 400, message: "Please verify your email to login" })
      // }

      const comparePassword = await commonFunc.compPassword(password, getData.password);
      console.log('---------comparePassword-------', comparePassword);
      if (!comparePassword) {
        if (password != getData.password) {
          return res.status(400).json({ code: 400, message: "Invalid Credentials" })
        }
      }
      let token_info = { id: getData.id };
      if (email) { token_info.email = email }
      if (getData.mobile_number) { token_info.mobile_number = getData.mobile_number }
      if (device_type) { token_info.device_type = device_type }
      if (device_token) { token_info.device_token = device_token }
      if (profile_type) { token_info.profile_type = profile_type }

      const token = await commonFunc.generateAccessToken(getData, token_info, user_secretKey);

      if (token.profile_image) {
        token.profile_image = `${image_baseUrl}${token.profile_image}`;
      };
      // console.log('------------token------------',token);
      return SUCCESS.DEFAULT(res, "logged in successfully", token);
    }
    else {
      res.status(404).json({ code: 404, message: "This email does't exist" })
    }
  } catch (err) {
    console.log('---------loginerr----------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err)
  }
};

const socialLogin = async (req, res) => {
  try {
    console.log('-----------socialLogin req.body---------', req.body);
    const { social_id, social_token, first_name, last_name, zip_code, yelp_account, country_code, mobile_number, email, password, experience_years, category_id, profile_image, profile_type, device_type, device_token } = req.body;

    if (social_token == '0') {    // '0' for google
      if (!email) {
        return res.status(404).json({ "code": 404, "message": "email,social_token and profile_type are required" })
      }
    }
    if (social_token == '1') {    //  '1' for apple
      if (!social_id) {
        return res.status(404).json({ "code": 404, "message": "social_id,social_token and profile_type are required" })
      }
    }
    if (email) {
      const getData = await libs.getData(db.users, { where: { email: email, deleted_at: null } });
      if (getData && !getData.social_id) {
        return res.status(400).json({ "code": 400, "message": "This email is already register. Please login using gmail & password" })
      }
    }
    if (social_id && social_token == '0') {   // '0' for google, '1' for apple
      const getData = await libs.getData(db.users, { where: { email: email, social_token: social_token, deleted_at: null } });
      console.log('------social_token 0------', social_token);

      if (getData) {
        // if (getData.profile_type != profile_type) {
        //   return res.status(400).json({ code: 400, message: `This Email is already registered with ${getData.profile_type} flow` })
        // }
        if (getData.action == "Disable") {
          return res.status(400).json({ code: 400, message: "Your account has been disabled by admin" })
        }
        const token_info = { id: getData.id, social_token: social_token };
        if (email) { token_info.email = email }
        if (profile_type) { token_info.profile_type = profile_type }
        if (device_type) { token_info.device_type = device_type }
        if (device_token) { token_info.device_token = device_token }

        const token = await commonFunc.generateAccessToken(getData, token_info, user_secretKey);

        return res.status(200).json({ "code": 200, "message": "login successfully", data: token })
      }
    }
    if (social_id && social_token == '1') {  // '0' for google, '1' for apple
      console.log('------social_token------', social_token);
      const getData = await libs.getData(db.users, { where: { social_token: social_token, social_id: social_id, deleted_at: null } });
      if (getData) {
        if (getData.action == "Disable") {
          return res.status(400).json({ code: 400, message: "Your account has been disabled by admin" })
        }
        // if (getData.profile_type != profile_type) {
        //   return res.status(400).json({ code: 400, message: `This Email is already registered with ${getData.profile_type} flow` })
        // }
        const token_info = { id: getData.id, social_token: social_token };
        if (social_id) { token_info.social_id = social_id }
        if (profile_type) { token_info.profile_type = profile_type }

        if (device_type) { token_info.device_type = device_type }
        if (device_token) { token_info.device_token = device_token }
        const token = await commonFunc.generateAccessToken(getData, token_info, user_secretKey);

        return res.status(200).json({ "code": 200, "message": "login successfully", data: token })
      }
    }

    const data = {
      social_token: social_token,
      social_id: social_id,
      // email: email,
    };
    const getDeletedData = await libs.getData(db.users, { where: { social_token: social_token, social_id: social_id } });
    if (getDeletedData) {
      data.first_name = getDeletedData.first_name
      data.last_name = getDeletedData.last_name
      data.email = getDeletedData.email
    }

    if (first_name) { data.first_name = first_name }
    if (last_name) { data.last_name = last_name }
    if (password) { data.password = await commonFunc.securePassword(password) }
    if (zip_code) { data.zip_code = zip_code }
    // if (yelp_account) { data.yelp_account = yelp_account }
    if (country_code) { data.country_code = country_code }
    if (mobile_number) { data.mobile_number = mobile_number }
    if (email) { data.email = email }
    if (profile_type) { data.profile_type = profile_type }
    if (profile_image) { data.profile_image = profile_image }

    if (experience_years) { data.experience_years = experience_years }
    if (category_id) { data.category_id = category_id }
    if (device_type) { data.device_type = device_type }
    if (device_token) { data.device_token = device_token }
    data.is_verified = 1

    const saveData = await libs.createData(db.users, data);

    const token_info = { id: saveData.id, social_token: social_token };
    if (social_id) { token_info.social_id = social_id }

    const token = await commonFunc.generateAccessToken(saveData, token_info, user_secretKey);
    return res.status(200).json({ "code": 200, "message": "login successfully", data: token })
  } catch (err) {
    console.log('---------loginerr----------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err)
  }
};

const logout = async (req, res) => {
  try {
    await libs.updateData(req.creds, { access_token: null, device_token: null });
    return res.status(200).json({ code: 200, message: "User logged out successfully" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log('---------req.body---------', req.body);
    const email = req.body.email;
    const getData = await libs.getData(db.users, { where: { email: email.toLowerCase(), deleted_at: null } })
    if (!getData) {
      return res.status(404).json({ code: 404, message: "Mail not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const data = {
      email: email,
      subject: "Forgot password mail",
      text: `Your password is: ${otp}`,
    }
    commonFunc.send_mail(data);
    const hashPassword = await commonFunc.securePassword(otp);
    const passwordSaved = await libs.updateData(db.users, { password: hashPassword }, { where: { email: email } });

    if (passwordSaved[0] == 0) {
      return res.status(404).json({ code: 404, message: "Mail not found" });
    }
    return res.status(200).json({ code: 200, message: "Password sent to the mail" });
  } catch (err) {
    console.log('-------err---------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log('-----req.body------', req.body);
    const { password } = req.creds;
    console.log('-----req.creds----', req.creds);
    const passwordMatches = await commonFunc.compPassword(oldPassword, req.creds.password);

    if (!passwordMatches) {
      if (password != oldPassword) {
        return res.status(400).json({ code: 400, message: "Entered password is incorrect." });
      }
    }
    if (oldPassword == newPassword) {
      return res.status(400).json({ code: 400, message: "Current password and New password cannot be same" });
    }

    if (newPassword != confirmPassword) {
      return res.status(400).json({ code: 400, message: "New password cannot be the same as current password" });
    }

    const newhashPassword = await commonFunc.securePassword(newPassword);

    await libs.updateData(req.creds, { password: newhashPassword });

    return res.status(200).json({ code: 200, message: "Password changed successfully" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;    // "JobPoster","Worker"
    console.log('-----id------', id);
    // const deleteAccount = await libs.updateData(db.users,{deleted_at: new Date(Date.now())},{where:{id: req.creds.id}});

    const getData = await libs.getData(db.booking_jobs, { where: { [Op.or]: [{ job_poster_id: id }, { worker_id: id }], booking_status: "Hired" } });
    if (getData) {
      console.log('-------getData-------', JSON.parse(JSON.stringify(getData)));
      return res.status(400).json({ code: 404, message: "You cannot delete your account yet" })
    }
    const deleteAccount = await libs.updateData(req.creds, { deleted_at: new Date(Date.now()) });
    if (deleteAccount[0] == 0) {
      return res.status(404).json({ code: 404, message: "Account not found" });
    }

    const deleteBookings = await libs.updateData(db.booking_jobs, { deleted_at: new Date(Date.now()) }, {
      where: { [Op.or]: [{ job_poster_id: id }, { worker_id: id }] },
    });
    if (profile_type == 'JobPoster') {
      const deleteJobs = await libs.updateData(db.jobs, { deleted_at: new Date(Date.now()) }, { where: { job_poster_id: id } });
    }
    const deleteAppointments = await libs.updateData(db.appointments, { deleted_at: new Date(Date.now()) }, {
      where: { [Op.or]: [{ job_poster_id: id }, { worker_id: id }] },
    });
    const deleteReports = await libs.updateData(db.reports, { deleted_at: new Date(Date.now()) }, {
      where: { [Op.or]: [{ report_by: id }, { report_to: id }] },
    });
    const deleteRooms = await libs.updateData(db.rooms, { deleted_at: new Date(Date.now()) }, {
      where: { [Op.or]: [{ created_by: id }, { created_to: id }] },
    });


    const deleteBlocks = await libs.updateData(db.blocks, { deleted_at: new Date(Date.now()) }, {
      where: { [Op.or]: [{ blocked_by: id }, { blocked_user: id }] },
    });

    const deleteRecent = await libs.destroyData(db.recents, {
      where: { user_id: id },
    });

    return res.status(200).json({ code: 200, message: "Account deleted successfully" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const sendMassJobPush = async (job_data) => {
  try {
    const { title, description, job_id, longitude, latitude } = job_data;

    const getUsers = await libs.getAllData(db.users, {
      where: {
        device_token: { [Op.ne]: null },
        deleted_at: null,
        profile_type: "Worker"
      },
      attributes: ['id', 'profile_type', 'longitude', 'latitude', 'device_type', 'device_token', [
        db.sequelize.literal(`3959 * acos(
        cos(radians(${latitude})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${longitude})) +
        sin(radians(${latitude})) *
        sin(radians(latitude))
      )`), "distance"]],
      having: db.sequelize.literal("distance <= 100"),
      order: [db.sequelize.literal("distance ASC")]
    });
    console.log('--------getUsers------', JSON.parse(JSON.stringify(getUsers)));

    const data = {
      title: title,
      message: description,
      pushType: '10',
      imageUrl: 'logo.png'
    }
    if (job_id) {
      data.job_id = job_id
    }

    for (let key of getUsers) {

      data.imageUrl = 'logo.png'
      let user_dt = { user_id: key.id, ...data }

      await libs.createData(db.notifications, user_dt);
      await libs.updateData(db.users, { notify_count: db.sequelize.literal('notify_count +1') }, { where: { id: key.id } });

      data.imageUrl = `${image_baseUrl}${data.imageUrl}`

      if (key.device_type == "Android") {
        Notify.sendNotifyToUser(data, key.device_token)
      } else {
        // data.message = data.title
        Notify.sendNotifyTo_Ios(data, key.device_token);
        data.message = data.message
      }
    }
    return { code: 200, message: "Notification sent to all users" }
  } catch (err) {
    console.log('------err------', err);
    return { code: 500, message: "Something went wrong to sent notification" }
  }
};


const addJob = async (req, res) => {
  try {
    const { title, longitude, latitude, address, category_id, description, price, min_bids, max_bids, is_bids_more, jobs_date, jobs_time } = req.body;
    const { id, isSubscription } = req.creds;
    console.log('----req.body-----', req.body);
    console.log('----req.files-----', req.files);
    if (!title || !longitude || !latitude || !address || !category_id || !description || !jobs_date) {
      return res.status(404).json({ code: 404, message: "title,longitude,latitude,address,category_id,description,jobs_date are required" });
    }

    const getSubscription = await libs.getData(db.subscriptions, {
      where: { user_id: id, subscription_type: 'subscription_1' },
      attributes: ['id', 'plan_type', 'start_date', 'expire_date']
    });

    let check_pl = false;
    if (getSubscription && getSubscription.plan_type === 'paid' && getSubscription.expire_date < new Date(Date.now())) {
      check_pl = true;
      getSubscription.plan_type = 'free';
      await getSubscription.save();
    }

    // if (!getSubscription || (getSubscription && getSubscription.plan_type == 'free') || check_pl) {
    //   if (isSubscription == '1') {
    //     await libs.updateData(req.creds, { isSubscription: '0' })
    //   }
    //   const today = new Date(Date.now());
    //   today.setHours(0, 0, 0, 0);

    //   const getTodaysPosted = await libs.getAllData(db.jobs, {
    //     where: { job_poster_id: id, created_at: { [Op.gte]: today } },
    //     // attributes:['id','plan_type','start_date','expire_date']
    //   });
    //   if (getTodaysPosted?.length) {
    //     return res.status(400).json({ code: 400, message: "You are on free plan, you can only post 1 job/day" });
    //   }
    // }

    const formattedCategory = Array.isArray(category_id)
      ? category_id.join(',')                  // e.g., [1,2] → "1,2"
      : (typeof category_id === 'string' ? category_id : '');

    const data = {
      title: title,
      longitude: longitude,
      latitude: latitude,
      address: address,
      category_id: formattedCategory,
      description: description,
      // price: price,
      min_bids: min_bids,
      max_bids: max_bids,
      is_bids_more: is_bids_more,
      jobs_date: jobs_date,
      jobs_time: jobs_time,
      job_poster_id: id
    }
    const save_job = await libs.createData(db.jobs, data);
    if (req.files) {
      req.files.forEach(async (img, index) => {
        await libs.createData(db.job_images, { job_image: img.filename, job_id: save_job.id })
      })

      sendMassJobPush({
        title: data.title,
        description: data.description,
        job_id: save_job.id,
        longitude,
        latitude
      });

    } else {
      await libs.updateData(save_job, { deleted_at: new Date(Date.now()) })
    }

    return res.status(200).json({ code: 200, message: "Job added successfully" });
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const myJobs = async (req, res) => {
  try {
    const { id } = req.creds;

    let { page, itemsPerPage } = req.query;
    page = Number(page) || 1;
    itemsPerPage = Number(itemsPerPage) || 10;
    const offset = (page - 1) * Number(itemsPerPage);

    let getJob = await libs.getAllData(db.jobs, {
      where: { job_poster_id: id, deleted_at: null },
      // attributes:['id','title','price'],
      include: [{
        model: db.job_images,
        attributes: ['id',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
        ],
        // limit:1,
        // required:true
        // }, {
        //   model: db.categories,
        //   attributes: ['category'],
      }],
      limit: itemsPerPage,
      offset: offset || 0,
      order: [["created_at", "DESC"]]
    });

    if (getJob) {
      getJob = JSON.parse(JSON.stringify(getJob));

      for (let job of getJob) {
        const categoryIds = job.category_id?.split(',').map(id => Number(id.trim())) || [];

        const categories = await libs.getAllData(db.categories, {
          where: { id: categoryIds },
          attributes: ['category'],
          raw: true
        });
        job.category = {
          category: categories.map(cat => cat.category).join(', ')
        };
      }
      //  getJob = getJob?.map(job => ({
      //   ...job.dataValues,
      //   category: job.category.category,
      //   job_images: job.job_images?.map(image => image.job_image),
      // }));
      return res.status(200).json({ code: 200, message: "My all Jobs", getJob: getJob });
    } else {
      return res.status(404).json({ code: 404, message: "No data found", getJob: getJob })
    }
  } catch (err) {
    console.log('-----err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const jobDetail = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const { job_id } = req.query;
    console.log('--------job_id-------', job_id);
    if (!job_id) { return res.status(400).json({ code: 400, message: "job_id is required" }) }

    const getJob = await libs.getData(db.jobs, {
      where: { id: Number(job_id), deleted_at: null },
      include: [
        //   {
        //   model: db.categories,
        //   attributes: ['category'],
        // }, 
        {
          model: db.job_images,
          attributes: ['id',
            [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image']
          ],
        }]
    });

    if (!getJob) {
      return res.status(404).json({ code: 404, message: "No data found", data: null })
    }
    const get_job = JSON.parse(JSON.stringify(getJob));

    const categoryIds = get_job.category_id?.split(',').map(id => Number(id.trim()))
      .filter(id => !isNaN(id));

    let categories = [];
    if (categoryIds && categoryIds.length) {
      const getCategories = await db.categories.findAll({
        where: { id: categoryIds },
        attributes: ['id', 'category'],
      });
      categories = getCategories.map(cat => cat.category);
    }
    get_job.categories = categories.join(', ');

    // get_job.category = get_job?.category?.category
    // get_job.job_images = get_job?.job_images?.map(x => x.job_image);
    // get worker booking detail

    const getWorkerDetail = await libs.getData(db.booking_jobs, {
      where: {
        job_id: Number(job_id),
        booking_status: ["Applied", "Hired", "Completed"],
      },
      attributes: ['worker_id', 'booking_status', 'bid_amount'],
      include: {
        model: db.users,
        as: 'worker',
        attributes: ['first_name', 'last_name', 'email', 'overall_rating',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',profile_image)`), 'profile_image']
        ]
      }
    })

    return res.status(200).json({
      code: 200,
      message: "Get single Job",
      data: get_job,
      getWorkerDetail: getWorkerDetail
    });
  } catch (err) {
    console.log('-----err-----------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteJob = async (req, res) => {
  try {
    const { job_id } = req.query;
    console.log('--------job_id------', job_id);
    if (!job_id) { return res.status(400).json({ code: 400, message: "job_id is required" }) }

    const deleteJob = await libs.updateData(db.jobs, { deleted_at: new Date(Date.now()) }, { where: { id: job_id } })
    console.log('--------deleteJob--------', deleteJob);
    return res.status(200).json({ code: 200, message: "Job deleted successfully" });
  } catch (err) {
    console.log('-----err-----------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const editJob = async (req, res) => {
  try {
    // const { job_id, job_img_id } = req.query;
    console.log('--------req.query------', req.query);
    console.log('--------req.body------', req.body);
    console.log('--------req.files------', req.files);

    const { title, longitude, latitude, address, category_id, description, job_id, job_img_id, price, min_bids, max_bids, is_bids_more, jobs_date, jobs_time } = req.body;

    if (!job_id) { return res.status(400).json({ code: 400, message: "job_id is required" }) }
    // edit job details

    const updateData = {}
    if (title) { updateData.title = title }
    if (longitude && latitude && address) {
      updateData.longitude = longitude;
      updateData.latitude = latitude;
      updateData.address = address
    }
    if (category_id) {
      const formattedCategory = Array.isArray(category_id)
        ? category_id.join(',')
        : String(category_id);
      updateData.category_id = formattedCategory;
    }
    if (description) { updateData.description = description }
    // if(price){updateData.price = price}
    if (min_bids) { updateData.min_bids = min_bids }
    if (max_bids) { updateData.max_bids = max_bids }
    if (is_bids_more) { updateData.is_bids_more = is_bids_more }
    if (jobs_date) { updateData.jobs_date = jobs_date }
    if (jobs_time) { updateData.jobs_time = jobs_time }

    await libs.findAndUpdate(db.jobs, job_id, updateData);

    const img_id = job_img_id?.split(',')

    if (img_id && img_id != '') {
      const getJobImgs = await libs.getAllData(db.job_images, {
        where: {
          job_id: job_id,
          id: { [Op.or]: img_id }
        }
      });

      getJobImgs?.forEach(async (img) => {
        console.log('-----img------', img);
        fs.unlink(`public/uploads/${img.job_image}`, (err) => {
          if (err) {
            console.log('-----fs err------', err);
            return
          }
        })
        await libs.destroyData(img)
      })
    }
    if (req.files?.length) {
      req.files.forEach(async (img, index) => {
        await libs.createData(db.job_images, { job_image: img.filename, job_id: job_id })
      })
    }
    return res.status(200).json({ code: 200, message: "Job updated successfully" });
  } catch (err) {
    console.log('-----err-----------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, room_id, message, msg_type } = req.body;    //msg_img
    const { id, profile_type, profile_image, first_name, last_name } = req.creds;

    console.log('---------req.body---------', req.body);
    console.log('---------req.files---------', req.files);

    if (!receiver_id || !room_id || (!message && !req.files)) {
      return res.status(404).json({ code: 404, message: "receiver_id,room_id,message are required" });
    }
    const get_block = await libs.getData(db.blocks, {
      where: { [Op.or]: [{ blocked_by: id, blocked_user: receiver_id }, { blocked_by: receiver_id, blocked_user: id }] }
    },
    )
    console.log('-------get_block-------', get_block?.toJSON());
    if (get_block) {
      return res.status(400).json({ code: 400, message: "Cannot send message" });
    }
    const data = {
      sender_id: id,
      receiver_id: receiver_id,
      room_id: room_id,
      msg_type: msg_type || 1
      // sender_type:  // "JobPoster" || "Worker"
    }
    if (message) { data.message = message }
    const saveData = await libs.createData(db.chats, data);

    if (req.files) {
      await Promise.all(req.files?.map(async (img) => {
        await libs.createData(db.chat_images, { chat_id: saveData.id, msg_img: img.filename })
      }))
    }
    let getChatData = await libs.getData(db.chats, {
      where: { id: saveData.id },
      attributes: { exclude: ["sender_id", "receiver_id"] },
      include: [{
        model: db.users,
        as: 'sender',
        attributes: ['id', 'first_name', 'last_name', [
          db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', sender.profile_image)`), 'profile_image'],
        ]
      }, {
        model: db.users,
        as: 'receiver',
        attributes: ['id', 'first_name', 'last_name', [
          db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', receiver.profile_image)`), 'profile_image']],
      }, {
        model: db.chat_images,
        attributes: [[
          db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', msg_img)`), 'msg_img']],
      }],
      // order: [['created_at', 'DESC']]
    });

    if (getChatData?.chat_images.length) {
      getChatData = JSON.parse(JSON.stringify(getChatData))
      getChatData.chat_images = getChatData.chat_images.map(image => image.msg_img);
    }

    const updateData = {
      updated_at: new Date(Date.now()),
      deleted_by_job_poster: null,
      deleted_by_worker: null,
      deleted_at: null
    }

    if (msg_type == '1') {
      updateData.last_message = data.message
    } else if (msg_type == '2') {
      updateData.last_message = "Image"
    } else if (msg_type == '3') {
      updateData.last_message = "Video"
    } else {
      updateData.last_message = "Link"
    }
    if (profile_type == "JobPoster") {    // "JobPoster" || "Worker"
      updateData.worker_unseen_count = db.sequelize.literal('worker_unseen_count +1')
      // updateData.job_poster_unseen= 0;
      // await libs.updateData(db.rooms, { job_poster_unseen: 0 }, { where: { id: Number(room_id) } })
    } else {
      updateData.job_poster_unseen = db.sequelize.literal('job_poster_unseen +1')
      // updateData.worker_unseen_count= 0;
      // await libs.updateData(db.rooms, { worker_unseen_count: 0 }, { where: { id: Number(room_id) } })
    }
    // await libs.updateData(db.rooms, updateData, { where: { id: data.room_id } });
    const lastCount = await libs.findAndUpdate(db.rooms, data.room_id, updateData);

    const getJobPoster = await libs.getData(db.users, {
      where: { id: receiver_id },
      attributes: ['id', 'first_name', 'last_name', 'profile_type', 'device_type', 'device_token', 'country_code', 'mobile_number',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}',profile_image)`), 'profile_image']
      ]
    });

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

    // send notifications here
    const notify_data = {
      title: `${fullName} has sent a message`,
      message: updateData.last_message,
      imageUrl: `${image_baseUrl}${profile_image}`,
      pushType: '4',
      room_id: Number(room_id),
      other_user_id: id,
      other_user_fullname: `${first_name || ''} ${last_name || ''}`
    }
    if (getJobPoster.device_type == "Android") {
      Notify.sendNotifyToUser(notify_data, getJobPoster.device_token)
    } else {
      Notify.sendNotifyTo_Ios(notify_data, getJobPoster.device_token)
    }

    // const fullMobileNumber = `${getJobPoster.country_code}${getJobPoster.mobile_number}`;
    // if (fullMobileNumber) {
    //   await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    // Only send push notifications for messages don't save
    // await libs.createData(db.notifications,{user_id: getJobPoster.id, ...notify_data});

    res.status(200).json({ code: 200, message: "Message sent successfully", data: getChatData });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const createRoom = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id } = req.creds;
    if (!user_id) { return res.status(404).json({ code: 404, message: "user_id is required" }) }

    const existingRoom = await libs.getData(db.rooms, {
      where: {
        [Op.or]: [
          { created_by: id, created_to: user_id },
          { created_by: user_id, created_to: id }
        ],
        deleted_at: null
      }
    });
    const get_user = await libs.getData(db.users, {
      where: { id: user_id },
      attributes: ['first_name', 'last_name']
    })
    if (existingRoom) {
      await libs.updateData(existingRoom, { deleted_by_worker: null, deleted_by_job_poster: null });

      return res.status(200).json({ code: 200, message: "Room already exists", data: { ...existingRoom.toJSON(), other_user_name: `${get_user.first_name || ''} ${get_user.last_name || ""}` } });
    } else {
      const newRoom = await libs.createData(db.rooms, { created_by: id, created_to: user_id });

      return res.status(200).json({
        code: 200, message: "Room created", data: { ...newRoom.toJSON(), other_user_name: `${get_user.first_name || ''} ${get_user.last_name || ""}` }
      });
    }
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const { room_id } = req.body;
    if (!room_id) { return res.status(404).json({ code: 404, message: "room_id is required" }) }
    console.log('-------id---------', id);
    // delteRoom 
    // const update_dt = {};
    // if (profile_type == 'JobPoster') {
    //   update_dt.deleted_by_job_poster = id
    // } else {
    //   update_dt.deleted_by_worker = id
    // }
    // // await libs.updateData(db.rooms, update_dt,{where:{id: room_id}});

    // await libs.updateData(db.chats, update_dt, { where: { room_id: room_id } });

    const query = `
      UPDATE chats
      SET 
        deleted_by_job_poster = CASE WHEN sender_id = :userId THEN :userId ELSE deleted_by_job_poster END,
        deleted_by_worker = CASE WHEN sender_id != :userId THEN :userId ELSE deleted_by_worker END
      WHERE room_id = :roomId
    `;

    await db.sequelize.query(query, {
      replacements: { userId: id, roomId: room_id },
      type: db.sequelize.QueryTypes.UPDATE
    });

    res.status(200).json({ code: 200, message: "Chat Deleted successfully" })
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// const getAllRooms = async (req, res) => {
//   try {
//     const { id, profile_type } = req.creds;
//     const itemsPerPage = req.query.itemsPerPage || 10;
//     const page = parseInt(req.query.page) || 1; // Current page
//     const offset = (page - 1) * Number(itemsPerPage); // Calculate skip for pagination

//     const chatWhereCondition = {};  

//     const query={
//       [Op.or]: [{ created_by: id }, { created_to: id }],
//       deleted_at: null
//     }
//     if(profile_type == 'JobPoster'){
//       query.deleted_by_job_poster=null
//       chatWhereCondition.deleted_by_job_poster = null;
//     }else{
//       query.deleted_by_worker=null
//       chatWhereCondition.deleted_by_worker = null;
//     }
//     // Fetch rooms data with pagination
//     const getData = await libs.getAllData(db.rooms, {
//       where: query,
//       include: [{
//         model: db.users,
//         where:{deleted_at: null},
//         as: 'createdByUser',
//         attributes: ['id', 'first_name', 'last_name', 'profile_image'], // I have added baseUrl at last line
//       }, {
//         model: db.users,
//         where:{deleted_at: null},
//         as: 'createdToUser',
//         attributes: ['id', 'first_name', 'last_name', 'profile_image'],
//       },{
//         model: db.chats,
//         where: chatWhereCondition,
//         attributes: [], // Include only to check if chat exists
//         required: true,
//       }],
//       limit: Number(itemsPerPage),
//       offset: offset || 0,
//       order: [['updated_at', 'DESC']]
//     });

//     if (!getData.length) {
//       return res.status(404).json({ code: 404, message: "No data found", data: getData });
//     }
//     const data = JSON.parse(JSON.stringify(getData));

//     const getBlockedUsers = await libs.getAllData(db.blocks, {
//       where: {
//         [Op.or]: [{ blocked_by: id }, { blocked_user: id }]
//       },
//       attributes: ['blocked_by', 'blocked_user'],
//       order: [['updated_at', 'DESC']]
//     });

//     // Create a set of blocked user IDs for quick lookup
//     const blockedUserIds = new Set(
//       getBlockedUsers.map(block => (block.blocked_by == id ? block.blocked_user : block.blocked_by))
//     );

//     // Process each room
//     data?.forEach(room => {
//       // Set unseen count based on profile type
//       room.unseen_count = profile_type === "JobPoster" ? room.job_poster_unseen : room.worker_unseen_count;
//       delete room.job_poster_unseen;
//       delete room.worker_unseen_count;

//       // Determine which user data to include
//       if (room.created_by == id) {
//         delete room.createdByUser;
//         room.data = room.createdToUser;
//         delete room.createdToUser;
//       } else {
//         delete room.createdToUser;
//         room.data = room.createdByUser;
//         delete room.createdByUser;
//       }
//       room.data.profile_image = `${image_baseUrl}${room.data.profile_image}`;
//       room.isBlock = '0';

//       // Check if the other user in the room is blocked
//       const otherId = room.created_by == id ? room.created_to : room.created_by;
//       if (blockedUserIds.has(otherId)) {
//         room.isBlock = '1';
//       }
//     });

//     res.status(200).json({ code: 200, message: "Get all rooms", data: data });
//   } catch (err) {
//     console.log('------err------', err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err);
//   }
// };

const getAllRooms = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const itemsPerPage = req.query.itemsPerPage || 10;
    const page = parseInt(req.query.page) || 1; // Current page
    const offset = (page - 1) * Number(itemsPerPage); // Calculate skip for pagination

    const chatWhereCondition = {
      [Op.and]: [{
        [Op.or]: [
          { deleted_by_job_poster: null },
          { deleted_by_job_poster: { [Op.ne]: id } }
        ]
      }, {
        [Op.or]: [
          { deleted_by_worker: null },
          { deleted_by_worker: { [Op.ne]: id } }
        ]
      }
      ]
    };

    const query = {
      [Op.or]: [{ created_by: id }, { created_to: id }],
      deleted_at: null,
    };

    // if (profile_type == 'JobPoster') {
    //   query.deleted_by_job_poster = null;
    //   chatWhereCondition.deleted_by_job_poster = null;
    // } else {
    //   query.deleted_by_worker = null;
    //   chatWhereCondition.deleted_by_worker = null;
    // }

    // query[Op.and]: [
    //     {
    //       [Op.or]: [
    //         { deleted_by_job_poster: null },
    //         { deleted_by_job_poster: { [Op.ne]: id } }
    //       ]
    //     },
    //     {
    //       [Op.or]: [
    //         { deleted_by_worker: null },
    //         { deleted_by_worker: { [Op.ne]: id } }
    //       ]
    //     }
    //   ]


    // Fetch rooms data with pagination
    const getData = await libs.getAllData(db.rooms, {
      where: query,
      include: [{
        model: db.users,
        where: { deleted_at: null },
        as: 'createdByUser',
        attributes: ['id', 'first_name', 'last_name', 'profile_image'],
      }, {
        model: db.users,
        where: { deleted_at: null },
        as: 'createdToUser',
        attributes: ['id', 'first_name', 'last_name', 'profile_image'],
      }, {
        model: db.chats,
        where: chatWhereCondition,
        attributes: [], // Include only to check if chat exists
        required: true,
      }],
      limit: Number(itemsPerPage),
      offset: offset || 0,
      order: [['updated_at', 'DESC']]
    });

    if (!getData.length) {
      return res.status(404).json({ code: 404, message: "No data found", data: getData });
    }

    const data = JSON.parse(JSON.stringify(getData));

    const getBlockedUsers = await libs.getAllData(db.blocks, {
      where: {
        [Op.or]: [{ blocked_by: id }, { blocked_user: id }]
      },
      attributes: ['blocked_by', 'blocked_user'],
      order: [['updated_at', 'DESC']]
    });

    // Create a set of blocked user IDs for quick lookup
    const blockedUserIds = new Set(
      getBlockedUsers.map(block => (block.blocked_by == id ? block.blocked_user : block.blocked_by))
    );

    // Process each room
    const processedData = data.map(room => {
      // Set unseen count based on profile type
      room.unseen_count = profile_type === "JobPoster" ? room.job_poster_unseen : room.worker_unseen_count;
      delete room.job_poster_unseen;
      delete room.worker_unseen_count;

      // Determine which user data to include
      if (room.created_by == id) {
        delete room.createdByUser;
        room.data = room.createdToUser;
        delete room.createdToUser;
      } else {
        delete room.createdToUser;
        room.data = room.createdByUser;
        delete room.createdByUser;
      }
      room.data.profile_image = `${image_baseUrl}${room.data.profile_image}`;

      // Check if the other user in the room is blocked
      const otherId = room.created_by == id ? room.created_to : room.created_by;
      if (blockedUserIds.has(otherId)) {
        room.isBlock = '1';  // Set isBlock to 1 if blocked
      } else {
        room.isBlock = '0';  // Set isBlock to 0 if not blocked
      }

      return room;  // Return the modified room object
    });

    // Filter rooms that are not blocked (isBlock should be 0)
    const filteredData = processedData.filter(room => room.isBlock !== '1');

    res.status(200).json({ code: 200, message: "Get all rooms", data: filteredData });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getAllMessages = async (req, res) => {
  try {
    let { room_id, page, itemsPerPage } = req.query;
    const { id, profile_type } = req.creds;
    console.log('-------req.query------', req.query);

    page = page || 1;
    itemsPerPage = itemsPerPage || 10;

    if (!room_id) { return res.status(404).json({ code: 404, message: "room_id is required" }) }

    // Current page
    const offset = (page - 1) * Number(itemsPerPage);         // Calculate offset for pagination
    // console.log('------page offset,itemsPerPage-----',page,offset,itemsPerPage);
    const chat_query = {
      room_id: room_id,
      deleted_at: null,
      [Op.and]: [{
        [Op.or]: [
          { deleted_by_job_poster: null },
          { deleted_by_job_poster: { [Op.ne]: id } }
        ]
      }, {
        [Op.or]: [
          { deleted_by_worker: null },
          { deleted_by_worker: { [Op.ne]: id } }
        ]
      }]
    };

    let getData = await libs.getAllData(db.chats, {
      where: chat_query,
      attributes: { exclude: ["sender_id", "receiver_id"] },
      include: [{
        model: db.users,
        as: 'sender',
        attributes: ['id', 'first_name', 'last_name', [
          db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', sender.profile_image)`), 'profile_image'],
        ]
      }, {
        model: db.users,
        as: 'receiver',
        attributes: ['id', 'first_name', 'last_name', [
          db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', receiver.profile_image)`), 'profile_image']
        ],
      }, {
        model: db.chat_images,
        attributes: [[db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', msg_img)`), 'msg_img']],
      }],
      limit: Number(itemsPerPage),
      offset: offset || 0,
      order: [['created_at', 'DESC']]
    });

    // updateLastMsg
    if (profile_type == "JobPoster") {    // "JobPoster" || "Worker"
      await libs.updateData(db.rooms, { job_poster_unseen: 0 }, { where: { id: room_id } });
    } else {
      await libs.updateData(db.rooms, { worker_unseen_count: 0 }, { where: { id: room_id } });
    }
    if (getData) {
      getData = JSON.parse(JSON.stringify(getData))
      getData = getData?.map(chat => {
        chat.chat_images = chat.chat_images.map(image => image.msg_img);
        return chat;
      }).reverse()
    }

    res.status(200).json({ code: 200, message: "Get all messages", data: getData });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const is_seen = async (req, res) => {
  try {
    let { room_id } = req.query;
    const { id, profile_type } = req.creds;
    console.log('-------req.query------', req.query);

    if (!room_id) { return res.status(404).json({ code: 404, message: "room_id is required" }) }

    // updateLastMsg
    if (profile_type == "JobPoster") {    // "JobPoster" || "Worker"
      await libs.updateData(db.rooms, { job_poster_unseen: 0 }, { where: { id: Number(room_id) } })
    } else {
      await libs.updateData(db.rooms, { worker_unseen_count: 0 }, { where: { id: Number(room_id) } })
    }

    res.status(200).json({ code: 200, message: "Message seen" });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const blockUnblock = async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id, profile_type } = req.creds;
    console.log('-------req.body------', req.body);

    const ongoingJob = await libs.getData(db.booking_jobs, {
      where: {
        [Op.or]: [
          { job_poster_id: id, worker_id: user_id },
          { job_poster_id: user_id, worker_id: id }
        ],
        booking_status: { [Op.in]: ["Hired", "Applied"] },
        deleted_at: null
      }
    });

    if (ongoingJob) {
      if (profile_type === "Worker") {
        return res.status(400).json({
          code: 400,
          message: "You cannot block this user as there is an ongoing job."
        });
      } else if (profile_type === "JobPoster") {
        return res.status(400).json({
          code: 400,
          message: "You have an ongoing job with this worker. Do you really want to block them?",
          ongoingJob: true
        });
      }
    }

    const saveData = { blocked_by: id, blocked_user: user_id };

    const getBlocked = await libs.getData(db.blocks, { where: saveData });

    if (getBlocked) {
      const deleteBlockUser = await libs.destroyData(getBlocked);
      // const deleteBlockUser = await libs.destroyData(db.blocks,{where: saveData});
      return res.status(200).json({ code: 200, message: "User unblocked successfully" });
    } else {
      const blockUser = await libs.createData(db.blocks, saveData);
      const deleteRecent = await libs.destroyData(db.recents, {
        where: { user_id: user_id },
      });

      return res.status(200).json({ code: 200, message: "User has been blocked" });
    }

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};
const myBlockList = async (req, res) => {
  try {
    const { id } = req.creds;
    console.log('-------req.body------', req.body);
    let { page, itemsPerPage } = req.query;
    page = Number(page) || 1;
    itemsPerPage = Number(itemsPerPage) || 10;

    const offset = (page - 1) * Number(itemsPerPage);

    const getBlocked = await libs.getAllData(db.blocks, {
      where: { blocked_by: id },
      include: {
        model: db.users,
        where: { deleted_at: null },
        attributes: ['id', 'first_name', 'last_name', 'email',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image']
        ],
        as: 'blockedUser'
      },
      limit: itemsPerPage,
      offset: offset || 0,
    });

    if (getBlocked) {
      res.status(200).json({ code: 200, message: "Blocked users list", data: getBlocked });
    } else {
      res.status(404).json({ code: 404, message: "No data found", data: getBlocked });
    }
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const rateNow = async (req, res) => {
  try {
    const { id, profile_type, first_name, last_name, profile_image } = req.creds;       // "JobPoster", "Worker"
    const { rating_to, job_id, booking_job_id, rating, msg } = req.body;
    console.log('-------req.body------', req.body);

    if (!rating_to || !job_id || !booking_job_id || !rating || !msg) {
      return res.status(404).json({ code: 404, message: 'rating_to, job_id, booking_job_id, rating, msg, all are required' })
    }

    const data = {
      // job_poster_id: job_poster_id,
      // worker_id: worker_id,
      job_id: job_id,
      booking_job_id: booking_job_id,
      rated_by: profile_type,
      deleted_at: null
    };

    let pr_type;
    let jobPoster_Worker;
    let job_work;

    if (profile_type == 'JobPoster') {
      data.job_poster_id = id
      data.worker_id = rating_to
      pr_type = "Worker"
      jobPoster_Worker = "worker_id"
      job_work = "work"
    } else {
      data.job_poster_id = rating_to
      data.worker_id = id
      pr_type = "JobPoster"
      jobPoster_Worker = "job_poster_id"
      job_work = "job"
    }

    const getRating = await libs.getData(db.ratings, { where: data });
    if (getRating) {
      return res.status(409).json({ code: 409, message: `You have already rated to ${pr_type}` })
    }
    data.msg = msg
    data.rating = rating

    await libs.createData(db.ratings, data);

    const avg_rating = await db.ratings.findOne({
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'averageRating']
      ],
      where: { [jobPoster_Worker]: rating_to }
    });

    const getUser = await libs.getData(db.users, {
      where: { id: rating_to },
      attributes: ['id', 'device_type', 'device_token', 'country_code', 'mobile_number']
    })

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

    const notify_data = {
      title: `${fullName} has rate you`,
      message: `${fullName} has left rating on your ${job_work}`,
      imageUrl: `${image_baseUrl}${profile_image}`,
      pushType: '3',
      other_user_id: id,
      user_id: getUser.id
    }

    if (getUser.device_type == "Android") {
      if (getUser.device_token) { Notify.sendNotifyToUser(notify_data, getUser.device_token) }
    } else {
      if (getUser.device_token) { Notify.sendNotifyTo_Ios(notify_data, getUser.device_token) }
    }
    notify_data.imageUrl = profile_image

    // const fullMobileNumber = `${getUser.country_code}${getUser.mobile_number}`;
    // if (fullMobileNumber) {
    //   await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    await libs.createData(db.notifications, notify_data);

    console.log('---avg_rating---', avg_rating);
    if (avg_rating.dataValues.averageRating) {
      await libs.updateData(db.users, { overall_rating: Number(avg_rating.dataValues.averageRating).toFixed(2) }, { where: { id: rating_to } })
    }
    res.status(200).json({ code: 200, message: `You successfully rated to ${pr_type}` })

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const update_location = async (req, res) => {
  try {
    const { longitude, latitude, address } = req.body;
    const { id } = req.creds;
    console.log('-------req.body------', req.body);
    if (!longitude || !latitude || !address) {
      return res.status(200).json({ code: 200, message: "longitude,latitude,address are required" });
    }
    const save_data = {
      longitude: longitude,
      latitude: latitude,
      address: address,
    }
    const update_location = await libs.updateData(req.creds, save_data);
    console.log('----------update_location-----------', update_location);
    res.status(200).json({ code: 200, message: "location updated successfully" });

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const reportsListing = async (req, res) => {
  try {
    const getReports = await libs.getAllData(db.reportlisting, {
      attributes: ['report']
    });
    res.status(200).json({ code: 200, message: "All reports messages", data: getReports });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const report = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const { job_id, user_id, message } = req.body;
    if ((!job_id && !user_id) || !message) {
      return res.status(400).json({ code: 400, message: "job_id or user_id one is required and message is required" });
    }
    const data = { report_by: id };

    if (job_id) {
      data.job_id = job_id;
      const getReportJob = await libs.getData(db.reports, { where: data });
      if (getReportJob) {
        return res.status(400).json({ code: 400, message: "You have already reported on this job" });
      }
    }
    if (user_id) {
      data.report_to = user_id;
      const getReportUser = await libs.getData(db.reports, { where: data });
      if (getReportUser) {
        return res.status(400).json({ code: 400, message: "You have already reported to this user" });
      }
    }
    data.message = message;
    await libs.createData(db.reports, data);

    res.status(200).json({ code: 200, message: "Successfully reported" });

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const categoriesListing = async (req, res) => {
  try {
    const getReports = await libs.getAllData(db.categories, {});
    res.status(200).json({ code: 200, message: "All categories messages", data: getReports });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const viewApplicants = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    console.log('-------req.query------', req.query);

    let { job_id, page, itemsPerPage } = req.query;  // "Applied","Hired","Completed"

    job_id = Number(job_id);
    page = Number(page) || 1;
    itemsPerPage = Number(itemsPerPage) || 10;
    const offset = (page - 1) * Number(itemsPerPage);

    if (!job_id) {
      return res.status(404).json({ code: 404, message: "job_id is required" });
    }
    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    const getAppliedHiredCompJobs = async (booking_status) => {
      let inc = [{
        model: db.users,
        // where: {
        //   deleted_at: null,
        //   id: { [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)] }
        // },
        attributes: ['id', 'first_name', 'last_name', 'overall_rating', 'deleted_at',
          [db.sequelize.literal(`CASE
              WHEN profile_image LIKE 'http%' THEN profile_image
              ELSE CONCAT("${image_baseUrl}", profile_image)
            END
          `),
            'profile_image',
          ],
        ],
        as: "worker"
      },]
      if (booking_status == 'Completed') {
        inc.push({
          model: db.ratings,
          where: { rated_by: profile_type },
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
          required: false
        })
      }
      const whereCondition = {
        job_id,
        booking_status,
        ...(booking_status !== "Completed" && { deleted_at: null }), // Add condition dynamically
      }
      const getApplicants = await libs.getAllData(db.booking_jobs, {
        where: whereCondition,
        attributes: { include: ['is_completed_from_worker'] },
        include: inc,
        limit: itemsPerPage,
        offset: offset || 0,
      });
      return getApplicants;
    }

    const getApplied = await getAppliedHiredCompJobs('Applied');
    const getHired = await getAppliedHiredCompJobs('Hired');
    const getCompleted = await getAppliedHiredCompJobs('Completed');

    return res.status(200).json({ code: 200, message: `View All Applicants`, getApplied: getApplied, getHired: getHired, getCompleted: getCompleted });

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const updateApplicantStatus = async (req, res) => {
  try {
    const { id, first_name, last_name, profile_image } = req.creds;
    const userData = req.creds;
    const { booking_status, job_id, card_id, worker_id } = req.body;  // "Applied","Hired","Completed","Declined"
    console.log('-------req.body------', req.body);

    if (!booking_status || !job_id || !worker_id) {
      return res.status(404).json({ code: 404, message: "booking_status,job_id,worker_id are required" });
    }

    const getApplicant = await libs.getData(db.booking_jobs, {
      where: { job_id: job_id, worker_id: worker_id, deleted_at: null },
      include: {
        model: db.jobs,
        attributes: ['id', 'title', 'description']
      }
    });
    console.log('----getApplicant----', JSON.parse(JSON.stringify(getApplicant)));

    const getWorker = await libs.getData(db.users, {
      where: { id: worker_id },
      attributes: ['id', 'first_name', 'last_name', 'device_type', 'device_token', 'notify_count', 'country_code', 'mobile_number', 'overall_rating', 'stripe_account_id', 'stripe_enabled',
        [db.sequelize.literal(`CASE 
              WHEN profile_image LIKE 'http%' THEN profile_image
              ELSE CONCAT("${image_baseUrl}", profile_image)
            END
          `),
          'profile_image',
        ],
      ]
    });

    if (getApplicant) {
      let msg;
      if (booking_status == "Hired") {
        msg = "Congratulations! You've been hired for the job";
        if (!card_id) {
          return res.status(404).json({ code: 404, message: "card_id is required" });
        }
        const data_ = {
          card_id,
          amount: getApplicant.bid_amount,
          worker_id: worker_id,
          booking_id: getApplicant.id,
          worker_name: getWorker.first_name + ' ' + getWorker.last_name
        }
        const dt_ = await paymentCtrl.send_payment(userData, data_);

        if (dt_ && dt_.code != 200) {
          return res.status(dt_.code).json({ code: dt_.code, message: dt_.message });
        }

        await libs.updateData(db.booking_jobs, { booking_status: "Declined" }, { where: { job_id: job_id, worker_id: { [Op.ne]: worker_id }, deleted_at: null } });
        await libs.updateData(db.jobs, { status: "onwork" }, { where: { id: job_id } });
      }
      else if (booking_status == "Completed") {
        msg = "Job completed successfully. Thank you for your efforts!"

        if (!getWorker.stripe_account_id || getWorker.stripe_enabled != '1') {
          return res.status(404).json({ code: 404, message: "worker's stripe acc. is not connected yet" });
        }
        const getPayHistory = await libs.getData(db.payments, { where: { booking_id: getApplicant.id }, })
        console.log('----getPayHistory----', JSON.parse(JSON.stringify(getPayHistory)));

        if (!getPayHistory) {
          return res.status(404).json({ code: 404, message: "First, make the payment to the worker" });
        }
        //-----transfer amount to the worker--------
        const transfer_payment = await paymentCtrl.release_payment(getPayHistory, getWorker);

        if (transfer_payment.code != 200) {
          return res.status(transfer_payment.code).json({ code: transfer_payment.code, message: transfer_payment.message });
        }
        const result = transfer_payment.result;

        const data = {
          workerName: getWorker.first_name + ' ' + getWorker.last_name,
          jobTitle: getApplicant.job.title,
          jobDescription: getApplicant.job.description,
          rakettMo_fee: getPayHistory.amount - result,
          you_earned: result,
          total_job_amount: getPayHistory.amount
        };

        const savePdf = await generateJobSummaryPDF(data)
        console.log('PDF generated at:', savePdf);

        getApplicant.invoice_pdf = savePdf.fileName;

        await libs.updateData(db.users, {
          total_earning: db.sequelize.literal(`total_earning + ${Number(result)}`)
        }, { where: { id: worker_id } });

        await libs.updateData(db.jobs, { status: "completed" }, { where: { id: job_id } });
      } else {
        msg = "We appreciate your interest, but we won't be proceeding with your application."
      }

      getApplicant.booking_status = booking_status
      await getApplicant.save();

      // const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      // const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

      const notify_data = {
        title: `${booking_status}`,
        message: `${msg}`,
        imageUrl: `${image_baseUrl}${profile_image}`,
        pushType: '2',
        job_id: Number(job_id),
        other_user_fullname: `${first_name || ''} ${last_name || ''}`
      }

      if (booking_status != 'Declined') {
        if (getWorker.device_type == "Android") {
          Notify.sendNotifyToUser(notify_data, getWorker.device_token)
        } else {
          Notify.sendNotifyTo_Ios(notify_data, getWorker.device_token)
        }
        notify_data.imageUrl = profile_image;

        // const fullMobileNumber = `${getWorker.country_code}${getWorker.mobile_number}`;
        // if (fullMobileNumber) {
        // await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
        // }

        await libs.createData(db.notifications, { user_id: getWorker.id, ...notify_data });
        getWorker.notify_count = db.sequelize.literal('notify_count +1')
        await getWorker.save();
      }

      const bidAmount = parseFloat(getApplicant.bid_amount);

      const payment_detail = {
        bid_amount: bidAmount.toFixed(2),
        transaction_fee: (bidAmount * 0.032).toFixed(2),
        // sub_total: (bidAmount + bidAmount * 0.032).toFixed(2),
        sub_total: bidAmount.toFixed(2),
      }

      return res.status(200).json({
        code: 200,
        message: "Status updated successfully",
        worker: {
          id: getWorker.id,
          name: `${getWorker.first_name || ''} ${getWorker.last_name || ''}`.trim(),
          overall_rating: getWorker.overall_rating || '0',
          profile_image: getWorker.profile_image,
          ...payment_detail
        },
      });
    } else {
      return res.status(404).json({ code: 404, message: "Data not found" });
    }
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const viewProfile_PreviousWork = async (req, res) => {
  try {
    const user_id = Number(req.query.worker_id);
    console.log('-------req.query------', req.query);

    if (!user_id) { return res.status(404).json({ code: 404, message: "worker_id is required" }) };

    const getApplicant = await libs.getData(db.users, {
      where: { id: user_id, deleted_at: null },
      attributes: ['id', 'first_name', 'last_name', 'email', 'yelp_account', 'payment', 'profile_type', 'category_id', 'overall_rating', 'experience_years', 'top_verified', 'skills', 'updated_at', 'user_introduction', 'proof_uploaded', 'stripe_enabled',
        [
          db.sequelize.literal(`CASE
              WHEN profile_image LIKE 'http%' THEN profile_image
              ELSE CONCAT("${process.env.image_baseUrl}", profile_image)
            END
          `),
          'profile_image',
        ],
      ],
      include: [
        // { model: db.categories, attributes: ['category'] },
        {
          model: db.booking_jobs,
          where: { booking_status: "Completed" },
          limit: 10,
          order: [["updated_at", "ASC"]],
          attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
          include: [{
            model: db.jobs,
            attributes: ['id', 'title', 'job_poster_id'],
            include: {
              model: db.job_images,
              attributes: [[db.sequelize.literal(`CONCAT("${process.env.image_baseUrl}", job_image)`), 'job_image']],
              limit: 1,
            }
          }, {
            model: db.users,
            as: "job_poster",
            attributes: ['id', 'first_name', 'last_name', 'profile_type', 'user_introduction'],
          }, {
            model: db.ratings,
            where: { rated_by: "JobPoster" },
            attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
            limit: 10,
            order: [['created_at', 'DESC']],
            required: false,
          }]
        }],
      order: [['created_at', 'DESC']],
    });

    if (!getApplicant) { return res.status(404).json({ code: 404, message: "worker not found" }) };

    const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availability = await libs.getAllData(db.workerAvailability, { where: { worker_id: user_id } });
    const formattedAvailability = allDays.map(day => {
      const record = availability.find(item => item.day === day);
      return {
        day,
        start_time: record?.status == "1" ? convertToAmPmFormat(record.start_time) : "",
        end_time: record?.status == "1" ? convertToAmPmFormat(record.end_time) : "",
        status: record?.status || "0"
      };
    });

    averageWaitingTime = await calculateAverageWaitingTime(db, user_id);

    const media_and_project_imgs = await libs.getAllData(db.media_and_projects, {
      where: { user_id: user_id },
      attributes: ['id',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}',image)`), 'image'],
      ]
    });

    let get_imgs = await libs.getAllData(db.user_imgs, {
      where: { user_id: user_id },
      attributes: ['id',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}',img)`), 'img'],
      ]
    });

    get_imgs = get_imgs?.map(image => image.img)

    const completed_job_count = await db.booking_jobs.count({ where: { worker_id: user_id, booking_status: { [Op.in]: ["Completed"] } } });

    const getPostedJobsCount = await db.jobs.count({
      where: { job_poster_id: user_id, deleted_at: null }
    });

    let categoryNames = '';
    if (getApplicant && getApplicant.category_id) {
      console.log('-----getApplicant.category_id-----', getApplicant.category_id);
      // const categoryIds = getApplicant.category_id?.split(',').map(id => parseInt(id.trim()))
      //   .filter(id => !isNaN(id));

      const rawCategoryId = getApplicant.category_id;
      // Ensure it's a string, then split and parse
      const categoryIds = String(rawCategoryId)
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (categoryIds.length > 0) {
        const getCategories = await libs.getAllData(db.categories, {
          where: { id: { [Op.in]: categoryIds } },
          attributes: ['category']
        });
        categoryNames = getCategories.map(cat => cat.category).join(', ') || '';
      }
    }

    getApplicant.dataValues.category_names = categoryNames;
    getApplicant.dataValues.available_time_slots = formattedAvailability;

    // let medal_name = "none";
    // // Top Worker Medal: Check if the user's average rating in the last month is 5
    // // Last 1 month me jis user ki rating 5 hai Uska Medal - Top Worker
    // const oneMonthAgo = new Date();
    // oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // const recentRatings = await db.ratings.findAll({
    //   where: {
    //     worker_id: user_id,
    //     rated_by: "JobPoster",
    //     created_at: { [Op.gte]: oneMonthAgo },
    //   },
    //   attributes: [[db.sequelize.fn('AVG', db.sequelize.col('rating')), 'average_rating']],
    // });
    // const averageRating = recentRatings[0]?.dataValues?.average_rating
    //   ? parseFloat(recentRatings[0].dataValues.average_rating)
    //   : 0;
    // if (averageRating === 5) {
    //   medal_name = "Top Worker";
    // }

    // // Top Earner Medal: Check if the user has the highest earnings in the last month
    // // Last 1 Month me Sabse jada Earn Krne Wala Worker
    // const allWorkersEarnings = await db.booking_jobs.findAll({
    //   where: {
    //     booking_status: "Completed",
    //     created_at: { [Op.gte]: oneMonthAgo },
    //   },
    //   attributes: [
    //     'worker_id',
    //     [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total_earnings'],
    //   ],
    //   group: ['worker_id'],
    //   order: [[db.sequelize.literal('total_earnings'), 'DESC']],
    //   limit: 1,
    // });

    // const topEarnerId = allWorkersEarnings[0]?.dataValues?.worker_id;
    // if (topEarnerId === user_id) {
    //   medal_name = medal_name === "Top Worker" ? "Top Worker, Top Earner" : "Top Earner";
    // }

    const medalOptions = ["Top Worker", "Top Earner", "none"];
    const medal_name = "none" || medalOptions[Math.floor(Math.random() * medalOptions.length)];

    const getRatings = await libs.getAllData(db.ratings, {
      where: { worker_id: user_id, "rated_by": "JobPoster" },
      attributes: ['job_poster_id', 'worker_id', 'booking_job_id', 'rated_by', 'rating', 'msg',
        // [db.sequelize.literal(`CONCAT('${image_baseUrl}', profile_image)`), 'profile_image']
      ],
      include: {
        model: db.users,
        attributes: ['id', 'first_name', 'last_name',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
        ],
        as: 'job_poster'
      }
    })


    return res.status(200).json({
      code: 200,
      message: "View profile of worker",
      getPostedJobsCount: getPostedJobsCount,
      getHiredCount: completed_job_count,
      averageWaitingTime: averageWaitingTime,
      get_imgs: get_imgs,
      data: getApplicant,
      media_and_project_imgs: media_and_project_imgs,
      medal_name: medal_name,
      getRatings: getRatings
    });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// const viewProfile_PreviousWork = async (req, res) => {
//   try {
//     const id = Number(req.query.worker_id);
//     if (!id) return res.status(400).json({ message: "User ID is required" });

//     const user = await db.users.findOne({ where: { id } });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let my_data = JSON.parse(JSON.stringify(user));

//     if (my_data.profile_image) {
//       my_data.profile_image = `${image_baseUrl}${my_data.profile_image}`;
//     }
//     if (my_data.work_video_thumbnail) {
//       my_data.work_video_thumbnail = `${image_baseUrl}${my_data.work_video_thumbnail}`;
//     }
//     if (my_data.job_video_thumbnail) {
//       my_data.job_video_thumbnail = `${image_baseUrl}${my_data.job_video_thumbnail}`;
//     }

//     const categoryIds = my_data.category_id
//       ? my_data.category_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
//       : [];
//     let categoryNames = '';
//     if (categoryIds.length > 0) {
//       const getCategories = await libs.getAllData(db.categories, {
//         where: { id: { [Op.in]: categoryIds } },
//         attributes: ['category'],
//       });
//       categoryNames = getCategories.map(cat => cat.category).join(', ') || '';
//     }

//     my_data.category = categoryNames;
//     my_data.isSubscription = '0'; // assuming you don't check for subscription here

//     const get_imgs = await libs.getAllData(db.user_imgs, {
//       where: { user_id: id },
//       attributes: ['id',
//         [db.sequelize.literal(`CONCAT('${image_baseUrl}',img)`), 'img'],
//       ]
//     });

//     const media_and_project_imgs = await libs.getAllData(db.media_and_projects, {
//       where: { user_id: id },
//       attributes: ['id',
//         [db.sequelize.literal(`CONCAT('${image_baseUrl}',image)`), 'image'],
//       ]
//     });

//     my_data.averageWaitingTime = await calculateAverageWaitingTime(db, id);

//     const itemsPerPage = Number(req.query.itemsPerPage) || 10;
//     const page = parseInt(req.query.page) || 1;
//     const offset = (page - 1) * itemsPerPage;

//     // If user is a worker, fetch jobs completed by them
//     let getBookings = await libs.getAllData(db.booking_jobs, {
//       where: { worker_id: id, booking_status: "Completed" },
//       include: [
//         {
//           model: db.users,
//           as: "job_poster",
//           attributes: ['id', 'first_name', 'last_name', 'deleted_at'],
//         },
//         {
//           model: db.jobs,
//           attributes: ['id', 'title', 'job_poster_id'],
//           include: {
//             model: db.job_images,
//             attributes: [
//               [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
//             ],
//             limit: 1
//           }
//         },
//         {
//           model: db.ratings,
//           where: { rated_by: "JobPoster" },
//           attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
//           required: true
//         }
//       ],
//       attributes: { exclude: ['deleted_at', 'created_at'] },
//       order: [['updated_at', 'DESC']],
//       limit: itemsPerPage,
//       offset: offset
//     });

//     if (getBookings) {
//       getBookings = getBookings.map(booking => {
//         if (booking.job && booking.job.job_images) {
//           booking.job.job_images = booking.job.job_images.map(image => image.job_image);
//         }
//         return booking;
//       });
//     }

//     return res.status(200).json({
//       code: 200,
//       message: "View profile of user",
//       data: my_data,
//       get_imgs: get_imgs,
//       previous_works: getBookings,
//       media_and_project_imgs: media_and_project_imgs
//     });

//   } catch (err) {
//     console.log("------err------", err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err);
//   }
// };

//  it will show both ratings of worker and jobposter by token

// const workerAllRating = async (req, res) => {
//   try {
//     let { user_id, page, itemsPerPage } = req.query;
//     let { id, profile_type } = req.creds;

//     user_id = Number(user_id);
//     page = Number(page) || 1;
//     itemsPerPage = Number(itemsPerPage) || 10;
//     const offset = (page - 1) * Number(itemsPerPage);

//     console.log('---------id ---------', id);
//     console.log('---------user_id ---------', user_id);
//     if (id == user_id) {
//       if (profile_type == "JobPoster") {
//         profile_type = "Worker"
//       } else {
//         profile_type = "JobPoster"
//       }
//     }

//     if (!user_id) {
//       return res.status(404).json({ code: 404, message: "user_id is required" });
//     }
//     if (profile_type == 'JobPoster') {
//       let getWorkerRating = await libs.getAllData(db.ratings, {
//         where: { worker_id: user_id, "rated_by": "JobPoster", deleted_at: null },
//         attributes: ['rating', 'msg', 'created_at'],  // 'id', 'rated_by', 'worker_id', 'job_poster_id', 
//         include: {
//           model: db.users,
//           // where:{deleted_at:null},
//           attributes: ['id', 'first_name', 'last_name',
//             [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
//           ],
//           as: 'job_poster'
//         },
//         limit: itemsPerPage,
//         offset: offset || 0,
//         order: [['created_at', 'DESC']],
//       })
//       console.log('----------getWorkerRating---------', JSON.parse(JSON.stringify(getWorkerRating)));
//       getWorkerRating = getWorkerRating?.map(rating => ({
//         rating: rating.rating,
//         msg: rating.msg,
//         created_at: rating.created_at,
//         first_name: rating.job_poster.first_name,
//         last_name: rating.job_poster.last_name,
//         profile_image: rating.job_poster.profile_image,
//       }));
//       return res.status(200).json({ code: 200, message: "Get all rating of worker", data: getWorkerRating })
//     } else {
//       let getJobposterRating = await libs.getAllData(db.ratings, {
//         where: { job_poster_id: user_id, rated_by: "Worker", deleted_at: null },
//         attributes: ['rating', 'msg', 'created_at'],  // 'id', 'rated_by', 'worker_id', 'job_poster_id',
//         include: {
//           model: db.users,
//           // where:{deleted_at:null},
//           attributes: ['id', 'first_name', 'last_name',
//             [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
//           ],
//           as: 'worker'
//         },
//         order: [['created_at', 'DESC']],
//       })
//       console.log('----------getJobposterRating---------', JSON.parse(JSON.stringify(getJobposterRating)));
//       getJobposterRating = getJobposterRating?.map(rating => ({
//         rating: rating.rating,
//         msg: rating.msg,
//         created_at: rating.created_at,
//         first_name: rating.worker.first_name,
//         last_name: rating.worker.last_name,
//         profile_image: rating.worker.profile_image,
//       }));

//       // if (!getJobposterRating.length) {
//       //   return res.status(404).json({ code: 404, message: "No data found",data:null });
//       // }
//       return res.status(200).json({ code: 200, message: "Get all rating of job poster", data: getJobposterRating })
//     }
//   } catch (err) {
//     console.log('-------err-------', err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err);
//   }
// };

const workerAllRating = async (req, res) => {
  try {
    let { user_id, page, itemsPerPage } = req.query;
    let { id, profile_type } = req.creds;

    user_id = Number(user_id);
    page = Number(page) || 1;
    itemsPerPage = Number(itemsPerPage) || 10;
    const offset = (page - 1) * Number(itemsPerPage);

    console.log('---------id ---------', id);
    console.log('---------user_id ---------', user_id);
    if (id == user_id) {
      if (profile_type == "JobPoster") {
        profile_type = "Worker"
      } else {
        profile_type = "JobPoster"
      }
    }

    if (!user_id) {
      return res.status(404).json({ code: 404, message: "user_id is required" });
    }

    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    if (profile_type == 'JobPoster') {
      let getWorkerRating = await libs.getAllData(db.ratings, {
        // where: { worker_id: user_id, "rated_by": "JobPoster", deleted_at: null },
        where: {
          worker_id: user_id,
          rated_by: "JobPoster",
          deleted_at: null,
          job_poster_id: { [Op.notIn]: db.sequelize.literal(blockedUsersSubquery) }, // Exclude blocked users
        },
        attributes: ['rating', 'msg', 'created_at'],  // 'id', 'rated_by', 'worker_id', 'job_poster_id', 
        include: {
          model: db.users,
          // where:{deleted_at:null},
          attributes: ['id', 'first_name', 'last_name',
            [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
          ],
          as: 'job_poster'
        },
        limit: itemsPerPage,
        offset: offset || 0,
        order: [['created_at', 'DESC']],
      })
      console.log('----------getWorkerRating---------', JSON.parse(JSON.stringify(getWorkerRating)));
      getWorkerRating = getWorkerRating?.map(rating => ({
        rating: rating.rating,
        msg: rating.msg,
        created_at: rating.created_at,
        first_name: rating.job_poster.first_name,
        last_name: rating.job_poster.last_name,
        profile_image: rating.job_poster.profile_image,
      }));
      return res.status(200).json({ code: 200, message: "Get all rating of worker", data: getWorkerRating })
    } else {
      let getJobposterRating = await libs.getAllData(db.ratings, {
        // where: { job_poster_id: user_id, rated_by: "Worker", deleted_at: null },
        where: {
          job_poster_id: user_id,
          rated_by: "Worker",
          deleted_at: null,
          worker_id: { [Op.notIn]: db.sequelize.literal(blockedUsersSubquery) }, // Exclude blocked users
        },
        attributes: ['rating', 'msg', 'created_at'],  // 'id', 'rated_by', 'worker_id', 'job_poster_id',
        include: {
          model: db.users,
          // where:{deleted_at:null},
          attributes: ['id', 'first_name', 'last_name',
            [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
          ],
          as: 'worker'
        },
        order: [['created_at', 'DESC']],
      })
      console.log('----------getJobposterRating---------', JSON.parse(JSON.stringify(getJobposterRating)));
      getJobposterRating = getJobposterRating?.map(rating => ({
        rating: rating.rating,
        msg: rating.msg,
        created_at: rating.created_at,
        first_name: rating.worker.first_name,
        last_name: rating.worker.last_name,
        profile_image: rating.worker.profile_image,
      }));

      // if (!getJobposterRating.length) {
      //   return res.status(404).json({ code: 404, message: "No data found",data:null });
      // }
      return res.status(200).json({ code: 200, message: "Get all rating of job poster", data: getJobposterRating })
    }
  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const shareJob = async (req, res) => {
  try {
    const { user_id, job_id } = req.body;
    console.log('---------req.body-----', req.body);
    const { id, first_name, last_name, profile_image } = req.creds;
    if (!user_id || !job_id) { return res.status(404).json({ code: 404, message: "user_id, job_id is required" }) }

    let room_id = null;

    const existingRoom = await libs.getData(db.rooms, {
      where: {
        [Op.or]: [
          { created_by: id, created_to: user_id },
          { created_by: user_id, created_to: id }
        ],
        deleted_at: null
      }
    });

    if (existingRoom) {
      room_id = existingRoom.id;

    } else {
      let newRoom = await libs.createData(db.rooms, { created_by: id, created_to: user_id });
      room_id = newRoom.id;
    }

    let getJob = await libs.getData(db.jobs, {
      where: { id: Number(job_id), deleted_at: null },
      attributes: ['id', 'title'],
      include: {
        model: db.job_images,
        attributes: ['job_image',
          // [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image']
        ],
        limit: 1
      }
    });

    const data = {
      sender_id: id,
      receiver_id: user_id,
      room_id: room_id,
      msg_type: 4,
      job_id: job_id,
      message: `${getJob?.title}`
    }

    const saveData = await libs.createData(db.chats, data);
    await libs.createData(db.chat_images, { chat_id: saveData.id, msg_img: getJob?.job_images[0]?.job_image })

    const getJobPoster = await libs.getData(db.users, {
      where: { id: user_id },
      attributes: ['id', 'profile_type', 'device_type', 'device_token', 'country_code', 'mobile_number',  // 'first_name', 'last_name', 
        // [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',profile_image)`), 'profile_image']
      ]
    });
    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

    const updateData = {
      updated_at: new Date(Date.now()),
      deleted_by_job_poster: null,
      deleted_by_worker: null,
      deleted_at: null,
      last_message: "Link"
    }

    if (getJobPoster.profile_type == "JobPoster") {    // "JobPoster" || "Worker"
      updateData.job_poster_unseen = db.sequelize.literal('job_poster_unseen +1')
    } else {
      updateData.worker_unseen_count = db.sequelize.literal('worker_unseen_count +1')
    }
    await libs.findAndUpdate(db.rooms, room_id, updateData);

    // send notifications here
    const notify_data = {
      title: `Message received`,
      message: `${fullName} has shared a job`,
      imageUrl: `${image_baseUrl}${profile_image}`,
      pushType: '7', // room_id, other_user_id = user_id, other user's add full name 'first_name', 'last_name', 
      other_user_id: id,
      room_id: room_id,
      other_user_fullname: `${first_name || ''} ${last_name || ''}`
    }
    if (getJobPoster.device_type == "Android") {
      Notify.sendNotifyToUser(notify_data, getJobPoster.device_token)
    } else {
      Notify.sendNotifyTo_Ios(notify_data, getJobPoster.device_token)
    }
    notify_data.imageUrl = profile_image

    // const fullMobileNumber = `${getJobPoster.country_code}${getJobPoster.mobile_number}`;
    // if (fullMobileNumber) {
    // await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    await libs.createData(db.notifications, { user_id: getJobPoster.id, ...notify_data });

    res.status(200).json({ code: 200, message: "Job shared successfully" })
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const convertToAmPmFormat = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  console.log('------hours,minutes---', hours, minutes);
  let hours12 = parseInt(hours);
  const period = hours12 >= 12 ? 'PM' : 'AM';
  hours12 = hours12 % 12 || 12; // Convert 0 to 12 for midnight
  console.log('---------AM/PM---------', `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`);
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

const checkAvailability = async (req, res) => {
  try {
    const { id } = req.creds;
    const { worker_id } = req.query;
    console.log('-------req.query------', req.query);
    const getAvailability = await libs.getAllData(db.workerAvailability, { where: { worker_id: Number(worker_id) } });

    // console.log('---start_time---',getTime.start_time.toLocaleString('en-US',{timeZone:'UTC'}));
    // console.log('---end_time----',getTime.end_time.toLocaleString('en-US',{timeZone:'UTC'}));
    // console.log('---start_time---',getTime.start_time.toLocaleString());
    // console.log('---end_time----',getTime.end_time.toLocaleString());
    if (getAvailability.length) {

      for (let time of getAvailability) {
        time.start_time = time.start_time ? convertToAmPmFormat(time.start_time) : ""
        time.end_time = time.start_time ? convertToAmPmFormat(time.end_time) : ""
      }
      return res.status(200).json({ code: 200, message: "Users Availability", data: getAvailability })
    }
    res.status(404).json({ code: 404, message: "Availability not found" })

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const sheduleMetting = async (req, res) => {
  try {
    const { worker_id, start_time, end_time, day, title } = req.body;
    const { id, first_name, last_name, profile_type, profile_image } = req.creds;
    if (!worker_id || !start_time || !end_time || !day) {
      return res.status(404).json({ code: 404, message: "worker_id,start_time,end_time,day is required" });
    }

    // Format the time as HH:MM:SS
    const startTime = start_time.substring(11, 19)
    const endTime = end_time.substring(11, 19)
    console.log('------startTime-------', startTime);
    console.log('------endTime-------', endTime);

    const getAvailability = await libs.getData(db.workerAvailability, { where: { worker_id: worker_id, day: day } });

    if (!getAvailability) {
      return res.status(404).json({ code: 404, message: "No availability found for the worker on this day. Please Check Availability First" });
    }

    if (startTime >= getAvailability.start_time && endTime <= getAvailability.end_time) {
      console.log('-------available--------');

      const getAppointments = await libs.getAllData(db.appointments, {
        where: {
          worker_id: worker_id, deleted_at: null,
          status: { [Op.ne]: 'Declined' },     // "Pending","Accepted","Declined","Completed"
          [Op.or]: [
            // Partial overlap: Check if the start date or end date of an existing booking falls within the requested date range
            // { 
            //   [Op.and]: [ 
            //     { start_time: { [Op.lte]: end_time } }, // Existing booking starts before or on the requested end date
            //     { end_time: { [Op.gte]: start_time } },     // Existing booking ends after or on the requested start date
            //   ]
            // },
            // // Complete overlap: Check if the requested date range falls within an existing booking
            // { 
            //   [Op.and]: [
            //     { start_time: { [Op.lte]: start_time } }, // Existing booking starts before or on the requested start date
            //     { end_time: { [Op.gte]: end_time } },     // Existing booking ends after or on the requested end date
            //   ]
            // },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: start_time } },
                { end_time: { [Op.gte]: start_time } }
              ]
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: end_time } },
                { end_time: { [Op.gte]: end_time } }
              ]
            },
            {
              [Op.or]: [
                { start_time: { [Op.between]: [start_time, end_time] } },
                { end_time: { [Op.between]: [start_time, end_time] } },
              ]
            }
          ],
        },
      });
      const myBookings = getAppointments.filter((booking) => booking.job_poster_id == id);
      if (myBookings && myBookings.length) {
        return res.status(400).json({ code: 400, message: "You have already requested for this time" })
      }

      const unavailableDates = getAppointments.filter((date) => date.status == 'Accepted');

      if (unavailableDates && unavailableDates.length) {
        return res.status(400).json({ code: 400, message: "This time is already booked" })
      }

      const saveData = {
        job_poster_id: id,
        worker_id: worker_id,
        start_time: start_time,
        end_time: end_time,
        title: title
        // day: day,
      }
      const date = new Date(start_time);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);

      const get_worker = await libs.getData(db.users, {
        where: { id: worker_id },
        attributes: ['id', 'first_name', 'last_name', 'device_type', 'device_token', 'country_code', 'mobile_number']
      })

      const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

      const notify_data = {
        title: "Appointment sheduled",
        message: `${fullName} has requested for appointment`,
        imageUrl: `${image_baseUrl}${profile_image}`,
        pushType: '5',
        other_user_id: Number(id)
      }
      if (get_worker.device_type == "Android") {
        Notify.sendNotifyToUser(notify_data, get_worker.device_token)
      } else {
        Notify.sendNotifyTo_Ios(notify_data, get_worker.device_token)
      }
      notify_data.imageUrl = profile_image;

      // const fullMobileNumber = `${get_worker.country_code}${get_worker.mobile_number}`;
      // if (fullMobileNumber) {
      // await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
      // }

      await libs.createData(db.notifications, { user_id: get_worker.id, ...notify_data })
      const save = await libs.createData(db.appointments, saveData);
      return res.status(200).json({ code: 200, message: `Your appointment has been sheduled on ${formattedDate}` })
    } else {
      res.status(404).json({ code: 404, message: "Worker is unavailable at this time" })
    }

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getSheduledMetting = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    let { user_id, page, itemsPerPage } = req.query;
    if (!user_id) {
      return res.status(404).json({ code: 404, message: "user_id is required" });
    }
    page = Number(page) || 1;
    itemsPerPage = Number(itemsPerPage) || 10;
    const offset = (page - 1) * itemsPerPage;

    let user_type = null;
    const query = { deleted_at: null };

    if (profile_type == "JobPoster") {
      query.job_poster_id = id;
      query.worker_id = Number(user_id);
      user_type = "Worker"
    } else {
      query.job_poster_id = Number(user_id);
      query.worker_id = id;
      user_type = "JobPoster"
    }

    let getshedulded = await libs.getAllData(db.appointments, {
      where: query,
      // attributes:["id","user_id","title","message"],
      limit: itemsPerPage,
      offset: offset || 0,
      order: [['created_at', 'DESC']]
    });

    if (getshedulded.length) {
      getshedulded = JSON.parse(JSON.stringify(getshedulded))
      getshedulded.forEach((x) => {
        if (x.status == 'Pending') {
          x.status = 'Wating for approval'
        }
      })
      return res.status(200).json({ code: 200, message: `Get all appointments with ${user_type}`, data: getshedulded });
    }

    res.status(404).json({ code: 404, message: `No data found`, data: getshedulded });

  } catch (err) {
    console.log('-------er-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const editAppointment = async (req, res) => {
  try {
    const { id, first_name, last_name, profile_image } = req.creds;
    const { appointment_id, start_time, end_time, day, title } = req.body;


    if (!appointment_id || !start_time || !end_time || !day) {
      return res.status(404).json({ code: 404, message: "worker_id,start_time,end_time,day is required" });
    }

    const getMyAppointment = await libs.getData(db.appointments, {
      where: { id: appointment_id, deleted_at: null },
      include: {
        model: db.users,
        attributes: ['id', 'first_name', 'last_name', 'device_type', 'device_token', 'notify_count', 'country_code', 'mobile_number',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image']
        ],
        as: "worker"
      },
      attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] }
    });

    const startTime = start_time.substring(11, 19)
    const endTime = end_time.substring(11, 19)
    console.log('------startTime-------', startTime);
    console.log('------endTime-------', endTime);

    const getAvailability = await libs.getData(db.workerAvailability, {
      where: { worker_id: getMyAppointment.worker_id, day: day },
      attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] }
    });

    if (!getAvailability) {
      return res.status(404).json({ code: 404, message: `worker hasn't added their ${day}'s availability` })
    }
    // console.log('--------------getAvailability-----------',getAvailability.toJSON());
    if (startTime >= getAvailability?.start_time && endTime <= getAvailability?.end_time) {
      console.log('-------available--------');

      const getAppointments = await libs.getAllData(db.appointments, {
        where: {
          worker_id: getMyAppointment.worker_id, deleted_at: null,
          status: { [Op.ne]: 'Declined' },     // "Pending","Accepted","Declined","Completed"
          [Op.or]: [
            {
              [Op.and]: [
                { start_time: { [Op.lte]: start_time } },
                { end_time: { [Op.gte]: start_time } }
              ]
            },
            {
              [Op.and]: [
                { start_time: { [Op.lte]: end_time } },
                { end_time: { [Op.gte]: end_time } }
              ]
            },
            {
              [Op.or]: [
                { start_time: { [Op.between]: [start_time, end_time] } },
                { end_time: { [Op.between]: [start_time, end_time] } },
              ]
            }
          ],
        },
      });

      const unavailableDates = getAppointments.filter(date => {
        return date.status === 'Accepted' && date.job_poster_id !== id;
      });

      for (let key of unavailableDates) {
        console.log('------unavailableDates-----', key.toJSON());
      }
      if (unavailableDates && unavailableDates.length) {
        return res.status(400).json({ code: 400, message: "This time is already booked" })
      }

      // const update_data={status: "Pending"}
      // if(start_time){update_data.start_time = start_time}
      // if(end_time){update_data.end_time = end_time}
      // await libs.updateData(db.appointments,update_data,{where:{id: appointment_id}})

      getMyAppointment.status = "Pending";
      if (start_time) { getMyAppointment.start_time = start_time }
      if (end_time) { getMyAppointment.end_time = end_time }
      if (title) { getMyAppointment.title = title }
      await getMyAppointment.save();

      const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

      const notify_data = {
        title: "Appointment date/time changed",
        message: `${fullName} has changed the appointment date/time, pls review it`,
        imageUrl: `${image_baseUrl}${profile_image}`,
        pushType: '5',
        other_user_id: Number(id)
      }
      if (getMyAppointment.worker.device_type == "Android") {
        Notify.sendNotifyToUser(notify_data, getMyAppointment.worker.device_token)
      } else {
        Notify.sendNotifyTo_Ios(notify_data, getMyAppointment.worker.device_token)
      }
      notify_data.imageUrl = profile_image;

      // const fullMobileNumber = `${getMyAppointment.worker.country_code}${getMyAppointment.worker.mobile_number}`;
      // if (fullMobileNumber) {
      // await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
      // }

      await libs.createData(db.notifications, { user_id: getMyAppointment.worker.id, ...notify_data })
      getMyAppointment.worker.notify_count = db.sequelize.literal('notify_count +1')
      await getMyAppointment.worker.save();

      res.status(200).json({ code: 200, message: "Appointment updated successfully" });

    } else {
      res.status(404).json({ code: 404, message: "Worker is unavailable at this time" });
    }
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id, first_name, last_name } = req.creds;
    const { appointment_id } = req.body;

    if (!appointment_id) {
      return res.status(404).json({ code: 404, message: "appointment_id is required" });
    }

    const deleteAppointment = await libs.updateData(db.appointments, { deleted_at: new Date(Date.now()) }, { where: { id: Number(appointment_id) } });

    if (deleteAppointment[0] == 0) {
      return res.status(404).json({ code: 404, message: "Appointment not found with this id" });
    }
    res.status(200).json({ code: 200, message: "Appointment deleted successfully" });

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { id } = req.creds;
    const page = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    const offset = (page - 1) * itemsPerPage;

    const getNotifications = await libs.getAllData(db.notifications, {
      where: { user_id: id, deleted_at: null },
      attributes: ['id', 'user_id', 'title', 'message', 'pushType', 'deleted_at', 'created_at', 'updated_at',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}', imageUrl)`), 'imageUrl']
      ],
      include: {
        model: db.users,
        attributes: ["id", "first_name", "last_name", "profile_image",
          [db.sequelize.literal(`CONCAT('${image_baseUrl}', profile_image)`), 'profile_image']
        ]
      },
      limit: itemsPerPage,
      offset: offset || 0,
      order: [['created_at', 'DESC']]
    });

    await libs.updateData(req.creds, { notify_count: 0 });
    if (getNotifications.length) {
      return res.status(200).json({ code: 200, message: "All notifications", getNotifications });
    }
    res.status(404).json({ code: 404, message: "No data found", getNotifications });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.creds;
    const { notification_id } = req.body;

    await libs.updateData(db.notifications, { deleted_at: new Date(Date.now()) }, { where: { id: notification_id } });

    res.status(200).json({ code: 200, message: "Notification deleted successfully" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const changeRole = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;

    if (profile_type == "JobPoster") {
      req.creds.profile_type = "Worker"
    } else {
      req.creds.profile_type = "JobPoster"
    }
    await req.creds.save();

    res.status(200).json({ code: 200, message: `Role switched to ${req.creds.profile_type}` });
  } catch (err) {
    console.log('-----er------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// -------------------------- Average waiting time Calculate ---------------
async function calculateAverageWaitingTime(db, userId) {
  let averageWaitingTime = 0;

  const rooms = await db.rooms.findAll({
    where: {
      [Op.or]: [{ created_by: userId }, { created_to: userId }],
      deleted_at: null,
    },
    attributes: ['id'],
  });

  const roomIds = rooms.map(room => room.id);

  if (roomIds.length > 0) {
    const messages = await db.chats.findAll({
      where: {
        room_id: { [Op.in]: roomIds },
        deleted_at: null,
      },
      attributes: ['id', 'room_id', 'sender_id', 'receiver_id', 'created_at'],
      order: [['created_at', 'ASC']],
    });

    const sentMessages = messages.filter(msg => msg.sender_id === userId);
    const waitingTimes = [];

    for (const message of sentMessages) {
      const reply = messages.find(
        msg =>
          msg.room_id === message.room_id &&
          msg.sender_id === message.receiver_id &&
          msg.receiver_id === userId &&
          msg.created_at > message.created_at
      );

      if (reply) {
        const timeDiff = Math.floor(
          (new Date(reply.created_at) - new Date(message.created_at)) / 1000
        );
        waitingTimes.push(timeDiff);
      }
    }

    if (waitingTimes.length > 0) {
      const totalWaitingTime = waitingTimes.reduce((sum, time) => sum + time, 0);
      averageWaitingTime = totalWaitingTime / waitingTimes.length;
    }
  }

  if (averageWaitingTime > 0) {
    const minutes = averageWaitingTime / 60;

    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = minutes / 60;
      return Number.isInteger(hours)
        ? `${hours} hr${hours === 1 ? '' : 'sec'}`
        : `${hours.toFixed(1)} hr`;
    }
  } else {
    return 'N/A';
  }
}

// const getMyProfile = async (req, res) => {
//   try {
//     console.log('-------req.query------', req.query);
//     const { id, profile_type } = req.creds;
//     const itemsPerPage = Number(req.query.itemsPerPage) || 10;
//     const page = parseInt(req.query.page) || 1;         // Current page
//     const offset = (page - 1) * itemsPerPage || 0;    // Calculate skip for pagination

//     if (req.creds.profile_image && req.creds.mobile_number) {
//       req.creds.profile_image = `${image_baseUrl}${req.creds.profile_image}`
//     }
//     if (req.creds.work_video_thumbnail) {
//       req.creds.work_video_thumbnail = `${image_baseUrl}${req.creds.work_video_thumbnail}`
//     }
//     if (req.creds.job_video_thumbnail) {
//       req.creds.job_video_thumbnail = `${image_baseUrl}${req.creds.job_video_thumbnail}`
//     }

//     // const getCategory = await libs.getData(db.categories, {
//     //   where: { id: req.creds.category_id },
//     //   attributes: ['category']
//     // })

//     const categoryIds = req.creds.category_id
//       ? req.creds.category_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
//       : [];
//     let categoryNames = '';
//     if (categoryIds.length > 0) {
//       const getCategories = await libs.getAllData(db.categories, {
//         where: { id: { [Op.in]: categoryIds } },
//         attributes: ['category'],
//       });
//       categoryNames = getCategories.map(cat => cat.category).join(', ') || '';
//     }

//     const getSubscription = await libs.getData(db.subscriptions, {
//       where: { user_id: id, subscription_type: 'monthly' },
//       attributes: ['id', 'plan_type', 'start_date', 'expire_date']
//     });
//     console.log('-------getSubscription------', getSubscription?.toJSON());

//     let isSubscription = '0';
//     if (getSubscription && getSubscription.plan_type === 'paid' && getSubscription.expire_date > new Date(Date.now())) {
//       isSubscription = '1';
//       console.log('-------isSubscription------', isSubscription);
//     }

//     let my_data = JSON.parse(JSON.stringify(req.creds))
//     // my_data.category = getCategory?.category || ""
//     my_data.category = categoryNames;
//     my_data.isSubscription = isSubscription

//     const get_imgs = await libs.getAllData(db.user_imgs, {
//       where: { user_id: id },
//       attributes: ['id',
//         [db.sequelize.literal(`CONCAT('${image_baseUrl}',img)`), 'img'],
//       ]
//     })

//     let media_and_project_imgs = await libs.getAllData(db.media_and_projects, {
//       where: { user_id: id },
//       attributes: ['id',
//         [db.sequelize.literal(`CONCAT('${image_baseUrl}',image)`), 'image'],
//       ]
//     })

//     my_data.averageWaitingTime = await calculateAverageWaitingTime(db, id);

//     if (profile_type == 'JobPoster') {
//       let getBookings = await libs.getAllData(db.booking_jobs, {
//         where: { job_poster_id: id, "booking_status": "Completed" },
//         include: [{
//           model: db.users,
//           as: "worker",
//           attributes: ['id', 'first_name', 'last_name', 'deleted_at', 'user_introduction'],
//         }, {
//           model: db.jobs,
//           attributes: ['id', 'title', 'job_poster_id'],
//           include: {
//             model: db.job_images,
//             attributes: [
//               [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
//             ],
//             limit: 1
//           }
//         }, {
//           model: db.ratings,
//           where: { "rated_by": "Worker" },
//           attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
//           required: true
//         }],
//         attributes: { exclude: ['deleted_at', 'created_at'] },
//         order: [['updated_at', 'DESC']],
//         limit: itemsPerPage,
//         offset: offset || 0,
//       });

//       if (getBookings) {
//         getBookings = getBookings?.map(booking => {
//           if (booking.job && booking.job.job_images) {
//             booking.job.job_images = booking.job.job_images?.map(image => image.job_image);
//           }
//           return booking;
//         });
//         return res.status(200).json({ code: 200, message: "View profile of job poster", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
//       } else {
//         return res.status(202).json({ code: 202, message: "Ratings not found", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
//       }
//     } else {
//       let getBookings = await libs.getAllData(db.booking_jobs, {
//         where: { worker_id: id, "booking_status": "Completed" },
//         include: [{
//           model: db.users,
//           as: "job_poster",
//           attributes: ['id', 'first_name', 'last_name', 'deleted_at', 'user_introduction'],
//         }, {
//           model: db.jobs,
//           attributes: ['id', 'title', 'job_poster_id'],
//           include: {
//             model: db.job_images,
//             attributes: [
//               [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
//             ],
//             limit: 1
//           }
//         }, {
//           model: db.ratings,
//           where: { "rated_by": "JobPoster" },
//           attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
//           required: true
//         }],
//         attributes: { exclude: ['deleted_at', 'created_at'] },
//         order: [['updated_at', 'DESC']],
//         limit: itemsPerPage,
//         offset: offset || 0,
//       });

//       if (getBookings) {
//         getBookings = getBookings?.map(booking => {
//           if (booking.job && booking.job.job_images) {
//             booking.job.job_images = booking.job.job_images?.map(image => image.job_image);
//           }
//           return booking;
//         });
//         return res.status(200).json({ code: 200, message: "View profile of worker", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
//       } else {
//         return res.status(202).json({ code: 202, message: "Ratings not found", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
//       }
//     }

//   } catch (err) {
//     console.log('------err------', err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err);
//   }
// };


const getMyProfile = async (req, res) => {
  try {
    console.log('-------req.query------', req.query);
    const { id, profile_type } = req.creds;
    const userData = req.creds;

    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    const page = parseInt(req.query.page) || 1;         // Current page
    const offset = (page - 1) * itemsPerPage || 0;    // Calculate skip for pagination

    if (req.creds.profile_image && req.creds.profile_image?.includes('http') == false) {
      req.creds.profile_image = `${image_baseUrl}${req.creds.profile_image}`
    }
    if (req.creds.work_video_thumbnail) {
      req.creds.work_video_thumbnail = `${image_baseUrl}${req.creds.work_video_thumbnail}`
    }
    if (req.creds.job_video_thumbnail) {
      req.creds.job_video_thumbnail = `${image_baseUrl}${req.creds.job_video_thumbnail}`
    }

    // const getCategory = await libs.getData(db.categories, {
    //   where: { id: req.creds.category_id },
    //   attributes: ['category']
    // })

    // const categoryIds = req.creds.category_id
    //   ? req.creds.category_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    //   : [];

    const categoryIds = req.creds.category_id
      ? String(req.creds.category_id)
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id))
      : [];


    let categoryNames = '';
    if (categoryIds.length > 0) {
      const getCategories = await libs.getAllData(db.categories, {
        where: { id: { [Op.in]: categoryIds } },
        attributes: ['category'],
      });
      categoryNames = getCategories.map(cat => cat.category).join(', ') || '';
    }

    const getSubscription = await libs.getData(db.subscriptions, {
      where: { user_id: id, subscription_type: 'monthly' },
      attributes: ['id', 'plan_type', 'start_date', 'expire_date']
    });
    console.log('-------getSubscription------', getSubscription?.toJSON());

    let isSubscription = '0';
    if (getSubscription && getSubscription.plan_type === 'paid' && getSubscription.expire_date > new Date(Date.now())) {
      isSubscription = '1';
      console.log('-------isSubscription------', isSubscription);
    }

    let my_data = JSON.parse(JSON.stringify(req.creds))
    // my_data.category = getCategory?.category || ""
    my_data.category = categoryNames;
    my_data.isSubscription = isSubscription

    const get_imgs = await libs.getAllData(db.user_imgs, {
      where: { user_id: id },
      attributes: ['id',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}',img)`), 'img'],
      ]
    })

    let media_and_project_imgs = await libs.getAllData(db.media_and_projects, {
      where: { user_id: id },
      attributes: ['id',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}',image)`), 'image'],
      ]
    })

    my_data.averageWaitingTime = await calculateAverageWaitingTime(db, id);

    const blockedUsersSubquery = db.sequelize.literal(`(
      SELECT blocked_user FROM blocks WHERE blocked_by = :id AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = :id AND deleted_at IS NULL
    )`);

    if (profile_type == 'JobPoster') {
      let getBookings = await libs.getAllData(db.booking_jobs, {
        // where: { 
        //   job_poster_id: id, 
        //   "booking_status": 
        //   "Completed" 
        // },
        where: {
          job_poster_id: id,
          "booking_status": 'Completed',
          worker_id: { [Op.notIn]: blockedUsersSubquery },
        },
        include: [{
          model: db.users,
          as: "worker",
          attributes: ['id', 'first_name', 'last_name', 'deleted_at', 'user_introduction'],
        }, {
          model: db.jobs,
          attributes: ['id', 'title', 'job_poster_id'],
          include: {
            model: db.job_images,
            attributes: [
              [db.sequelize.literal(`CONCAT('${image_baseUrl}',job_image)`), 'job_image'],
            ],
            limit: 1
          }
        }, {
          model: db.ratings,
          where: { "rated_by": "Worker" },
          attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
          required: true
        }],
        attributes: { exclude: ['deleted_at', 'created_at'] },
        order: [['updated_at', 'DESC']],
        limit: itemsPerPage,
        offset: offset || 0,
        replacements: { id },
      });

      if (getBookings) {
        getBookings = getBookings?.map(booking => {
          if (booking.job && booking.job.job_images) {
            booking.job.job_images = booking.job.job_images?.map(image => image.job_image);
          }
          return booking;
        });
        return res.status(200).json({ code: 200, message: "View profile of job poster", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
      } else {
        return res.status(202).json({ code: 202, message: "Ratings not found", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
      }
    } else {
      let getBookings = await libs.getAllData(db.booking_jobs, {
        // where: { worker_id: id, "booking_status": "Completed" },
        where: {
          worker_id: id,
          "booking_status": 'Completed',
          job_poster_id: { [Op.notIn]: blockedUsersSubquery },
        },
        include: [{
          model: db.users,
          as: "job_poster",
          attributes: ['id', 'first_name', 'last_name', 'deleted_at', 'user_introduction'],
        }, {
          model: db.jobs,
          attributes: ['id', 'title', 'job_poster_id'],
          include: {
            model: db.job_images,
            attributes: [
              [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
            ],
            limit: 1
          }
        }, {
          model: db.ratings,
          where: { "rated_by": "JobPoster" },
          attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
          required: true
        }],
        attributes: { exclude: ['deleted_at', 'created_at'] },
        order: [['updated_at', 'DESC']],
        limit: itemsPerPage,
        offset: offset || 0,
        replacements: { id },
      });

      if (getBookings) {
        getBookings = getBookings?.map(booking => {
          if (booking.job && booking.job.job_images) {
            booking.job.job_images = booking.job.job_images?.map(image => image.job_image);
          }
          return booking;
        });

        if (userData.stripe_account_id && userData.stripe_enabled != '1') {
          const check_bank_account = await stripe.accounts.retrieve(userData.stripe_account_id);
          console.log("------capabilities------:", check_bank_account.capabilities);
          console.log("----Bank account data------:", check_bank_account.external_accounts.data);

          if (check_bank_account.external_accounts?.data?.length > 0 && (check_bank_account.capabilities.card_payments == 'active' && check_bank_account.capabilities.transfers == 'active')) {
            console.log("Bank account exists:", check_bank_account.external_accounts.data[0].id);

            const update_dt = {
              // stripe_account_id: account.id,
              stripe_enabled: '1',
            }
            my_data.stripe_enabled = '1'
            const user = await libs.updateData(userData, update_dt)

            console.log("stripe account is connected.");
            // return res.status(400).json({ code: 400, message: "stripe account is already connected" })
          } else {
            console.log("No bank account added yet.");
          }
        }

        return res.status(200).json({ code: 200, message: "View profile of worker", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
      } else {
        return res.status(202).json({ code: 202, message: "Ratings not found", data: my_data, get_imgs: get_imgs, previous_works: getBookings, media_and_project_imgs: media_and_project_imgs });
      }
    }

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const searchWorker = async (req, res) => {
  try {
    const { id } = req.creds;
    const search = req.query.search || '';
    let { category_id } = req.query;
    console.log('----------req.query-------', req.query);

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    const offset = (page - 1) * itemsPerPage;

    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!latitude || !longitude) {
      return res.status(404).json({ code: 404, message: `latitude,longitude are required` });
    }

    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    const baseAttributes = [
      'id',
      'first_name',
      'last_name',
      'profile_type',
      'overall_rating',
      'top_verified',
      'category_id',
      [db.sequelize.literal(`CONCAT("${process.env.image_baseUrl}", profile_image)`), 'profile_image'],
      [db.sequelize.literal(`ROUND(
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(latitude))
        ), 2)`), 'distance'],
      [db.sequelize.literal(`(
        SELECT GROUP_CONCAT(category SEPARATOR ', ')
        FROM categories
        WHERE FIND_IN_SET(id, users.category_id)
      )`), 'categories']
    ];

    const commonWhere = {
      is_verified: 1,
      profile_type: "Worker",
      action: { [Op.not]: "Disable" },
      deleted_at: null,
      id: {
        [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)]
      },
    };

    const distanceCondition = db.sequelize.where(
      db.sequelize.literal(`6371 * acos(
        cos(radians(${latitude})) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * sin(radians(latitude)))
      `),
      '<=',
      100   //km,If you want within 100 miles, change 6371 → 3959
    );

    if (search?.trim() || category_id) {
      const whereCondition = { ...commonWhere };

      if (search) {
        whereCondition[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } }
        ];
      }

      const andConditions = [distanceCondition];

      if (category_id && category_id != '0') {
        const categories = category_id.split(',').map(id => id.trim());
        const findInSetCondition = categories.map(category => {
          return `FIND_IN_SET('${category}', category_id) > 0`;
        }).join(' OR ');
        andConditions.push(db.sequelize.literal(`(${findInSetCondition})`));
      }

      const getWorkers = await db.users.findAll({
        where: {
          ...whereCondition,
          [Op.and]: andConditions
        },
        attributes: baseAttributes,
        limit: itemsPerPage,
        offset,
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        code: 200,
        message: getWorkers.length ? "Get workers" : "Data not found",
        data: getWorkers
      });

    } else {
      const query = {
        ...commonWhere,
        [Op.and]: [
          distanceCondition,
          db.sequelize.literal(`NOT EXISTS (
            SELECT 1 FROM booking_jobs bj 
            WHERE bj.worker_id = users.id AND bj.booking_status = 'Hired'
          )`)
        ]
      };

      const AvailableRightNow = await db.users.findAll({
        where: query,
        attributes: baseAttributes,
        limit: itemsPerPage,
        offset,
        order: [[db.sequelize.col('distance'), 'ASC']],
      });

      return res.status(200).json({
        code: 200,
        message: AvailableRightNow.length ? "Get workers" : "Data not found",
        data: AvailableRightNow
      });
    }

  } catch (err) {
    console.log('----err--------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const addRecentSearch = async (req, res) => {
  try {
    const { id } = req.creds;
    const { user_id, search } = req.body;

    const data = { search_by: id, user_id: user_id };

    const getRecents = await libs.getData(db.recents, { where: data });

    if (getRecents) {
      getRecents.updated_at = new Date(Date.now());
      getRecents.deleted_at = null;
      await getRecents.save();
      return res.status(200).json({ code: 200, message: "Already added" });
    }

    await libs.createData(db.recents, { ...data, search: search });

    res.status(200).json({ code: 200, message: "Recent search added" });

  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getRecentSearches = async (req, res) => {
  try {
    const { id } = req.creds;
    let getRecents = await libs.getAllData(db.recents, {
      where: { search_by: id, deleted_at: null },
      attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
      include: {
        model: db.users,
        attributes: ['id', 'first_name', 'last_name', 'category_id', [
          db.sequelize.literal(`CONCAT("${process.env.image_baseUrl}", profile_image)`),
          'profile_image',
        ]],
        // include: {
        //   model: db.categories,
        //   attributes: ['category']
        // }
      },
      order: [["updated_at", "DESC"]]
    });

    if (getRecents.length) {
      getRecents = JSON.parse(JSON.stringify(getRecents));

      for (let job of getRecents) {
        const categoryIds = job.category_id?.split(',').map(id => Number(id.trim())) || [];

        const categories = await libs.getAllData(db.categories, {
          where: { id: categoryIds },
          attributes: ['category'],
          raw: true
        });
        job.category = {
          category: categories.map(cat => cat.category).join(', ')
        };
      }
      return res.status(200).json({ code: 200, message: "Get Recents searches", data: getRecents });
    }
    res.status(404).json({ code: 404, message: "Data not found" });

  } catch (err) {
    console.log('-------er-r------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const deleteRecentSearch = async (req, res) => {
  try {
    const { id } = req.creds;
    const { recent_id } = req.body;
    const query = { search_by: id };
    if (recent_id) {
      query.user_id = recent_id;
    }
    console.log('----query------', query);
    await libs.updateData(db.recents, { deleted_at: new Date(Date.now()) }, { where: query });

    res.status(200).json({ code: 200, message: "Search deleted successfully" });
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const findBothNearOrRecentWorkers = async (req, res) => {
  try {
    // const {id,latitude,longitude} = req.creds;
    // const {type} = req.query;     // 'nearby' , 'recent'

    const page = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    const offset = (page - 1) * itemsPerPage;

    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!latitude || !longitude) {
      return res.status(404).json({ code: 404, message: `latitude,longitude are required` });
    }

    let query = {
      profile_type: "Worker",
      is_verified: 1,
      deleted_at: null
    };

    const getRecent = await libs.getAllData(db.users, {
      where: query,
      attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified',
        [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
        [db.sequelize.literal(`ROUND(
          6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance'
        ]],
      limit: itemsPerPage, // Limit the results to 10 users
      offset: offset || 0,
      order: [['id', 'DESC']],
    });

    query[Op.and] = [
      db.sequelize.where(db.sequelize.literal(`6371 * acos(
        cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
        sin(radians(${latitude})) * sin(radians(latitude)))`), '<=', 500 // 500 km radius
      )
    ];

    const getNearby = await libs.getAllData(db.users, {
      where: query,
      attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified',
        [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
        [db.sequelize.literal(`ROUND(
          6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance'
        ]],
      limit: itemsPerPage, // Limit the results to 10 users
      offset: offset || 0,
      order: [[db.sequelize.col('distance'), 'ASC']],
    });

    res.status(200).json({ code: 200, message: `Get recent and nearby workers`, getRecent: getRecent, getNearby: getNearby });
  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// const findNearOrRecentWorkers = async (req, res) => {
//   try {
//     const { id, profile_type } = req.creds;
//     const { type } = req.query;     // 'nearby', 'recent', 'both'

//     const page = Number(req.query.page) || 1;
//     const itemsPerPage = Number(req.query.itemsPerPage) || 10;
//     const offset = (page - 1) * itemsPerPage;

//     const latitude = Number(req.query.latitude);
//     const longitude = Number(req.query.longitude);
//     let msg_count = null;

//     if (!latitude || !longitude) {
//       return res.status(404).json({ code: 404, message: `latitude,longitude are required` });
//     }
//     // Determine the unseen message column dynamically
//     const unseenColumn = profile_type === "JobPoster" ? "job_poster_unseen" : "worker_unseen_count";

//     // Calculate unseen messages using Sequelize
//     const msgCountResult = await db.rooms.findOne({
//       attributes: [[db.sequelize.fn("SUM", db.sequelize.col(unseenColumn)), "msg_count"]],
//       where: {
//         [Op.or]: [{ created_by: id }, { created_to: id },],
//         deleted_at: null,
//       },
//       raw: true,
//     });

//     msg_count = msgCountResult.msg_count || 0;


//     //   const getCount = await libs.countDocs(db.rooms,{where:{
//     //     [Op.or]:[{created_by: id},]
//     //   }})

//     // msg_count = msgCountResult.msg_count || 0;

//     const blockedUsersSubquery = `(
//       SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
//       UNION
//       SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
//     )`;

//     let query = {
//       profile_type: "Worker",
//       is_verified: 1,
//       deleted_at: null,
//       id: {
//         [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)]
//       },
//     };

//     let orderCriteria;

//     if (type == 'both' || !type) {
//       const getRecent = await libs.getAllData(db.users, {
//         where: query,
//         attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified',
//           [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
//           [db.sequelize.literal(`ROUND(
//             6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
//             sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance'
//           ]],
//         limit: itemsPerPage, // Limit the results to 10 users
//         offset: offset || 0,
//         order: [['id', 'DESC']],
//       });

//       query[Op.and] = [
//         db.sequelize.where(db.sequelize.literal(`6371 * acos(
//           cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
//           sin(radians(${latitude})) * sin(radians(latitude)))`), '<=', 100 // 100 km radius
//         )
//       ];

//       const getNearby = await libs.getAllData(db.users, {
//         where: query,
//         attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified',
//           [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
//           [db.sequelize.literal(`ROUND(
//             6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
//             sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance'
//           ]],
//         limit: itemsPerPage, // Limit the results to 10 users
//         offset: offset || 0,
//         order: [[db.sequelize.col('distance'), 'ASC']],
//       });
//       console.log('----------12345-------')
//       return res.status(200).json({ code: 200, message: `Get recent and nearby workers`, msg_count: msg_count, getRecent: getRecent, getNearby: getNearby });
//     }
//     else if (type == 'nearby') {
//       query[Op.and] = [
//         db.sequelize.where(db.sequelize.literal(`6371 * acos(
//           cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
//           sin(radians(${latitude})) * sin(radians(latitude)))`), '<=', 100 // 100 km radius
//         )
//       ];
//       orderCriteria = [[db.sequelize.col('distance'), 'ASC']];
//     } else if (type == 'recent') {
//       orderCriteria = [['id', 'DESC']];
//     }

//     const get_data = await libs.getAllData(db.users, {
//       where: query,
//       attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified',
//         [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
//         [db.sequelize.literal(`ROUND(
//           6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
//           sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance'
//         ]],
//       limit: itemsPerPage, // Limit the results to 10 users
//       offset: offset || 0,
//       order: orderCriteria,
//     });


//     const obj = {}
//     if (type == 'recent') {
//       obj.recent = get_data
//     } else if (type == 'nearby') {
//       obj.nearby = get_data
//     }

//     res.status(200).json({ code: 200, message: `Get ${type} workers`, msg_count: msg_count, getRecent: obj.recent || [], getNearby: obj.nearby || [] });
//     // res.status(200).json({code:200,message:`Get ${type} workers`,data :getNearby});
//   } catch (err) {
//     console.log('-------err-------', err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err);
//   }
// };

const findNearOrRecentWorkers = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    let { category_id } = req.query;

    const page = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    const offset = (page - 1) * itemsPerPage;

    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    let msg_count = null;

    if (!latitude || !longitude) {
      return res.status(404).json({ code: 404, message: `latitude,longitude are required` });
    }

    const unseenColumn = profile_type === "JobPoster" ? "job_poster_unseen" : "worker_unseen_count";

    const msgCountResult = await db.rooms.findOne({
      attributes: [[db.sequelize.fn("SUM", db.sequelize.col(unseenColumn)), "msg_count"]],
      where: {
        [Op.or]: [{ created_by: id }, { created_to: id }],
        deleted_at: null,
      },
      raw: true,
    });

    msg_count = msgCountResult.msg_count || 0;

    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    let query = {
      profile_type: "Worker",
      is_verified: 1,
      deleted_at: null,
      id: {
        [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)]
      },
    };

    query[Op.and] = [
      db.sequelize.where(db.sequelize.literal(`6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude)))`), '<=', 500 // 500 km radius
      )
    ];

    if (category_id) {
      const categories = category_id.split(',').map(id => id.trim());
      const findInSetCondition = categories.map(category => {
        return `FIND_IN_SET('${category}', category_id) > 0`;
      }).join(' OR ');
      query[Op.and].push(db.sequelize.literal(`(${findInSetCondition})`));
    }

    //--------------------------Top_Rated_Near_You ----------------------------------------------------------------
    // List users from the Users table with an overall rating greater than 3, filtered by category
    const getNearby = await libs.getAllData(db.users, {
      where: {
        ...query,
        overall_rating: { [Op.gte]: 3 }
      },
      attributes: [
        'id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified', 'category_id',
        [
          db.sequelize.literal(`CASE WHEN profile_image LIKE 'http%' THEN profile_image 
          ELSE CONCAT('${image_baseUrl}', profile_image) END`), 'profile_image'
        ],
        [db.sequelize.literal(`ROUND(
          6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance']
      ],
      limit: itemsPerPage,
      offset: offset,
      order: [
        [db.sequelize.col('overall_rating'), 'DESC'],
        [db.sequelize.col('distance'), 'ASC']
      ],
    });
    //--------------------------Top_Rated_Near_You ----------------------------------------------------------------

    //--------------------------Trending_Raketeers ----------------------------------------------------------------
    // List users who have multiple job entries in the Jobs table and whose profiles are completed and hired
    const topWorkers = await libs.getAllData(db.users, {
      where: {
        ...query,
      },
      include: [{
        model: db.booking_jobs,
        where: {
          booking_status: { [Op.in]: ['Completed', 'Hired'] },
        },
        required: true,
        attributes: [],
      }],
      attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified', 'category_id',
        [
          db.sequelize.literal(`CASE WHEN profile_image LIKE 'http%' THEN profile_image 
          ELSE CONCAT('${image_baseUrl}', profile_image) END`), 'profile_image'
        ],
        [db.sequelize.literal(`ROUND(6371 * acos(cos(radians(${latitude})) * 
          cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) 
          * sin(radians(latitude))), 2)`), 'distance',
        ],
        [db.sequelize.literal(`(SELECT COUNT(*) FROM booking_jobs bj WHERE bj.worker_id = users.id AND bj.booking_status IN ('Completed', 'Hired'))`), 'total_jobs',],
      ],
      limit: itemsPerPage,
      offset: offset,
      order: [[db.sequelize.col('distance'), 'ASC']],
    });
    //--------------------------Trending_Raketeers ----------------------------------------------------------------

    //--------------------------Available_Right_Now ----------------------------------------------------------------
    // List users whose booking_status in the Jobs table is not equal to 'Hired'
    const AvailableRightNow = await libs.getAllData(db.users, {
      where: {
        ...query,
        [Op.and]: [
          ...(query[Op.and] || []),
          db.sequelize.literal(`NOT EXISTS (
            SELECT 1 FROM booking_jobs bj 
              WHERE bj.worker_id = users.id AND bj.booking_status = 'Hired'
            )`)
        ]
      },
      attributes: [
        'id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified', 'category_id',
        [
          db.sequelize.literal(`CASE WHEN profile_image LIKE 'http%' THEN profile_image 
          ELSE CONCAT('${image_baseUrl}', profile_image) END`), 'profile_image'
        ],
        [db.sequelize.literal(`ROUND(6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * sin(radians(latitude))
        ), 2)`), 'distance'],
      ],
      limit: itemsPerPage,
      offset: offset,
      order: [[db.sequelize.col('distance'), 'ASC']],
    });
    //--------------------------Available_Right_Now ----------------------------------------------------------------

    //--------------------------Experienced_And_Trusted ----------------------------------------------------------------
    // List users with more than 3 ratings and over 5 years of experience
    const ExperiencedAndTrusted = await libs.getAllData(db.users, {
      where: {
        ...query,
        overall_rating: { [Op.gte]: 3 },
        experience_years: { [Op.gt]: 4 }
      },
      attributes: [
        'id', 'first_name', 'last_name', 'profile_type', 'overall_rating', 'top_verified', 'category_id',
        [
          db.sequelize.literal(`CASE WHEN profile_image LIKE 'http%' THEN profile_image 
          ELSE CONCAT('${image_baseUrl}', profile_image) END`), 'profile_image'
        ],
        [db.sequelize.literal(`ROUND(
          6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance']
      ],
      limit: itemsPerPage,
      offset: offset,
      order: [
        [db.sequelize.col('overall_rating'), 'DESC'],
        [db.sequelize.col('distance'), 'ASC']
      ],
    });
    //--------------------------Experienced_And_Trusted ----------------------------------------------------------------

    return res.status(200).json({
      code: 200,
      message: `Get recent and nearby workers`,
      msg_count,
      Top_Rated_Near_You: getNearby,
      Trending_Raketeers: topWorkers,
      Available_Right_Now: AvailableRightNow,
      Experienced_And_Trusted: ExperiencedAndTrusted,
    });

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const share_users_lisitng = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;

    const page = Number(req.query.page) || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 50;
    const offset = (page - 1) * itemsPerPage;
    // const latitude = Number(req.query.latitude);
    // const longitude = Number(req.query.longitude);

    // if (!latitude || !longitude) {
    //   return res.status(404).json({ code: 404, message: `latitude,longitude are required` });
    // }
    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    let query = {
      profile_type: "Worker",
      is_verified: 1,
      deleted_at: null,
      id: {
        [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)]
      },
    };

    const getRecent = await libs.getAllData(db.users, {
      where: query,
      attributes: ['id', 'first_name', 'last_name', 'profile_type', 'overall_rating',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}', profile_image)`), 'profile_image'],
        // [db.sequelize.literal(`ROUND(
        //   6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) +
        //   sin(radians(${latitude})) * sin(radians(latitude))), 2)`), 'distance']
      ],
      limit: itemsPerPage, // Limit the results to 10 users
      offset: offset || 0,
      order: [['id', 'DESC']],
    });

    res.status(200).json({ code: 200, message: `Get recent worker`, data: getRecent });
  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};




const subscribe = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const { plan_type, start_date, subscription_type, expire_date, purchase_token, transaction_id } = req.body;
    console.log('-------req.body------', req.body);

    // if(!plan_type || !start_date || !subscription_type || !expire_date || !purchase_token || !transaction_id){
    //   return res.status(404).json({ code: 404, message: "plan_type, start_date,subscription_type, expire_date, purchase_token, transaction_id is required"});
    // }    
    if (!plan_type) {
      return res.status(404).json({ code: 404, message: "plan_type is required" });
    }

    if (subscription_type == 'top_user') {
      const getUser = await libs.getData(db.subscriptions, {
        where: { user_id: id, subscription_type: subscription_type }    // "monthly","top_user"
      });
      if (getUser) {
        return res.status(200).json({ code: 200, message: "Already subscribed", data: getUser });
      }
    } else {
      const getUser1 = await libs.getData(db.subscriptions, {
        where: {
          user_id: id, subscription_type: subscription_type,
          expire_date: { [Op.gt]: new Date(Date.now()) }
        }    // "monthly","top_user"
      });
      if (getUser1) {
        return res.status(200).json({ code: 200, message: "Already subscribed", data: getUser1 });
      }
    }

    const data = {
      user_id: id,
      plan_type: plan_type,
      start_date: start_date,
      expire_date: expire_date,
      subscription_type: subscription_type,
      purchase_token: purchase_token,
      transaction_id: transaction_id,
    }
    // Original date
    // const originalDate = new Date(start_date);
    // originalDate.setMonth(originalDate.getMonth() + 1);
    // // Format the date as desired (e.g., ISO format)
    // const newDate = originalDate.toISOString();
    // console.log(newDate);

    const save_subscribe = await libs.createData(db.subscriptions, data)

    if (subscription_type == 'top_user') {
      await libs.updateData(req.creds, { top_verified: '1' })
    } else {
      let type = plan_type == 'paid' ? '1' : '0';
      await libs.updateData(req.creds, { isSubscription: type })
    }

    res.status(200).json({ code: 200, message: "Subscribed successfully", data: save_subscribe });
  } catch (err) {
    console.log('---err---', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getSubscribe = async (req, res) => {
  try {
    const { id } = req.creds;
    const { subscription_type } = req.query;

    const get_data = await libs.getData(db.subscriptions, {
      where: { user_id: id, subscription_type: subscription_type || "subscription_1" }
    });

    if (!get_data) {
      return res.status(404).json({ code: 404, message: "Subscription not found" });
    }
    res.status(200).json({ code: 200, message: "Get subscription detail", data: get_data })

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};






const accountDeletion = async (req, res) => {
  try {
    const { message } = req.query;
    return res.render('send_email', { message: message || '' })

  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const getEmail = await libs.getData(db.users, { where: { email: email, deleted_at: null } });
    console.log('-------getEmail------', JSON.parse(JSON.stringify(getEmail)));
    if (getEmail) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      getEmail.otp = otp;
      await getEmail.save();
      const data = {
        email: email,
        subject: "Account deletion mail",
        text: `Your otp is ${otp}`
      }
      commonFunc.send_mail(data);
      return res.render('deletion', { email: email, message: "" })
    }
    return res.redirect("/user/accountDeletion?message=This email doesn't exist")
    // return res.render('send_email',{email:email,message:"This email doesn't exist"})
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};
const account_Deletion = async (req, res) => {
  try {
    let { email, otp } = req.body;
    otp = Number(otp)
    console.log('---------req.body---------', req.body);
    const getEmail = await libs.getData(db.users, { where: { email: email, deleted_at: null } });
    if (getEmail.otp == otp) {
      getEmail.otp = null;
      getEmail.deleted_at = +new Date(Date.now());
      await getEmail.save();
      return res.render('deletion', { email: "", message: "Account deleted successfully" })
    } else {
      return res.render('deletion', { email: email, message: "Wrong otp" })
    }
  } catch (err) {
    console.log('-----err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const skipStripe = async (req, res) => {
  try {
    await libs.updateData(req.creds, { 
      stripe_skip: 1 // NEW FIELD ADDED
    });

    return res.status(200).json({
      code: 200,
      message: "User skipped Stripe successfully"
    });

  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};



module.exports = {
  signup, editProfile, forgotPassword, completeProfile, changePassword, verifyEmail, login, socialLogin, logout, deleteAccount, myJobs, addJob, jobDetail, editJob, deleteJob, shareJob, sendMessage, createRoom, deleteRoom, getAllRooms, getAllMessages, is_seen, blockUnblock, myBlockList, viewApplicants, reportsListing, report, categoriesListing, updateApplicantStatus, rateNow, viewProfile_PreviousWork, update_location, workerAllRating, checkAvailability, sheduleMetting, getSheduledMetting, editAppointment, deleteAppointment, getAllNotifications, deleteNotification, changeRole, getMyProfile, searchWorker, addRecentSearch, getRecentSearches, deleteRecentSearch, findNearOrRecentWorkers, findBothNearOrRecentWorkers, share_users_lisitng, subscribe, getSubscribe, accountDeletion, sendOtp, account_Deletion,skipStripe,
};
