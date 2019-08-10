
function __log(e, data) {
	log.innerHTML += "\n" + e + " " + (data || '');
}

var audio_context;
var recorder;

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
  createDownloadLink();
  
  recorder.clear();
}

function createDownloadLink() {
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
	var ajaxUrl = "play.php?file=" + encodeURI(hf.download);
	oReq.open("POST", ajaxUrl, true);
	oReq.onload = function (oEvent) {
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
	}
   });
}
  
function renameFile(filename) {
	let newNameDiv = document.getElementById('newName');
	document.getElementById('oldFileName').value = filename;
	newNameDiv.style.display = '';

}
	
function saveFileName() {
	let newNameDiv = document.getElementById('newName');
	
	let newFileName =  document.getElementById('newFileName').value;
	let oldFileName = document.getElementById('oldFileName').value;
	//alert("not yet implemented");
	//return
  	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			newNameDiv.style.display = 'none';
            window.location.reload();
			
        }
	};
	let url = "play.php?mode=renameFile&file=" + encodeURI(oldFileName) + "&newFileName=" + encodeURI(newFileName);
  	xmlhttp.open("GET", url, true);
    xmlhttp.send();

}
	
function deleteFile(filename) {
	if(confirm("Are you sure you want to delete " + filename + "?")) {
	  	var xmlhttp = new XMLHttpRequest();
	    xmlhttp.onreadystatechange = function() {
	        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	            window.location.reload();
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

function populateDataTable(dir) {
	var xmlhttp = new XMLHttpRequest();
	let iconWidth = 10;
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			//console.log('responseText:' + xmlhttp.responseText);
			try {
				var data = JSON.parse(xmlhttp.responseText);
				console.log(data);
				let out = "<table class='resultsTable' id='sounds'>\n";
				for(let record of data.files) {
					//console.log(index);
					let filename = record['name'];
					let fullPath = dir + "/" + filename;
					let size = record['size'];
					let tasks = '';
					if(filename != "." && filename != "..") {
				 		tasks = "<a href='javascript:renameFile(\"" + fullPath + "\")'>rename</a> <a href='javascript:deleteFile(\"" + fullPath + "\")'>delete</a>";
						if(!record['directory']) {
				 			out +=  "<tr><td><img src='images/file.png' width='" + iconWidth + "' style='margin-right:10px'/>" + filename + "</td><td><a href='javascript: serverPlay(\"" +  fullPath + "\")'><img src='images/megaphone.png' width='" + iconWidth + "'/></a></td><td><a href='javascript: serverPlay(\"" +   fullPath  + "\")'><a target=audio href='" + fullPath + "'><img src='images/headphone.png' width='" + iconWidth + "'/></a></td><td>" +  record['modified'] + "</td><td style='text-align:right'>" + size + "</td><td>" + tasks + "</td></tr>\n"; 
						} else {
							out += "<tr><td><img src='images/folder.png' width='" + iconWidth + "' style='margin-right:10px'/><a href='?path=" + encodeURI(fullPath) + "'>" + filename + "</a></td><td></td><td></td><td>" + record['modified'] + "</td><td style='text-align:right'>0</td><td>" + tasks + "</td></tr>\n"; 
						
						}
					}
					
				}
				out += "</table>";
				//console.log(out);
				document.getElementById('dataTable').innerHTML = out;
			} catch(err) {
				console.log(err.message + " in " + xmlhttp.responseText);
				return;
			}
			//callback(data);
		}
	};
	let url = "play.php?mode=browse";
	xmlhttp.open("GET", url, true);
	xmlhttp.send(); 
}