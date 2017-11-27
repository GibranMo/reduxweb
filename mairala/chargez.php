<?php
  require_once('./con/config.php');
  require 'inc/connect.php';
  date_default_timezone_set('America/Los_Angeles');

  $token  = $_POST['stripeToken'];
  $totalChargeAmount = $_POST['amount'];
  $email = $_POST['email'];
  $zipcode = $_POST['zip'];
  $date = date('Y-m-d');
  $ts = new DateTime();
  $ts2 = $ts->getTimestamp();
  $ts3 = date("Y-m-d H:i:s");

  if (array_key_exists('products_sold', $_POST)) {
    $prodListArray = $_POST['products_sold'];
  }
  else 
    die ("* Error: no products founds");
  
  if ( array_key_exists('gifts', $_POST) ) {
    $giftListArray =  $_POST['gifts'];
 
  }
    /* Calculate total num of prods sold */
 
  $totalQuantity = 0;
  foreach ($prodListArray as $prod) {
    if (isset($prod['qty'])) {
      $totalQuantity += $prod['qty'];
    }
  }
  $totalNumProdsSol = $totalQuantity;
   


  $customer = \Stripe\Customer::create(array(
      'email' => $email,
      'source'  => $token
  ));
  
  $charge = \Stripe\Charge::create(array(
      'customer' => $customer->id,
      'amount'   => $totalChargeAmount,
      'currency' => 'usd'
  ));

 
  $totalChargeAmount = $totalChargeAmount /100; /* Conversion for internal data use */

  


  if (isset($giftListArray)) {
    array_push($prodListArray, $giftListArray);
  

    
    $hasGift = true;
    $numOfGiftsSold = count($giftListArray);
  }
  else {
    $hasGift = false;
 
  }
  print "hasGift: ".$hasGift."\n";
  if ($hasGift) {
    //print 

  }
  $chargedccustomer_data = array('stripe_custid' => $customer->id, 'customerEmail' => $email,
            'chargeAmount' => $totalChargeAmount, 'zipcode' => $zipcode);

  
  $online_order_data = array($prodListArray, $chargedccustomer_data);

   /*******************************/

   
/* Look up email to check whether it's an existing customer */
  
