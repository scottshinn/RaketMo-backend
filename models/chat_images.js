'use strict';
module.exports = (sequelize, DataTypes) => {
  const MsgImages = sequelize.define('chat_images', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    chat_id: {type: DataTypes.INTEGER,references:{model:'chats',key:'id'},defaultValue:null},
    msg_img: { type: DataTypes.STRING },

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

  // MsgImages.hasMany(db, { foreignKey: 'user_id' });
  // MsgImages.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return MsgImages;
}

