const fs = require("fs");
const path = require("path");

// Path to the JSON file we'll read in:
const INPUT_FILE = "./notes.json";

// Path to the directory where we'll save the converted notes:
const OUTPUT_DIRECTORY = "./notes_converted/";

// Should the creation time of the created files be set to the creation
// time of the original notes?
// Will fail if you're not on a Mac, or don't have Xcode installed -
// in which case set this to false.
const KEEP_ORIGINAL_CREATION_TIME = true;

// Should the last-modified time of the created files be set to the
// last-modified time of the original notes?
const KEEP_ORIGINAL_MODIFIED_TIME = true;

function main() {
  // Set-up and checking
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`There is no file at ${INPUT_FILE}`);
    return;
  }

  if (!fs.statSync(INPUT_FILE).isFile()) {
    console.error(`${INPUT_FILE} is not a file`);
    return;
  }

  let tagPosition = prompt(
    "\nWhere should tags be put? Either 'start' or 'end' (default is 'end'):"
  );

  if (tagPosition === "") {
    tagPosition = "end";
  }

  if (!["start", "end"].includes(tagPosition)) {
    console.error("Enter either 'start' or 'end'.");
    return;
  }

  if (!fs.existsSync(OUTPUT_DIRECTORY)) {
    fs.mkdirSync(OUTPUT_DIRECTORY);
  }

  // Loop through all the notes and create new ones
  console.log("");

  const filenames = {};

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  if (!data || typeof data !== "object") {
    console.error(
      `Could not parse ${INPUT_FILE}. Are you sure it's a JSON file?`
    );
    return;
  }

  if (!data.activeNotes || !Array.isArray(data.activeNotes)) {
    console.error(
      `There is no 'activeNotes' element in the data found in ${INPUT_FILE}`
    );
    return;
  }

  for (const note of data.activeNotes) {
    const lines = note.content.split("\n");

    if (lines.length === 0) {
      console.log(`Skipping empty note with ID of ${note.id}`);
    } else {
      if (note.tags) {
        const tags = note.tags.map((tag) => "#" + tag.replace(/\W+/g, "-"));
        const tagText = tags.join(" ");

        if (tagPosition === "start") {
          lines.splice(1, 0, "", tagText);
        } else {
          lines.push("", tagText);
        }
      }

      let filename = lines[0];
      if (filename.length > 248) {
        filename = filename.substring(0, 248) + ".md";
      } else {
        filename += ".md";
      }

      filename = filename.replace(/[/:]/g, "");
      const filepath = path.join(OUTPUT_DIRECTORY, filename);

      if (filenames[filename]) {
        filenames[filename]++;
        filename = `${filename.slice(0, -3)} ${filenames[filename]}.md`;
      }

      fs.writeFileSync(filepath, lines.join("\n"), "utf-8");

      if (KEEP_ORIGINAL_CREATION_TIME) {
        const creationTime = new Date(note.creationDate).toLocaleString();
        fs.utimesSync(filepath, creationTime, creationTime);
      }

      if (KEEP_ORIGINAL_MODIFIED_TIME) {
        const modifiedTime = new Date(note.lastModified).getTime() / 1000;
        fs.utimesSync(filepath, modifiedTime, modifiedTime);
      }
    }
  }

  const numFiles = Object.values(filenames).reduce(
    (total, count) => total + count,
    0
  );
  const filesWere = numFiles === 1 ? "file was" : "files were";
  console.log(`\n${numFiles} .md ${filesWere} created in ${OUTPUT_DIRECTORY}`);
}

main();
