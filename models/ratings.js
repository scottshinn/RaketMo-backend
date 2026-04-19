'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('ratings', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    job_poster_id:{
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    worker_id:{
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    job_id: {
      type: DataTypes.INTEGER,
      references:{model:'jobs',key:'id'},
      defaultValue: null
    },
    booking_job_id:{
      type: DataTypes.INTEGER,
      references:{model:'booking_jobs',key:'id'},
      defaultValue: null
    },
    rated_by:{type:DataTypes.ENUM("JobPoster","Worker","null"),defaultValue:"null"},

    rating: { type: DataTypes.STRING,defaultValue: '1' },
    msg: { type: DataTypes.STRING,defaultValue: null },

    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
  })
  return Rating;
}

