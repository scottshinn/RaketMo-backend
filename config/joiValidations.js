const joi = require('joi');
const ERROR = require('./responseMsgs').ERROR;

const signupUserValid= async (req,res,next)=>{
    console.log('--------req.body--------',req.body);
    const validation = joi.object({
        first_name: joi.string().optional(),
        last_name: joi.string().optional(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        zip_code: joi.string().required(),
        yelp_account: joi.string().required(),
        profile_type: joi.string().valid("JobPoster","Worker").required(),
        country_code: joi.string().required(),
        mobile_number: joi.string().required(),
        profile_image:joi.string().optional(),
        device_type: joi.string().valid("Android","Apple","Windows").required(),
        device_token: joi.string().required(),
    })

    const {error}= validation.validate(req.body);
    if(error){
        console.log('------------joi err-----------',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const loginUserValid= async (req,res,next)=>{
    let validation = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .message('Password must be at least 6 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 Number.and atleast 1 special case').required(),
        device_type: joi.string().valid("Android","Apple","Windows").optional(),
        device_token: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return  ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}


const WorkerAppliedJobsValid= async (req,res,next)=>{
    const validation = joi.object({
        booking_status: joi.string().required().valid('Applied', 'Hired', 'Completed', 'Declined'),
        page: joi.string().optional(),
        itemsPerPage: joi.string().optional(),
    })

    const {error}= validation.validate(req.query);
    if(error){
        console.log('--------joi err-------',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}
const editWorkerValid= async (req,res,next)=>{
    let validation = joi.object({
        first_name: joi.string().optional(),
        last_name: joi.string().optional(),
        gender: joi.string().optional(),
        profile_image: joi.object().optional(),
        password: joi.string().min(6).optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const bookRideValid= async (req,res,next)=>{
    let validation = joi.object({
        pickup_long: joi.number().min(-180).max(180).required(),
        pickup_lat: joi.number().min(-90).max(90).required(),
        drop_long: joi.number().min(-180).max(180).required(),
        drop_lat: joi.number().min(-90).max(90).required(),
        pickup_address: joi.string().required(),
        drop_address: joi.string().required(),
        ride_type:joi.string().valid("Ride","Delivery").required(),
        driver_gender:joi.string().valid("Male","Female","Both").required(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err----',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const calcAmountValid= async (req,res,next)=>{
    let validation = joi.object({
        pickup_long: joi.number().min(-180).max(180).required(),
        pickup_lat: joi.number().min(-90).max(90).required(),
        drop_long: joi.number().min(-180).max(180).required(),
        drop_lat: joi.number().min(-90).max(90).required(),
        pickup_address: joi.string().required(),
        drop_address: joi.string().required(),
        ride_type:joi.string().valid("Ride","Delivery").required(),
        driver_gender:joi.string().valid("Male","Female","Both").required(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err----',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}
const sendMsgValid= async (req,res,next)=>{
    let validation = joi.object({
        msg_img: joi.string().optional(),
        receiver_id: joi.number().optional(),
        room_id: joi.number().optional(),
        message: joi.string().optional(),
        msg_type: joi.string().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err---',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const reportValid= async (req,res,next)=>{
    let validation = joi.object({
        user_id: joi.number().optional(),
        driver_id: joi.number().optional(),
        booking_id: joi.number().required(),
        report_message: joi.string().required(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err---',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const ratingValid= async (req,res,next)=>{
    let validation = joi.object({
        driver_id: joi.number().required(),
        booking_id: joi.number().required(),
        star: joi.number().min(1).max(5).required(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err---',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

const supportValid= async (req,res,next)=>{
    let validation = joi.object({
        email: joi.string().email().required(),
        message: joi.string().required(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi err---',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}

//--------------Drivers-------------------

const signupDriverValid= async (req,res,next)=>{
    console.log('---------req.body-----------',req.body);
    let validation = joi.object({
        username: joi.string().optional(),
        gender: joi.number().valid("Male","Female","Both").optional(),
        mobile_number: joi.string().optional(),
        license: joi.object().optional(),   //Ihave to do optional all these fields
        id_card: joi.object().optional(),
        passport_photo: joi.object().optional(),
        vechile_insurance: joi.object().optional(),
        model: joi.string().optional(),
        license_plate: joi.string().optional(),
        year: joi.number().optional(),
        
        device_token: joi.string().optional(),
        device_type: joi.string().valid("Android","Apple").optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('-----joi er------',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);   
    }
    next();
}


const editdriverValid= async (req,res,next)=>{
    let validation = joi.object({
        username: joi.string().optional(),
        gender: joi.number().valid("Male","Female","Other").optional(),
        profile_image: joi.object().optional(),
        license: joi.object().optional(),
        id_card: joi.object().optional(),
        passport_photo: joi.object().optional(),
        vechile_insurance: joi.object().optional(),
        model: joi.string().optional(),
        license_plate: joi.string().optional(),
        year: joi.number().optional(),
    })

    let {error}= validation.validate(req.body);
    if(error){
        console.log('--------joi err-------',error);
        return ERROR.JOI_ERROR(res,error.details[0].message);
    }
    next();
}







module.exports= {signupUserValid,loginUserValid,WorkerAppliedJobsValid,
    editWorkerValid,bookRideValid,calcAmountValid,signupDriverValid,editdriverValid,sendMsgValid,reportValid,ratingValid,supportValid, };

