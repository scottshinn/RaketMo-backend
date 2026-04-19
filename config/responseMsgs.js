const { StatusCodes }= require('http-status-codes');

exports.ERROR ={
    ERROR_OCCURRED:(res,err)=>{
        res.status(StatusCodes.ERROR_OCCURRED||500).json({
            code: 500,
            message:err.message,
            error: err.toString()||"ERROR_OCCURRED",
        })
    },
    MOBILE_ALREADY_EXIST:(res)=>{
        return res.status(StatusCodes.CONFLICT).send({
            code: StatusCodes.CONFLICT,
            message: "Mobile already exist",
        })
    },
 
    USER_NAME_ALREADY_EXIST:(res)=>{
        return res.status(StatusCodes.CONFLICT).json({
            code: StatusCodes.CONFLICT,
            message: 'user name already exists',
        })
    },
    INTERNAL_SERVER_ERROR:(res,err)=>{
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
            err:err
        })
    },

    SOCIAL_KEY_NOT_EXSIST:{
        code: 400,
        message: 'social key not exsist',
        type: 'SOCIAL_KEY_NOT_EXSIST'
    },
    TOKEN_REQUIRED:(res)=>{
        return res.status(407).json({
            code: 407,
            message: "authorization Token is Required",
        })
    },
    INVALID_TOKEN:(res)=>{
        return res.status(407).json('invalid token please check again') 
    },
    INVALID_EMAIL:(res)=>{
        return res.status(400).json('Email is Incorrect')
    },
    WRONG_OTP:(res)=>{
        return res.status(400).json('otp is Incorrect')
    },
    DATA_NOT_FOUND:(res)=>{
        return res.status(404).json('DATA_NOT_FOUND')
    },
    JOI_ERROR:(res,err)=>{
        res.status(StatusCodes.ERROR_OCCURRED||400).json({code: StatusCodes.ERROR_OCCURRED, error:err.toString()||"ERROR_OCCURRED"})
    },
    


    INVALID_PASSWORD  :{
        statusCode: 400,
        message: 'Password is Incorrect.',
        type: 'INVALID_PASSWORD '
    },

    UNAUTHORIZED:(res)=>{ 
        return res.status(StatusCodes.UNAUTHORIZED).json({
            code:StatusCodes.UNAUTHORIZED,
            message:"You are not authorized to perform this action"
        })
    },
    INVALID_creds: {
        statusCode: 400,
        message: 'Phone Number or Password is incorrect.',
        type: 'INVALID_creds '
    },    
    WRONG_PASSWORD:(res)=> {
        return res.status(400).json("Password is incorrect")
    },

    SOMETHING_WENT_WRONG:(res)=>{
        return res.status(400).json("Something went wrong")
    },

    // INVALID_EMAIL :{
    //     code: 400,
    //     message: 'Email is Incorrect.',
    //     type: 'INVALID_EMAIL'
    // },

    // INVALID_TOKEN :{
    //     code: 400,
    //     message: 'invalid token please check again',
    // },
}


exports.SUCCESS = {
    DEFAULT:(res,msg,data)=> {
        return res.status(StatusCodes.OK || 200).json({code:StatusCodes.OK ,message:msg, data:data})
    },


    RETURN_ORDER_TIME_OUT : {
        code: 400,    
        message : 'you cannot return product because return time out',
        type: 'RETURN_ORDER_TIME_OUT'
    },

    ADDED : {
        code: 200,
        message : 'Added successfully.',
        type: 'ADDED'
    },
    FORGOT_PASSWORD: {
        code: 200,
        message: "A reset password link is sent to your registered email address.",
        type: 'FORGOT_PASSWORD'
    },
    PASSWORD_RESET_SUCCESSFULL:{
        code:200,
        message :"Your Password has been Successfully Changed",
        type:'PASSWORD_RESET_SUCCESSFULL'
    },
    RESET_PASSWORD:{
        code:200,
        message:"A reset password OTP has been sent to your registered Phone Number",
        type: 'RESET_PASSWORD'
    },
    // DEFAULT:{
    //    code: code,
    //    message: 'Success',
    //    data: data
    // },

};
