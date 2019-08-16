<?php 
//speakerbot web page. this produces a list of audio files in the audio directory that can be sampled locally or played on the remote megaphone
//i've tried to keep all the code vanilla and old school
//gus mueller, july 12 2019
//////////////////////////////////////////////////////////////
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
$iconWidth = 15;
$killLink = "<a href='javascript: killAudio()'><img src='images/stop.png' width='" . $iconWidth . "' style='margin-right:10px'/>kill playing audio</a><br>";
?>
<!DOCTYPE html>
<html>
<head>
	<script>
		window.onload = function init() {
			try {
			  // webkit shim
			  window.AudioContext = window.AudioContext || window.webkitAudioContext;
			  navigator.getUserMedia = ( navigator.getUserMedia ||  navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
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
	<script src="disturbatron.js"></script>
	<script src="recorder.js"></script>
	<script src="tablesort_js.js"></script>
	<link rel="stylesheet" href='stylesheet.css'/>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Disturbatron 2019</title>
</head>
<body>
 <div class='recorder'>
  <button onclick="startRecording(this);">record</button>
  <button onclick="stopRecording(this);" disabled>stop</button>
  <h4>Recordings</h4>
  <ul id="recordingslist"></ul>
  <h4>Log</h4>
  <pre id="log"></pre>
 </div>
<body>
	<h2 class='title'>Audio Disturbatron 2019</h2>
	<div id='newDirectory'  class='newDirectory'>
		<h3>New Directory: </h3>
		Directory Name: <input id='directoryName' size='40'><br/>
	 
		<button onclick='saveDirectory()' type='button'>Create</button>
		<button onclick='saveDirectory(true)' type='button'>Cancel</button>
	</div>
	<div id='newName'  class='renamePopup'>
		<h3>Rename File: </h3>
		Old file name: <input disabled id='oldFileName' size='40'><br/>
		New file name:  <input id='newFileName' size='40'><br/>
		<button onclick='saveFileName()' type='button'>Rename</button>
		<button onclick='saveFileName(true)' type='button'>Cancel</button>
	</div>
	<div id='moveFile'  class='renamePopup'>
		<h3>Move File: </h3>
		Old location: <input disabled id='oldLocation' size='40'><br/>
		New location:  <input id='newLocation' size='40'><br/>
		<button onclick='saveLocation()' type='button'>Move</button>
		<button onclick='saveLocation(true)' type='button'>Cancel</button>
	</div>
	<div>
		<div style='display:inline-block'>
			<h4>Pick a file to play:</h4>
		</div>
		<div style='display:inline-block;margin-left:80px'>
			<?php echo $killLink;?>
		</div>
	</div>
	<div id='dataTable'></div>
	<script>populateDataTable();</script>
	<script>NumberRows('sounds', 2);</script>
	<?php echo $killLink;?>
	<iframe name='audio' width=0 height=0 style='display:none'></iframe>
</body>
</html>
