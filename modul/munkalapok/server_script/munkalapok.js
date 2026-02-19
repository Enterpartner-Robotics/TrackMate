$(document).ready(function() {
    const mobilnezet = window.innerWidth < 850;
    

    // Ablak átméretezés kezelése
    $(window).on('resize', function() {
        const ujMobilnezet = window.innerWidth < 850;
        if (ujMobilnezet !== mobilnezet) {
            location.reload();
        }
    });

    

    var kereses = $('#munkalap_kereses').val();
    socket.on('update_munkalap_chat', function (data) {
        if(data.update == 'munkalap_chat' && data.munkalap_id == $('#munkalap_id_hidden').val()){
            chat_uzenetek_betoltese(data.munkalap_id);
        }
    });
    socket.on('update_munkalap_baloldal', function (data) {
        if(data.update == 'munkalap_baloldal' && kereses == $('#munkalap_kereses').val()){
            munkalap_baloldal_betoltese(kereses);
        }
    });
    socket.on('update_munkalap_jobboldal', function (data) {
        if(data.update == 'munkalap_jobboldal' && data.munkalap_id == $('#munkalap_id_hidden').val()){
            munkalap_reszletes_betoltese(data.munkalap_id);
        }
    });
    $(window).on('resize', function() {
        const ujMobilnezet = window.innerWidth < 850;
        if (ujMobilnezet !== mobilnezet) {
            location.reload();
        }
    });
   


    var felh_akt_tomb = [];
    var chat_fajl_szamlalo = 1;
    const projekt_lista = $('#projekt_lista');
    const munkalapok_lista = $('#munkalapok_lista');
    const projekt_kereses = $('#projekt_kereses').val();

    function projekt_lista_betoltese(projekt_kereses){
        projekt_lista.empty();
        $.ajax({
            url: '/modul/munkalapok/server_script/projekt_betoltes.php',
            dataType: 'json',
            type: 'GET',
            data: { projekt_kereses: projekt_kereses },
            success: function(response) {
                
                if (response.status === 'success') {
                    
                    const projekt_adatok = response.projekt_adatok;
                    const projekt_aktivitas_adatok = response.projekt_aktivitas_adatok;
                    
                    projekt_adatok.forEach(function(projekt) {
                        //
                        let haladas_sav_szine = 'bg-alapzold'; 
                        let progressPercentage = Math.min(100, (projekt_aktivitas_adatok[projekt.projekt_id] / projekt.munkaido) * 100);
                        let progressPercentage_txt = Math.min(100, (projekt_aktivitas_adatok[projekt.projekt_id] / projekt.munkaido) * 100);
                        let hidden_progress_bar = '';
                        let hidden_progress_ido = '';
                        let formatted_teljesitett_ido = parseFloat(projekt_aktivitas_adatok[projekt.projekt_id]) || 0;
                        let hours_teljesitett_ido = Math.floor(formatted_teljesitett_ido);
                        let minutes_teljesitett_ido = Math.round((formatted_teljesitett_ido - hours_teljesitett_ido) * 60);
                        
                        if(projekt.hatarido == null){
                            projekt.hatarido = 'Nincs határidő';
                        }
                        if (projekt.allapot_nev === 'Folyamatban') {
                            haladas_sav_szine = 'bg-blue-500'; 
                        }else if (projekt.allapot_nev === 'Elkészült') {
                            haladas_sav_szine = 'bg-red-500'; 
                        }
                        
                        if(projekt_aktivitas_adatok[projekt.projekt_id] == null){
                            projekt_aktivitas_adatok[projekt.projekt_id] = 0;
                            hidden_progress_bar = 'hidden';
                            hidden_progress_ido = 'hidden';
                        }
                        if(projekt.munkaido == null){
                            projekt.munkaido = 0;
                            hidden_progress_bar = 'hidden';
                            hidden_progress_ido = 'hidden';
                        }
                        
                        if(isNaN(progressPercentage_txt)){
                            progressPercentage_txt = 0;
                            hidden_progress_bar = 'hidden';
                            hidden_progress_ido = 'hidden';
                        }
                    
                        progressPercentage_txt = Math.round(progressPercentage_txt);
                        projekt_lista.append(`
                            <div class="flex w-[98%] bg-green-100 mb-2 rounded-xl shadow-lg hover:translate-x-2 transition-transform duration-300 projekt_view" id="${projekt.projekt_id}" data-projekt_nev="${projekt.projekt_nev}">
                                
                                <div class="flex flex-col flex-grow">

                                    <div class="flex-1 p-2">
                                        <div class="flex items-center justify-between">
                                            
                                            <h2 class="text-xl font-bold text-black">${projekt.projekt_nev}</h2>
                                            <span class="text-md text-gray-500">${projekt.hatarido}</span>
                                        </div>
                                        <div>
                                            <p>${projekt.cegnev}</p>
                                        </div>
                                    </div>

                                    <div class="flex-1 p-2">
                                        <div class="flex items-center justify-between">
                                                    <p><strong>Állapot:</strong> ${projekt.allapot_nev}</p>
                                                    <p class="${hidden_progress_ido}"> ${hours_teljesitett_ido} óra ${minutes_teljesitett_ido} perc / ${projekt.munkaido} óra</p>
                                                </div>
                                                <div id="progress_bar_container" class="w-[98%] flex ${hidden_progress_bar}">
                                                <div class="w-full bg-gray-300 h-2 rounded-full my-2">
                                                    <div class="${haladas_sav_szine} h-2 rounded-full" style="width: ${progressPercentage}%;"></div>
                                                </div>
                                                <div class="text-md ml-2">
                                                    ${progressPercentage_txt}%
                                                </div>
                                        </div>
                                    </div>
                                </div>

                                
                                
                            </div>
                        `);
                    });
                
                } else {
                    console.error('Adatok betöltése sikertelen');
                }
            },
            error: function(xhr, status, error) {
                    console.error('Hiba történt a kérés során:', error);
                }
            });
    }


    
    function munkalap_baloldal_betoltese(kereses){
        $('#projektek_lista_container').addClass('hidden');
        
        $('#munkalapok_jobb_pc').addClass('hidden');
        if(!mobilnezet){
            $('#munkalap_adatok_container').removeClass('hidden');
            
        }
        if (mobilnezet && $('#munkalapok_lista_container').hasClass('hidden')){
            
        }else{
            $('#munkalapok_lista_container').removeClass('hidden');
        }
        

        munkalapok_lista.empty();
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_betoltes_baloldal.php',
            type: 'GET',
            data: { kereses: kereses },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    const munkalapok_adatok = response.munkalapok_adatok;
                   
                    let munkalap_bg_szin = '';
                    munkalapok_adatok.forEach(function(munkalap) {
                        if(munkalap.ossz_ora){
                            var ora_perc_baloldal = munkalap.ossz_ora.split(".")
                            ora_perc_baloldal[1] = Math.round(ora_perc_baloldal[1] / 10000 * 60);
                            
                        }
                        else{
                            var ora_perc_baloldal = [];
                            ora_perc_baloldal[0] = 0;
                            ora_perc_baloldal[1] = 0;
                        }
                        if(munkalap.projekt_nev == null){
                            munkalap.projekt_nev = 'Nem tartozik projekthez';
                        }
                        if(munkalap.munkaido == null){
                            munkalap.munkaido = 0;
                        }
                        if(munkalap.allapot_id == 1){
                            munkalap_bg_szin = 'bg-yellow-100';
                        }else if(munkalap.allapot_id == 2){
                            munkalap_bg_szin = 'bg-blue-100';
                        }else if(munkalap.allapot_id == 3){
                            munkalap_bg_szin = 'bg-green-100';
                        }
                        if(ora_perc_baloldal[1] == 0){
                        munkalapok_lista.append(`
                            <div class="flex w-[98%] ${munkalap_bg_szin} mb-2 rounded-xl shadow-xl munkalap_lista_sor hover:translate-x-2 transition-transform duration-300" data-munkalap_id="${munkalap.munkalap_id}">
                                <div class="flex flex-col flex-grow">
                                    <div class="flex-1 p-2">
                                        <h2 class="text-xl font-bold text-black">${munkalap.megnevezes}</h2>
                                        <p class="text-sm text-gray-500">Projekt: ${munkalap.projekt_nev}</p>
                                    </div>
                                    <div class="flex-1 p-2">
                                        <div class="flex items-center justify-between">
                                        <p><strong>Állapot:</strong> ${munkalap.allapot_nev}</p>
                                        <p> ${ora_perc_baloldal[0]} óra / ${munkalap.munkaido} óra</p>
                                        </div>
                                        
                                  </div>
                                </div>
                                 
                            </div>
                        `);
                        }
                        else{
                            munkalapok_lista.append(`
                            <div class="flex w-[98%] ${munkalap_bg_szin} mb-2 rounded-xl shadow-xl munkalap_lista_sor hover:translate-x-2 transition-transform duration-300" data-munkalap_id="${munkalap.munkalap_id}">
                                <div class="flex flex-col flex-grow">
                                    <div class="flex-1 p-2">
                                        <h2 class="text-xl font-bold text-black">${munkalap.megnevezes}</h2>
                                        <p class="text-sm text-gray-500">Projekt: ${munkalap.projekt_nev}</p>
                                    </div>
                                    <div class="flex-1 p-2">
                                        <div class="flex items-center justify-between">
                                        <p><strong>Állapot:</strong> ${munkalap.allapot_nev}</p>
                                        <p> ${ora_perc_baloldal[0]} óra ${ora_perc_baloldal[1]} perc / ${munkalap.munkaido} óra</p>
                                        </div>
                                        
                                  </div>
                                </div>
                                 
                            </div>
                            `);
                        }
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalapok betöltése során:', error);
            }
        });
    }




    munkalap_baloldal_betoltese(kereses);

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function munkalap_reszletes_betoltese(munkalap_id){
        $('#chat_form')[0].reset();
        $('#uploadedFilesContainer').empty();
        chat_fajl_szamlalo = 0;
        $('#munkalap_id_hidden').val(munkalap_id);
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_reszletes_betoltese.php',
            type: 'GET',
            data: { munkalap_id: munkalap_id },
            dataType: 'JSON',
            success: function(response) {
                $('#munkalap_tartalom').removeClass('hidden');
                $('#munkalap_nev_chat').text(response.megnevezes + ' Chat (ID: ' + response.munkalap_id + ')');
                $('#chat_textarea').attr('data-munkalap-id', response.munkalap_id);
                $('#aru_hozzaadas_vegleges_gomb').attr('data-munkalap-id', response.munkalap_id);
                $('#tipus_megadas_lista').attr('data-munkalap-id', response.munkalap_id);
                $('#munkalap_nev').text(response.megnevezes + ' (ID: ' + response.munkalap_id + ')');
                $('#pinek_megjelenites').attr('data-munkalap-id', response.munkalap_id);
                $('#pinek_megjelenites_mobil').attr('data-munkalap-id', response.munkalap_id);
                $('#chat_tipus_szuro').attr('data-munkalap-id', response.munkalap_id);

                if(response.projekt_nev == null){
                    response.projekt_nev = 'Nem tartozik projekthez';
                    $('#projekt_nev').text(response.projekt_nev);
                }else{
                    $('#projekt_nev').text("Projekt neve: " + response.projekt_nev);
                }
                
                $('#felvet_datum').text(response.datum);
                if(response.specifikacio_file){
                    $('#munkalap_specifikacio').html(`Specifikáció: <a href="${response.specifikacio_file}" target="_blank"><img src="assets/png_icon.png" alt="spec" class="w-8 h-8"></a>`);
                }
                else{
                    $('#munkalap_specifikacio').html("");
                }
                if(response.munkaido == null){
                    response.munkaido = 0;
                }
                $('#feladat_kezd').attr('data-munkalap-id', response.munkalap_id);
                $('#feladat_vege').attr('data-munkalap-id', response.munkalap_id);
                $('#feladat_ujrainditas').attr('data-munkalap-id', response.munkalap_id);
                if(response.allapot_id == 1){
                    $('#feladat_kezd').show();
                    $('#feladat_vege').hide();
                    $('#feladat_ujrainditas').hide();
                }
                else if(response.allapot_id == 2){
                    $('#feladat_kezd').show();
                    $('#feladat_vege').show();
                    $('#feladat_ujrainditas').hide();
                }
                else if(response.allapot_id == 3){
                    $('#feladat_kezd').hide();
                    $('#feladat_vege').hide();
                    var felh_jog = $('#felh_jog').val();
                    if(felh_jog == 1){
                        $('#feladat_ujrainditas').show();
                    }
                }
                // Számítsd ki a progress értékeket
                let ossz_ora = parseFloat(response.ossz_ora) || 0;
                let munkaido = parseFloat(response.munkaido) || 1; // elkerülve a 0-val való osztást
                // Órák és percek kiszámolása

                let hours = Math.floor(ossz_ora);
                let minutes = Math.round((ossz_ora - hours) * 60);
                if(minutes == 0){
                    $('#orak_szama').text(`${hours} óra / ${response.munkaido} óra`);
                }
                else{
                    $('#orak_szama').text(`${hours} óra ${minutes} perc / ${response.munkaido} óra`);
                }
                if(response.felh_akt && response.felh_akt.length > 0){
                    $('#munkalap_tartalom').removeClass('h-[calc(100vh-18rem)]');
                    $('#munkalap_tartalom').addClass('h-[calc(100vh-21rem)]');
                    felh_akt_tomb = response.felh_akt;
                    let displayedCount = 3; // Number of items to display initially
                    let totalCount = response.felh_akt.length; // Total items
                    let gridHtml = '';
                    if(mobilnezet){
                        if(totalCount > displayedCount){
                            gridHtml = `<div id="orak_felh_sor" class="flex -space-x-2"> `;
                        }else{
                            gridHtml = `<div id="orak_felh_sor" class="flex space-x-2"> `;
                        }
                    }else{
                        gridHtml = `<div id="orak_felh_sor" class="grid grid-cols-4 gap-4">`;
                    }   
                    // Loop through the first 3 items
                    $.each(response.felh_akt.slice(0, displayedCount), function(index, item){
                        let munkaido_felh = parseFloat(item.munkaido_felh) || 0;
                        let hours_felh = Math.floor(munkaido_felh);
                        let minutes_felh = Math.round((munkaido_felh - hours_felh) * 60);
                        if (!mobilnezet){
                            if(minutes_felh == 0){
                                gridHtml += `
                                <div class="flex items-center space-x-2 p-2">
                                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                                    <div>
                                        <span class="font-bold">${item.felh_nev}</span>
                                        <span class="">${hours_felh} óra</span>
                                    </div>
                                </div>
                            `;
                            }
                            else{
                                gridHtml += `
                                <div class="flex items-center space-x-2 p-2">
                                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                                    <div>
                                        <span class="font-bold">${item.felh_nev}</span>
                                        <span class="">${hours_felh} óra ${minutes_felh} perc</span>
                                    </div>
                                </div>
                                `;
                            }
                        }
                    });

                    
                    if (mobilnezet){
                        $('#orak_felh_lista').empty();
                    $.each(response.felh_akt, function(index, item){
                        let munkaido_felh = parseFloat(item.munkaido_felh) || 0;
                        let hours_felh = Math.floor(munkaido_felh);
                        let minutes_felh = Math.round((munkaido_felh - hours_felh) * 60);
                        let displayedCount = 3; // Number of items to display initially
                        let totalCount = response.felh_akt.length; // Total items
                        if(item.munkaido_felh > 0){
                            
                            $('#orak_felh_lista').append(`
                                <div class="flex items-center justify-between p-2 border-b border-gray-200">
                                    <div class="flex items-center space-x-3">
                                        <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-10 h-10 rounded-full">
                                        <span class="font-bold">${item.felh_nev}</span>
                                    </div>
                                    <div class="text-right">
                                       <span class="">${hours_felh} óra ${minutes_felh} perc</span>
                                    </div>
                                </div>
                            `);
                        }

                        if (totalCount > displayedCount) {
                           
                            gridHtml += `
                            <div class="flex items-center -space-x-2">
                                <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                                
                            </div>
                            `;
                            
                        }else{
                            gridHtml += `
                            <div class="flex items-center space-x-2 p-2">
                                <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                                <div>
                                        <span class="font-bold">${item.felh_nev}</span>

                                    </div>
                            </div>
                            `;
                        }
                    });
                    }
                    $('#orak_felh').html(gridHtml);
                    // Check if there are more items to show
                    if (totalCount > displayedCount) {
                        $('#orak_felh_sor').append(`
                            <div id="mutass_tobbet" class="flex items-center space-x-2 md:block hidden">
                                <button class="bg-alapzold text-white py-2 px-4 rounded-md hover:bg-zold-300">Mutass többet</button>
                            </div>
                        `);
                    }
                } else {
                    $('#orak_felh').html("");
                    $('#munkalap_tartalom').removeClass('h-[calc(100vh-21rem)]');
                    $('#munkalap_tartalom').addClass('h-[calc(100vh-18rem)]');
                }
                
                // Százalékos arány számítása
                let progressPercentage = Math.min(100, (ossz_ora / munkaido) * 100);
                let progressPercentage_txt = Math.min(100, (ossz_ora / munkaido) * 100);
                progressPercentage_txt = Math.round(progressPercentage_txt);

                // Töröljük a #valami divben lévő progress bar konténert (ha van)
                $('#vonal').empty();
                // Illesszük be a progress bar-t a #valami div végére, hogy az kitöltse a teljes szélességet
                $('#vonal').append(`
                    <div id="progress_bar_container" class="w-[98%] flex">
                        <div class="w-full bg-gray-300 h-2 rounded-full my-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${progressPercentage}%;"></div>
                        </div>
                        <div class="text-md ml-2">
                            ${progressPercentage_txt}%
                        </div>
                    </div>
                `);
                chat_uzenetek_betoltese(munkalap_id, true);
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalap reszletes betoltese során:', error);
            }
        });
    
    }

    const utolso_munkalap_id = getCookie('utolso_munkalap_id');
    if(utolso_munkalap_id){
        munkalap_reszletes_betoltese(utolso_munkalap_id);
    } 


    if (mobilnezet) {
        // Bal oldali konténerek teljes szélességűre állítása
        $('#projektek_lista_container').addClass('w-full').removeClass('w-1/3');
        $('#munkalapok_lista_container').addClass('w-full').removeClass('w-1/3');
        $('#munkalapok_jobb_pc').addClass('hidden');

        $(document).on('click', '#munkalap_vissza', function(){
            $('#munkalap_adatok_container').addClass('hidden');
            $('#munkalapok_lista_container').removeClass('hidden');
        });
        $(document).on('click', '#orak_felh', function(){
            
            $('#mobil_orak_felh').removeClass('hidden');
           
        });
        $(document).on('click', '#orak_felh_mobil_gomb', function(){
            $('#mobil_orak_felh').addClass('hidden');
        });

       
        // Keresőmezők átrendezése
        $('.flex.justify-between.items-center.p-2').each(function() {
            
            $(this).find('.pr-2').removeClass('pr-2').addClass('w-full');
            $(this).find('input[type="text"]').addClass('w-full');
        });

        let isFullScreen = false;
    
            $(document).on('click', '#munkalap_chat_nagyitas_mobil', function() {
                if (!isFullScreen) {
                    // Teljes képernyős nézet
                    $('#munkalap_tartalom').removeClass('h-[calc(100vh-21rem)]')
                        .addClass('fixed bottom-0 left-0 w-full h-[calc(100vh-4rem)] z-50 rounded-none');
                    
                    // Chat container igazítása
                    $('#chat_uzenetek_container').addClass('h-[calc(100vh-12rem)]');
                    
                    // Nagyítás ikon forgatása
                    $(this).addClass('rotate-180');
                    $('#munkalap_chat_header').removeClass('rounded-t-lg');
                    
                    isFullScreen = true;
                } else {
                    // Visszaállítás eredeti méretre
                    $('#munkalap_tartalom').addClass('h-[calc(100vh-21rem)]')
                        .removeClass('fixed bottom-0 left-0 w-full h-[calc(100vh-4rem)] z-50 rounded-none');
                    
                    // Chat container visszaállítása
                    $('#chat_uzenetek_container').removeClass('h-[calc(100vh-12rem)]');
                    
                    // Nagyítás ikon visszaforgatása
                    $(this).removeClass('rotate-180');
                    $('#munkalap_chat_header').addClass('rounded-t-lg');
                    isFullScreen = false;
                }
             });
       




             $(document).on('click', '#pinek_megjelenites_mobil', function(){
                var munkalap_id = $(this).attr('data-munkalap-id');
                $('#pinelt_uzenetek_lista').empty();
                $.ajax({
                    url: '/modul/munkalapok/server_script/pinelt_uzenetek_betoltese.php',
                    type: 'POST',
                    data: {munkalap_id: munkalap_id},
                    dataType: 'JSON',
                    success: function(response){
                        if(response.length > 0){
                        response.forEach(function(uzenet){
                            var mai_nap = new Date();
                            var ev = mai_nap.getFullYear();
                            var honap = ('0' + (mai_nap.getMonth() + 1)).slice(-2);
                            var nap = ('0' + mai_nap.getDate()).slice(-2);
                            var mai_datum = ev + '-' + honap + '-' + nap;
                            var uzenet_datum = uzenet.datum.split(' ')[0];
                            if(mai_datum == uzenet_datum){
                                var uzenet_ora = uzenet.datum.split(' ')[1];
                                uzenet_datum = uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                            }
                            else{
                                var uzenet_ora = uzenet.datum.split(' ')[1];
                                uzenet_datum = uzenet_datum + ' ' + uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                            }
        
                            if(uzenet.sajat_uzenet){
                                var uzenet_oszlop = 'bg-green-100';
                            }
                            else{
                                var uzenet_oszlop = 'bg-gray-100';
                            }
                            if(uzenet.tipus_id == 2){
                                var uzenet_oszlop = 'bg-blue-100';
                            }
                            else if(uzenet.tipus_id == 3){
                                var uzenet_oszlop = 'bg-orange-100';
                            }
                            let formazott_megjegyzes = '';
                            if(uzenet.felh_id == 0){
                                formazott_megjegyzes = uzenet.megjegyzes.replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            else{
                                formazott_megjegyzes = escapeHtml(uzenet.megjegyzes).replace(/(?:\r\n|\r|\n)/g, '<br>');
                            }
                            $('#pinelt_uzenetek_lista').append(`
                            <div class="flex items-start gap-2.5 group mb-4">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                            <img 
                                            src="${uzenet.profil_kep_link}" 
                                            alt="Profil kép" 
                                            class="w-10 h-10 rounded-full"
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="flex flex-col max-w-[70%]">
                                        <span class="text-sm font-medium text-gray-700 mb-1">${uzenet.teljes_nev}</span>
                                        <div class="${uzenet_oszlop} rounded-lg p-3 relative">
                                            <p class="text-sm text-gray-800">${formazott_megjegyzes}</p>
                                            <span class="text-xs text-gray-500 mt-1 block">${uzenet_datum}</span>
                                            <div id="chat_pinelt_uzenet_fajlok_${uzenet.bejegyzes_id}"></div>
                                        </div>
                                    </div>
                            </div>
                            `);
                            if(uzenet.fajlok){
                                $.each(uzenet.fajlok, function(index, item){
                                    if(item.file_link){
                                        var file_name = item.file_link.split('/').pop();
                                        $("#chat_pinelt_uzenet_fajlok_"+uzenet.bejegyzes_id).append(`
                                            <div class="flex items-center gap-2 mt-2 file_delete_icon_container">
                                                <a href="${item.file_link}" class="text-zold-500 hover:text-zold-300 flex items-center gap-2 text-sm" target="_blank"><img src="assets/png_icon.png" alt="${file_name}" class="w-8 h-8">${file_name}</a>
                                                <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hidden file_delete_icon" data-file-id="${item.file_id}" data-bejegyzes-id="${uzenet.bejegyzes_id}" data-munkalap-id="${uzenet.munkalap_id}">
                                            </div>
                                        `);
                                    }
                                });
                            }
                            });
                            $('#pinelt_uzenetek_lista').scrollTop($('#pinelt_uzenetek_lista')[0].scrollHeight);
                        }
                        else{
                            $('#pinelt_uzenetek_lista').append(`
                            <div class="text-center text-gray-500 text-xl mt-2">Nincs pinelt üzenet</div>
                            `);
                        }
                    },
                    error: function(xhr, status, error){
                        console.error('Hiba történt a pinelt üzenetek betöltése során:', error);
                    }
                });
                $('#pinelt_uzenetek').removeClass('hidden');
            });
            $(document).on('click', '#pinelt_uzenetek_bezaras', function(){
                $('#pinelt_uzenetek').addClass('hidden');
            });
    }



    $(document).on('click', '#projektek_listazasa', function() {
        $('#projektek_lista_container').removeClass('hidden');
        $('#munkalapok_lista_container').addClass('hidden');
        if(!mobilnezet){
            $('#munkalapok_jobb_pc').removeClass('hidden');
        }

        $('#munkalap_adatok_container').addClass('hidden');

        projekt_lista_betoltese(projekt_kereses);
    });

    $(document).on('click', '#munkalapok_listazasa', function() {
        $('#projektek_lista_container').addClass('hidden');
        $('#munkalapok_lista_container').removeClass('hidden');
        if(!mobilnezet){
            $('#munkalapok_jobb_pc').addClass('hidden');
            $('#munkalap_adatok_container').removeClass('hidden');
        }
        
        
        munkalap_baloldal_betoltese(kereses);
        
    });





    $(document).on('click', '.projekt_view', function() {
        const projekt_id = $(this).attr('id');
        const projekt_nev = $(this).data('projekt_nev');
        if(!mobilnezet){
            $('#munkalapok_jobb_pc_cim').html('<span class="font-bold">'+projekt_nev+'</span> Munkalapjai');
        }
        else {
            $('#projekt_munkalapok_mobil').removeClass('hidden');
            $('#projekt_munkalapok_mobil_cim').html('<span class="font-bold">'+projekt_nev+'</span> Munkalapjai');
        }
    
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_betoltes.php',
            type: 'GET',
            data: { projekt_id: projekt_id },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {

                    const munkalap_adatok = response.munkalap_adatok;

                    if(mobilnezet) {
                        
                        $('#projektek_lista_container').addClass('hidden');

                        let inditas_alatt_count = 0;
                        let folyamatban_count = 0;
                        let lezart_count = 0;

                    
                        munkalap_adatok.forEach(function(munkalap) {
                            if (munkalap.allapot_id == 1) {
                                inditas_alatt_count++;
                            } else if (munkalap.allapot_id == 2) {
                                folyamatban_count++;
                            } else if (munkalap.allapot_id == 3) {
                                lezart_count++;
                            }
                        });
                        
                        $('#inditas_alatt_munkalapok_mobil, #folyamatban_munkalapok_mobil, #lezart_munkalapok_mobil').empty();
                        $('#ures_inditas_alatt_munkalapok_mobil, #ures_folyamatban_munkalapok_mobil, #ures_lezart_munkalapok_mobil').removeClass('hidden');
                        
                        munkalap_adatok.forEach(function(munkalap) {
                            const munkalapHTML = `
                                <div class="bg-white rounded-lg shadow-md p-4 munkalap_view" data-munkalap_id="${munkalap.munkalap_id}">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium text-gray-800">${munkalap.megnevezes}</span>
                                        <span class="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">${munkalap.munkaido} óra</span>
                                    </div>
                                    <button class="w-[30%] bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-2" id="munkalap_elkezdese">
                                        Elkezdés
                                    </button>
                                </div>
                            `;
    
                            if (munkalap.allapot_id == 1 && inditas_alatt_count > 0) {
                                $('#ures_inditas_alatt_munkalapok_mobil').addClass('hidden');
                                $('#inditas_alatt_munkalapok_mobil').append(munkalapHTML);
                               
                            } 
                            else if (munkalap.allapot_id == 2 && folyamatban_count > 0) {
                                $('#ures_folyamatban_munkalapok_mobil').addClass('hidden');
                                $('#folyamatban_munkalapok_mobil').append(munkalapHTML);
                                
                            } 
                            else if (munkalap.allapot_id == 3) {
                                if (lezart_count > 0) {
                                    $('#lezart_munkalapok_mobil').append(munkalapHTML);
                                   
                                    
                                }
                                
                            }
                        });
                    } else {
                    console.log(munkalap_adatok);
                    $('#folyamatban_munkalapok').empty().removeClass('bg-blue-100 rounded-lg p-2');
                    $('#inditas_alatt_munkalapok').empty().removeClass('bg-yellow-100  rounded-lg p-2');
                    $('#lezart_munkalapok').empty().removeClass('bg-green-100  rounded-lg p-2');
                    $('#ures_folyamatban_munkalapok').removeClass('hidden');
                    $('#ures_lezart_munkalapok').removeClass('hidden');
                    $('#ures_inditas_alatt_munkalapok').removeClass('hidden');
                    
                    munkalap_adatok.forEach(function(munkalap) {
                        let allapot_id = munkalap.allapot_id;
                        if (allapot_id == 1) {
                        $('#ures_inditas_alatt_munkalapok').addClass('hidden');
                        $('#inditas_alatt_munkalapok').addClass('bg-yellow-100  rounded-lg p-2');
                        $('#inditas_alatt_munkalapok').append(`
                            <div class="bg-white w-full rounded-lg shadow-md p-2 flex flex-col mb-2 munkalap_view hover:translate-x-2 transition-transform duration-300" data-munkalap_id="${munkalap.munkalap_id}">
                            <div class="flex justify-between items-start mb-4">
                                <span class="font-medium text-gray-800">${munkalap.megnevezes}</span>
                                <span class="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">${munkalap.munkaido} óra</span>
                            </div>
                            <div>
                                <input type="hidden" id="munkalap_id" value="${munkalap.munkalap_id}">
                                <button class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" id="munkalap_elkezdese">
                                    Elkezdés
                                </button>
                                
                            </div>
                        </div>
                         `);
                        }
                        else if (allapot_id == 2) {
                            $('#ures_folyamatban_munkalapok').addClass('hidden');
                            $('#folyamatban_munkalapok').addClass('bg-blue-100 rounded-lg p-2');
                            $('#folyamatban_munkalapok').append(`
                            <div class="bg-white w-full rounded-lg shadow-md p-2 flex flex-col mb-2 munkalap_view hover:translate-x-2 transition-transform duration-300" data-munkalap_id="${munkalap.munkalap_id}">
                                <div class="flex justify-between items-start mb-4">
                                    <span class="font-medium text-gray-800">${munkalap.megnevezes}</span>
                                    <span class="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">${munkalap.munkaido} óra</span>
                                </div>
                                <div>
                                    <input type="hidden" id="munkalap_id" value="${munkalap.munkalap_id}">
                                    <button class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" id="munkalap_elkezdese">
                                        Elkezdés
                                    </button>
                                    
                                </div>
                            </div>

                            `);
                        } else if (allapot_id == 3) {
                            $('#ures_lezart_munkalapok').addClass('hidden');
                            $('#lezart_munkalapok').addClass('bg-green-100  rounded-lg p-2');
                            $('#lezart_munkalapok').append(`
                             <div class="bg-white w-full rounded-lg shadow-md p-2 flex flex-col mb-2 munkalap_view hover:translate-x-2 transition-transform duration-300" data-munkalap_id="${munkalap.munkalap_id}">
                                <div class="flex justify-between items-start mb-4">
                                    <span class="font-medium text-gray-800">${munkalap.megnevezes}</span>
                                    <span class="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">${munkalap.munkaido} óra</span>
                                </div>
                                <div>
                                    <input type="hidden" id="munkalap_id" value="${munkalap.munkalap_id}">
                                    <button class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" id="munkalap_elkezdese">
                                        Elkezdés
                                    </button>
                                    
                                </div>
                            </div>

                        `);
                        }
                    });
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalapok lekérése során:', error);
            }
        });

    });

    

    
    $(document).on('click', '#projekt_munkalapok_mobil_bezar', function() {
        $('#projekt_munkalapok_mobil').addClass('hidden');
    });
      
      
      

    //toroltem a timert
    
    let seconds = 0; // Time in seconds
    let isTaskActive = false;

    function formatTime(seconds) {
        const hours_formatter = Math.floor(seconds / 3600);
        const minutes_formatter = Math.floor((seconds % 3600) / 60);
        const remainingSeconds_formatter = seconds % 60;

        return `${String(hours_formatter).padStart(2, '0')}:${String(minutes_formatter).padStart(2, '0')}:${String(remainingSeconds_formatter).padStart(2, '0')}`;
    }

    

  

     
    $(document).on('click', '#munkalap_elkezdese', function(event) {
        event.stopPropagation();
        const munkalap_id = $(this).closest('.flex').find('#munkalap_id').val();
        
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_elkezdese.php',
            type: 'POST',
            data: { munkalap_id: munkalap_id },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    $('#feladat_nev').text(response.megnevezes);
                    $('#feladat_bezarasa').attr('data-munkalap-id', response.munkalap_id);
                    $('#feladat_tracker').removeClass('hidden');
                    $('#feladat_tracker').css('animation', 'slideDown 0.5s ease-out');
                    
                    isTaskActive = true;
                    seconds = 0; 
                    timer = setInterval(function() {
                    if (isTaskActive) {
                        seconds++;
                        $('#ido_ora').text(formatTime(seconds));
                    }
                    }, 1000); 

                    
                   
                    
                    
                    document.cookie = `aktiv_munkalap_nezet=1; path=/; max-age=${60*60*12}`;


                }
                else{
                    $('#feladat_alert').html(response.message);
                    $("#feladat_alert").show().delay(5000).fadeOut(500);
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalap elkezdese során:', error);
            }
        });
        

    });
    $(document).on('click', '#feladat_kezd', function() {
        const munkalap_id = $(this).attr('data-munkalap-id');
        
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_elkezdese.php',
            type: 'POST',
            data: { munkalap_id: munkalap_id },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    $('#feladat_nev').text(response.megnevezes);
                    $('#feladat_bezarasa').attr('data-munkalap-id', response.munkalap_id);
                    $('#feladat_tracker').removeClass('hidden');
                    $('#feladat_tracker').css('animation', 'slideDown 0.5s ease-out');
                    $('#feladat_vege').hide();
                    $('#feladat_kezd').hide();
                    isTaskActive = true;
                    seconds = 0; 
                    timer = setInterval(function() {
                    if (isTaskActive) {
                        seconds++;
                        $('#ido_ora').text(formatTime(seconds));
                    }
                    }, 1000);

                    document.cookie = `aktiv_munkalap_nezet=1; path=/; max-age=${60*60*12}`;
                    
                    


                }
                else{
                    $('#feladat_alert').html(response.message);
                    $("#feladat_alert").show().delay(2000).fadeOut(500);
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalap elkezdese során:', error);
            }
        });
    });

    $(document).on('click', '#feladat_vege', function() {
        const munkalap_id = $(this).attr('data-munkalap-id');
        if(mobilnezet){
            $('#munkalapok_lista_container').addClass('hidden');
            
        }
        
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_vege.php',
            type: 'POST',
            data: { munkalap_id: munkalap_id },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    $('#feladat_tracker').addClass('hidden');
                    isTaskActive = false;
                    seconds = 0; 
                    timer = 0;

                    document.cookie = `aktiv_munkalap_nezet=; path=/; max-age=0`;
                    $('#feladat_vege').hide();
                    $('#feladat_kezd').hide();
                    var felh_jog = $('#felh_jog').val();
                    if(felh_jog == 1){
                        $('#feladat_ujrainditas').show();
                    }
                }
                else{
                    $('#munkalap_nem_lezarhato_alert').html(response.teljes_nev+' még dolgozik a munkalapon, ezért nem lehet lezárni.');
                    $("#munkalap_nem_lezarhato_alert").show().delay(2000).fadeOut(300);
                }
            }
        });
    });

    $(document).on('click', '#feladat_ujrainditas', function() {
        const munkalap_id = $(this).attr('data-munkalap-id');
        $.ajax({
            url: '/modul/munkalapok/server_script/munkalap_ujrainditas.php',
            type: 'POST',
            data: { munkalap_id: munkalap_id },
            dataType: 'JSON',
            success: function(response) {
                if (response.status === 'success') {
                    $('#feladat_vege').hide();
                    $('#feladat_kezd').show();
                    $('#feladat_ujrainditas').hide();
                }
            }
        });

    });
    

    $(document).on('input', '#munkalap_kereses', function() {
        const kereses = $(this).val();
        munkalap_baloldal_betoltese(kereses);
    });
    $(document).on('input', '#projekt_kereses', function() {
        const projekt_kereses = $(this).val();
        projekt_lista_betoltese(projekt_kereses);
    });
    $(document).on('click', '.munkalap_lista_sor', function() {
        const munkalap_id = $(this).data('munkalap_id');
        if(!mobilnezet){
            document.cookie = `utolso_munkalap_id=${munkalap_id}; path=/; max-age=${30*24*60*60}`;
        }else{
            $('#munkalap_adatok_container').removeClass('hidden');
            $('#munkalapok_lista_container').addClass('hidden');
        }
        munkalap_reszletes_betoltese(munkalap_id);
       
    });
    $(document).on('click', '.munkalap_view', function() {
        
        const munkalap_id = $(this).data('munkalap_id');
        
        if(!mobilnezet){
            document.cookie = `utolso_munkalap_id=${munkalap_id}; path=/; max-age=${30*24*60*60}`;
            $('#munkalapok_lista_container').removeClass('hidden');
        }
        $('#projektek_lista_container').addClass('hidden');
        
        $('#munkalapok_jobb_pc').addClass('hidden');
        $('#munkalap_adatok_container').removeClass('hidden');
        if(mobilnezet){
            $('#projekt_munkalapok_mobil').addClass('hidden');
        }
        munkalap_reszletes_betoltese(munkalap_id);
    });

    // Handle "Show More" button click
    $(document).on('click', '#mutass_tobbet button', function() {
        // Show all remaining items
        let remainingItemsHtml = '';
        felh_akt_tobb = felh_akt_tomb.slice(3);
        $.each(felh_akt_tobb, function(index, item) { // Show all items
            let munkaido_felh = parseFloat(item.munkaido_felh) || 0;
            let hours_felh = Math.floor(munkaido_felh);
            let minutes_felh = Math.round((munkaido_felh - hours_felh) * 60);
            if(minutes_felh == 0){
            remainingItemsHtml += `
                <div class="flex items-center space-x-2 p-2">
                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                    <div>
                        <span class="font-bold">${item.felh_nev}</span>
                        <span class="">${hours_felh} óra</span>
                    </div>
                </div>
            `;
            }
            else{
                remainingItemsHtml += `
                <div class="flex items-center space-x-2 p-2">
                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                    <div>
                        <span class="font-bold">${item.felh_nev}</span>
                        <span class="">${hours_felh} óra ${minutes_felh} perc</span>
                    </div>
                </div>
                `;
            }
        });
        $('#orak_felh_sor').append(remainingItemsHtml);
        $('#mutass_tobbet').remove(); // Remove the button after showing all items

        // Add the "Mutass kevesebbet" button
        $('#orak_felh_sor').append(`
            <div id="mutass_kevesebbet" class="flex items-center space-x-2">
                <button class="bg-alapzold text-white py-2 px-4 rounded-md hover:bg-zold-300">Mutass kevesebbet</button>
            </div>
        `);
    });

    // Handle "Show Less" button click
    $(document).on('click', '#mutass_kevesebbet button', function() {
        // Clear the current display
        $('#orak_felh_sor').empty();

        // Re-display the first 3 items
        let displayedCount = 3; // Number of items to display initially
        let gridHtml = `<div id="orak_felh_sor" class="grid grid-cols-4 gap-4">`;

        // Loop through the first 3 items
        $.each(felh_akt_tomb.slice(0, displayedCount), function(index, item) {
            let munkaido_felh = parseFloat(item.munkaido_felh) || 0;
            let hours_felh = Math.floor(munkaido_felh);
            let minutes_felh = Math.round((munkaido_felh - hours_felh) * 60);
            if(minutes_felh == 0){
                gridHtml += `
                <div class="flex items-center space-x-2 p-2">
                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                    <div>
                        <span class="font-bold">${item.felh_nev}</span>
                        <span class="">${hours_felh} óra</span>
                    </div>
                </div>
            `;
            }
            else{
                gridHtml += `
                <div class="flex items-center space-x-2 p-2">
                    <img src="${item.profil_kep_link}" alt="${item.felh_nev}" class="w-8 h-8 rounded-full">
                    <div>
                        <span class="font-bold">${item.felh_nev}</span>
                        <span class="">${hours_felh} óra ${minutes_felh} perc</span>
                    </div>
                </div>
                `;
            }
        });

        // Check if there are more items to show
        if (felh_akt_tomb.length > displayedCount) {
            gridHtml += `
                <div id="mutass_tobbet" class="flex items-center space-x-2">
                    <button class="bg-alapzold text-white py-2 px-4 rounded-md hover:bg-zold-300">Mutass többet</button>
                </div>
            `;
        }

        gridHtml += `</div>`;
        $('#orak_felh').html(gridHtml);
    });
    //##################dialogok nyitása és bezarása########################
    var felh_jog = $('#felh_jog').val();
    if(felh_jog != 1)
    {
        $('.munkalap_inditas').addClass('hidden');
    }
    $(document).on('click', '#munkalap_inditas', function() {
        $('#munkalap_inditas_modal').removeClass("hidden");
        $.ajax({
            url: '/modul/projektek/server_script/jog_csoportok.php',
            type: 'POST',
            dataType: 'json',
            success: function(response){
                var check_box_string = "";
                if (response.length > 0) {
                    response.forEach(function (item){
                        check_box_string += `
                        <div class='mb-2'>
                            <input type='checkbox' id='jog_csoport_${item.jogosultsag_id}' name='jog_csoport_${item.jogosultsag_id}' value='${item.jogosultsag_id}' class="mr-2">
                            <label for='jog_csoport_${item.jogosultsag_id}'>${item.jogosultsag_nev}</label>
                        </div>`;
                    });
                }
                $("#jog_csoportok").html(check_box_string);
            },
            error: function(xhr, status, error){
                console.error("Hiba történt:", error);
            }
        });
    });
    $(document).on('click', '#munkalap_inditas_bezaras', function() {
        $('#munkalap_inditas_modal').addClass("hidden");
        $('#munkalap_inditas_form')[0].reset();
    });
    //##################dialogok nyitása és bezarása vége########################






    //##################formázások########################
    $('.harmas_tagolas').on('input', function(){
        // Csak a számjegyek megtartása (a nem számjegyek eltávolítása)
        var rawValue = $(this).val().replace(/\D/g, '');
        $(this).val(rawValue);
        // Ha van érték, akkor formázás: hármas tagolás szóközzel
        if (rawValue.length > 0) {
        // A regex a megfelelő pozíciókban beszúrja a szóközt
        var formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        $(this).val(formattedValue);
    }});
    $(document).on('input', '.koltseg_input', function() {
        var szoftverkoltseg = $('#szoftverkoltseg').val();
        var hardverkoltseg = $('#hardverkoltseg').val();
        if (szoftverkoltseg == '') {
            szoftverkoltseg = '0';
        }
        if (hardverkoltseg == '') {
            hardverkoltseg = '0';
        }
        szoftverkoltseg = szoftverkoltseg.replace(/\s/g, '');
        hardverkoltseg = hardverkoltseg.replace(/\s/g, '');
        var osszkoltseg = parseInt(szoftverkoltseg) + parseInt(hardverkoltseg);
        osszkoltseg = osszkoltseg.toString();
        var harmas_osszkoltseg = osszkoltseg.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        if (harmas_osszkoltseg == '0') {
            $('#osszkoltseg').val('');
            $('#osszkoltseg_hidden').val(''); // Clear hidden input
        } else {
            $('#osszkoltseg').val(harmas_osszkoltseg);
            $('#osszkoltseg_hidden').val(osszkoltseg); // Set hidden input
        }
    });
    //##################formázások vége########################







    //##################autocomplete########################
    $(document).on('input', '#projekt_nev', function () {
        var query = $(this).val().trim();
        var results = $(this).siblings('.autocomplete-results'); // KERESÉS: Nem .next(), hanem .siblings()
    
        if (query.length < 1) {
            results.empty().addClass('hidden');
            return;
        }
    
        $.ajax({
            url: '/modul/munkalapok/server_script/ac_projekt_lista.php',
            method: 'GET',
            data: { term: query },
            dataType: 'json',
            success: function (response) {
                results.empty().removeClass('hidden');
    
                if (response.projekt_adatok.length > 0) {
                    response.projekt_adatok.forEach(function (item) {
                        var listItem = $('<li></li>')
                            .addClass("px-4 py-2 hover:bg-zold-100 cursor-pointer")
                            .attr("data-value", item.projekt_id)
                            .text(item.projekt_nev);
    
                        results.append(listItem);
                    });
    
                    results.removeClass('hidden'); // Biztosan látható legyen
                } else {
                    results.addClass('hidden');
                }
            },
            error: function (err) {
                console.error('Hiba az autocomplete kérés során:', err);
            }
        });
    });
    
    $(document).on('click', '.autocomplete-results li', function () {
        var selectedValue = $(this).data('value');
        var selectedText = $(this).text();
    
        var inputField = $(this).closest('.autocomplete-results').siblings('.projekt_nev_input'); 
        var hiddenField = inputField.siblings('.projekt_id'); 
    
        inputField.val(selectedText);
        hiddenField.val(selectedValue);
    
        var results = $(this).parent('.autocomplete-results');
        results.empty().addClass('hidden');
        $('#projekt_nev').val('');
    });
    $(document).click(function (event) {
        if (!$(event.target).closest('.projekt_nev_input, .autocomplete-results').length) {
            $('.autocomplete-results').empty().addClass('hidden');
        }
    });
    //##################autocomplete vége########################








    //##################munkalap indítás########################
    $(document).on('click', '#munkalap_inditas_gomb', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Validate the input field
        if ($('#uj_munkalap_nev').val() == '') {
            $('#munkalap_inditas_hiba').removeClass('hidden');
            $('#uj_munkalap_nev').addClass('border-red-500');
            return; // Exit the function if validation fails
        } else {
            $('#munkalap_inditas_hiba').addClass('hidden');
            $('#uj_munkalap_nev').removeClass('border-red-500');
        }
        if($("#jog_csoportok").find("input:checked").length == 0){
            $("#jog_csoportok").addClass("border-flash border-red-500");
            return;
        }else{
            $("#jog_csoportok").removeClass("border-flash border-red-500");
        }

        // Prepare the form data for AJAX
        var formData = new FormData($('#munkalap_inditas_form')[0]);

        // Execute the AJAX call
        $.ajax({
            url: '/modul/munkalapok/server_script/uj_munkalap_inditas.php',
            type: 'POST',
            data: formData,
            contentType: false, // Important for FormData
            processData: false, // Important for FormData
            dataType: 'JSON',
            success: function(response) {
                if (response.status == 'success') {
                    $('#munkalap_inditas_modal').addClass('hidden');
                    $('#projektek_lista_container').addClass('hidden');
                    $('#munkalapok_lista_container').removeClass('hidden');
                    $('#munkalapok_jobb_pc').addClass('hidden');
                    $('#munkalap_adatok_container').removeClass('hidden');
                    $('#munkalap_inditas_form')[0].reset();
                    munkalap_baloldal_betoltese(''); // Reload the left side
                } else {
                    $('#munkalap_alert').html(response.message);
                    $("#munkalap_alert").show().delay(2000).fadeOut(500);
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a munkalap indítása során:', error);
            }
        });
    });
    //################## munkalap indítás vége ########################




    //################## chat file upload ########################
    $('#uploadButton').on('click', function(event) {
        event.preventDefault();
        $('#uploadMenu').toggleClass('hidden');
    });
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#uploadButton, #uploadMenu').length) {
            $('#uploadMenu').addClass('hidden');
        }
    });
    $(document).on('click', '#fajl_feltolt_lista', function() {
        $('#fileInput').click(); // Indítsd el a file feltöltést
        $('#uploadMenu').addClass('hidden');
    });






    $(document).on('click', '#tipus_megadas_lista', function(e) {
        e.stopPropagation(); // Megakadályozza az esemény felfelé terjedését
        $.ajax({
            url: '/modul/munkalapok/server_script/tipus_almenu.php',
            type: 'POST',
            data: {tipus: "tipus_nev_megjelenites"},
            dataType: 'JSON',
            success: function(response){
                $('#tipus_almenu_lista').empty();
                response.altipusok.forEach(function(item){
                    if(item.tipus_id == 2){
                        var hover_class = 'hover:bg-blue-400';
                    }
                    else if(item.tipus_id == 3){
                        var hover_class = 'hover:bg-orange-400';
                    }
                    else{
                        var hover_class = 'hover:bg-zold-300';
                    }
                    $('#tipus_almenu_lista').append('<li class="px-4 py-2 ' + hover_class + ' hover:text-white cursor-pointer tipus_almenu_lista_elem" data-tipus_id="' + item.tipus_id + '">' + item.tipus_nev_megjelenites + '</li>');
                });
                $('#tipus_almenu').toggleClass('hidden');
            }
        });
      });
    $(document).on('click', '.tipus_almenu_lista_elem', function(e) {
        e.stopPropagation();
        var tipus_id = $(this).data('tipus_id');
        
        $('#tipus_almenu').toggleClass('hidden');
        
        if(tipus_id == 2){
            $('#chat_textarea_container').removeClass('bg-white bg-orange-400 bg-zold-300')
            .addClass('bg-blue-400');
            $('#bejegyzes_tipus').val(tipus_id);
        }
        else if(tipus_id == 3){
            $('#chat_textarea_container').removeClass('bg-white bg-blue-400 bg-zold-300')
            .addClass('bg-orange-400');
            $('#bejegyzes_tipus').val(tipus_id);
        }
        else{
            $('#chat_textarea_container').removeClass('bg-white bg-blue-400 bg-orange-400')
            .addClass('bg-zold-300');
            $('#bejegyzes_tipus').val("0");
        }
        $('#uploadMenu').addClass('hidden');
    });
    // Ha a dokumentum más részére kattintanak, az almenü elrejtése
    $(document).on('click', function() {
        if (!$('#tipus_almenu').hasClass('hidden')) {
            $('#tipus_almenu').addClass('hidden');
        }
    });
    





    
    // Handle file selection
    $('#fileInput').on('change', function() {
        const file = this.files[0];
        if (file) {
            const fileName = file.name;
            const fileItemHtml = `
                <div class="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
                    <img src="assets/png_icon.png" alt="${fileName}" class="w-8 h-8 rounded-full">
                    <span class="font-bold">${fileName}</span>
                    <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 deleteFileButton">
                    <input type="file" name="file_${chat_fajl_szamlalo}" class="hidden fileHolder">
                </div>
            `;

            // Hozzáadjuk a fájl elemet a konténerhez
            $('#uploadedFilesContainer').append(fileItemHtml);

            // Létrehozunk egy DataTransfer objektumot és hozzáadjuk a fájlt
            const dt = new DataTransfer();
            dt.items.add(file);
            
            // A legutóbb létrehozott hidden file inputhoz beállítjuk a file list-et
            $('.fileHolder').last()[0].files = dt.files;

            // Kiürítjük az eredeti file inputot
            $('#fileInput').val('');
            chat_fajl_szamlalo++;
        }
    });
    $(document).on('click', '.deleteFileButton', function() {
        $(this).parent().remove(); // Eltávolítja a fájl elemet
        chat_fajl_szamlalo--;
    });
    //################## chat file upload vége ########################








    //################## áru hozzáadás ########################
    let aruTomb = [];
    $(document).on('click', '#aruk_hozzaadas_lista', function() {
        $('#uploadMenu').addClass('hidden');
        $('#aru_hozzaadas_munkalap').removeClass('hidden');
    });
    $(document).on('click', '#aru_hozzaadas_bezaras', function() {
        $('#aru_hozzaadas_munkalap').addClass('hidden');
        aruTomb = [];
        $('#aru_hozzaadas_form')[0].reset();
    });

    $(document).on('click', '#aru_hozzaadas_gomb', function() {
        const nev = $('#aru_hozzaadas_nev').val().trim();
        const darab = parseInt($('#aru_darab').val().trim());
        const aru_id = $('#aru_hozzaadas_id').val();
        const raktar_id = $('#aru_hozzaadas_raktar_id').val();
        const darab_keszlet = parseInt($('#aru_keszlet_darab').val());
        
        // Alapellenőrzés
        if (!nev || !darab) {
            $('#aru_alert').html('Kérlek töltsd ki mindkét mezőt!');
            $("#aru_alert").show().delay(2000).fadeOut(500);
            return;
        }
        if(aru_id == '' || darab_keszlet == ''){
            $('#aru_alert').html('Kérlek a listából válassz árut!');
            $("#aru_alert").show().delay(2000).fadeOut(500);
            return;
        }
        if (darab_keszlet < darab) {
            $('#aru_alert').html('A készleten lévő darabszám nem lehet kisebb a darabszámnál! <b>(Készleten: ' + darab_keszlet + ' db)</b>');
            $("#aru_alert").show().delay(3000).fadeOut(500);
            return;
        }


        const existingIndex = aruTomb.findIndex(item => item.aru_id == aru_id);
        if (existingIndex !== -1) {
            aruTomb[existingIndex].darab = darab;
        } else {
            // Hozzáadás a tömbhöz
        aruTomb.push({
            raktar_id: raktar_id,
            aru_id: aru_id,
            nev: nev,
            darab_keszlet: darab_keszlet,
            darab: darab
            });
        }

        // Az inputok ürítése
        $('#aru_hozzaadas_nev').val('');
        $('#aru_darab').val('');
        $('#aru_hozzaadas_id').val('');
        $('#aru_hozzaadas_raktar_id').val('');
        $('#aru_keszlet_darab').val('');
        // A grid újrarajzolása
        frissitAruLista();
    });

    $(document).on('click', '.delete_aru', function() {
        const index = $(this).data('id');
        aruTomb.splice(index, 1);
        frissitAruLista();
    });

    // A grid frissítése: kiüríti a #aru_lista elemet, majd újra feltölti
    function frissitAruLista() {
        const container = $('#aru_lista');
        container.empty(); // Kiürítjük
        let index = 0;
        // Végigmegyünk a tömbön, és létrehozunk egy-egy kártyát
        aruTomb.forEach(function(item) {
            container.append(`
            <div class="relative p-2 border border-gray-200 rounded shadow-sm bg-white">
                <img 
                    src="assets/delete_icon.png" 
                    alt="Törlés" 
                    class="absolute top-2 right-2 w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-300 delete_aru"
                    data-id="${index}"
                />
                <p class="font-bold text-gray-800">${item.nev}</p>
                <p class="text-gray-600">Készleten: ${item.darab_keszlet} db</p>
                <p class="text-gray-600">Kiadás: ${item.darab} db</p>
                <p class="text-gray-600">Új készlet: ${item.darab_keszlet - item.darab} db</p>
            </div>
            `);
            index++;
        });
    }
    
    $(document).on('input', '#aru_hozzaadas_nev', function () {
        var beirt_nev = $(this).val().trim();
        var autocomplete_results_aru = $('#autocomplete_results_aru'); // KERESÉS: Nem .next(), hanem .siblings()
    
        if (beirt_nev.length < 1) {
            autocomplete_results_aru.empty().addClass('hidden');
            return;
        }
    
        $.ajax({
            url: '/modul/munkalapok/server_script/ac_aru_lista.php',
            method: 'GET',
            data: { term: beirt_nev },
            dataType: 'json',
            success: function (response) {
                autocomplete_results_aru.empty().removeClass('hidden');
    
                if (response.aru_adatok.length > 0) {
                    response.aru_adatok.forEach(function (item) {
                        var listItem = $('<li></li>')
                            .addClass("px-4 py-2 hover:bg-zold-100 cursor-pointer")
                            .attr("data-aru_id", item.aru_id)
                            .attr("data-darab", item.darab)
                            .attr("data-raktar_id", item.raktar_id)
                            .text(item.aru_nev);
    
                        autocomplete_results_aru.append(listItem);
                    });
    
                    autocomplete_results_aru.removeClass('hidden'); // Biztosan látható legyen
                } else {
                    autocomplete_results_aru.addClass('hidden');
                }
            },
            error: function (err) {
                console.error('Hiba az áru autocomplete kérés során:', err);
            }
        });
    });
    
    $(document).on('click', '#autocomplete_results_aru li', function () {
        var selectedAruId = $(this).data('aru_id');
        var selectedDarab = $(this).data('darab');
        var selectedRaktarId = $(this).data('raktar_id');
        var selectedText = $(this).text();

        $('#aru_hozzaadas_nev').val(selectedText);
        $('#aru_hozzaadas_id').val(selectedAruId);
        $('#aru_keszlet_darab').val(selectedDarab);
        $('#aru_hozzaadas_raktar_id').val(selectedRaktarId);
        $('#autocomplete_results_aru').empty().addClass('hidden');
    });
    $(document).click(function (event) {
        if (!$(event.target).closest('.aru_hozzaadas_nev, #autocomplete_results_aru').length) {
            $('#autocomplete_results_aru').empty().addClass('hidden');
        }
    });

    $(document).on('click', '#aru_hozzaadas_vegleges_gomb', function(){
        var munkalap_id = $(this).attr('data-munkalap-id');
        if(aruTomb.length == 0){
            $('#aru_alert').html('Kérlek adj hozzá legalább egy árut!');
            $("#aru_alert").show().delay(2000).fadeOut(500);
            return;
        }
        $.ajax({
            url: '/modul/munkalapok/server_script/aru_hozzaadas_munkalap.php',
            type: 'POST',
            data: {aru_tomb: aruTomb, munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                $('#aru_hozzaadas_munkalap').addClass('hidden');
                aruTomb = [];
                $('#aru_hozzaadas_form')[0].reset();
                chat_uzenetek_betoltese(munkalap_id, true);
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a munkalap indítása során:', error);
            }
        });
    });

    //################## áru hozzáadás vége ########################











    //################## chat küldés ########################
    $('#chat_textarea').on('keypress', function(e) {
        var chat_textarea_val = $('#chat_textarea').val().replace(/\s/g, '');
        if(chat_textarea_val == ''){
            return;
        }
        if(e.which === 13 && !e.shiftKey){
            e.preventDefault(); 
            var chat_munkalap_id = $('#chat_textarea').attr('data-munkalap-id');

            var chat_form_data = new FormData($('#chat_form')[0]);
            chat_form_data.append('munkalap_id', chat_munkalap_id);
            
            $.ajax({
                url: '/modul/munkalapok/server_script/chat_bejegyzes_feldolg.php',
                type: 'POST',
                data: chat_form_data,
                dataType: 'JSON',
                contentType: false,
                processData: false,
                success: function(response) {
                    $('#chat_form')[0].reset();
                    $('#uploadedFilesContainer').empty();
                    chat_fajl_szamlalo = 0;
                    $('#chat_textarea_container').removeClass('bg-white bg-blue-400 bg-orange-400 bg-zold-300');
                    $('#chat_textarea_container').addClass('bg-white');
                    $('#bejegyzes_tipus').val("0");
                    chat_uzenetek_betoltese(chat_munkalap_id, true);
                    chatOffset = 0;
                },
                error: function(xhr, status, error) {
                    console.error('Hiba történt a chat küldése során:', error);
                }
            });
        }
    });
    //################## chat küldés vége ########################
    //################## chat üzenetek betöltése ########################


    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }


    function chat_uzenetek_betoltese(munkalap_id, scrollToBottom = false, tipus_id = 999){
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_uzenetek_betoltese.php',
            type: 'POST',
            data: {munkalap_id: munkalap_id, tipus_id: tipus_id},
            dataType: 'JSON',
            success: function(response) {
                $('#chat_uzenetek_container').empty();
                if(response.length > 0){
                $.each(response, function(index, item){
                    var mai_nap = new Date();
                    var ev = mai_nap.getFullYear();
                    var honap = ('0' + (mai_nap.getMonth() + 1)).slice(-2);
                    var nap = ('0' + mai_nap.getDate()).slice(-2);
                    var mai_datum = ev + '-' + honap + '-' + nap;
                    var uzenet_datum = item.datum.split(' ')[0];
                    if(mai_datum == uzenet_datum){
                        var uzenet_ora = item.datum.split(' ')[1];
                        uzenet_datum = uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                    }
                    else{
                        var uzenet_ora = item.datum.split(' ')[1];
                        uzenet_datum = uzenet_datum + ' ' + uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                    }

                    if(item.sajat_uzenet){
                        var uzenet_oszlop = 'bg-green-100';
                        var szerkeszto_lathato = 'block';
                    }
                    else{
                        var uzenet_oszlop = 'bg-gray-100';
                        var szerkeszto_lathato = 'hidden';
                    }
                    if(item.tipus_id == 2){
                        var uzenet_oszlop = 'bg-blue-100';
                    }
                    else if(item.tipus_id == 3){
                        var uzenet_oszlop = 'bg-orange-100';
                    }
                    
                    let pin_kep = '';
                    if (item.pin == 1) {
                        pin_kep = `<img src="/assets/pin.png" alt="Pin" class="absolute top-1 right-1 w-4 h-4">`;
                    }
                    let formazott_megjegyzes = '';
                    if(item.felh_id == 0){
                        formazott_megjegyzes = item.megjegyzes.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                    else{
                        formazott_megjegyzes = escapeHtml(item.megjegyzes).replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                    $('#chat_uzenetek_container').append(`
                        <div class="flex items-start gap-2 group pb-4">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    <img 
                                    src="${item.profil_kep_link}" 
                                    alt="Profil kép" 
                                    class="w-10 h-10 rounded-full"
                                    >
                                </div>
                            </div>
                            
                            
                            <div class="flex flex-col ${mobilnezet ? 'max-w-[70%] group-hover:max-w-[50%]' : 'max-w-[70%]'}">

                                <span class="text-sm font-medium text-gray-700 mb-1">${item.teljes_nev}</span>
                                <div class="${uzenet_oszlop} rounded-lg p-3 relative">
                                    ${pin_kep}
                                    <p class="text-sm text-gray-800">${formazott_megjegyzes}</p>
                                    <span class="text-xs text-gray-500 mt-1 block">${uzenet_datum}</span>
                                    <div id="chat_uzenet_fajlok_${item.bejegyzes_id}"></div>
                                </div>
                            </div>
                            <!-- Action buttons - outside the message, only visible on hover -->
                            <div class="hidden group-hover:flex items-center space-x-2 self-center">
                                <!-- Szerkesztés button -->
                                <div class="cursor-pointer text-gray-500 hover:text-blue-500 build_icon ${szerkeszto_lathato}" title="Szerkesztés" data-bejegyzes-id="${item.bejegyzes_id}" data-munkalap-id="${item.munkalap_id}">
                                </div>
                                <!-- Rögzítés button -->
                                <div class="cursor-pointer text-gray-500 hover:text-yellow-500 bookmark_icon" title="Rögzítés" data-bejegyzes-id="${item.bejegyzes_id}" data-munkalap-id="${item.munkalap_id}">
                                </div>
                                <!-- Törlés button -->
                                <div class="cursor-pointer text-gray-500 hover:text-red-500 trash_icon ${szerkeszto_lathato}" title="Törlés" data-bejegyzes-id="${item.bejegyzes_id}" data-munkalap-id="${item.munkalap_id}">
                                </div>
                            </div>
                        </div>
                    `);
                    if(item.fajlok){
                        $.each(item.fajlok, function(index, item){
                            if(item.file_link){
                                var file_name = item.file_link.split('/').pop();
                                $("#chat_uzenet_fajlok_"+item.bejegyzes_id).append(`
                                    <div class="flex items-center gap-2 mt-2 file_delete_icon_container">
                                        <a href="${item.file_link}" class="text-zold-500 hover:text-zold-300 flex items-center gap-2 text-sm" target="_blank"><img src="assets/png_icon.png" alt="${file_name}" class="w-8 h-8">${file_name}</a>
                                        <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hidden file_delete_icon" data-file-id="${item.file_id}" data-bejegyzes-id="${item.bejegyzes_id}" data-munkalap-id="${item.munkalap_id}">
                                    </div>
                                `);
                            }
                        });
                    }
                    });
                $.get("assets/trash_icon.svg", function(data) {
                    var trash_icon = $(data).find("svg");
                    $(".trash_icon").html(trash_icon);
                    }, 'xml').fail(function() {
                    console.error("Hiba az SVG betöltésekor!");
                });
                $.get("assets/bookmark_icon.svg", function(data) {
                    var bookmark_icon = $(data).find("svg");
                    $(".bookmark_icon").html(bookmark_icon);
                    }, 'xml').fail(function() {
                    console.error("Hiba az SVG betöltésekor!");
                });
                $.get("assets/build_icon.svg", function(data) {
                    var build_icon = $(data).find("svg");
                    $(".build_icon").html(build_icon);
                    }, 'xml').fail(function() {
                    console.error("Hiba az SVG betöltésekor!");
                });

                if (scrollToBottom) {
                    $('#chat_uzenetek_container').scrollTop($('#chat_uzenetek_container')[0].scrollHeight);
                }
                }else{
                    $('#chat_uzenetek_container').append(`
                        <div class="text-center text-gray-500 text-xl mt-2">Üres</div>
                    `);
                }
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt a chat üzenetek betöltése során:', error);
            }
        });
    }
    
    //################## chat üzenetek betöltése vége ########################





    //################## chat törlés ########################
    $(document).on('click', '.trash_icon', function(){
        $('#biztosan_torol').removeClass('hidden');
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var munkalap_id = $(this).attr('data-munkalap-id');
        $('#biztosan_torol_gomb').attr('data-bejegyzes-id', bejegyzes_id);
        $('#biztosan_torol_gomb').attr('data-munkalap-id', munkalap_id);
    });
    $(document).on('click', '#biztosan_torol_bezaras', function(){
        $('#biztosan_torol').addClass('hidden');
    });
    $(document).on('click', '#biztosan_torol_gomb', function(){
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var munkalap_id = $(this).attr('data-munkalap-id');
        chat_uzenet_torlese(bejegyzes_id, munkalap_id);
        $('#biztosan_torol').addClass('hidden');
    });
    function chat_uzenet_torlese(bejegyzes_id, munkalap_id){
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_uzenet_torlese.php',
            type: 'POST',
            data: {bejegyzes_id: bejegyzes_id, munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                if(response.status == 'error'){
                    console.error('Hiba történt a chat üzenet törlése során:', response.error);
                }
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat üzenet törlése során:', error);
            }
        });
    }
    //################## chat törlés vége ########################


    //################## chat szerkesztés ########################
    function autoResize($textarea) {
        $textarea.css('height', 'auto');
        $textarea.css('height', $textarea.prop('scrollHeight') + 'px');
    }



    $(document).on('click', '.build_icon', function(){
        $('#chat_szerkesztes_fajlok').empty();
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var messageText = $(this).closest('.flex').find('.text-gray-800').html();
        var file_links = $(this).closest('.flex').find('#chat_uzenet_fajlok_'+bejegyzes_id).html();
        var munkalap_id = $(this).attr('data-munkalap-id');
        $('#chat_szerkesztes_gomb').attr('data-bejegyzes-id', bejegyzes_id);
        $('#chat_szerkesztes_gomb').attr('data-munkalap-id', munkalap_id);
        $('#chat_szerkesztes_fajl_feltoltes_gomb').attr('data-bejegyzes-id', bejegyzes_id);
        $('#chat_szerkesztes_fajl_feltoltes_gomb').attr('data-munkalap-id', munkalap_id);
        var messageText = messageText.replace(/<br\s*\/?>/gi, '\n');
        $('#chat_szerkesztes_szoveg').val(messageText);
        $('#chat_szerkesztes_fajlok').append(file_links);
        $('#chat_szerkesztes_fajlok').find('.file_delete_icon').removeClass('hidden');
        
        $('#chat_szerkesztes').removeClass('hidden');
        setTimeout(function() {
            autoResize($('#chat_szerkesztes_szoveg'));
        }, 0);
    });
    $(document).on('click', '#chat_szerkesztes_bezaras', function(){
        $('#chat_szerkesztes').addClass('hidden');
        $('#chat_szerkesztes_fajlok').find('.file_delete_icon').addClass('hidden');
    });

    $('#chat_szerkesztes_szoveg').on('input', function() {
        autoResize($(this));
    });

    $(document).on('click', '.file_delete_icon', function(){
        var file_id = $(this).attr('data-file-id');
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var munkalap_id = $(this).attr('data-munkalap-id');
        var fileDeleteContainer = $(this).closest('.file_delete_icon_container'); // A teljes konténert meghatározzuk
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_fajl_torlese.php',
            type: 'POST',
            data: {file_id: file_id, bejegyzes_id: bejegyzes_id, munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                if(response.status == 'success'){
                    fileDeleteContainer.addClass('hidden');
                }
                else{
                    console.error('Hiba történt a chat fájl törlése során:', response.error);
                }
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat fájl törlése során:', error);
            }
        });
    });
    $(document).on('click', '#chat_szerkesztes_fajl_feltoltes_gomb', function(){
        var chat_file_input = $('#chat_szerkesztes_fajl_form').find('input[type="file"]')[0];
        var chat_szerkesztes_munkalap_id = $(this).attr('data-munkalap-id');
        var chat_szerkesztes_bejegyzes_id = $(this).attr('data-bejegyzes-id');
        if (!chat_file_input.files || chat_file_input.files.length === 0) {
            $('#chat_nincs_file_alert').removeClass('hidden');
            $('#chat_nincs_file_alert').html('Nincs fájl kiválasztva');
            setTimeout(function() {
                $('#chat_nincs_file_alert').addClass('hidden');
            }, 1500);
            return;
        }
        var fajl_feltoltes_formdata = new FormData($('#chat_szerkesztes_fajl_form')[0]);
        fajl_feltoltes_formdata.append('bejegyzes_id', chat_szerkesztes_bejegyzes_id);
        fajl_feltoltes_formdata.append('munkalap_id', chat_szerkesztes_munkalap_id);
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_fajl_feltoltes.php',
            type: 'POST',
            data: fajl_feltoltes_formdata,
            dataType: 'JSON',
            processData: false,
            contentType: false,
            success: function(response){
                $('#chat_szerkesztes_fajl_form')[0].reset();
                $('#chat_szerkesztes_fajlok').append(`
                <div class="flex items-center gap-2 mt-2 file_delete_icon_container">
                    <a href="${response.file_link}" class="text-zold-500 hover:text-zold-300 flex items-center gap-2 text-sm" target="_blank"><img src="assets/png_icon.png" alt="${response.file_name}" class="w-8 h-8">${response.file_name}</a>
                    <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 file_delete_icon" data-file-id="${response.file_id}" data-bejegyzes-id="${response.bejegyzes_id}" data-munkalap-id="${response.munkalap_id}">
                </div>
                `);
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat fájl feltöltése során:', error);
            }
        });
    });
    $(document).on('click', '#chat_szerkesztes_gomb', function(){
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var munkalap_id = $(this).attr('data-munkalap-id');
        var messageText = $('#chat_szerkesztes_szoveg').val();
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_uzenet_szerkesztes.php',
            type: 'POST',
            data: {bejegyzes_id: bejegyzes_id, messageText: messageText, munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                $('#chat_szerkesztes').addClass('hidden');
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat üzenet szerkesztése során:', error);
            }
        });
    });
    //################## chat szerkesztés vége ########################


    //################## chat pin ########################
    $(document).on('click', '.bookmark_icon', function(){
        var bejegyzes_id = $(this).attr('data-bejegyzes-id');
        var munkalap_id = $(this).attr('data-munkalap-id');
        $.ajax({
            url: '/modul/munkalapok/server_script/chat_pin.php',
            type: 'POST',
            data: {bejegyzes_id: bejegyzes_id, munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                if(response.status == 'error'){
                    console.error('Hiba történt a chat pin készítése során:', response.error);
                }
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat pin készítése során:', error);
            }
        });
    });
    //################## chat pin vége ########################



    //################## munkalap chat nagyítás ########################
    var isChatExpanded = false;

    $(document).on('click', '#munkalap_chat_nagyitas', function() {
        if (!isChatExpanded) {
            // Rejtsd el a bal oldali listákat és a jobb oldali munkalapokat,
            // de ne rejtse el a #munkalap_adatok_container-t, mert abban van a chat
            $('#munkalapok_lista_container').hide();
            // A #munkalap_adatok_container-ben elrejted azokat az elemeket, amelyek nem a chat (#munkalap_tartalom)
            $('#munkalap_adatok_container').children().not('#munkalap_tartalom').hide();

            // A chat konténert full-screen módba helyezed
            $('#munkalap_tartalom').css({
                'position': 'fixed',
                'top': '4',
                'left': '0',
                'width': '100%',
                'height': '90%',
                'z-index': '99'
            });
            isChatExpanded = true;
        } else {
            // Full-screen stílus visszaállítása
            $('#munkalap_tartalom').css({
                'position': '',
                'top': '',
                'left': '',
                'width': '',
                'height': '',
                'z-index': ''
            });
            // A korábban elrejtett elemeket visszaállítjuk
            $('#munkalapok_lista_container').show();
            $('#munkalap_adatok_container').children().show();
            $('#mobil_orak_felh').hide();
            isChatExpanded = false;
        }
    });
    //################## munkalap chat nagyítás vége ########################




    //################## pinelt üzenetek ########################
    $(document).on('click', '#pinek_megjelenites', function(){
        var munkalap_id = $(this).attr('data-munkalap-id');
        $('#pinelt_uzenetek_lista').empty();
        $.ajax({
            url: '/modul/munkalapok/server_script/pinelt_uzenetek_betoltese.php',
            type: 'POST',
            data: {munkalap_id: munkalap_id},
            dataType: 'JSON',
            success: function(response){
                if(response.length > 0){
                response.forEach(function(uzenet){
                    var mai_nap = new Date();
                    var ev = mai_nap.getFullYear();
                    var honap = ('0' + (mai_nap.getMonth() + 1)).slice(-2);
                    var nap = ('0' + mai_nap.getDate()).slice(-2);
                    var mai_datum = ev + '-' + honap + '-' + nap;
                    var uzenet_datum = uzenet.datum.split(' ')[0];
                    if(mai_datum == uzenet_datum){
                        var uzenet_ora = uzenet.datum.split(' ')[1];
                        uzenet_datum = uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                    }
                    else{
                        var uzenet_ora = uzenet.datum.split(' ')[1];
                        uzenet_datum = uzenet_datum + ' ' + uzenet_ora.split(':')[0] + ':' + uzenet_ora.split(':')[1];
                    }

                    if(uzenet.sajat_uzenet){
                        var uzenet_oszlop = 'bg-green-100';
                    }
                    else{
                        var uzenet_oszlop = 'bg-gray-100';
                    }
                    if(uzenet.tipus_id == 2){
                        var uzenet_oszlop = 'bg-blue-100';
                    }
                    else if(uzenet.tipus_id == 3){
                        var uzenet_oszlop = 'bg-orange-100';
                    }
                    let formazott_megjegyzes = '';
                    if(uzenet.felh_id == 0){
                        formazott_megjegyzes = uzenet.megjegyzes.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                    else{
                        formazott_megjegyzes = escapeHtml(uzenet.megjegyzes).replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                    $('#pinelt_uzenetek_lista').append(`
                    <div class="flex items-start gap-2.5 group mb-4">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    <img 
                                    src="${uzenet.profil_kep_link}" 
                                    alt="Profil kép" 
                                    class="w-10 h-10 rounded-full"
                                    >
                                </div>
                            </div>
                            
                            <div class="flex flex-col max-w-[70%]">
                                <span class="text-sm font-medium text-gray-700 mb-1">${uzenet.teljes_nev}</span>
                                <div class="${uzenet_oszlop} rounded-lg p-3 relative">
                                    <p class="text-sm text-gray-800">${formazott_megjegyzes}</p>
                                    <span class="text-xs text-gray-500 mt-1 block">${uzenet_datum}</span>
                                    <div id="chat_pinelt_uzenet_fajlok_${uzenet.bejegyzes_id}"></div>
                                </div>
                            </div>
                    </div>
                    `);
                    if(uzenet.fajlok){
                        $.each(uzenet.fajlok, function(index, item){
                            if(item.file_link){
                                var file_name = item.file_link.split('/').pop();
                                $("#chat_pinelt_uzenet_fajlok_"+uzenet.bejegyzes_id).append(`
                                    <div class="flex items-center gap-2 mt-2 file_delete_icon_container">
                                        <a href="${item.file_link}" class="text-zold-500 hover:text-zold-300 flex items-center gap-2 text-sm" target="_blank"><img src="assets/png_icon.png" alt="${file_name}" class="w-8 h-8">${file_name}</a>
                                        <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hidden file_delete_icon" data-file-id="${item.file_id}" data-bejegyzes-id="${uzenet.bejegyzes_id}" data-munkalap-id="${uzenet.munkalap_id}">
                                    </div>
                                `);
                            }
                        });
                    }
                    });
                    $('#pinelt_uzenetek_lista').scrollTop($('#pinelt_uzenetek_lista')[0].scrollHeight);
                }
                else{
                    $('#pinelt_uzenetek_lista').append(`
                    <div class="text-center text-gray-500 text-xl mt-2">Nincs pinelt üzenet</div>
                    `);
                }
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a pinelt üzenetek betöltése során:', error);
            }
        });
        $('#pinelt_uzenetek').removeClass('hidden');
    });
    $(document).on('click', '#pinelt_uzenetek_bezaras', function(){
        $('#pinelt_uzenetek').addClass('hidden');
    });
    //################## pinelt üzenetek vége ########################





    $(document).on('click', '#chat_tipus_szuro', function() {
        $('#custom_dropdown').toggle(); // Toggle dropdown visibility
        var munkalap_id = $(this).attr('data-munkalap-id');
        $.ajax({
            url: '/modul/munkalapok/server_script/tipus_almenu.php',
            type: 'POST',
            data: {tipus: "tipus_nev"},
            dataType: 'JSON',
            success: function(response){
                $('#custom_dropdown').empty();
                if (!mobilnezet){
                    $('#custom_dropdown').append(`
                        <div class="tipus_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-munkalap-id="${munkalap_id}" data-value="999">Összes típus</div>
                    `);
                }else{
                    $('#custom_dropdown').append(`
                        <div class="tipus_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-munkalap-id="${munkalap_id}" data-value="999">Összes</div>
                    `);
                }
                    $.each(response.altipusok, function(index, item){
                        if (mobilnezet){
                            const tipus_nev = item.tipus_nev_megjelenites.split(' ')[0];
                        $('#custom_dropdown').append(`
                            <div class="tipus_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-munkalap-id="${munkalap_id}" data-value="${item.tipus_id}">${tipus_nev}</div>
                        `);
                    }
                    else{
                        $('#custom_dropdown').append(`
                            <div class="tipus_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-munkalap-id="${munkalap_id}" data-value="${item.tipus_id}">${item.tipus_nev_megjelenites}</div>
                        `);
                    }
                });
            },
            error: function(xhr, status, error){
                console.error('Hiba történt a chat tipus szuro betöltése során:', error);
            }
        });
    });

    $(document).on('click', '.tipus_sor', function() {
        const selectedValue = $(this).data('value');
        const selectedText = $(this).text();
        const munkalap_id = $(this).attr('data-munkalap-id');

        $('#chat_tipus_szuro span').text(selectedText);
        $('#custom_dropdown').hide();
        chat_uzenetek_betoltese(munkalap_id, true, selectedValue);

    });

    // Hide dropdown when clicking outside
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#chat_tipus_szuro').length) {
            $('#custom_dropdown').hide();
        }
    });








    /* ===== PASTE + DRAG&DROP KÉP A CHATBE ===== */

