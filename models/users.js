'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    first_name:{ type: DataTypes.STRING },
    last_name:{ type: DataTypes.STRING },
    // gender:{ type: DataTypes.ENUM("Male","Female","Other")},
    email:{ type: DataTypes.STRING },
    password:{ type: DataTypes.STRING },

    profile_goal: { type: DataTypes.STRING, defaultValue:null },
    available_time_slots: { type: DataTypes.STRING, defaultValue:null },
    projects_and_media_link:{ type: DataTypes.STRING, defaultValue:null },
    projects_and_media_case_study:{ type: DataTypes.STRING, defaultValue:null },
    work_video_thumbnail: { type: DataTypes.STRING, defaultValue:null },
    job_video_thumbnail: { type: DataTypes.STRING, defaultValue:null },
    identity_proof: {type: DataTypes.STRING, defaultValue:null},
    proof_uploaded:{type: DataTypes.INTEGER,defaultValue: 0},
    
    username:{type: DataTypes.STRING},
    social_id: { type: DataTypes.STRING },
    social_token: { type: DataTypes.STRING },     // '0' for google, '1' for apple
    // country_code_name:{type: DataTypes.STRING},
    zip_code:{type: DataTypes.STRING},
    yelp_account:{type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    mobile_number: {type: DataTypes.STRING},
    is_verified: { type: DataTypes.INTEGER,defaultValue: 0},
    profile_type:{ type: DataTypes.ENUM("JobPoster","Worker"),defaultValue: 'JobPoster'},
    profile_image: { type: DataTypes.STRING, defaultValue:null},
    overall_rating:{ type: DataTypes.STRING,defaultValue: '0'},
    
    longitude:{type: DataTypes.DECIMAL(10, 6), defaultValue:null},    // longitude
    latitude:{type: DataTypes.DECIMAL(10, 6), defaultValue:null},     // latitude
    area: {type: DataTypes.INTEGER,defaultValue: 0},
    address:{type: DataTypes.STRING , defaultValue:null},
    
    experience_years: { type: DataTypes.INTEGER,defaultValue: 0},
    category_id:{type: DataTypes.STRING , defaultValue:null},
    // category_id: { type: DataTypes.INTEGER,references:{model:'categories',key:'id'},defaultValue: null},

    payment:{ type: DataTypes.STRING,defaultValue:"Cash"},    //"Cash","Venmo","Zelle"

    is_online: {type: DataTypes.STRING, defaultValue: '0'},
    action:{ type: DataTypes.ENUM('Enable','Disable'),defaultValue: "Enable"},
    notify_count: {type: DataTypes.INTEGER,defaultValue: 0},

    access_token: { type: DataTypes.STRING },

    swipe_count: {type: DataTypes.INTEGER, defaultValue: 0},
    swipe_today: {type: DataTypes.DATE, defaultValue: null},
    isProfileCompleted : {type: DataTypes.STRING, defaultValue:'0'},   // 0 -> not verified, 1 -> verified
    isAvailability : {type: DataTypes.STRING, defaultValue:'0'},     // 0 -> not verified, 1 -> verified

    total_earning: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00},
    
    
    top_verified:{ type:DataTypes.ENUM("0","1"),defaultValue:"0"},    // 0 -> not verified, 1 -> verified
    device_type:{ type:DataTypes.ENUM("Android","Apple","Windows"),defaultValue:"Android"},
    device_token: { type: DataTypes.STRING },
    isSubscription:{ type:DataTypes.ENUM("0","1"),defaultValue:"0"}, // 0-> expired/notBuy, 1-> buy
    skills: { type: DataTypes.STRING },
    user_introduction: { type: DataTypes.STRING, defaultValue: null },
    
    stripe_enabled: { type: DataTypes.ENUM("0","1"), defaultValue:"0"},
    stripe_account_id: { type: DataTypes.STRING, defaultValue:null},
    stripe_customer_id: { type: DataTypes.STRING, defaultValue:null},
    stripe_access_token: { type: DataTypes.STRING, defaultValue:null},
    stripe_refresh_token: { type: DataTypes.STRING, defaultValue:null},
    stripe_token: { type: DataTypes.STRING, defaultValue:null},
    stripe_skip: { type: DataTypes.ENUM("0", "1"), defaultValue: "0" },
    otp: { type: DataTypes.STRING, defaultValue:null},
    
    deleted_at: {type: DataTypes.DATE,defaultValue: null},

    },{
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    })

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return users;
}

