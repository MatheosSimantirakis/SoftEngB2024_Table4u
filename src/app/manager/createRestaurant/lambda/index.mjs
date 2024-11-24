import mysql from 'mysql';

export const handler = async (event) => {
  
  var pool = mysql.createPool({
    host: "tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com",
    user: "tablesAdmin",
    password: "cs3733Tables",
    database: "tables4u"
  });

  let ComputeArgumentValue = (name, address, numTables) => {
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO Restaurants (name, address, numTables) VALUES (?, ?, ?)", 
        [name, address, numTables], 
        (error, results) => {
          if (error) {return reject(error);}
          if (results.insertId){
            return resolve(`Created with id: ${results.insertId}`)
          } else {
            return reject("Unable to insert restaurant")
          }
        });
      }
    );
  }

  const result = await ComputeArgumentValue(event.name, event.address, event.numTables);
    
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}