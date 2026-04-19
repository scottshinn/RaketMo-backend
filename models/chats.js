'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chats = sequelize.define('chats', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    sender_id: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    message: { type: DataTypes.STRING},
    msg_type: { type: DataTypes.INTEGER,defaultValue: 1},   // 1 for msg, 2 -> images, 3 -> video, 4 -> link
    // sender_type: { type: DataTypes.ENUM("JobPoster","Worker"), defaultValue: "Worker"},
    
    job_id: {type: DataTypes.INTEGER,defaultValue: null},

    deleted_by_job_poster: {type: DataTypes.INTEGER,defaultValue: null}, // this key is refer to sender_id
    deleted_by_worker: {type: DataTypes.INTEGER,defaultValue: null}, // this key is refer to receiver_id

    room_id: {
      type: DataTypes.INTEGER,
      references:{model:'rooms',key:'id'},
      defaultValue: null
    },

    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return Chats;
}

