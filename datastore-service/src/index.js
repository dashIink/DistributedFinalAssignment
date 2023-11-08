const db = require("./db");

// Create a table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS file_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    file_id INTEGER,
    chunk BLOB,
    file_sequence INTEGER   
    )`);
});

/*
db.each("SELECT * FROM users", (err, row) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(row.id, row.name);
  }
});
*/

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Database closed");
});
