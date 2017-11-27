function _hasClass(e,n){return new RegExp(" "+n+" ").test(" "+e.className+" ")}function _toggleClass(e,n){var i=" "+e.className.replace(/[\t\r\n]/g," ")+" ";if(_hasClass(e,n)){for(;i.indexOf(" "+n+" ")>=0;)i=i.replace(" "+n+" "," ");e.className=i.replace(/^\s+|\s+$/g,"")}else e.className+=" "+n}function ResponsiveMenu(e){e&&(this.nav=document.getElementsByClassName(e.navClass)[0],this.mobile=e.mobileClass,this.toggle=document.getElementsByClassName(e.toggleClass)[0],this.innerToggle=e.innerToggle?document.getElementsByClassName(e.innerToggle):!1,this.navOpen=e.navOpen||"nav-mobile-open",this.toggleActive=e.toggleActive||"nav-active",this.innerToggleActive=e.innerToggleActive||"nav-active-inner",this.jQuery=window.jQuery?jQuery:!1,this.init())}ResponsiveMenu.prototype.createMenu=function(){this.mobileElem=document.createElement("div"),this.mobileElem.className=this.mobile,this.nav.appendChild(this.mobileElem)},ResponsiveMenu.prototype.bindHandlers=function(){var e=this,n=void 0;if(this.mobileElem.addEventListener("click",function(){e.jQuery?e.jQuery(e.toggle).slideToggle(function(){e.jQuery(this).attr("style",""),_toggleClass(this,e.navOpen),_toggleClass(e.toggle,e.toggleActive)}):(_toggleClass(this,e.navOpen),_toggleClass(e.toggle,e.toggleActive))}),this.innerToggle&&!this.jQuery)for(n in this.innerToggle)isNaN(parseInt(n))||this.innerToggle[n].addEventListener("click",function(){_toggleClass(this,e.innerToggleActive)});this.jQuery&&this.jQuery(this.innerToggle).on({click:function(){var n=this,i=jQuery(this).find("ul");i.slideToggle(function(){_toggleClass(n,e.innerToggleActive)})}})},ResponsiveMenu.prototype.init=function(){this.createMenu(),this.bindHandlers()},function(){new ResponsiveMenu({navClass:"nav",mobileClass:"nav-mobile",toggleClass:"nav-list",innerToggle:"has-inner",innerToggleClass:"nav-inner",navOpen:"nav-mobile-open",toggleActive:"nav-active",innerToggleActive:"nav-active-inner"})}();