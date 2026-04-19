'use strict';
module.exports = (sequelize, DataTypes) => {
  const BookingJobs = sequelize.define('booking_jobs', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    job_id: { type: DataTypes.INTEGER, defaultValue: null },

    worker_id: { type: DataTypes.INTEGER, defaultValue: null },
    job_poster_id: { type: DataTypes.INTEGER, defaultValue: null },

    booking_status: { type: DataTypes.ENUM("Applied", "Hired", "Completed", "Declined"), defaultValue: "Applied" },
    bid_amount: { type: DataTypes.INTEGER, defaultValue: null },
    
    invoice_pdf: { type: DataTypes.STRING, defaultValue: null },

    is_completed_from_worker: { type: DataTypes.INTEGER, defaultValue: 0 },

    deleted_at: { type: DataTypes.DATE, defaultValue: null },
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })

  return BookingJobs;
}

