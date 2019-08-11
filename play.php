<?php 
//speakerbot backend. this plays audio via a python script on the server (usually something like a raspberry pi)
//i've tried to keep all the code vanilla and old school
//gus mueller, july 12 2019
//////////////////////////////////////////////////////////////
 
 
//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);


$file = "";
$blob = "";
$mode = "";

if($_REQUEST && $_REQUEST["file"]) {
	$file = $_REQUEST["file"];
}
  
if($_POST) {
	$blob = base64_decode(str_replace('^', '+', str_replace("~", "/", $_POST['blob']))); //OMG THESE FUCKING REPLACEMENTS!!!
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
		echo '{"message":"sound killed"}';
	} else if($mode=="deleteFile") { 
		unlink($file);
		echo '{"message":"file deleted"}';
	} else if ($mode=="renameFile") {
		
		//play.php?mode=renameFile&file=" + encodeURI(filename) + "&newFileName=" + encodeURI(newFileName);
		$extensionArray = explode(".", $file);
		$extension = $extensionArray[count($extensionArray)-1];
		$newFileName = $_REQUEST["newFileName"];
		$newFileNameArray = explode("/", $file);
		$newFileNameArray[count($newFileNameArray)-1] = $newFileName . "." . $extension;
		//this would be for boneheads who don't include the path or extension when they rename:
		//$newFileName = join("/", $newFileNameArray);
		
		$out = rename($file, $newFileName);
		//echo("DDD") + $out;
		echo '{"message":"file renamed"}';
	} else if ($mode=='browse') { //in case i want to do directory browsing via AJAX
		$path = "";
		if($_REQUEST && $_REQUEST["path"]) {
			$path = $_REQUEST["path"];
		}
		$basePath = 'audio';
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
		$fileArray = array();
		for($i=0; $i<count($files); $i++) {
			$file = $files[$i];
			$fullPath = $dir . "/" . $file;
			$fileArray[count($fileArray)] = array("name"=>$file, "modified"=>date ("Y-m-d H:i:s.", filemtime($fullPath)), "size"=>filesize($fullPath), "directory"=>!is_file($fullPath), "path"=>$fullPath);
		
		}
		$parentPath = join("/", array_pop(explode("/", $dir)));
		$objOut = array("parentPath"=>$parentPath, "files"=>$fileArray);
		echo json_encode($objOut);
		exit;
	}
	
	
	
}
//echo "="  . $file . "=<P>";
$command = escapeshellcmd('sudo python play.py  "' . $file . '"' );
//echo $command . "<BR>";
if($file!="" && !$blob && !$mode) {
	passthru($command);
	//exec($command, $out, $status);
} 

if($blob && $file  && !$mode) {
	file_put_contents("audio/Custom/" . $file, $blob);
	echo '{"message":"uploaded"}';
} else {
	echo '{"message":"done"}';
}