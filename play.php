<?php 
//speakerbot backend. this plays audio via a python script on the server (usually something like a raspberry pi)
//i've tried to keep all the code vanilla and old school
//gus mueller, july 12 2019
//////////////////////////////////////////////////////////////
 
$file = "";
$blob = "";
$mode = "";
if($_REQUEST && $_REQUEST["file"]) {
	$file = $_REQUEST["file"];
}
  
if($_POST) {
	$blob = base64_decode(str_replace('^', '+', str_replace("~", "/", $_POST['blob']))); //OMG THESE FUCKING REPLACEMENTS!!!
	//$blob = $_POST['blob'];
}

if($_REQUEST && $_REQUEST["mode"]) {
	$mode = $_REQUEST["mode"];
	if($mode=="kill") {
		//first turn off the megaphone
		//$command = escapeshellcmd('sudo python powerdown_megaphone.py');
		//passthru($command);
		//sleep(3);
		$command = escapeshellcmd('sudo service apache2 restart');
		passthru($command);
	} else if($mode=="deleteFile") { 
		unlink($file);
	} else if ($mode=="renameFile") {
		//play.php?mode=renameFile&file=" + encodeURI(filename) + "&newFileName=" + encodeURI(newFileName);
		$extensionArray = explode(".", $file);
		$extension = $extensionArray[count($extensionArray)-1];
		$newFileName = $_REQUEST["newFileName"];
		$newFileNameArray = explode("/", $file);
		$newFileNameArray[count($newFileNameArray)-1] = $newFileName . "." . $extension;
		$newFileName = join("/", $newFileNameArray);
		rename($file, $newFileName);
	}
}
//echo "="  . $file . "=<P>";
$command = escapeshellcmd('sudo python play.py  "' . $file . '"' );
//echo $command . "<BR>";
if($file!="" && !$blob && !$mode) {
	passthru($command);
	//exec($command, $out, $status);
} 
 
if($blob && $file) {
	file_put_contents("audio/Custom/" . $file, $blob);

	echo '{"message":"uploaded"}';
} else {
	echo '{"message":"done"}';
}