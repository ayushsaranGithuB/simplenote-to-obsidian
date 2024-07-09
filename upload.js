module.exports.convert = function (file) {
  // Check if the file exists
  if (!file) {
    console.error("No file was uploaded");
    // return an error http status code
    return { status: 400, message: "No file was uploaded" };
  }

  // Check if the file is a JSON file
  if (file.mimetype !== "application/json") {
    console.error("The file is not a JSON file");
    return;
  }

  // Return a success message with the file name
  let filename = file.name;
  return `${filename} uploaded successfully`;
};
