$(document).ready(function () {
  
  $('#regisztracioLink').on('click', function () {
    const alapURL = window.location.protocol + '//' + window.location.hostname;
    const ujURL = alapURL + '/index.php?menu_id=101';
    window.location.href = ujURL;
  });

  $("#bejelentkezesForm").on("submit", function (event) {
    event.preventDefault();

  
    let validacio = true;
    let hianyzo_mezok = [];

    $(".form-input").each(function () {
        if ($(this).val().trim() === "") {
            validacio = false;
            hianyzo_mezok.push($(this).attr("id")); 
            $(this).addClass("border-flash border-red-500"); 
        } else {
            $(this).removeClass("border-flash border-red-500"); 
        }
    });
    if (!validacio) {
      $("#hibauzenet").html("Az összes mezőt ki kell tölteni!");
      $('#hibauzenet').fadeIn(300).delay(1500).fadeOut(300); 
      return; 
  }


    $.ajax({
      url: "/modul/bejelentkezes/server_script/bejelentkezes_feldolg.php",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          
          const alapURL = window.location.protocol + '//' + window.location.hostname;
          const ujURL = alapURL + '/index.php?menu_id=1';
          window.location.href = ujURL;
        } else {
          $("#hibauzenet").html(response.message);
          $('#hibauzenet').fadeIn(300).delay(1500).fadeOut(300);
        }
      },
      error: function (xhr, status, error) {
        $("#hibauzenet").html(
          "Hiba történt a bejelentkezés során. Kérjük, próbáld meg újra."
        );
      },
    });
  });

});