$(function(){var n=$("#navbtn"),a=$("#topnav nav");$(window).on("resize",function(){$(this).width()<570&&a.hasClass("keep-nav-closed")&&$("#topnav nav").hide().removeAttr("class"),n.is(":hidden")&&a.is(":hidden")&&$(window).width()>569&&$("#topnav nav").show().addClass("keep-nav-closed")}),$("#topnav nav a,#topnav h1 a,#btmnav nav a").on("click",function(n){n.preventDefault()}),$("#navbtn").on("click",function(n){n.preventDefault(),$("#topnav nav").slideToggle(350)})});