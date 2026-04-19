const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
const Notify = require('../libs/notifications');
const fs = require('fs');
const { Op, where } = require('sequelize');

const termsAndConditions = async (req, res) => {
    try {
        res.render('termsAndConditions')
    } catch (err) {
        res.redirect("/admin/login")
    }
}

const privacyPolicy = async (req, res) => {
    try {
        res.render('privacyPolicy')
    } catch (err) {
        res.redirect("/admin/login")
    }
}

const aboutUs = async (req, res) => {
    try {
        res.render('aboutUs')
    } catch (err) {
        res.redirect("/admin/login")
    }
}

const getloginPage = async (req, res) => {
    try {
        console.log('---------req.cookies getLogin---------', req.cookies);
        console.log('---------req query--------', req.query);
        console.log('---------req body--------', req.body);

        if (req.cookies.rakettToken) {
            const rakettToken = req.cookies.rakettToken;
            console.log('---------rakettToken---------', rakettToken);
            if (rakettToken) {
                const email = rakettToken.email;
                const password = rakettToken.password;
                console.log('--------renderlogin---------');
                res.render('sign-in', { email: email, password: password, message: req.query.message || "" });   //
                return;
            }
        }
        res.render('sign-in', { email: '', password: '', message: req.query.message || "" });
    } catch (err) {
        console.log('----err----', err);
        return res.redirect('/admin/login');
    }
};

const login = async (req, res) => {
    try {
        console.log('----------body---post----------', req.body);
        console.log('----------cookies 1----------', req.cookies);
        const { email, password, rememberMe } = req.body;
        const getData = await libs.getData(db.admins, { where: { email: email } });
        if (getData) {
            let checkPswrd = await commonFunc.compPassword(password, getData.password)
            if (!checkPswrd) {
                if (getData.password != password) {
                    // return res.status(400).json({code:400,message:"Incorrect Password"})
                    return res.redirect('/admin/login?message=Incorrect Password');
                }
            }
            req.session.admin = getData.toJSON();
            req.session.role = "admin";
            // const token = await commonFunc.generateAccessToken(getData,{email:email},process.env.admin_secretKey);
            if (rememberMe) {
                res.cookie('rakettToken', { email: email, password: password });
            } else {
                res.clearCookie('rakettToken');
            }
            res.redirect('/admin/renderWorkers');
            // res.render('view-worker');
            return;
        }
        else {
            return res.redirect('/admin/login?message=Email doesnt exist');
        }
    } catch (err) {
        console.log('-----log err-----', err);
        return res.redirect('/admin/login');
    }
};

const renderProfile = async (req, res) => {
    try {
        // let getAdminData = await libs.getData(db.admins,{});
        let getAdminData = req.session.admin;
        // getAdminData.profile_image = `/uploads/admins/${getAdminData.profile_image}`;
        res.render('profile', {
            // res.status(200).json({ message: 'Status toggled successfully', 
            getAdmin: getAdminData, search: ""
        });
    } catch (err) {
        console.log('---err---', err);
        return res.redirect('/admin/login');
    }
};

const getEditProfilePage = async (req, res) => {
    try {
        let getData = await libs.getData(db.admins, {});
        // res.status(200).json({
        res.render('edit-profile', { getAdmin: getData, search: "" });
    } catch (err) {
        return res.redirect('/admin/login');
    }
};

const editProfile = async (req, res, next) => {
    try {
        const { admin_name, admin_email } = req.body;
        if (!admin_name.trim()) {
            console.log('----------!admin_name.trim() render profilepage---------');
            return res.redirect('/admin/renderProfile');
        }

        let getData = await libs.getData(db.admins, {});
        console.log('-------getData-------', getData);
        // let getData = req.session.admin;

        let update = {};

        if (admin_name) { update.full_name = admin_name }
        // if (admin_email) { update.email = admin_email }

        if (req.file) {
            if (getData.profile_image) {
                fs.unlink(`public/uploads/${getData.profile_image}`, (err) => { if (err) { return } })
            }
            update.profile_image = req.file.filename
        };

        const editProfile = await libs.updateData(getData, update);
        console.log('------editProfile------', editProfile);
        // const editProfile = await libs.findAndUpdate(db.admins, req.session.admin.id, update);
        if (editProfile.profile_image) {
            req.session.admin.profile_image = editProfile.profile_image
            // editProfile.profile_image = `public/uploads/${editProfile.profile_image}`;
        }
        // res.status(200).json({
        res.render('profile', {
            getAdmin: editProfile, search: ""
        })
    } catch (err) {
        console.log('-----err-----', err);
        if (req.file) { fs.unlink(req.file.path, (err) => { if (err) return }) }
        return res.redirect('/admin/login', { message: "" });
    }
};

