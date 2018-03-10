$(document).ready(function() {});
jQuery(document).ready(function($) {
    var giftFormSubmitted = !1;
    var giftId = 0;
    var giftList = [];
    var dataProdOrderListId = 0;
    var dataProdOrderList = [];
    var globalCT = -1;
    var cartWrapper = $('.cd-cart-container');
    var productId = 0;
    var globalToFirstName = "";
    var globalToLastName = "";
    var globalToEmail = "";
    var globalFromName = "";
    var globalProductId = "";
    var globalGiftMessage = "";
    var globalProdPrice = "";
    var prod1 = new Product(1, "First-Timer 1 Session", "r1black.png", "r1white.png");
    var prod2 = new Product(2, "One Session", "r1black.png", "r1white.png");
    var prod3 = new Product(3, "3-Session Pack", "r3black.png", "r3white.png");
    var prod4 = new Product(5, "5-Session Pack", "r5black.png", "r5white.png");
    var prod5 = new Product(10, "10-Session Pack", "r10black.png", "r10white.png");
    var prod6 = new Product(1000, "Membership", "rxblack.png", "rxwhite.png");
    var prod7 = new Product(15, "Localized Session", "r1black.png", "r1white.png");
    var inventory = [prod1, prod2, prod3, prod4, prod5, prod6, prod7];
    var ob = inventory.find(x => x.getProdId() == 1);
    var cartLimitReached = !1;
    var itemLimit = 9;
    var prodCtr = 0;
    if (cartWrapper.length > 0) {
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
        gbAddToCartBtn.on('click', function(event) {
            event.preventDefault();
            if (Number(cartCount.find('li').eq(0).text()) <= 9) {
                addToCart($(this))
            } else console.log("stopped at gbAddToCartBtn.on('click')")
        });
        addToCartBtn.on('click', function(event) {
            event.preventDefault();
            addToCart($(this))
        });
        cartTrigger.on('click', function(event) {
            event.preventDefault();
            toggleCart()
        });
        cartWrapper.on('click', function(event) {
            if ($(event.target).is($(this))) toggleCart(!0)
        });
        cartList.on('click', '.delete-item', function(event) {
            event.preventDefault();
            removeProduct($(event.target).parents('.product'))
        });
        cartList.on('change', 'select', function(event) {
            quickUpdateCart()
        });
        undo.on('click', 'a', function(event) {
            clearInterval(undoTimeoutId);
            event.preventDefault();
            cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
                $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
                quickUpdateCart()
            });
            undo.removeClass('visible')
        })
    }

    function toggleCart(bool) {
        var cartIsOpen = (typeof bool === 'undefined') ? cartWrapper.hasClass('cart-open') : bool;
        if (cartIsOpen) {
            cartWrapper.removeClass('cart-open');
            clearInterval(undoTimeoutId);
            undo.removeClass('visible');
            cartList.find('.deleted').remove();
            setTimeout(function() {
                cartBody.scrollTop(0);
                if (Number(cartCount.find('li').eq(0).text()) == 0) cartWrapper.addClass('empty')
            }, 500)
        } else {
            cartWrapper.addClass('cart-open')
        }
    }

    function addToCart(trigger) {
        globalProductId = trigger.data('ppid');
        if (Number(cartCount.find('li').eq(0).text()) >= 9) {
            return
        } else {
            var num = Number(cartCount.find('li').eq(0).text()) + 1;
            var productid = globalProductId;
            var obj = inventory.find(x => x.getProdId() == productid);
            globalProdPrice = obj.getPrice();
            var prodImageFile = obj.getBlackPic();
            var prodPrice = obj.getPrice();
            var prodDescr = obj.getDescr();
            $("#prod-added-image").attr("src", "img/reduxblack/" + prodImageFile);
            $('#text-descr-prod').text(prodDescr);
            $("#price-prod").text('$' + prodPrice);
            var prodAddedImage = $("#prod-added-image");
            var obj = inventory.find(x => x.getProdId() == productid);
            var prodImageFile = obj.getBlackPic();
            prodAddedImage.attr("src", "img/reduxblack/" + prodImageFile);
            var cartIsEmpty = cartWrapper.hasClass('empty');
            updateCartCount(cartIsEmpty);
            updateCartTotal(globalProdPrice, !0);
            cartWrapper.removeClass('empty')
        }
    }

    function addProduct(prodPrice, productid) {
        if ($('[data-prod="' + productid + '"]').length) {
            var isg = $('[data-prod="' + productid + '"]').find('.product-details').data('isgift');
            if (isg == "0") {
                var currQtyVal = $("#prodListItem" + productid + " option:selected").val();
                if (currQtyVal == 9)
                    return;
                currQtyVal++;
                $('select[id="cd-product-' + productid + '"]').val(currQtyVal);
                var again = $("#prodListItem" + productid + " option:selected").val()
            } else {
                var obj = inventory.find(x => x.getProdId() == productid);
                var prodName = obj.getDescr();
                var whiteProdImage = obj.getWhitePic();
                whiteProdImage = "img/reduxwhite/" + whiteProdImage;
                var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="0" data-giftId="0"><h3 class="textdes"><a href="#0">' + prodName + '</a></h3><span class="price">$' + prodPrice + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-' + productid + '">Qty</label><span class="select"><select id="cd-product-' + productid + '" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
                cartList.prepend(productAdded);
                dataProdOrderListId++
            }
        } else {
            var obj = inventory.find(x => x.getProdId() == productid);
            var prodName = obj.getDescr();
            if (productid == 1) {
                prodName = 'First Session'
            }
            var whiteProdImage = obj.getWhitePic();
            whiteProdImage = "img/reduxwhite/" + whiteProdImage;
            var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="0" data-giftId="0"><h3 class="textdes"><a href="#0">' + prodName + '</a></h3><span class="price">$' + prodPrice + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-' + productid + '">Qty</label><span class="select"><select id="cd-product-' + productid + '" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
            cartList.prepend(productAdded)
        }
        if (getQuickCount() == itemLimit) {
            disableAddedToCartFull()
        }
    }

    function removeProduct(product) {
        clearInterval(undoTimeoutId);
        cartList.find('.deleted').remove();
        var topPosition = product.offset().top - cartBody.children('ul').offset().top,
            productQuantity = Number(product.find('.quantity').find('select').val()),
            productTotPrice = Number(product.find('.price').text().replace('$', '')) * productQuantity;
        if (product.children(".product-details").data('isgift') == 1) {
            productQuantity = 1;
            productTotPrice = Number(product.find('.price').text().replace('$', ''))
        }
        product.css('top', topPosition + 'px').addClass('deleted');
        updateCartTotal(productTotPrice, !1);
        updateCartCount(!0, -productQuantity);
        cartList.find('.deleted').remove();
        if (product.find('.product-details').attr("data-isGift") == 1)
            deleteGiftFromList(product.find('.product-details').attr("data-giftId"))
        prodCtr = getQuickCount();
        if (prodCtr < 9) {
            enableAddedToCart()
        }
    }

    function getQuickCount() {
        var quantity = 0;
        var price = 0;
        cartList.children('li:not(.deleted)').each(function() {
            var isGiftType = Number($(this).find('.product-details').data('isgift'));
            if (isGiftType == 1) {
                var singleQuantity = 1
            } else {
                var singleQuantity = Number($(this).find('select').val())
            }
            quantity += singleQuantity
        });
        return quantity
    }

    function quickUpdateCart() {
        var quantity = 0;
        var price = 0;
        cartList.children('li:not(.deleted)').each(function() {
            var isGiftType = Number($(this).find('.product-details').data('isgift'));
            if (isGiftType == 1) {
                var singleQuantity = 1
            } else {
                var singleQuantity = Number($(this).find('select').val())
            }
            quantity += singleQuantity;
            price = price + singleQuantity * Number($(this).find('.price').text().replace('$', ''))
        });
        prodCtr = quantity;
        cartTotal.text(price.toFixed(2));
        cartCount.find('li').eq(0).text(quantity);
        cartCount.find('li').eq(1).text(quantity + 1)
        if (getQuickCount() >= itemLimit) {
            disableAddedToCartFull()
        } else {
            enableAddedToCart()
        }
    }

    function updateCartCount(emptyCart, quantity) {
        if (Number(cartCount.find('li').eq(0).text()) >= 9) {}
        if (typeof quantity === 'undefined') {
            var actual = Number(cartCount.find('li').eq(0).text()) + 1;
            var next = actual + 1;
            if (emptyCart) {
                cartCount.find('li').eq(0).text(actual);
                cartCount.find('li').eq(1).text(next)
            } else {
                cartCount.addClass('update-count');
                setTimeout(function() {
                    cartCount.find('li').eq(0).text(actual)
                }, 150);
                setTimeout(function() {
                    cartCount.removeClass('update-count')
                }, 200);
                setTimeout(function() {
                    cartCount.find('li').eq(1).text(next)
                }, 230)
            }
        } else {
            var actual = Number(cartCount.find('li').eq(0).text()) + quantity;
            var next = actual + 1;
            cartCount.find('li').eq(0).text(actual);
            cartCount.find('li').eq(1).text(next)
        }
    }

    function updateCartTotal(price, bool) {
        bool ? cartTotal.text((Number(cartTotal.text()) + Number(price)).toFixed(2)) : cartTotal.text((Number(cartTotal.text()) - Number(price)).toFixed(2))
    }

    function disableAddedToCartFull() {
        $("[data-target='#myModal'").each(function() {
            $(this).attr('data-target', '#myModalFull')
        })
    }

    function enableAddedToCart() {
        $("[data-target='#myModalFull'").each(function() {
            $(this).attr('data-target', '#myModal')
        })
    }

    function deleteGiftFromList(gift_id) {
        for (var x = 0; x < giftList.length; x++) {
            if (giftList[x].gId == gift_id) {
                if (x == giftList.length - 1) {
                    giftList.pop();
                    break
                } else {
                    var objTemp = giftList[x];
                    giftList[x] = giftList[giftList.length - 1];
                    giftList[giftList.length - 1] = objTemp;
                    giftList.pop();
                    break
                }
            }
        }
    }
    $("#target").submit(function(event) {
        giftFormSubmitted = !0;
        giftId++;
        event.preventDefault();
        $('#myModal').modal('toggle');
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
        var giftObj = {
            recipientFirstName: recFirstName,
            recipientLastName: recLastName,
            recipientEmail: recEmail,
            from: fromName,
            msge: message,
            prod: globalProductId,
            gId: giftId
        };
        giftList.push(giftObj)
    });
    var submittedForm = !1;
    var handler = StripeCheckout.configure({
        key: 'pk_test_jnoYrq5CaWDmBeEYMFxBxwGN',
        image: 'https://www.reduxcryotherapy.com/xreduxwhitecopy.png',
        locale: 'auto',
        token: function(token) {
            submittedForm = !0;
            var ct = cartTotal.text();
            ct = ct.replace(/\./g, '');
            var amtNum = Number(ct);
            var orderObj = {
                stripeToken: token.id,
                amount: amtNum,
                zip: token.card.address_zip,
                email: token.email,
                products_sold: dataProdOrderList,
                gifts: giftList
            };
            $.post("chargez.php", orderObj).done(function(data) {})
        }
    });
    document.getElementById('checkout-btn').addEventListener('click', function(e) {
        var cc = cartTotal.text();
        cc = cc.replace(/\./g, '')
        var amtNum = Number(cc);
        if (amtNum == 0)
            return;
        var checkoutDesc = "";
        if (cartCount.find('li').eq(0).text() == 1 && (globalProductId == 1 || globalProductId == 2))
            checkoutDesc = "One Cryo Session";
        else if (cartCount.find('li').eq(0).text() == 1 && globalProductId == 6)
            checkoutDesc = "REDUX Membership";
        else if (cartCount.find('li').eq(0).text() == 1 && globalProductId == 15) {
            checkoutDesc = "Localized Cryo Session"
        } else if (cartCount.find('li').eq(0).text() == 1 && (globalProductId > 2 && globalProductId < 6)) {
            var prefix = "";
            if (globalProductId == 3)
                prefix = "3";
            else if (globalProductId == 4)
                prefix = "5";
            else prefix = "10";
            checkoutDesc = prefix + "-Cryo Sessions Pack"
        } else {
            checkoutDesc = "Cryo Sessions Packages"
        }
        var ctry = 0;
        cartList.children('li:not(.deleted)').each(function() {
            var isGiftBool = Number($(this).find('.product-details').data('isgift'));
            if (isGiftBool == 1) {
                var oneQuantity = 1;
                var xyz = $(this).find('.product-details').data('giftid')
            } else {
                var oneQuantity = Number($(this).find('select').val());
                var xyz = -1
            }
            dataProdOrderListId++;
            var ptype = $(this).data('prod');
            var textProdDescription = $(this).find('h3').text();
            var pprice = $(this).find('.price').text();
            dataProdOrderList.push({
                productTypeId: ptype,
                textdes: textProdDescription,
                productprice: pprice,
                isgift: isGiftBool,
                giftid: xyz,
                qty: oneQuantity
            });
            ctry++
        });
        handler.open({
            name: 'REDUX Cryo',
            description: checkoutDesc,
            amount: amtNum,
            zipCode: !0,
            opened: function() {
                $('.cd-cart-container').removeClass('cart-open');
                $('.cd-cart-container').addClass('empty')
            },
            closed: function() {
                if (submittedForm == !1) {
                    $('.cd-cart-container').removeClass('empty');
                    $('#done').text("Cancelled checkout");
                    dataProdOrderList = [];
                    e.preventDefault()
                } else {
                    resetCount();
                    emptyCartList();
                    $('#myModalThanks').modal('show');
                    $('body').addClass('bootstrap2')
                }
            }
        });
        e.preventDefault()
    });
    window.addEventListener('popstate', function() {
        handler.close()
    });

    function resetCount() {
        cartCount.find('li').eq(0).text('0');
        cartCount.find('li').eq(1).text('0');
        cartTotal = 0
    }

    function emptyCartList() {
        cartList.empty()
    }
    var clBtn = $('#find');
    clBtn.on('click', function(event) {});

    function Product(p_id, descr, black_pic, white_pic) {
        this.prod_id = p_id;
        this.prod_descr = descr;
        this.prod_blackPic = black_pic;
        this.prod_whitePic = white_pic;
        price = null;
        this.getProdId = function() {
            return this.prod_id
        }
        this.getDescr = function() {
            return this.prod_descr
        }
        this.getPrice = function() {
            return this.price
        }
        this.getBlackPic = function() {
            return this.prod_blackPic
        }
        this.getWhitePic = function() {
            return this.prod_whitePic
        }
        this.setPrice = function(p_price) {
            this.price = p_price
        }
    }
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {})
    $(document).on('show.bs.modal', '.modal', function() {
        if (Number(cartCount.find('li').eq(1).text()) == 9) {}
        $('body').addClass("bootstrap2");
        $('.cd-cart-container').addClass('empty');
        if ($('.cd-cart-container').hasClass('cart-open')) {
            $('.cd-cart-container').removeClass('cart-open')
        }
        $("#hidden-prodId").attr("value", globalProductId)
    }).on('hidden.bs.modal', '.modal', function() {
        $(document.body).removeClass('bootstrap2')
        $("#giftF").hide();
        $('#checkBox').attr('checked', !1);
        $("#hidden-prodId").attr("value", "");
        $('.cd-cart-container').removeClass('empty');
        if (submittedForm == !1) {
            if (giftFormSubmitted) {
                var productid = globalProductId;
                var prodPrice = globalProdPrice;
                var obj = inventory.find(x => x.getProdId() == productid);
                var prodName = obj.getDescr();
                if (productid == 1) {
                    prodName = 'First Session'
                }
                var whiteProdImage = obj.getWhitePic();
                whiteProdImage = "img/reduxwhite/" + whiteProdImage;
                var productAdded = $('<li class="product" data-prod="' + productid + '" id="prodListItem' + productid + '"><div class="product-image"><a href="#0"><img src="' + whiteProdImage + '" alt="placeholder"></a></div><div class="product-details" data-isGift="1" data-giftId="' + giftId + '"><h3 class="textdes"><a href="#0">' + prodName + '</a></h3><span class="price">$' + prodPrice + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantityx giftclass"><img src="img/gift4.png" alt="placeholder"></div></li>');
                cartList.prepend(productAdded);
                prodCtr++;
                giftFormSubmitted = !1
            } else {
                if (prodCtr <= 8) {
                    addProduct(globalProdPrice, globalProductId)
                    prodCtr++
                } else {}
            }
        }
    })
    $(document).on('show.bs.modal', '.modal', function() {}).on('hidden.bs.modal', '.modal', function() {
        $('body').removeClass('bootstrap2')
        if (submittedForm == !0) {
            cartWrapper.addClass('empty')
        }
    })
    $.ajax({
        url: 'getprices.php',
        type: 'GET',
        dataType: "json",
        success: function(data) {
            var hasCents = !1;
            var obj1 = data[0];
            $.each(data, function(key, value) {
                $.each(value, function(key, value) {
                    if (key != "pr11") {
                        if (value % 1 != 0)
                            hasCents = !0
                    }
                })
            });
            $.each(data, function(key, value) {
                $.each(value, function(key, value) {
                    if (key != "pr11") {
                        var prod = $("#" + key);
                        if (!hasCents)
                            prod.text("$" + Math.round(value));
                        else prod.text("$" + value);
                        var p_id = key.substring(2);
                        var obj = inventory.find(x => x.getProdId() == p_id);
                        obj.setPrice(value)
                    }
                })
            })
        },
        error: function(data) {
            console.log("data error:  " + data.errorThrown);
            $('.wedoprice').each(function() {
                $(this).text('error');
                $(this).css("color", "#b53f0e")
            });
            $("[data-target='#myModal'").each(function() {
                $(this).attr('data-target', '')
            });
            $('.single_wedo').each(function() {
                $(this).removeClass('gb-add-to-cart')
            })
        }
    })
})