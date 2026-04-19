const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define associations here
const db = {};
db.sequelize= sequelize;
db.DataTypes= DataTypes;

db.admins = require('./admins')(sequelize,DataTypes);
db.users = require('./users')(sequelize,DataTypes);
db.userCards = require('./userCards')(sequelize,DataTypes);

db.categories= require('./categories')(sequelize,DataTypes);
db.reportlisting= require('./reportslisting')(sequelize,DataTypes);
db.reports= require('./reports')(sequelize,DataTypes);
db.jobs= require('./jobs')(sequelize,DataTypes);
db.job_images= require('./job_images')(sequelize,DataTypes);
db.rooms= require('./rooms')(sequelize,DataTypes);
db.chats= require('./chats')(sequelize,DataTypes);
db.chat_images= require('./chat_images')(sequelize,DataTypes);
db.blocks= require('./blocks')(sequelize,DataTypes);
db.booking_jobs= require('./booking_jobs')(sequelize,DataTypes);
db.ratings= require('./ratings')(sequelize,DataTypes);
db.workerAvailability= require('./workerAvailability')(sequelize,DataTypes);
db.appointments= require('./appointments')(sequelize,DataTypes);
db.notifications= require('./notifications')(sequelize,DataTypes);
db.recents= require('./recents')(sequelize,DataTypes);
db.dislikes= require('./dislikes')(sequelize,DataTypes);
db.subscriptions= require('./subscriptions')(sequelize,DataTypes);
db.user_imgs= require('./user_imgs')(sequelize,DataTypes);
db.media_and_projects= require('./media_and_projects')(sequelize,DataTypes);
db.payments= require('./payments')(sequelize,DataTypes);
db.transfers= require('./transfers')(sequelize,DataTypes);



// relation job and job images 
db.jobs.hasMany(db.job_images, { foreignKey: 'job_id'});       // as:
db.job_images.belongsTo(db.jobs, { foreignKey: 'job_id'});    

// relation job and users
db.users.hasMany(db.jobs, { foreignKey: 'job_poster_id',as:'jobPosterDetail'});       // as:
db.jobs.belongsTo(db.users, { foreignKey: 'job_poster_id',as:'jobPosterDetail'});    


// relation jobs and categories 
// db.categories.hasMany(db.jobs, { foreignKey: 'category_id'});       // as:
// db.jobs.belongsTo(db.categories, { foreignKey: 'category_id'});    

// relation users and rooms 
db.users.hasMany(db.rooms,{foreignKey: 'created_by'});       // as:

db.rooms.belongsTo(db.users,{as: 'createdByUser',foreignKey: 'created_by'});    //  by
db.rooms.belongsTo(db.users,{as: 'createdToUser', foreignKey: 'created_to'});   //  to

// relation room and chats
db.rooms.hasMany(db.chats,{foreignKey: 'room_id'}); 
db.chats.belongsTo(db.rooms,{foreignKey: 'room_id'}); 


// relation chats and chat_images 
db.chats.hasMany(db.chat_images,{foreignKey: 'chat_id'});    
db.chat_images.belongsTo(db.chats,{foreignKey: 'chat_id'}); 

// relation users and chat 
db.users.hasMany(db.chats,{foreignKey: 'sender_id'});    
db.chats.belongsTo(db.users,{as:'sender',foreignKey: 'sender_id'}); 
db.chats.belongsTo(db.users,{as:'receiver',foreignKey: 'receiver_id'}); 


// relation jobs and booking_jobs
db.jobs.hasMany(db.booking_jobs, {foreignKey: 'job_id'});       // as:
db.booking_jobs.belongsTo(db.jobs, {foreignKey: 'job_id'});   
 

