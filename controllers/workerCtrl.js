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
const { base_url, image_baseUrl } = process.env;
// const {paypal_mode,paypal_client_id,paypal_secret_key,base_url,paypal_baseUrl}= process.env

// paypal.configure({
//   'mode': paypal_mode,
//   'client_id':paypal_client_id,
//   'client_secret':paypal_secret_key,
// })


// const getAllJobs = async (req, res) => {
//   try {
//     // const { id, longitude, latitude, area, category_id, swipe_count, swipe_today } = req.creds; 
//     const { id, swipe_count, swipe_today} = req.creds; 

//     const { longitude, latitude, area, category_id } = req.query; 
//     console.log('-----req.query-----',req.query);

//     if(!longitude || !latitude){
//       return res.status(404).json({code: 404,message:"longitude, latitude are required"});
//     }

//     let itemsPerPage = Number(req.query.itemsPerPage) || 10;
//     let page = parseInt(req.query.page) || 1;         // Current page
//     let offset = (page - 1) * Number(itemsPerPage);    // Calculate skip for pagination

//     const getSubscription = await libs.getData(db.subscriptions, {
//       where: { user_id: id, subscription_type: "subscription_1" },
//       attributes: ['id', 'plan_type', 'start_date', 'expire_date']
//     });
//     let check_pl = false;
//     if (getSubscription && getSubscription.plan_type == 'paid' && getSubscription.expire_date < new Date(Date.now())) {
//       check_pl = true;
//       getSubscription.plan_type = 'free';
//       await getSubscription.save();
//     }
//     if (!getSubscription || (getSubscription && getSubscription.plan_type == 'free') || check_pl) {

//       const current_Date = new Date(Date.now());
//       // const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
//       current_Date.setHours(0, 0, 0, 0)
//       const currentDate = current_Date.toISOString();

//       if (!swipe_today) { req.creds.swipe_today = currentDate; }

//       if (swipe_today && swipe_today.toISOString() == currentDate && swipe_count >= 10) {
//         return res.status(404).json({ code: 404, message: "You are on free plan you can only swipe 10 jobs/day" });
//       } else if (swipe_today && swipe_today.toISOString() < currentDate) {
//         req.creds.swipe_today = currentDate;
//         req.creds.swipe_count = 0;
//       }
//       await req.creds.save();
//     }

//     const areaKm = (area || 500) * 1.60934; // Convert miles to kilometers
//     console.log('-------areaKm-----',areaKm);

//     let miles_category = [
//       db.sequelize.where(db.sequelize.literal(`6371 * acos(
//         cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))
//       `), '<=', areaKm),  // miles radius
//     ];
//     if (category_id) {
//       miles_category.push({ category_id: category_id });
//     }

//     const getJobs = await libs.getAllData(db.jobs, {
//       where: {
//         status: "posted", deleted_at: null, action: { [Op.not]: "Disable" },
//         id: {
//           [Op.notIn]: [db.sequelize.literal(`SELECT job_id FROM dislikes WHERE dislike_by = ${id}`)],
//         },
//         [Op.and]: miles_category
//       },
//       attributes: ['id', 'title', 'job_poster_id', 'longitude', 'latitude', 'address', 'category_id', 'description', 'price', 'status', 'deleted_at', 'created_at',
//         // [
//         //   db.sequelize.literal(
//         //     `6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))`
//         //   ),
//         //   "distance",
//         // ],
//         [
//           db.sequelize.literal(
//             `ROUND((6371 * acos(cos(radians(${latitude})) * cos(radians(jobs.latitude)) * cos(radians(jobs.longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(jobs.latitude)))) * 0.621371, 2)`
//           ), "miles_distance",
//         ],
//       ],
//       include: [{
//         model: db.categories,
//         attributes: ['category'],
//       }, {
//         model: db.job_images,
//         attributes: ['job_id',
//           [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`),'job_image'],
//         ],
//         // limit:1,
//         required: true
//       }, {
//         model: db.users,
//         attributes: ['id', 'first_name', 'last_name', 'email', 'overall_rating', 'longitude', 'latitude',
//           [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`),'profile_image'],
//         ],
//         as: "jobPosterDetail",
//       }],
//       limit: itemsPerPage,
//       offset: offset || 0,
//       order: [['created_at', 'DESC']]
//     });

//     res.status(200).json({ code: 200, message: `Get some jobs`, getJobs: getJobs });
//   } catch (err) {
//     console.log('-------err------', err);
//     ERROR.INTERNAL_SERVER_ERROR(res, err)
//   }
// };


