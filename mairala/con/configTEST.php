<?php
require_once('vendor/autoload.php');

$stripe = array(
  "secret_key"      => "sk_test_4Q2Wj3dC6PrGCPcnjbzHOfim",
  "publishable_key" => "pk_test_jnoYrq5CaWDmBeEYMFxBxwGN"
);

\Stripe\Stripe::setApiKey($stripe['secret_key']);
?>