if ($lookupEmail_sql = $conn->prepare("SELECT cid, firstname, lastname FROM Customers WHERE email=?") ){ 
    $lookupEmail_sql->bind_param("s", $email);
    $lookupEmail_sql->execute();
    $result = $lookupEmail_sql->get_result();

    if ($result->num_rows > 0 ) { /* Found the Customer in the database and no Gifts ordered */
                $row = $result->fetch_assoc();
                $id = $row['cid'];
                $firstname = $row['firstname'];
                $lastname = $row['lastname'];
               
                /* INSERT into Online Orders table */
                $array = insert_OnlineOrders ($customer->id, $id, $date, $totalNumProdsSol, $hasGift, $zipcode, $totalChargeAmount, $email, $ts3, $conn );                
                $code = $array['confirmcode'];
                /*
                  UPDATE existing customer stripe_cust id value with newly sumbitted checkout info.
                */
                
                $stmt_update_customer_stripeid_sql = $conn->prepare("UPDATE Customers SET stripe_custid=? WHERE email=?");
                $stmt_update_customer_stripeid_sql->bind_param("ss", $customer->id, $email);
                $stmt_update_customer_stripeid_sql->execute();
                if($stmt_update_customer_stripeid_sql->errno)
                  echo "FAILURE!!! ".$stmt_update_customer_stripeid_sql->error;
                else echo "UPDATEd {$stmt_update_customer_stripeid_sql->affected_rows} rows";

                $stmt_update_customer_stripeid_sql->close();
                /* Retrive  online order id of newly inserted online order */
                $online_orderid_sql = "SELECT oo_id FROM Online_Orders WHERE cust_id = '$id' ORDER By oo_id DESC LIMIT 1";
                $Online_OrderResult  = $conn->query( $online_orderid_sql);
                $Online_OrderResultRow = $Online_OrderResult->fetch_assoc();
                $newOrderID = $Online_OrderResultRow['oo_id'];
                echo "orderID: ".$newOrderID;
                echo "\n";
                          
                          
                          
      }
      else { /* It's a new customer */
        
        /* Business Decison: only create an entry into the Online_Orders table. This new Customer can then be later 
            identified/validated when he comes in with the email and zipcode provided at checkout.
        */
        $array1 = insert_OnlineOrders( $customer->id, "", $date, $totalNumProdsSol, $hasGift, $zipcode, $totalChargeAmount, $email, $ts3, $conn );
         $code = $array1['confirmcode'];
        $newOrderID = $array1['newid'];
       
      }

      $packageType = 0;
                          foreach ($prodListArray as $q) {
                              $ctr = $q['qty'];
                              $ppid = $q['productTypeId'];
                              $isgift = $q['isgift'];
                              $giftID =  $q['giftid'];
                              if ($ppid == 2) {
                                $packageType = 1;
                              }
                              else if ($ppid == 6)
                                $packageType = 1000;
                              else
                                $packageType = $q['productTypeId'];
                              
                              for ($i = 0; $i< $ctr; $i++) {
                                if (!$isgift) {
                                   
                                    update_customer_Packages($id, $customer->id, $firstname, $lastname, $packageType, $packageType, $date, $newOrderID, $q['productTypeId'], $conn);
                                   
                                }                              
                             
                            }       
                          }

                          if ($hasGift) {
                            foreach ($giftListArray as $g) {
                              $giftIDx = $g['prod'];
                              $giftFirstName = $g['recipientFirstName'];
                              $giftLastName = $g['recipientLastName'];
                              $giftToEmail = $g['recipientEmail'];
                              $fromName = $g['from'];
                              $giftMessage = strip_tags($g['msge']);
                              $giftMessage = $conn->real_escape_string($giftMessage);
                              $giftProd = $g['prod'];
                            
                             
                              if( $giftIDx == 2)
                                $packageType = 1;
                              else if ( $giftIDx == 6)
                                $packageType = 1000;
                              else
                                $packageType =  $giftIDx;
                             

                              $checkEmail = checkCustomerExists($giftToEmail, $conn);
                             
                              if ( $checkEmail == -1) { /* Recipient of Gift Email is for a new customer */
                              
                                /* Create a new Customer Profile */
                                $newCustID = insert_into_Customers( $giftToEmail, $giftFirstName, $giftLastName, $date, false, $conn); 
                                $newPackID = insert_into_PackagesGift($newCustID, $giftFirstName, $giftLastName, $packageType, $packageType, $date, $newOrderID, $giftIDx, $conn);
                              }
                              else { 
                             
                               
                                $newPackID = update_customer_Packages2($checkEmail, $packageType, $packageType, $date, $newOrderID, $giftIDx, $conn );
                              }

                             
                            
                              insert_into_Gifts($newOrderID, $fromName, $giftToEmail, $newPackID, $date, $giftMessage, $conn );
                            }
                          }

                        if (isset($firstname))
                          $buyerName = $firstname;
                        else
                          $buyerName = "";
                        
                        $giftList = array();

                        if (isset($giftListArray) )
                          $giftList = $giftListArray;
                       
                        delegeateEmails ($chargedccustomer_data, $buyerName, $code, $prodListArray, $giftList);
  }


    function checkCustomerExists ($email, $connObj) {
      echo "checkCustomerExists()"."\n";
      $sql = "SELECT cid FROM Customers WHERE email=?";
      $stmt = $connObj->prepare($sql);
      $stmt->bind_param("s", $email);
      $stmt->execute();
      if($stmt->errno)
        echo "FAILURE!!! ".$stmt->error;
      else 
        echo "Inserted(?) {$stmt->affected_rows} rows";
      echo "\n";
      $result = $stmt->get_result();
    
      if ($result->num_rows == 1 ) { /* Found the Customer in the database and no Gifts ordered */
            $row = $result->fetch_assoc();
            $customerID = $row['cid'];

            return $customerID;
      }
      
      return -1;
    }

    function insert_into_Customers( $recEmail, $giftFirst, $giftLast, $date, $isRaiders, $connObj) {
     
      $giftFirst = strtolower($giftFirst);
      $giftLast = strtolower($giftLast);
      $recEmail = strtolower($recEmail);
      $sql = "INSERT INTO Customers ( email, firstname, lastname, dateadded, preferredFirstName, preferredLastName, isRaiders) values ( ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $connObj->prepare( $sql );
      $stmt->bind_param("ssssssi", $recEmail, $giftFirst, $giftLast, $date, $giftFirst, $giftLast, $isRaiders );
      $stmt->execute();
      if($stmt->errno)
        echo "FAILURE!!! ".$stmt->error;
      else 
        echo "Inserted(?) {$stmt->affected_rows} rows";
      echo "\n";
      $newID = $stmt->insert_id;

      $stmt->close();
      return $newID;
    }
    function insert_into_Gifts($oo_id, $fromName, $recipient_email, $pid, $date, $message, $connObj) {
      $fromName = strtolower($fromName);
      $recipient_email = strtolower($recipient_email);
      $sql = "INSERT INTO Gifts (oo_id, from_name, recipient_email, pid, datepurchased, message) values (?, ?, ?, ?, ?, ?)";
      $stmt = $connObj->prepare( $sql );
      $stmt->bind_param("ississ", $oo_id, $fromName, $recipient_email, $pid, $date, $message );
      $stmt->execute();
      if($stmt->errno)
        echo "FAILURE!!! ".$stmt->error;
      else 
        echo "Inserted(?) {$stmt->affected_rows} rows";
      $newID = $stmt->insert_id;
      $stmt->close();
      return $newID;
    }
    function insert_into_PackagesGift( $customerid, $firstname, $lastname, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID, $connObj) {
        $firstname = strtolower($firstname);
        $lastname = strtolower($lastname);
        $sql = "INSERT INTO Packages (cid, firstname, lastname, packageType, sessionsleft, datepurchased,
                oo_id, prod_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        echo "insert_into_PackagesGift"."\n";
        $stmt_insert_into_Packages_sql = $connObj->prepare( $sql );

   
        $stmt_insert_into_Packages_sql->bind_param("issiisii", $customerid, $firstname, $lastname, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID);
        
        $stmt_insert_into_Packages_sql->execute();
        $newID = $stmt_insert_into_Packages_sql->insert_id;
        $stmt_insert_into_Packages_sql->close();

        return $newID;
    }
    function update_customer_Packages($customerid, $stripe_custid, $firstname, $lastname, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID, $connObj) {
         echo "updateCustomerPackages()"."\n";
        $firstname = strtolower($firstname);
        $lastname = strtolower($lastname);
        $sql="";
        if (empty($customerid)) {
          $sql = "INSERT INTO Packages (stripe_custid, packageType, sessionsleft, datepurchased,
                oo_id, prod_id) VALUES (?, ?, ?, ?, ?, ?)";
          echo "1"."\n";
        }
        else {
          $sql = "INSERT INTO Packages (cid, stripe_custid, firstname, lastname, packageType, sessionsleft, datepurchased,
                oo_id, prod_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
          echo "2"."\n";
        }
        $stmt_insert_into_Packages_sql = $connObj->prepare( $sql );

        if (empty($customerid)) {
          $stmt_insert_into_Packages_sql->bind_param("siisii", $stripe_custid, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID);
        }
        else
          $stmt_insert_into_Packages_sql->bind_param("isssiisii", $customerid, $stripe_custid, $firstname, $lastname, $packagetype, $sessionsleft,
           $datepurchased, $onlineOrderId, $prodID);
        

        $stmt_insert_into_Packages_sql->execute();
        $newID = $stmt_insert_into_Packages_sql->insert_id;
        $stmt_insert_into_Packages_sql->close();

        return $newID;
    }

    function update_customer_Packages2($customerid, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID, $connObj) {
       echo "updateCustomerPackages2()"."\n";
      $sql = "INSERT INTO Packages (cid, packageType, sessionsleft, datepurchased, oo_id, prod_id) VALUES (?, ?, ?, ?, ?, ?)";
      $stmt = $connObj->prepare( $sql );
      $stmt->bind_param("iiisii", $customerid, $packagetype, $sessionsleft, $datepurchased, $onlineOrderId, $prodID);
      $stmt->execute();
       if($stmt->errno)
        echo "FAILURE!!! ".$stmt->error;
      else 
        echo "Inserted(?) {$stmt->affected_rows} rows";
      $newID = $stmt->insert_id;
      $stmt->close();
      return $newID;
    }
    
    function insert_OnlineOrders ($stripe_custid, $cid, $date, $totalNumProdsSol, $hasGift, $zipcode, $totalChargeAmount, $email, $ts3, $connObj) {
      $sql = "";
      $confirmCode = randomKey(6);
      echo "confirm code: ".$confirmCode."\n";
      if (empty($cid))  {
        $sql = "INSERT INTO Online_Orders (confirmCode, stripe_custid, purchase_date, numOfProds, includes_gift, zipcode, chargeAmount, email, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ";
      }
      else {
        $sql = "INSERT INTO Online_Orders (confirmCode, stripe_custid, cust_id, purchase_date, numOfProds, includes_gift,
                zipcode, chargeAmount, email, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
      }
      $stmt_insert_into_OnlineOrders_sql = $connObj->prepare( $sql );

      if (empty($cid)) {
        $stmt_insert_into_OnlineOrders_sql->bind_param("sssiiiiss",  $confirmCode, $stripe_custid, $date, $totalNumProdsSol, $hasGift, $zipcode, $totalChargeAmount, 
            $email, $ts3);
      } else {
        $stmt_insert_into_OnlineOrders_sql->bind_param("ssisiiiiss",  $confirmCode, $stripe_custid, $cid, $date, $totalNumProdsSol, $hasGift, $zipcode, $totalChargeAmount, 
            $email, $ts3);
      }
      
        $stmt_insert_into_OnlineOrders_sql->execute();
        $newid = $stmt_insert_into_OnlineOrders_sql->insert_id;
        $stmt_insert_into_OnlineOrders_sql->close();
        
        $arr = array('newid' => $newid, 'confirmcode' => $confirmCode);
        return $arr;
    }

    function delegeateEmails($chargedccustomer_data, $buyerName, $code, $prodListArray, $giftList ) {
      $containsGift = false;
      $containsNonGift = false;
      $containsMix = false;
      $messageProvided = false;
      $prod = "";
      
                        echo "\n";
      foreach ($prodListArray as $q) {        
          if (isset( $q["isgift"] ) ) {
              if ($q["isgift"])
                $containsGift = true;
              else
                $containsNonGift = true;
          }  
      }
      $ctr = 0;
      foreach ($giftList as $key) { 
        echo "ctr: ".$ctr;
          if (isset( $key["msge"] ) ) {
            if (!empty($key["msge"])) {
                $messageProvided = true;
                echo " msg: ".$key["msge"]."\n";
            }
            else
              " no message \n";
          }
          $ctr++;
    }
    
    
    if ($containsGift && $containsNonGift)
      $containsMix = true;
    
   
    sendEmailToBuyer($chargedccustomer_data['customerEmail'], $buyerName, $code, $prodListArray, $messageProvided, $containsGift, $containsNonGift );

    foreach ($giftList as $gift) {
      if (isset($gift['recipientEmail']))
        $giftToEmail = $gift['recipientEmail'];
      if (isset($gift['recipientFirstName']))
        $firstN = $gift['recipientFirstName'];
      if (isset($gift['msge']) ) {
        if (empty($gift['msge']))
          $message = "";
        else
          $message = $gift['msge'];
      }
      if (isset($gift['gId']) ) {
           $prodDes = getGiftDescr($giftList, $prodListArray, $gift['gId']);
      }
       if (isset($gift['from']) ) 
          $fromFullName = $gift['from'];
          
        sendGiftEmail($giftToEmail, $firstN, $fromFullName, $code, $message, $prodDes);
    }
  }

  function getGiftDescr($giftList, $prodListArray, $giftID) {

    foreach($prodListArray as $prod) {
      if (isset($prod['giftid']))
        if ($prod['giftid'] == $giftID) {
          return $prod['textdes'];
        }
    }

  }

  function sendGiftEmail($email, $firstname, $fromFullName, $code, $message, $prod) {



  $to = $email;
  $subject = $fromFullName." has sent you a gift";

  $firstHalfMessage ='<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>REDUX Order Notification</title>
            <style type="text/css"> 

            a {
  color: #4A72AF;
}

body, #header h1, #header h2, p {
  margin: 0;
  padding: 0;
}

