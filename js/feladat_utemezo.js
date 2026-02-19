$(document).ready(function(){
    let timer = 0;
    let isTaskActive = false;
    

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
      
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    

    function aktualis_ido_beallitas(){
        let aktiv_munkalap_nezet = getCookie('aktiv_munkalap_nezet');
        
        
        if(aktiv_munkalap_nezet === '0') {
            $('#scroll-up').removeClass('hidden');
            $('#feladat_tracker').addClass('hidden');
            return; // Kilépünk a függvényből
        }
        
        // Csak akkor futtatjuk az AJAX hívást, ha aktiv_munkalap_nezet = 1
        if(aktiv_munkalap_nezet === '1') {
            $.ajax({
                url: '/../../php/feladat_utemezo.php',
                type: 'GET',
                dataType: 'JSON',
                success: function(response) {
                    if(response.status == 'success'){
                        // Frissítsük a megjelenítést
                        $('#feladat_tracker').removeClass('hidden');
                        $('#scroll-up').addClass('hidden');
                        
                        let eltelt_ido = response.eltelt_ido;
                        let munkalap_id = response.feladat_utemezo_adat.munkalap_id;
                        let feladat_nev = response.feladat_utemezo_adat.megnevezes;
                        isTaskActive = true;
                        
                        let seconds = eltelt_ido;
                        $('#ido_ora').text(formatTime(seconds));
                        clearInterval(timer);
                        timer = setInterval(function() {
                            if (isTaskActive) {
                                seconds++;
                                $('#ido_ora').text(formatTime(seconds));
                            }
                        }, 1000);
                        $('#feladat_nev').text(feladat_nev);
                        $('#feladat_bezarasa').attr('data-munkalap-id', munkalap_id);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Hiba történt a munkalap elkezdese során:', error);
                }
            });
        }
    }
    aktualis_ido_beallitas();
    
    function ellenorizAktivFeladatot() {
        $.ajax({
            url: '/../../php/feladat_utemezo.php',
            type: 'GET',
            dataType: 'JSON',
            success: function(response) {
                let aktiv_munkalap_nezet = getCookie('aktiv_munkalap_nezet');
                
                if(response.status === 'success') {
                    // Ha van aktív feladat, de nincs cookie vagy 0-ra van állítva
                    if(!aktiv_munkalap_nezet) {
                        document.cookie = `aktiv_munkalap_nezet=1; path=/; max-age=${60*60*12}`;
                        aktualis_ido_beallitas();
                    }
                } else {
                    // Ha nincs aktív feladat, de van cookie, töröljük
                    if(aktiv_munkalap_nezet === '1') {
                        document.cookie = `aktiv_munkalap_nezet=0; path=/;`;
                        $('#feladat_tracker').addClass('hidden');
                        $('#scroll-up').removeClass('hidden');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt az aktív feladat ellenőrzése során:', error);
            }
        });
    }
    
    // Időzített ellenőrzés minden 30 másodpercben
    setInterval(ellenorizAktivFeladatot, 30000);
    ellenorizAktivFeladatot();
    // Cookie változás figyelése és lap láthatóság
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            ellenorizAktivFeladatot();
        }
    });

    
    $(document).on('click', '#scroll-up', function() {
        $(this).addClass('hidden');
        // Először állítsuk be a cookie-t
        document.cookie = `aktiv_munkalap_nezet=1; path=/; max-age=${60*60*12}`;
        aktualis_ido_beallitas();
    });
    
    $(document).on('click', '#feladat_lecsukas, #feladat_lecsukas_mobil', function() {
        $('#feladat_tracker').addClass('hidden'); 
        $('#scroll-up').removeClass('hidden');
        document.cookie = `aktiv_munkalap_nezet=0; path=/;`;
    });

    

    $(document).on('click', '#feladat_bezarasa', function() {
        clearInterval(timer); 

        
        const munkalap_id_zaras = $(this).attr('data-munkalap-id');
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_lezarasa.php',
            type: 'POST',
            data: { munkalap_id: munkalap_id_zaras },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    console.log(response.megnevezes);
                    

                    // Ellenőrzés
                    
                } 
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalap elkezdese során:', error);
            }
        });
        document.cookie = `aktiv_munkalap_nezet=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        $('#feladat_tracker').css('animation', 'slideUp 0.5s ease-out');
        $('#feladat_tracker').addClass('hidden');
    });
  
    
   

    window.addEventListener('focus', function() {
        aktualis_ido_beallitas();
    });

});
