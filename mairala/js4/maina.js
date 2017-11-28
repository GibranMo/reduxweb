/*
  maina.js - this is a beta version for testing the addition of a 'last name' field is Gift form
*/

jQuery(document).ready(function($){
       var giftFormSubmitted = false;
   var giftId = 0;
   var giftList = [];
   var dataProdOrderListId  = 0;
   var dataProdOrderList = [];
   var globalCT = -1;
   var cartWrapper = $('.cd-cart-container');
    

   var productId = 0;
 
   /* -- Global vars -  For Gift variables  -- */
   var globalToFirstName = "" ;
    var globalToLastName = "";
        var globalToEmail = "" ;
        var globalFromName = "" ;
        var globalProductId = "";
        var globalGiftMessage = "";
 
         /* -- Global vars - For All products   -- */
   var globalProdPrice = "" ;
 
   /* -- Build Product Database -- */
   // function Product(p_id, descr, pr_price, black_pic, whie_pic) {
   var prod1 = new Product (1, "First-Timer 1 Session", 40.00, "r1black.png", "r1white.png");
   var prod2 = new Product (2, "One Session", 29.00, "r1black.png", "r1white.png");
   var prod3 = new Product (3, "3-Session Pack", 150.00, "r3black.png", "r3white.png");
   var prod4 = new Product (5, "5-Session Pack", 225.00, "r5black.png", "r5white.png");
   var prod5 = new Product (10, "10-Session Pack", 400.00, "r10black.png", "r10white.png");
   var prod6 = new Product (1000, "Membership", 700.00, "rxblack.png", "rxwhite.png");
 

   var inventory = [
       prod1, prod2, prod3, prod4, prod5, prod6
   ];
 
   var ob =  inventory.find(x => x.getProdId() == 1 );
 
  
 
 
   if( cartWrapper.length > 0 ) {
       //store jQuery objects
       var cartBody = cartWrapper.find('.body')
       var cartList = cartBody.find('ul').eq(0);
       var cartTotal = cartWrapper.find('.checkout').find('span');
       var cartTrigger = cartWrapper.children('.cd-cart-trigger');
       var cartCount = cartTrigger.children('.count')
       var addToCartBtn = $('.cd-add-to-cart');
       var undo = cartWrapper.find('.undo');
       var checkOutBtn = $('#checkout-btn');

       var undoTimeoutId;
 
       var gbAddToCartBtn = $('.gb-add-to-cart');
        gbAddToCartBtn.on('click', function(event){
           event.preventDefault();
            if (Number(cartCount.find('li').eq(0).text() ) < 9 ) {
            
              addToCart($(this));

            }
            
       });
 
 
       //add product to cart
       addToCartBtn.on('click', function(event){
           event.preventDefault();
 
           addToCart($(this));
       });
 
       //open/close cart
       cartTrigger.on('click', function(event){
           event.preventDefault();
           toggleCart();
       });
 
       //close cart when clicking on the .cd-cart-container::before (bg layer)
       cartWrapper.on('click', function(event){
           if( $(event.target).is($(this)) ) toggleCart(true);
       });
 
       //delete an item from the cart
       cartList.on('click', '.delete-item', function(event){
       
           event.preventDefault();
           //var whatis = event.data('price');
          
           removeProduct($(event.target).parents('.product'));
 
       });
 
       //update item quantity
       cartList.on('change', 'select', function(event){
         
           quickUpdateCart();
       });
 
       //reinsert item deleted from the cart
       undo.on('click', 'a', function(event){
           clearInterval(undoTimeoutId);
           event.preventDefault();
           cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
               $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
               quickUpdateCart();
           });
           undo.removeClass('visible');
       });
   }
 
   function toggleCart(bool) {
       var cartIsOpen = ( typeof bool === 'undefined' ) ? cartWrapper.hasClass('cart-open') : bool;
 
       if( cartIsOpen ) {
           cartWrapper.removeClass('cart-open');
           //reset undo
           clearInterval(undoTimeoutId);
           undo.removeClass('visible');
           cartList.find('.deleted').remove();
 
           setTimeout(function(){
               cartBody.scrollTop(0);
               //check if cart empty to hide it
               if( Number(cartCount.find('li').eq(0).text()) == 0) cartWrapper.addClass('empty');
           }, 500);
       } else {
           cartWrapper.addClass('cart-open');
       }
   }
 
   function addToCart(trigger) {
       //globalProdPrice = trigger.data('price');
       globalProductId = trigger.data('ppid');
       if (Number(cartCount.find('li').eq(0).text() ) >= 9 )  {
      
        return;
       }

  
      
       var productid = globalProductId;
       var obj = inventory.find(x => x.getProdId() == productid );
       globalProdPrice = obj.getPrice(); //set a price in a global var so other functions get use the value.
 
 
 
 
       var prodImageFile = obj.getBlackPic();
 
       var prodPrice = obj.getPrice();
       var prodDescr = obj.getDescr();
 
       ///// For Info displayed in the "Added to Cart" Modal ****************//////
       $("#prod-added-image").attr("src", "img/reduxblack/" + prodImageFile);
       $('#text-descr-prod').text(prodDescr);
       $("#price-prod").text('$'+ prodPrice + ".00");
       /////********************************************************************/////
 
 
 
       var prodAddedImage = $("#prod-added-image");
       var obj = inventory.find(x => x.getProdId() == productid );
       var prodImageFile = obj.getBlackPic();
       
       prodAddedImage.attr("src", "img/reduxblack/" + prodImageFile);
 
 
       var cartIsEmpty = cartWrapper.hasClass('empty');
       //update number of items

      
       
       
       updateCartCount(cartIsEmpty);
       //update total price
       updateCartTotal(globalProdPrice, true);
 
       cartWrapper.removeClass('empty');
     
       //cartLimit = $(".cd-cart-container").find('li').eq(0).text();
   }
   /* This function takes care of creating all the DOM elements related to adding to shopping cart list cart list ...
               (including inserting <li> in DOM ) *except for Gifts*. Inserting DOM elements associated with gifts are done
               in a diffeent place
   */
   function addProduct(prodPrice, productid) {


       
 
       if ($('[data-prod="' + productid + '"]').length) { /* Increment the "Quantity" for an item already on the cart list*/
 
           var isg = $('[data-prod="' + productid + '"]').find('.product-details').data('isgift');
    
           if (isg == "0") { /* if its not a gift */
            
 
                   var currQtyVal = $("#prodListItem" + productid + " option:selected").val();
                   if (currQtyVal == 9)
                      return;
                  
                   currQtyVal++;
                   $('select[id="cd-product-' + productid + '"]').val(currQtyVal);
                   var again = $("#prodListItem" + productid + " option:selected").val();
                 
           }
           else {
             
                   var obj = inventory.find(x => x.getProdId() == productid );
                   var prodName = obj.getDescr();
                   var whiteProdImage = obj.getWhitePic();
                   whiteProdImage = "img/reduxwhite/" + whiteProdImage;
              
                   var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="0" data-giftId="0"><h3 class="textdes"><a href="#0">' + prodName +  '</a></h3><span class="price">$' + prodPrice + '.00</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-'+ productid +'">Qty</label><span class="select"><select id="cd-product-'+ productid +'" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
                   cartList.prepend(productAdded);
                   dataProdOrderListId++;
                 

 
           }
 
       }
       else { /*Add the item to the list because its not already there*/
   
           var obj = inventory.find(x => x.getProdId() == productid );
           var prodName = obj.getDescr();
           if ( productid == 1) {
               prodName = 'First Session';
           }
           var whiteProdImage = obj.getWhitePic();
           whiteProdImage = "img/reduxwhite/" + whiteProdImage;
  
           var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="0" data-giftId="0"><h3 class="textdes"><a href="#0">' + prodName + '</a></h3><span class="price">$' + prodPrice + '.00</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-'+ productid +'">Qty</label><span class="select"><select id="cd-product-'+ productid +'" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
           cartList.prepend(productAdded);
 
       }
 
   }
 
   function removeProduct(product) {
       
       clearInterval(undoTimeoutId);
 
       cartList.find('.deleted').remove();
       var topPosition = product.offset().top - cartBody.children('ul').offset().top ,
           productQuantity = Number(product.find('.quantity').find('select').val()),
           productTotPrice = Number(product.find('.price').text().replace('$', '')) * productQuantity;
 
       if (product.children(".product-details").data('isgift') == 1) {
      
        productQuantity = 1;
       
        productTotPrice = Number(product.find('.price').text().replace('$', ''));
       }
 
       product.css('top', topPosition+'px').addClass('deleted');
    
       //update items count + total price
       updateCartTotal(productTotPrice, false);
       updateCartCount(true, -productQuantity);

       cartList.find('.deleted').remove();
       if (product.find('.product-details').attr("data-isGift") == 1)
                deleteGiftFromList(product.find('.product-details').attr("data-giftId"));
       
 
   }
 
   function quickUpdateCart() {
       var quantity = 0;
       var price = 0;
      
       cartList.children('li:not(.deleted)').each(function(){
           
           var isGiftType = Number($(this).find('.product-details').data('isgift'));

           if (isGiftType == 1 ) {
               var singleQuantity = 1;
           }
           else {
                var singleQuantity = Number($(this).find('select').val());
           }
           quantity = quantity + singleQuantity;
           price = price + singleQuantity*Number($(this).find('.price').text().replace('$', ''));

       });
 
       cartTotal.text(price.toFixed(2));
       cartCount.find('li').eq(0).text(quantity);
       cartCount.find('li').eq(1).text(quantity+1);
   }
 
   function updateCartCount(emptyCart, quantity) {
    if (  Number(cartCount.find('li').eq(0).text()) >= 9)  {


    }

       if( typeof quantity === 'undefined' ) {
           var actual = Number(cartCount.find('li').eq(0).text()) + 1;
           var next = actual + 1;
 
           if( emptyCart ) {
               cartCount.find('li').eq(0).text(actual);
               cartCount.find('li').eq(1).text(next);
           } else {
               cartCount.addClass('update-count');
 
               setTimeout(function() {
                   cartCount.find('li').eq(0).text(actual);
               }, 150);
 
               setTimeout(function() {
                   cartCount.removeClass('update-count');
               }, 200);
 
               setTimeout(function() {
                   cartCount.find('li').eq(1).text(next);
               }, 230);
           }
       } else {
           var actual = Number(cartCount.find('li').eq(0).text()) + quantity;
           var next = actual + 1;
 
           cartCount.find('li').eq(0).text(actual);
           cartCount.find('li').eq(1).text(next);
       }

   }
 
   function updateCartTotal(price, bool) {
  
       bool ? cartTotal.text( (Number(cartTotal.text()) + Number(price)).toFixed(2) )  : cartTotal.text( (Number(cartTotal.text()) - Number(price)).toFixed(2) );

   }
 
   function deleteGiftFromList (gift_id) {
  
       for (var x = 0; x < giftList.length; x++) {
           if (giftList[x].gId == gift_id) {
   
 
 
               if (x == giftList.length - 1 ) {
                giftList.pop();
           
                break;
               }
               else {

                   var objTemp = giftList[x];
                   giftList[x] = giftList[giftList.length - 1];
                   giftList[giftList.length - 1] = objTemp;
                   giftList.pop();
                   break;
               }
 
 
           }
       }
 
   }
 
 
    $( "#target" ).submit( function( event ) {
        giftFormSubmitted = true;
        giftId++;

 
 
       event.preventDefault();
       $('#myModal').modal('toggle'); /* this closes the modal window after submitting Gift form */
 
 
       var recFirstName = $('#recipient-firstname').val();
       globalToFirstName = recFirstName;

       var recLastName = $('#recipient-lastname').val();
       globalToLastName = recLastName;
 
       var recEmail = $('#rec-email').val();
       globalToEmail = recEmail;
 
       var fromName = $('#from-name').val();
       globalFromName = fromName;
 
       var message = $('#message-text').val();
       globalGiftMessage = message;
 
       var productType = $("#hidden-prodId").val();
       globalProductId = productType;
 
       var giftObj = {recipientFirstName: recFirstName, recipientLastName: recLastName, recipientEmail: recEmail, from: fromName, msge: message, prod: productType,
           gId: giftId};
       giftList.push(giftObj);
 
   });
 
    var submittedForm = false;
   var handler = StripeCheckout.configure({

         key: 'pk_test_jnoYrq5CaWDmBeEYMFxBxwGN',
         image: 'https://www.reduxcryotherapy.com/xreduxwhitecopy.png',
         locale: 'auto',
         token: function(token) {
           submittedForm  = true;
           var ct = cartTotal.text();
 
            ct= ct.replace(/\./g,'');
            var amtNum = Number(ct);
          
           
            var orderObj = { stripeToken: token.id, amount: amtNum, zip: token.card.address_zip, email: token.email, products_sold: dataProdOrderList, gifts: giftList };
           
       
            $.post( "chargez.php", orderObj )
      
            .done(function( data ) {
     
          });
            
         }
          
   });
 
   document.getElementById('checkout-btn').addEventListener('click', function(e) {
 
       var cc = cartTotal.text();
 
       cc = cc.replace(/\./g,'')
       var amtNum = Number(cc);
       if (amtNum == 0)
           return;
       var checkoutDesc = "";

       if ( cartCount.find('li').eq(0).text() == 1 && (globalProductId == 1 || globalProductId == 2) )
           checkoutDesc = "One Cryo Session";
       else if (cartCount.find('li').eq(0).text() == 1 && globalProductId == 6)
            checkoutDesc = "REDUX Membership";
       else if ( cartCount.find('li').eq(0).text() == 1 &&  ( globalProductId > 2 && globalProductId < 6 )) {
           var prefix = "";      
           if (globalProductId == 3)
               prefix = "3";
           else if (globalProductId == 4)
               prefix = "5";
           else
               prefix = "10";
 
           checkoutDesc = prefix + "-Cryo Sessions Pack";
       }
       else {
           checkoutDesc = "Cryo Sessions Packages";
       }
       var ctry = 0;
      cartList.children('li:not(.deleted)').each(function(){    
 
           var isGiftBool = Number($(this).find('.product-details').data('isgift'));
         

           if (isGiftBool == 1 ) {
               var oneQuantity = 1;
          
                var xyz = $(this).find('.product-details').data('giftid');
             
           }
           else {
              var oneQuantity = Number($(this).find('select').val());
     
               var xyz = -1;
           }
            dataProdOrderListId++;
        
            var ptype = $(this).data('prod');
       
            var textProdDescription = $(this).find('h3').text();
            var pprice = $(this).find('.price').text();
            dataProdOrderList.push( { productTypeId: ptype, textdes: textProdDescription, productprice: pprice, isgift: isGiftBool, giftid: xyz, qty: oneQuantity} );
            
           ctry++;
      });
     

 
   // Open Checkout with further options:
           handler.open({
           name: 'REDUX Cryo',
           description: checkoutDesc,
           amount: amtNum,
           zipCode: true,
           opened: function () {
               $('.cd-cart-container').removeClass('cart-open');
               $('.cd-cart-container').addClass('empty');
           },
           closed: function () {
               if (submittedForm == false) {
                   $('.cd-cart-container').removeClass('empty');
 
                   $('#done').text("Cancelled checkout");
                   dataProdOrderList = [];
                   e.preventDefault();
               }
               else {
                 
                   resetCount();
                   emptyCartList();
 
                        
                   $('#myModalThanks').modal('show');
 
                       
               }
           }
         });
         e.preventDefault();
   });
 
   // Close Checkout on page navigation:
   window.addEventListener('popstate', function() {
     handler.close();
   });
 
   /* Set the value to '0' of the <li> list contained within class 'count'*/
   function resetCount() {
       cartCount.find('li').eq(0).text('0');
       cartCount.find('li').eq(1).text('0');
 
       cartTotal = 0;
   }
   function emptyCartList() {
       cartList.empty();
   }
 
   var clBtn = $('#find');
        clBtn.on('click', function(event){
     
        });
 
   function Product(p_id, descr, pr_price, black_pic, white_pic) {
        this.prod_id = p_id;
        this.prod_descr = descr;
        this.prod_price =  pr_price;
        this.prod_blackPic = black_pic;
        this.prod_whitePic = white_pic;
 
        this.getProdId = function () {
                return this.prod_id;
        }
        this.getDescr = function () {
                return this.prod_descr;
        }
        this.getPrice = function () {
                return this.prod_price;
        }
        this.getBlackPic = function () {
                return this.prod_blackPic;
        }
        this.getWhitePic = function() {
                return this.prod_whitePic;
        }
   }
 
 
 
         // MODAL DATA-API
