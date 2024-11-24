import mysql from 'mysql';

export const handler = async (event) => {
  
  const pool = mysql.createPool({
    host: "tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com",
    user: "tablesAdmin",
    password: "cs3733Tables",
    database: "tables4u"
  });

  let ComputeArgumentValue = (name, address, numTables) => {
    return new Promise((resolve, reject) => {

      pool.query("INSERT INTO Restaurant (name, address, numTables) VALUES(?, ?, ?)", 
        [name, address, numTables], 
        (error, rows) => {
          if (error) {
            return reject("Unable to create restaurant: " + error.message);
          }
          resolve("Restaurant created successfully");
        });
      }
    );
  }

  try {
    const result = await ComputeArgumentValue(event.name, event.address, event.numTables);
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error })
    };
  } finally {
    pool.end();
  }
};