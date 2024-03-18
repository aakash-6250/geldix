var menu = document.querySelector('#menuicon');
menu.addEventListener('click', function() {
    var menutl= gsap.timeline();
    if(menu.className==='ri-menu-line'){
        menutl.to('.ri-menu-line',{
            opacity:0
        })
        menutl.to('.ri-menu-line',{
            className:'ri-close-line',
            opacity:1,
            rotate:180
        })
    }
    else if(menu.className==='ri-close-line'){
        menutl.to('.ri-close-line',{
            opacity:0,
            rotate:0
        })
        menutl.to('.ri-close-line',{
            opacity:1,
            className:'ri-menu-line'
        })
    }
});