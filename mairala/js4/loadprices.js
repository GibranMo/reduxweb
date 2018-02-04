$( document ).ready(function() {

	$.ajax({
		url : 'getprices.php',
		type : 'GET',
		success : function(data) {
			if (data == "success")  {
				var obj1 = data[0];
				console.log('? ' + obj1.pr-1);
			}

		}

	});

});