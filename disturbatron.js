var audio_context;
var recorder;
var currentDir;

function __log(e, data) {
	log.innerHTML += "\n" + e + " " + (data || '');
}

function startUserMedia(stream) {
  window.input2 = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');

  // Uncomment if you want the audio to feedback directly
  //input.connect(audio_context.destination);
  //__log('Input connected to audio context destination.');
  
  recorder = new Recorder(window.input2);
  __log('Recorder initialised.');
}

function startRecording(button) {
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  __log('Recording...');
}

function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  __log('Stopped recording.');
  // create WAV download link using audio data blob
  createDownloadLink(currentDir); //currentDir is a global
  recorder.clear();
}

function createDownloadLink(dir) {
	recorder && recorder.exportWAV(function(blob) {
	var url = URL.createObjectURL(blob);
	var li = document.createElement('li');
	var au = document.createElement('audio');
	var hf = document.createElement('a');
	
	au.controls = true;
	au.src = url;
	hf.href = url;
	hf.download = new Date().toISOString() + '.wav';
	hf.innerHTML = hf.download;
	li.appendChild(au);
	li.appendChild(hf);
	recordingslist.appendChild(li);
	
	var oReq = new XMLHttpRequest();
	var ajaxUrl = "play.php?file=" + encodeURI(hf.download) + "&dir=" + encodeURI(dir);
	oReq.open("POST", ajaxUrl, true);
	oReq.onload = function (oEvent) {
		//console.log(currentDir);
		populateDataTable(dir);
	 // Uploaded.
	 //alert('woot');
	};
	//i guess we already have a blob;
	//var blob = new Blob(['abc123'], {type: 'text/plain'});
	oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
 	//oReq.setRequestHeader('Content-type', 'text/plain');
	var reader = new FileReader();
	//alert(url);
	reader.readAsBinaryString(blob); 
	reader.onloadend = function() {
		base64data =  btoa(reader.result);                
		//console.log(base64data);
		//i found the base64data was corrupted at the server because '+' had been converted to ' ' and '/' may have also been corrupted
		//so i've replaced those with ^ and ~, which don't get changed.  they are changed back on the server before the base64data is unencoded
		oReq.send("blob=" + base64data.split('/').join('~').split('+').join('^'));
		//this will only show a change if we happen to be in the audio/Custom directory
	}
   });
}
  
  
 function moveFile(filename) {
	let moveFileDiv = document.getElementById('moveFile');
	document.getElementById('oldLocation').value = currentDir;
	document.getElementById('newLocation').value = currentDir;
	moveFileDiv.style.display = 'block';
}

function saveLocation(justCloseWindow) {
	let moveFileDiv = document.getElementById('moveFile');
	let oldLocation =  document.getElementById('oldLocation').value;
	let newLocation = document.getElementById('newLocation').value;
	if(justCloseWindow) {
		moveFileDiv.style.display = 'none';
		return;
	}
  	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			moveFileDiv.style.display = 'none';
            //window.location.reload();
			populateDataTable(currentDir);
        }
	};
	let url = "play.php?mode=moveFile&file=" + encodeURI(oldFileName) + "&newFileName=" + encodeURI(newFileName);
	console.log(url);
  	xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function renameFile(filename) {
	let newNameDiv = document.getElementById('newName');
	document.getElementById('oldFileName').value = filename;
	document.getElementById('newFileName').value = getFilenameFromPath(filename);
	newNameDiv.style.display = 'block';
}
	
function saveFileName(justCloseWindow) {
	let newNameDiv = document.getElementById('newName');
	let newFileName =  document.getElementById('newFileName').value;
	let oldFileName = document.getElementById('oldFileName').value;
	if(justCloseWindow) {
		newNameDiv.style.display = 'none';
		return;
	}
  	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			newNameDiv.style.display = 'none';
            //window.location.reload();
			populateDataTable(currentDir);
        }
	};
	let url = "play.php?mode=renameFile&file=" + encodeURI(oldFileName) + "&newFileName=" + encodeURI(newFileName);
	console.log(url);
  	xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function createDirectory() {
	let newDirectory = document.getElementById('newDirectory');
	newDirectory.style.display = 'block';
}

function saveDirectory(justCloseWindow) {
	let newDirectory = document.getElementById('newDirectory');
	let directoryName =  document.getElementById('directoryName').value;
	if(justCloseWindow) {
		newDirectory.style.display = 'none';
		return;
	}
  	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			newDirectory.style.display = 'none';
            //window.location.reload();
			populateDataTable(currentDir);
        }
	};
	let url = "play.php?mode=saveDirectory&directoryName=" + encodeURI(directoryName) + "&path=" + encodeURI(currentDir);
	console.log(url);
  	xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
	
function deleteFile(filename) {
	if(confirm("Are you sure you want to delete " + filename + "?")) {
	  	var xmlhttp = new XMLHttpRequest();
	    xmlhttp.onreadystatechange = function() {
	        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	            //window.location.reload();
				populateDataTable(currentDir);
	        }
		};
		let url = "play.php?mode=deleteFile&file=" + encodeURI(filename);
	  	xmlhttp.open("GET", url, true);
	    xmlhttp.send();
	}
}
	
function serverPlay(filename) {
	var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			console.log('responseText:' + xmlhttp.responseText);
			try {
				var data = JSON.parse(xmlhttp.responseText);
			} catch(err) {
				console.log(err.message + " in " + xmlhttp.responseText);
				return;
			}
			callback(data);
		}
	};
	
	let url = "play.php?file=" + encodeURI(filename);
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
  
