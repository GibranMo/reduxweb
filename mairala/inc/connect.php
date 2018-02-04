<?php

	// connect to local database
	
	$dbhost = 'localhost';
	$dbuser = 'root';
	$dbpass = '';
	$mydb = 'reduxtest';

	

	$conn = new mysqli($dbhost, $dbuser, $dbpass, $mydb);

	
	if ($conn->connect_errno)
  	{
  		  echo "Failed to connect to MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error;
  	}


?>