import mysql from 'mysql';
const connection = mysql.createConnection({
  host: 'tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com',
  user: 'tablesAdmin',
  password: 'cs3733Tables',
  database: 'tables4u'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

