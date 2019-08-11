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

$iconWidth = 20;
$basePath = 'audio';
$killLink = "<a href='javascript: killAudio()'><img src='images/stop.png' width='" . $iconWidth . "' style='margin-right:10px'/>kill playing audio</a><br>";

//if we render the HTML with PHP:
/*

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
*/
//if we do things in javascript;
$out .= "<div><div style='display:inline-block'><h4>Pick a file to play:</h4></div><div style='display:inline-block;margin-left:80px'>"  . $killLink . "</div></div>";
$out .= "<div id='dataTable'></div>";
$out .= "\n<script>\npopulateDataTable();\n</script>";
//$out .= "\n<script>\nNumberRows('sounds', 2);\n</script>";
$out .= $killLink;

?>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Disturbatron 2019</title>
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
<script src="disturbatron.js"></script>
<body>
	<h2 class='title'>Audio Disturbatron 2019</h2>
	<script src="recorder.js"></script>
	<script src="tablesort_js.js"></script>
	<link rel="stylesheet" href='stylesheet.css'/>
	<div id='newName' style='display:none;position:absolute;top:200px;right:200px;background-color:#ddddff;border-style: solid;border-color:#999999;width:360px;height:200px;z-index:200;padding:10px'>
	<h3>Rename File: </h3>
	Old file name: <input disabled id='oldFileName' size='40'>
	New file name:  <input id='newFileName' size='40'>
	<button onclick='saveFileName()' type='button'>Rename</button>
	<button onclick='saveFileName(true)' type='button'>Cancel</button>
	</div>
	<?php echo $out ?>
	<iframe name='audio' width=0 height=0></iframe>
</body>
</html>
