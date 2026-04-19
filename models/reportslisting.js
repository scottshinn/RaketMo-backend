'use strict';
module.exports = (sequelize, DataTypes) => {
  const workCategory = sequelize.define('reportslisting', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    report: { type: DataTypes.STRING },
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
  return workCategory;
}