/** Csak képfájlokat engedünk */
const ACCEPTED_IMAGE_MIMES = ['image/png','image/jpeg','image/gif','image/webp','image/bmp','image/svg+xml'];

/** Ugyanúgy adunk hozzá egy beillesztett fájlt, mint a #fileInput használatakor */
function addPastedFileToUploads(file) {
  if (!file || !ACCEPTED_IMAGE_MIMES.includes(file.type)) return;

  const fileName = file.name || `pasted-${Date.now()}.${(file.type.split('/')[1] || 'png')}`;

  const fileItemHtml = `
    <div class="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
      <img src="assets/png_icon.png" alt="${fileName}" class="w-8 h-8 rounded-full">
      <span class="font-bold break-all">${fileName}</span>
      <img src="assets/delete_icon.png" alt="Törlés" class="w-8 h-8 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 deleteFileButton">
      <input type="file" name="file_${chat_fajl_szamlalo}" class="hidden fileHolder">
    </div>
  `;

  $('#uploadedFilesContainer').append(fileItemHtml);

  // A rejtett input .files mezőjébe bepakoljuk a beillesztett fájlt
  const dt = new DataTransfer();
  dt.items.add(new File([file], fileName, { type: file.type }));
  $('.fileHolder').last()[0].files = dt.files;

  chat_fajl_szamlalo++;
}

