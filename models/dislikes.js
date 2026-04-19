'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dislike = sequelize.define('dislikes', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    job_id: {type: DataTypes.INTEGER,references:{model:'jobs',key:'id'},defaultValue:null},
    dislike_by: {type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},

    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })

  return Dislike;
}

