'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('subscriptions', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    user_id: {
      type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue: null
    },
    // user_type: {type: DataTypes.ENUM("JobPoster","Worker","null"), defaultValue: "null"},
    subscription_type: {type: DataTypes.ENUM("monthly","top_user"), defaultValue: "monthly"},

    plan_id: { type: DataTypes.INTEGER, defaultValue: null},
    plan_price: { type: DataTypes.STRING, defaultValue: null},

    plan_type:{ type:DataTypes.ENUM("free","paid"), defaultValue:"free"},
    start_date: {type: DataTypes.DATE, defaultValue: null},
    expire_date: {type: DataTypes.DATE, defaultValue: null},
    plan_duration: {type: DataTypes.STRING, defaultValue: null},
    purchase_plan: {type: DataTypes.STRING, defaultValue: null},
    product_id: {type: DataTypes.STRING, defaultValue: null},
    subscription_id: {type: DataTypes.STRING, defaultValue: null},
    currency: {type: DataTypes.STRING, defaultValue: null},

    purchase_token: {type: DataTypes.STRING, defaultValue: null},
    transaction_id: {type: DataTypes.STRING, defaultValue: null},
    // original_transcation_id: {type: DataTypes.STRING, defaultValue: null},
    
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return Subscription;
}

