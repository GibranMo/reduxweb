<?php
/* File   : connect.php
  
*/

	// connect to local database
	
	$dbhost = 'localhost';
	$dbuser = 'root';
	$dbpass = '';
	$mydb = 'reduxtest';

	

	$conn = new mysqli($dbhost, $dbuser, $dbpass, $mydb);

	
	//a2plcpnl0443.prod.iad2.secureserver.net
	/*
		$dbhost = 'a2plcpnl0443.prod.iad2.secureserver.net';
	$dbuser = 'gibranmo';
	$dbpass = '5876leonardo';
	$mydb = 'reduxdb';

	*/
	
	/*
	ALTERNATE STYLE:
	$conn = mysqli_connect($dbhost, $dbuser, $dbpass, $mydb);
	*/
	
	if ($conn->connect_errno)
  	{
  		  echo "Failed to connect to MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error;
  	}


?>