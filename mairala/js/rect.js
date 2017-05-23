function move() {
  var elem = document.getElementById("myBar");   
  var widthBar = 0;
  var id = setInterval(frame, 50);
  function frame() {
    if (width == 80) {
      clearInterval(id);
    } else {
      width++; 
      elem.style.width = width + '%'; 
    }
  }
}