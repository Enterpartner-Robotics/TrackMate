$(document).ready(function () {

    socket.on('update_aru_tabla', function (data) {
        if(data.update == 'aru_tabla'){
            table.setData();
        }
    });

    // Adatok a táblázathoz
    const table = new Tabulator("#arutorzs_tabla", {
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
        responsiveLayout: "true",
        ajaxURL: "/modul/arutorzs/server_script/aru_tabla_betoltes.php",
        ajaxContentType: "json",
        ajaxParams: { search: '' },

        ajaxResponse: function (url, params, response) {
            console.log("JSON válasz:", response);

            return {
                data: response.data,
                last_page: response.last_page,
            };
        },

        layout: "fitColumns",
        placeholder: "Nincs adat",
        columns: [
            { title: "ID", field: "aru_id", width: 70, hozAlign: "center", cssClass: "block", sorter: "number" },
            { title: "Megnevezés", field: "aru_megnevezes", minWidth: 200, maxWidth: 600, widthGrow: 3, cssClass: "hidden md:table-cell" },
            { title: "Típus", field: "aru_tipus", minWidth: 100, cssClass: "hidden lg:table-cell" },
            { title: "Áru Típus id", field: "aru_tipus_id", visible: false },
            { title: "Megjegyzés", field: "megjegyzes", minWidth: 250, cssClass: "hidden lg:table-cell" },
            { 
                title: "Kép", 
                field: "file_link", 
                minWidth: 100, 
                cssClass: "hidden lg:table-cell",
                formatter: function (cell, formatterParams, onRendered) {
                    const fileSrc = cell.getValue();
                    if (!fileSrc) return "";
                    return `<img src="assets/png_icon.png" data-src="${fileSrc}" class="w-8 h-8 mx-auto cursor-pointer hover:scale-110 transition no-row-click" />`;
                }
            }
        ],
        initialSort: [
            { column: "aru_id", dir: "desc" }
        ]


    });
    $(document).on("click", "#arutorzs_tabla img", function (event) {
        event.stopPropagation();
        const originalSrc = $(this).attr("data-src");
        if (originalSrc) {
            window.open(originalSrc, "_blank");
        }
    });


    $('#search-box').on('input', function () {
        const searchQuery = $(this).val();  // Keresési kifejezés
        table.setData('/modul/arutorzs/server_script/aru_tabla_betoltes.php', { search: searchQuery });  // Keresési paraméterek átadása
    });

    $("#megse-gomb-tipus").on("click", function () {
        $("#aru-tipus-dialog").addClass("hidden");
        $("#aru_tipus_uj").removeClass("border-flash border-red-500");
        $("#form-alert-tipus").addClass("hidden").removeClass("fade-in");
        $("#aru-tipus-form")[0].reset();
    });

    $("#aru_tipus_hozzaad_gomb").on("click", function () {
        $("#aru-tipus-dialog").removeClass("hidden");
    });




    $("#aru_hozzaad_gomb").on("click", function () {
        const mentesGomb = $("#aru-form button[type='submit']");
        mentesGomb.text("Mentés");
        mentesGomb.attr("data-action", "mentes");
        $('#kep_elonezet').addClass('hidden');
        $('#aru_kep').removeClass('hidden');
        $('#file-info').addClass('hidden');
        $("#aru-dialog").removeClass("hidden");

    });
    
    $("#megse-gomb").on("click", function () {
        $("#aru-dialog").addClass("hidden");
        $("#torles-gomb").addClass("hidden");
        $("#kep_elonezet").addClass("hidden");
        $("#form-alert").addClass("hidden").removeClass("fade-in");
        $(".form-input").removeClass("border-flash border-red-500");
        $("#aru-form")[0].reset();
    });

    $("#torles-gomb").on("click", function () {
        const torol_aru_id = $("#torles-gomb").attr("data-id");
        $.ajax({
            type: "POST",
            url: "/modul/arutorzs/server_script/aru_torol.php", // A szerkesztéshez használt PHP fájl
            data: {
                torol_aru_id: torol_aru_id
            },
            success: function (data) {
                table.setData(); // Táblázat frissítése
                $("#aru-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                $("#aru-dialog").addClass("hidden"); // Dialógus bezárása
                $("#torles-gomb").addClass("hidden");
            },
            error: function (err) {
                console.error("Hiba történt a szerkesztés során:", err);
                alert("Hiba történt a aru adatainak szerkesztése közben!");
            }
        });
    });








    // Űrlap beküldése
    $("#aru-form").on("submit", function (e) {
        e.preventDefault();


        const action = $("#aru-form button[type='submit']").attr("data-action");
        const aruId = $("#aru-form button[type='submit']").attr("data-id");
        let formData = new FormData(this);
        formData.append("aru_id", aruId);
        // Validáció
        let isValid = true;
        let missingFields = [];

        // Ellenőrizzük az input mezőket
        $(".form-input").each(function () {
            if ($(this).val().trim() === "") {
                isValid = false;
                missingFields.push($(this).attr("id")); // Hiányzó mezők ID-jai
                $(this).addClass("border-flash border-red-500"); // Egyedi animáció hozzáadása
            } else {
                $(this).removeClass("border-flash border-red-500"); // Eltávolítjuk a hibát, ha helyesen van kitöltve
            }
        });

        if (!isValid) {
            $("#form-alert").removeClass("hidden").addClass("fade-in"); // Figyelmeztetés megjelenítése animációval
            return; // Megállítjuk a feldolgozást
        }

        // Figyelmeztetés elrejtése, ha nincs hiba
        $("#form-alert").addClass("hidden").removeClass("fade-in");

    
        if (action === "edit") {
            // Ha szerkesztésről van szó
            $.ajax({
                type: "POST",
                url: "/modul/arutorzs/server_script/aru_szerk.php", // A szerkesztéshez használt PHP fájl
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    table.setData(); // Táblázat frissítése
                    //alert(response.message);
                    $("#aru-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                    $("#aru-dialog").addClass("hidden"); // Dialógus bezárása
                    $("#torles-gomb").addClass("hidden");
                    $("#aru_tipus_id").val("");

                },
                error: function (err) {
                    console.error("Hiba történt a szerkesztés során:", err);
                    alert("Hiba történt a aru adatainak szerkesztése közben!");
                }
            });
        } else {
            // Új aru mentése (a meglévő mentési logikát itt tarthatod)
            $.ajax({
                type: "POST",
                url: "/modul/arutorzs/server_script/aru_feldolg.php",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    table.setData(); // Táblázat frissítése
                    //alert(response.message);
                    $("#aru-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                    $("#aru-dialog").addClass("hidden"); // Dialógus bezárása
                    $("#aru_tipus_id").val("");
                },
                error: function (err) {
                    console.error("Hiba történt a mentés során:", err);
                    alert("Hiba történt a áru adatainak mentése közben!");
                }
            });
        }

        // Dialógusablak bezárása
        $("#aru-dialog").addClass("hidden");
    });




    $('#aru_kep').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#kep_elonezet').attr('src', e.target.result).removeClass('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    $(document).on("click", "#file-delete", function () {
        const filePath = $(this).attr("data-file"); // A törlendő fájl elérési útja
        const aru_id = $(this).attr("data-id"); // A törlendő fájl elérési útja
    
        $.ajax({
            type: "POST",
            url: "/modul/arutorzs/server_script/aru_kep_torles.php", // A törlésért felelős PHP fájl
            data: { file_path: filePath, aru_id: aru_id },
            dataType: 'json',
            success: function (response) {
                if (response.status === "success") {
                    $("#file-info").addClass("hidden"); // Eltünteti a fájl megjelenítését
                    $("#aru_kep").removeClass("hidden"); // Visszahozza a fájlfeltöltő inputot
                    table.setData(); // Táblázat frissítése
                } else {
                    alert("Hiba történt a törlés közben: " + response.message);
                }
            },
            error: function () {
                alert("Hiba történt a szerver elérése közben.");
            }
        });
    });
    







    // #aru-tipus-form beküldése
    $("#aru-tipus-form").on("submit", function (e) {
        e.preventDefault();

        // Validáció
        let isValid = true;

        if ($('#aru_tipus_uj').val().trim() === "") {
            isValid = false;
            $('#aru_tipus_uj').addClass("border-flash border-red-500"); // Egyedi animáció hozzáadása
        } else {
            $('#aru_tipus_uj').removeClass("border-flash border-red-500"); // Eltávolítjuk a hibát, ha helyesen van kitöltve
        }


        if (!isValid) {
            $("#form-alert-tipus").removeClass("hidden").addClass("fade-in"); // Figyelmeztetés megjelenítése animációval
            return; // Megállítjuk a feldolgozást
        }

        // Figyelmeztetés elrejtése, ha nincs hiba
        $("#form-alert-tipus").addClass("hidden").removeClass("fade-in");

        
        // Ha minden mező ki van töltve
        let aru_tipus_nev = $('#aru_tipus_uj').val();

        $.ajax({
            type: "POST",
            url: "/modul/arutorzs/server_script/aru_tipus_feldolg.php",
            dataType: 'json',
            data: {
                aru_tipus_nev: aru_tipus_nev
            },
            success: function (response) {
                if(response.status === 'success'){
                    $("#aru-tipus-form")[0].reset();
                    $("#aru-tipus-dialog").addClass("hidden");
                    $("#alert_tipus_jo").html(response.message);
                    alert_tipus_jo_mutat();
                }
                else{
                    $("#alert_tipus_nemjo").html(response.message);
                    alert_tipus_nemjo_mutat();
                }
                
            },
            error: function (err) {
                console.error("Hiba történt a szerkesztés során:", err);
                alert("Hiba történt a áru típus adatainak szerkesztése közben!");
            }
        });
    });








    table.on("rowClick", function (e, row) {
        if ($(e.target).hasClass("no-row-click")) {
            return; // Kilépés, ha a kép lett megnyomva
        }
        const sorAdat = row.getData();
        const fileLink = row.getData().file_link;
        
        
        if (fileLink && fileLink.trim() !== "") {
            $('#kep_elonezet').addClass('hidden');
            $('#aru_kep').addClass('hidden');
            $('#file-link').attr('href', fileLink).text("Fájl megtekintése ITT");
            $('#file-delete').attr('data-file', fileLink);
            $('#file-delete').attr('data-id', sorAdat.aru_id);
            $('#file-info').removeClass('hidden');
        }else {
            $('#kep_elonezet').addClass('hidden');
            $('#aru_kep').removeClass('hidden');
            $('#file-info').addClass('hidden');
        }



        $("#aru_megnevezes").val(sorAdat.aru_megnevezes);
        $("#aru_tipus").val(sorAdat.aru_tipus);
        $("#megjegyzes").val(sorAdat.megjegyzes);



        const szerkGomb = $("#aru-form button[type='submit']");
        const torolGomb = $("#torles-gomb");
        szerkGomb.text("Szerkesztés");
        szerkGomb.attr("data-action", "edit");
        szerkGomb.attr("data-id", sorAdat.aru_id);
        torolGomb.attr("data-id", sorAdat.aru_id);

        // Nyissuk meg a dialógusablakot
        $("#aru-dialog").removeClass("hidden");
        $("#torles-gomb").removeClass("hidden");
    });

    window.addEventListener('resize', function () {
        const firstButton = $('.tabulator-page[data-page="first"]');
        const lastButton = $('.tabulator-page[data-page="last"]');
        const paginationCounter = $('.tabulator-page-counter');

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            firstButton.css('display', 'none');
            lastButton.css('display', 'none');
            paginationCounter.addClass('hidden');
        } else {
            firstButton.css('display', 'inline-block');
            lastButton.css('display', 'inline-block');
            paginationCounter.removeClass('hidden');
        }
    });


    table.on("tableBuilt", function () {
        const firstButton = $('.tabulator-page[data-page="first"]');
        const lastButton = $('.tabulator-page[data-page="last"]');
        const paginationCounter = $('.tabulator-page-counter');

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            firstButton.css('display', 'none');
            lastButton.css('display', 'none');
            paginationCounter.addClass('hidden');
        } else {
            firstButton.css('display', 'inline-block');
            lastButton.css('display', 'inline-block');
            paginationCounter.removeClass('hidden');
        }

    });

    // Autocomplete beállítása az aru_tipus input mezőhöz
    // Az input mező, amelyhez autocomplete-t szeretnénk
    $('#aru_tipus').on('input', function () {
        var query = $(this).val().trim();

        // Ha üres a keresés, akkor ne küldjünk kérést
        if (query.length < 1) {
            $('#autocomplete-results').empty().addClass('hidden');
            return;
        }

        $.ajax({
            url: '/modul/arutorzs/server_script/arutipus.php',
            method: 'GET',
            data: { tipus_kereses: query },
            dataType: 'json',
            success: function (response) {
                if (response.data.length > 0) {
                    // Ha vannak találatok, jelenítse meg őket
                    var results = $('#autocomplete-results');
                    results.empty().removeClass('hidden');

                    response.data.forEach(function (item) {
                        results.append(
                            '<li class="px-4 py-2 hover:bg-zold-100 cursor-pointer" data-value="' + item.aru_tipus_id + '">' +
                            item.tipus_megnevezes +
                            '</li>'
                        );
                    });
                } else {
                    $('#autocomplete-results').empty().addClass('hidden');
                }
            }
        });
    });

    // Kattintás esetén kitöltjük az inputot a választott értékkel
    $(document).on('click', '#autocomplete-results li', function () {
        var selectedValue = $(this).data('value');
        var selectedText = $(this).text(); // A kiválasztott szöveget (tipus_megnevezes) beállítjuk

        $('#aru_tipus').val(selectedText); // A szöveget kitöltjük az input mezőbe
        $('#aru_tipus_id').val(selectedValue); // Az ID-t a rejtett inputba töltjük
        $('#autocomplete-results').empty().addClass('hidden');
    });

    // A lista eltüntetése, ha valahol máshol kattintunk
    $(document).click(function (event) {
        if (!$(event.target).closest('#aru_tipus').length) {
            $('#autocomplete-results').empty().addClass('hidden');
        }
    });



    function alert_tipus_jo_mutat() {
        const alertBox = $("#alert_tipus_jo");
        
        // Megjelenítjük az alertet
        alertBox.removeClass("hidden opacity-0").addClass("opacity-100");
    
        // 0.5 másodperc múlva elhalványítjuk
        setTimeout(() => {
            alertBox.removeClass("opacity-100").addClass("opacity-0");
    
            // 0.5 másodperc múlva teljesen elrejtjük
            setTimeout(() => {
                alertBox.addClass("hidden");
            }, 1500); // Az eltűnés animáció ideje
        }, 1500); // Látható ideje
    }

    function alert_tipus_nemjo_mutat() {
        const alertBox = $("#alert_tipus_nemjo");
        
        // Megjelenítjük az alertet
        alertBox.removeClass("hidden opacity-0").addClass("opacity-100");
    
        // 0.5 másodperc múlva elhalványítjuk
        setTimeout(() => {
            alertBox.removeClass("opacity-100").addClass("opacity-0");
    
            // 0.5 másodperc múlva teljesen elrejtjük
            setTimeout(() => {
                alertBox.addClass("hidden");
            }, 1500); // Az eltűnés animáció ideje
        }, 1500); // Látható ideje
    }
    

});