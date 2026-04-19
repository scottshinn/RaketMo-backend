'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('payments', {

    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    user_id:{type: DataTypes.INTEGER,
      references:{model:'users',key:'id'},
      defaultValue:null
    },
    worker_id:{type: DataTypes.INTEGER, // user_id who will receive payment
      references:{model:'users',key:'id'},
      defaultValue:null
    },
    booking_id: {type: DataTypes.INTEGER,references:{model:'booking_jobs',key:'id'},defaultValue:null},
    booking_status:{type:DataTypes.ENUM("Hired","Completed"),defaultValue:"Hired"},

    amount: {type: DataTypes.DECIMAL(10, 2),allowNull: false},
    currency: {type: DataTypes.STRING, defaultValue: null},

    stripe_fee: {type: DataTypes.STRING, defaultValue: null},
    net_fee: {type: DataTypes.STRING, defaultValue: null},

    stripe_payment_intent_id: {type: DataTypes.STRING, defaultValue: null},    
    stripe_customer_id: {type: DataTypes.STRING, defaultValue: null},
    card_id: {type: DataTypes.STRING, defaultValue: null},

    status: {type: DataTypes.STRING, defaultValue: null},
    description: {type: DataTypes.STRING, defaultValue: null},

    metadata: {type: DataTypes.JSON,allowNull: true}
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Payment;
};
