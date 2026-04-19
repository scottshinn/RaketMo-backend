'use strict';
module.exports = (sequelize, DataTypes) => {
  const categoryListing = sequelize.define('categories', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category: { type: DataTypes.STRING },
    category_icon: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },

    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return categoryListing;
}
