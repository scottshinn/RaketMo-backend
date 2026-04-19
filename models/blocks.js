'use strict';
module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define('blocks', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    blocked_by: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    blocked_user: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return Block;
}

