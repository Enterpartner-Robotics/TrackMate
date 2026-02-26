$(document).ready(function(){
const mobilnezet = window.innerWidth <= 850;
socket.on('update_jog_tabla', function (data) {
        if(data.update == 'jog_tabla'){
            felhasznalok_betoltese();
        }
});
function felhasznalok_betoltese(){
    $.ajax({
        url: "/modul/jogosultsagok/server_script/felhasznalok_betoltes.php",
        dataType: "json",
        type: "GET",
        success: function(response){
            $("#uj_felhasznalok_grid").empty();
            $("#felhasznalok_grid").empty();
            if (response && response.felhasznalok_lista && Array.isArray(response.felhasznalok_lista)) {
                var vanUjFelhasznalo = false;
                response.felhasznalok_lista.forEach(function(felhasznalo){
                    if (felhasznalo.jogosultsag_id == 3) {
                        vanUjFelhasznalo = true;
                        const cardClass = mobilnezet ? 
                            "flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md mb-4" :
                            "grid grid-cols-[250px_300px_175px_1fr_1fr] gap-4 p-3 hover:bg-gray-50";

                        $("#uj_felhasznalok_grid").append(`    
                            <div class="${cardClass}">
                                <input type="hidden" value="${felhasznalo.felh_id}" id="felh_id">
                                <div class="${mobilnezet ? 'font-bold text-lg ' : ''}">${felhasznalo.teljes_nev}</div>
                                <div class="${mobilnezet ? 'text-gray-600 ' : ''}">${felhasznalo.email}</div>
                                <div class="${mobilnezet ? 'text-gray-600 mb--2' : ''}">${felhasznalo.telefon || '-'}</div>
                                <div class="${mobilnezet ? 'flex flex-col gap-2' : ''}">
                                    <button class="text-white bg-alapzold rounded-lg p-2 w-full md:w-32 font-bold hover:bg-green-800" id="uj_felhasznalo_jovahagyas">Jóváhagyás</button>
                                </div>
                                <div class="${mobilnezet ? 'mt-2' : ''}">
                                    <button class="text-white bg-red-500 rounded-lg p-2 w-full md:w-32 font-bold hover:bg-red-800" id="uj_felhasznalo_elutasitas">Elutasítás</button>
                                </div>
                            </div>
                        `);
                    } else {
                        const cardClass = mobilnezet ? 
                            "flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md mb-4" :
                            "grid grid-cols-[200px_300px_180px_1fr_140px_175px] gap-4 p-3 hover:bg-gray-50";

                        $("#felhasznalok_grid").append(`    
                            <div class="${cardClass}">
                                <div class="${mobilnezet ? 'font-bold text-lg ' : 'text-md'}">${felhasznalo.teljes_nev}</div>
                                <div class="${mobilnezet ? 'text-gray-600 ' : 'text-md'}">${felhasznalo.email}</div>
                                <div class="${mobilnezet ? 'text-gray-600 ' : 'text-md'}">${felhasznalo.telefon || '-'}</div>
                                <div class="${mobilnezet ? 'mb-4' : ''}">
                                     <select class="w-full md:w-36 border rounded-lg p-1 text-sm text-alapzold osztaly_select" data-felh-id="${felhasznalo.felh_id}">
                                        <option value="">-</option>
                                        ${response.osztalyok.map(osztaly => `
                                            <option value="${osztaly.osztaly_id}" 
                                                    ${felhasznalo.osztaly_id !== null && felhasznalo.osztaly_id != undefined && felhasznalo.osztaly_id == osztaly.osztaly_id ? 'selected' : ''}>
                                                ${osztaly.osztaly_nev}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="${mobilnezet ? 'mb-4' : ''}">
                                     <select class="w-full md:w-36 border rounded-lg p-1 text-sm text-alapzold jogosultsag_select" data-felh-id="${felhasznalo.felh_id}">
                                        ${response.jogosultsagok.map(jog => `
                                            <option value="${jog.jogosultsag_id}" 
                                                    ${jog.jogosultsag_id == felhasznalo.jogosultsag_id ? 'selected' : ''}>
                                                ${jog.jogosultsag_nev}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="items-right justify-center">
                                    <button class="text-red-500 text-sm flex items-center justify-center gap-2 w-full" id="felhasznalo_torles_gomb">
                                        <span>Felhasználó törlése</span>
                                        <img src="../../assets/delete_icon.png" class="w-6" alt="Törlés ikon" title="Törlés ikon">
                                    </button>
                                </div>
                            </div>
                        `);
                    }
                });

                if (!vanUjFelhasznalo) {
                    $("#uj_felhasznalok_lista").addClass('hidden');
                }
            } else {
                $("#felhasznalok_grid").append(`
                    <div class="p-3 text-red-600">Nem sikerült betölteni a felhasználók listáját.</div>
                `);
            }
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            $("#felhasznalok_grid").append(`
                <div class="p-3 text-red-600">Hiba történt az adatok betöltése közben.</div>
            `);
        }
    });
}
felhasznalok_betoltese();

$(document).on('change', '#felhasznalok_grid .jogosultsag_select', function() {
    const felh_id = $(this).data('felh-id');
    const uj_jogosultsag_id = $(this).val();
    
    $.ajax({
        url: "/modul/jogosultsagok/server_script/jogosultsag_modositas.php",
        type: "POST",
        dataType: "json",
        data: {
            felh_id: felh_id,
            jogosultsag_id: uj_jogosultsag_id
        },
        success: function(response) {
           
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            alert('Hiba történt a jogosultság módosítása során!');
        }
    });
});

$(document).on('change', '.osztaly_select', function() {
    const felh_id = $(this).data('felh-id');
       // Az érték 999 lesz, ha az üres stringet választottuk ("-" opció)
       const uj_osztaly_id = $(this).val() === "" ? 999 : $(this).val();
    
    $.ajax({
        url: "/modul/jogosultsagok/server_script/osztalyok_modositas.php",
        type: "POST",
        dataType: "json",
        data: {
            felh_id: felh_id,
            osztaly_id: uj_osztaly_id
        },
        success: function(response) {
            // Itt kezelheted a sikeres választ
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            alert('Hiba történt az osztály módosítása során!');
        }
    });
});


$(document).on('click', '#uj_felhasznalo_jovahagyas', function() {
    
    const felhasznaloSor = $(this).closest('.grid');
    const felh_id = felhasznaloSor.find('#felh_id').val();
    
    $.ajax({
        url: "/modul/jogosultsagok/server_script/felhasznalo_jovahagyas.php",
        type: "POST",
        dataType: "json",
        data: {
            felh_id: felh_id
        },
        success: function(response) {
            if (response.status === 'success') {
                
                felhasznaloSor.fadeOut(300, function() {
                    $(this).remove();
                    // Ha ez volt az utolsó új felhasználó, elrejtjük a szekciót
                    if ($('#uj_felhasznalok_grid').children().length === 0) {
                        $('#uj_felhasznalok').addClass('hidden');
                    }
                });
            } else {
                alert('Hiba történt a jóváhagyás során: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            alert('Hiba történt a jóváhagyás során!');
        }
    });
});


function felhasznaloTorles(event) {
    const felhasznaloSor = $(this).closest('.grid');
    const felh_id = felhasznaloSor.find('#felh_id').val() || felhasznaloSor.find('select').data('felh-id');
    
    $.ajax({
        url: "/modul/jogosultsagok/server_script/felhasznalo_elutasitas.php",
        type: "POST",
        dataType: "json",
        data: {
            felh_id: felh_id
        },
        success: function(response) {
            if (response.status === 'success') {
                felhasznaloSor.fadeOut(300, function() {
                    $(this).remove();
                    // Ellenőrizzük, hogy melyik gridből töröltünk
                    if ($(event.target).closest('#uj_felhasznalok_grid').length) {
                        // Új felhasználók grid
                        if ($('#uj_felhasznalok_grid').children().length === 0) {
                            $('#uj_felhasznalok_lista').addClass('hidden');
                        }
                    } else {
                        // Aktív felhasználók grid
                        if ($('#felhasznalok_grid').children().length === 0) {
                            $('#felhasznalok_grid').append(`
                                <div class="p-3 text-gray-600">Nincsenek aktív felhasználók.</div>
                            `);
                        }
                    }
                });
            } else {
                alert('Hiba történt a művelet során: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            alert('Hiba történt a művelet során!');
        }
    });
}

// Mindkét gombhoz ugyanazt a függvényt rendeljük
$(document).on('click', '#uj_felhasznalo_elutasitas, #felhasznalo_torles_gomb', felhasznaloTorles);
// Módosítsuk a meglévő osztalyok_modositas_gomb eseménykezelőt
$(document).on('click', '#osztalyok_modositas_gomb', function() {
    $('#osztalyok_modositas_modal').removeClass('hidden');
    
    // Létrehozzuk/reseteljük az eredeti_osztalyok objektumot
    window.eredeti_osztalyok = {};

    $.ajax({
        url: "/modul/jogosultsagok/server_script/osztalyok_betoltes.php",
        type: "POST",
        dataType: "json",
        success: function(response) {
            if (response.status === 'success') {
                const osztalyok = response.osztalyok;
                const osztalyokGrid = $('#osztalyok_grid');
                osztalyokGrid.empty();
                
                osztalyok.forEach(function(osztaly) {
                    // Eltároljuk az eredeti értékeket
                    window.eredeti_osztalyok[osztaly.osztaly_id] = osztaly.osztaly_nev;
                    
                    osztalyokGrid.append(`
                        <div class="grid grid-cols-[30px_120px_1fr] w-full gap-4 p-3 hover:bg-gray-50">
                            <div class="flex items-center justify-center text-center font-bold text-md">${osztaly.osztaly_id}</div>
                            <div class="relative w-full">
                                <input type="text" class="w-full border rounded-lg p-1 text-sm text-alapzold" value="${osztaly.osztaly_nev}">
                                <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 cursor-help font-bold" title="Az osztály nevét / jellel elválasztva adja meg!">&#9432;</span>
                            </div>
                            
                           <div class="items-right justify-center">
                                    <button class="text-red-500 text-md flex items-center justify-center gap-2 w-full osztaly_torles_gomb" >
                                        <span>Osztály törlése</span>
                                        <img src="../../assets/delete_icon.png" class="w-7" alt="Törlés ikon" title="Törlés ikon">
                                    </button>
                                </div>
                        </div>
                        
                    `);
                });
                
            }
        },
        error: function(xhr, status, error) {
            console.error("Ajax hiba:", error);
            alert('Hiba történt a művelet során!');
        }
    });
});


// Töröljük a belső duplikált eseménykezelőt, és csak a külsőt hagyjuk meg
$(document).on('click', '#osztaly_felvetele_gomb', function() {
    const osztalyokGrid = $('#osztalyok_grid');
    
    // Megkeressük a legnagyobb meglévő osztály ID-t
    let maxOsztalyId = 0;
    osztalyokGrid.children().each(function() {
        const osztalyId = parseInt($(this).find('div:first-child').text().trim());
        if (!isNaN(osztalyId) && osztalyId > maxOsztalyId) {
            maxOsztalyId = osztalyId;
        }
    });
    
    // Az új osztály ID-je a legnagyobb + 1 lesz
    const newOsztalyId = maxOsztalyId + 1;
    
    // Új üres sor hozzáadása az osztályok grid aljához
    osztalyokGrid.append(`
        <div class="grid grid-cols-[30px_120px_1fr] w-full gap-4 p-3 hover:bg-gray-50" id="new-osztaly-${newOsztalyId}">
            <div class="flex items-center justify-center text-center font-bold text-md">${newOsztalyId}</div>
            <div class="relative w-full">
                <input type="text" class="w-full border rounded-lg p-1 text-sm text-alapzold" value="" placeholder="Osztály neve">
                <span class="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 cursor-pointer font-bold" title="Az osztály nevét / jellel elválasztva adja meg!">&#9432;</span>
            </div>
            <div class="items-right justify-center">
                <button class="text-red-500 text-md flex items-center justify-center gap-2 w-full uj_osztaly_torles_gomb">
                    <span>Osztály törlése</span>
                    <img src="../../assets/delete_icon.png" class="w-7" alt="Törlés ikon" title="Törlés ikon">
                </button>
            </div>
        </div>
    `);
    
    // Görgessünk az új elemhez
    osztalyokGrid.scrollTop(osztalyokGrid.prop("scrollHeight"));
    
    // Fókuszáljunk az új inputra
    $(`#new-osztaly-${newOsztalyId} input`).focus();
});



// Osztályok mentése gomb eseménykezelő
$(document).on('click', '#osztaly_mentes_gomb', function() {
    const modositott_osztalyok = [];
    const uj_osztalyok = [];
    
    // Végigmegyünk minden osztály soron
    $('#osztalyok_grid').find('.grid').each(function() {
        const $this = $(this);
        const osztaly_id_elem = $this.find('div:first-child');
        const osztaly_id = osztaly_id_elem.text().trim();
        const $input = $this.find('input');
        const osztaly_nev = $input.val().trim();
        
        // Ha új osztály (id kezdődik "new-osztaly-" karakterekkel)
        if ($this.attr('id') && $this.attr('id').startsWith('new-osztaly-')) {
            // Csak akkor vesszük fel az új osztályt, ha a neve nem üres
            if (osztaly_nev !== '') {
                uj_osztalyok.push({
                    osztaly_nev: osztaly_nev
                });
            }
        } 
        // Ha meglévő osztály és megváltozott az értéke
        else if (window.eredeti_osztalyok[osztaly_id] !== undefined && 
                 window.eredeti_osztalyok[osztaly_id] !== osztaly_nev &&
                 osztaly_nev !== '') {
            modositott_osztalyok.push({
                osztaly_id: osztaly_id,
                osztaly_nev: osztaly_nev
            });
        }
    });
    
    // Csak akkor küldünk kérést, ha van mit menteni
    if (modositott_osztalyok.length > 0 || uj_osztalyok.length > 0) {
        $.ajax({
            url: "/modul/jogosultsagok/server_script/osztalyok_mentes.php",
            type: "POST",
            dataType: "json",
            data: {
                modositott_osztalyok: JSON.stringify(modositott_osztalyok),
                uj_osztalyok: JSON.stringify(uj_osztalyok)
            },
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message || 'Az osztályok sikeresen mentve!');
                    
                    // Modál elrejtése és újratöltés
                    $('#osztalyok_modositas_modal').addClass('hidden');
                    
                    // Újratöltjük a felhasználók listáját, hogy az új osztályok megjelenjenek
                    felhasznalok_betoltese();
                } else {
                    alert(response.message || 'Hiba történt a mentés során.');
                }
            },
            error: function(xhr, status, error) {
                console.error("Ajax hiba:", error);
                alert('Hiba történt az osztályok mentése során!');
            }
        });
    } else {
        // Ha nincs változás, egyszerűen bezárjuk a modált
        $('#osztalyok_modositas_modal').addClass('hidden');
    }
});


// Osztály törlése gomb kezelése
$(document).on('click', '.osztaly_torles_gomb', function() {
    const sorElem = $(this).closest('.grid');
    const osztaly_id = sorElem.find('div:first-child').text().trim();
    
    // Megerősítés kérése
    if (confirm('Biztosan törölni szeretné ezt az osztályt?')) {
        // AJAX hívás a törléshez
        $.ajax({
            url: '/modul/jogosultsagok/server_script/osztalyok_torles.php',
            type: 'POST',
            dataType: 'json',
            data: {
                osztaly_id: osztaly_id
            },
            success: function(response) {
                if (response.status === 'success') {
                    // Sikeresen törölve, csak ezt a sort távolítjuk el
                    sorElem.fadeOut(300, function() {
                        $(this).remove();
                    });
                } else {
                    // Hiba történt
                    alert(response.message || 'Hiba történt az osztály törlése során.');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX hiba:', error);
                alert('Hiba történt a művelet során!');
            }
        });
    }
});

});
