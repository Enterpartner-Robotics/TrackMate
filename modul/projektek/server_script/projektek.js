$(document).ready(function () {
    const mobilnezet = window.innerWidth <= 850;


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////PROJEKT INDITAS///////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
    var moduleHeader = `
        
            <div>Modul neve</div>
            <div>Munkaidő</div>
            <div>Szoftver összeg</div>
            <div>Hardver összeg</div>
            <div>Keret</div>
            <div>Specifikáció</div>
            <div class="w-2"></div>

    `;

    let modulok = [];
    let munkalap_szamlalo = 0;
    let munkalap_osszeg = 0;
    
    
    var osszes_munkaido = 0;
    let osszes_szoftver_koltseg = 0;
    let osszes_hardver_koltseg = 0;
    let teljes_osszeg = 0;
    

    $("#module-header").append(moduleHeader);
   

    if($("#felh_jog").val() != 1){
        $("#projekt_form_dialog").addClass("hidden"); 
        $("#projekt_inditas").addClass("hidden");
        $("#projektek_listazasa").addClass("hidden");
       
    }
    $("#projektek_lista_layout3").removeClass("hidden");
    $("#projektek_div").removeClass("hidden");
    $("#hatar_ido").flatpickr({
        dateFormat: "Y-m-d",
        locale: "hu"
    });

    


    function frissitOsszegeket() {
        teljes_osszeg = munkalap_osszeg;
        if (munkalap_szamlalo > 0) {
            $("#munkalapok_osszeg_container").removeClass("hidden");
            $("#munkalapok_osszeg").text(munkalap_osszeg.toLocaleString('hu-HU') + ' Ft');
        } else {
            $("#munkalapok_osszeg_container").addClass("hidden");
        }
        
       
        $("#teljes_osszeg").text(teljes_osszeg.toLocaleString('hu-HU') + ' Ft');
    }

    function frissitModulok(munkaido, szoftver_osszeg, hardver_osszeg, keret, modul_nev, specifikacio_kep_utvonal){
        if(munkaido){
            munkaido_tagolva = String(munkaido).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(szoftver_osszeg){
            szoftver_osszeg_tagolva = String(szoftver_osszeg).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(hardver_osszeg){
            hardver_osszeg_tagolva = String(hardver_osszeg).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(keret){
            keret_tagolva = String(keret).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(osszes_munkaido){
            osszes_munkaido_tagolva = String(osszes_munkaido).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(osszes_szoftver_koltseg){
            osszes_szoftver_koltseg_tagolva = String(osszes_szoftver_koltseg).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(osszes_hardver_koltseg){
            osszes_hardver_koltseg_tagolva = String(osszes_hardver_koltseg).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        if(specifikacio_kep_utvonal != ""){
        var moduleRow = `
            <div class="grid grid-cols-7 gap-2 text-center bg-white shadow-md rounded-md p-2 my-1 border items-center">
                <div class="hidden" id="specifikacio_kep_utvonal_div">${specifikacio_kep_utvonal}</div>
                <div>${modul_nev}</div>
                <div>${munkaido_tagolva} óra</div>
                <div>${szoftver_osszeg_tagolva} Ft</div>
                <div>${hardver_osszeg_tagolva} Ft</div>
                <div>${keret_tagolva} Ft</div>
                <div class="flex items-center justify-center"><a href="${specifikacio_kep_utvonal}" target="_blank"><img src="/assets/png_icon.png" alt="specifikacio_kep" class="w-12 h-12"></a></div>
                <button class="bg-red-500 text-white px-2 py-1 rounded-md torles_gomb">X</button>

            </div>
        `;
        }else{
            var moduleRow = `
            <div class="grid grid-cols-7 gap-2 text-center bg-white shadow-md rounded-md p-2 my-1 border items-center">
                <div>${modul_nev}</div>
                <div>${munkaido_tagolva} óra</div>
                <div>${szoftver_osszeg_tagolva} Ft</div>
                <div>${hardver_osszeg_tagolva} Ft</div>
                <div>${keret_tagolva} Ft</div>
                <div></div>
                <button class="bg-red-500 text-white px-2 py-1 rounded-md torles_gomb">X</button>
            </div>
        `;
        }
        var moduleFooter = `
        
            <div>Összesen</div>
            <div id="osszes_munkaido_container">${osszes_munkaido_tagolva} óra</div>
            <div id="osszes_szoftver_koltseg_container">${osszes_szoftver_koltseg_tagolva} Ft</div>
            <div id="osszes_hardver_koltseg_container">${osszes_hardver_koltseg_tagolva} Ft</div>
            <div></div>
            <div class="w-2"></div>
        
        `;
        

        $("#module-grid").append(moduleRow);
        if(munkalap_szamlalo <= 0){
            $("#module-footer").append(moduleFooter);
        }else{
            $("#osszes_munkaido_container").text(osszes_munkaido_tagolva + ' óra');
            $("#osszes_szoftver_koltseg_container").text(osszes_szoftver_koltseg_tagolva + ' Ft');
            $("#osszes_hardver_koltseg_container").text(osszes_hardver_koltseg_tagolva + ' Ft');
            $("#osszes_keret_container").text(keret_tagolva + ' Ft');
        }



        munkalap_szamlalo++;
        $("#munkalap-szamlalo").text(munkalap_szamlalo);

        munkalap_osszeg += keret;
        frissitOsszegeket();

        $("#module-header").removeClass("hidden");
        $("#module-footer").removeClass("hidden");

        $("#modul_nev").val('');
        $("#munkaido").val('');
        $("#szoftver_osszeg").val('');
        $("#hardver_osszeg").val('');
        $("#specifikacio_kep").val('');
    }





    $("#munkalap_hozzadas").click(function () {
        var modul_nev = $("#modul_nev").val();
        var munkaido = parseInt($("#munkaido").val().replace(/\s/g, '') || 0);
        var szoftver_osszeg = parseInt($("#szoftver_osszeg").val().replace(/\s/g, '') || 0);
        var hardver_osszeg = parseInt($("#hardver_osszeg").val().replace(/\s/g, '') || 0);
        var specifikacio_kep = $("#specifikacio_kep")[0].files[0];
        var specifikacio_kep_utvonal = "";


        if (!modul_nev || !munkaido) {
            alert("Kérlek, töltsd ki az összes kötelező mezőt!");
            return;
        }

        var keret = szoftver_osszeg + hardver_osszeg;
        
        osszes_munkaido+=munkaido;
        osszes_szoftver_koltseg+=szoftver_osszeg;
        osszes_hardver_koltseg += hardver_osszeg;
        $("#osszes_szoftver_osszeg").val(String(osszes_szoftver_koltseg).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
        $("#osszes_hardver_osszeg").val(String(osszes_hardver_koltseg).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));



        if(specifikacio_kep){
            var formData = new FormData();
            formData.append("confirm_mod", "specifikacio_kep");
            formData.append("specifikacio_kep", specifikacio_kep);
            formData.append("specifikacio_kep_nev", modul_nev);
            $.ajax({
                url: '/modul/projektek/server_script/tmp_mappa_letrehoz.php',
                type: 'POST',
                processData: false,
                contentType: false,
                dataType: 'json',
                data: formData,
                success: function(response){
                    if(response.status == "success"){
                        specifikacio_kep_utvonal = response.file;
                        $("#modul_kep_utvonal").val(specifikacio_kep_utvonal);
                        modulok.push({
                            modul_nev: modul_nev,
                            munkaido: munkaido,
                            szoftver_osszeg: szoftver_osszeg,
                            hardver_osszeg: hardver_osszeg,
                            keret: keret,
                            specifikacio_kep: specifikacio_kep_utvonal
                        });
                        frissitModulok(munkaido, szoftver_osszeg, hardver_osszeg, keret, modul_nev, specifikacio_kep_utvonal);
                    }
                    else{
                        console.log("Hiba történt: " + response.message);
                    }
                },
                error: function(xhr, status, error){
                    console.error("Hiba történt:", error);
                }
            });
        }
        else{
            modulok.push({
                modul_nev: modul_nev,
                munkaido: munkaido,
                szoftver_osszeg: szoftver_osszeg,
                hardver_osszeg: hardver_osszeg,
                keret: keret,
                specifikacio_kep: ""
            });
            frissitModulok(munkaido, szoftver_osszeg, hardver_osszeg,  keret, modul_nev, "");
        }
    });

    
    

    $(document).on("click", ".torles_gomb", function () {
        var sor = $(this).closest(".grid");
        var index = sor.index();
        var keret = parseInt(sor.find("div:nth-child(5)").text().replace(/[^0-9]/g, ''));
        var hardver_osszeg = parseInt(sor.find("div:nth-child(4)").text().replace(/[^0-9]/g, ''));
        var szoftver_osszeg = parseInt(sor.find("div:nth-child(3)").text().replace(/[^0-9]/g, ''));
        var munkaido = parseInt(sor.find("div:nth-child(2)").text().replace(/[^0-9]/g, ''));

        var filePath = sor.find("#specifikacio_kep_utvonal_div").text();
        console.log(filePath);
        if (filePath) {
            $.ajax({
                url: '/modul/projektek/server_script/tmp_delete_fajl.php', // A szerver oldali script elérési útvonala
                type: 'POST',
                data: { filepath: filePath },
                success: function(response) {
                    console.log("Fájl törlése sikeres:", response);
                },
                error: function(xhr, status, error) {
                    console.error("Fájl törlése során hiba:", error);
                }
            });
        }
        modulok.splice(index, 1); // Töröljük a megfelelő modult
        sor.remove();
        
        munkalap_szamlalo--;
        $("#munkalap-szamlalo").text(munkalap_szamlalo);

        munkalap_osszeg -= keret;
        osszes_szoftver_koltseg-=szoftver_osszeg;
        osszes_hardver_koltseg-=hardver_osszeg;
        osszes_munkaido -= munkaido;
        frissitOsszegeket();

        $("#osszes_munkaido_container").text(osszes_munkaido + ' óra');
        $("#osszes_szoftver_koltseg_container").text(osszes_szoftver_koltseg.toLocaleString('hu-HU') + ' Ft');
        $("#osszes_hardver_koltseg_container").text(osszes_hardver_koltseg.toLocaleString('hu-HU') + ' Ft');
        $("#osszes_szoftver_osszeg").val(osszes_szoftver_koltseg);
        $("#osszes_hardver_osszeg").val(osszes_hardver_koltseg);

        if ($("#module-grid").children().length === 0) {
            $("#module-header").addClass("hidden");
            $("#module-footer").addClass("hidden");
            $("#module-footer").empty();

            // Nullázzuk az összegeket
            osszes_munkaido = 0;
            osszes_szoftver_koltseg = 0;
            osszes_hardver_koltseg = 0;
            munkalap_osszeg = 0;
            teljes_osszeg = 0;
            
            // Frissítjük a megjelenített értékeket
            $("#teljes_osszeg").text('0 Ft');
            $("#munkalapok_osszeg").text('0 Ft');
        }
    });

   

    $(document).on("submit", "#projekt_form", function(e) {
        e.preventDefault();
        // Készítünk egy új FormData objektumot, és hozzáadjuk az űrlap mezőit
        let isValid = true;
        let missingFields = [];

        $(".szukseges_input").each(function () {
            if ($(this).val().trim() === "") {
                isValid = false;
                missingFields.push($(this).attr("id"));
                $(this).addClass("border-flash border-red-500");
            } else {
                $(this).removeClass("border-flash border-red-500");
            }
        });
        if($("#jog_csoportok").find("input:checked").length == 0){
            isValid = false;
            missingFields.push("jog_csoportok");
            $("#jog_csoportok").addClass("border-flash border-red-500");
        }else{
            $("#jog_csoportok").removeClass("border-flash border-red-500");
        }
        if (!isValid) {
            $("#hibauzenet").text(
            "Minden mezőt ki kell tölteni!"
            );
            $("#hibas_projekt_inditas").show();
            return;
        }
        $("#hibas_projekt_inditas").hide();
        
        
        let partner_id = $('#partner_id').val();
        if(!partner_id || partner_id == ""){
            
            $('#form_alert').html("Kérlek az autocompleteből válassz partnert,<br> ha pedig nincs olyan partner amit szeretnél töltsd fel a partnertörzsbe!");
            $('#form_alert').removeClass('hidden');
            setTimeout(function() {
                $('#form_alert').addClass("hidden");
                resizeCharts();
            }, 2500);
            return;
        }
        $('#form_alert').addClass('hidden');


        
        var formData = new FormData(this);
        
        // Fájlok hozzáadása
        var szerzodes_kep = $("#szerzodes_kep")[0].files[0];
        var araajanlat_kep = $("#araajanlat_kep")[0].files[0];
        if(szerzodes_kep){
            formData.append("szerzodes_kep", szerzodes_kep);
        }
        if(araajanlat_kep){
            formData.append("araajanlat_kep", araajanlat_kep);
        }
        // Egyéb változók hozzáadása
        formData.append("teljes_osszeg", teljes_osszeg);
        formData.append("osszes_munkaido", osszes_munkaido);
        formData.append("modulok", JSON.stringify(modulok));

        let formdata_oradij = formData.get("oradij");
        if(formdata_oradij){
            formdata_oradij = formdata_oradij.replace(/\s/g, "");
            formData.set("oradij", formdata_oradij);
        }
        let formdata_osszes_szoftver_osszeg = formData.get("osszes_szoftver_osszeg");
        if(formdata_osszes_szoftver_osszeg){
            formdata_osszes_szoftver_osszeg = formdata_osszes_szoftver_osszeg.replace(/\s/g, "");
            formData.set("osszes_szoftver_osszeg", formdata_osszes_szoftver_osszeg);
        }
        let formdata_osszes_hardver_osszeg = formData.get("osszes_hardver_osszeg");
        if(formdata_osszes_hardver_osszeg){
            formdata_osszes_hardver_osszeg = formdata_osszes_hardver_osszeg.replace(/\s/g, "");
            formData.set("osszes_hardver_osszeg", formdata_osszes_hardver_osszeg);
        }
        
        $.ajax({
            url: '/modul/projektek/server_script/projekt_feldolg.php', // Itt add meg a PHP fájl útvonalát
            type: 'POST',
            dataType: 'json',
            processData: false, // Ne próbálja meg serializálni a FormData-t
            contentType: false, // A böngésző állítja be a megfelelő Content-Type fejlécet
            data: formData,
            success: function(response) {
                console.log('Adatok sikeresen elmentve!');
                $("#projekt_form")[0].reset();
               
                $("#module-grid").empty();
                $("#module-header").addClass("hidden");
                $("#module-footer").addClass("hidden");
                
                $("#munkalapok_osszeg_container").addClass("hidden").empty();
                $("#osszes_munkaido_container").empty();
                $("#osszes_szoftver_koltseg_container").empty();
                $("#osszes_hardver_koltseg_container").empty();
                $("#osszes_keret_container").empty();
                $("#munkalap-szamlalo").text(0);
                $("#teljes_osszeg_container").empty();
                $("#teljes_osszeg").empty();
            },
            error: function(xhr, status, error) {
                console.error('Hiba történt:', error);
            }
        });


       


    });











    
    $(document).on('input', '#partner_nev', function () {
        var query = $(this).val().trim();
        var results = $(this).siblings('.autocomplete-results');
    
        if (query.length < 1) {
            results.empty().addClass('hidden');
            return;
        }
    
        $.ajax({
            url: '/modul/projektek/server_script/partner_autocomplete.php',
            method: 'GET',
            data: { term: query },
            dataType: 'json',
            success: function (response) {
    
                results.empty().removeClass('hidden');
    
                if (response.length > 0) {
                    response.forEach(function (item) {
                        var listItem = $('<li></li>')
                            .addClass("px-4 py-2 hover:bg-zold-100 cursor-pointer")
                            .attr("data-value", item.partner_id)
                            .text(item.cegnev);
    
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
    
        var inputField = $(this).closest('.autocomplete-results').siblings('#partner_nev'); 
        var hiddenField = inputField.siblings('#partner_id'); 
    
        inputField.val(selectedText);
        hiddenField.val(selectedValue);
    
        // A lista kiürítése és teljes elrejtése
        var results = $(this).parent('.autocomplete-results');
        results.empty().addClass('hidden');
    });
    
    
    $(document).click(function (event) {
        if (!$(event.target).closest('#partner_nev, .autocomplete-results').length) {
            $('.autocomplete-results').empty().addClass('hidden').css("display", "none");
        }
    });

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
    
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////// FÜGGVÉNYEK////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    $("#projektek_listazasa").click(function(){
        $("#projekt_form_dialog").addClass("hidden");
        
        

    });

    $("#projektek").click(function(){
        $("#projekt_form_dialog").addClass("hidden");
        $("#projektek_div").removeClass("hidden");
        $("#projektek_lista").removeClass("hidden");
        
    });

    $(document).on('click', '#projekt_inditas', function(){
        $("#projekt_form_dialog").removeClass("hidden");
        $("#projektek_div").addClass("hidden");
        $("#projektek_lista").addClass("hidden");
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
                            <input type='checkbox' id='jog_csoport_${item.jogosultsag_id}' name='jog_csoport_${item.jogosultsag_id}' value='${item.jogosultsag_id}' class="mr-2 szukseges_input">
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


function pagination_kezeles(currentPage, totalPages, totalRecords) {
        let paginationHtml = `
            <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 space-x-2">
                <div class="flex flex-1 justify-start items-center">
                    <span class="text-sm text-alapzold">
                        A(z) <span class="font-medium">${totalRecords}</span> elemből <span class="font-medium">${(currentPage - 1) * 10 + 1}</span>-<span class="font-medium">${Math.min(currentPage * 10, totalRecords)}</span>-ig látható
                    </span>
                </div>
                <div class="flex flex-1 justify-end items-center">
                    <button ${currentPage === 1 ? 'disabled' : ''} 
                            class="pagination-btn relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            data-page="${currentPage-1}">
                        Előző
                    </button>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        `;
    
        // Oldalszámok generálása
        const maxVisiblePages = 3; // Maximum látható oldal
        let startPage, endPage;
    
        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 2) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
        }
    
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHtml += `
                    <button class="relative z-10 inline-flex items-center bg-alapzold px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" data-page="${i}">${i}</button>
                `;
            } else {
                paginationHtml += `
                    <button class="pagination-btn relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-green-200 focus:z-20 focus:outline-offset-0" data-page="${i}">${i}</button>
                `;
            }
        }
    
        paginationHtml += `
                    </nav>
                    <button ${currentPage === totalPages ? 'disabled' : ''} 
                            class="pagination-btn relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
                            data-page="${currentPage + 1}">
                        Következő
                    </button>
                </div>
            </div>
        `;
    
        return paginationHtml;
}

    // Közös rendezési funkció bármely táblához
function rendezes_kezeles(tableTipus, gombSelector, callback) {
    let lastClickedColumn = null;
    let oszlop_default = tableTipus === 'felhasznalo' ? 'teljes_nev' : 'projekt_id';
    let rendezes_default = tableTipus === 'felhasznalo' ? 'asc' : 'desc';
    
    $(gombSelector).on('click', function() {
        oszlop_default = $(this).data('column');
        rendezes_default = $(this).data('order');

        // Változtatjuk a rendezési irányt
        const uj_rendezes = rendezes_default === 'desc' ? 'asc' : 'desc';
        $(this).data('order', uj_rendezes);
        rendezes_default = uj_rendezes;

        // Halványítjuk az összes ikont
        $(gombSelector + ' .sort-icon').css('opacity', '0.3');

        // Megjelenítjük a kattintott oszlop ikonját
        const kattintottIcon = $(this).find('.sort-icon');

        if (uj_rendezes === 'asc') {
            kattintottIcon.removeClass('rotate-180'); // Növekvő ikon
            kattintottIcon.css('opacity', '1'); // Aktív ikon
        } else {
            kattintottIcon.addClass('rotate-180'); // Csökkenő ikon
            kattintottIcon.css('opacity', '1'); // Aktív ikon
        }

        // Visszafordítjuk az előző ikont, ha van
        if (lastClickedColumn && lastClickedColumn !== this) {
            const lastIcon = $(lastClickedColumn).find('.sort-icon');
            lastIcon.removeClass('rotate-180'); // Visszafordítjuk az előző ikont
            lastIcon.css('opacity', '0.3'); // Halványítjuk az előző ikont
        }

        lastClickedColumn = this; // Frissítjük az utolsó kattintott oszlopot
        
        // Callback meghívása a rendezési adatokkal
        if (typeof callback === 'function') {
            callback(oszlop_default, rendezes_default);
        }
    });
    
    // Visszaadjuk az alapértelmezett értékeket, hogy a kezdeti betöltésnél használhatók legyenek
    return {
        oszlop: oszlop_default,
        rendezes: rendezes_default
    };
}

let expandedState = 0; 

function resizeCharts() {
    const charts = [
        Chart.getChart("projekt_szoftver_chart"),
        Chart.getChart("projekt_hardver_chart"),
        Chart.getChart("projekt_teljes_osszeg_chart")
    ];

    charts.forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// A konténer méretváltás kezelése
function handleDiagramClick(diagramType) {
    if (expandedState === 0) {
        expandedState = 1;
        if(!mobilnezet){
        $("#projekt_folyamat_nezet_container")
            .removeClass("grid-cols-1 md:w-[50%] md:h-[50%] w-[90%] h-[90%]")
            .addClass("grid-cols-2 md:w-[80%] md:h-[50%]");
        
        $("#projekt_adatok_container").addClass("row-span-1");
        $("#projekt_adatok_lista_vissza").removeClass("hidden");
        }else{
            $("#projekt_folyamat_nezet_container")
            .removeClass("h-[56%]")
            .addClass("w-full h-[99%] overflow-y-auto");
            
            
            
        }
        setTimeout(function() {
            $(`#${diagramType}_container`).removeClass("hidden");
            resizeCharts();
        }, 300);
    } 
    else if (expandedState === 1) {

        expandedState = 2;
        if(!mobilnezet){
        $("#projekt_folyamat_nezet_container")
            .removeClass("md:w-[80%] md:h-[50%]")
            .addClass("grid-rows-2 md:w-[95%] md:h-[95%]");
        
        // Az összes diagram konténer egységes méretezése
        $(".diagram_container").css({
            "height": "calc((100vh - 130px) / 2)", // A képernyő magasságához igazítva
            "max-height": "500px" // Maximum magasság korlátozása
        });
        }
        setTimeout(function() {
            $("#projekt_szoftver_diagram_container, #projekt_hardver_diagram_container, #projekt_teljes_osszeg_diagram_container")
                .not(":visible")
                .each(function() {
                    $(this).removeClass("hidden");
                    const containerId = $(this).attr('id');
                    
                    if (containerId === 'projekt_szoftver_diagram_container') {
                        $("#projekt_szoftver_diagram_icon").trigger('click');
                    } 
                    else if (containerId === 'projekt_hardver_diagram_container') {
                        $("#projekt_hardver_diagram_icon").trigger('click');
                    }
                    else if (containerId === 'projekt_teljes_osszeg_diagram_container') {
                        $("#projekt_teljes_osszeg_diagram_icon").trigger('click');
                    }
                });
            resizeCharts();
        }, 300);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////// projekt listázás//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


$("#layout1").click(function(){
    $("#projektek_lista_layout1").removeClass("hidden");
    $("#projektek_lista_layout2").addClass("hidden");
    $("#projektek_lista_layout3").addClass("hidden");

    let searchterm = '';
    
    
        // Rendezési beállítások kezelése a közös rendezés_kezeles függvénnyel
        const rendezesBeallitasok = rendezes_kezeles('projekt', '.rendezes_gomb', function(oszlop, rendezes) {
            projekt_betoltes($('#search_box').val(), oszlop, rendezes, 1);
        });
        
        function projekt_betoltes(searchterm = '', oszlop = rendezesBeallitasok.oszlop, rendezes = rendezesBeallitasok.rendezes, page = 1) {
            $.ajax({
                url: '/modul/kezdolap/server_script/admin_osszes_projekt.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    oszlop: oszlop,
                    rendezes: rendezes,
                    searchterm: searchterm,
                    page: page,
                    per_page: 10
                },
                success: function(response) {
                    console.log(response);
                    if (response.status === 'success') {
                        const osszes_projekt_grid = $('#osszes_projekt_grid');
                        const osszes_projekt_grid_mobile = $('#osszes_projekt_grid_mobile');
                        osszes_projekt_grid.empty();
                        osszes_projekt_grid_mobile.empty();
                        if (!mobilnezet){
                        response.adat.forEach(function(projekt){
                            let allapotSzin = '';
                            if (projekt.allapot_nev === 'Elkészült') {
                                allapotSzin = 'bg-green-100 text-green-800';
                            } else if (projekt.allapot_nev === 'Indítás alatt') {
                                allapotSzin = 'bg-yellow-100 text-yellow-800';
                            } else {
                                allapotSzin = 'bg-blue-100 text-blue-800';
                            }
                            let munkaido = 0;
                            let hours_munkaido = 0;
                            let minutes_munkaido = 0;
                            let projekt_ido = projekt.munkaido.toString() +' óra';
                            let ledolgozott_ido = '';
                            if (projekt.ossz_ora != null){
                                munkaido = parseFloat(projekt.ossz_ora) || 0;
                                hours_munkaido = Math.floor(munkaido);
                                minutes_munkaido = Math.round((munkaido - hours_munkaido) * 60);

                                ledolgozott_ido = hours_munkaido.toString()+' óra '+minutes_munkaido.toString()+' perc';
                               
                            }else{
                                ledolgozott_ido = '-';
                                projekt_ido = '-';
                            }
                            let teljes_osszeg = parseInt(projekt.teljes_osszeg).toLocaleString('hu-HU') +' Ft';

                            
                           
                            osszes_projekt_grid.append(`
                                <div class="grid grid-cols-[50px_50px_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 p-3 font-semibold hover:bg-gray-200 focus:bg-gray-200">
                                    <div class="flex items-center justify-center transition: transform 0.3s ease row_details_icon">
                                        <input type="hidden" class="projekt_id" value="${projekt.projekt_id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}">${projekt.projekt_id}</div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}">${projekt.projekt_nev}</div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}">${ledolgozott_ido} / ${projekt_ido}</div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}">${teljes_osszeg}</div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}">
                                        <span class="px-2 py-1 rounded-full text-md ${allapotSzin}">${projekt.allapot_nev}</span>
                                    </div>
                                    <div class="projekt_folyamat_view" data-projekt-id="${projekt.projekt_id}"  >${projekt.hatarido}</div>
                                </div>
                            `);
                        });
        
                      
                        const paginationHtml = pagination_kezeles(
                            response.pagination.current_page, 
                            response.pagination.total_pages, 
                            response.pagination.total
                        );
                        osszes_projekt_grid.append(paginationHtml);
        
                        // Pagination click eseménykezelő
                        $('.pagination-btn').on('click', function() {
                            const newPage = $(this).data('page');
                            if (newPage >= 1 && newPage <= response.pagination.total_pages) {
                                projekt_betoltes(searchterm, oszlop, rendezes, newPage);
                            }
                        });
                        }else{
                            response.adat.forEach(function(projekt){
                                let allapotSzin = '';
                                if (projekt.allapot_nev === 'Elkészült') {
                                    allapotSzin = 'bg-green-100 text-green-800';
                                } else if (projekt.allapot_nev === 'Indítás alatt') {
                                    allapotSzin = 'bg-yellow-100 text-yellow-800';
                                } else {
                                    allapotSzin = 'bg-blue-100 text-blue-800';
                                }
                                const eddigi_teljesitett_ora = Math.round(projekt.ossz_ora, 4);
                                osszes_projekt_grid_mobile.append(`
                                    <div class="grid grid-cols-[40px_1fr_90px] gap-4 bg-gray-100 p-2 font-semibold">
                                        <div class="projekt_folyamat_view text-center text-md" data-projekt-id="${projekt.projekt_id}">${projekt.projekt_id}</div>
                                        <div class="projekt_folyamat_view text-md" data-projekt-id="${projekt.projekt_id}">${projekt.projekt_nev}</div>
                                        <div class="projekt_folyamat_view text-md" data-projekt-id="${projekt.projekt_id}">${eddigi_teljesitett_ora}/${projekt.munkaido}</div>
                                        
                                    </div>
                                    
                                `);
                            });
                        }



                    }
                }
            });
        }
        
        // Keresés kezelése
        $('#search_box').on('input', function(){
            searchterm = $(this).val();
            projekt_betoltes(searchterm, rendezesBeallitasok.oszlop, rendezesBeallitasok.rendezes, 1);
        });
        
        // Kezdeti betöltés
        projekt_betoltes('', rendezesBeallitasok.oszlop, rendezesBeallitasok.rendezes, 1);
});


$(document).on('click', '#osszes_projekt_grid .row_details_icon', function() {
    const clickedElement = $(this);
    
    const projekt_id = clickedElement.find('.projekt_id').val();

    // Ellenőrizzük, hogy van-e már nyitott részlet ehhez a sorhoz
    const rowDetails = clickedElement.closest('.grid').next('.row-details');
    if(rowDetails.length > 0 && rowDetails.is(':visible')){
        rowDetails.slideUp(300, function(){
            clickedElement.find('.rotate-icon').removeClass('rotate-180'); // Visszaforgatjuk az ikont
        });
        return;
    }

    // Elforgatjuk az ikont, hogy jelezzük a lenyitást
    clickedElement.find('.rotate-icon').addClass('rotate-180');
    
    $.ajax({
        url: '/modul/kezdolap/server_script/projekt_munkalapok.php', // Itt lesz a PHP lekérdezésed
        type: 'POST',
        dataType: 'json',
        data: {
            projekt_id: projekt_id
        },
        success: function(response) {
            console.log(response);
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            
            if (data.status === 'success') {
                if(data.data.length > 0){
                    let rowDetailsHtml = `
                        <div class="row-details">
                            <div class="bg-white p-4 rounded-lg shadow-md mx-6">
                                <h3 class="text-lg font-bold mb-4 text-gray-800">Projekt munkalapok</h3>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full bg-white">
                                        <thead>
                                            <tr class="bg-gray-50 border-b">
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkalap neve</th>
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkalap összeg</th>
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teljesített órák</th>
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Órák</th>
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Állapot</th>
                                                <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Megtekintés</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                    `;
                    
                    // Iterálunk a munkalapokon
                    data.data.forEach(function(munkalap) {
                        let max_ora = 0;
                        let hours_max_ora = 0;
                        
                        let max_ora_ido = '';
                        if (munkalap.max_ora != null){
                            max_ora = parseFloat(munkalap.max_ora) || 0;
                            if (max_ora == 0){
                                max_ora_ido = '-';
                            }else{
                                hours_max_ora = Math.floor(max_ora);
                                max_ora_ido = hours_max_ora.toString()+' óra';
                            }
                        }else{
                            max_ora_ido = '-';
                        }

                        let teljesitett_ora = 0;
                        let hours_teljesitett_ora = 0;
                        let minutes_teljesitett_ora = 0;
                        let teljesitett_ora_ido = '';
                        if (munkalap.teljesitett_ora != null || munkalap.teljesitett_ora == 0){
                            teljesitett_ora = parseFloat(munkalap.teljesitett_ora) || 0;
                            hours_teljesitett_ora = Math.floor(teljesitett_ora);
                            minutes_teljesitett_ora = Math.round((teljesitett_ora - hours_teljesitett_ora) * 60);
                            
                            teljesitett_ora_ido = hours_teljesitett_ora.toString()+' óra '+minutes_teljesitett_ora.toString()+' perc';
                        }else{
                            teljesitett_ora_ido = '-';
                        }

                      
                        let allapotSzin = '';
                        if (munkalap.allapot_nev === 'Elkészült') {
                            allapotSzin = 'bg-green-100 text-green-800';
                        } else if (munkalap.allapot_nev === 'Indítás alatt') {
                            allapotSzin = 'bg-blue-100 text-blue-800';
                        } else {
                            allapotSzin = 'bg-yellow-100 text-yellow-800';
                        }
                        let munkalap_osszeg = '';
                        if(munkalap.munkalap_osszeg != null){
                            munkalap_osszeg = parseInt(munkalap.munkalap_osszeg).toLocaleString('hu-HU') +' Ft';
                        }else{
                            munkalap_osszeg = '-';
                        }
                        

                        rowDetailsHtml += `
                            <tr class="hover:bg-gray-50">
                                <td class="py-2 px-4 text-sm font-medium text-gray-900">${munkalap.megnevezes}</td>
                                <td class="py-2 px-4 text-sm text-gray-500">${munkalap_osszeg}</td>
                                <td class="py-2 px-4 text-sm text-gray-500">${teljesitett_ora_ido}</td>
                                <td class="py-2 px-4 text-sm text-gray-500">${max_ora_ido}</td>
                                <td class="py-2 px-4 text-sm">
                                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${allapotSzin}">
                                        ${munkalap.allapot_nev}
                                    </span>
                                </td>
                                <td class="py-2 px-4">
                                    <button type="button" class="bg-alapzold text-white text-sm font-bold py-1 px-1 rounded-lg hover:bg-zold-300 focus:ring-2 focus:ring-zold-100 focus:outline-none transition duration-200 flex items-center space-x-2 munkalap_megtekintes_gomb" id="${munkalap.munkalap_id}">
                                        Megtekintés →
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    rowDetailsHtml += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Használjuk az eltárolt elemet a DOM manipulációhoz
                    const rowDetails = $(rowDetailsHtml).insertAfter(clickedElement.closest('.grid'));
                    rowDetails.hide().slideDown(300);
                    
                } else {
                    console.log('Nincs adat');
                    // Ha nincs adat, de sikeres a lekérdezés, akkor üzenet megjelenítése
                    let noDataHtml = `
                        <div class="row-details">
                            <div class="bg-white p-4 rounded-lg shadow-md mx-6">
                                <p class="text-center text-gray-500">Ehhez a projekthez nem tartozik munkalap.</p>
                            </div>
                        </div>
                    `;
                    const noDataElement = $(noDataHtml).insertAfter(clickedElement.closest('.grid'));
                    noDataElement.hide().slideDown(300);
                }
            } else {
                console.error('Hiba történt: ', data.error);
                // Hiba esetén is jelenjen meg egy üzenet
                let errorHtml = `
                    <div class="row-details">
                        <div class="bg-white p-4 rounded-lg shadow-md mx-6">
                            <p class="text-center text-red-500">Hiba történt a munkalapok betöltése közben.</p>
                        </div>
                    </div>
                `;
                const errorElement = $(errorHtml).insertAfter(clickedElement.closest('.grid'));
                errorElement.hide().slideDown(300);
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX hiba: ', error);
            // AJAX hiba esetén is jelenjen meg egy üzenet
            let ajaxErrorHtml = `
                <div class="row-details">
                    <div class="bg-white p-4 rounded-lg shadow-md mx-6">
                        <p class="text-center text-red-500">Hiba történt: ${error}</p>
                    </div>
                </div>
            `;
            const ajaxErrorElement = $(ajaxErrorHtml).insertAfter(clickedElement.closest('.grid'));
            ajaxErrorElement.hide().slideDown(300);
        }
    });
});


$(document).on('click', '.munkalap_megtekintes_gomb', function() {
    const munkalap_id = $(this).attr('id');
    document.cookie = `utolso_munkalap_id=${munkalap_id}; path=/`;
    window.open(`/?menu_id=3`);
});



$("#layout2").click(function(){
    $("#projektek_lista_layout1").addClass("hidden");
    $("#projektek_lista_layout2").removeClass("hidden");
    $("#projektek_lista_layout3").addClass("hidden");

    var calendar = new FullCalendar.Calendar($('#calendar')[0], {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'hu',
        firstDay: 1,
        buttonText: {
            today: 'Ma',
            month: 'Hónap',
            week: 'Hét',
            day: 'Nap',
            list: 'Lista'
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listYear'
        },
        events: function(info, successCallback, failureCallback) {
            // Itt jön a szerver oldalról származó adat feldolgozása
            $.ajax({
                url: '/modul/projektek/server_script/projektek_listazasa.php',
                dataType: 'json',
                success: function(data) {
                    var events = data.map(function(event) {
                        // Ha a 'felvetel_datum' már helyes dátum formátumban érkezik
                        return {
                            title: event.projekt_nev,
                            start: event.hatarido, // Itt egyszerűen átadjuk a dátumot
                        };
                    });
    
                    // Visszaadjuk az eseményeket
                    successCallback(events);
                },
                error: failureCallback
            });
        },
        eventClick: function(info) {
            var options = { year: 'numeric', month: 'long', day: 'numeric' };
            var magyarDatum = info.event.start.toLocaleDateString('hu-HU', options);
            $("#datum_alert").html(info.event.title + ' nevű projekt határideje: ' + magyarDatum);
            $("#datum_alert").removeClass("hidden");
            setTimeout(function() {
                $("#datum_alert").addClass("hidden");
            }, 2000);
        }
    });
    
    
    calendar.render();
    
});





    
$("#layout3").click(function(){
        $("#projektek_lista_layout1").addClass("hidden");
        $("#projektek_lista_layout2").addClass("hidden");
        $("#projektek_lista_layout3").removeClass("hidden");
        
        $.ajax({
            url: '/modul/projektek/server_script/projekt_layout1.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                $("#layout3_lezart_projektek").empty();
                $("#layout3_folyamatban_projektek").empty();
                $("#layout3_inditas_alatt_projektek").empty();
                console.log(response);
                if (response.status === "success" && response.data) {
    
                    response.data.forEach(function(projekt) {
                        // Itt már elérhető a munkaido a projektből
                        const osszMunkaido = parseInt(projekt.munkaido) || 0;
                        
                        $.ajax({
                            url: '/modul/projektek/server_script/projekt_aktivitas.php',
                            type: 'GET',
                            data: { projekt_id: projekt.projekt_id },
                            dataType: 'json',
                            success: function(aktivitasResponse) {
                                let teljesitettMunkaido = 0;
                                
                                if (aktivitasResponse.status === 'success' && aktivitasResponse.projekt_ido_adatok) {
                                    aktivitasResponse.projekt_ido_adatok.forEach(function(aktivitas) {
                                        teljesitettMunkaido += parseInt(aktivitas.ossz_ora);
                                    });
                                }
                                
                                const szazalek = osszMunkaido > 0 ? Math.round((teljesitettMunkaido / osszMunkaido) * 100) : 0;
                                
                                let projektHTML = `
                                <div class="bg-white w-full rounded-lg shadow-md p-2 flex flex-col flex-grow mb-2 hover:shadow-lg transition-shadow duration-300 projekt_folyamat_view " data-projekt-id="${projekt.projekt_id}">
                                    <div class="flex justify-between items-center p-2 ">
                                        <h3 class="font-bold text-lg">${projekt.projekt_nev}</h3>
                                        <span class="text-md text-gray-500">${projekt.hatarido}</span>
                                    </div>
                                    <div class="px-2 ">
                                        <span class="text-md text-gray-600">${projekt.cegnev}</span>
                                    </div>
                                    <div class="flex justify-between items-center p-2 ">
                                        <div class="text-md">
                                            Pénz: ${parseInt(projekt.teljes_osszeg).toLocaleString('hu-HU')} Ft
                                        </div>
                                        
                                        <button type="button" class="projekt_diagram bg-white text-white font-bold py-2 px-4 rounded-lg hover:bg-zold-300 focus:ring-2 focus:ring-zold-100 focus:outline-none transition duration-200 flex items-center space-x-2" data-projekt-id="${projekt.projekt_id}">
                                            <img src="../../assets/diagram_icon.png" class="h-6 w-6">
                                        </button>
                                        
                                    </div>
                                    <div class="w-full mt-2">
                                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${szazalek}%"></div>
                                        </div>
                                        <div class="text-center text-sm mt-1">${szazalek}% (${teljesitettMunkaido}/${osszMunkaido} óra)</div>
                                    </div>
                                </div>
                            `;
    
                                switch(parseInt(projekt.allapot_id)) {
                                    case 1:
                                        $("#layout3_inditas_alatt_projektek").append(projektHTML);
                                        break;
                                    case 2:
                                        $("#layout3_folyamatban_projektek").append(projektHTML);
                                        break;
                                    case 3:
                                        $("#layout3_lezart_projektek").append(projektHTML);
                                        break;
                                }
                            },
                            error: function(xhr, status, error) {
                                console.error("Hiba történt az aktivitás lekérdezésénél:", error);
                            }
                        });
});
                    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////// DIAGRAMOK /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
                    
$(document).on("click", ".projekt_diagram", function (event) {
    event.stopPropagation();
    const projektId = $(this).data("projekt-id");


    // Modal megjelenítése
    $("body").append(`
        <div id="chartModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-11/12 max-w-4xl shadow-lg">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Projekt munkalapok statisztika</h2>
                    <button id="closeChartModal" class="text-gray-700 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="w-full h-80">
                    <canvas id="projektChart" class="items-center"></canvas>
                </div>
            </div>
        </div>
    `);

                
            $.ajax({
                    url: "/modul/projektek/server_script/projekt_munkalap_diagram.php",
                    type: "GET",
                    data: { projekt_id: projektId },
                    dataType: "json",
                    success: function (response) {
                        if (response.status === "success" && response.data) {
                            const munkalapok = response.data.map((m) => m.munkalap_nev);
                            const becsultIdo = response.data.map((m) => parseFloat(m.munkaido) || 0);
                            const teljesitettIdo = response.data.map((m) => parseFloat(m.ossz_ora) || 0);

                            // Meglévő chart törlése, ha van
                            let existingChart = Chart.getChart("projektChart");
                            if (existingChart) existingChart.destroy();
                            const teljesitett_ido_szin = teljesitettIdo.map((actualTime, idx) => {
                                // Compare the actual time with the estimated time for each task
                                return actualTime <= becsultIdo[idx] ? "#20BF55" : "#EF1A2D";  // Green if within the estimated time, Red if exceeded
                            });
                            const ctx = document.getElementById("projektChart").getContext("2d");
                            new Chart(ctx, {
                                type: "bar",  // Grouped Bar chart
                                data: {
                                    labels: munkalapok,  // Munkalapok (task names)
                                    datasets: [
                                        {
                                            label: "Becsült idő (óra)",  // Estimated Completion Time
                                            data: becsultIdo,  // Data for estimated time
                                            backgroundColor: "#dbeaff",  // Color for the estimated time bars
                                            borderColor: "#dbeaff",  // Border color
                                            borderWidth: 1,
                                            categoryPercentage: 0.4,
                                            barPercentage: 0.8,
                                        },
                                        {
                                            label: "Teljesített idő (óra)",  // Actual Completion Time
                                            data: teljesitettIdo,  // Data for actual time
                                            backgroundColor: teljesitett_ido_szin,  // Color for the actual time bars
                                            borderColor: teljesitett_ido_szin,  // Border color
                                            borderWidth: 1,
                                            categoryPercentage: 0.4,  // Reduce spacing between groups
                                            barPercentage: 0.8,  // Adjust bar width
                                        },
                                        
                                    ],
                                },
                                options: {
                                    responsive: true,
                                    legend: {
                                        position: "top"
                                    },
                                    title: {
                                        display: true,
                                        text: "Chart.js Bar Chart"
                                    },
                                    scales: {
                                        yAxes: [{
                                        ticks: {
                                            beginAtZero: true
                                        },
                                        }]
                                    },
                                },
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                footer: function (tooltipItems) {
                                                    const idx = tooltipItems[0].dataIndex;
                                                    const diff = teljesitettIdo[idx] - becsultIdo[idx];
                                                    const sign = diff > 0 ? "+" : "";
                                                    return `Eltérés: ${sign}${diff} óra`;  // Display difference between actual and estimated time
                                                },
                                            },
                                        },
                                    },
                                    // Layout configuration to add padding
                                    layout: {
                                        padding: {
                                            right: 20,  // Right padding to ensure labels are not cut off
                                        },
                                    },
                                
                        });

                        } else {
                            $("#projektChart")
                                .parent()
                                .html('<div class="text-center p-4">Nincs megjeleníthető adat</div>');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Hiba történt a munkalapok lekérdezésénél:", error);
                        $("#projektChart")
                            .parent()
                            .html('<div class="text-center p-4">Hiba történt az adatok lekérdezésénél</div>');
                    },
                });
                
                // Modal bezárása
                $(document).on("click", "#closeChartModal", function () {
                    $("#chartModal").remove();
                });

            });
            
        }
        },
        error: function(xhr, status, error) {
            console.error("Hiba történt:", error);
        }
    
    });


});



$(document).on('click', '.projekt_folyamat_view', function() {
    const projekt_id = $(this).data('projekt-id');
    if (mobilnezet){
        $("#mobil_munkalapok_gomb").attr("data-projekt-id", projekt_id);
    }
    
    $("#projekt_folyamat_nezet").removeClass("hidden");
    
    $.ajax({
        url: '/modul/projektek/server_script/projekt_folyamat_nezet.php',
        type: 'POST',
        data: { projekt_id: projekt_id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                
                const adatok = response.projekt_folyamat_adatok;
                const aktualis_szoftver_osszeg = response.aktualis_szoftver_osszeg;
                const aktualis_hardver_osszeg = response.aktualis_hardver_osszeg;
                const aktualis_teljes_osszeg = aktualis_szoftver_osszeg + aktualis_hardver_osszeg;
                let html = '';
                let projekt_bg_szin = '';
                let projekt_szin = '';
                if(adatok.allapot_id == 1){
                    projekt_bg_szin = 'bg-yellow-100';
                    projekt_szin = 'text-yellow-800';
                }else if(adatok.allapot_id == 2){
                    projekt_bg_szin = 'bg-blue-100';
                    projekt_szin = 'text-blue-800';
                }else if(adatok.allapot_id == 3){
                    projekt_bg_szin = 'bg-green-100';
                    projekt_szin = 'text-green-800';
                }
                // Projekt adatok felsorolása
                html += `<div>
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold pb-2 text-alapzold">${adatok.projekt_nev}</h2>  
                    <h2 class="text-xl font-bold pb-2"> Határidő: ${adatok.hatarido}</h2>
                </div>

                <div class="flex justify-between items-center">
                    <p><strong>Óradíj:</strong> ${parseInt(adatok.oradij).toLocaleString('hu-HU')} Ft</p>
                    
                    <p class="${projekt_bg_szin} ${projekt_szin} px-2 py-1 rounded-full text-md font-bold">${adatok.allapot_nev}</p>
                </div>
                        
                
                    <div class="flex items-center">
                    <p><strong>Munkaidő:</strong> ${adatok.munkaido} óra</p>
                </div>
                    <div class="flex items-center">
                    <p><strong>Kezdés dátuma:</strong> ${adatok.kezdes_datum}</p>
                </div>

                

                <div class="md:pt-10 pt-4 pb-4">
                    
                    <div class="grid md:grid-cols-4 grid-cols-[80px_1fr_1fr_50px] border rounded-lg overflow-hidden">
                        <div class="bg-gray-100 p-2 font-bold flex justify-center items-center"></div>
                        <div class="bg-gray-100 p-2 font-bold flex justify-center items-center">Tervezett költség</div>
                        <div class="bg-gray-100 p-2 font-bold flex justify-center items-center">Aktuális költség</div>
                        <div class="bg-gray-100 p-2 font-bold justify-center items-center md:flex hidden">
                            Kimutatás
                        </div>    
                        <div class="bg-gray-100 p-2 font-bold justify-center items-center flex md:hidden">
                            <img src="../../assets/diagram_icon.png" class="h-6 w-6" ">
                        </div>
                            

                        <div class="bg-gray-100 p-2 font-bold">Szoftver összeg</div>
                        <div class="p-2 flex justify-center items-center">${parseInt(adatok.szoftver_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="p-2 flex justify-center items-center">${parseInt(aktualis_szoftver_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="p-2 flex justify-center items-center">
                            <img src="../../assets/diagram_icon.png" class="h-6 w-6" id="projekt_szoftver_diagram_icon" data-projekt-id="${projekt_id}">
                        </div>
                        
                         <div class="bg-gray-100 p-2 font-bold">Hardver összeg</div>
                        <div class="p-2 flex justify-center items-center">${parseInt(adatok.hardver_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="p-2 flex justify-center items-center">${parseInt(aktualis_hardver_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="p-2 flex justify-center items-center">
                            <img src="../../assets/diagram_icon.png" class="h-6 w-6" id="projekt_hardver_diagram_icon" data-projekt-id="${projekt_id}">
                        </div>
                        
                        
                        
                        <div class="bg-alapzold text-white p-2 font-bold">Teljes összeg</div>
                        <div class="bg-alapzold text-white p-2 flex justify-center items-center font-bold">${parseInt(adatok.teljes_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="bg-alapzold text-white p-2 flex justify-center items-center font-bold">${parseInt(aktualis_teljes_osszeg).toLocaleString('hu-HU')} Ft</div>
                        <div class="bg-alapzold p-2 flex justify-center items-center">
                            <img src="../../assets/diagram_icon.png" class="h-6 w-6" id="projekt_teljes_osszeg_diagram_icon" data-projekt-id="${projekt_id}">
                        </div>
                        
                    </div>
                </div>

                
            </div>`;
                
                
                $('#projekt_adatok_lista').html(html);
            } else {
                console.error('Hiba a válaszban:', response.error);
                $('#projekt_adatok_lista').html('<p class="text-red-500">Hiba történt az adatok betöltése közben.</p>');
            }
        },
        error: function(xhr, status, error) {
            console.error("Hiba történt:", error);
            $('#projekt_adatok_lista').html('<p class="text-red-500">Hiba történt az adatok betöltése közben.</p>');
        }
    });
    
});




  




$(document).on('click', '#projekt_szoftver_diagram_icon', function() {
    const projekt_id = $(this).data('projekt-id');

    $.ajax({
        url: '/modul/projektek/server_script/projekt_szoftver_osszeg_diagram.php',
        type: 'POST',
        data: { projekt_id: projekt_id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const kezdoDatum = response.projekt_ido_intervallum_data[0].datum;
                const aktivitasDatumok = response.projekt_aktivitas_info_data.map(item => item.datum);
                
                // Összes egyedi dátum összegyűjtése és rendezése
                const osszesDatum = [kezdoDatum, ...aktivitasDatumok];
                const egyediDatumok = [...new Set(osszesDatum)].sort();
                
                // Teljesített értékek kiszámítása
                let teljesitettErtekek = [];
    
                egyediDatumok.forEach((datum, index) => {
                    // Ha ez a kezdő dátum, akkor 0
                    if (datum === kezdoDatum) {
                        teljesitettErtekek.push(0);
                        return;
                    }
                    
                    // Az adott napi munkaóra érték kiszámítása
                    const munkaOra = response.projekt_aktivitas_info_data
                        .find(item => item.datum === datum);
                    const munkaOraErtek = munkaOra ? Number(munkaOra.ossz_ora) * 10000 : 0;
                    
                    // Debug információk
                    console.log(`Dátum: ${datum}`);
                    console.log(`  Szoftver (napi): ${munkaOraErtek} Ft`);
                    
                    teljesitettErtekek.push(munkaOraErtek);
                });
    
                const tervezettSzoftverOsszeg = response.projekt_ido_intervallum_data[0].szoftver_osszeg;
    
                // Meglévő chart törlése, ha van
                let existingChart = Chart.getChart("projekt_szoftver_chart");
                if (existingChart) existingChart.destroy();
    
                const ctx = document.getElementById("projekt_szoftver_chart").getContext("2d");
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: egyediDatumok,
                        datasets: [
                            {
                                label: 'Teljes szoftver költség (Ft)',
                                data: teljesitettErtekek,
                                borderColor: 'rgb(32,191,85)',
                                backgroundColor: 'rgba(32,191,85, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Tervezett szoftver költség (Ft)',
                                data: Array(egyediDatumok.length).fill(tervezettSzoftverOsszeg),
                                borderColor: '#DB4437',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                fill: false,
                                pointRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Érték (Ft)'
                                },
                                ticks: {
                                    maxTicksLimit: 10,
                                    callback: function(value) {
                                        return value.toLocaleString('hu-HU') + ' Ft';
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Dátum'
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: function(context) {
                                        const datum = context[0].label;
                                        // Dátum objektum létrehozása
                                        const date = new Date(datum);
                                        // Magyar napnevek tömbje
                                        const napok = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
                                        // A nap nevének lekérése
                                        const napNeve = napok[date.getDay()];
                                        // Visszaadjuk a dátumot és a nap nevét
                                        return `${datum} (${napNeve})`;
                                    },
                                    label: function(context) {
                                        const value = context.parsed.y;
                                        const formattedValue = value.toLocaleString('hu-HU') + ' Ft';
                                        return context.dataset.label + ': ' + formattedValue;
                                    },
                                    afterLabel: function(context) {
                                        if (context.datasetIndex === 0 && context.dataIndex > 0) {
                                            
                                            
                                        
                                            
                                            const value = context.parsed.y;
                                            const previousValue = context.dataset.data[context.dataIndex - 1];
                                            const difference = value - previousValue;
                                            
                                            let percentageChange = 0;
                                            if (previousValue > 0) {
                                                percentageChange = (difference / previousValue) * 100;
                                            }
                                            
                                            return [
                                                `Változás: ${difference >= 0 ? '+' : ''}${difference.toLocaleString('hu-HU')} Ft (${difference >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`
                                            ];
                                        }
                                        return null;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Hiba történt:", error);
        }
    });

    handleDiagramClick("projekt_szoftver_diagram");
});




$(document).on('click', '#projekt_hardver_diagram_icon', function() {

    const projekt_id = $(this).data('projekt-id');

    $.ajax({
        url: '/modul/projektek/server_script/projekt_hardver_osszeg_diagram.php',
        type: 'POST',
        data: { projekt_id: projekt_id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const kezdoDatum = response.projekt_ido_intervallum_data[0].datum;
                const hardverDatumok = response.projekt_hardver_data.map(item => item.datum);
                
                // Összes egyedi dátum összegyűjtése és rendezése
                const osszesDatum = [kezdoDatum, ...hardverDatumok];
                const egyediDatumok = [...new Set(osszesDatum)].sort();
                
                // Teljesített értékek kiszámítása
                let teljesitettErtekek = [];
                let osszesitettHardverErtekek = 0;
    
                egyediDatumok.forEach((datum, index) => {
                    // Ha ez a kezdő dátum, akkor 0
                    if (datum === kezdoDatum) {
                        teljesitettErtekek.push(0);
                        return;
                    }
                    
                    // Az adott napi hardver beszerzések értéke
                    const napiHardverErtekek = response.projekt_hardver_data
                        .filter(item => item.datum === datum)
                        .reduce((sum, item) => sum + (Number(item.darab) * Number(item.beszerzesi_ar)), 0);
                    
                    // Kumulatív hardver érték számítása
                    osszesitettHardverErtekek += napiHardverErtekek;
                    
                    // Debug információk
                    console.log(`Dátum: ${datum}`);
                    console.log(`  Hardver (napi): ${napiHardverErtekek} Ft`);
                    console.log(`  Hardver (kumulatív): ${osszesitettHardverErtekek} Ft`);
                    
                    teljesitettErtekek.push(osszesitettHardverErtekek);
                });
    
                const tervezettHardverOsszeg = response.projekt_ido_intervallum_data[0].hardver_osszeg;
    
                // Meglévő chart törlése, ha van
                let existingChart = Chart.getChart("projekt_hardver_chart");
                if (existingChart) existingChart.destroy();
    
                const ctx = document.getElementById("projekt_hardver_chart").getContext("2d");
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: egyediDatumok,
                        datasets: [
                            {
                                label: 'Teljesített hardver költség (Ft)',
                                data: teljesitettErtekek,
                                borderColor: 'rgb(32,191,85)',
                                backgroundColor: 'rgba(32,191,85, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Tervezett hardver költség (Ft)',
                                data: Array(egyediDatumok.length).fill(tervezettHardverOsszeg),
                                borderColor: '#DB4437',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                fill: false,
                                pointRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Érték (Ft)'
                                },
                                ticks: {
                                    maxTicksLimit: 10,
                                    callback: function(value) {
                                        return value.toLocaleString('hu-HU') + ' Ft';
                                    }
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Dátum'
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: function(context) {
                                        const datum = context[0].label;
                                        // Dátum objektum létrehozása
                                        const date = new Date(datum);
                                        // Magyar napnevek tömbje
                                        const napok = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
                                        // A nap nevének lekérése
                                        const napNeve = napok[date.getDay()];
                                        // Visszaadjuk a dátumot és a nap nevét
                                        return `${datum} (${napNeve})`;
                                    },
                                    label: function(context) {
                                        const value = context.parsed.y;
                                        const formattedValue = value.toLocaleString('hu-HU') + ' Ft';
                                        return context.dataset.label + ': ' + formattedValue;
                                    },
                                    afterLabel: function(context) {
                                        if (context.datasetIndex === 0 && context.dataIndex > 0) {
                                            const datum = egyediDatumok[context.dataIndex];
                                            
                                            // Az adott napi hardver érték
                                            const napiHardverErtekek = response.projekt_hardver_data
                                                .filter(item => item.datum === datum)
                                                .reduce((sum, item) => sum + (Number(item.darab) * Number(item.beszerzesi_ar)), 0);
                                            
                                            const value = context.parsed.y;
                                            const previousValue = context.dataIndex > 0 ? 
                                                context.dataset.data[context.dataIndex - 1] : 0;
                                            const difference = value - previousValue;
                                            
                                            let percentageChange = 0;
                                            if (previousValue > 0) {
                                                percentageChange = (difference / previousValue) * 100;
                                            }
                                            
                                            return [
                                                `Napi hardver költség: ${napiHardverErtekek.toLocaleString('hu-HU')} Ft`,
                                                `Változás: ${difference >= 0 ? '+' : ''}${difference.toLocaleString('hu-HU')} Ft (${difference >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`
                                            ];
                                        }
                                        return null;
                                    }
                                }
                            },
                            legend: {
                                position: 'top'
                            }
                        }
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Hiba történt:", error);
        }
    });


    handleDiagramClick("projekt_hardver_diagram");
});

$(document).on('click', '#projekt_teljes_osszeg_diagram_icon', function() {
    
    const projekt_id = $(this).data('projekt-id');
    
  
    $.ajax({
        url: '/modul/projektek/server_script/projekt_teljes_osszeg_diagram.php',
        type: 'POST',
        data: { projekt_id: projekt_id },
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                const kezdoDatum = response.projekt_ido_intervallum_data[0].datum;
                const aktivitasDatumok = response.projekt_aktivitas_info_data.map(item => item.datum);
                const hardverDatumok = response.projekt_hardver_data.map(item => item.datum);
      
                const osszesDatum = [kezdoDatum, ...aktivitasDatumok, ...hardverDatumok];
                const egyediDatumok = [...new Set(osszesDatum)].sort();
      
                let teljesitettErtekek = [];
                let osszesitettHardverErtekek = 0;

                egyediDatumok.forEach((datum, index) => {
                    if (datum === kezdoDatum) {
                        teljesitettErtekek.push(0);
                        return;
                    }
                    
                    const munkaOra = response.projekt_aktivitas_info_data
                        .find(item => item.datum === datum);
                    const munkaOraErtek = munkaOra ? Number(munkaOra.ossz_ora) * 10000 : 0;
                    
                    const napiHardverErtekek = response.projekt_hardver_data
                        .filter(item => item.datum === datum)
                        .reduce((sum, item) => sum + (Number(item.darab) * Number(item.beszerzesi_ar)), 0);
                    
                    osszesitettHardverErtekek += napiHardverErtekek;
            
                    teljesitettErtekek.push(munkaOraErtek + osszesitettHardverErtekek);
                });
                    
                const teljesOsszeg = response.projekt_ido_intervallum_data[0].teljes_osszeg;
   
                let existingChart = Chart.getChart("projekt_teljes_osszeg_chart");
                if (existingChart) existingChart.destroy();
      
                const ctx = document.getElementById("projekt_teljes_osszeg_chart").getContext("2d");
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: egyediDatumok,
                        datasets: [
                            {
                                label: 'Teljesített érték (Ft)',
                                data: teljesitettErtekek,
                                borderColor: 'rgb(32,191,85)',
                                backgroundColor: 'rgba(32,191,85, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Teljes összeg (Ft)',
                                data: Array(egyediDatumok.length).fill(teljesOsszeg),
                                borderColor: '#DB4437',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                fill: false,
                                pointRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Érték (Ft)'
                                },
                                ticks: {
                                    
                                    maxTicksLimit: 10,
                                    callback: function(value) {
                                        return value.toLocaleString('hu-HU') + ' Ft';
                                    },
                                    
                                    afterBuildTicks: function(scale) {
                                        const teljesOsszeg = parseInt(response.projekt_ido_intervallum_data[0].teljes_osszeg);
                                        
                                        if (!scale.ticks.some(tick => Math.abs(tick.value - teljesOsszeg) < 100)) {
                                            scale.ticks.push({value: teljesOsszeg});
                                        }
                                        
                                        scale.ticks.sort((a, b) => a.value - b.value);
                                        
                                        return scale.ticks;
                                    }
                                },
                                max: Math.max(parseInt(response.projekt_ido_intervallum_data[0].teljes_osszeg), Math.max(...teljesitettErtekek)) * 1.1
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Dátum'
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    title: function(context) {
                                        const datum = context[0].label;
                                        // Dátum objektum létrehozása
                                        const date = new Date(datum);
                                        // Magyar napnevek tömbje
                                        const napok = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
                                        // A nap nevének lekérése
                                        const napNeve = napok[date.getDay()];
                                        // Visszaadjuk a dátumot és a nap nevét
                                        return `${datum} (${napNeve})`;
                                    },
                                    label: function(context) {
                                        const value = context.parsed.y;
                                        const formattedValue = value.toLocaleString('hu-HU') + ' Ft';
                                        
                                        let labelText = context.dataset.label + ': ' + formattedValue;
                                        
                                        return labelText;
                                    },
                                    afterLabel: function(context) {
                                        if (context.datasetIndex === 0 && context.dataIndex > 0) {
                                            const datum = egyediDatumok[context.dataIndex];
                                            
                                            const munkaOra = response.projekt_aktivitas_info_data
                                                .find(item => item.datum === datum);
                                            const munkaOraErtek = munkaOra ? Number(munkaOra.ossz_ora) * 10000 : 0;
                                            
                                            const napiHardverErtekek = response.projekt_hardver_data
                                                .filter(item => item.datum === datum)
                                                .reduce((sum, item) => sum + (Number(item.darab) * Number(item.beszerzesi_ar)), 0);
                                            
                                            const value = context.parsed.y;
                                            const previousValue = context.dataIndex > 0 ? 
                                                context.dataset.data[context.dataIndex - 1] : 0;
                                            const difference = value - previousValue;
                                            
                                            let percentageChange = 0;
                                            if (previousValue > 0) {
                                                percentageChange = (difference / previousValue) * 100;
                                            }
                                            
                                            const szoftverText = `Szoftver (napi): ${munkaOraErtek.toLocaleString('hu-HU')} Ft`;
                                            const hardverText = `Hardver (napi): ${napiHardverErtekek.toLocaleString('hu-HU')} Ft`;
                                            const valtozasText = `Változás: ${difference >= 0 ? '+' : ''}${difference.toLocaleString('hu-HU')} Ft (${difference >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`;
                                            
                                            return [szoftverText, hardverText, valtozasText];
                                        }
                                        
                                        return null;
                                    }
                                }
                            },
                            legend: {
                                position: 'top'
                            }
                        }
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Hiba történt:", error);
        }
      });
  
  
    handleDiagramClick("projekt_teljes_osszeg_diagram");
});

let vissza_allapot = '';

$(document).on('click', '.diagram_container', function() {
    
    if (mobilnezet && !$("#projekt_folyamat_nezet_container").hasClass("overflow-hidden")) { 


        $(this).removeClass("diagram_container");
        
        

        if ($(this).attr('id') == 'projekt_hardver_diagram_container'){
            vissza_allapot = 'hardver';
           

            $("#projekt_adatok_container").addClass("hidden");
            $("#projekt_szoftver_diagram_container").addClass("hidden");
            $("#projekt_teljes_osszeg_diagram_container").addClass("hidden");
            
             // Eltávolítjuk a grid elrendezést
             $("#projekt_folyamat_nezet_container").removeClass("px-4 pt-8 h-[99%]");
               
           
            
         // Konténer átalakítása
         $(this)
             .addClass("fixed bg-white z-50")
             .css({
                 'width': '100vh',
                 'height': '100vw',
                 'top': '0',
                 'left': '0',
                 'transform': 'rotate(90deg) translateY(-100%)',
                 'transform-origin': 'top left'
            });


            $("#projekt_hardver_chart").css({
                'width': '85%',
                'height': '85%'
            });

         // Chart újrarajzolása
         setTimeout(() => {
             if (window.hardverChart) {
                 window.hardverChart.options.maintainAspectRatio = false;
                 window.hardverChart.resize();
                 window.hardverChart.update();
             }
         }, 100);

         // Megjelenítjük a vissza gombot
         $("#diagram_vissza")
             .removeClass("hidden")
             .addClass("fixed")
             .css({
                 'top': '1rem',
                 'right': '1rem',
                 'z-index': '51'
             });

         // Beállítjuk a body-t
         $('body').css('overflow', 'hidden');
     
           
        }
    
    }else{
        if ($(this).attr('id') == 'projekt_hardver_diagram_container'){
            
            $("#projekt_adatok_container").addClass("hidden").removeClass("md:flex md:flex-col");
            $("#projekt_szoftver_diagram_container").addClass("hidden");
            $("#projekt_teljes_osszeg_diagram_container").addClass("hidden");

            $("#projekt_folyamat_nezet_container").removeClass("grid-cols-2 grid-rows-2 md:p-8").addClass("md:pt-12 md:px-8");
            $("#projekt_hardver_diagram_container").addClass("w-full h-full ");
            $(".diagram_container").removeAttr("style");

            $("#diagram_vissza").removeClass("hidden");

        }else if ($(this).attr('id') == 'projekt_szoftver_diagram_container'){

            $("#projekt_adatok_container").addClass("hidden").removeClass("md:flex md:flex-col");
            $("#projekt_hardver_diagram_container").addClass("hidden");
            $("#projekt_teljes_osszeg_diagram_container").addClass("hidden");

            $("#projekt_folyamat_nezet_container").removeClass("grid-cols-2 grid-rows-2 md:p-8").addClass("md:pt-12 md:px-8");
            $("#projekt_szoftver_diagram_container").addClass("w-full h-full ");
            $(".diagram_container").removeAttr("style");

            $("#diagram_vissza").removeClass("hidden");

        }else if ($(this).attr('id') == 'projekt_teljes_osszeg_diagram_container'){

            $("#projekt_adatok_container").addClass("hidden").removeClass("md:flex md:flex-col");
            $("#projekt_szoftver_diagram_container").addClass("hidden");
            $("#projekt_hardver_diagram_container").addClass("hidden");

            $("#projekt_folyamat_nezet_container").removeClass("grid-cols-2 grid-rows-2 md:p-8").addClass("md:pt-12 md:px-8");
            $("#projekt_teljes_osszeg_diagram_container").addClass("w-full h-full ");
            $(".diagram_container").removeAttr("style");

            $("#diagram_vissza").removeClass("hidden");

        }
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////// MOBIL gombok/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('click', '#mobil_munkalapok_gomb', function() {
    const projekt_id = $(this).data('projekt-id');
    $("#projekt_adatok_container").addClass("hidden");
    $("#diagram_vissza").removeClass("hidden");
    $("#munkalap_adatok_container").removeClass("hidden");
    $.ajax({
        url: '/modul/kezdolap/server_script/projekt_munkalapok.php', // Itt lesz a PHP lekérdezésed
        type: 'POST',
        dataType: 'json',
        data: {
            projekt_id: projekt_id
        },
        success: function(response) {
            console.log(response);
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            
            if (data.status === 'success') {
                if(data.data.length > 0){
                    $("#munkalap_adatok_lista").empty();
                    let html = ' <div class="grid grid-cols-1 gap-4 p-2 bg-gray-100 overflow-y-auto max-h-full pb-8">';
                    // Iterálunk a munkalapokon
                    data.data.forEach(function(munkalap) {
                        let max_ora = 0;
                        let hours_max_ora = 0;
                        let minutes_max_ora = 0;
                        if (munkalap.max_ora != null){
                            max_ora = parseFloat(munkalap.max_ora) || 0;
                            hours_max_ora = Math.floor(max_ora);
                            minutes_max_ora = Math.round((max_ora - hours_max_ora) * 60);
                        }
                        let munkaido = 0;
                        let hours_munkaido = 0;
                        let minutes_munkaido = 0;
                        if (munkalap.munkaido != null){
                            munkaido = parseFloat(munkalap.munkaido) || 0;
                            hours_munkaido = Math.floor(munkaido);
                            minutes_munkaido = Math.round((munkaido - hours_munkaido) * 60);
                        }
                        let allapotSzin = '';
                        if (munkalap.allapot_nev === 'Elkészült') {
                            allapotSzin = 'bg-green-100 text-green-800';
                        } else if (munkalap.allapot_nev === 'Indítás alatt') {
                            allapotSzin = 'bg-blue-100 text-blue-800';
                        } else {
                            allapotSzin = 'bg-yellow-100 text-yellow-800';
                        }
                        
                        html += `
                       
                            
                                <div class="flex justify-between font-bold mobil_munkalap_view" id="${munkalap.munkalap_id}">
                                    <span class="text-lg">
                                        ${munkalap.megnevezes}
                                    </span>
                                    <span class=" px-2 py-1 rounded-full text-sm ${allapotSzin}">
                                        ${munkalap.allapot_nev}
                                    </span>
                                </div>
                            
                        `;
                        
                    });
                    html += '</div>';
                    $("#munkalap_adatok_lista").append(html);
                    
                } else {
                    console.log('Nincs adat');
                
                }
            } else {
                console.error('Hiba történt: ', data.error);
               
                
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX hiba: ', error);
            
           
        }
    });
});


$(document).on('click','#mobil_munkalap_view',function(){
    const munkalap_id = $(this).attr('id');
    
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////// vissza gombok/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// ... existing code ...

$(document).on('click', '#diagram_vissza', function() {
    
    

    if(!mobilnezet){
        if($("#projekt_folyamat_nezet_container").hasClass("md:h-[95%]")){
            $("#projekt_folyamat_nezet_container").removeClass("md:pt-12 md:px-8 ").addClass("grid-cols-2 grid-rows-2 md:p-8");

            $("#projekt_adatok_container").removeClass("hidden");

            $("#projekt_hardver_diagram_container").removeClass("w-full h-full");
            $("#projekt_szoftver_diagram_container").removeClass("w-full h-full");
            $("#projekt_teljes_osszeg_diagram_container").removeClass("w-full h-full");

            $("#projekt_hardver_diagram_container").removeClass("hidden");
            $("#projekt_szoftver_diagram_container").removeClass("hidden");
            $("#projekt_teljes_osszeg_diagram_container").removeClass("hidden");
        }else{
            $("#projekt_adatok_container").removeClass("hidden");
            $("#projekt_folyamat_nezet_container").removeClass("md:pt-12 md:px-8 ").addClass("grid-cols-2 md:p-8");

        }
    }

    if(mobilnezet){
    if(vissza_allapot == ''){
        $("#projekt_adatok_container").removeClass("hidden ").addClass("md:flex md:flex-col");
        $("#projekt_folyamat_nezet_container").removeClass("md:pt-12 md:px-8 ").addClass("grid-cols-2 md:p-8");
        $(".diagram_container").css({
            "height": "calc((100vh - 130px) / 2)", // A képernyő magasságához igazítva
            "max-height": "500px" // Maximum magasság korlátozása
        });
        
    }else if(vissza_allapot == 'hardver'){
        // Visszaállítjuk a konténert az eredeti állapotába
        $("#projekt_hardver_diagram_container")
            .removeClass("fixed bg-white z-50")
            .removeAttr('style');

        // Visszaállítjuk a diagramot az eredeti méretére
        $("#projekt_hardver_chart").removeAttr('style');

        $("#projekt_folyamat_nezet_container").addClass("px-4 pt-8 h-[99%]");

        $("#projekt_adatok_container").removeClass("hidden");
        $("#projekt_szoftver_diagram_container").removeClass("hidden");
        $("#projekt_teljes_osszeg_diagram_container").removeClass("hidden");
        
       $("#projekt_hardver_diagram_container").addClass("diagram_container");
        // Visszaállítjuk a vissza gombot
        $("#diagram_vissza")
            .removeClass("fixed")
            .removeAttr('style');
            
        // Visszaállítjuk a vissza_allapot értékét
        vissza_allapot = '';
    }
    }

    $("#diagram_vissza").addClass("hidden");
});

// ... existing code ...


$(document).on('click', '#projekt_adatok_lista_vissza', function() {
    expandedState = 0;
    $("#projekt_hardver_diagram_container").addClass("hidden");
    $("#projekt_szoftver_diagram_container").addClass("hidden");
    $("#projekt_teljes_osszeg_diagram_container").addClass("hidden");

    $("#projekt_folyamat_nezet_container").removeClass("grid-cols-2 grid-rows-2 md:w-[80%] md:h-[50%] md:w-[95%] md:h-[95%]").addClass("grid-cols-1 md:w-[50%] md:h-[50%]");

    $("#projekt_adatok_lista_vissza").addClass("hidden");
});

$(document).on('click', '#projekt_folyamat_bezar', function() {
  expandedState = 0;
  if(!mobilnezet){
  $("#projekt_folyamat_nezet_container")
    .removeClass("grid-cols-2 grid-rows-2 md:w-[80%] md:h-[50%] md:w-[95%] md:h-[95%]")
    .addClass("grid-cols-1 md:w-[50%] md:h-[50%]");
  $("#projekt_adatok_container").removeClass("row-span-1");
  }else{
    $("#projekt_folyamat_nezet_container").addClass("overflow-y-auto");
    
  }
  $("#projekt_szoftver_diagram_container, #projekt_hardver_diagram_container, #projekt_teljes_osszeg_diagram_container").addClass("hidden");
  
  $("#projekt_folyamat_nezet").addClass("hidden");
});
  

if (localStorage.getItem("gombrol_jottem") === "1") {
    $("#projekt_inditas").trigger("click");
    localStorage.removeItem("gombrol_jottem");
}
else{
    $("#layout1").trigger("click");
}


}); //document.ready vége