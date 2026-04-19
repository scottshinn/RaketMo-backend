'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recent = sequelize.define('recents', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    user_id: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    search_by: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    search: {type: DataTypes.STRING,defaultValue: null},
    
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return Recent;
}

