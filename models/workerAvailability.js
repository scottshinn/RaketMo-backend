'use strict';
module.exports = (sequelize, DataTypes) => {
  const WorkerAvailability = sequelize.define('workerAvailability', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    worker_id: {
      type: DataTypes.INTEGER,
//      references: { model: 'users', key: 'id' },
      defaultValue: null
    },

    start_time: { type: DataTypes.TIME, defaultValue: null },
    end_time: { type: DataTypes.TIME, defaultValue: null },

    day: { type: DataTypes.ENUM("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), defaultValue: "Sunday" },
    status: { type: DataTypes.STRING, defaultValue: '1' },      //  0 closed, 1 open
    deleted_at: { type: DataTypes.DATE, defaultValue: null },
  }, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  })
  return WorkerAvailability;
}

