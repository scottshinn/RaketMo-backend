'use strict';
module.exports = (sequelize, DataTypes) => {
  const Jobs = sequelize.define('jobs', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title : { type: DataTypes.STRING },

    job_poster_id:{type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue:null},
    longitude:{type: DataTypes.DECIMAL(10, 6)},    // longitude
    latitude:{type: DataTypes.DECIMAL(10, 6)},     // latitude
    address:{type: DataTypes.STRING },

    // category_id: { type: DataTypes.INTEGER,references:{model:'categories',key:'id'},defaultValue:null},
    category_id: { type: DataTypes.STRING,defaultValue:null},
    description: { type: DataTypes.TEXT },
    price:{type:DataTypes.INTEGER,defaultValue:0},

    min_bids: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    max_bids: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_bids_more: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    //    is_bids_more: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    jobs_date: { type: DataTypes.DATEONLY, allowNull: false },
    jobs_time: { type: DataTypes.STRING, allowNull: false },

    status:{type:DataTypes.ENUM('posted','onwork','completed'),defaultValue:'posted'},
    action:{ type: DataTypes.ENUM("Enable","Disable"),defaultValue: "Enable"},

    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // charset: 'utf8mb4',
    // collate: 'utf8mb4_unicode_ci',
  })

  return Jobs;
}

