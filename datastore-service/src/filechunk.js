const db = require("./db");

const createFileChunk = (fileID, chunk, sequence) => {
  const query = `INSERT INTO file_chunks (file_id, chunk, sequence) VALUES (?, ?, ?, ?)`;
  db.run(query, [fileID, chunk, sequence], (e) => {
    if (e) {
      console.error(e);
      return;
    }
    console.log(`File chunk ${chunk} of file ${fileID} added`);
  });
};

const getFileChunk = (fileId) => {
  db.all("SELECT * FROM file_chunks WHERE file_id = ?", [fileId], (e) => {
    if (e) {
      console.error("Could not retrieve file chunks.");
    }
  });
};

module.exports = {
  createFileChunk,
  getFileChunk,
};