const identityProof = async (req, res) => {
  try {
    const { id } = req.creds;

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "No file uploaded"
      });
    }

    console.log('------req.file---------', req.file);

    const img = req.file.filename;

    const data = {
      identity_proof: img,
      proof_uploaded: 1
    };

    let saveData = await libs.findAndUpdate(db.users, id, data);

    if (saveData.identity_proof) {
      saveData.identity_proof = `${process.env.image_baseUrl}${saveData.identity_proof}`;
    }
    if (saveData.work_video_thumbnail) {
      saveData.work_video_thumbnail = `${process.env.image_baseUrl}${saveData.work_video_thumbnail}`;
    }
    if (saveData.job_video_thumbnail) {
      saveData.job_video_thumbnail = `${process.env.image_baseUrl}${saveData.job_video_thumbnail}`;
    }
    if (saveData.profile_image) {
      saveData.profile_image = `${process.env.image_baseUrl}${saveData.profile_image}`;
    }

    return res.status(200).json({
      code: 200,
      message: "Identity proof uploaded successfully",
      data: saveData
    });

  } catch (err) {
    console.error('-------err------', err);
    return ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const skipIdentityProof = async (req, res) => {
  try {
    const { id } = req.creds;

    const data = { proof_uploaded: 4 };

    await libs.findAndUpdate(db.users, id, data);

    return res.status(200).json({
      code: 200,
      message: "Identity proof skipped successfully",
    });

  } catch (err) {
    console.error('-------err------', err);
    return ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { id, profile_type, swipe_count, swipe_today ,skip_stripe} = req.creds;
    const { longitude, latitude, area, category_id } = req.query;

    const [results, metadata] = await db.sequelize.query(
      `UPDATE users SET updated_at = NOW() WHERE id = :id`,
      { replacements: { id }, logging: console.log }
    );
    // console.log(results, metadata);

    if (!longitude || !latitude) {
      return res.status(404).json({ code: 404, message: "Longitude and latitude are required" });
    }

    let itemsPerPage = Number(req.query.itemsPerPage) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * Number(itemsPerPage);
    let msg_count = null;

    const getSubscription = await libs.getData(db.subscriptions, {
      where: { user_id: id, subscription_type: "subscription_1" },
      attributes: ['id', 'plan_type', 'start_date', 'expire_date']
    });

    // let check_pl = false;
    if (getSubscription && getSubscription.plan_type === 'paid' && getSubscription?.expire_date < new Date(Date.now())) {
      // check_pl = true;
      getSubscription.plan_type = 'free';
      await getSubscription.save();
      await libs.updateData(req.creds, { isSubscription: '0' })
    }

    // if (!getSubscription || (getSubscription && getSubscription.plan_type === 'free') || check_pl) {
    //   const current_Date = new Date();
    //   current_Date.setHours(0, 0, 0, 0);
    //   const currentDate = current_Date.toISOString();

    //   if (!swipe_today) {
    //     req.creds.swipe_today = currentDate;
    //   }

    //   if (swipe_today && swipe_today.toISOString() === currentDate && swipe_count >= 5) {
    //     return res.status(404).json({ code: 404, message: "You are on a free plan; you can only swipe 5 jobs/day" });
    //   } else if (swipe_today && swipe_today.toISOString() < currentDate) {
    //     req.creds.swipe_today = currentDate;
    //     req.creds.swipe_count = 0;
    //   }
    //   await req.creds.save();
    // }

    const areaKm = (Number(area) || 500) * 1.60934;
    console.log('------areakm-----', areaKm);
    let miles_category = [
      db.sequelize.where(db.sequelize.literal(`6371 * acos(
        cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))
      `), '<=', areaKm)
    ];
    // if (category_id) {
    //   miles_category.push({ category_id: category_id });
    // }

    if (category_id) {
      const categoryArray = category_id.split(',').map(id => Number(id.trim()));
      const findInSetConditions = categoryArray.map(
        (id) => db.sequelize.literal(`FIND_IN_SET(${id}, category_id)`)
      );
      miles_category.push({ [Op.or]: findInSetConditions });
    }

    // Calculate unseen messages using Sequelize
    const unseenColumn = profile_type === "JobPoster" ? "job_poster_unseen" : "worker_unseen_count";
    const msgCountResult = await db.rooms.findOne({
      attributes: [[db.sequelize.fn("SUM", db.sequelize.col(unseenColumn)), "msg_count"]],
      where: {
        [Op.or]: [{ created_by: id }, { created_to: id },],
        deleted_at: null,
      },
      raw: true,
    });
    msg_count = msgCountResult.msg_count || 0;
    // Function to get jobs with or without dislikes
    const fetchJobs = async (excludeDislikes) => {
      let whereClause = {
        status: "posted", deleted_at: null, action: { [Op.not]: "Disable" }, [Op.and]: miles_category,
        job_poster_id: { [Op.ne]: id },
        id: {
          [Op.and]: [{
            [Op.notIn]: [db.sequelize.literal(`SELECT job_id FROM booking_jobs WHERE worker_id = ${id}`)]
          }]
        }
      }

      if (excludeDislikes) {
        whereClause.id[Op.and].push({
          [Op.notIn]: [db.sequelize.literal(`SELECT job_id FROM dislikes WHERE dislike_by = ${id}`)]
        })
      }

      const blockedUsersSubquery = `(
        SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
        UNION
        SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
      )`;

      whereClause[Op.and].push({
        job_poster_id: {
          [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)]
        }
      });

      const randomSeed = Math.floor(Math.random() * 1000000);
      return await libs.getAllData(db.jobs, {
        where: whereClause,
        attributes: ['id', 'title', 'job_poster_id', 'longitude', 'latitude', 'address',
          'category_id', 'description', 'price', 'jobs_date', 'jobs_time', 'min_bids', 'max_bids', 'is_bids_more', 'status', 'deleted_at', 'created_at',
          [db.sequelize.literal(
            `ROUND((6371 * acos(cos(radians(${latitude})) * cos(radians(jobs.latitude)) * cos(radians(jobs.longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(jobs.latitude)))) * 0.621371, 2)`
          ), "miles_distance",],
          [db.sequelize.literal(`(SELECT COUNT(*) FROM booking_jobs WHERE job_id = jobs.id)`),
            "bid_count"]
        ],
        include: [{
          //   model: db.categories,
          //   attributes: ['category'],
          // }, {
          model: db.job_images,
          attributes: [[db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image']],
          // limit:1,
          required: true,
        }, {
          model: db.users,
          attributes: ['id', 'first_name', 'last_name', 'email', 'overall_rating', 'longitude', 'latitude',
            [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image'],
          ],
          as: "jobPosterDetail",
        }],
        limit: itemsPerPage,
        offset: offset || 0,
        order: db.sequelize.literal(`RAND(${randomSeed})`)
      });
    };

    let getJobs = await fetchJobs(true);
    let isLiked = '0';
    if (getJobs.length == 0) {
      getJobs = await fetchJobs(false);
      console.log('----------fetchJobs(false)-------');
      isLiked = '2';
    }
    // const modifiedJobs = getJobs?.map(job => ({
    //   ...job.dataValues,
    //   job_images: job.job_images?.map(image => image.job_image),
    //   bid_count: job.dataValues.bid_count || 0,
    //   isliked: isLiked
    // }));

    getJobs = JSON.parse(JSON.stringify(getJobs));

    for (let job of getJobs) {
      const categoryIds = job.category_id?.split(',').map(id => Number(id.trim())) || [];

      const categories = await libs.getAllData(db.categories, {
        where: { id: categoryIds },
        attributes: ['category'],
        raw: true
      });
      job.job_images = job.job_images?.map(image => image.job_image) || [];
      job.bid_count = job.bid_count || 0;
      job.isliked = isLiked;
      // job.category = categories.map(cat => {category= cat.category}).join(',');
      job.category = {
        category: categories.map(cat => cat.category).join(', ')
      };
    }

    const userDetails = await db.users.findOne({
      where: { id },
      attributes: ['proof_uploaded', 'isProfileCompleted'],
      raw: true
    });

    res.status(200).json({
      code: 200,
      message: `Get some jobs`,
     stripe_skip: stripe_skip,  // ✅ NEW KEY ADDED
      msg_count: msg_count,
      proof_uploaded: userDetails?.proof_uploaded || 0,
      isProfileCompleted: userDetails?.isProfileCompleted || 0,
      getJobs: getJobs
    });

  } catch (err) {
    console.log('-------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const applyJob = async (req, res) => {
  try {
    const { job_id, bid_amount, job_poster_id } = req.body;
    const { id, first_name, last_name, profile_image, swipe_count, swipe_today, isSubscription } = req.creds;

    if (!job_id || !job_poster_id) {
      return res.status(404).json({ code: 404, message: "job_id, bid_amount is required" })
    }

    const data = { job_id: job_id, worker_id: id };

    const get_data = await libs.getData(db.booking_jobs, {
      where: {
        ...data,
        booking_status: { [Op.ne]: "Declined" }
      }
    });

    // cancel job if he select again
    if (get_data) {
      console.log('-----get_data------', JSON.parse(JSON.stringify(get_data)))
      if (get_data.booking_status == "Applied") {
        get_data.booking_status = "Declined"
        await get_data.save();
        return res.status(200).json({ code: 200, message: "You request has been cancelled" });
      }
      return res.status(400).json({ code: 400, message: "You cannot cancel this job" });
    }

    const getSubscription = await libs.getData(db.subscriptions, {
      where: { user_id: id },
      attributes: ['id', 'plan_type', 'start_date', 'expire_date']
    });
    // if (!getSubscription || (getSubscription && getSubscription.plan_type == 'free')) {
    //   const current_Date = new Date(Date.now());
    //   // const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
    //   current_Date.setHours(0, 0, 0, 0)
    //   const currentDate = current_Date.toISOString();

    //   if (swipe_today && swipe_today.toISOString() == currentDate && swipe_count >= 5) {
    //     return res.status(404).json({ code: 404, message: "You are on free plan you can only apply 5 jobs/day" });
    //   } else {
    //     req.creds.swipe_count++;
    //     await req.creds.save();
    //   }
    // }

    if (isSubscription != '1' || !getSubscription || (getSubscription && getSubscription.plan_type == 'free')) {
      const today = new Date(Date.now());
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

      const getAppliedJobs = await libs.getAllData(db.booking_jobs, {
        where: {
          worker_id: id,
          // "booking_status":{[Op.ne]:"Declined"},
          created_at: {
            [Op.between]: [startOfDay, endOfDay], // Filter by today's date range
          }
        }
      });
      console.log('---------getAppliedJobs-------', JSON.parse(JSON.stringify(getAppliedJobs)));
      // if (getAppliedJobs?.length >= 5) {
      //   return res.status(404).json({ code: 404, message: "You are on free plan you can only apply 5 jobs/day" });
      // }
    }

    data.job_poster_id = job_poster_id
    data.bid_amount = bid_amount
    const save_data = await libs.createData(db.booking_jobs, data);

    const getJobPoster = await libs.getData(db.users, {
      where: { id: job_poster_id },
      attributes: ['id', 'device_type', 'device_token', 'country_code', 'mobile_number']
    });

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;
    // send notifications here
    const notify_data = {
      title: `Job request`,
      message: `${fullName} has placed a bid for this job`,
      imageUrl: `${profile_image}`,
      pushType: '1',
      job_id: job_id
    }
    await libs.createData(db.notifications, { user_id: getJobPoster.id, ...notify_data });

    notify_data.imageUrl = `${image_baseUrl}${profile_image}`

    if (getJobPoster.device_type == "Android") {
      Notify.sendNotifyToUser(notify_data, getJobPoster.device_token)
    } else {
      Notify.sendNotifyTo_Ios(notify_data, getJobPoster.device_token)
    }

    // const fullMobileNumber = `${getJobPoster.country_code}${getJobPoster.mobile_number}`;
    // if (fullMobileNumber) {
    // await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    res.status(200).json({ code: 200, message: "Job applied successfully" })
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err)
  }
}

const getMyAppliedJob = async (req, res) => {
  try {
    const { id, profile_type, total_earning } = req.creds;
    //const { booking_status } = req.query;    // "Applied","Hired","Completed", 'Declined'
    console.log('------req.query-------', req.query);
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;

    const page = parseInt(req.query.page) || 1;         // Current page
    const offset = (page - 1) * itemsPerPage;    // Calculate skip for pagination

    const blockedUsersSubquery = `(
      SELECT blocked_user FROM blocks WHERE blocked_by = ${id} AND deleted_at IS NULL
      UNION
      SELECT blocked_by FROM blocks WHERE blocked_user = ${id} AND deleted_at IS NULL
    )`;

    const getAppliedHiredCompJobs = async (booking_status) => {
      let inc = [{
        model: db.jobs,
        attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
        // where: booking_status == 'Completed' ? {} :{deleted_at:null} ,
        include: [{
          model: db.job_images,
          attributes: [[db.sequelize.literal(`CONCAT("${process.env.image_baseUrl}", job_image)`), 'job_image']]
        }, {
          model: db.users,
          as: 'jobPosterDetail',
          // where: booking_status == 'Completed' ? {} :{deleted_at:null} ,
          // where: {
          //   deleted_at: null,
          //   id: { [Op.notIn]: [db.sequelize.literal(blockedUsersSubquery)] }
          // },
          attributes: ['id', 'first_name', 'last_name', 'overall_rating', 'profile_image', 'deleted_at',
            [db.sequelize.literal(`CONCAT("${process.env.image_baseUrl}", profile_image)`), 'profile_image']
          ],
          // }, {
          //   model: db.categories,
          //   attributes: ['category']
        }]
      }]

      if (booking_status == 'Completed') {
        inc.push({
          model: db.ratings,
          where: { rated_by: profile_type },
          attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
          required: false
        })
      }

      let data = await libs.getAllData(db.booking_jobs, {
        where: { worker_id: id, booking_status: booking_status, ...(booking_status !== 'Completed' ? { deleted_at: null } : {}) },
        attributes: {include: [[db.sequelize.literal(`CONCAT('${image_baseUrl}', booking_jobs.invoice_pdf)`),
        'invoice_pdf_url']]},
        include: inc,
        limit: itemsPerPage,
        offset: offset || 0,
        order: [['created_at', 'DESC']]
      });

      data= JSON.parse(JSON.stringify(data));

      // data = data?.map(booking => ({
      //   ...booking,
      //   job: {
      //     ...booking.job,
      //     job_images: booking.job.job_images.map(image => image.job_image)
      //   }
      // }));

      for (let job of data) {
        const categoryIds = job.job.category_id?.split(',').map(id => Number(id.trim())) || [];

        const categories = await libs.getAllData(db.categories, {
          where: { id: categoryIds },
          attributes: ['category'],
          raw: true
        });
        job.job.job_images = job.job.job_images?.map(image => image.job_image) || [];
        job.job.category = {
          category: categories.map(cat => cat.category).join(', ')
        };
      }
      return data;
    }

    const getApplied = await getAppliedHiredCompJobs('Applied');
    const getHired = await getAppliedHiredCompJobs('Hired');
    const getCompleted = await getAppliedHiredCompJobs('Completed');

    res.status(200).json({ code: 200, message: "Get my applied jobs", total_earning: total_earning, getApplied: getApplied, getHired: getHired, getCompleted: getCompleted })
  } catch (err) {
    console.log('-------err--------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err)
  }
}
// here, category_error can occur again
const viewApplicantProfile = async (req, res) => {
  try {
    const { id } = req.creds;
    const job_id = Number(req.query.job_id);
    const worker_id = Number(id);
    console.log('-------req.query------', req.query);

    if (!job_id) {
      return res.status(404).json({ code: 404, message: "job_id, is required" })
    }
    const getApplicant = await libs.getData(db.booking_jobs, {
      where: { job_id: job_id, worker_id: worker_id, deleted_at: null, booking_status: { [Op.ne]: "Declined" } },
      include: [{
        model: db.jobs,
        include: [{
          model: db.job_images,
          attributes: ['job_id',
            [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image'],
          ],
          // limit:1,
          // required:true
        }, {
          model: db.categories,
          attributes: ['id', 'category']
        }, {
          model: db.users,
          attributes: ['id', 'first_name', 'last_name', 'email', 'yelp_account', 'overall_rating'],
          as: "jobPosterDetail"
        }],
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
      }],
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    });
    if (getApplicant) {
      return res.status(200).json({ code: 200, message: "View profile", data: getApplicant });
    } else {
      return res.status(404).json({ code: 404, message: "Data not found" });
    }

  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const viewJobPoster_PreviousWork = async (req, res) => {
  try {
    const { id } = req.creds;
    const user_id = Number(req.query.job_poster_id);
    console.log('-------req.query------', req.query);
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;

    const page = parseInt(req.query.page) || 1;         // Current page
    const offset = (page - 1) * itemsPerPage || 0;      // Calculate skip for pagination

    if (!user_id) { return res.status(404).json({ code: 404, message: "job_poster_id is required" }) };

    const getApplicant = await libs.getData(db.users, {
      where: { id: user_id, deleted_at: null },
      attributes: ['id', 'first_name', 'last_name', 'email', 'yelp_account', 'payment', 'profile_type', 'overall_rating', 'top_verified', 'proof_uploaded', 'stripe_enabled',
        [
          db.sequelize.literal(`CASE
                      WHEN profile_image LIKE 'http%' THEN profile_image
                      ELSE CONCAT("${process.env.image_baseUrl}", profile_image)
                    END
                  `),
          'profile_image',
        ],
      ],
    });

    const getPostedJobsCount = await db.jobs.count({
      where: { job_poster_id: user_id, deleted_at: null }
    });

    let getBookings = await libs.getAllData(db.booking_jobs, {
      where: { job_poster_id: user_id, "booking_status": "Completed", deleted_at: null },
      include: [{
        model: db.users,
        as: "worker",
        attributes: ['id', 'first_name', 'last_name'],
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
        where: { "rated_by": "Worker" },
        attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
        required: true
      }],
      attributes: { exclude: ['deleted_at', 'created_at'] },
      order: [['updated_at', 'DESC']],
      limit: itemsPerPage,
      offset: offset || 0,
    });

    if (getApplicant) {
      getBookings = JSON.parse(JSON.stringify(getBookings))
      getBookings.forEach(booking => {
        if (booking.job && booking.job.job_images) {
          booking.job.job_images = booking.job.job_images.map(img => img.job_image);
        }
      });
      return res.status(200).json({ code: 200, message: "View profile of job poster", data: { ...getApplicant?.toJSON(), previous_jobs: getBookings, getPostedJobsCount: getPostedJobsCount } });
    } else {
      return res.status(404).json({ code: 404, message: "Data not found" });
    }
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const jobPosterAllRating = async (req, res) => {
  try {
    const user_id = Number(req.query.user_id);
    if (!user_id) {
      return res.status(404).json({ code: 404, message: "user_id is required" });
    }
    const getPendingBookings = await libs.getAllData(db.ratings, {
      where: { job_poster_id: user_id, rated_by: "Worker", deleted_at: null },
      attributes: ['id', 'rated_by', 'worker_id', 'job_poster_id', 'rating', 'msg'],
      include: {
        model: db.users,
        attributes: [
          'id', 'first_name', 'last_name',
          [
            db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`),
            'profile_image',
          ],
        ],
        as: 'worker'
      },
      order: [['created_at', 'DESC']],
    })

    if (!getPendingBookings.length) {
      return res.status(404).json({ code: 404, message: "No data found" });
    }
    return res.status(200).json({ code: 200, message: "Get all rating of job poster", data: getPendingBookings })

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// const addAvailability = async (req, res) => {
//   try {
//     const {id} = req.creds;
//     const {start_time,end_time,day,status} = req.body;
//     if(!start_time || !end_time || !day || !status){
//       return res.status(404).json({code:404,message:"start_time, end_time, day, status is required"});
//     }

//     const getDay = await libs.getData(db.workerAvailability,{where:{worker_id:id,day:day}});
//     if(getDay){
//       return res.status(404).json({code:404,message:`Already added ${day}'s time`})
//     }

//     const data={
//       worker_id: id,
//       start_time: start_time,
//       end_time: end_time,
//       day: day,
//       status: status
//     }
//     console.log('---------data--------',data);

//     // const addTime = await libs.createData(db.workerAvailability,data);

//     // const getAvailabilityData = await libs.getAllData(db.workerAvailability,{where:{worker_id: id}});
//     // if(getAvailabilityData && getAvailabilityData.length){    // && getAvailabilityData.length >= 7
//       // const updateData = await libs.updateData(req.creds,{isAvailability: '1'})
//     // }
//     res.status(200).json({code:200,message:"Availablity added",data:req.body})

//   } catch (err) {
//     console.log('-------err-------',err);
//     ERROR.INTERNAL_SERVER_ERROR(res,err);
//   }
// };

// const editAvailability = async (req, res) => {
//   try {
//     const {id} = req.creds;
//     const {availability_id, start_time,end_time,status} = req.body;
//     if(!availability_id){
//       return res.status(404).json({code:404,message:"availability_id is required"});
//     }
//     if(!start_time && !end_time && !status){
//       return res.status(404).json({code:404,message:"start_time, end_time, status atleast one is required"});
//     }
//     const data={}
//     if(start_time){data.start_time = start_time}
//     if(end_time){data.end_time = end_time}
//     if(status){data.status = status}

//     console.log('-----data-----',data);

//     const update_data = await libs.updateData(db.workerAvailability, data, {where:{id: availability_id}});

//     if(update_data[0] !=0){
//       return res.status(200).json({code:200,message:"Availablity updated successfully"})
//     }
//     res.status(404).json({code:404,message:"availability_id not found"});

//   } catch (err) {
//     console.log('-------err-------',err);
//     ERROR.INTERNAL_SERVER_ERROR(res,err);
//   }
// };


const convertTimeTo24Hour = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  console.log('-------time, period------', time, period);

  let [hours, minutes] = time.split(':').map(Number);
  console.log('-------hours, minutes------', hours, minutes);

  if (period.toLowerCase() === 'pm') {  //  && hours !== 12
    hours += 12;
  }
  console.log('---return---', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};
// Convert time from AM/PM to 24-hour format

// const addAvailability = async (req, res) => {
//   try {
//     const { id, profile_type } = req.creds;
//     const availabilityData = req.body;
//     console.log('-------req.body------', req.body);
//     if (profile_type == 'JobPoster') {
//       return res.status(400).json({ code: 400, message: `Your profile_type is JobPoster you can't hit this api` });
//     }
//     // Validate if the request body is an array and not empty
//     if (!Array.isArray(availabilityData) || availabilityData.length !== 7) {
//       return res.status(400).json({ code: 400, message: "Invalid availability data" });
//     }


//     // Validate if all days are provided
//     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const providedDays = availabilityData.map(item => item.day);
//     const missingDays = days.filter(day => !providedDays.includes(day));
//     if (missingDays.length > 0) {
//       return res.status(400).json({ code: 400, message: `Availability data for all days (${missingDays.join(', ')}) is required` });
//     }

//     const getAvailability = await libs.getAllData(db.workerAvailability, { where: { worker_id: id } });
//     if (getAvailability.length == 7) {
//       return res.status(400).json({ code: 400, message: `Availibility already added for all 7 days` });
//     }

//     // Process and save availability data for each day
//     for (const item of availabilityData) {
//       const { day, start_time, end_time, status } = item;

//       const startTime24Hour = status != 0 ? convertTimeTo24Hour(start_time) : ""
//       const endTime24Hour = status != 0 ? convertTimeTo24Hour(end_time) : ""

//       const existingDay = await libs.getData(db.workerAvailability, { where: { worker_id: id, day: day } });
//       if (!existingDay) {
//         // return res.status(400).json({ code: 400, message: `Availability for ${day} already exists` });
//         const data = {
//           worker_id: id,
//           start_time: startTime24Hour,
//           end_time: endTime24Hour,
//           day: day,
//           status: status
//         };
//         console.log('---data------', data);
//         await libs.createData(db.workerAvailability, data);
//       } else {
//         console.log(`----Availability for ${day} already exists----`);
//       }
//     }
//     await libs.updateData(req.creds, { isAvailability: '1' });
//     res.status(200).json({ code: 200, message: "Availability added" });
//   } catch (err) {
//     console.error('Error:', err);
//     res.status(500).json({ code: 500, message: "Internal server error" });
//   }
// };

const convertToAmPmFormat = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  console.log('------hours,minutes---', hours, minutes);
  let hours12 = parseInt(hours);
  const period = hours12 >= 12 ? 'PM' : 'AM';
  hours12 = hours12 % 12 || 12; // Convert 0 to 12 for midnight
  console.log('---------AM/PM---------', `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`);
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

const addAvailability = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const availabilityData = req.body;
    console.log('-------req.body------', req.body);

    if (profile_type == 'JobPoster') {
      return res.status(400).json({ code: 400, message: `Your profile_type is JobPoster you can't hit this api` });
    }

    // Validate if the request body is an array and not empty
    if (!Array.isArray(availabilityData) || availabilityData.length !== 7) {
      return res.status(400).json({ code: 400, message: "Invalid availability data" });
    }

    // Validate if all days are provided
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const providedDays = availabilityData.map(item => item.day);
    const missingDays = days.filter(day => !providedDays.includes(day));

    if (missingDays.length > 0) {
      return res.status(400).json({ code: 400, message: `Availability data for all days (${missingDays.join(', ')}) is required` });
    }

    // const getAvailability = await libs.getAllData(db.workerAvailability, { where: { worker_id: id } });
    // if (getAvailability.length == 7) {
    //   return res.status(400).json({ code: 400, message: `Availibility already added for all 7 days` });
    // }

    const result = [];
    // Process and save availability data for each day
    for (const item of availabilityData) {
      const { day, start_time, end_time, status } = item;
      const startTime24Hour = status != 0 ? convertTimeTo24Hour(start_time) : "";
      const endTime24Hour = status != 0 ? convertTimeTo24Hour(end_time) : "";

      const existingDay = await libs.getData(db.workerAvailability, { where: { worker_id: id, day } });

      const data = {
        worker_id: id,
        start_time: startTime24Hour,
        end_time: endTime24Hour,
        day,
        status
      };

      if (existingDay) {
        // Update if already exists
        await libs.updateData(db.workerAvailability, data, { where: { worker_id: id, day } });
        console.log(`Updated availability for ${day}`);
      } else {
        // Insert if not exists
        await libs.createData(db.workerAvailability, data);
        console.log(`Created availability for ${day}`);
      }
      result.push({
        day,
        start_time: startTime24Hour,
        end_time: endTime24Hour,
        status
      });
    }

    await libs.updateData(req.creds, { isAvailability: '1' });

    const formattedResult = result.map(time => ({
      day: time.day,
      start_time: time.start_time ? convertToAmPmFormat(time.start_time) : "",
      end_time: time.end_time ? convertToAmPmFormat(time.end_time) : "",
      status: time.status
    }));

    res.status(200).json({
      code: 200,
      message: "Availability added/updated successfully",
      data: formattedResult
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

const editAvailability = async (req, res) => {
  try {
    const { id } = req.creds;
    const availabilityData = req.body;
    console.log('-------req.body------', req.body);

    // Validate if the request body is an array and not empty
    if (!Array.isArray(availabilityData) || availabilityData.length !== 7) {
      return res.status(400).json({ code: 400, message: "Invalid availability data" });
    }

    // Iterate over each day's data in the request body
    for (const availability of availabilityData) {
      const { day, start_time, end_time, status } = availability;

      // Convert start_time and end_time from 12-hour format to 24-hour format if needed
      const startTime24Hour = status != 0 ? convertTimeTo24Hour(start_time) : ""
      const endTime24Hour = status != 0 ? convertTimeTo24Hour(end_time) : ""

      // Update data object for the current day
      const data = {
        start_time: startTime24Hour,
        end_time: endTime24Hour,
        status: status,
      };

      console.log('---data------', data);
      // Update availability data in the database for the current day
      await libs.updateData(db.workerAvailability, data, { where: { worker_id: id, day: day } });
    }

    res.status(200).json({ code: 200, message: "Availability updated successfully" });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

const acceptDeclined = async (req, res) => {
  try {
    const { appointment_id, status } = req.body;
    const { id, first_name, last_name, profile_type, profile_image } = req.creds;

    if (!appointment_id || !status) {
      return res.status(404).json({ code: 404, message: "appointment_id,status are required" });
    }
    const status_updated = await libs.findAndUpdate(db.appointments, appointment_id, { status: status }); //"Accepted","Declined"

    const getJobPoster = await libs.getData(db.users, {
      where: { id: status_updated.job_poster_id },
      attributes: ['id', 'first_name', 'last_name', 'device_type', 'device_token', 'notify_count', 'country_code', 'mobile_number',
        [db.sequelize.literal(`CONCAT('${image_baseUrl}', profile_image)`), 'profile_image']]
    })

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;

    const notify_data = {
      title: `Appointment ${status}`,
      message: `${fullName} has ${status} your appointment request`,
      imageUrl: `${profile_image}`,
      pushType: '6',
      other_user_id: Number(id)
    }
    await libs.createData(db.notifications, { user_id: getJobPoster.id, ...notify_data });
    notify_data.imageUrl = `${image_baseUrl}${profile_image}`

    if (getJobPoster.device_type == "Android") {
      Notify.sendNotifyToUser(notify_data, getJobPoster.device_token)
    } else {
      Notify.sendNotifyTo_Ios(notify_data, getJobPoster.device_token)
    }

    // const fullMobileNumber = `${getJobPoster.country_code}${getJobPoster.mobile_number}`;
    // if (fullMobileNumber) {
    //   await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    getJobPoster.notify_count = db.sequelize.literal('notify_count +1')
    await getJobPoster.save()

    res.status(200).json({ code: 200, message: `Appointment ${status}` })

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const dislikeJob = async (req, res) => {
  try {
    const { job_id } = req.body;
    const { id, swipe_count, swipe_today } = req.creds;

    if (!job_id) {
      return res.status(404).json({ code: 404, message: "job_id is required" });
    }
    // const getSubscription = await libs.getData(db.subscriptions, {
    //   where: { user_id: id },
    //   attributes: ['id', 'plan_type', 'start_date', 'expire_date']
    // });
    // if (!getSubscription || (getSubscription && getSubscription.plan_type == 'free')) {
    //   const current_Date = new Date(Date.now());
    //   // const formattedCurrentDate = currentDate.toISOString().slice(0, 10);
    //   current_Date.setHours(0, 0, 0, 0)
    //   const currentDate = current_Date.toISOString();

    //   if (swipe_today && swipe_today.toISOString() == currentDate && swipe_count >= 5) {
    //     return res.status(404).json({ code: 404, message: "You are on free plan you can only swipe 5 jobs/day" });
    //   } else {
    //     req.creds.swipe_count++;
    //     await req.creds.save();
    //   }
    //   // else if(swipe_today < currentDate){
    //   //   // if(swipe_today != currentDate){req.creds.swipe_today = currentDate}
    //   //   req.creds.swipe_count ++;
    //   // }
    // }

    const getAppliedJob = await libs.getData(db.booking_jobs, {
      where: { job_id: job_id, worker_id: id, booking_status: { [Op.ne]: "Declined" } },
      attributes: ['id', 'worker_id', 'booking_status']
    })
    console.log('-----get_data------', JSON.parse(JSON.stringify(getAppliedJob)))

    if (getAppliedJob) {
      if (getAppliedJob.booking_status == "Applied") {
        getAppliedJob.booking_status = "Declined"
        await getAppliedJob.save();
        return res.status(200).json({ code: 200, message: "You request has been cancelled" });
      }
      return res.status(404).json({ code: 404, message: "You cannot dislike or cancel this job" })
    }

    const [getDisliked, created] = await libs.find_Create(db.dislikes, { where: { dislike_by: id, job_id: job_id } });

    if (created) {
      res.status(200).json({ code: 200, message: "Job disliked" })
    } else {
      res.status(200).json({ code: 200, message: "You have already disliked it" });
    }

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const subscribe = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;
    const { plan_type, start_date, expire_date, transcation_id } = req.body;

    if (!plan_type || !start_date || !expire_date || !transcation_id) {
      return res.status(200).json({ code: 200, message: "plan_type,start_date,expire_date,transcation_id are required", data: getUser });
    }
    const query = { user_id: id, subscription_type: "subscription_1", expire_date: { [Op.gt]: new Date(Date.now()) } };

    const getUser = await libs.getData(db.subscriptions, {
      where: query
    });

    if (getUser) {
      return res.status(200).json({ code: 200, message: "Already subscribed", data: getUser });
    }
    const data = {
      ...query,
      plan_type: plan_type,
      start_date: start_date,
      expire_date: expire_date,
      transcation_id: transcation_id
    }
    // Original date
    // const originalDate = new Date(start_date);
    // originalDate.setMonth(originalDate.getMonth() + 1);
    // // Format the date as desired (e.g., ISO format)
    // const newDate = originalDate.toISOString();
    // console.log(newDate);

    const save_subscribe = await libs.createData(db.subscriptions, data)

    res.status(200).json({ code: 200, message: "Subscribed successfully", data: save_subscribe });
  } catch (err) {
    console.log('---err---', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const subscribeTopUser = async (req, res) => {
  try {
    const { id, profile_type, top_verified } = req.creds;
    const { plan_type, start_date, expire_date, transcation_id } = req.body;

    if (!plan_type || !start_date || !transcation_id) {
      return res.status(200).json({ code: 200, message: "plan_type,start_date,transcation_id are required", data: getUser });
    }
    const getUser = await libs.getData(db.subscriptions, {
      where: { user_id: id, subscription_type: "top_user" }
    });
    if (getUser) {
      return res.status(200).json({ code: 200, message: "Already subscribed", data: getUser });
    }
    const data = {
      user_id: id,
      plan_type: plan_type,
      start_date: start_date,
      // expire_date: expire_date,
      transcation_id: transcation_id,
      subscription_type: "top_user"
    }
    // Original date
    // const originalDate = new Date(start_date);
    // originalDate.setMonth(originalDate.getMonth() + 1);
    // // Format the date as desired (e.g., ISO format)
    // const newDate = originalDate.toISOString();
    // console.log(newDate);

    const save_subscribe = await libs.createData(db.subscriptions, data)
    req.creds.top_verified = '1';
    await req.creds.save();

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

const jobDetail = async (req, res) => {
  try {
    const { id, first_name, last_name, profile_image, profile_type } = req.creds;

    const { job_id, latitude, longitude } = req.query;

    console.log('--------req.query-------', req.query);
    console.log('--------job_id-------', job_id);

    if (!job_id || !latitude || !longitude) { return res.status(400).json({ code: 400, message: "job_id,latitude,longitude is required" }) }

    const getJob = await libs.getData(db.jobs, {
      where: { id: Number(job_id), deleted_at: null },
      attributes: ['id', 'title', 'category_id', 'job_poster_id', 'longitude', 'latitude', 'address', 'description', 'status', 'min_bids', 'max_bids',
        [db.sequelize.literal(
          `ROUND((6371 * acos(cos(radians(${latitude})) * cos(radians(jobs.latitude)) * cos(radians(jobs.longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(jobs.latitude)))) * 0.621371, 2)`
        ), "miles_distance"]
      ],
      include: [{
        //   model: db.categories,
        //   attributes: ['category'],
        // }, {
        model: db.users,
        attributes: ['id', 'first_name', 'last_name', 'overall_rating', 'profile_image',
          [db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}', profile_image)`), 'profile_image']
        ],
        as: 'jobPosterDetail'
      }, {
        model: db.job_images,
        attributes: [[db.sequelize.literal(`CONCAT('${process.env.image_baseUrl}',job_image)`), 'job_image']],
      }]
    });
    if (getJob) {
      const get_job = JSON.parse(JSON.stringify(getJob))

      const categoryIds = get_job.category_id?.split(',').map(id => Number(id.trim())) || [];

      const categories = await libs.getAllData(db.categories, {
        where: { id: categoryIds },
        attributes: ['category'],
        raw: true
      });
      get_job.category = categories.map(cat => cat.category).join(', ')
      get_job.isliked = '0'
      get_job.job_images = getJob.job_images?.map(image => image.job_image);

      const getLike = await libs.getData(db.booking_jobs, {
        where: {
          job_id: job_id, worker_id: id,
          [Op.or]: [{ booking_status: 'Applied' }, { booking_status: 'Hired' }, { booking_status: 'Completed' }]
          // booking_status: ['Applied', 'Hired', 'Completed']  //  'Declined'
        }
      })
      if (getLike) {
        get_job.isliked = '1'
      } else {
        const getDislike = await libs.getData(db.dislikes, {
          where: { job_id: job_id, dislike_by: id }
        })
        if (getDislike) {
          get_job.isliked = '2'
        }
      }
      let getBooking = await libs.getData(db.booking_jobs, {
        where: { job_id: job_id, worker_id: id, booking_status: { [Op.ne]: "Declined" } },
        include: {
          model: db.ratings,
          where: { rated_by: "Worker" },
          attributes: { exclude: ['deleted_at', 'created_at', 'updated_at'] },
          required: false
        }
      })
      if (getBooking) {
        const get_booking = JSON.parse(JSON.stringify(getBooking));
        getBooking = {
          booking_id: getBooking.id,
          first_name: first_name,
          last_name: last_name,
          profile_image: `${image_baseUrl}${profile_image}`,
          booking_status: get_booking.booking_status,
          bid_amount: get_booking.bid_amount,
          rated_by: '',
          rating: '',
          msg: '',
        }
        if (get_booking.ratings[0]?.rated_by) { getBooking.rated_by = get_booking.ratings[0].rated_by }
        if (get_booking.ratings[0]?.rating) { getBooking.rating = get_booking.ratings[0].rating }
        if (get_booking.ratings[0]?.msg) { getBooking.msg = get_booking.ratings[0].msg }
      }

      return res.status(200).json({ code: 200, message: "Get single Job", data: get_job, getBooking: getBooking });
    }
    return res.status(200).json({ code: 200, message: "Get single Job", data: getJob, getBooking: null });

  } catch (err) {
    console.log('-----err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const toggleRole = async (req, res) => {
  try {
    const { id, profile_type } = req.creds;

    if (!profile_type || !['JobPoster', 'Worker'].includes(profile_type)) {
      return res.status(400).json({ code: 400, message: "Invalid or missing profile_type" });
    }

    const newRole = profile_type === 'JobPoster' ? 'Worker' : 'JobPoster';

    const updatedUser = await libs.updateData(
      db.users,
      { profile_type: newRole },
      { where: { id } }
    );

    if (updatedUser[0] === 1) {
      req.creds.profile_type = newRole;
      await req.creds.save();

      const fullUser = await db.users.findOne({
        where: { id },
      });
      if (fullUser.profile_image && !fullUser.profile_image.startsWith('http')) {
        fullUser.profile_image = `${image_baseUrl}${fullUser.profile_image}`
      }

      return res.status(200).json({
        code: 200,
        message: `Role switched to ${newRole} successfully`,
        data: fullUser
      });

    } else {
      return res.status(404).json({ code: 404, message: "User not found or role not updated" });
    }

  } catch (err) {
    console.log('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

const completeJobFromWorker = async (req, res) => {
  try {
    const { id, first_name, last_name, profile_image } = req.creds;
    const { job_id } = req.body;
    console.log('-------req.body------', req.body);
    // Validate input
    if (!job_id) {
      return res.status(400).json({ code: 400, message: "job_id is required" });
    }

    // Find the booking job
    const bookingJob = await libs.getData(db.booking_jobs, {
      where: {
        job_id: Number(job_id),
        worker_id: id,
        // booking_status: "Hired",
        deleted_at: null,
      },
      include: [{
        model: db.jobs,
        attributes: ['job_poster_id'],
        where: { deleted_at: null }
      }]
    });

    if (!bookingJob) {
      return res.status(404).json({ code: 404, message: "Job not found or you are not authorized to mark this job as complete" });
    } else if (bookingJob.booking_status == 'Completed') {
      return res.status(404).json({ code: 404, message: "JobPoster mark this job as completed. Please referesh the page" });
    }

    if (bookingJob.is_completed_from_worker === 1) {
      return res.status(400).json({ code: 400, message: "This job has already been marked as complete by you. Awaiting job poster confirmation." });
    }

    // Update is_completed_from_worker to 1
    await libs.updateData(db.booking_jobs,
      { is_completed_from_worker: 1 },
      { where: { id: bookingJob.id } }
    );

    const bookingJob_again = await libs.getData(db.booking_jobs, {
      where: {
        job_id: Number(job_id),
        worker_id: id,
        deleted_at: null,
      }
    });
    console.log('-----bookingJob_again----', JSON.parse(JSON.stringify(bookingJob_again)));

    // Fetch job poster details for notification
    const jobPoster = await libs.getData(db.users, {
      where: { id: bookingJob.job.job_poster_id },
      attributes: ['id', 'device_type', 'device_token', 'country_code', 'mobile_number']
    });

    if (!jobPoster) {
      return res.status(404).json({ code: 404, message: "Job poster not found" });
    }

    // Prepare notification data
    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    const fullName = `${first_name ? capitalize(first_name) : 'Someone'} ${last_name ? capitalize(last_name) : ""}`;
    const notify_data = {
      title: "Job Completion",
      message: `${fullName} has marked the job as complete`,
      imageUrl: `${image_baseUrl}${profile_image}`,
      pushType: '12', // Unique push type for job completion
      job_id: Number(job_id)
    };

    // Save notification to database
    await libs.createData(db.notifications, {
      user_id: jobPoster.id,
      ...notify_data
    });

    // Send push notification
    if (jobPoster.device_type === "Android") {
      await Notify.sendNotifyToUser(notify_data, jobPoster.device_token);
    } else {
      await Notify.sendNotifyTo_Ios(notify_data, jobPoster.device_token);
    }

    // Send SMS notification if mobile number is available
    // const fullMobileNumber = `${jobPoster.country_code}${jobPoster.mobile_number}`;
    // if (fullMobileNumber) {
    //   await Notify.sendNotificationThroughTwilio(notify_data, fullMobileNumber);
    // }

    // Update job poster's notification count
    await libs.updateData(db.users,
      { notify_count: db.sequelize.literal('notify_count + 1') },
      { where: { id: jobPoster.id } }
    );

    return res.status(200).json({
      code: 200,
      message: "Job marked as complete by worker",
    });

  } catch (err) {
    console.error('-------err-------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


module.exports = {
  identityProof, skipIdentityProof, completeJobFromWorker, getAllJobs, applyJob, getMyAppliedJob, viewApplicantProfile, viewJobPoster_PreviousWork, jobPosterAllRating, addAvailability, editAvailability, acceptDeclined, dislikeJob, subscribe, getSubscribe, subscribeTopUser, jobDetail, toggleRole
};
