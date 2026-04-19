'use strict';
module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('appointments', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // job_id:{type: DataTypes.INTEGER,references:{model:'jobs',key:'id'},defaultValue:null},
    title:{type: DataTypes.STRING, defaultValue:null},
    worker_id: {type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},
    job_poster_id: {type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},

    status:{type:DataTypes.ENUM("Pending","Accepted","Declined","Completed"),defaultValue:"Pending"},
    // date:{type:DataTypes.DATE,defaultValue:null},
    start_time:{type:DataTypes.DATE,defaultValue:null},
    end_time:{type:DataTypes.DATE,defaultValue:null},

    deleted_at: {type: DataTypes.DATE, defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })

  return Appointment;
}

