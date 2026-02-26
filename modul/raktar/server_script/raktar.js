$(document).ready(function () {


    socket.on('update_raktar_tabla', function (data) {
        if(data.update == 'raktar_tabla'){
            table.setData();
        }
    });





    const mobilnezet = window.innerWidth <= 850;
    const table = new Tabulator("#raktar_tabla", {
        locale: "hu",
        langs: {
            "hu": {
                "columns": {
                    // egyedi oszlopnevek, ha kell
                },
                "ajax": {
                    "loading": "Betöltés...",
                    "error": "Hiba történt az adatok betöltése közben",
                },
                "groups": {
                    "item": "elem",
                    "items": "elem",
                },
                "pagination": {
                    "first": "Első",
                    "first_title": "Első oldal",
                    "last": "Utolsó",
                    "last_title": "Utolsó oldal",
                    "prev": "Előző",
                    "prev_title": "Előző oldal",
                    "next": "Következő",
                    "next_title": "Következő oldal",
                    "page_size": "Oldalméret",
                    "counter": {
                        "showing": "Megjelenítve",
                        "of": "összesen",
                        "rows": "sor"
                    }
                },
                "headerFilters": {
                    "default": "Szűrés...",
                    "columns": {}
                },
                "columnsMenu": {
                    "columns": "Oszlopok",
                    "rows": "Sorok",
                    "copy": "Másolás",
                }
            }
        },
        pagination: true,
        paginationSize: 25,
        paginationSizeSelector: [25, 50, 100],
        paginationButtonCount: 3,
        paginationCounter: "rows",
        paginationMode: "remote",
        ajaxURL: "/modul/raktar/server_script/raktar_tabla_betoltes.php",
        ajaxContentType: "JSON",
        ajaxParams: { search: '' },
        layout: "fitColumns",
        placeholder: "Nincs adat",
        responsiveLayout: true,
        headerSort: false,

        columns: [
            { title: "ID", field: "raktar_id", width: 70, hozAlign: "center", sorter: "number" },
            { title: "Áru megnevezés", field: "aru_megnevezes", minWidth: 180, maxWidth: 500 },
            { 
              title: "Áru helye",
              field: "hely", 
              minWidth: 150,
              hozAlign: "center",
              cssClass: "no-row-click", 
              formatter: function(cell) {
                let cellValue = cell.getValue();
                if (cellValue) {
                    // Daraboljuk a stringet vessző mentén, és eltávolítjuk a felesleges szóközöket
                    const parts = cellValue.split(',').map(item => item.trim());
                    if (parts.length > 3) {
                        cellValue = parts.slice(0, 3).join(', ') + '...';
                    }else{
                        cellValue = cellValue;
                    }
                  }
                return `
                  <div class="flex items-center justify-between">
                    <span>${cellValue}</span>
                    <img 
                        src="assets/edit.png" 
                        alt="Áru helyének szerkesztése"
                        name="${cell.getData().aru_megnevezes}"
                        data-raktar_id="${cell.getData().raktar_id}"
                        class="w-6 h-6 ml-2 cursor-pointer bg-alapzold rounded hover:scale-110 transition no-row-click edit-hely-btn">
                        
                  </div>
                `;
              }
            },
            { 
                title: "Készlet", 
                field: "darab", 
                minWidth: 100, 
                sorter: "number",
                formatter: function(cell) {
                    let value = cell.getValue();
                    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
                }
            },
            { 
                title: "Beszerzési ár", 
                field: "beszerzesi_ar", 
                minWidth: 100, 
                sorter: "number",
                formatter: function(cell) {
                    let value = cell.getValue();
                    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft" : "0 Ft";
                }
            },
            { title: "Áru Képe",
              field: "aru_kep", 
              minWidth: 180,
              cssClass: "hidden lg:table-cell",
              formatter: function (cell, formatterParams, onRendered) {
                  const fileSrc = cell.getValue();
                  if (!fileSrc) return "";
                  return `<img src="assets/png_icon.png" data-src="${fileSrc}" class="w-8 h-8 mx-auto cursor-pointer hover:scale-110 transition no-row-click" />`;
              }
            }
        ],
    

        initialSort: [{ column: "raktar_id", dir: "desc" }],


    });

    $(document).on("click", "#raktar_tabla img", function (event) {
        event.stopPropagation();
        const originalSrc = $(this).attr("data-src");
        if (originalSrc) {
            window.open(originalSrc, "_blank");
        }
    });

    // Close Modal When Clicking Close Button
    $(".close-btn").on("click", function () {
        $("#detailsModal").addClass("hidden");
    });


    $(document).on("click", "#helyDialogCloseBtn", function () {
        $("#helyDialog").addClass("hidden");
    });
    

    // Close Modal When Clicking Outside
    $(document).on("click", function (e) {
        if ($(e.target).is("#detailsModal")) {
            $("#detailsModal").addClass("hidden");
        }
    });
    $('#search-box').on('input', function () {
        const searchQuery = $(this).val();  // Keresési kifejezés
        table.setData('/modul/raktar/server_script/raktar_tabla_betoltes.php', { search: searchQuery });  // Keresési paraméterek átadása
    });


    




    table.on("rowClick", function (e, row) {
        // Sor kattintás
        if ($(e.target).hasClass("no-row-click")) {
            return; // Kilépés, ha a kép lett megnyomva
        }

        let aru_megnevezes_detail = row.getData().aru_megnevezes;
        $("#aru_megnevezes_detail").text(aru_megnevezes_detail);
        let keszlet_detail = row.getData().darab;
        $("#keszlet_detail").text(keszlet_detail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " db");
        $("#keszlet_detail_mobil").text(keszlet_detail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " db");
        let beszerzesi_ar_detail = row.getData().beszerzesi_ar;
        $("#beszerzesi_ar_detail").text(beszerzesi_ar_detail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft");
        $("#beszerzesi_ar_detail_mobil").text(beszerzesi_ar_detail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft");
        let hely_detail = row.getData().hely;
        $("#hely_detail").html(hely_detail);
        $("#hely_detail_mobil").html(hely_detail);
        $("#edit_hely_btn_mobil_div").html(
        `
        <h2 class="text-xl font-bold mb-2 text-zold-500" id="aru_megnevezes_detail_mobil">${aru_megnevezes_detail}</h2>
        <img 
            src="assets/edit.png" 
            alt="Áru helyének szerkesztése"
            data-raktar_id="${row.getData().raktar_id}"
            name="${aru_megnevezes_detail}"
            class="w-6 h-6 ml-2 cursor-pointer bg-alapzold rounded hover:scale-110 transition no-row-click edit-hely-btn-mobil">`
        );
        let raktar_id = row.getData().raktar_id;

        if(mobilnezet){
            const pc_detail = $("#pc_detail");
            pc_detail.addClass("hidden");
        }
        $("#detailsModal").removeClass("hidden");
        $(".modal-body").html('<p class="text-gray-600">Betöltés...</p>');

        // Fetch Data via AJAX
        $.ajax({
            url: "/modul/raktar/server_script/raktar_tabla_reszletek.php",
            method: "GET",
            dataType: "json",
            data: { raktar_id: raktar_id },
            success: function (response) {
                if (response.success && Array.isArray(response.data)) {
                    if(!mobilnezet){
                    let htmlContent = response.data.map(item => {
                        let fileLinkHtml = `<td class="w-16 text-center"></td>`;
                        if(item.szamlaKep){
                            fileLinkHtml =
                            `<td class="w-16 text-center md:max-h-[120px] !important overflow-y-auto example">
                                <a href="${item.szamlaKep}" target="_blank">
                                    <img src="../assets/png_icon.png" alt="Számla kép" class="w-14 h-14 mx-auto">
                                </a>
                            </td>`
                        }
                        if(item.bejegyzesKepe){
                            fileLinkHtml =
                            `<td class="w-16 text-center md:max-h-[120px] !important overflow-y-auto example">
                                <a href="${item.bejegyzesKepe}" target="_blank">
                                    <img src="../assets/png_icon.png" alt="Kiadás kép" class="w-14 h-14 mx-auto">
                                </a>
                            </td>`
                        }
                        if(item.szamlaKep && item.bejegyzesKepe){
                            fileLinkHtml =
                            `<td class="w-16 text-center md:max-h-[120px] !important overflow-y-auto example">
                                <a href="${item.szamlaKep}" target="_blank">
                                    <img src="../assets/png_icon.png" alt="Számla kép" class="w-14 h-14 mx-auto">
                                </a>
                                <a href="${item.bejegyzesKepe}" target="_blank">
                                    <img src="../assets/png_icon.png" alt="Kiadás kép" class="w-14 h-14 mx-auto">
                                </a>
                            </td>`
                        }

                        let rowColorClass = "";
                        let textColorClass = "";
                        if (item.bejegyzes_nev_megjelenites === "Selejtezés") {
                            rowColorClass = "bg-red-200";
                            textColorClass = "text-red-500";
                        } else if (item.bejegyzes_nev_megjelenites === "Bevételezés") {
                            rowColorClass = "bg-green-200";
                            textColorClass = "text-green-600";
                        } else if (item.bejegyzes_nev_megjelenites === "Visszaárú") {
                            rowColorClass = "bg-yellow-200";
                            textColorClass = "text-yellow-500";
                        }
                        else if (item.bejegyzes_nev_megjelenites === "Munkalaphoz csatolás") {
                            rowColorClass = "bg-teal-200";
                            textColorClass = "text-teal-600";
                        }
                        
                        if(item.beszerzesi_ar){
                            item.beszerzesi_ar += " Ft"
                        }
                        if(item.darab){
                            item.darab = item.darab.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                        }
                        if(item.beszerzesi_ar){
                            item.beszerzesi_ar = item.beszerzesi_ar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                        }
                        var vnev = "";
                        if (!item.munkalap_nev || item.munkalap_nev === null) {
                            vnev = item.bejegyzes_nev_megjelenites;
                        } else {
                            vnev = `<div class="munkalap_link text-blue-500 hover:text-blue-700 cursor-pointer transition" data-munkalap_id="${item.munkalap_id}">${item.munkalap_nev}</div>Munkalapra kiadva`;
                        }
                        
                        return`
                                
                                <tr class="p-6 rounded-lg shadow-sm ${rowColorClass} mb-2">

                                    <td class="w-24 p-4">
                                    <div class="flex items-center space-x-4 max-h-[120px]">
                                        <img src="${item.profil_kep_link}" alt="Profilkép" class="w-12 h-12 rounded-full shadow-md border border-gray-300">
                                        <div class="">
                                            <div class="font-bold text-xl ${textColorClass}">${vnev}</div>
                                            <div class="text-sm text-gray-600 ">${item.datum}</div>
                                            <div class="text-sm font-bold " >${item.teljes_nev}</div>
                                        </div>
                                    </div>
                                    </td>

                                    <td class="w-12 text-center text-base md:max-h-[120px] ">${item.darab}</td>

                                    <td class="w-16 text-center text-base md:max-h-[120px] ">${item.beszerzesi_ar || ''}</td>

                                    <td class="w-40 text-center md:max-h-[120px]"><div class="max-h-[120px] overflow-y-auto example p-2">${item.megjegyzes || ''}   </div></td>


                                    ${fileLinkHtml}
                                </tr>
                            




                        `}).join("");
                             
                    $(".modal-body").html(htmlContent);
                } else {
                    // GRID VIEW (MOBILE)                    
                    let htmlContent = response.data.map(item => {
                        let rowColorClass = "";
                        let textColorClass = "";
                
                        if (item.bejegyzes_nev_megjelenites === "Selejtezés") {
                            rowColorClass = "bg-red-200";
                            textColorClass = "text-red-500";
                        } else if (item.bejegyzes_nev_megjelenites === "Bevételezés") {
                            rowColorClass = "bg-green-200";
                            textColorClass = "text-green-600";
                        } else if (item.bejegyzes_nev_megjelenites === "Visszaárú") {
                            rowColorClass = "bg-yellow-200";
                            textColorClass = "text-yellow-500";
                        } else if (item.bejegyzes_nev_megjelenites === "Munkalaphoz csatolás") {
                            rowColorClass = "bg-teal-200";
                            textColorClass = "text-teal-600";
                        }
                
                        if (item.beszerzesi_ar) {
                            item.beszerzesi_ar += " Ft";
                        }
                
                        let fileLinkHtml = item.file_link 
                            ? `<div class="mt-2 text-center">
                                    <a href="${item.file_link}" target="_blank">
                                        <img src="../assets/png_icon.png" alt="Számla kép" class="w-12 h-12 mx-auto">
                                    </a>
                                </div>`
                            : '';
                
                        return `
                            <div class="p-4 rounded-lg shadow-md ${rowColorClass}">
                                <div class="flex items-center space-x-4">
                                    <img src="${item.profil_kep_link}" alt="Profilkép" class="w-12 h-12 rounded-full shadow-md border border-gray-300">
                                    <div>
                                        <div class="font-bold text-xl ${textColorClass}">${item.bejegyzes_nev_megjelenites}</div>
                                        <div class="text-sm text-gray-600">${item.datum}</div>
                                        <div class="text-sm font-bold">${item.teljes_nev}</div>
                                    </div>
                                </div>
                                <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div class="font-bold ">Darab:</div>
                                    <div>${item.darab}</div>
                                    <div class="font-bold ">Beszerzési ár:</div>
                                    <div>${item.beszerzesi_ar || ''}</div>
                                    <div class="font-bold " style="grid-column: span 2;">Megjegyzés:</div> <!-- Módosítás itt -->
                                    <div class="max-h-[120px] overflow-y-auto p-2" style="grid-column: span 2;">${item.megjegyzes || ''}</div> <!-- Módosítás itt -->
                                </div>

                                ${fileLinkHtml}
                            </div>
                        `;
                    }).join("");
                
                    $(".modal-body").html(htmlContent);
                }
                } else {
                    $(".modal-body").html('<p class="text-gray-600">Nincs elérhető adat.</p>');
                }
            },
            error: function (xhr, status, error) {
                console.error("Failed to load details:", error);
                $(".modal-body").html('<p class="text-red-500">Hiba történt az adatok betöltésekor.</p>');
            },
        });
    });

    // Tovább gomb
    // "Tovább" gomb – léptetés a 2. lépésre
    // Tovább gomb – léptetés a 2. lépésre



    $("#aru_bevetelezes_gomb").on("click", function () {
        const mentesGomb = $("#aru_bevetelezes_form button[type='submit']");
        mentesGomb.text("Mentés");
        mentesGomb.attr("data-action", "mentes");
        $("#aru_bevetelezes_dialog").removeClass("hidden");
    });


 

    $(document).on("click", "#vissza_gomb", function () {
        
        $("#step2").addClass("hidden");
        $("#step1").removeClass("hidden");
    });


    $(document).on("click", "#megse_gomb4, #megse_gomb3 , #megse_gomb1", function () {
        $.ajax({
            url: '/modul/raktar/server_script/tmp_mappa_torlese.php',
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if(response.status == "success"){
                    closeDialog();
                } else {
                    alert(response.message);
                }
            },
            error: function() {
                alert('Hiba történt a tmp mappa törlése során.');
            }
        });
    });
    $(document).on("click", "#megse_gomb4", function () {
        $('#right_panel').hide();
        $('#dialog_box').removeClass('md:w-2/3').addClass('md:w-1/3');
        $('#toggle_text').text('Hozzáadott áruk');
        $('#chevron_right').removeClass('hidden');
        $('#chevron_left').addClass('hidden');
    });

    let list = [];

    function closeDialog() {
        $("#step1").removeClass("hidden").show(); // Biztosan megjeleníti
        $("#step2").addClass("hidden").hide();    // Biztosan elrejti
        $("#kep_elonezet").addClass("hidden")   // Biztosan elrejti
        $('#bevetelezes_mod').val("");
        $('#lista_tartalom').empty();
        list = []
        $('#lista_section').addClass('hidden').removeClass('block');
        if(mobilnezet){
            $('#lista_section_mobile').addClass('hidden').removeClass('block');
        }
        $("#szamla_kep_form")[0].reset();
        $("#aru_bevetelezes_form")[0].reset();
        $("#aru_kiadas_form")[0].reset();
        
        $("#aru_bevetelezes_dialog").addClass("hidden");
        $("#aru_kiadas_dialog").addClass("hidden");
        
        $('.form-input').removeClass("border-flash border-red-500");
        $('.form-szamla-input').removeClass("border-flash border-red-500");
        $('.form-kiadas-input').removeClass("border-flash border-red-500");
        $('#aru_kiadas').removeClass("border-flash border-red-500");
        
        
        $("#form-alert").addClass("hidden").removeClass("fade-in");
        $("#form-kiadas-alert").addClass("hidden").removeClass("fade-in");
        $("#szamla_kep_form_alert").addClass("hidden");
        $('#hely_pozicio_checkbox').prop('checked', false);
        $('#hely_pozicio_resz').addClass('hidden');
        $('#mobil_reszponziv').addClass('max-w-xl').removeClass('max-w-6xl');
        $('#aru_kep_ha_kell').addClass('hidden');
        
       
    };


    $('#tovabb_gomb').on('click', function () {
        const szamlaSzam = $('#szamla_szam').val();
        $('#step1').hide();
        $('#step2').show();
        $('#bevetelezes_mod').val("1");
        if(szamlaSzam != ""){
            $('#step2h2').text("Áru bevételezése ("+szamlaSzam+")");
        }


    });

    $(document).on("click", "#szamla_nelkul_gomb", function () {
       
        $('#step1').hide();
        $('#step2').show();
        $('#bevetelezes_mod').val("0");
         
     });


    $('#vissza_gomb').on('click', function () {
        $('#step1').show();
        $('#step2').hide();
    });

    

    function hozzaadTermek(aru_id,aruMegnevezes, darab, beszerzesiAr, hely, pozicio, megjegyzes = '', file) {
        let letezoAru = list.find(item => item.aruMegnevezes === aruMegnevezes);
        let file_html = '';
        if (file) {
            file_html = `<a href="${file}" target="_blank">
                            <img src="../assets/png_icon.png" alt="PDF ikon" class="w-6 h-6 md:w-8 md:h-8 md:mx-auto cursor-pointer">
                         </a>`;
        }
        if (letezoAru) {
            letezoAru.darab = parseInt(letezoAru.darab) + parseInt(darab);
            if (beszerzesiAr > letezoAru.beszerzesiAr || beszerzesiAr < letezoAru.beszerzesiAr) {
                letezoAru.beszerzesiAr = beszerzesiAr;
            }
            if (megjegyzes) {
                letezoAru.megjegyzes += '<br>'+megjegyzes;
            }
        } else {
            list.push({aru_id, aruMegnevezes, darab, beszerzesiAr, hely, pozicio, megjegyzes, file_html, file});
        }

        frissitLista();
        if(!mobilnezet){
            $('#lista_section').removeClass('hidden').addClass('block');
        }else{
          
            $('#lista_section_mobile').removeClass('hidden').addClass('block');
            
        }
        
        
    }

    function frissitLista() {
        $('#lista_tartalom').empty();
        $('#lista_tartalom_mobile').empty();
        console.log(list);
        list.forEach(item => {
            if (mobilnezet) {
                $('#lista_tartalom_mobile').append(`
                    <div class="relative bg-white p-4 rounded-lg shadow-md border border-gray-300">
                        <button class="absolute top-2 right-2 text-red-500 hover:text-red-700 delete-list-item-btn text-2xl" 
                            data-name="${item.aruMegnevezes}">
                            X
                        </button>
                        <div class="grid grid-cols-2 gap-2">
                            <p class="text-sm font-bold text-gray-700">Áru megnevezés:</p> 
                            <p class="text-sm text-gray-900">${item.aruMegnevezes}</p>
                            
                            <p class="text-sm font-bold text-gray-700">Darab:</p> 
                            <p class="text-sm text-gray-900">${item.darab}</p>
                            
                            <p class="text-sm font-bold text-gray-700">Beszerzési ár:</p> 
                            <p class="text-sm text-gray-900">${item.beszerzesiAr}</p>
                            
                            <p class="text-sm font-bold text-gray-700">Hely:</p> 
                            <p class="text-sm text-gray-900">${item.hely} / ${item.pozicio}</p>
                            
                            <p class="text-sm font-bold text-gray-700">File:</p> 
                            <p class="text-sm text-gray-900">${item.file_html}</p>
                        </div>
                    </div>

                `);
            } else {
                $('#lista_tartalom').append(`
                    <tr class="border border-gray-300">
                        <td class="border border-gray-300 w-48 text-center p-2">${item.aruMegnevezes}</td>
                        <td class="border border-gray-300 w-16 text-center p-2">${item.darab}</td>
                        <td class="border border-gray-300 text-center p-2">${item.beszerzesiAr}</td>
                        <td class="border border-gray-300 text-center p-2">${item.hely} / ${item.pozicio}</td>
                        <td class="border border-gray-300 text-center p-2">${item.file_html}</td>
                        <td class="border border-gray-300 text-center p-2">
                            <button class="text-red-500 hover:text-red-700 delete-list-item-btn" data-name="${item.aruMegnevezes}">X</button>
                        </td>
                    </tr>
                `);
            }
    
            if (item.megjegyzes) {
                let megjegyzesLines = item.megjegyzes.split('\n'); // sorokra bontás
                megjegyzesLines.forEach(m => {
                    let wrappedText = wrapText(m, 42); // hosszú szövegek tördelése
                    wrappedText.forEach(line => {
                        $('#lista_tartalom').append(`
                            <tr>
                                <td colspan="4" class="p-2 text-gray-600 italic">${line}</td>
                            </tr>
                        `);
                    });
                });
            }
        });
    }
    function torolTermek(aruMegnevezes) {
        // Keresd meg az adott megnevezéshez tartozó elemet a listában
        let index = list.findIndex(item => item.aruMegnevezes === aruMegnevezes);
        if (index !== -1) {
            let file_link_torol = list[index].file;
            $.ajax({
                url: '/modul/raktar/server_script/tmp_mappa_kep_torlese.php',
                type: 'POST',
                data: {file_link: file_link_torol},
                dataType: 'json',
                success: function(response) {
                    if(response.status == "success"){
                        list.splice(index, 1); // Törlés a listából
                        frissitLista(); // Lista frissítése
                        if (list.length === 0) {
                            $("#lista_section").addClass("hidden").removeClass("block");
                            $("#lista_section_mobile").addClass("hidden").removeClass("block");
                        }
                    }
                    else{
                        alert(response.message);
                    }
                },
                error: function() {
                    alert('Hiba történt a fájlok feltöltése során.');
                }
            });
        }
    }
    // Segédfüggvény a szöveg tördelésére
    function wrapText(text, maxLength) {
        let lines = [];
        while (text.length > maxLength) {
            let breakPoint = text.lastIndexOf(' ', maxLength); // szóhatáron törjük
            if (breakPoint === -1) breakPoint = maxLength; // ha nincs szóhatár, akkor egyszerűen levágjuk
            lines.push(text.substring(0, breakPoint));
            text = text.substring(breakPoint).trim();
        }
        if (text.length) lines.push(text); // az utolsó rész hozzáadása
        return lines;
    }


    $(document).on("click", ".delete-list-item-btn", function () {
        let aruMegnevezes = $(this).data("name");
        torolTermek(aruMegnevezes);
    });
    

    $('#bevetelezes_gomb').on('click', function (e) {
        e.preventDefault();
        
        
        const aru_id=$('#aru_bevetelezes_form .aru_id').val();
        const aruMegnevezes = $('#aru_megnevezes').val();
        const darab = $('#darab').val();
        const beszerzesiAr = $('#beszerzesiAr').val();
        const hely = $('#hely').val();
        const pozicio = $('#pozicio').val();
        const megjegyzes = $('#megjegyzes').val();

        

        let isValid = true;
        let missingFields = [];

        $(".form-input").each(function () {
            if ($(this).val().trim() === "") {
                isValid = false;
                missingFields.push($(this).attr("id"));
                $(this).addClass("border-flash border-red-500");
            } else {
                $(this).removeClass("border-flash border-red-500");
            }
        });
        if (!isValid) {
            $("#form-alert").removeClass("hidden").addClass("fade-in");
            return;
        }

        // Ha nincs hiba
        $("#form-alert").addClass("hidden").removeClass("fade-in");





        var aru_kepe_van = '';
        var aru_kepe_file = $('#aru_kepe_bevetelezes')[0];
        if (aru_kepe_file && aru_kepe_file.files.length > 0) {
            var aru_kepe_formdata = new FormData();
            var fileName = $('#aru_megnevezes').val();
            aru_kepe_formdata.append('aru_kepek', aru_kepe_file.files[0]);
            aru_kepe_formdata.append('aru_kep_nev', fileName);
            $.ajax({
                url: '/modul/raktar/server_script/tmp_mappa_generalas.php',
                type: 'POST',
                data: aru_kepe_formdata,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.status === 'success') {
                        console.log("sikeres");
                        aru_kepe_van = response.file;
                        hozzaadTermek(aru_id,aruMegnevezes, darab, beszerzesiAr, hely, pozicio, megjegyzes, aru_kepe_van);
                    } else {
                        alert('Hiba: ' + response.message);
                    }
                },
                error: function() {
                    alert('Hiba történt a fájlok feltöltése során.');
                }
            });
        }
        else{
            hozzaadTermek(aru_id,aruMegnevezes, darab, beszerzesiAr, hely, pozicio, megjegyzes, aru_kepe_van);
        }

        $("#aru_bevetelezes_form")[0].reset();
        $('#aru_bevetelezes_form .aru_id').val('');



        if(mobilnezet){
        const mobil_reszponziv =$('#mobil_reszponziv');
        const mobil_step_reszponziv = $('#mobil_step_reszponziv');
        
        mobil_reszponziv.removeClass('flex').addClass('grid grid-cols-1 md:grid-cols-2 overflow-y-auto example ');
        mobil_step_reszponziv.removeClass('w-2/3')
        }else{
            const mobil_reszponziv =$('#mobil_reszponziv');
            mobil_reszponziv.removeClass('max-w-xl').addClass('max-w-6xl');
        }
    });


    let file_van = false;


    $('#szamla_kep').on('change', function (event) {


        if (this.files.length > 0) {
            file_van = true;
        } else {
            file_van = false;
        }


        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#kep_elonezet').attr('src', e.target.result).removeClass('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    
    $(document).on('click', '#lezaras_gomb, #lezaras_gomb_mobile', function (e) {
        
        e.preventDefault();
        let formData = new FormData($("#szamla_kep_form")[0]);
        const bevetelezes_mod = $('#bevetelezes_mod').val();
        const szamlaSzam = $('#szamla_szam').val();
        $.each(list, function(index, item) {
            item.darab = parseInt(item.darab.toString().replace(/\s+/g, ''), 10);
            item.beszerzesiAr = parseInt(item.beszerzesiAr.toString().replace(/\s+/g, ''), 10);
        });
        if(bevetelezes_mod == "1"){
            let missingFields = [];

            $(".form-szamla-input").each(function () {
                if ($(this).val().trim() === "") {
                    isValid = true;
                    missingFields.push($(this).attr("id"));
                    $(this).addClass("border-flash border-red-500");
                } else {
                    $(this).removeClass("border-flash border-red-500");
                }
            });
            if(file_van == false || szamlaSzam == ""){
                $('#step2').hide();
                $('#step1').show();
                $("#szamla_kep_form_alert").removeClass("hidden").addClass("fade-in");
                return;
            }
            $("#szamla_kep_form_alert").addClass("hidden").removeClass("fade-in");




            $.ajax({
                type: "POST",
                url: "/modul/raktar/server_script/raktar_szamla_feldolg.php",
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                
                success: function (response) {
                    $.ajax({
                        type: "POST",
                        url: "/modul/raktar/server_script/aru_bevetelezes.php",
                        data: { list: JSON.stringify(list), bevetelezes_mod: bevetelezes_mod, szamla_id: response.szamla_id  },  
                        dataType: 'json',
                        success: function (response) {
                            if (response.status === "success") {
                                table.setData();
                                closeDialog();
                            } else {
                                alert(response.message || "Nem sikerült menteni az árukat.");
                            }
                        },
                        error: function (err) {
                            console.error("Mentési hiba:", err);
                            alert("Hiba történt az adatbázis művelet során.");
                        }
                    });
                },

                error: function (err) {
                    alert("Hiba történt az adatbázis művelet során.");
                }
            });
        }
        else{
            
            $.ajax({
                type: "POST",
                url: "/modul/raktar/server_script/aru_bevetelezes.php",
                data: { list: JSON.stringify(list), bevetelezes_mod: bevetelezes_mod },  
                dataType: 'json',
                success: function (response) {
                    if (response.status === "success") {
                        table.setData();
                        closeDialog();
                    } else {
                        alert(response.message || "Nem sikerült menteni az árukat.");
                    }
                },
                error: function (err) {
                    console.error("Mentési hiba:", err);
                    alert("Hiba történt az adatbázis művelet során.");
                }
            });
        }
       

    });





    




    
       
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################


//                                                          KIADÁS





$("#aru_kiadas_gomb").on("click", function () {
    
   
    $("#aru_kiadas_dialog").removeClass("hidden");

  
});


$('#kiadas_file').on('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#kiadas_file_elonezet').attr('src', e.target.result).removeClass('hidden');
        };
        reader.readAsDataURL(file);
    }
});



