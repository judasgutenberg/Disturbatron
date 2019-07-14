<?php 
//speakerbot web page. this produces a list of audio files in the audio directory that can be sampled locally or played on the remote megaphone
//i've tried to keep all the code vanilla and old school
//gus mueller, july 12 2019
//////////////////////////////////////////////////////////////
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
 
$path = "";
if($_REQUEST && $_REQUEST["path"]) {
	$path = $_REQUEST["path"];
}
//echo $file . "*";

if($_REQUEST && $_REQUEST["mode"]) {
	$mode = $_REQUEST["mode"];
	if($mode=="kill") {
		$command = escapeshellcmd('sudo service apache2 restart');
		passthru($command);
	}
}

$iconWidth = 20;
$basePath = 'audio';
$killLink = "<a href='javascript: killAudio()'><img src='images/stop.png' width='" . $iconWidth . "' style='margin-right:10px'/>kill playing audio</a><br>";
$includeNavUp = false;
if($path) {
	$dir   =  $path;
	$includeNavUp = true;
} else {
	$dir   = $basePath;
}
//catch all the attempts to browse the rest of the file system
if(substr(0, 1, $dir) == '1') {
	$dir = substr(1, $dir);
}
if(strpos($dir, "..") !== false) {
	die("No haxxo7s allowed!");
}
//done catching all those haxxo7s!
$files = scandir($dir);
$parentPath = join("/", array_pop(explode("/", $dir)));
$out = ""; 
$out .= "<div  ><div style='display:inline-block'><h4>Pick a file to play:</h4></div><div style='display:inline-block;margin-left:80px'>" . $killLink . "</div></div>";
$out .= "<table class='resultsTable' id='sounds'>\n";
$out .= "<thead><tr><th ><a href='javascript: SortTable(\"sounds\", 0)'>file</a></th><th>play</th><th>test</th><th><a href='javascript: SortTable(\"sounds\", 3)'>modified</a></th><th><a href='javascript: SortTable(\"sounds\", 4)'>size</a></th><th>tasks</th></tr></thead>\n";
if($includeNavUp) {
	$out .=  "<tr  name='sortavoid'><td colspan='6'><a href='?path=" . urlencode($parentPath) . "'><img src='images/up.png' width='" . $iconWidth . "'/>" . $filename . "</a></td></tr>\n"; 
}
for($i=0; $i<count($files); $i++) {
	$filename = $files[$i];
	$fullPath = $dir . "/" . $filename;
	$size = filesize($fullPath) ;
	 
	$modifiedDate = filemtime($fullPath);

	if($filename != "." && $filename != "..") {
 		$tasks = "<a href='javascript:renameFile(\"" . $fullPath . "\")'>rename</a> <a href='javascript:deleteFile(\"" . $fullPath . "\")'>delete</a>";
		if(is_file($fullPath)) {
 			$out .=  "<tr><td><img src='images/file.png' width='" . $iconWidth . "' style='margin-right:10px'/>" .  $filename . "</td><td><a href='javascript: serverPlay(\"" .   $fullPath  . "\")'><img src='images/megaphone.png' width='" . $iconWidth . "'/></a></td><td><a href='javascript: serverPlay(\"" .   $fullPath   . "\")'><a target=audio href='" .  $fullPath . "'><img src='images/headphone.png' width='" . $iconWidth . "'/></a></td><td>" . date ("Y-m-d H:i:s.", $modifiedDate). "</td><td style='text-align:right'>" . $size . "</td><td>" . $tasks. "</td></tr>\n"; 
		} else {
			$out .=  "<tr><td><img src='images/folder.png' width='" . $iconWidth . "' style='margin-right:10px'/><a href='?path=" . urlencode($fullPath) . "'>" . $filename . "</a></td><td></td><td></td><td>" . date ("Y-m-d H:i:s.", $modifiedDate). "</td><td style='text-align:right'>0</td><td>" . $tasks. "</td></tr>\n"; 
		
		}
	}
}
$out .= "</table>\n";
$out .= "<script>NumberRows('sounds', 2);</script>";
$out .= $killLink;

?>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Live input record and playback</title>
  <style type='text/css'>
    ul { list-style: none; }
    #recordingslist audio { display: block; margin-bottom: 10px; }
  </style>

  

</head>
<body>

 
 <div style='float:right'>
  <button onclick="startRecording(this);">record</button>
  <button onclick="stopRecording(this);" disabled>stop</button>
  
  <h4>Recordings</h4>
  <ul id="recordingslist"></ul>
  
  <h4>Log</h4>
  <pre id="log"></pre>
 </div>
 <script>
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

  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
					   
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };
  </script>
  <body>
  <h2 class='title'>Audio Disturbatron 2019</h2>
  <script src="recorder/dist/recorder.js"></script>
  <script src="tablesort_js.js"></script>
  <link rel="stylesheet" href='stylesheet.css'/>
<div id='newName' style='display:none;position:absolute;top:200px;right:200px;background-color:#ddddff;border-style: solid;border-color:#999999;width:200px;height:200px;z-index:200;padding:10px'>
	<h3>Rename File</h3>
	<input id='oldFileName' type='hidden' size='20'>
	New file name:  <input id='newFileName' size='20'>
	<button onclick='saveFileName()'>Save New File Name</button>
</div>
<?php echo $out ?>
  <iframe name='audio' width=0 height=0></iframe>
  </body>
  </html>
