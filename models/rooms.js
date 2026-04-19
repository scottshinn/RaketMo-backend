'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('rooms', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    created_by: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    created_to: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    last_message: { type: DataTypes.STRING},
    job_poster_unseen: { type: DataTypes.INTEGER,defaultValue: 0},          
    worker_unseen_count: { type: DataTypes.INTEGER,defaultValue: 0},     

    deleted_by_worker: {type: DataTypes.INTEGER,defaultValue: null},
    deleted_by_job_poster: {type: DataTypes.INTEGER,defaultValue: null},
    created_at:{type: DataTypes.DATE, defaultValue: function(){
      return new Date(Date.now());
    }},
    updated_at:{type: DataTypes.DATE, defaultValue: function(){
      return new Date(Date.now());
    }},
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: false,
    // createdAt: "created_at",
    // updatedAt: "updated_at",
  })
  return Room;
}

