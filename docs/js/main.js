jQuery(document).ready(function($) {

	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    $('.launch.icon.item').on('click', function(event) {
    	event.preventDefault();
    	$(this).toggleClass('active');
    });

    $('a[href*=\\#]').on('click', function(event){     
	    event.preventDefault();
	    $('html,body').animate({scrollTop:$(this.hash).offset().top}, 500);
	});
    
});