const {Sequelize} = require('sequelize');
require('dotenv').config();
const {database,user_name, password} = process.env;

const sequelize = new Sequelize(database,user_name,password,{
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false,
  pool:{max:10,min:0,idle:10000},
  // dialectOptions: {
  //   charset: 'utf8mb4',
  // },
  // define: {
  //   charset: 'utf8mb4',
  //   collate: 'utf8mb4_unicode_ci',
  // },
});

sequelize.authenticate().then(()=>{
  console.log('---mysql db connected---');
})
.catch(err=> console.log('---db err----',err))


// sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(() => {
// sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
// })

  sequelize.sync({ force: false }).then(() => {
    console.log('----re-sync-----');
  }).catch((err) => {
    console.log('----re sync err---', err);
    throw err
  })



module.exports= sequelize;