const getChangePasswordPage = async (req, res) => {
    try {
        res.render('change-password', {
            getAdmin: req.session.admin,
            message: req.query.message || "",
            nav_view: "Change password"
        })
    } catch (err) {
        console.log('-------er-----', err);
        return res.redirect('/admin/login');
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        console.log('-------- req.body-----------', req.body);
        if (newPassword != confirmPassword) {
            return res.redirect("/admin/getChangePasswordPage?message=New password and Confirm password doesn't match");
        }
        if (oldPassword == newPassword) {
            return res.redirect("/admin/getChangePasswordPage?message=Old password and New password cannot be same");
        }
        const getData = await libs.getData(db.admins, {});

        const passwordMatches = await commonFunc.compPassword(oldPassword, getData.password);
        if (!passwordMatches) {
            if (getData.password != oldPassword) {
                return res.redirect('/admin/getChangePasswordPage?message=Old password is wrong');
            }
        }
        let newhashPassword = await commonFunc.securePassword(newPassword);

        await libs.updateData(getData, { password: newhashPassword });

        return res.redirect('/admin/getChangePasswordPage?message=Password changed successfully')
        // return res.status(200).json({code:200,data: upatedData});
    } catch (err) {
        return res.redirect('/admin/getChangePasswordPage?message=""')
    }
};

const logout = async (req, res) => {
    try {
        if (req.session.admin) {
            // Destroy the session to log the user out
            req.session.destroy((err) => {
                if (err) {
                    res.redirect('/admin/renderWorkers');
                } else {
                    // res.json({ message: 'Logout successful' });
                    return res.redirect('/admin/login?message=');
                    // return res.redirect('/admin/login?message=Logout successful');
                }
            });
        } else { return res.redirect('/admin/login') }
    } catch (err) {
        res.redirect("/admin/login")
    }
};

const addCategory = async (req, res) => {
    try {
        const data = { category: req.body.category };
        const addData = await libs.createData(db.categories, data);
        res.status(200).json(addData)
    } catch (err) {
        console.log('-----err-------', err);
        res.status(500).json(err)
        // res.redirect("/admin/login")
    }
};

const getCategories = async (req, res) => {
    try {
        const getData = await libs.getAllData(db.categories, {
            attributes: [
                'id',
                'category',
                [db.sequelize.literal(`CASE WHEN category_icon IS NOT NULL THEN CONCAT('${process.env.image_baseUrl}', category_icon) ELSE NULL END`), 'category_icon'],
                'created_at',
                'updated_at',
                'deleted_at'
            ],
            where: { deleted_at: null }
        });
        res.status(200).json({
            status: 200,
            data: getData
        });
    } catch (err) {
        console.log('-----err-------', err);
        res.status(500).json(err)
    }
};

const addReports = async (req, res) => {
    try {
        const data = { report: req.body.report };
        const addData = await libs.createData(db.reportlisting, data);
        res.status(200).json(addData)
    } catch (err) {
        console.log('-----err-------', err);
        res.status(500).json(err)
        // res.redirect("/admin/login")
    }
};

