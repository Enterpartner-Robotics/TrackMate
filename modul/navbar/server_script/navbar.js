$(document).ready(function () {
    const desktopNavbar = $('nav#asztal');
    const mobileNavbar = $('nav#mobil');

    const mobileMenuButton = $('#mobil-menu-gomb'); // Az SVG gomb
    const mobileMenu = $('#mobil-menu'); // A mobilmenü tartalma
    
    



    function highlightActiveMenuItem() {
        const urlParams = new URLSearchParams(window.location.search);
        const activeMenuId = urlParams.get('menu_id');
      
        $('nav a').removeClass('bg-zold-300');
        $('.profilgomblink').removeClass('bg-zold-300');
        if (activeMenuId) {
          $(`nav a[data-menu-id="${activeMenuId}"]`).addClass('bg-zold-300');
          if (activeMenuId === '102') {
            $('.profilgomblink').addClass('bg-zold-300');
        }
        }
      }

    
    $.getJSON('/modul/navbar/server_script/navbar.php', function (menuk) {
        if (menuk.menuk_tomb.length > 0) {
            desktopNavbar.empty();
            mobileNavbar.empty();
            
            menuk.menuk_tomb.forEach(function (menu) {
                
                if (desktopNavbar.length) {
                    const menuLink = $('<a>')
                        .attr('href', `#`)
                        .attr('data-menu-id', menu.id)
                        .addClass('tab text-white px-2 py-2 rounded hover:bg-zold-300 font-bold')
                        .text(menu.cim);
                    desktopNavbar.append(menuLink.clone());
                    
                }

                // Hozzáadjuk a mobil navigációhoz
                if (mobileNavbar.length) {
                    const menuLink = $('<a>')
                        .attr('href', `#`)
                        .attr('data-menu-id', menu.id)
                        .addClass('block bg-alapzold text-white hover:text-white hover:bg-zold-300 px-4 py-2 rounded-md text-sm font-bold')
                        .text(menu.cim);
                    mobileNavbar.append(menuLink.clone());
                }
            });
            highlightActiveMenuItem();
        } else {
            console.error('Nincsenek elérhető menüpontok!');
        }
        if (menuk.profil_kep_link) {
            $('#profilgomb').attr('src', menuk.profil_kep_link);
            $('#profilgomb-mobil').attr('src', menuk.profil_kep_link);
        }
    }).fail(function () {
        console.error('Hiba történt a menü betöltésekor!');
    });


    $('#kijelentkezesGomb').on('click', function (e) {
        e.preventDefault();

        // AJAX kérés POST metódussal
        $.ajax({
            url: '/modul/navbar/server_script/navbar.php',
            method: 'POST',
            data: {
                action: 'logout'
            },
            success: function (response) {

                if (response.success) {

                    // window.location.href = 'index.php';
                } else {
                    alert('Hiba történt: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Hiba történt:', error);
                alert('Nem sikerült kapcsolatot létesíteni a szerverrel.');
            }
        });
    });


    $('#profiladatok').on('click', function (e) {
        e.preventDefault();


    });
    // Menüelemek kattintásának kezelése
    $(document).on('click', 'nav a', function (e) {
        e.preventDefault();
        const menuId = $(this).data('menu-id');
        const navId = $(this).closest('nav').attr('id');

        if (menuId) {
            $.get('index.php', { menu_id: menuId, ajax: 1 }, function (data) {

                $('#content').html(data);
                

                if (navId == "mobil") {

                    mobileMenu.toggleClass('hidden');

                }
            }).fail(function () {
                console.error('Hiba történt a tartalom betöltésekor!');
            });
            const url = new URL(window.location.href);
            url.searchParams.set('menu_id', menuId);
            history.pushState({}, '', url.href);
            highlightActiveMenuItem();
            window.location.reload();
            //window.location.reload();
        } else {
            console.error('A menu_id nem található!');
        }
    });

    $(document).on('click', '#logo', function (e) {
        e.preventDefault();

        const url = new URL(window.location.href);
        url.searchParams.set('menu_id', 1);
        history.pushState({}, '', url.href);
        highlightActiveMenuItem();
        window.location.reload();
    });

    $('.profilgomblink').on('click', function (e) {
        e.preventDefault();

        // URL frissítése
        const url = new URL(window.location.href);
        url.searchParams.set('menu_id', 102);
        history.pushState({}, '', url.href);

        // Frissítjük a tartalmat az új menu_id alapján
        $.get('index.php', { menu_id: 102, ajax: 1 }, function (data) {
            $('#content').html(data);
           
            highlightActiveMenuItem();
        }).fail(function () {
            console.error('Hiba történt a tartalom betöltésekor!');
        });
    });

    // Visszalépés kezelése az előzmények között
    window.onpopstate = function () {
        const urlParams = new URLSearchParams(window.location.search);
        const menuId = urlParams.get('menu_id') || 100;
        $.get('index.php', { menu_id: menuId, ajax: 1 }, function (data) {
            $('#content').html(data);
           
            highlightActiveMenuItem();
        }).fail(function () {
            console.error('Hiba történt a visszalépés kezelésekor!');
        });
    };

    function checkVisibility() {
        if (!mobileMenuButton.is(':visible')) {
            if (!mobileMenu.hasClass('hidden')) {
                mobileMenu.addClass('hidden');
            }
        }

    }
    $(window).resize(checkVisibility);
    checkVisibility();

    $('#mobil-menu-gomb').on('click', function (e) {
        e.stopPropagation(); // Megakadályozza az esemény tovaterjedését
        mobileMenu.toggleClass('hidden').addClass('JobbrolBe'); // Menü megjelenítése vagy elrejtése
    });



    
   
    

    // Menüelemek kattintásának kezelése
    $(document).on('click', 'nav#mobil a', function (e) {
        if (menuJustOpened) {
            e.preventDefault(); // Ha most nyílt meg a menü, megakadályozzuk a kattintást
        }
    });

    // A menü elrejtése érintésen kívüli területre kattintva
    document.addEventListener('click', function (e) {
        if (!$('#mobil-menu').is(e.target) && 
            $('#mobil-menu').has(e.target).length === 0 && 
            !$('#mobil-menu-gomb').is(e.target)) {
            $('#mobil-menu').addClass('hidden').removeClass('BalrolBe');
        }
    });
    
   

    

});