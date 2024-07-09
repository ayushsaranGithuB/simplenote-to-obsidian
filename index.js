// Load Express and setup the app
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const port = 3000;

// Load the fs and path modules
const fs = require("fs");
const path = require("path");
const { convert } = require("./upload");
const e = require("express");
// Import the convert function from the ./upload module

app.use(express.static("public"));
app.use(fileUpload());

// '/' route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "input.html"));
});

// 'upload' route
app.post("/upload", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // setTimeout(() => {
  //   res.send("File uploaded successfully");
  // }, 5000);

  // Get the file from the POST request
  let file = req.files.file;

  // Send the file to the convert function
  const response = convert(file);
  // returns a JSON like { status: 400, message: "No file was uploaded" };

  // Send the response
  res.json(response);
});

// '/output' route
//  /output/al2i6zexfnp.zip
app.get("/output/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, "output", filename));
});

// Listen on port 3000
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
