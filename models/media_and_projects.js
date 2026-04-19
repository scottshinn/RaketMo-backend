'use strict';
module.exports = (sequelize, DataTypes) => {
  const Jobs = sequelize.define('media_and_projects', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    user_id:{type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},
    image:{type: DataTypes.STRING, defaultValue:null },
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })

  return Jobs;
}

