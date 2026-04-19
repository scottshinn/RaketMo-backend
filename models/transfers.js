'use strict';
module.exports = (sequelize, DataTypes) => {
  const TransferHistory = sequelize.define('transfers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    worker_id: {    // worker_id receiving money
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      allowNull: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references: { model: 'booking_jobs', key: 'id' },
      allowNull: true
    },
    stripe_transfer_id: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'usd' },

    destination: { type: DataTypes.STRING }, // Stripe connected account ID

    metadata: { type: DataTypes.JSON, defaultValue: null }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TransferHistory;
};