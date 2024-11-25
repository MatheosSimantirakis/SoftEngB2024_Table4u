import mysql from 'mysql';

export const handler = async (event) => {
  
  var pool = mysql.createPool({
    host: "tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com",
    user: "tablesAdmin",
    password: "cs3733Tables",
    database: "tables4u"
  });

  let ComputeArgumentValue = (oldName, newName, address, numTables) => {
    return new Promise((resolve, reject) => {
      pool.query("UPDATE Restaurants SET name = ?, address = ?, numTables = ? WHERE name = ?",
        [newName, address, numTables, oldName], 
        (error, results) => {
          if (error) {return reject(error);}
          if (results.affectedRows){
            return resolve(`Edited ${results.affectedRows} rows`)
          } else {
            return reject(`Unable to edit restaurant ${oldName}`)
          }
        });
      }
    );
  }

  const result = await ComputeArgumentValue(event.oldName, event.newName, event.address, event.numTables);
    
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}