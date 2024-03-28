window.addEventListener("load", function() {
    document.querySelector(".loader-wrapper").style.display = "none";
    document.querySelector("main").style.display = "block";
});


var menu = document.querySelector('#menuicon');
menu.addEventListener('click', function() {
    var menutl = gsap.timeline();
    if (menu.classList.contains('ri-menu-line')) {
        menu.classList.remove('ri-menu-line');
        menu.classList.add('ri-close-line');
        menutl.to('.ri-close-line', {
            rotate: 270
        },"open");
        menutl.fromTo('#dropdownmenu',{
            display: 'none',
            opacity: 0,
            top: "8vh"
        
        },{
            display: 'block',
            opacity: 1,
            top: "13vh"
        },"open")
    } else if (menu.classList.contains('ri-close-line')) {
        menutl.to('.ri-close-line', {
            rotate: 0
        },"close").add(() => {
            menu.classList.remove('ri-close-line');
            menu.classList.add('ri-menu-line');
        });
        menutl.to('#dropdownmenu',{
            display: 'none',
            opacity: 0,
            top:"8vh"
        },"close")
    }
});
