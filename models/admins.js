'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admins', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name:{ type: DataTypes.STRING },
    mobile_number: {type: DataTypes.STRING,defaultValue: null},
    country_code:{type: DataTypes.STRING,defaultValue: null},
    profile_image: { type: DataTypes.STRING ,defaultValue: null},
    email: { type: DataTypes.STRING,defaultValue: null },
    password: { type: DataTypes.STRING ,defaultValue: null},
    
    created_at:{type: DataTypes.DATE, defaultValue: function(){
      return new Date(Date.now());
    }},
    updated_at:{type: DataTypes.DATE, defaultValue: function(){
      return new Date(Date.now());
    }},
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: false,
  })
  return Admin;
}
