$(document).ready(function() { 


  // Text Rotator
  $('.rotate').each(function(){
    var el = $(this);
    var text = $(this).html().split(",");
    el.html(text[0]);
    setInterval(function() {
      el.animate({
              textShadowBlur:20,
              opacity: 0
            }, 500 , function() {
              index = $.inArray(el.html(), text)
              if((index + 1) == text.length) index = -1
              el.text(text[index + 1]).animate({
                textShadowBlur:0,
                opacity: 1
              }, 500 );
            });
    }, 2000);
  });



});