// ==============
 
$(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
   $('body').addClass("bootstrap2");
 
 

   $('.cd-cart-container').addClass('empty');
 
   if ($('.cd-cart-container').hasClass('cart-open')) {
     $('.cd-cart-container').removeClass('cart-open');
   }
 
   var $this   = $(this)
   var href    = $this.attr('href')
   var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
   var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
   var what = $(this).attr("data-prodId");
   var pid = $(this).data('ppid');

   $("#hidden-prodId").attr("value", pid);
   if ($this.is('a')) e.preventDefault()
 
   $target
     .modal(option, this)
     .one('hide', function () {
       $this.is(':visible') && $this.focus()
     })
})
 
   $(document)
   .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
   .on('hidden.bs.modal', '.modal', function () {
     $(document.body).removeClass('modal-open')
      $(document.body).removeClass('bootstrap2')
 
 
     $("#giftF").hide();
     $('#checkBox').attr('checked', false);
     $("#hidden-prodId").attr("value", "");
      $('.cd-cart-container').removeClass('empty');
     
 
           if (submittedForm == false) {
              if (giftFormSubmitted) {       
                        /* Add A gift the the cart list */
                        /* * this means without the 'quanity' */
                        /*** set giftFormSubmitted = false */
                        var productid = globalProductId;
                        var prodPrice = globalProdPrice;
                        // var ob =  inventory.find(x => x.getProdId() == 1 );
                        var obj = inventory.find(x => x.getProdId() == productid );
                        var prodName = obj.getDescr();
                        if (productid == 1) {
                          prodName = 'First Session';
                        }
                        var whiteProdImage = obj.getWhitePic();
                        whiteProdImage = "img/reduxwhite/" + whiteProdImage;
                     
                        var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="1" data-giftId="' + giftId + '"><h3 class="textdes"><a href="#0">' + prodName + '</a></h3><span class="price">$' + prodPrice + '.00</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantityx giftclass"><img src="img/gift4.png" alt="placeholder"></div></li>');
                        //var prodToAdd = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="img/images.jpg" alt="placeholder"></a></div><div class="product-details" data-isGift="1" data-giftId="' + giftId + '"><h3><a href="#0">Product Name</a></h3><span class="price">$' + prodPrice + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a></div></li>');
                        cartList.prepend(productAdded);
                        giftFormSubmitted = false;
              }
              else {
                        /* use logic already implement */
                        /** This logic includes if-eles whether the type of product about to be added is already on the cart list*/
                        /*** if it is then increment the quanity of the product in the cart list */
                        /**** else add the product to list */
                        
                        if ( Number(cartCount.find('li').eq(0).text() ) < 9) {
                    
                          addProduct(globalProdPrice, globalProductId);
                        }
                      
                        
                        


              }
           }
        
              
   })
 
   //**************************************************************************************************//
 
   $(document).on('click.bs.modal.data-api', '[data-toggle="modalx"]', function (e) {
   $('body').addClass("bootstrap2");
 
   var $thisx    = $(this)
   var hrefx    = $this.attr('href')
   var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
   var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
 
   if ($this.is('a')) e.preventDefault()
 
   $target
     .modal(option, this)
     .one('hide', function () {
       $this.is(':visible') && $this.focus()
     })
})
 
   $(document)
   .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
   .on('hidden.bs.modal', '.modal', function () {
     $(document.body).removeClass('modal-open')
      $('body').removeClass('bootstrap2')
  
      if (submittedForm == true) {
           cartWrapper.addClass('empty');
       }
   })
 
});