#main {
  border: 1px solid #cfcece;
}

img {
  display: block;
}

#top-message p, #bottom-message p {
  color: #3f4042;
  font-size: 12px;
  font-family: Arial, Helvetica, sans-serif;
}

#header h1 {
  color: #ffffff !important;
  font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
  font-size: 24px;
  margin-bottom: 0!important;
  padding-bottom: 0;
}

#header h2 {
  color: #ffffff !important;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 24px;
  margin-bottom: 0 !important;
  padding-bottom: 0;
}

#header p {
  color: #ffffff !important;
  font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
  font-size: 12px;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0 0 0.8em 0;
}


h3 {
  font-size: 28px;
  color: #ffffff !important;
  font-family: Arial, Helvetica, sans-serif;
}

h4 {
  font-size: 22px;
  color: #4A72AF !important;
  font-family: Arial, Helvetica, sans-serif;
}

h5 {
  font-size: 18px;
  color: #444444 !important;
  font-family: Arial, Helvetica, sans-serif;
}
h6 {
  font-size: 28px;
  color: #ffffff !important;
  font-family: Arial, Helvetica, sans-serif;
}

p {
  font-size: 12px;
  color: #444444 !important;
  font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
  line-height: 1.5;
}
             </style>
        </head>
        <body>
            <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#7D7D7D">
                <tr>
                    <td>
                        <table id="top-message" cellpadding="20" cellspacing="0" width="600" align="center">
                            <tr>
                                <td align="center">
      
                                </td>
                            </tr>
                        </table>
                        <!-- top message -->
                        <table id="main" width="600" align="center" cellpadding="0" cellspacing="15" bgcolor="ffffff">
                            <tr>
                                <td>
                                    <table id="header" cellpadding="10" cellspacing="0" align="center" bgcolor="8fb3e9">
                                        <tr>
                                            <td width="570" bgcolor="#525252">
                                                 <a href="http://reduxcryotherapy.com"><img src="http://reduxcryotherapy.com/reduxcirc.png" width="170" /></a>

                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="570" bgcolor="black">
                                            
                                            </td>
                                        </tr>
                                        <!-- 
                                        <tr>
                                            <td width="570" align="right" bgcolor="#333333">
                                                <p>July 2010</p>
                                            </td>
                                        </tr>-->
                                    </table>
                                    <!-- header -Session Pack->
                                </td>
                            </tr>
                            <!-- header -->
                            <tr>
                                <td>
                                    <h2 style="font-family: Arial, Helvetica, sans-serif; font-style: bold; color: #525252">Hello, '.$firstname.'!</h2>
                                    <p style="font-size: 1.1em">Exciting news! '.$fromFullName.' has gifted you a '.$prod.' at REDUX Cryotherapy.</p>              
                                </td>
                            </tr>
                            <tr>
                                <td>';
                                if (!empty($message))  {
                                  
                                  $firstHalfMessage.= '<p style="font-family: monospace, sans-serif; font-size: 1.0em">"'.$message.'"</p>
                                        <p style="font-family: monospace, sans-serif; font-size: 1.0em">- '.$fromFullName.'</p>';
                                 }
                                 else
                                  echo "FUC ME!";
                                  echo "\n";
                                 $firstHalfMessage.='
                                    <table id="content-1" cellpadding="0" cellspacing="0" align="center">
                                        <tr>
                                          
                                        </tr>
                                    </table>
                                    <!-- content 1 -->
                                </td>
                            </tr>
                            <!-- content 1 -->
                            <tr>
                                <td>
                                    <table id="content-2" cellpadding="0" cellspacing="0" align="center">
                                        <tr>
                                            <td width="570">

                                                <p style="font-size: 1.1em;">Present confirmation code <b>'.$code.'</b> to claim your gift.</p>
                                                
                                                  <!-- <p style="font-size: 1.0em;">Present this code at the front desk when arriving.</p> -->
                                                
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- content-2 -->
                                </td>
                            </tr>
                            <!-- content-2 -->


                            <!-- content-3 -->

                            <!-- content-4 -->
                            <tr>
                                <td height="30">
                                    <img src="http://dummyimage.com/570x30/fff/fff" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table id="content-5" cellpadding="0" cellspacing="0" align="center">
                                        <tr>
                                            <td width="267" valign="top">
                                                <table cellpadding="5" cellspacing="0" bgcolor="d0d0d0">
                                                    <tr>
                                                        <td>
                                                            <a href="http://reduxcryotherapy.com"><img width="230" height="170" src="http://reduxcryotherapy.com/image1.JPG" /></a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="15"></td>
                                            <td width="278" valign="top">
                                                
                                                <p style="font-size: 1.1em;">Should you have any questions about our services or your treatment package, feel free to call us at 510-263-0253 or email us at info@reduxcryotherapy.com.</p>
                                                <br>
                                                <p style="font-size: 1.1em;">No appointment necessary.</p>
                                                <br>

                                                <p style="font-size: 1.1em;">Hope to see you soon!</p>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- content-5 -->
                                </td>
                            </tr>
                            <!-- content-5 -->
                            <tr>
                                <td height="30">
                                    <img src="http://dummyimage.com/570x30/fff/fff" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table id="content-6" cellpadding="0" cellspacing="0" align="center">
                                        <address>
                                            <p align="center">2416-A Central Ave. </p>
                                            <p align="center">Ste D </p>
                                            <p align="center">Alameda, CA 94501</p>
                                        </address>

                                        
                                        <p  align="center">
                                            <a tyle="font-size: 1.4em;" href="http://reduxcryotherapy.com">www.reduxcryotherapy.com</a>
                                        </p>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!-- main -->
                        <table id="bottom-message" cellpadding="20" cellspacing="0" width="600" align="center">
                            <tr>
                                <td align="center">
                                    
                                    <p>
                                        
                                       
                                    </p>
                                </td>
                            </tr>
                        </table>
                        <!-- top message -->
                    </td>
                </tr>
            </table>
            <!-- wrapper -->
        </body>
    </html>';

        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

        // More headers
        $headers .= 'From: REDUX Cryo <service@reduxcryotherapy.com>' . "\r\n";
        $headers .='Reply-To: <info@reduxcryotherapy.com>';


  mail($to,$subject,$firstHalfMessage,$headers);
}



  function sendEmailToBuyer($buyerEmail, $buyerName, $code, $prodList, $messageProvided, $boughtGift, $boughtNonGift) {
      $subject = "Your Order Summary";
      $to = $buyerEmail;
      

      $message =             $message = '<!DOCTYPE HTML>
          <html>
              <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                      <title>Nettuts Email Newsletter</title>
                      <style type="text/css"> 

                      a {
            color: #4A72AF;
          }

          body, #header h1, #header h2, p {
            margin: 0;
            padding: 0;
          }

          #main {
            border: 1px solid #cfcece;
          }

          img {
            display: block;
          }

          #top-message p, #bottom-message p {
            color: #3f4042;
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
          }

          #header h1 {
            color: #ffffff !important;
            font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
            font-size: 24px;
            margin-bottom: 0!important;
            padding-bottom: 0;
          }

          #header h2 {
            color: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 24px;
            margin-bottom: 0 !important;
            padding-bottom: 0;
          }

          #header p {
            color: #ffffff !important;
            font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
            font-size: 12px;
          }

          h1, h2, h3, h4, h5, h6 {
            margin: 0 0 0.8em 0;
          }


          h3 {
            font-size: 28px;
            color: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif;
          }

          h4 {
            font-size: 22px;
            color: #4A72AF !important;
            font-family: Arial, Helvetica, sans-serif;
          }

          h5 {
            font-size: 18px;
            color: #444444 !important;
            font-family: Arial, Helvetica, sans-serif;
          }
          h6 {
            font-size: 28px;
            color: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif;
          }

          p {
            font-size: 12px;
            color: #444444 !important;
            font-family: "Lucida Grande", "Lucida Sans", "Lucida Sans Unicode", sans-serif;
            line-height: 1.5;
          }
                  table.formatHTML5 {
                      width: 100%;
                      border-collapse:collapse;
                      text-align:left;
                      color: #606060;
                      font-family: monospace, sans-serif;
                  }
                   table.formatHTML5 thead tr td  {
                      font-size:0.95em;
                      
                  }
                  table#content  {
                    width: 75%;
                  }
                       </style>
                  </head>
                  <body>
                      <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#7D7D7D">
                          <tr>
                              <td>
                                  <table id="top-message" cellpadding="20" cellspacing="0" width="600" align="center">
                                      <tr>
                                          <td align="center">
                
                                          </td>
                                      </tr>
                                  </table>
                                  <!-- top message -->
                                  <table id="main" width="600" align="center" cellpadding="0" cellspacing="15" bgcolor="ffffff">
                                      <tr>
                                          <td>
                                              <table id="header" cellpadding="10" cellspacing="0" align="center" bgcolor="8fb3e9">
                                                  <tr>
                                                      <td width="570" bgcolor="#525252">
                                                           <a href="http://reduxcryotherapy.com"><img src="http://reduxcryotherapy.com/reduxcirc.png" width="170" /></a>

                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td width="570" bgcolor="black">
                                                      
                                                      </td>
                                                  </tr>
                                                  <!-- 
                                                  <tr>
                                                      <td width="570" align="right" bgcolor="#333333">
                                                          <p>July 2010</p>
                                                      </td>
                                                  </tr>-->
                                              </table>
                                              <!-- header -->
                                          </td>
                                      </tr>
                                      <!-- header -->
                                      <tr>
                                          <td>';
                                            
                                              if (!empty($buyerName))
                                                $message.='<h2 style="font-family: Arial, Helvetica, sans-serif; font-style: bold; color: #525252">Thanks for your order, '.$buyerName.'!</h2>';
                                              else
                                                $message.='<h2 style="font-family: Arial, Helvetica, sans-serif; font-style: bold; color: #525252">Thanks for your order!</h2>';

                                            
                                            
                                              if ($boughtNonGift)
                                                $message.='<p style="font-size: 1.1em; font-family: Arial, Helvetica, sans-serif;">You\'re on your way to revitilzation!</p>';
                                             
                                          $message.='</td>
                                      </tr>
                                      <tr>
                                          <td>
                                              <table id="content"  align="center">
                                                  <tr>
                                                      <td width="170" valign="top">
                                                          <table id="myTable" class="formatHTML5">
                                                            <thead>
                                                             <tr><td colspan=2></td></tr>
                                                                <tr>
                                                                    <th>Product</th><th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>';
                                                              
                                                              $giftCount = 0;
                                                              $mult = 0;
                                                              $runningToal = 0;
                                                              foreach($prodList as $q) {
                                                                $prod = $q["textdes"];
                                                                $quant = $q["qty"];
                                                                $amt = $q["productprice"];
                                                                $amt = substr($amt, 1);
                                                                $mult = $quant * $amt;
                                                                                                                             
                                                                if ($q["isgift"])
                                                                    $giftCount++;
                                                                $mult = number_format((float)$mult, 2, '.', '');
                                                                if ($quant > 1)
                                                                  $prod .= ' ('.$quant.')'; 
                                                                $runningToal += $mult;

                                                                $message.='<tr>';
                                                                $message.='<td>'.$prod.'</td>';
                                                                $message.='<td>$'.$mult.'</td>';
                                                                $message.='</tr>'; 
                                                            }
                                                            $runningToal = number_format((float)$runningToal, 2, '.', '');
                                                          
                                                             $message.= '<tr>
                                                                <td>
                                                                  <b>Total:</b>
                                                                </td>
                                                                <td>
                                                                  <b>$'.$runningToal.'</b>
                                                                </td>
                                                              </tr> 
                                                             
                                                            </tbody>
                                                          </table>
                                                      </td>
                                                      
                                                     
                                                  </tr>
                                              </table>
                                              <!-- content 1 -->
                                          </td>
                                      </tr>
                                      <!-- content 1 -->
                                      <tr>
                                          <td>
                                              <table id="content-2" cellpadding="0" cellspacing="0" align="center">
                                                  <tr>
                                                      <td width="570">
                                                        
                                                        
                                                            <p style="font-size: 1.1em;">Your order confirmation is: <b>'.$code.'</b></p>';
                                                            
                                                            if ($giftCount > 0) {
                                                              $recipients = 'recipient has';
                                                              if ($giftCount > 1) {
                                                                $recipients = 'recipients have';
                                                              }
                                                              if ($messageProvided)
                                                                $notify = 'Your gift '.$recipients.' been sent an email with your message';
                                                              else 
                                                                $notify = 'Your gift '.$recipients.' been sent an email';
                                                              
                                                            $message.='<br>
                                                            <p style="font-size: 1.1em;">'.$notify.'.</p>';
                                                            } 
                                                        
                                                          
                                                      $message.='</td>
                                                  
                                                  </tr>
                                              </table>
                                              <!-- content-2 -->
                                          </td>
                                      </tr>
                                      <!-- content-2 -->


                                      <!-- content-3 -->

                                      <!-- content-4 -->
                                      <tr>
                                          <td height="30">
                                              <img src="http://dummyimage.com/570x30/fff/fff" />
                                          </td>
                                      </tr>
                                      <tr>
                                          <td>
                                              <table id="content-5" cellpadding="0" cellspacing="0" align="center">
                                                  <tr>
                                                      <td width="267" valign="top">
                                                          <table cellpadding="5" cellspacing="0" bgcolor="d0d0d0">
                                                              <tr>
                                                                  <td>
                                                                      <a href="http://reduxcryotherapy.com"><img width="230" height="170" src="http://reduxcryotherapy.com/image1.JPG" /></a>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                      <td width="15"></td>
                                                      <td width="278" valign="top">
                                                          
                                                          <p style="font-size: 1.1em;">Should you have any questions about our services or your treatment package, feel free to call us at 510-263-0253 or email us at info@reduxcryotherapy.com</p>
                                                          <br><br>
                                                          <p style="font-size: 1.1em;">Hope to see you soon!</p>
                                                      </td>
                                                  </tr>
                                              </table>
                                              <!-- content-5 -->
                                          </td>
                                      </tr>
                                      <!-- content-5 -->
                                      <tr>
                                          <td height="30">
                                              <img src="http://dummyimage.com/570x30/fff/fff" />
                                          </td>
                                      </tr>
                                      <tr>
                                          <td>
                                              <table id="content-6" cellpadding="0" cellspacing="0" align="center">
                                                  <address>
                                                      <p align="center">2416-A Central Ave. </p>
                                                      <p align="center">Ste D </p>
                                                      <p align="center">Alameda, CA 94501</p>
                                                  </address>

                                                  
                                                  <p align="center">
                                                      <a href="http://reduxcryotherapy.com">www.reduxcryotherapy.com</a>
                                                  </p>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                                  <!-- main -->
                                  <table id="bottom-message" cellpadding="20" cellspacing="0" width="600" align="center">
                                      <tr>
                                          <td align="center">
                                              
                                              <p>
                                                  
                                                  <a href="#">View in Browser</a>
                                              </p>
                                          </td>
                                      </tr>
                                  </table>
                                  <!-- top message -->
                              </td>
                          </tr>
                      </table>
                      <!-- wrapper -->
                  </body>
              </html>';


        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

        // More headers
        $headers .= 'From: REDUX Cryo <service@reduxcryotherapy.com>' . "\r\n";
        $headers .='Reply-To: <info@reduxcryotherapy.com>';
        mail($to, $subject, $message, $headers);
  }

    function randomKey($length) {
      $pool = array_merge(range(0,9), range('a', 'z'),range('A', 'Z'));

      for($i=0; $i < $length; $i++) {
          $key .= $pool[mt_rand(0, count($pool) - 1)];
      }
      return $key;
    }

?>
