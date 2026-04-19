'use strict';
module.exports = (sequelize, DataTypes) => {
  const userCards = sequelize.define('user_cards', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,references:{model:'users',key:'id'},defaultValue: null
    },
    stripe_customer_id: { type: DataTypes.STRING },
    stripe_card_id: { type: DataTypes.STRING },
    card_brand: { type: DataTypes.STRING },
    last4: { type: DataTypes.STRING, defaultValue:null },
    exp_month:{ type: DataTypes.INTEGER, defaultValue:null },
    exp_year:{ type: DataTypes.INTEGER, defaultValue:null },
    is_default: { type: DataTypes.STRING, defaultValue:null },
    name: { type: DataTypes.STRING, defaultValue:null },

    token: { type: DataTypes.STRING, defaultValue:null },
    },{
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    })

  return userCards;
}

