fs = require("fs");
path = require("path");
AdmZip = require("adm-zip");

module.exports.convert = function (file) {
  // Create a unique directory for each user
  const BASE_OUTPUT_DIRECTORY = "output";
  const uniqueID = Math.random().toString(36).substring(2, 15);
  const OUTPUT_DIRECTORY = path.join(BASE_OUTPUT_DIRECTORY, uniqueID);

  // Check if the file exists
  if (!file) {
    console.error("No file was uploaded");
    // return an error http status code
    return { status: 400, message: "No file was uploaded" };
  }

  // Check if the file is a JSON file
  if (file.mimetype !== "application/json") {
    console.error("The file is not a JSON file");
    return { status: 400, message: "The file is not a JSON file" };
  }

  // Parse the file
  let data = JSON.parse(file.data);

  // Check if the file is empty
  if (!data) {
    console.error("The file is empty");
    return { status: 400, message: "The file is empty" };
  }

  if (!data || typeof data !== "object") {
    console.error(`Could not parse. Are you sure it's a JSON file?`);
    return {
      status: "400",
      message: `Could not parse. Are you sure it's a JSON file?`,
    };
  }

  if (!data.activeNotes || !Array.isArray(data.activeNotes)) {
    console.error(
      `There is no 'activeNotes' element in the data found. Are you sure it's a Simplenote file?`
    );
    return {
      status: 400,
      message: `There is no 'activeNotes' element in the data found. Are you sure it's a Simplenote file?`,
    };
  }

  // Setup the output directory
  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY);
  }

  const filenames = {};
  let noOfFiles = 0;

  for (const note of data.activeNotes) {
    const lines = note.content.split("\n");

    if (lines.length === 0) {
      console.log(`Skipping empty note with ID of ${note.id}`);
    } else {
      if (note.tags) {
        const tags = note.tags.map((tag) => "#" + tag.replace(/\W+/g, "-"));
        const tagText = tags.join(" ");

        let tagPosition = "end";

        if (tagPosition === "start") {
          lines.splice(1, 0, "", tagText);
        } else {
          lines.push("", tagText);
        }
      }

      // Function to sanitize filenames
      function sanitizeFilename(filename) {
        if (filename.length === 0) {
          return Math.random().toString(36).substring(2, 15) + ".md";
        }
        return filename
          .replace(/[<>:"\/\\|?*\x00-\x1F]/g, "-")
          .replace(/^CON$|^PRN$|^AUX$|^NUL$|^COM[1-9]$|^LPT[1-9]$/i, "_$&");
      }

      // Assuming the rest of your code remains the same up to the filename assignment
      let filename = sanitizeFilename(lines[0]);
      if (filename.length > 88) {
        filename = filename.substring(0, 88) + ".md";
      } else {
        filename = filename + ".md";
      }

      filename = filename.replace(/[/:]/g, "").replace(/\s+/g, "-");
      const filepath = path.join(OUTPUT_DIRECTORY, filename);

      if (filenames[filename]) {
        filenames[filename]++;
        filename = `${filename.slice(0, -3)} ${filenames[filename]}.md`;
      }

      console.log(`Creating ${filename}...`);

      noOfFiles++;

      fs.writeFileSync(filepath, lines.join("\n"), "utf-8");

      const creationTime = new Date(note.creationDate).getTime() / 1000;
      console.log(note.creationDate);
      console.log(creationTime);

      fs.utimesSync(filepath, creationTime, creationTime);

      const modifiedTime = new Date(note.lastModified).getTime() / 1000;
      fs.utimesSync(filepath, modifiedTime, modifiedTime);
    }
  }

  // ZIP up all the files and return the zip file
  const zip = new AdmZip();
  zip.addLocalFolder(OUTPUT_DIRECTORY);
  zip.writeZip(`${OUTPUT_DIRECTORY}.zip`);

  const numFiles = noOfFiles;

  const filesWere = numFiles === 1 ? "file was" : "files were";
  console.log(`\n${numFiles} .md ${filesWere} created in ${OUTPUT_DIRECTORY}`);

  // Return a success message with the file name
  let filename = file.name;
  return {
    status: 200,
    message: `${filename} uploaded successfully`,
    file: `${OUTPUT_DIRECTORY}.zip`,
  };
};