$(document).on("click","#aru_kiadas_submit", function (e) {
    e.preventDefault();
    let isValid = true;
    let missingFields = [];
    const aru_kiadas_mod = $('#aru_kiadas').attr('data-value');
    $(".form-kiadas-input").each(function () {
        if ($(this).val().trim() === "") {
            isValid = false;
            missingFields.push($(this).attr("id"));
            $(this).addClass("border-flash border-red-500");
        } else {
            $(this).removeClass("border-flash border-red-500");
        }
    });
    if(!aru_kiadas_mod){
        $("#aru_kiadas").addClass("border-flash border-red-500");
        $("#form-kiadas-alert").removeClass("hidden").addClass("fade-in");
        return;
    }
    else{
        $("#aru_kiadas").removeClass("border-flash border-red-500");
        $("#form-kiadas-alert").addClass("hidden").removeClass("fade-in");
    }
    if (!isValid) {
        $("#form-kiadas-alert").removeClass("hidden").addClass("fade-in");
        return;
    }
    // Ha nincs hiba
    $("#form-kiadas-alert").addClass("hidden").removeClass("fade-in");

    var formData = new FormData($("#aru_kiadas_form")[0]);
    formData.append('aru_kiadas', aru_kiadas_mod);
    $.ajax({
        url: "/modul/raktar/server_script/aru_kiadas.php", 
        method: "POST",
        data: formData,
        dataType: "json", 
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status == 'success') {
                $("#aru_kiadas_form")[0].reset(); // Form ürítése
                $("#aru_kiadas_dialog").addClass("hidden"); // Ablak elrejtése
                table.setData();
            } else {
                alert("Hiba: " + response.message); // Hibaüzenet megjelenítése
            }
        },
        error: function (err) {
            console.error("Hiba az AJAX kérés során:", err);
            alert("Hálózati hiba vagy szerverhiba történt!");
        }
    });
});