function killAudio() {
	var xmlhttp = new XMLHttpRequest();
	audio.location = 'images/folder.png'; //make the audio iframe an image to silence it
	   xmlhttp.onreadystatechange = function() {
	       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	           console.log('responseText:' + xmlhttp.responseText);
	           try {
	               var data = JSON.parse(xmlhttp.responseText);
	           } catch(err) {
	               console.log(err.message + " in " + xmlhttp.responseText);
	               return;
	           }
	           callback(data);
	       }
	};
	let url = "play.php?mode=kill";
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

//renders a file browser looking at dir via AJAX -- this of course requires backend support where play.php?mode=browse&path=XXX returns JSON
function populateDataTable(dir) {
	let iconWidth = 15;
	currentDir = dir; //currentDir is a global
	let tableId = "sounds";
	let divForDataTable = "dataTable";
	let includeNavUp = true;
	let out = '';
	if(!dir) {
		dir = 'audio'
	} else {
		includeNavUp = true;
	}
	let xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var data = JSON.parse(xmlhttp.responseText);
			let killLink = '';
			let parentPath = null;
			let parentArray = dir.split("/");
			parentArray.pop();
			let allowUpNav = false;
			console.log(parentArray);
			if(parentArray) {
				parentPath = parentArray.join("/");
			}
			if(parentArray.length > 0) {
				allowUpNav = true;
			}
			out += "<div style='display:inline-block'>";
			if(allowUpNav) {
				let directoryUrl = "javascript: populateDataTable(\"" + encodeURI(parentPath) + "\")";
				out += "<a href='" + directoryUrl + "'><img src='images/up.png' width='" + iconWidth + "' style='margin-right:10px'/></a>";
			}
			out += fileSystemBreadcrumb(dir);
			out += "</div>";
			out += "<div style='display:inline-block;margin-left:20px;'>";
			out += "<button onclick='createDirectory()'>Create directory here</button>";
			out += "</div>";
			out += "<table class='resultsTable' id='" + tableId + "'>\n";
			out += "<thead><tr><th ><a href='javascript: SortTable(\"" + tableId + "\", 0)'>file</a></th><th>play</th><th>test</th><th><a href='javascript: SortTable(\"" + tableId + "\", 3)'>modified</a></th><th><a href='javascript: SortTable(\"" + tableId + "\", 4)'>size</a></th><th>tasks</th></tr></thead>\n";
			
			if(allowUpNav) {
				//out += "<tr  name='sortavoid'><td colspan='6'><a href='" + directoryUrl + "'><img src='images/up.png' width='" + iconWidth + "'/></a></td></tr>\n"; 
			}
			//out += "<tr  name='sortavoid'><td colspan='6'><a href='javascript: createDirectory()'>Create Directory</a></td></tr>\n";
			for(let record of data.files) {
				//console.log(index);
				let filename = record['name'];
				let fullPath = dir + "/" + filename;
				let size = record['size'];
				let tasks = '';
				//console.log(fullPath);
				if(filename != "." && filename != "..") {
			 		tasks = "<a href='javascript:renameFile(\"" + fullPath + "\")'>rename</a> ";
					tasks += "<a href='javascript:deleteFile(\"" + fullPath + "\")'>delete</a> ";
					tasks += "<a href='javascript:moveFile(\"" + fullPath + "\")'>move</a>";
					if(!record['directory']) {
			 			out +=  "<tr><td><img src='images/file.png' width='" + iconWidth + "' style='margin-right:10px'/>" + filename + "</td><td><a href='javascript: serverPlay(\"" +  fullPath + "\")'><img src='images/megaphone.png' width='" + iconWidth + "'/></a></td><td><a href='javascript: serverPlay(\"" +   fullPath  + "\")'><a target=audio href='" + fullPath + "'><img src='images/headphone.png' width='" + iconWidth + "'/></a></td><td>" +  record['modified'] + "</td><td class='numericColumn'>" + size + "</td><td>" + tasks + "</td></tr>\n"; 
					} else {
						//let directoryUrl = "?path=" + encodeURI(fullPath); //old way
						directoryUrl = "javascript: populateDataTable(\"" + encodeURI(fullPath) + "\")";
						out += "<tr><td><img src='images/folder.png' width='" + iconWidth + "' style='margin-right:10px'/><a href='" + directoryUrl + "'>" + filename + "</a></td><td></td><td></td><td>" + record['modified'] + "</td><td class='numericColumn'>-</td><td>" + tasks + "</td></tr>\n"; 
					}
				}
			}
			out += "</table>";
			//console.log(out);
			document.getElementById(divForDataTable).innerHTML = out;
			NumberRows(tableId, 2);
			//re-runs the last sort so things are still sorted correctly
			redoLastSort('sounds');
		}
	};
	let url = "play.php?mode=browse&path=" + dir;
	xmlhttp.open("GET", url, true);
	xmlhttp.send(); 
}

function fileSystemBreadcrumb(dir) {
	let arrDir = dir.split("/");
	let out = ''; 
	currentDir = '';
	for(let i=0; i < arrDir.length; i++) {
		let dirPiece = arrDir[i];
		currentDir += dirPiece;
	 	out += "<a href='javascript: populateDataTable(\"" + currentDir + "\")'>" + dirPiece + "</a>";
		if(i < arrDir.length-1) {
			out += " : ";
			currentDir +=  "/";
		}
	}
	return out;
}

function getFilenameFromPath(path) {
	let newFileNameArray =  path.split("/");
	let fileName = newFileNameArray[newFileNameArray.length-1];
	if(fileName.indexOf('.')>-1) {
		let fileNameArray = fileName.split(".");
		fileNameArray.pop();
		fileName = fileNameArray.join(".");
	}
	return fileName;
}