/**
 *
 *@Author - Eugene Mutai
 *@Twitter - JheneKnights
 *
 * Date: 6/13/13
 * Time: 2:38 AM
 * Description:
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Copyright (C) 2013
 * @Version -
 */

var AppFunctions = {

    userData: "prittyNote",
    bktime: false,
    URL: {
      app: "http://app.prittynote.com/"
    },
    image: false,

    getPhoto: function(bool) {
        if(typeof bool == "undefined") bool = false;

        var details;
        AppFunctions.image = bool;
        //bool -- false = load image from gallery
        if(bool) {
            details = blackberry.invoke.card.CAMERA_MODE_PHOTO;
            //invoke the Camera
            blackberry.invoke.card.invokeCamera(
                details,
                AppFunctions.onPhotoSuccess,
                AppFunctions.onPhotoCancel,
                AppFunctions.onPhotoFail
            );
        }else{
            // filepicker options
            details = {
                mode: blackberry.invoke.card.FILEPICKER_MODE_PICKER,
                type: [blackberry.invoke.card.FILEPICKER_TYPE_PICTURE],
                viewMode: blackberry.invoke.card.FILEPICKER_VIEWER_MODE_GRID,
                sortBy: blackberry.invoke.card.FILEPICKER_SORT_BY_DATE,
                sortOrder: blackberry.invoke.card.FILEPICKER_SORT_ORDER_DESCENDING
            };
            //invoke the filePicker for images
            blackberry.invoke.card.invokeFilePicker(
                details,
                AppFunctions.onPhotoSuccess,
                AppFunctions.onPhotoCancel,
                AppFunctions.onPhotoFail
            );
        }
    },

    onPhotoSuccess: function(imageUri) {

        var imageUri = AppFunctions.image !== false ? imageUri: "file://" + imageUri;
        var img = $('img#bg-image');
        img.attr('src', imageUri); //"data:image/jpeg;base64," + imageUri);
        img.on('load', function() {

            var offsetY = 0, offsetX = 0, croppingDimensions;
            if(img.width() < img.height()) {
                offsetX = 0;
                offsetY = (img.height() - img.width())/2;
                croppingDimensions = img.width();
            }
            else if(img.width() > img.height()) {
                offsetX = (img.width() - img.height())/2;
                offsetY = 0;
                croppingDimensions = img.height()
            }
            else{
                offsetY = offsetX = 0;
                croppingDimensions = img.width()
            }

            //now feed the image with required dimensions
            var image = {
                src: $(this).attr('src'),
                sx: offsetX, sy: offsetY,
                sw: croppingDimensions, sh: croppingDimensions,
                bool: true,
                rw: img.width(), rh: img.height()
            }
            console.log(image);

            //activate background image and draw it
            prittyNote.bgImage = true; //prittyNote.isImage(image) -- override
            if(prittyNote.bgImage) {
                prittyNote.theImage = image;
                prittyNote.drawCanvas(prittyNote.getValue(), image);
            }
            console.log("the width of the image -- " + img.width());
        });
        img.on('error', function() {
            alert('Oh Snap! Couldn\'t load the image for some reason! Try again!');
            console.log("The image Path: " + imageUri);
        });
    },

    onPhotoCancel: function(reason) {
        alert("cancelled " + reason);
    },

    onPhotoFail: function(message) {
        console.log(message);
    },

    //generate a random string with letters and number
    randomString: function(length) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var randomstring = '';
        for (var i=0; i<length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum+1);
        }
        return randomstring;
    },

    //initialising the App
    initiliaseApp: function() {
        // AppFunctions.verifyUser();

        //If the user taps the search buttorn, pop up the text editor
        document.addEventListener("searchbutton", function() {
            $('a[data-action="edit"]').trigger('touch');
        }, false);

        //If the user taps menu button, prompt the user to save the image
        document.addEventListener('menubutton', function() {
            $('a[data-action="download"]').trigger('touch');
        }, false)

        //If the user presses the back button
        document.addEventListener("backbutton", function() {
            var date = new Date() //get the current date
            $('.activity').html("Press back again to exit...")
            if(AppFunctions.bktime) {
                var diff = prittyNote.getTimeDifference(AppFunctions.bktime, date);
                console.log('Difference in seconds since last BACK press: ' + diff.seconds);
                AppFunctions.bktime = date;
                //exit the application or negate the elapsed time
                if(diff.seconds < 4) navigator.app.exitApp();
                //if not 3 seconds have passed since the user last pressed the back button
            }else{
                AppFunctions.bktime = date;
            }
            $('.close').trigger('touch'); //close all possible pop ups
            $('a[data-action="cancel"]').trigger('touch'); //close the editor.
            $.sidr('close', 'side-bar-themes'); //close all side bars
            $.sidr('close', 'side-bar-fonts');
        }, false);

        //FONT RANGE INPUT -- max font size controlled by the screensize
        $('.font-range-input').attr({max: $(window).width()/3}).delay(0).rangeInput();
        $('.close-font-slider').click(function() { $('.font-control').slideUp(); })

        //Create the side menus
        $('.side-bar-themes').sidr({
            name: 'side-bar-themes',
            side: 'left', // By default
            source: function(name) {
                $('#' + name).append($('.' + name).children('ul').clone()).css('overflow', 'hidden');
                var myScroll = new iScroll(name, {
                    vScrollbar: true, hScrollbar:false, hScroll: false
                    ,onScrollStart: function () { myScroll.refresh(); }
                })
            }
        });

        //Create FONTS sidebar menu
        $('.side-bar-fonts').sidr({
            name: 'side-bar-fonts',
            side: 'right',
            source: function(name) {
                $('#' + name).append($('.' + name).children('ul').clone()).css('overflow', 'hidden');
                var myScroll = new iScroll(name, {
                    vScrollbar: true, hScrollbar:false, hScroll: false
                    ,onScrollStart: function () { myScroll.refresh(); }
                })
            }
        });

        //Enable swipe events to control the App requirements
        var swipe = $(document).hammer();
        //if the user double taps the canvas
        swipe.on('doubletap', 'canvas', function() {
            $('a[data-action="edit"]').trigger('touch');
        })
        swipe.on('swipeleft', function(ev) {
            $.sidr('close', 'side-bar-themes');
            $.sidr('open', 'side-bar-fonts');
            ev.gesture.preventDefault();
        })
        swipe.on('swiperight', function(ev) {
            $.sidr('open', 'side-bar-themes');
            $.sidr('close', 'side-bar-fonts');
            ev.gesture.preventDefault();
        })
        swipe.on('tap touch', 'div.content', function() {
            $.sidr('close', 'side-bar-themes');
            $.sidr('close', 'side-bar-fonts');
        })

        //initialise all other events
        AppFunctions.initialiseEvents();

    },

    initialiseEvents: function() {
        //footer menu events delegation
        var footerMenu = document.getElementsByClassName('footer-icon-menu');
        $(footerMenu).hammer().on('touch', 'a', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var action = $(this).data('action');
            switch(action) {
                case "edit":
                    //Hide the elements
                    $('.text-area').show(600, "easeInBack", function() {
                        $('.overlay').fadeIn(100)
                        $('textarea#input-text').focus(); //focus to enable user to edit
                        popup = true
                    });
                    break;

                case "theme":
                    $('.color-options').show("fast", function() {
                        $('.overlay').show('fast')
                        $(this).children().hammer().on('touch', 'div', function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            var action = $(this).data('action')
                            $('.close').trigger('touch');
                            console.log(action)
                            switch(action) {
                                case "custom":
                                    AppFunctions.editCanvasColors();
                                    break;
                                case "themes":
                                    setTimeout(function() {
                                        $.sidr('open', 'side-bar-themes');
                                        $.sidr('close', 'side-bar-fonts');
                                    }, 50);
                                    break;
                            }

                        })
                    })
                    break;

                case "add-image":
                    //param: boolean -- true for camera
                    $('.app-cmr-gallery').show('fast', function() {
                        var El = $(this);
                        $('.overlay').show('fast');
                        $(this).children().hammer().on('touch', 'div', function() {
                            var action = $(this).data('action');
                            console.log(action)
                            switch(action) {
                                case "gallery":
                                    AppFunctions.getPhoto();
                                    break;
                                case "camera":
                                    AppFunctions.getPhoto(true);
                                    break;
                                case "remove-image":
                                    prittyNote.removeImage();
                                    break;
                            }
                            //Now close the modal dialog
                            El.find('.close').trigger('touch');
                        })
                    });
                    break;

                case "font":
                    $.sidr('close', 'side-bar-themes');
                    $.sidr('open', 'side-bar-fonts');
                    break;
                //Change the font-size
                case "font-size":
                    $('.font-control').slideToggle();
                    break;
                //prompt for the image to be saved;
                case "download":
                    //track how many images the user can make with the free application.
                    $('.app-save').show('fast', function() {
                        $('.overlay').show('fast');

                        //Respond to what the user will choose
                        $(this).children().hammer().on('touch', 'div', function() {
                            var action = $(this).data('action');

                            //show the saving progress bar - DEPRECATED
                            $('.activity-progress').width(0).parent().show();
                            $('.activity').html("Saving Image...");
                            //if($('.saving-progress-bar')) $('.saving-progress-bar').show();

                            //HIDE THE SAVING MODAL
                            $(this).parent().parent().hide("fast", function() {
                                //also hide the overlay
                                $('.overlay').hide('fast', function() {
                                    //After the overlay is hidden now perform the tasks
                                    console.log(action)
                                    switch(action) {
                                        case "save":
                                            prittyNote.share = false;
                                            prittyNote.makeDemoNotes();
                                            break;
                                        case "save-share":
                                            prittyNote.share = true;
                                            setTimeout(prittyNote.makeDemoNotes(), 0);
                                            break;
                                    }
                                })
                            })

                        })
                    })

                    break;
            }
            ev.stopPropagation();
        });

        $('.finish-edit').hammer().on('touch tap', 'a', function(ev) {
            ev.preventDefault();
            var action = $(this).data('action');
            //Hide the elements
            $('.text-area').hide(600, "easeOutBack", function() {
                $('.overlay').fadeOut(100)
                popup = false;
            });
            //do something accordint to the action
            switch(action) {
                case "cancel": /* do nothing */ break;
                case "done": /* do something */
                    prittyNote.checkTextLength();
                    break;
            }
        });

        $('.pop-header').hammer().on('touch', 'img', function() {
            var action = $(this).parent().data('action');
            console.log("The user has clicked on", action);

            var el = document.getElementById('input-text');
            switch (action) {
                case "ok-edit":
                    $(el).trigger('blur');
                    break;
                case "cancel-edit":
                    $(el).val('').focus();
                    break;
                case "none":
                    //do nothing
                    break;
                case "help":
                    $('#app-help').trigger('touch')
                    break;

                case "status-share":
                    $('.overlay').show("fast", function() {
                        $(".status-search").show("fast", function() {
                            //to correct the height of stuff
                            var wrapper = $('#search-wrapper');
                            var of = wrapper.offset();
                            var height = $(window).height() - of.top;

                            if(wrapper.css("height") !== wrapper.parent().height() - of.top) {
                                wrapper.css("height", wrapper.parent().height() - of.top)
                            }
                        })
                    })
            }
        });

        //Add scroller to the image
        var Scroll = new iScroll('intro-content', {
            vScrollbar: true, vScroll: true, hScrollbar: false, hScroll: false
            ,onScrollStart: function () { Scroll.refresh(); }
        })

        //If Overlay is left alone, one tapping trigger it to close
        $('.overlay').click(function() {
            if(!popup) {
                $(this).hide('fast', function() {
                    $('.close').trigger('touch')
                })
            }
        });


        //Close current pop up
        $('.close').hammer().on('touch', function(e) {
            $('.pop-up[data-action="' + $(this).data('action') + '"]').hide('fast', function() {
                var action = $(this).data('action');
                console.log("closing pop up", action)
                if(action !== "intro" || popup == false) {
                    $('.overlay').hide()
                }else{
                    $('.overlay').show()
                }
                e.stopPropagation();
            })
        })

        var drag = false;
        var Canvas = $('canvas#prittynote');
        Canvas.hammer().on('hold', function(ev) {
            $(".activity").html("Tap and hold where you want the text to move to.");
            drag = true;
        })
            //Detect when the user has finished moving around his text.
            .on("release", function(e) {
                var g = e.gesture.center;
                var pos = {left: g.pageX - $(this).offset().left, top: g.pageY - $(this).offset().top};
                if(drag) {
                    prittyNote.onMouseDownOrUp(pos);
                    $(".activity").html("Pinch the note, to undo move.");
                    drag = false; //prevent more release options
                }
            })
            //remove user's custom positioning of the note
            .on("pinchin", function() {
                prittyNote.userDef = false;
                setTimeout(prittyNote.drawCanvas(prittyNote.getValue()), 100);
            });

        $('#app-help').hammer().on('touch', function() {
            $('.introduction').show('fast', function() {
                $('.overlay').show()
            })
        })

        //Enable the sharing of the application
        $('#app-share').hammer().on('touch', function() {
            AppFunctions.shareThis({
                    text: "Today I thought of making a special note with PrittyNote because it's easy, fast and pretty too. I'd be so happy if you made 1 for me...download the app here: http://bit.ly/jheneknights",
                    subject: "Sharing App: PrittyNote",
                    title: "Share App with:",
                    type: "text"
                });
        })
    },

    shareThis: function(params, success) {
        //If success callback has not been defined, define it
        if(typeof success !== "function") success = function() { console.log("Image successfully shared.")}

        if(params.type !== "text") {
            var request = {
                action : 'bb.action.SHARE',
                uri : params.image,
                data: $("#input-text").val(), //If the text is needed
                target_type: ["APPLICATION", "VIEWER", "CARD"]
            };

            blackberry.invoke.card.invokeTargetPicker(
                request,
                "Share PrittyNote with: ",
                AppFunctions.onInvokeSuccess(success),
                AppFunctions.onInvokeError
            );
        }else{
            var request = {
                action : 'bb.action.SHARE',
                mime : 'text/plain',
                data : params.text,
                target_type: ["VIEWER", "CARD"]
            };

            blackberry.invoke.card.invokeTargetPicker(
                request,
                params.title,
                AppFunctions.onInvokeSuccess(success),
                AppFunctions.onInvokeError
            );
        }
    },

    onInvokeSuccess: function(callback) {
        console.log("Successfully shared")
        if(typeof callback == "function") callback();
    },

    onInvokeError: function(e) {
        blackberry.ui.toast.show("Oops! Something went wrong");
        console.log("An error occured while sharing: " + e)
    },

    savingProgress: function(progress, callback) {
        var prgs = progress * 25; //there are only 4 steps
        $('.activity-progress').animate({width: prgs + "%"}, 400, "easeInExpo", function() {
            var El = $(this);
            //If the progress bar is full, close everything.
            if(El.width() >= El.parent().width()) {
                setTimeout(function() {
                    El.parent().hide(); //itself
                    $('.activity').html(function(i, text) {
                        $(this).html($(this).data('default-text'));
                        if(typeof callback == "function") callback();
                    })
                }, 500);
            }else{
                if(typeof callback == "function") callback();
            }
        })
    },

    color: {
        choise: false,
        picker: $('div[data-rel="background"]') //put the starter
    },
    editCanvasColors: function() {
        var mum = $('.color-picker');
        //clone main canvas, change it's Id
        var clone = $(document.getElementById(prittyNote.canvas)).clone()
        clone.attr({id:"prittynote-cloned"}); //change it's id
        prittyNote.canvas = clone.attr("id"); //change canvas in edit phase
        $(".clone-canvas").html(clone);
        prittyNote.drawCanvas(prittyNote.getValue())

        //Show the custom color editor
        mum.show(1000, "easeOutElastic",function() {
            //Get Current color;
            $(".color-inputs").children('input').each(function() {
                var related = $(this).data('color');
                //feed the current colors to the choices data-color tags
                $('div[data-rel="' + related + '"]').attr({"data-color": $(this).val(), "data-default": $(this).val()})
                console.log(related, $(this).val());
            })
            //Assign current bg color the picker & highlight the bg
            $('input#color-picker')
                .minicolors("value", "#" + $('div[data-rel="background"]').data("color"))
            //Trigger the tapping of the background color
            $('div[data-rel="background"]').trigger('touch');
        }) //SHOW THE CUSTOM COLOR DIALOG

        //Event for color picker changes
        $(".color-choices").hammer().on('touch', 'div', function() {
            AppFunctions.color.picker = $(this)
            //highlite this
            $(this).addClass("pale-red").siblings().removeClass("pale-red");
            //change input color to
            $('input#color-picker').minicolors("value", "#" + $(this).data("color"))
                .delay(100).minicolors("show");
        })

        //Event for CANCEL or DONE
        $(".finish-color-edit").hammer().on('touch', "img", function() {
            var action = $(this).data("action");
            var close = true;
            switch (action) {
                //in this case restore all colors and close editor
                case "cancel-edit":
                    $(".color-choices").children('div').each(function() {
                        var related = $(this).data('rel');
                        //feed the current colors to the choices data-color tags
                        $('input[data-color="' + related + '"]').val($(this).data("default"))
                        console.log(related, $(this).data('default'));
                    });
                    break;
                //in case user has finished chosing his colors
                case "done-edit":
                    //do nothing, since the colors are already assigned
                    break;

                case "show-fonts":
                    $.sidr('open', 'side-bar-fonts');
                    close = false;
                    break;
            }

            //Restore the default canvas in edit
            if(close) {
                prittyNote.canvas = "prittynote";
                setTimeout(prittyNote.drawCanvas(prittyNote.getValue()), 100);
                mum.hide(600, "easeInBack");
            }
        })

        mum.hammer()
            .on("swipeleft", function(e) {
                e.preventDefault()
                $.sidr("open", "side-bar-fonts");
            }).on('touch', function() {
                $.sidr("close", "side-bar-fonts");
            })

    }

}
