<?php require_once("http://localhost:3333/JavaBridge/java/Java.inc");

$world = new java("PHPBridge");
echo $world->hello(array("World"));
?>
