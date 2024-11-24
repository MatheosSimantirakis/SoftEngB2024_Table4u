import mysql from 'mysql';

export const handler = async (event) => {
  // Set up the remote MySQL connection pool
  const pool = mysql.createPool({
    //Host URL, username, password, & database name
    host: "tables4udb.cv86ygcs8y1s.us-east-2.rds.amazonaws.com",
    user: "tablesAdmin",
    password: "cs3733Tables",
    database: "tables4u",
  });

  // Utility function to execute queries
  const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
      pool.query(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };

  try {
    // Parse the request body: note tables consists of an array of two strings (tableNumberID & max seats avaliable)
    const {managerLogin, name, address, tables, start_time, close_time, dates_open,} = JSON.parse(event.body);

    // Validate that required fields are provided
    if (!managerLogin) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Manager Login is required",
        }),
      };
    }

    // Update restaurant details, Tables/seats array will be updated in another function
    const updateFields = {};
    //Name update
    if (name) updateFields.name = name;
    //Address update
    if (address) updateFields.address = address;
    //Restaurant Time of open
    if (start_time) updateFields.start_time = start_time;
    //Restaurant Time of closer
    if (close_time) updateFields.close_time = close_time;
    //Restaurant Dates open
    if (dates_open) updateFields.dates_open = dates_open;

    if (Object.keys(updateFields).length > 0) {
      const setClauses = Object.keys(updateFields)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updateFields);
      const query = `UPDATE restaurants SET ${setClauses} WHERE managerLogin = ?`;
      await executeQuery(query, [...values, managerLogin]);
    }

    // Update or insert tables and their seat counts
    if (tables && Array.isArray(tables)) {
      for (const { tableNumberID, seats } of tables) {
        if (!tableNumberID || !seats) {
          return {
            statusCode: 400,
            body: JSON.stringify({message: "Each table entree must have a Number ID and a max seats avaliable."}),
          };
        }

        // Check if the table already exists
        const checkQuery = "SELECT COUNT(*) AS count FROM tables WHERE managerLogin = ? AND tableNumber = ?";
        const result = await executeQuery(checkQuery, [managerLogin, tableNumberID]);

        if (result[0].count > 0) {
          //Update existing table
          const updateTableQuery = "UPDATE tables SET seats = ? WHERE managerLogin = ? AND tableNumber = ?";
          await executeQuery(updateTableQuery, [seats, managerLogin, tableNumberID]);
        } else {
          // Insert new table
          const insertTableQuery = "INSERT INTO tables (managerLogin, tableNumber, seats) VALUES (?, ?, ?)";
          await executeQuery(insertTableQuery, [managerLogin, tableNumber, seats]);
        }
      }
    }

    // Return success message
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Restaurant details updated successfully.",
      }),
    };
  } catch (error) {
    // Error handling
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to update restaurant details.",
        error: error.message,
      }),
    };
  }
};
