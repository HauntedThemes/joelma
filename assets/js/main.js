/**
 * Main JS file for Tawau
 */

jQuery(document).ready(function($) {

    var config = {
        'share-selected-text': true,
        'load-more': false,
        'infinite-scroll': false,
        'infinite-scroll-step': 1,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    $('.go').on('click', function(event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: $('#content').offset().top }, 600);
        return false;
    });

    var swiperIntro = new Swiper('.intro .swiper-container', {
        pagination: {
            el: '.intro .swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '">0' + (index + 1) + '</span>';
            },
        },
        // navigation: {
        //     nextEl: '.intro .swiper-button-next',
        //     prevEl: '.intro .swiper-button-prev',
        // },
        simulateTouch: false,
        // autoplay: {
        //     delay: 5000,
        //     disableOnInteraction: false
        // },
    });

    var swiperRelatedPosts = new Swiper('.related-posts .swiper-container', {
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        loopedSlides: 6,
        roundLengths: true,
        navigation: {
            nextEl: '.related-posts .swiper-button-next',
            prevEl: '.related-posts .swiper-button-prev',
        },
    });

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
    })

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments').append('<div id="disqus_thread"></div>')

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
                        $(id + ' #results ul[data-tag="'+ val.tags[0] +'"]').append('<li><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
                    }else{
                        $(id + ' #results ul[data-tag="Other"]').append('<li><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
                    };
                });

            }
        });   


        new SimpleBar($(id)[0]);
        $(id + " #search-field").focus();

    }

    $(document).on('click', function (e) {
        $('[data-toggle="popover"],[data-original-title]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false
            }

        });
    });

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        didScroll,
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

    $('.content-inner h1, .content-inner h2, .content-inner h3, .content-inner h4, .content-inner h5, .content-inner h6').each(function(index, el) {
        var id = $(this).attr('id');
        var url = window.location.href.split(/[?#]/)[0] + '#' + id;
        $(this).prepend('<a href="#'+ id +'" class="chain" data-clipboard-text="'+ url +'" data-toggle="tooltip" data-placement="bottom" title="Copy link to clipboard."><i class="fas fa-link"></i></a>');
    });

    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    $('.content-inner .share').stick_in_parent({
        offset_top: 100
    });

    var shareHeight = $('.content-inner .share ul').height();

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

    });

    var imgHeight = 0;
    $('.related-posts img').each(function(index, el) {
        if (imgHeight >= $(this).height() || imgHeight == 0) {
            imgHeight = $(this).height();
        };
    });
    $('.related-posts .img-holder').each(function(index, el) {
        $(this).height(imgHeight);
    });

    // Check if element is into view when scrolling
    function isScrolledIntoView(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    new ClipboardJS('.chain');

    $('.chain').each(function(index, el) {
        $(this).on('click', function(event) {
            event.preventDefault();
            $('#' + $(this).attr('aria-describedby')).find('.tooltip-inner').text('Copied!');
            $(this).tooltip('update');
        });
    });

    $('[data-toggle="tooltip"]').tooltip();

});