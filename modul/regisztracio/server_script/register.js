$(document).ready(function () {


  $("#regisztracio_szuletesi_ido").flatpickr({
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







  $('#bejelentkezes_link').on('click', function () {
    const alapURL = window.location.protocol + '//' + window.location.hostname;
    const ujURL = alapURL + '/index.php?menu_id=1';
    window.location.href = ujURL;
  });

  $("#regisztracio_form").on("submit", function (event) {
    event.preventDefault();

    $("#hibas_regisztracio").hide();
    $("#sikeres_regisztracio").hide();

    const regisztracio_jelszo = $("#regisztracio_jelszo").val();
    const regisztracio_jelszo_megerosites = $("#regisztracio_jelszo_megerosites").val();
    const jelszo_sablon = /^(?=.*[A-Z]).{6,}$/;


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
    if (!isValid) {
        $("#hibauzenet").text(
          "Minden mezőt ki kell tölteni!"
        );
        $("#hibas_regisztracio").show();
        return;
    }

    // Ha nincs hiba
    $("#hibas_regisztracio").hide();


    
    if (!jelszo_sablon.test(regisztracio_jelszo)) {
      $("#hibauzenet").text(
        "A jelszónak legalább 6 karakter hosszúnak kell lennie és tartalmaznia kell egy nagybetűt."
      );
      $("#hibas_regisztracio").show();
      return;
    }

    if (regisztracio_jelszo !== regisztracio_jelszo_megerosites) {
      $("#hibauzenet").text("A jelszavak nem egyeznek.");
      $("#hibas_regisztracio").show();
      return;
    }

    
    $.ajax({
      url: "/modul/regisztracio/server_script/regisztracio_feldolg.php",
      type: "POST",
      data: new FormData(this),
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === "success") {
          $("#sikeres_regisztracio").show();
          setTimeout(function () {
            const alapURL = window.location.protocol + '//' + window.location.hostname;
            const ujURL = alapURL + '/index.php?menu_id=1';
            window.location.href = ujURL;

          }, 3500);
        } else {
          $("#hibauzenet").text(response.message);
          $("#hibas_regisztracio").show();
        }
        return false;
      },
      error: function (xhr, status, error) {
        $("#hibauzenet").text(
          "Hiba történt a regisztráció során. Kérjük, próbáld meg újra."
        );
        $("#hibas_regisztracio").show();
      },

    });

  });  //form_submit vége

}); // document.ready vége