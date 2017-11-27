<?php
require_once('vendor/autoload.php');

$stripe = array(
  "secret_key"      => "sk_live_sUcYx7TOchosUqtY0ARBAgUh",
  "publishable_key" => "pk_live_SjaqsqALvQt5JEbnM3B56XK6"

);

\Stripe\Stripe::setApiKey($stripe['secret_key']);
?>