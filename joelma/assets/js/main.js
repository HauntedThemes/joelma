/**
 * Main JS file for Joelma
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': false,
        'infinite-scroll': false,
        'infinite-scroll-step': 1,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [];

    // Detect IE
    if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) {
        $('body').addClass('ie');
    }

    // Featured Posts Slider

    if ($('.intro .swiper-slide').length == 1) {
        $('.intro .swiper-pagination').addClass('hidden');
    };

    var swiperIntro = new Swiper('.intro .swiper-container', {
        pagination: {
            el: '.intro .swiper-pagination',
            clickable: true,
        },
        simulateTouch: false,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
    });

    if ($('.intro').length) {
        $('.intro .swiper-pagination .swiper-pagination-bullet:nth-child('+ (swiperIntro.activeIndex+2) +')').addClass('next');
        swiperIntro.on('slideChange', function () {
            $('.intro .swiper-pagination .swiper-pagination-bullet').removeClass('next');
            if (swiperIntro.isEnd) {
                $('.intro .swiper-pagination .swiper-pagination-bullet:nth-child(1)').addClass('next');
            }else{
                $('.intro .swiper-pagination .swiper-pagination-bullet:nth-child('+ (swiperIntro.activeIndex+2) +')').addClass('next');
            };
        });
    };

    // Related Posts Slider

    var swiperRelatedPosts = new Swiper('.related-posts .swiper-container', {
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        loopedSlides: 6,
        roundLengths: true,
        autoHeight: true,
        navigation: {
            nextEl: '.related-posts .swiper-button-next',
            prevEl: '.related-posts .swiper-button-prev',
        },
    });

    // Check 'read later' posts 
    if (typeof Cookies.get('joelma-read-later') !== "undefined") {
        readLaterPosts = JSON.parse(Cookies.get('joelma-read-later'));
    }

    readLaterPosts = readLater($('#content .loop'), readLaterPosts);
    readLaterPosts = readLater($('.related-posts'), readLaterPosts);

    $('.go').on('click', function(event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: $('#content').offset().top }, 600);
        return false;
    });

    $('.social-trigger, .bookmark, .search-trigger, .navigation-trigger, .trigger-share').on('click', function(event) {
        event.preventDefault();
    });    

    function closePopover(id){
        $(id).find('.close').on('click', function(event) {
            event.preventDefault();
            $(id).popover('hide');
        });
    }

    // Navigation Popover

    $('.navigation-trigger').popover({
        container: '.navigation',
        html: true,
        placement: 'bottom',
        content: function() {
            return $('.navigation-popover').html();
        }
    });

    $('.navigation-trigger').on('shown.bs.popover', function () {
        var id = $('.navigation-trigger').attr('aria-describedby');
        if (!$('body').hasClass('ie')) {
            new SimpleBar($('#' + id)[0]);
        };
        closePopover('#' + id);
    });

    // Search Popover

    $('.search-trigger').popover({
        container: '.search',
        html: true,
        placement: 'bottom',
        content: function() {
            return $('.search-popover').html();
        }
    });

    $('.search-trigger').on('shown.bs.popover', function () {
        var id = $('.search-trigger').attr('aria-describedby');
        searchInit('#' + id);
        closePopover('#' + id);
    });

    // Bookmark Popover

    $('.bookmark').popover({
        container: '.bookmark-content',
        html: true,
        placement: 'bottom',
        content: function() {
            return $('.bookmark-popover').html();
        }
    });

    $('.bookmark').on('shown.bs.popover', function () {
        var id = $('.bookmark').attr('aria-describedby');
        if (!$('body').hasClass('ie')) {
            new SimpleBar($('#' + id)[0]);
        };
        readLaterPosts = readLater($('#' + id + " #results"), readLaterPosts);
        closePopover('#' + id);
    })

    // Social Popover

    $('.social-trigger').popover({
        container: '.social-content',
        html: true,
        placement: 'bottom',
        content: function() {
            return $('.social-popover').html();
        }
    });

    $('.social-trigger').on('shown.bs.popover', function () {
        var id = $('.social-trigger').attr('aria-describedby');
        if ($('.social-popover').attr('data-twitter') != '') {
            var twitter = $('.social-popover').attr('data-twitter').substr(1);
            $('#' + id).find('.social-container').append('<a class="twitter-timeline" data-width="300" data-height="800" data-theme="dark" data-tweet-limit="5" data-chrome="noborders noheader transparent" href="https://twitter.com/'+ twitter +'?ref_src=twsrc%5Etfw"></a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
        };
        if (!$('body').hasClass('ie')) {
            new SimpleBar($('#' + id)[0]);
        };
        closePopover('#' + id);
    });

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments-trigger').on('click', function(event) {
            event.preventDefault();
            $(this).addClass('hidden');
            $('.comments-inner').append('<div id="disqus_thread"></div>');

            var url = [location.protocol, '//', location.host, location.pathname].join('');
            var disqus_config = function () {
                this.page.url = url;
                this.page.identifier = $('#content').attr('data-id');
            };

            (function() {
            var d = document, s = d.createElement('script');
            s.src = '//'+ config['disqus-shortname'] +'.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
            })();
        });

    };

    // Initialize ghostHunter - A Ghost blog search engine
    function searchInit(id){
        var searchField = $(id + " #search-field").ghostHunter({
            results             : id + " #results",
            onKeyUp             : true,
            zeroResultsInfo     : true,
            displaySearchInfo   : false,
            onComplete      : function( results ){

                $(id + " #results").empty();

                var tags = [];
                $.each(results, function(index, val) {
                    if (val.tags.length) {
                        if ($.inArray(val.tags[0], tags) === -1) {
                            tags.push(val.tags[0]);
                        };
                    }else{
                        if ($.inArray('Other', tags) === -1) {
                            tags.push('Other');
                        };
                    };
                });
                tags.sort();

                $.each(tags, function(index, val) {
                    console.log(val);
                    $(id + " #results").append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
                });

                $.each(results, function(index, val) {
                    if (val.tags.length) {
                        $(id + ' #results ul[data-tag="'+ val.tags[0] +'"]').append('<li><a href="#" class="read-later" data-id="'+ val.ref +'"><i class="far fa-bookmark"></i><i class="fas fa-bookmark"></i></a><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
                    }else{
                        $(id + ' #results ul[data-tag="Other"]').append('<li><a href="#" class="read-later" data-id="'+ val.ref +'"><i class="far fa-bookmark"></i><i class="fas fa-bookmark"></i></a><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
                    };
                });

                readLaterPosts = readLater($(id + " #results"), readLaterPosts);

            }
        });   

        if (!$('body').hasClass('ie')) {
            new SimpleBar($(id)[0]);
        };
        $(id + " #search-field").focus();

    }

    function readLater(content, readLaterPosts){

        if (typeof Cookies.get('joelma-read-later') !== "undefined") {
            $.each(readLaterPosts, function(index, val) {
                $('.read-later[data-id="'+ val +'"]').addClass('active');
            });
            bookmarks(readLaterPosts);
        }
        
        $(content).find('.read-later').each(function(index, el) {
            $(this).on('click', function(event) {
                event.preventDefault();
                var id = $(this).attr('data-id');
                if ($(this).hasClass('active')) {
                    removeValue(readLaterPosts, id);
                }else{
                    readLaterPosts.push(id);
                };
                $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                    $(this).toggleClass('active');
                });
                $('header .counter').addClass('shake');
                setTimeout(function() {
                    $('header .counter').removeClass('shake');
                }, 300);
                Cookies.set('joelma-read-later', readLaterPosts, { expires: 365 });
                bookmarks(readLaterPosts);
            });
        });

        return readLaterPosts;

    }

    function bookmarks(readLaterPosts){

        $('.bookmark-container').empty();
        if (readLaterPosts.length) {
            $('header .counter').removeClass('hidden').text(readLaterPosts.length);
            var filter = readLaterPosts.toString();
            filter = "id:["+filter+"]";

            $.get(ghost.url.api('posts', {filter:filter, include:"tags"})).done(function (data){
                $('.bookmark-container').empty();
                var tags = [];
                $.each(data.posts, function(index, val) {
                    if (val.tags.length) {
                        if ($.inArray(val.tags[0].name, tags) === -1) {
                            tags.push(val.tags[0].name);
                        };
                    }else{
                        if ($.inArray('Other', tags) === -1) {
                            tags.push('Other');
                        };
                    };
                });
                tags.sort();

                $.each(tags, function(index, val) {
                    $('.bookmark-container').append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
                });

                $.each(data.posts, function(index, val) {
                    if (val.tags.length) {
                        $('.bookmark-container ul[data-tag="'+ val.tags[0].name +'"]').append('<li><time>'+ prettyDate(val.created_at) +'</time><a href="#" class="read-later active" data-id="'+ val.id +'"><i class="far fa-bookmark"></i><i class="fas fa-bookmark"></i></a><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
                    }else{
                        $('.bookmark-container ul[data-tag="Other"]').append('<li><a href="#" class="read-later active" data-id="'+ val.id +'"><i class="far fa-bookmark"></i><i class="fas fa-bookmark"></i></a><time>'+ prettyDate(val.created_at) +'</time><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
                    };
                });

                $('.bookmark-container').find('.read-later').each(function(index, el) {
                    $(this).on('click', function(event) {
                        event.preventDefault();
                        var id = $(this).attr('data-id');
                        if ($(this).hasClass('active')) {
                            removeValue(readLaterPosts, id);
                        }else{
                            readLaterPosts.push(id);
                        };
                        $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                            $(this).toggleClass('active');
                        });
                        Cookies.set('joelma-read-later', readLaterPosts, { expires: 365 });
                        bookmarks(readLaterPosts);
                    });
                });

            });
        }else{
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks">You haven\'t yet saved any bookmarks. To bookmark a post, just click <i class="far fa-bookmark"></i>.</p>')
        };

    }

    function prettyDate(date) {
        var d = new Date(date);
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
    };

    function removeValue(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    // On click outside popover, close it

    $(document).on('click', function (e) {
        $('[data-toggle="popover"],[data-original-title]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false
            }
        });
    });

    var didScroll,
        lastScrollTop = 0,
        delta = 5;

    // Execute on load
    $(window).on('load', function(event) {

        var currentPage = 1;
        var pathname = window.location.pathname;
        var $result = $('.post');
        var step = 0;

        // remove hash params from pathname
        pathname = pathname.replace(/#(.*)$/g, '').replace('/\//g', '/');

        if ($('body').hasClass('paged')) {
            currentPage = parseInt(pathname.replace(/[^0-9]/gi, ''));
        }

        // Load more posts on click
        if (config['load-more']) {

            $('#load-posts').addClass('visible').removeClass('hidden');

            $('#load-posts').on('click', function(event) {
                event.preventDefault();

                if (currentPage == maxPages) {
                    $('#load-posts').addClass('hidden');
                    return;
                };

                var $this = $(this);

                // next page
                currentPage++;

                if ($('body').hasClass('paged')) {
                    pathname = '/';
                };

                // Load more
                var nextPage = pathname + 'page/' + currentPage + '/';

                if ($this.hasClass('step')) {
                    setTimeout(function() {
                       $this.removeClass('step');
                       step = 0;
                    }, 1000);
                };

                $.get(nextPage, function (content) {
                    step++;
                    var post = $(content).find('.post').addClass('hidden');
                    $('#content .loop').append( post );
                    $.each(post, function(index, val) {
                        var $this = $(this);
                        var id = $(this).attr('data-id');
                        $this.removeClass('hidden');
                    });
                });

            });
        };

        if (config['infinite-scroll'] && config['load-more']) {
            var checkTimer = 'on';
            if ($('#load-posts').length > 0) {
                $(window).on('scroll', function(event) {
                    var timer;
                    if (isScrolledIntoView('#load-posts') && checkTimer == 'on' && step < config['infinite-scroll-step']) {
                        $('#load-posts').click();
                        checkTimer = 'off';
                        timer = setTimeout(function() {
                            checkTimer = 'on';
                            if (step == config['infinite-scroll-step']) {
                                $('#load-posts').addClass('step');
                            };
                        }, 1000);
                    };
                });
            };
        };

    });

    // Add 'Copy to clipboard' for headings
    $('.content-inner h1, .content-inner h2, .content-inner h3, .content-inner h4, .content-inner h5, .content-inner h6').each(function(index, el) {
        var id = $(this).attr('id');
        var url = window.location.href.split(/[?#]/)[0] + '#' + id;
        $(this).prepend('<a href="#'+ id +'" class="chain" data-clipboard-text="'+ url +'" data-toggle="tooltip" data-placement="bottom" title="Copy link to clipboard."><i class="fas fa-link"></i></a>');
    });

    new ClipboardJS('.chain');

    $('.chain').each(function(index, el) {
        $(this).on('click', function(event) {
            event.preventDefault();
            $('#' + $(this).attr('aria-describedby')).find('.tooltip-inner').text('Copied!');
            $(this).tooltip('update');
        });
    });

    // Initialize Highlight.js
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    // Make share buttons sticky
    function stickyShareButtons(w){
        if (w < 576) {
            $('.content-inner .share').trigger("sticky_kit:detach");
        }else{
            $('.content-inner .share').stick_in_parent({
                offset_top: 100
            });
        }
    }
    stickyShareButtons(w);

    // Execute on scroll
    var shareHeight = $('.content-inner .share ul').height();
    if ($(this).scrollTop() > 0) {
        $('body').addClass('scroll');
    }
    $(window).on('scroll', function(event) {
        
        var checkShare = 0;
        
        $('.content-inner img').each(function(index, el) {
            var scrollTop = $(window).scrollTop();
            var elementOffset = $(this).offset().top;
            var imgDistance = (elementOffset - scrollTop);
            var imgHeight = $(this).height();
            var shareDistance = shareHeight + 100;
            if (imgDistance < shareDistance && (imgDistance + imgHeight) > 100) {
                checkShare++;
            };
        });

        if (checkShare > 0) {
            $('.content-inner .share').addClass('fade');
        }else{
            $('.content-inner .share').removeClass('fade');
        };

        if ($(this).scrollTop() > 0) {
            $('body').addClass('scroll');
        }else{
            $('body').removeClass('scroll');
        };

    });

    var imgHeight = 0;
    $('.related-posts').imagesLoaded( function() {
        $('.related-posts img').each(function(index, el) {
            if (imgHeight >= $(this).height() || imgHeight == 0) {
                imgHeight = $(this).height();
            };
        });
        $('.related-posts .img-holder').each(function(index, el) {
            $(this).height(imgHeight);
        });
    });

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    // Initialize bootstrap tootlip
    $('[data-toggle="tooltip"]').tooltip();

    // Validate subscribe form
    $(".gh-signin").validate({
        rules: {
            email: {
                required: true,
                email: true
            },
        },
        submitHandler: function (form) {
            $(".gh-signin").submit();              
        }
    });

    // Initialize shareSelectedText
    if (config['share-selected-text']) {
        shareSelectedText('.post-template .post-content', {
            sanitize: true,
            buttons: [
                'twitter',
            ],
            tooltipTimeout: 250
        });
    }; 

    // Execute on resize
    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        stickyShareButtons(w);
    });

    if ($('.error-title').length) {
        $('body').addClass('error');
    };

});