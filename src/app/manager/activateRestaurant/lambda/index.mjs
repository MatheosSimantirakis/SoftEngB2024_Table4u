import mysql from 'mysql';

export const handler = async (event) => {
  
  var pool = mysql.createPool({
    host: "tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com",
    user: "tablesAdmin",
    password: "cs3733Tables",
    database: "tables4u"
  });

  let ComputeArgumentValue = (name) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE Restaurants SET activated = 1 WHERE name = ?",
        [name], 
        (error, results) => {
          if (error) {return reject(error);}
          if (results.affectedRows){
            return resolve(`Activated ${results.affectedRows} rows`)
          } else {
            return reject("Unable to activate restaurant")
          }
        });
      }
    );
  }

  const result = await ComputeArgumentValue(event.name);
    
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}