//  If a file is drag and dropped anywhere on form.upload-form (which is the entire form), the file will be uploaded.
// ************************ Drag and drop ***************** //
let dropArea = document.getElementById("drop-area");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener("drop", handleDrop, false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
  dropArea.classList.add("highlight");
}

function unhighlight(e) {
  dropArea.classList.remove("highlight");
}

function handleFiles(files) {
  files = [...files];
  // initializeProgress(files.length)
  files.forEach(uploadFile);
  // files.forEach(previewFile)
}

function handleDrop(e) {
  var dt = e.dataTransfer;
  var file = dt.files[0]; // Access the file from dt.files

  // Check if the file is a .JSON file
  if (file.type === "application/json") {
    uploadFile(file);
  } else {
    alert("Please upload a .JSON file");
  }
}

// let uploadProgress = [];
// let progressBar = document.getElementById("progress-bar");

// function initializeProgress(numFiles) {
//   progressBar.value = 0;
//   uploadProgress = [];

//   for (let i = numFiles; i > 0; i--) {
//     uploadProgress.push(0);
//   }
// }

// function updateProgress(fileNumber, percent) {
//   uploadProgress[fileNumber] = percent;
//   let total =
//     uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length;
//   progressBar.value = total;
// }

function uploadFile(file, i) {
  var url = "/upload";
  var xhr = new XMLHttpRequest();
  var formData = new FormData();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

  // Append the file to the form data
  formData.append("file", file);

  //  progress indicator

  dropArea.classList.add("uploading");

  xhr.addEventListener("readystatechange", function (e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // Respond with the response text from the server
      alert(xhr.responseText);
      dropArea.classList.remove("uploading");
    } else if (xhr.readyState == 4 && xhr.status != 200) {
      // Error. Inform the user
      alert("An error occurred while uploading the file");
      dropArea.classList.remove("uploading");
    }
  });

  xhr.send(formData);
}
