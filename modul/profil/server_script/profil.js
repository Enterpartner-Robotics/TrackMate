$(document).ready(function () {

    $("#profil_szuletesi_ido").flatpickr({
        dateFormat: "Y-m-d",
        locale: "hu"
      });

    $('#profile_container').on('click', function() {
        $('#profile_picture').click();
      });
      
      $('#profile_picture').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            $('#profile_preview').attr('src', e.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
      
      $('#profile_container').hover(
        function() {
          $('#profile_hover').removeClass('opacity-0');
        },
        function() {
          $('#profile_hover').addClass('opacity-0');
        }
      );








    function felh_adatok_betoltese() {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/modul/profil/server_script/profil_betolt.php",
            success: function (response) {
                if (response.status === "success") {
                    const adatok = response.data;
                    $("#profil_felhasznalonev").val(adatok.felh_nev);
                    $("#profil_teljesnev").val(adatok.teljes_nev);
                    $("#profil_szuletesi_ido").val(adatok.szuletesi_ido);
                    $("#profil_email").val(adatok.email);
                    $("#profil_telefonszam").val(adatok.telefon);
                    
                    $('#profile_preview').attr('src', adatok.profil_kep_link);
                } else {
                    console.error("Hiba:", response.message);
                    alert("Hiba történt: " + response.message);
                }
            },
            error: function (err) {
                console.error("Hiba történt a szerkesztés során:", err);
                alert("Hiba történt az adatainak betöltése közben!");
            }
        });
    }
    function profil_frissitve_jo_mutat() {
        const alertBox = $("#profil_frissitve_jo");
        
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
    function profil_frissitve_nemjo_mutat() {
        const alertBox = $("#profil_frissitve_nemjo");
        
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
    felh_adatok_betoltese()
    $('#profil_modositasa_gomb').on('click', function (e) {
        e.preventDefault();

        const formElement = document.getElementById('profil_form'); // HTMLFormElement lekérése
        const formData = new FormData(formElement); // FormData helyes létrehozása
    
        // Ellenőrizzük, hogy van-e kiválasztott fájl
        const fileInput = document.getElementById('profile_picture');
        if (fileInput.files.length > 0) {
            formData.append('profile_picture', fileInput.files[0]);
        }

        $.ajax({
            type: "POST",
            url: "/modul/profil/server_script/profil_modosit.php",
            data: formData,
            contentType: false, // Fontos: ne állítsuk be a Content-Type fejlécet, mert FormData automatikusan kezeli
            processData: false,
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    felh_adatok_betoltese();
                    $("#profil_frissitve_jo").html("Profil adatok sikeresen frissítve!");
                    profil_frissitve_jo_mutat();
                    $('#profilgomb-mobil').attr('src', response.profil_kep_link);
                    $('#profilgomb').attr('src', response.profil_kep_link);
                } else {
                    $("#profil_frissitve_nemjo").html(response.message);
                    profil_frissitve_nemjo_mutat();
                }
            },
        });
    });
    $('#profil_kijelentkez').on('click', function () {
        $.ajax({
            type: "POST",
            url: "/modul/profil/server_script/profil_kijelentkez.php",
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    const mostaniURL = window.location.origin + window.location.pathname;
                    const ujURL = mostaniURL + "?menu_id=100";
                    window.location.href = ujURL;
                }
            },
        });
    });
    $('#profil_jelszo_modosit_gomb').on('click', function () {
        const dialog = $('#jelszo_modosi_dialog');
        dialog.removeClass('hidden opacity-0 pointer-events-none')
              .addClass('opacity-100 pointer-events-auto');
    });

    $('#megse-gomb').on('click', function () {
        const dialog = $('#jelszo_modosi_dialog');
        dialog.addClass('hidden opacity-0 pointer-events-none')
              .removeClass('opacity-100 pointer-events-auto');
        $(".form-input").removeClass("border-flash border-red-500");
        $("#form-alert").addClass("hidden").removeClass("fade-in");
    });

    $("#jelszo-form").on("submit", function (e) {
        e.preventDefault();

        const jelszo_sablon = /^(?=.*[A-Z]).{6,}$/;
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
        $("#form-alert").addClass("hidden").removeClass("fade-in");

        var regi_jelszo = $('#regi_jelszo').val();
        var uj_jelszo = $('#uj_jelszo').val();
        var uj_jelszo_ujra = $('#uj_jelszo_ujra').val();

        if (!jelszo_sablon.test(uj_jelszo)) {
            $("#profil_frissitve_nemjo").html(
              "A jelszónak legalább 6 karakter hosszúnak kell lennie és tartalmaznia kell egy nagybetűt."
            );
            profil_frissitve_nemjo_mutat();
            return;
        }

        if(uj_jelszo != uj_jelszo_ujra){
            $("#profil_frissitve_nemjo").html("Nem egyeznek meg az új jelszavak!");
            profil_frissitve_nemjo_mutat();
            return;
        }

        $.ajax({
            type: "POST",
            url: "/modul/profil/server_script/profil_jelszo_valt.php",
            dataType: "json",
            data:{
                regi_jelszo: regi_jelszo,
                uj_jelszo: uj_jelszo
            },
            success: function (response) {
                if (response.status === "success") {
                    const dialog = $('#jelszo_modosi_dialog');
                    dialog.addClass('hidden opacity-0 pointer-events-none')
                        .removeClass('opacity-100 pointer-events-auto');
                    $("#profil_frissitve_jo").html(response.message);
                    profil_frissitve_jo_mutat();
                }else{
                    $("#profil_frissitve_nemjo").html(response.message);
                    profil_frissitve_nemjo_mutat();
                }
            },
        });

    });
    
    

});