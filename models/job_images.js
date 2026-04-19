'use strict';
module.exports = (sequelize, DataTypes) => {
  const JobertyImages = sequelize.define('job_images', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    job_id: {type: DataTypes.INTEGER,references:{model:'jobs',key:'id'},defaultValue:null},
    job_image: { type: DataTypes.STRING },

    created_at:{type: DataTypes.DATE, defaultValue:function(){
      return new Date(Date.now());
    }},
    updated_at:{type: DataTypes.DATE, defaultValue:function(){
      return new Date(Date.now());
    }},
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: false,
  })

  // JobertyImages.hasMany(db, { foreignKey: 'user_id' });
  // JobertyImages.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return JobertyImages;
}