/** Ctrl+V a #chat_textarea mezőben (textarea) */
$(document).on('paste', '#chat_textarea', function(e) {
  const items = e.originalEvent.clipboardData?.items || [];
  const imageItems = Array.from(items).filter(it => it.kind === 'file' && it.type && it.type.startsWith('image/'));
  if (!imageItems.length) return; // nincs kép -> mehet a normál szövegbeillesztés

  // Van képfájl: ne illessze közvetlenül a szövegbe, inkább tegyük a feltöltendők közé
  e.preventDefault();

  imageItems.forEach(it => {
    const f = it.getAsFile();
    if (f) addPastedFileToUploads(f);
  });
});

/** Ha contenteditable chatmeződ is van (pl. #chat-input), akkor ez is: */
$(document).on('paste', '#chat-input[contenteditable="true"]', function(e) {
  const items = e.originalEvent.clipboardData?.items || [];
  const imageItems = Array.from(items).filter(it => it.kind === 'file' && it.type && it.type.startsWith('image/'));
  if (!imageItems.length) return; // hagyjuk a szöveg beillesztést

  e.preventDefault();
  imageItems.forEach(it => {
    const f = it.getAsFile();
    if (f) addPastedFileToUploads(f);
  });
});


/** (Opcionális) méretkorlát és hibaüzenet – ha szeretnéd: */
// const MAX_BYTES = 8 * 1024 * 1024;
// if (file.size > MAX_BYTES) { /* mutass alertet és ne add hozzá */ }



});//document ready vége