'use strict';
module.exports = (sequelize, DataTypes) => {
  const Jobs = sequelize.define('user_imgs', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    user_id:{type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},
    img:{type: DataTypes.STRING },


    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })

  return Jobs;
}

