$(document).ready(function() {
  console.log('script is linked')
    $('#fullpage').fullpage({
        anchors:['firstPage', 'secondPage', 'thirdPage', 'fourthPage'],
        slidesNavigation: true,
        // menu: '#myMenu'

    });
});
