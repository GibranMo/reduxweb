function isScrolledIntoView(e){var t=$(window).scrollTop(),i=t+$(window).height(),n=$(e).offset().top,l=n+$(e).height();return l>=t&&n<=i&&l<=i&&n>=t}function foo(){setTimeout(foo,500),90!=width&&(width++,elem.style.width=width+"%")}function move(){setInterval(frame,400)}function moveAnx(){var e=setInterval(function(){90==width?clearInterval(e):(width++,elem.style.width=width+"%")},400),t=setInterval(function(){6==widthAnx?clearInterval(t):(widthAnx--,elemAnx.style.width=widthAnx+"%")},400),i=setInterval(function(){11==widthJoint?clearInterval(i):(widthJoint--,elemJoint.style.width=widthJoint+"%")},400),n=setInterval(function(){95==widthPerf?clearInterval(n):(widthPerf++,elemPerf.style.width=widthPerf+"%")},400),l=(setInterval(function(){15==widthMS?clearInterval(n):(widthMS--,elemMS.style.width=widthMS+"%")},400),setInterval(function(){90==widthRecovery?clearInterval(l):(widthRecovery++,elemRecovery.style.width=widthRecovery+"%")},400)),d=setInterval(function(){85==widthMetabolism?clearInterval(d):(widthMetabolism++,elemMetabolism.style.width=widthMetabolism+"%")},400),r=setInterval(function(){75==widthTight?clearInterval(r):(widthTight++,elemTight.style.width=widthTight+"%")},400),h=setInterval(function(){20==widthStretch?clearInterval(h):(widthStretch--,elemStretch.style.width=widthStretch+"%")},400)}var width=0,widthAnx=80,widthJoint=83,widthPerf=44,widthMS=87,widthRecovery=1,widthMetabolism=51,widthTight=30,widthStretch=84,elem=document.getElementById("myBar"),elemAnx=document.getElementById("myBarAnxiety"),elemJoint=document.getElementById("myBarJointPain"),elemPerf=document.getElementById("myBarPerformance"),elemMS=document.getElementById("myBarMuscleSoreness"),elemRecovery=document.getElementById("myBarRecovery"),elemMetabolism=document.getElementById("myBarMetabolism"),elemTight=document.getElementById("myBarTight"),elemStretch=document.getElementById("myBarStretch");$(window).scroll(function(){isScrolledIntoView($(".detect"))&&moveAnx()});