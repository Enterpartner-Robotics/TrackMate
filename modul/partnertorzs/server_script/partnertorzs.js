$(document).ready(function () {



    // Adatok a táblázathoz
    const table = new Tabulator("#partnertorzs_tabla", {
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
        ajaxURL: "/modul/partnertorzs/server_script/partner_tabla_betoltes.php",
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
            { title: "ID", field: "partner_id", width: 70, hozAlign: "center", cssClass: "block", sorter: "number" }, // Mindig látható
            { title: "Cég név", field: "cegnev", minWidth: 200, maxWidth: 500, cssClass: "hidden md:table-cell" }, // Csak közepes képernyőtől jelenik meg
            { title: "Székhely", field: "szekhely", minWidth: 150, cssClass: "hidden lg:table-cell" }, // Csak nagy képernyőn jelenik meg
            { title: "Telefonszám", field: "telefonszam", minWidth: 180, cssClass: "hidden lg:table-cell" }, // Csak nagy képernyőn jelenik meg
            { title: "Cég adószám", field: "cegadoszam", minWidth: 180, cssClass: "hidden lg:table-cell" } // Csak nagy képernyőn jelenik meg

        ],
        initialSort: [
            { column: "partner_id", dir: "desc" }
        ]


    });





    $('#search-box').on('input', function () {
        const searchQuery = $(this).val();  // Keresési kifejezés
        table.setData('/modul/partnertorzs/server_script/partner_tabla_betoltes.php', { search: searchQuery });  // Keresési paraméterek átadása
    });



    // Gomb esemény a dialógus megnyitásához
    $("#partner_hozzaad_gomb").on("click", function () {
        const mentesGomb = $("#partner-form button[type='submit']");
        mentesGomb.text("Mentés");
        mentesGomb.attr("data-action", "mentes");
        $("#partner-dialog").removeClass("hidden");
    });

    // Mégse gomb esemény a dialógus bezárásához
    $("#megse-gomb").on("click", function () {
        $("#partner-dialog").addClass("hidden");
        $("#torles-gomb").addClass("hidden");
        $(".form-input").removeClass("border-flash border-red-500");
        $("#form-alert").addClass("hidden").removeClass("fade-in");
        $("#partner-form")[0].reset();
    });

    $("#torles-gomb").on("click", function () {
        const torol_partner_id = $("#torles-gomb").attr("data-id");
        $.ajax({
            type: "POST",
            url: "/modul/partnertorzs/server_script/partner_torol.php", // A szerkesztéshez használt PHP fájl
            data: {
                torol_partner_id: torol_partner_id
            },
            success: function (data) {
                table.setData(); // Táblázat frissítése
                $("#partner-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                $("#partner-dialog").addClass("hidden"); // Dialógus bezárása
                $("#torles-gomb").addClass("hidden");
            },
            error: function (err) {
                console.error("Hiba történt a szerkesztés során:", err);
                alert("Hiba történt a partner adatainak szerkesztése közben!");
            }
        });
    });

    // Űrlap beküldése
    $("#partner-form").on("submit", function (e) {
        e.preventDefault();


        const action = $("#partner-form button[type='submit']").attr("data-action");
        const partnerId = $("#partner-form button[type='submit']").attr("data-id");

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

        $("#form-alert").addClass("hidden").removeClass("fade-in");

        // Ha minden mező ki van töltve
        const partnerAdatok = {
            cegNev: $("#ceg-nev").val(),
            szekhely: $("#szekhely").val(),
            telefonszam: $("#telefonszam").val(),
            adoszam: $("#adoszam").val(),
        };
        console.log(action);
        // AJAX kérelem az adatok mentéséhez
        if (action === "edit") {
            // Ha szerkesztésről van szó
            $.ajax({
                type: "POST",
                url: "/modul/partnertorzs/server_script/partner_szerk.php", // A szerkesztéshez használt PHP fájl
                data: {
                    id: partnerId,
                    partnerAdatok: partnerAdatok
                },
                success: function (data) {
                    table.setData(); // Táblázat frissítése
                    $("#partner-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                    $("#partner-dialog").addClass("hidden"); // Dialógus bezárása
                    $("#torles-gomb").addClass("hidden");
                },
                error: function (err) {
                    console.error("Hiba történt a szerkesztés során:", err);
                    alert("Hiba történt a partner adatainak szerkesztése közben!");
                }
            });
        } else {
            // Új partner mentése (a meglévő mentési logikát itt tarthatod)
            $.ajax({
                type: "POST",
                url: "/modul/partnertorzs/server_script/partner_feldolg.php",
                data: {
                    partnerAdatok: partnerAdatok
                },
                success: function (data) {
                    table.setData(); // Táblázat frissítése
                    $("#partner-form")[0].reset(); // Űrlap alaphelyzetbe állítása
                    $("#partner-dialog").addClass("hidden"); // Dialógus bezárása
                },
                error: function (err) {
                    console.error("Hiba történt a mentés során:", err);
                    alert("Hiba történt a partner adatainak mentése közben!");
                }
            });
        }

        // Dialógusablak bezárása
        $("#partner-dialog").addClass("hidden");
    });
    table.on("rowClick", function (e, row) {
        // Sor kattintás
        const sorAdat = row.getData();

        // Töltsük be az adatokat az űrlapba
        $("#ceg-nev").val(sorAdat.cegnev);
        $("#szekhely").val(sorAdat.szekhely);
        $("#telefonszam").val(sorAdat.telefonszam);
        $("#adoszam").val(sorAdat.cegadoszam);

        // A gomb szövegének és működésének módosítása
        const szerkGomb = $("#partner-form button[type='submit']");
        const torolGomb = $("#torles-gomb");
        szerkGomb.text("Szerkesztés");
        szerkGomb.attr("data-action", "edit");
        szerkGomb.attr("data-id", sorAdat.partner_id);
        torolGomb.attr("data-id", sorAdat.partner_id);

        // Nyissuk meg a dialógusablakot
        $("#partner-dialog").removeClass("hidden");
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

});