//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################
//########################################################################################################################################

//AUTOCOMPLETEEEE

$(document).on('input', '.aru_megnevezes_input', function () {
    $('#aru_kep_ha_kell').removeClass('hidden');
    var query = $(this).val().trim();
    var results = $(this).siblings('.autocomplete-results'); // KERESÉS: Nem .next(), hanem .siblings()

    if (query.length < 1) {
        results.empty().addClass('hidden');
        return;
    }

    $.ajax({
        url: '/modul/raktar/server_script/aru_lista_autocomplete.php',
        method: 'GET',
        data: { term: query },
        dataType: 'json',
        success: function (response) {
            results.empty().removeClass('hidden');

            if (response.length > 0) {
                response.forEach(function (item) {
                    var listItem = $('<li></li>')
                        .addClass("px-4 py-2 hover:bg-zold-100 cursor-pointer")
                        .attr("data-value", item.aru_id)
                        .text(item.aru_megnevezes);

                    results.append(listItem);
                });

                results.css("display", "block"); // Biztosan látható legyen
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

    var inputField = $(this).closest('.autocomplete-results').siblings('.aru_megnevezes_input'); 
    var hiddenField = inputField.siblings('.aru_id'); 

    inputField.val(selectedText);
    hiddenField.val(selectedValue);

    // A lista kiürítése és teljes elrejtése
    var results = $(this).parent('.autocomplete-results');
    results.empty().addClass('hidden');
    $('#aru_kep_ha_kell').addClass('hidden');
    $('#aru_kepe_bevetelezes').val('');
});


$(document).click(function (event) {
    if (!$(event.target).closest('.aru_megnevezes_input, .autocomplete-results').length) {
        $('.autocomplete-results').empty().addClass('hidden').css("display", "none");
    }
});



//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//############################        Hármas Tagolás            ################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################

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

$('#hely_pozicio_checkbox').on('change', function() {
    if ($(this).is(':checked')) {
      $('#hely_pozicio_resz').removeClass('hidden');
    } else {
      $('#hely_pozicio_resz').addClass('hidden');
      $('#hely').val('');
      $('#pozicio').val('');
    }
  });






    window.addEventListener('resize', function () {
        const firstButton = $('.tabulator-page[data-page="first"]');
        const lastButton = $('.tabulator-page[data-page="last"]');
        const paginationCounter = $('.tabulator-page-counter');
        const szamlaButton = $('#szamla_nelkul_gomb'); 
        const tovabb_gomb = $('#tovabb_gomb');   
        const lista_section_darab = $('#lista_section_darab');
        const lista_section=$('#lista_section');
        

        if (mobilnezet) {
            szamlaButton.text('Nincs számla');
            tovabb_gomb.text('→');
            lista_section_darab.text('DB');
            firstButton.css('display', 'none');
            lastButton.css('display', 'none');
            paginationCounter.addClass('hidden');
            lista_section.addClass('hidden');
            
        } else {
            tovabb_gomb.text('Tovább');
            szamlaButton.text('Feltöltés számla nélkül');
            lista_section_darab.text('Darab');
            firstButton.css('display', 'inline-block');
            lastButton.css('display', 'inline-block');
            paginationCounter.removeClass('hidden');
           
        }
    });
    table.on("tableBuilt", function () {
        const firstButton = $('.tabulator-page[data-page="first"]');
        const lastButton = $('.tabulator-page[data-page="last"]');
        const paginationCounter = $('.tabulator-page-counter');
        const szamlaButton = $('#szamla_nelkul_gomb'); 
        const tovabb_gomb = $('#tovabb_gomb');   
        const lista_section_darab = $('#lista_section_darab');
        const lista_section=$('#lista_section');
        
       
        
        if (mobilnezet) {
            szamlaButton.text('Nincs számla');
            tovabb_gomb.text('→');
            lista_section_darab.text('DB');
            firstButton.css('display', 'none');
            lastButton.css('display', 'none');
            paginationCounter.addClass('hidden');
            lista_section.addClass('hidden');
            
            
        } else {
            tovabb_gomb.text('Tovább');
            szamlaButton.text('Feltöltés számla nélkül');
            lista_section_darab.text('Darab');
            firstButton.css('display', 'inline-block');
            lastButton.css('display', 'inline-block');
            paginationCounter.removeClass('hidden');
            
        }
    });



function openHelyDialog(places) {
  $("#helyGrid").empty();

  Object.entries(places).forEach(([key, value]) => {
    $("#helyGrid").append(`
      <div class="bg-gray-100 p-4 rounded-lg shadow-md flex items-center justify-between">
        <h3 class="text-lg font-semibold text-zold-500">${value}</h3>
        <img src="assets/delete_icon.png" alt="Törlés" data-hely_id="${key}" class="w-10 h-10 cursor-pointer hover:scale-110 transition delete-hely-btn">
      </div>
    `);
  });

  $("#helyDialog").removeClass("hidden");
}
function hely_adat_betoltes(raktar_id){
    $.ajax({
        url: '/modul/raktar/server_script/aru_helyek_betoltes.php',
        method: 'POST',
        dataType: 'json',
        data: {
            raktar_id: raktar_id
        },
        success: function(response) {
            openHelyDialog(response);
        }
    });
}

    // Bezárás gomb kezelése
    $("#helyDialogCloseBtn").on("click", function() {
        $("#helyDialog").addClass("hidden");
        $("#helyGrid").empty();
        $("#raktar_id").val('');
        $("#tarolas_helye_input").val('');
        $("#polc_fiok_input").val('');
        $('.ujhely_input').removeClass('border-flash border-red-500');
        $('#ujhely_form_alert').addClass('hidden').removeClass('fade-in');
    });

    $(document).on("click", ".edit-hely-btn", function(e) {
        e.stopPropagation();
        let raktar_id_edit = $(this).data('raktar_id');
        let aru_megnevezes = $(this).attr('name');
        $('#raktar_id').val(raktar_id_edit);
        $('#hely_dialog_title').text(aru_megnevezes + ' helyei');
        hely_adat_betoltes(raktar_id_edit);
    });
    $(document).on("click", ".edit-hely-btn-mobil", function(e) {
        e.stopPropagation();
        let raktar_id_edit_mobil = $(this).data('raktar_id');
        let aru_megnevezes_mobil = $(this).attr('name');
        $('#raktar_id').val(raktar_id_edit_mobil);
        $('#detailsModal').addClass('hidden');
        $('#hely_dialog_title').text(aru_megnevezes_mobil + ' helyei');
        hely_adat_betoltes(raktar_id_edit_mobil);
    });
    $(document).on("click", "#vissza_gomb_mobil", function(e) {
        $('#helyDialog').addClass('hidden');
        $('#detailsModal').removeClass('hidden');
    });
    $(document).on("click", "#addHelyBtn", function(e) {
        e.stopPropagation();
        let raktar_id = $('#raktar_id').val();
        let tarolas_helye = $('#tarolas_helye_input').val();
        let polc_fiok = $('#polc_fiok_input').val();
        let isValid = true;
    
        if (tarolas_helye === "") {
            $('#tarolas_helye_input').addClass('border-flash border-red-500');
            isValid = false;
        } else {
            $('#tarolas_helye_input').removeClass('border-flash border-red-500');
        }
        
        if (polc_fiok === "") {
            $('#polc_fiok_input').addClass('border-flash border-red-500');
            isValid = false;
        } else {
            $('#polc_fiok_input').removeClass('border-flash border-red-500');
        }
        
        if (!isValid) {
            $('#ujhely_form_alert').removeClass('hidden').addClass('fade-in');
            return;
        } else {
            $('#ujhely_form_alert').addClass('hidden').removeClass('fade-in');
        }

            $.ajax({
                url: '/modul/raktar/server_script/aru_hely_hozzad.php',
                method: 'POST',
            dataType: 'json',
            data: {
                raktar_id: raktar_id,
                tarolas_helye: tarolas_helye,
                polc_fiok: polc_fiok
            },
            success: function(response) {
                if(response.status == 'success'){
                    $("#ujHelyForm")[0].reset();
                    table.setData();
                    hely_adat_betoltes(raktar_id);
                    return;
                }
                else{
                    alert(response.message);
                }
            }
        });
    });


    $(document).on("click", ".delete-hely-btn", function(e) {
        e.stopPropagation();
        let raktar_id = $('#raktar_id').val();
        let hely_id = $(this).data('hely_id');
        $.ajax({
            url: '/modul/raktar/server_script/aru_hely_torles.php',
            method: 'POST',
            dataType: 'json',
            data: {
                hely_id: hely_id,
            },
            success: function(response) {
                if(response.status == 'success'){
                    table.setData();
                    hely_adat_betoltes(raktar_id);
                    
                }
                else{
                    alert(response.message);
                }
            }
        });
    });

    $(document).on('click', '#aru_kiadas', function(){
        $('#custom_dropdown').toggle();
    });
    $(document).on('click', '.tipus_sor', function() {
        const selectedValue = $(this).data('value');
        const selectedText = $(this).text();
        $('#aru_kiadas span').text(selectedText);
        $('#aru_kiadas').attr('data-value', selectedValue);
        if(selectedValue == 3){
            $('#munkalap_nev_div').removeClass('hidden');
        }
        else{
            $('#munkalap_nev_div').addClass('hidden');
        }
        $('#custom_dropdown').hide();
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#aru_kiadas').length) {
            $('#custom_dropdown').hide();
        }
    });


//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//################        Kiadás AC + munkalaphoz rendelt tábla            #####################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################
//##############################################################################################




    //##################autocomplete########################
    $(document).on('input', '#munkalap_nev', function () {
        var query = $(this).val().trim();
        var results = $(this).siblings('.munkalap_ac_results'); // KERESÉS: Nem .next(), hanem .siblings()
    
        if (query.length < 1) {
            results.empty().addClass('hidden');
            return;
        }
    
        $.ajax({
            url: '/modul/raktar/server_script/ac_munkalap_lista.php',
            method: 'POST',
            data: { term: query },
            dataType: 'json',
            success: function (response) {
                results.empty().removeClass('hidden');
    
                if (response.projekt_adatok.length > 0) {
                    response.projekt_adatok.forEach(function (item) {
                        var listItem = $('<li></li>')
                            .addClass("px-4 py-2 hover:bg-zold-100 cursor-pointer")
                            .attr("data-value", item.munkalap_id)
                            .text(item.munkalap_nev);
    
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
    
    $(document).on('click', '.munkalap_ac_results li', function () {
        var selectedValue = $(this).data('value');
        var selectedText = $(this).text();
    
        var inputField = $('#munkalap_nev'); 
        var hiddenField = $('#munkalap_id'); 
    
        inputField.val(selectedText);
        hiddenField.val(selectedValue);
    
        var results = $(this).parent('.munkalap_ac_results');
        results.empty().addClass('hidden');
        const isExpanded = $('#right_panel').is(':visible');

        $.ajax({
            url: '/modul/raktar/server_script/hozzarendelt_aru_lista.php',
            method: 'POST',
            data: { munkalap_id: selectedValue },
            dataType: 'json',
            success: function(response) {
                populateItems(response);
            }
        });
        if(mobilnezet){
            $('#open_right_panel').removeClass('hidden');
            $('#right_panel').hide();
            $('#kiadas_form_container').show();
        }
        else{
            if(!isExpanded){
                $('#dialog_box').removeClass('md:w-1/3').addClass('md:w-2/3');
                $('#right_panel').show();
                $('#toggle_text').text('Elrejtés');
                $('#chevron_right').addClass('hidden');
                $('#chevron_left').removeClass('hidden');
                $('#open_right_panel').addClass('hidden');
            }
        }
    });


    $(document).click(function (event) {
        if (!$(event.target).closest('.munkalap_nev_input, .munkalap_ac_results').length) {
            $('.munkalap_ac_results').empty().addClass('hidden');
        }
    });

    $(document).on("click", "#close_right_panel", function () {
        if (mobilnezet) {
            // Rejtjük a jobb panelt
            $('#right_panel').hide();
            // Visszaállítjuk a dialog_box méretét
            $('#dialog_box').removeClass('md:w-2/3').addClass('md:w-1/3');
            $('#toggle_text').text('Hozzáadott áruk');
            $('#chevron_right').removeClass('hidden');
            $('#chevron_left').addClass('hidden');
            // Megjelenítjük az open gombot
            $('#open_right_panel').removeClass('hidden');
            // Visszaállítjuk a form konténer láthatóságát
            $('#kiadas_form_container').show();
        }
        else{
            $('#right_panel').hide();
            $('#dialog_box').removeClass('md:w-2/3').addClass('md:w-1/3');
            $('#toggle_text').text('Hozzáadott áruk');
            $('#chevron_right').removeClass('hidden');
            $('#chevron_left').addClass('hidden');
            $('#open_right_panel').removeClass('hidden');
        }
    });

    $(document).on("click", "#open_right_panel", function () {
        if (mobilnezet) {
            // Megjelenítjük a jobb oldali panelt
            $('#right_panel').show();
            // Átállítjuk a dialog_box méretét
            $('#dialog_box').removeClass('md:w-1/3').addClass('md:w-2/3');
            $('#toggle_text').text('Elrejtés');
            $('#chevron_right').addClass('hidden');
            $('#chevron_left').removeClass('hidden');
            // Elrejtjük az open gombot
            $('#open_right_panel').addClass('hidden');
            // Elrejtjük a form konténert
            $('#kiadas_form_container').hide();
        }
        else{
            $('#right_panel').show();
            $('#dialog_box').removeClass('md:w-1/3').addClass('md:w-2/3');
            $('#toggle_text').text('Elrejtés');
            $('#chevron_right').addClass('hidden');
            $('#chevron_left').removeClass('hidden');
            $('#open_right_panel').addClass('hidden');
        }
    });
    //##################autocomplete vége########################
    
    function populateItems(hozzarendelt_aruk) {
        let totalQuantity = 0;
        let html = '';
    
        hozzarendelt_aruk.forEach(item => {
            totalQuantity += parseInt(item.darab);
            html += `
                <div class="grid grid-cols-12 gap-2 py-2 border-b border-gray-200 hover:bg-white">
                    <div class="col-span-2 text-gray-600">${item.aru_id}</div>
                    <div class="col-span-7">${item.aru_megnevezes}</div>
                    <div class="col-span-3 text-right pr-4">${item.darab}</div>
                </div>
            `;
        });
    
        $('#items_container').html(html);
        $('#total_quantity').text(totalQuantity + ' db');
    }


    $(document).on('click', '.munkalap_link', function(){
        let munkalap_id = $(this).data('munkalap_id');
        document.cookie = `utolso_munkalap_id=${munkalap_id}; path=/; max-age=${30*24*60*60}`;
        window.location.href = `/?menu_id=3`;
    });
    
});