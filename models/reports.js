'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('reports', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    
    // sender_type: { type: DataTypes.ENUM("JobPoster","Worker")},
    
    job_id: {
      type: DataTypes.INTEGER,
      references:{model:'jobs',key:'id'},
      defaultValue: null
    },
    report_by: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    report_to: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    message: { type: DataTypes.STRING},
    // created_at:{type: DataTypes.DATE, defaultValue: function(){
    //   return new Date(Date.now());
    // }},
    // updated_at:{type: DataTypes.DATE, defaultValue: function(){
    //   return new Date(Date.now());
    // }},
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return Report;
}

