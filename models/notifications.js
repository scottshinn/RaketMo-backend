'use strict';
module.exports = (sequelize, DataTypes) => {

  const Notifications = sequelize.define('notifications', {
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    user_id: {
      type: DataTypes.INTEGER,
      references: {model:'users',key:'id'},
    },
    // job_id: {type: DataTypes.INTEGER,references:{model:'jobs',key:'id'},defaultValue:null},

    title: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING,defaultValue:null },
    pushType: { type: DataTypes.STRING,defaultValue:null },

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
  return Notifications;
}
