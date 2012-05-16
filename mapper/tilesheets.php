<?php

function scanFileNameRecursivly($path = '', &$name = array() )
/**
 * This function will scan all files recursively in the sub-folder and folder.
 *
 * @author Fazle Elahee
 *
 * Modified by Jonathan Commins to only return paths to tilesheets.
 * 
 */
{
  $path = $path == ''? dirname(__FILE__) : $path;
  $lists = @scandir($path);
  
  if(!empty($lists))
  {
      foreach($lists as $f)
      { 
    
      if(is_dir($path.DIRECTORY_SEPARATOR.$f) && $f != ".." && $f != ".")
      {
          scanFileNameRecursivly($path.DIRECTORY_SEPARATOR.$f, &$name); 
      }
      else
      {
          if($f=='tilesheet.png') $name[] = $path.DIRECTORY_SEPARATOR.$f;
      }
      }
  }
  return $name;
}

$path = "maps"; // dir to scan for tilesheets
$tilesheets = scanFileNameRecursivly($path);

echo "<pre>";
var_dump($tilesheets);
echo "</pre>";

//for($)
?>