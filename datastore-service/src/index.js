const db = require("./db");
const fileChunk = require("./filechunk");
const fs = require('fs');
const path = require('path');


// Create a table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS file_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    file_id INTEGER,
    chunk BLOB,
    file_sequence INTEGER   
    )`);
});
const currentDirectory = __dirname;
const fileName = 'test.txt';
const filePath = path.join(currentDirectory, fileName);


fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Convert the text to bytes (Buffer)
  let buffer = Buffer.from(data, 'utf8');

  fileChunk.createFileChunk(1, buffer, 1)

  // Now 'buffer' contains the bytes of the text file
  
});

db.each("SELECT * FROM file_chunks", (err, row) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(row.id, row.name);
  }
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Database closed");
});