// relation users and booking_jobs
// db.users.hasMany(db.booking_jobs, {foreignKey: 'job_poster_id'});       // as:
db.users.hasMany(db.booking_jobs, {foreignKey: 'worker_id'});       // as:
db.booking_jobs.belongsTo(db.users, {foreignKey: 'worker_id',as: 'worker'});    
db.booking_jobs.belongsTo(db.users, {foreignKey: 'job_poster_id',as: 'job_poster'});    


// relation ratings and booking_jobs
db.booking_jobs.hasMany(db.ratings, {foreignKey: 'booking_job_id'});       // as:
db.ratings.belongsTo(db.booking_jobs, {foreignKey: 'booking_job_id'});    

// relation ratings and booking_jobs
db.jobs.hasMany(db.ratings, {foreignKey: 'job_id'});       // as:
db.ratings.belongsTo(db.jobs, {foreignKey: 'job_id'});    

// relation users and blocks
db.users.hasMany(db.blocks, {foreignKey: 'blocked_user'});       // as:
db.blocks.belongsTo(db.users, {foreignKey: 'blocked_user',as:'blockedUser'});    

// relation users and ratings
db.users.hasMany(db.ratings, {foreignKey: 'job_poster_id'});       // as:
db.ratings.belongsTo(db.users, {foreignKey: 'job_poster_id',as:'job_poster'});    
db.ratings.belongsTo(db.users, {foreignKey: 'worker_id',as:'worker'});    

// relation users and workerAvailability
db.users.hasMany(db.workerAvailability, {foreignKey: 'worker_id'});       // as:
db.workerAvailability.belongsTo(db.users, {foreignKey: 'worker_id'});    

// relation users and appointments
db.users.hasMany(db.appointments, {foreignKey: 'worker_id'});       // as:
db.appointments.belongsTo(db.users, {foreignKey: 'worker_id',as:"worker"});    

// relation users and notifications
db.users.hasMany(db.notifications, {foreignKey: 'user_id'});       // as:
db.notifications.belongsTo(db.users, {foreignKey: 'user_id'});    

// relation users and recents
db.users.hasMany(db.recents, {foreignKey: 'user_id'});       // as:
db.recents.belongsTo(db.users, {foreignKey: 'user_id'});    

// relation users and categories
// db.categories.hasMany(db.users, {foreignKey: 'category_id'});       // as:
// db.users.belongsTo(db.categories, {foreignKey: 'category_id'});    

// db.users.hasMany(db.categories, {
//   foreignKey: 'id', // category.id
//   sourceKey: 'category_id', // NOT real FK, just needed to avoid error
//   constraints: false
// });
// db.categories.hasMany(db.users, {
//   foreignKey: 'category_id',
//   sourceKey: 'id',
//   constraints: false
// });


// relation users and dislikes
db.users.hasMany(db.dislikes, {foreignKey: 'dislike_by'});       // as:
db.dislikes.belongsTo(db.users, {foreignKey: 'dislike_by'});    

// relation users and subscriptions
db.users.hasMany(db.subscriptions, {foreignKey: 'user_id'});       // as:
db.subscriptions.belongsTo(db.users, {foreignKey: 'user_id'});    


// relation users, reports and jobs
db.users.hasMany(db.reports, {foreignKey: 'report_to'});       // as:
db.reports.belongsTo(db.users, {foreignKey: 'report_to',as:'reportedTo'}); 
db.reports.belongsTo(db.users, {foreignKey: 'report_by',as:"reportedBy"});     // ,as:'job_poster'


// db.jobs.hasMany(db.reports, {foreignKey: 'job_id'});       // as:
db.reports.belongsTo(db.jobs, {foreignKey: 'job_id'});      // ,as:'worker'


// relation users, user_imgs
db.users.hasMany(db.user_imgs, {foreignKey: 'user_id'});   
db.user_imgs.belongsTo(db.users, {foreignKey: 'user_id'});     


db.users.hasMany(db.payments, {foreignKey: 'user_id'});   
db.payments.belongsTo(db.users, {foreignKey: 'user_id'});     



module.exports = db;