const renderWorkers = async (req, res) => {
    try {
        const totalUsersCount = await db.users.count({where: {is_verified: 1, profile_type: "Worker", deleted_at: null}});
        let search = req.query.search || '';              // Get search input value

        console.log('----------req.body----------', req.body);
        console.log('----------req.query--------', req.query);
        console.log('------------search 1---------------', search);

        const page = parseInt(req.query.page) || 1;       // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = search ? {
            [Op.or]: [{ first_name: { [Op.like]: `%${search}%` } }, { last_name: { [Op.like]: `%${search}%` } }]
        } : {};

        whereCondition.is_verified = 1
        whereCondition.profile_type = "Worker"
        whereCondition.deleted_at = null
        whereCondition.first_name = { [Op.not]: null, [Op.not]: '' };
        // console.log('----------whereCondition-----------',whereCondition);
        const getWorkers = await libs.getAllData(db.users, {
            where: whereCondition,
            attributes: ['id', 'first_name', 'last_name', 'email', 'zip_code', 'experience_years', 'category_id', 'yelp_account', 'payment', 'overall_rating',
                [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
            ],
            // include: [{
            //     model: db.categories,
            //     attributes: ['id', 'category'],
            //     // required: false,
            //     // on: db.sequelize.literal(`FIND_IN_SET(categories.id, REPLACE(users.category_id, ' ', ''))`)
            // }],
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        const get_workers= [];

        for (let user of getWorkers) {
            if (user.category_id) {
                const catIds = user.category_id?.split(',').map(id => Number(id.trim())).filter(Boolean);;
                const categories = await db.categories.findAll({
                    where: { id: catIds },
                    attributes: ['category']
                });
                user.category = categories.map(cat => cat.category); // ✅ overwrite as array
            }
            get_workers.push(user);
        }


        const totalUsers = await db.users.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // console.log('------------totalPages---------------',totalPages);
        // console.log('------------search 2---------------',search);

        // res.status(200).json({
            res.render('view-worker', {
            getWorkers: get_workers,
            getAdmin: req.session.admin,
            itemsPerPage,
            totalItems: get_workers.length,
            page,
            search,
            totalPages,
            totalUsersCount,
            nav_view: "View workers"
        });
    } catch (err) {
        console.log('-----err------', err);
        return res.redirect('/admin/login')
    }
};

const getAllWorkersJobs = async (req, res) => {
    try {
        console.log('----------req.query----------', req.query);

        const { worker_id } = req.query;
        const page = parseInt(req.query.page) || 1;       // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = { worker_id: worker_id }
        const getBookings = await libs.getAllData(db.booking_jobs, {
            where: whereCondition,
            include: {
                model: db.jobs,
                attributes: ['id', 'title', 'job_poster_id', 'address', 'category_id', 'description', 'price', 'min_bids', 'max_bids', 'jobs_date', 'jobs_time'],
                include: [{
                //     model: db.categories,
                //     attributes: ['category'],
                // }, {
                    model: db.job_images,
                    attributes: ['id', [
                        db.sequelize.literal(`CONCAT("/uploads/",job_image)`),
                        'job_image',
                    ]],
                }, {
                    model: db.users,
                    attributes: ['id', 'first_name', 'last_name',
                        [
                            db.sequelize.literal(`CONCAT("/uploads/",profile_image)`),
                            'profile_image',
                        ]
                    ],
                    as: "jobPosterDetail",
                }]
            },
            attributes: { exclude: ['deleted_at', 'updated_at'] },
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalUsers = await db.booking_jobs.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / getBookings.length);

        // console.log('------------totalPages---------------',totalPages);
        // console.log('------------search 2---------------',search);

        // res.status(200).json({
        res.render('view-jobs', {
            getBookings: getBookings,
            getAdmin: req.session.admin,
            itemsPerPage,
            totalItems: getBookings?.length,
            page,
            totalPages,
            worker_id: worker_id || '',
            nav_view: "Liked Jobs"
        });
    } catch (err) {
        console.log('-----err------', err);
        // return res.redirect('/admin/login')
    }
};

const renderJobposters = async (req, res) => {
    try {
        console.log('----------req.query----------', req.query);

        const page = parseInt(req.query.page) || 1;       // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = { is_verified: 1, profile_type: "JobPoster",deleted_at:null, }

        const getJobPoster = await libs.getAllData(db.users, {
            where: whereCondition,
            attributes: ['id', 'first_name', 'last_name', 'email', 'address', 'country_code', 'mobile_number', 'overall_rating', [
                db.sequelize.literal(`CONCAT("/uploads/",profile_image)`),
                'profile_image',
            ]],
            limit: itemsPerPage,            
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalUsers = await db.users.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // console.log('------------totalPages---------------',totalPages);
        // console.log('------------search 2---------------',search);

        // res.status(200).json({
        res.render('view-jobposter', {
            getJobPoster: getJobPoster,
            getAdmin: req.session.admin,
            itemsPerPage,
            totalItems: getJobPoster.length,
            page,
            search: "",
            totalPages,
            nav_view: "View Job Posters"
        });
    } catch (err) {
        console.log('-----err------', err);
        return res.redirect('/admin/login')
    }
};

const getAllPostedJobs = async (req, res) => {
    try {
        console.log('----------req.query----------', req.query);
        const { job_poster_id } = req.query;

        const page = parseInt(req.query.page) || 1;        // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = { job_poster_id: Number(job_poster_id) }

        let getJobPostersJob = await libs.getAllData(db.jobs, {
            where: whereCondition,
            include: [{
            //     model: db.categories,
            //     attributes: ['category']
            // }, {
                model: db.job_images,
                attributes: [[db.sequelize.literal(`CONCAT("/uploads/",job_image)`), 'job_image']],
            }],
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        getJobPostersJob =  JSON.parse(JSON.stringify(getJobPostersJob))
        const get_posted_jobs= [];

        for (let user of getJobPostersJob) {
            if (user.category_id) {
                const catIds = user.category_id?.split(',').map(id => Number(id.trim())).filter(Boolean);;
                const categories = await db.categories.findAll({
                    where: { id: catIds },
                    attributes: ['category']
                });
                user.category = categories.map(cat => cat.category); // ✅ overwrite as array
                console.log('-------user------',JSON.parse(JSON.stringify(user)));
                // console.log('--user.category---', user.category);
            }
            get_posted_jobs.push(user);
        }
        const totalUsers = await db.jobs.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // console.log('------------totalPages---------------',totalPages);
        // console.log('------------search 2---------------',search);

        // res.status(200).json({
        res.render('jobposter-jobs', {
            getJobPostersJob: get_posted_jobs,
            getAdmin: req.session.admin,
            itemsPerPage,
            totalItems: get_posted_jobs.length,
            page,
            search: "",
            totalPages,
            nav_view: "View Jobs",
            job_poster_id: job_poster_id || ''
        });
    } catch (err) {
        console.log('-----err------', err);
        return res.redirect('/admin/login')
    }
};

const viewApplicants = async (req, res) => {
    try {
        console.log('-------req.query------', req.query);
        const { job_id } = req.query;

        const page = parseInt(req.query.page) || 1;        // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = { job_id: Number(job_id), };

        whereCondition.booking_status = "Hired";

        const getHiredApplicants = await libs.getAllData(db.booking_jobs, {
            where: whereCondition,
            include: {
                model: db.users,
                as: "worker",
                attributes: ['first_name', 'last_name', 'email',
                    [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
                ],
            },
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        whereCondition.booking_status = "Completed";

        const getCompApplicants = await libs.getAllData(db.booking_jobs, {
            where: whereCondition,
            include: {
                model: db.users,
                as: "worker",
                attributes: ['first_name', 'last_name', 'email',
                    [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
                ],
            },
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        whereCondition.booking_status = { [Op.or]: ['Applied', 'Declined'] }

        const getJobsApplicants = await libs.getAllData(db.booking_jobs, {
            where: whereCondition,
            include: {
                model: db.users,
                as: "worker",
                attributes: ['first_name', 'last_name', 'email',
                    [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
                ],
            },
            limit: itemsPerPage,
            offset,
            order: [['bid_amount', 'ASC']]
        });
        const totalUsers = await db.booking_jobs.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // console.log('------------totalPages---------------',totalPages);
        // console.log('------------search 2---------------',search);

        // res.status(200).json({
        res.render('job-applicant', {
            getJobsApplicants: getJobsApplicants,
            getHiredApplicants: getHiredApplicants,
            getCompApplicants: getCompApplicants,
            getAdmin: req.session.admin,
            totalItems: getJobsApplicants.length,
            page,
            totalPages,
            nav_view: "Appliant",
            job_id: job_id || ''
        });
    } catch (err) {
        console.log('-----err------', err);
        res.status(200).json({ msg: err.message })
        // return res.redirect('/admin/login')
    }
};

const renderReports = async (req, res) => {
    try {
        const { tab } = req.query
        const page = parseInt(req.query.page) || 1;        // Current page
        const itemsPerPage = 10;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const job_page = parseInt(req.query.job_page) || 1;          // Current job_page
        const job_page_offset = (job_page - 1) * itemsPerPage;        // Calculate offset for pagination

        const whereCondition = { report_to: { [Op.not]: null } };
        const getUserReport = await libs.getAllData(db.reports, {
            where: whereCondition,
            include: [{
                model: db.users,
                as: 'reportedTo',
                attributes: ['id', 'first_name', 'last_name', 'email', 'action', 'created_at',
                    [db.sequelize.literal(`CONCAT("/uploads/",reportedTo.profile_image)`), 'profile_image']
                ],
            }, {
                model: db.users,
                as: 'reportedBy',
                attributes: ['id', 'first_name', 'last_name', 'email', 'action', 'created_at',
                    [db.sequelize.literal(`CONCAT("/uploads/",reportedBy.profile_image)`), 'profile_image']
                ],
            }
            ],
            limit: itemsPerPage,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        const totalUserReport = await db.reports.count({ where: whereCondition });
        const totalUserPages = Math.ceil(totalUserReport / itemsPerPage);

        // console.log('------------totalUserPages---------------',totalUserPages);
        // console.log('------------search 2---------------',search);

        const query = { job_id: { [Op.not]: null } };

        const getJobReport = await libs.getAllData(db.reports, {
            where: query,
            include: [{
                model: db.jobs,
                attributes: ['id', 'title', 'address', 'description', 'price', 'action', 'created_at'],
                where: { deleted_at: null },
                include: [{
                    model: db.job_images,
                    attributes: [[db.sequelize.literal(`CONCAT("/uploads/",job_image)`), 'job_image']],
                    required: false,
                    limit: 1,
                }, {
                    model: db.users,
                    attributes: ['first_name', 'last_name'],
                    as: "jobPosterDetail"
                },
                ]
            }, {
                model: db.users,
                as: 'reportedBy',
                attributes: [
                    'id', 'first_name', 'last_name', 'email', 'action', 'created_at',
                    [db.sequelize.literal(`CONCAT("/uploads/", \`reportedBy\`.\`profile_image\`)`), 'profile_image']
                ]
            }

            ],
            limit: itemsPerPage,
            offset: job_page_offset,
            order: [['created_at', 'DESC']]
        });

        const totalJobReport = await db.reports.count({ where: query });
        const totalJobPages = Math.ceil(totalJobReport / itemsPerPage);

        // res.status(200).json({
        res.render('report', {
            getUserReport: getUserReport,
            getJobReport: getJobReport,
            getAdmin: req.session.admin,
            page,
            job_page,
            totalUserPages,
            totalJobPages,
            nav_view: "Report",
            tab: tab || ''
        });
    } catch (err) {
        console.log('-----err------', err);
        res.status(200).json({ msg: err.message })
        // res.redirect('/admin/login')
    }
};

const massPushPage = async (req, res) => {
    try {
        res.render('mass-push', { getAdmin: req.session.admin, nav_view: "Mass Push" });
    } catch (err) {
        console.log('----err----', err);
        res.redirect("/admin/login")
    }
};

const sendMassPush = async (req, res) => {
    try {
        const { title, description } = req.body;
        let getUsers = await libs.getAllData(db.users, {});
        let data = {
            title: title,
            message: description,
            pushType: '8',
            imageUrl: 'logo.png'
        }
        for (let key of getUsers) {
            data.imageUrl = 'logo.png'
            let user_dt = { user_id: key.id, ...data }

            await libs.createData(db.notifications, user_dt);

            await libs.updateData(db.users, { notify_count: db.sequelize.literal('notify_count +1') }, { where: { id: key.id } });

            data.imageUrl = `${process.env.image_baseUrl}${data.imageUrl}`

            if (key.device_type == "Android") {
                if (key.device_token) { Notify.sendNotifyToUser(data, key.device_token) }
            } else {
                if (key.device_token) { Notify.sendNotifyTo_Ios(data, key.device_token) };
            }
        }
        res.redirect('/admin/massPushPage');
    } catch (err) {
        console.log('------err------', err);
        res.redirect("/admin/login")
    }
};

const enableDisableUser = async (req, res) => {
    try {
        const userId = Number(req.query.userId);
        console.log('-----------req.query---------', req.query);
        if (!userId) {
            return res.status(404).json({ code: 404, msg: `userId is required` });
        }
        let query = { where: { id: userId } }
        const user = await libs.getData(db.users, query);
        if (user) {
            if (user.action == 'Enable') {

                if (user.profile_type == 'Worker') {
                    const getHiredUser = await libs.getData(db.booking_jobs, {
                        where: { worker_id: userId, booking_status: 'Hired' },
                    });
                    if (getHiredUser) {
                        return res.status(404).json({ code: 404, msg: `This user is already hired for a job` });
                    }
                    const getAppliedUser = await libs.getAllData(db.booking_jobs, {
                        where: { worker_id: userId, booking_status: 'Applied' },
                    });

                    getAppliedUser?.forEach(async job => {
                        job.booking_status = "Declined";
                        // console.log('-----------Declined---------', job.toJSON());
                        await job.save();
                    });
                } else {
                    const getHiredUser = await libs.getData(db.booking_jobs, {
                        where: { job_poster_id: userId, booking_status: 'Hired' },
                    });
                    if (getHiredUser) {
                        return res.status(404).json({ code: 404, msg: `Worker is alredy hired for this Job Poster's job` });
                    }
                    const getAllPostedJobs = await libs.getAllData(db.jobs, {
                        where: { job_poster_id: userId, deleted_at: null },
                    });

                    getAllPostedJobs?.forEach(async job => {
                        job.deleted_at = new Date(Date.now());
                        console.log('-----------job.deleted_at---------', job.toJSON());
                        await job.save();
                    });
                }
                // user.action = user.action === 'Disable' ? 'Enable' : 'Disable';
                user.action = 'Disable'
                user.access_token = null;
                user.device_token = null;
            } else {
                user.action = 'Enable'
                if (user.profile_type == 'JobPoster') {
                    const getAllPostedJobs = await libs.getAllData(db.jobs, {
                        where: { job_poster_id: Number(userId), status: 'posted', deleted_at: { [Op.not]: null } },
                    });
                    getAllPostedJobs?.forEach(async job => {
                        job.deleted_at = null;
                        console.log('-----------job.deleted_at---------', job.toJSON());
                        await job.save();
                    });
                }
            }

            await user.save();
            res.status(200).json({ code: 200, msg: `Status ${user.action} successfully` });
        }
    } catch (err) {
        console.log('---err---', err);
        res.status(500).json({ code: 500, msg: err });
        // res.redirect('/admin/login')
    }
};

const enableDisableJob = async (req, res) => {
    try {
        const { jobId } = req.query;
        console.log('---------req.query-----', req.query);
        if (!jobId) {
            return res.status(400).json({ code: 400, msg: `jobId is required` });
        }
        const job = await libs.getData(db.jobs, { where: { id: Number(jobId) } });

        let msg;

        // job.deleted_at = job.deleted_at === null ? new Date(Date.now()) : null;

        if (job.status == "posted") {
            // job.action = job.action === 'Disable' ? 'Enable' : 'Disable';
            if (job.action === 'Enable') {
                job.action = 'Disable'
                // msg= 'disabled'
                const getAppliedJobs = await libs.getAllData(db.booking_jobs, {
                    where: { job_id: jobId, booking_status: 'Applied' },
                    include: {
                        model: db.users,
                        attributes: ['id', 'device_type', 'device_token', 'country_code', 'mobile_number'],
                        as: 'worker'
                    },
                });
                await Promise.all(getAppliedJobs?.map(async (worker_job) => {
                    worker_job.booking_status = 'Declined'
                    await worker_job.save();
                    console.log('-------worker_job------', worker_job.toJSON());
                    let data = {
                        title: 'Booking unavailable',
                        message: 'Job has been disabled',
                        pushType: '9',
                        imageUrl: 'logo.png'
                    }
                    data.imageUrl = `${process.env.image_baseUrl}${data.imageUrl}`

                    if (worker_job.worker.device_type == "Android") {
                        if (worker_job.worker.device_token) { Notify.sendNotifyToUser(data, worker_job.worker.device_token) }
                    } else {
                        if (worker_job.worker.device_token) { Notify.sendNotifyTo_Ios(data, worker_job.worker.device_token) }
                    }

                    // const fullMobileNumber = `${worker_job.worker.country_code}${worker_job.worker.mobile_number}`;
                    // if(fullMobileNumber) {
                    //     await Notify.sendNotificationThroughTwilio(data, fullMobileNumber);
                    // }
                }))

            } else {
                job.action = 'Enable'
                // msg = 'enabled'
            }
            await job.save();
            res.status(200).json({ code: 200, msg: `Status ${job.action} successfully`, data: job });
        } else {
            res.status(400).json({ code: 400, msg: `You can not disable this job`, data: job });
        }
    } catch (err) {
        console.log('---err---', err);
        res.status(500).json({ code: 500, msg: err });
        // res.redirect('/admin/login')
    }
};

const getSubscriptions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;        // Current page
        const itemsPerPage = 5;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const getUsers = await libs.getAllData(db.subscriptions, {
            where: {},
            include: {
                model: db.users,
                attributes: ['first_name', 'last_name', 'email',
                    [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
                ]
            },
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalUsers = await db.subscriptions.count({ where: {} });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // res.status(200).json({message:`Users subscription data`,data: getUsers});
        res.render('subscription', {
            getAdmin: req.session.admin,
            getUsers: getUsers,
            totalItems: getUsers.length,
            page,
            totalPages,
            nav_view: "Subscription",
        });
    } catch (err) {
        console.log('----err----', err);
        res.redirect("/admin/login")
    }
};

const verifiedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;        // Current page
        const itemsPerPage = 5;                          // Number of items per page
        const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

        const query = { top_verified: '1' };
        const getUsers = await libs.getAllData(db.users, {
            where: query,
            attributes: ['first_name', 'last_name', 'email',
                [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image']
            ],
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalUsers = await db.users.count({ where: query });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // res.status(200).json({message:`Users subscription data`,data: getUsers});
        res.render('verified', {
            getAdmin: req.session.admin,
            getUsers: getUsers,
            totalItems: getUsers.length,
            page,
            totalPages,
            nav_view: "Verified Users",
        });
    } catch (err) {
        console.log('----err----', err);
        res.redirect("/admin/login")
    }
};

const verificationRequest = async (req, res) => {
    try {
        res.render('verifyUsersDetail', { getAdmin: req.session.admin, nav_view: "verifyUsersDetail" });
    } catch (err) {
        console.log('----err----', err);
        res.redirect("/admin/login")
    }
};

const getRequestedUsers = async (req, res) => {
    try {
        const { search = '', page = 1 } = req.query;
        const itemsPerPage = 3;
        const offset = (parseInt(page) - 1) * itemsPerPage;

        const whereCondition = {
            is_verified: 1,
            proof_uploaded: 1,
            first_name: { [Op.not]: null, [Op.not]: '' }
        };

        if (search) {
            whereCondition[Op.or] = [
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } }
            ];
        }

        const attributes = [
            'id', 'first_name', 'last_name', 'email',
            'zip_code', 'experience_years', 'category_id',
            'yelp_account', 'payment', 'overall_rating',
            [db.sequelize.literal(`CONCAT("/uploads/",profile_image)`), 'profile_image'],
            [db.sequelize.literal(`CONCAT("/uploads/",identity_proof)`), 'identity_proof']
        ];

        const getWorkers = await libs.getAllData(db.users, {
            where: whereCondition,
            attributes,
            limit: itemsPerPage,
            offset,
            order: [['created_at', 'DESC']]
        });

        let allCategoryIds = [];
        const workersWithCategoryIds = getWorkers.map(user => {
            const categoryIds = typeof user.category_id === 'string'
                ? user.category_id.split(',').map(id => parseInt(id.trim())).filter(Boolean)
                : Array.isArray(user.category_id)
                    ? user.category_id
                    : user.category_id ? [user.category_id] : [];
            allCategoryIds.push(...categoryIds);
            return {
                ...user.toJSON(),
                category_id: categoryIds
            };
        });

        const uniqueCategoryIds = [...new Set(allCategoryIds)];
        const categoriesData = await db.categories.findAll({
            where: { id: uniqueCategoryIds },
            attributes: ['id', 'category']
        });

        const categoryMap = Object.fromEntries(
            categoriesData.map(({ id, category }) => [id, category])
        );

        const modifiedWorkers = workersWithCategoryIds.map(user => {
            const categoryIds = user.category_id;
            const categoryNames = categoryIds.map(id => categoryMap[id]).filter(Boolean);
            return {
                ...user,
                category_id: categoryIds.join(', '),
                categories: categoryNames.join(', ')
            };
        });

        const totalUsers = await db.users.count({ where: whereCondition });
        const totalPages = Math.ceil(totalUsers / itemsPerPage);
        return res.status(200).json({
            success: true,
            currentPage: parseInt(page),
            itemsPerPage,
            totalItems: totalUsers,
            totalPages,
            searchTerm: search,
            totalVerifiedUsers: totalUsers,
            data: modifiedWorkers
        });

    } catch (err) {
        console.error("Error in getRequestedUsers:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};

const proofAcceptReject = async (req, res) => {
    try {
        const { user_id, status } = req.body;

        if (!user_id || ![2, 3].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: userId and status (2 for accepted, 3 for rejected) are required.'
            });
        }

        const statusText = status === 2 ? 'accepted' : 'rejected';
        const [updatedCount] = await db.users.update(
            { proof_uploaded: status },
            { where: { id: user_id } }
        );

        if (!updatedCount) {
            return res.status(404).json({
                success: false,
                message: 'User not found or no changes were made.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `User proof_uploaded status successfully updated to ${statusText}.`
        });

    } catch (error) {
        console.error('Error updating proof status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

const testTwilio = async (req, res) => {
    try {
        let response = await Notify.sendNotificationThroughTwilio(
            '🚀 This is a test message from Rakett',
            req.body.to
        )
        return res.status(200).json({
            success: true,
            sid: response.sid,
            message: 'Twilio message sent successfully!',
        });
    } catch (error) {
        console.error('Twilio Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to send Twilio message',
            error: error.message,
        });
    }
};

const addOrUpdateCategory = async (req, res) => {
    try {
        const { category_id, category_name } = req.body;
        const file = req.file;

        if (!category_name || !category_name.trim()) {
            if (file) {
                fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
            }
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        let categoryData = {};
        categoryData.category = category_name.trim();
        if (file) {
            categoryData.category_icon = file.filename;
        }

        let response;

        if (category_id) {
            const existingCategory = await libs.getData(db.categories, {
                where: { id: category_id }
            });

            if (!existingCategory) {
                if (file) {
                    fs.unlink(file.path, (err) => { if (err) console.error('Error deleting file:', err); });
                }
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (file && existingCategory.category_icon) {
                fs.unlink(`public/uploads/${existingCategory.category_icon}`, (err) => {
                    if (err) console.error('Error deleting old icon:', err);
                });
            }

            response = await libs.updateData(existingCategory, categoryData);
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: response
            });
        } else {

            response = await libs.createData(db.categories, categoryData);
            return res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: response
            });
        }

    } catch (err) {
        console.error('Error in addOrUpdateCategory:', err);
        if (req.file) {
            fs.unlink(req.file.path, (err) => { if (err) console.error('Error deleting file:', err); });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};






module.exports = { termsAndConditions, addOrUpdateCategory, testTwilio, proofAcceptReject, verificationRequest, getRequestedUsers, privacyPolicy, aboutUs, getloginPage, login, addCategory, renderProfile, getEditProfilePage, editProfile, getChangePasswordPage, changePassword, logout, addReports, renderWorkers, getCategories, getAllWorkersJobs, renderJobposters, getAllPostedJobs, viewApplicants, renderReports, massPushPage, sendMassPush, enableDisableUser, enableDisableJob, getSubscriptions, verifiedUsers }