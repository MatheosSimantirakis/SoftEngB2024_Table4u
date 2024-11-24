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
      pool.query("DELETE FROM Restaurants WHERE name = ?",
        [name], 
        (error, results) => {
          if (error) {return reject(error);}
          if (results.affectedRows){
            return resolve(`Deleted ${results.affectedRows} rows`)
          } else {
            return reject("Unable to delete restaurant")
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