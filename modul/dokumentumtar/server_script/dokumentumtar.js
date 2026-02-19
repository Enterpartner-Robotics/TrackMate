$(document).ready(function() {

  socket.on('update_dokumentumtar_jobboldal', function (data) {
      if(data.update == 'dokumentumtar_jobboldal'){
        const kereses_szoveg = $('#kereses_input').val().trim();
        const rendezes = $('#rendezes_valasztas').val();
        const tipus = $('#tipus_valasztas').val();
        const kategoria_id = $('#kategoria_id_hidden').val();
        dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
      }
  });
  socket.on('update_kategoria_baloldal', function (data) {
      if(data.update == 'kategoria_baloldal'){
        kategoriaBetoltes();
      }
  });
  

  
    const $oldalsavKapcsolo = $('#mobil-oldalsav-kapcsolo');
    const $oldalsav = $('#oldalsav');

    $oldalsavKapcsolo.on('click', function() {
      if ($oldalsav.hasClass('hidden')) {
        $oldalsav.removeClass('hidden').addClass('fixed top-0 left-0 h-full z-50');
      } else {
        $oldalsav.addClass('hidden').removeClass('fixed top-0 left-0 h-full z-50');
      }
    });
    
    $(document).on('click', function(e) {
      const isMobile = $(window).width() < 768;
      if (
        isMobile &&
        !$oldalsav.is(e.target) &&
        $oldalsav.has(e.target).length === 0 &&
        !$oldalsavKapcsolo.is(e.target) &&
        $oldalsavKapcsolo.has(e.target).length === 0
      ) {
        $oldalsav.addClass('hidden').removeClass('fixed top-0 left-0 h-full z-50');
      }
    });
    


//###########################################################################################################################
//###########################################################################################################################
//##########################################   KATEGORIA BETOLTES ÉS KEZELÉS      ###########################################
//###########################################################################################################################
//###########################################################################################################################


    function kategoriaBetoltes(){
      $.ajax({
        url: '/modul/dokumentumtar/server_script/kategoria_betoltes.php',
        type: 'POST',
        dataType: 'json',
        success: function(data) {
          if(data.status === 'success'){
            $('#kategoria_lista_kontener').empty();
            const szinek = ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500', 'text-lime-500'];
            $('#kategoria_lista_kontener').append(`
              <li class="relative group">
                <button 
                  class="kategoria-gomb flex items-center w-full px-2 py-2 text-sm font-medium text-alapzold rounded-md hover:bg-gray-100"
                  data-kategoria_id="0"
                >
                
                  <span id="ikon-0" class="h-4 w-4 mr-2"></span>
                  <span id="kategoria_nev-0" class="flex-1 text-left truncate">Összes</span>
                </button>
              </li>
            `);
            data.kategoria_lista.forEach(function(kategoria, index) {
              const szinOsztaly = szinek[index % szinek.length];
              $('#kategoria_lista_kontener').append(`
                <li class="relative group">
                  <button 
                    class="kategoria-gomb flex items-center w-full px-2 py-2 text-sm font-medium text-alapzold rounded-md hover:bg-gray-100"
                    data-kategoria_id="${kategoria.kategoria_id}"
                  >
                    <span id="ikon-${kategoria.kategoria_id}" class="h-4 w-4 mr-2"></span>
                    <span id="kategoria_nev-${kategoria.kategoria_id}" class="flex-1 text-left truncate">${kategoria.kategoria_nev}</span>
                  </button>

                  <!-- Szerk/X gombok -->
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 hidden [#dokumentumtar[data-edit=true]_&]:group-hover:flex gap-1 z-10">
                    <button class="edit-kategoria text-xs" data-id="${kategoria.kategoria_id}">
                      <div class="group w-6 h-6 cursor-pointer text-gray-500 hover:text-blue-500 transition-colors duration-200">
                        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_503_31844" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="1" width="21" height="22">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M23 1H2V23H23V1ZM7.5 18C8.05228 18 8.5 17.5523 8.5 17C8.5 16.4477 8.05228 16 7.5 16C6.94772 16 6.5 16.4477 6.5 17C6.5 17.5523 6.94772 18 7.5 18Z" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_503_31844)">
                                <path d="M14.2525 13.61L7.90255 19.96C7.51255 20.35 6.88251 20.35 6.49251 19.96L4.5425 18.01C4.1525 17.62 4.1525 16.99 4.5425 16.6L10.8925 10.25L14.2525 13.61Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M17.1537 4.01575L13 8.16943L16.182 11.3514L20.4061 7.12725C20.6283 7.70893 20.75 8.34025 20.75 9C20.75 11.8995 18.3995 14.25 15.5 14.25C12.6005 14.25 10.25 11.8995 10.25 9C10.25 6.10051 12.6005 3.75 15.5 3.75C16.0778 3.75 16.6338 3.84333 17.1537 4.01575Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                        </svg>
                      </div>
                    </button>
                    <button class="delete-kategoria text-xs" data-id="${kategoria.kategoria_id}">
                      <div class="group w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 500 500" fill="currentColor">
                          <g clip-path="url(#e)">
                            <g clip-path="url(#o)">
                              <g style="display:block">
                                <path d="M388.737 155.025H92.95l27.912 251.626c3.124 28.746 27.704 50.409 56.866 50.409h142.06c29.162 0 53.742-21.663 56.866-50.409l27.912-251.626h-15.83zM269.589 248.76c0-11.457 9.374-20.83 20.83-20.83 11.457 0 20.83 9.373 20.83 20.83v124.98c0 11.456-9.373 20.83-20.83 20.83-11.456 0-20.83-9.374-20.83-20.83V248.76zm-83.32 0c0-11.457 9.374-20.83 20.83-20.83 11.457 0 20.83 9.373 20.83 20.83v124.98c0 11.456-9.373 20.83-20.83 20.83-11.456 0-20.83-9.374-20.83-20.83V248.76z"/>
                              </g>
                              <g style="display:block">
                                <path d="M415.396 82.116h-145.81v-20.83c0-11.498-9.311-20.83-20.83-20.83-11.519 0-20.83 9.332-20.83 20.83v20.83H82.116c-11.519 0-20.83 9.332-20.83 20.83 0 11.498 9.311 20.83 20.83 20.83h333.28c11.519 0 20.83-9.332 20.83-20.83 0-11.498-9.311-20.83-20.83-20.83z"/>
                              </g>
                            </g>
                          </g>

                          <!-- Defs -->
                          <defs>
                            <clipPath id="e"><path d="M0 0h500v500H0z"/></clipPath>
                            <clipPath id="o"><path d="M0 0h500v500H0z"/></clipPath>
                          </defs>
                        </svg>
                      </div>
                    </button>
                  </div>
                </li>
                `);
                $.get('/assets/mappa.svg', function(data) {
                  const $svg = $(data).find('svg')
                    .addClass('w-4 h-4 stroke-current ' + szinOsztaly);
                  
                $(`#ikon-${kategoria.kategoria_id}`).empty().append($svg);
              });
            });
            $.get('/assets/mappa.svg', function(data) {
              const $svg = $(data).find('svg')
                .addClass('w-4 h-4 stroke-current text-alapzold');
              
            $(`#ikon-0`).empty().append($svg);
          });
          }
        }
      });
    }
    kategoriaBetoltes();
    $('#uj_kategoria_gomb').on('click', function(e) {
      e.stopPropagation();
      $('#kategoria_feltoltes').removeClass('hidden');
    });

    $('#kategoria_bezaras').on('click', function() {
      $('#kategoria_feltoltes').addClass('hidden');
      $('#kategoria_nev').val('');
      $("#kategoria_nev").removeClass("border-flash border-red-500");
      $("#form-kategoria-alert").addClass("hidden").removeClass("fade-in");
    });
    //Kategória feltöltés popup bezárása
    $(document).on('click', function(e) {
      const $popup = $('#kategoria_feltoltes');
      const $modalBox = $popup.find('.modal-box');
    
      if (
        !$popup.hasClass('hidden') &&
        !$modalBox.is(e.target) &&
        $modalBox.has(e.target).length === 0
      ) {
        $popup.addClass('hidden');
        $('#kategoria_nev').val('');
        $("#kategoria_nev").removeClass("border-flash border-red-500");
        $("#form-kategoria-alert").addClass("hidden").removeClass("fade-in");
      }
    });





    //Kategória szerkesztés popup bezárása
    $(document).on('click', function(e) {
      const $popup = $('#kategoria_szerkesztes');
      const $modalBox = $popup.find('.modal-box-szerkesztes');
    
      if (
        !$popup.hasClass('hidden') &&
        !$modalBox.is(e.target) &&
        $modalBox.has(e.target).length === 0
      ) {
        $popup.addClass('hidden');
        $('#kategoria_nev_szerkesztes').val('');
        $("#kategoria_nev_szerkesztes").removeClass("border-flash border-red-500");
        $("#form-kategoria-szerkesztes-alert").addClass("hidden").removeClass("fade-in");
      }
    });




    $('#kategoria_feltoltes_gomb').on('click', function() {
      var kategoria_nev = $('#kategoria_nev').val();
      if (kategoria_nev.trim() === '') {
        $("#kategoria_nev").addClass("border-flash border-red-500");
        $("#form-kategoria-alert").removeClass("hidden").addClass("fade-in");
        return;
      }
      else{
        $("#kategoria_nev").removeClass("border-flash border-red-500");
        $("#form-kategoria-alert").addClass("hidden").removeClass("fade-in");
      }
      $.ajax({
        url: '/modul/dokumentumtar/server_script/kategoria_feltoltes.php',
        type: 'POST',
        dataType: 'json',
        data: {kategoria_nev: kategoria_nev},
        success: function(response) {
          if(response.status === 'success'){
            $('#kategoria_feltoltes').addClass('hidden');
            $('#kategoria_nev').val('');
          }
          else{
            $('#kategoria_alert').removeClass('hidden').addClass('fade-in');
            setTimeout(function() {
              $('#kategoria_alert').addClass('hidden').removeClass('fade-in');
            }, 1500);
            $('#kategoria_alert').text(response.message);
          }
        }
      });
    });






    $('#kategoria_kezeles').on('click', function() {
      const $dokumentumtar = $('#dokumentumtar');
      const szerkesztoMod = $dokumentumtar.attr('data-edit') === 'true';
    
      if (szerkesztoMod) {
        // Kilépés szerkesztő módból
        $('#kategoria-arnyek').addClass('hidden');
        $('#oldalsav').removeClass('z-[51]').addClass('z-10');
        $dokumentumtar.attr('data-edit', 'false');
      } else {
        // Belépés szerkesztő módba
        $('#kategoria-arnyek').removeClass('hidden');
        $('#oldalsav').addClass('z-[51]');
        $dokumentumtar.attr('data-edit', 'true');
      }
    });




    
    $(document).on('click', '#kategoria-arnyek', function() {
      $(this).addClass('hidden');
      $('#oldalsav').removeClass('z-[51]').addClass('z-10');
      $('#dokumentumtar').attr('data-edit', 'false');
    });





    $(document).on('click', '.edit-kategoria', function(e) {
      e.stopPropagation();
      $('#kategoria_szerkesztes').removeClass('hidden');
      const id = $(this).data('id');
      const kategoria_nev = $('#kategoria_nev-'+id).text();
      $('#kategoria_szerkesztes_gomb').attr('data-id', id);
      $('#kategoria_nev_szerkesztes').val(kategoria_nev);
    });


    $('#kategoria_szerkesztes_gomb').on('click', function() {
      const id = $(this).data('id');
      const kategoria_nev = $('#kategoria_nev_szerkesztes').val();
      if (kategoria_nev.trim() === '') {
        $("#kategoria_nev_szerkesztes").addClass("border-flash border-red-500");
        $("#form-kategoria-szerkesztes-alert").removeClass("hidden").addClass("fade-in");
        return;
      }
      else{
        $("#kategoria_nev_szerkesztes").removeClass("border-flash border-red-500");
        $("#form-kategoria-szerkesztes-alert").addClass("hidden").removeClass("fade-in");
      }
      $.ajax({
        url: '/modul/dokumentumtar/server_script/kategoria_szerkesztes.php',
        type: 'POST',
        dataType: 'json',
        data: {kategoria_id: id, kategoria_nev: kategoria_nev},
        success: function(response) {
          if(response.status === 'success'){
            $('#kategoria_szerkesztes').addClass('hidden');
            $('#kategoria_nev_szerkesztes').val('');
            $("#kategoria_nev_szerkesztes").removeClass("border-flash border-red-500");
            $("#form-kategoria-szerkesztes-alert").addClass("hidden").removeClass("fade-in");
          }
          else{
            $('#kategoria_alert').removeClass('hidden').addClass('fade-in');
            setTimeout(function() {
              $('#kategoria_alert').addClass('hidden').removeClass('fade-in');
            }, 1500);
            $('#kategoria_alert').text(response.message);
          }
        }
      });
    });


    $('#kategoria_szerkesztes_bezaras').on('click', function() {
      $('#kategoria_szerkesztes').addClass('hidden');
      $('#kategoria_nev_szerkesztes').val('');
      $("#kategoria_nev_szerkesztes").removeClass("border-flash border-red-500");
      $("#form-kategoria-szerkesztes-alert").addClass("hidden").removeClass("fade-in");
    });




    
    $(document).on('click', '.delete-kategoria', function(e) {
      e.stopPropagation();
      const id = $(this).data('id');
        $.ajax({
          url: '/modul/dokumentumtar/server_script/kategoria_torles.php',
          type: 'POST',
          dataType: 'json',
          data: {kategoria_id: id},
          success: function(response) {
            if (response.status === 'error') {
              alert(response.message);
            }
          }
        });
    });

    $(document).on('click', '.kategoria-gomb', function() {
      const szerkesztoMod = $('#dokumentumtar').attr('data-edit') === 'true';
      if (szerkesztoMod) return;
      const kategoria_id = $(this).data('kategoria_id');
      if(kategoria_id != '0'){
        $('#kategoria_id_hidden').val(kategoria_id);
        $('#kategoria_nev_hidden').val($(this).text().trim());
      }
      else{
        $('#kategoria_id_hidden').val('');
        $('#kategoria_nev_hidden').val('');
      }
      if(kategoria_id == '0'){
        $('#dokumentumtar_cim').text('Dokumentumtár');
      }
      else{
        $('#dokumentumtar_cim').text('Dokumentumtár ('+$(this).text()+')');
      }
      const kereses_szoveg = $('#kereses_input').val().trim();
      const rendezes = $('#rendezes_valasztas').val();
      const tipus = $('#tipus_valasztas').val();
      dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
      $('#oldalsav').addClass('hidden');
    });

//###########################################################################################################################
//###########################################################################################################################
//##########################################   DOKUMENTUMOK KEZELÉS      ####################################################
//###########################################################################################################################
//###########################################################################################################################

  const $nyitoGomb = $('#uj_dokumentum_gomb');
  const $hatter = $('#dokumentum_hatter');
  const $huzdIde = $('#huzd_ide');
  const $fajlBemenet = $('#fajl_bemenet');
  const $fajlLista = $('#fajl_lista');
  const $kivalasztottFajlok = $('#kivalasztott_fajlok');
  const $feltoltesGomb = $('#feltoltes_gomb');
  const $megseGomb = $('#megse_gomb');
  let fajlok = [];

  $nyitoGomb.on('click', () => {
    $hatter.removeClass('hidden');
    // Biztosítjuk, hogy a fájl input kattintható legyen
    const kategoria_id = $('#kategoria_id_hidden').val();
    if(kategoria_id){
      $('#dokumentum_kategoria').attr('data-kategoria_id', kategoria_id);
      $('#dokumentum_kategoria span').text($('#kategoria_nev_hidden').val().trim());
    }
    $fajlBemenet.css('pointer-events', 'auto');
    $huzdIde.css('pointer-events', 'auto');
  });

  $megseGomb.on('click', () => {
    $hatter.addClass('hidden');
    // Visszaállítjuk a pointer-events-et
    $fajlBemenet.css('pointer-events', 'none');
    $huzdIde.css('pointer-events', 'none');
    $('#dokumentum_kategoria').attr('data-kategoria_id', '');
    $('#dokumentum_kategoria span').text('Válassza ki a kategóriát!');
    fajlok = [];
    frissitFajlLista();
  });

  $hatter.on('click', function(e) {
    if (e.target === this) {
      $hatter.addClass('hidden');
      // Visszaállítjuk a pointer-events-et
      $fajlBemenet.css('pointer-events', 'none');
      $huzdIde.css('pointer-events', 'none');
      $('#dokumentum_kategoria').attr('data-kategoria_id', '');
      $('#dokumentum_kategoria span').text('Válassza ki a kategóriát!');
      fajlok = [];
      frissitFajlLista();
    }
  });

  // Módosított kattintás kezelő
  $huzdIde.on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $fajlBemenet.val(''); // Reset the input
    $fajlBemenet.trigger('click');
  });

  // Módosított fájl változás kezelő
  $fajlBemenet.on('change', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.files && this.files.length > 0) {
      feldolgozFajlok(Array.from(this.files));
    }
  });

  $huzdIde.on('dragover', function(e) {
    e.preventDefault();
    $huzdIde.addClass('border-green-600 bg-green-50');
  });
  $huzdIde.on('dragleave', function(e) {
    e.preventDefault();
    $huzdIde.removeClass('border-green-600 bg-green-50');
  });
  $huzdIde.on('drop', function(e) {
    e.preventDefault();
    $huzdIde.removeClass('border-green-600 bg-green-50');
    if (e.originalEvent.dataTransfer.files?.length > 0) feldolgozFajlok(Array.from(e.originalEvent.dataTransfer.files));
  });

  function feldolgozFajlok(ujFajlok) {
    const engedelyezettTipusok = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/step',
    'application/STEP',
    'application/x-step',
    'application/x-stp',
    'model/stl',
    'application/vnd.ms-pki.stl',
    'model/3mf',
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'application/x-compressed',
    'application/x-7z-compressed',
    'application/x-compressed-tar',
    
    ];
  
    const engedelyezettKiterjesztesek = ['.step', '.stp', '.shapr', '.3mf'];
  
    const validFajlok = ujFajlok.filter(fajl => {
      const fajlTipus = fajl.type;
      const fajlNev = fajl.name.toLowerCase();
      const kiterjesztesMegfelelo = engedelyezettKiterjesztesek.some(ext => fajlNev.endsWith(ext));
      const tipusMegfelelo = engedelyezettTipusok.includes(fajlTipus);
  
      if (!(tipusMegfelelo || kiterjesztesMegfelelo)) {
        $('#dokumentum_alert').removeClass('hidden').addClass('fade-in');
        setTimeout(function () {
          $('#dokumentum_alert').addClass('hidden').removeClass('fade-in');
        }, 3000);
        $('#dokumentum_alert').text(`Nem támogatott fájltípus: ${fajl.name}`);
        return false;
      }
      return true;
    });
  
    fajlok = fajlok.concat(validFajlok).filter((f, index, self) =>
      index === self.findIndex(t => t.name === f.name && t.size === f.size)
    );
  
    frissitFajlLista();
  }

  function frissitFajlLista() {
    $kivalasztottFajlok.empty();
    if (fajlok.length > 0) {
      $fajlLista.removeClass('hidden');
      $feltoltesGomb.prop('disabled', false);
      fajlok.forEach((fajl, index) => {
        const $sor = $(`
          <div class="flex items-center justify-between rounded bg-green-50 p-2 text-sm mb-2">
            <span class="truncate text-green-800">${fajl.name}</span>
            <button class="h-6 w-6 text-green-700 hover:bg-green-100 hover:text-green-900 rounded-full flex items-center justify-center" data-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        `);
        $sor.find('button').on('click', function(e) {
          e.stopPropagation();
          const index = $(this).data('index');
          fajlok.splice(index, 1);
          frissitFajlLista();
        });
        $kivalasztottFajlok.append($sor);
      });
    } else {
      $fajlLista.addClass('hidden');
      $feltoltesGomb.prop('disabled', true);
    }
  }

  $feltoltesGomb.on('click', () => {
    const kategoria_id = $('#dokumentum_kategoria').attr('data-kategoria_id');
    const kategoria_nev = $('#dokumentum_kategoria span').text().trim();
    const formData = new FormData();

    fajlok.forEach((fajl, index) => {
      formData.append(`fajl[]`, fajl);
    });

    formData.append('kategoria_id', kategoria_id);
    formData.append('kategoria_nev', kategoria_nev);
    $.ajax({
      url: '/modul/dokumentumtar/server_script/dokumentum_feltoltes.php',
      type: 'POST',
      dataType: 'json',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        if(response.status === 'success'){
          $hatter.addClass('hidden');
          // Visszaállítjuk a pointer-events-et
          $fajlBemenet.css('pointer-events', 'none');
          $huzdIde.css('pointer-events', 'none');
          $('#dokumentum_kategoria').attr('data-kategoria_id', '');
          $('#dokumentum_kategoria span').text('Válassza ki a kategóriát!');
          fajlok = [];
          frissitFajlLista();
        }
        else{
          $('#dokumentum_alert').removeClass('hidden').addClass('fade-in');
          setTimeout(function() {
            $('#dokumentum_alert').addClass('hidden').removeClass('fade-in');
          }, 3000);
          $('#dokumentum_alert').html(response.message);
        }
      }
    });
  });



  $(document).on('click', '#dokumentum_kategoria', function(){
      $('#custom_dropdown').toggle();
      $.ajax({
        url: '/modul/dokumentumtar/server_script/kategoria_betoltes.php',
        type: 'POST',
        dataType: 'json',
        success: function(data) {
          if(data.status === 'success'){
            $('#custom_dropdown').empty();
            data.kategoria_lista.forEach(function(kategoria, index) {
              $('#custom_dropdown').append(`<div class="kategoria_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-kategoria_id="${kategoria.kategoria_id}">${kategoria.kategoria_nev}</div>`);
            });
          }
          else{
            alert(data.message);
          }
        }
      });
  });


  $(document).on('click', '.kategoria_sor', function() {
      const selectedValue = $(this).data('kategoria_id');
      const selectedText = $(this).text();
      $('#dokumentum_kategoria span').text(selectedText);
      $('#dokumentum_kategoria').attr('data-kategoria_id', selectedValue);
      $('#custom_dropdown').hide();
  });

  // Hide dropdown when clicking outside
  $(document).on('click', function(event) {
      if (!$(event.target).closest('#dokumentum_kategoria').length) {
          $('#custom_dropdown').hide();
      }
  });
//###########################################################################################################################
//###########################################################################################################################
//##########################################   DOKUMENTUMOK BETOLTES      ###################################################
//###########################################################################################################################
//###########################################################################################################################

function dokumentum_lista_betoltes(kategoria_id = '', kereses_szoveg = '', rendezes = '', tipus = ''){
  $.ajax({
    url: '/modul/dokumentumtar/server_script/dokumentum_lista_betoltes.php',
    type: 'POST',
    dataType: 'json',
    data: {kategoria_id: kategoria_id, kereses_szoveg: kereses_szoveg, rendezes: rendezes, tipus: tipus},
    success: function(data) {
      if(data.status === 'success'){
        $('#dokumentum_lista').empty();
        if(data.dokumentum_lista.length > 0){
          data.dokumentum_lista.forEach(function(dokumentum) {
          if(!dokumentum.kategoria_nev){
            dokumentum.kategoria_nev = 'Nincs kategória';
          }
          let iconHtml = '';

          if(dokumentum.tipus_nev == 'PDF'){
            iconHtml = `<img src="/assets/pdf_icon.png" alt="${dokumentum.dokumentum_nev}" class="w-10 h-10 object-cover rounded-md">`;
          }
          else if(dokumentum.tipus_nev == 'DOCX' || dokumentum.tipus_nev == 'DOC'){
            iconHtml = `<img src="/assets/word.png" alt="${dokumentum.dokumentum_nev}" class="w-10 h-10 object-cover rounded-md">`;
          }
          else if(dokumentum.tipus_nev == 'CSV' || dokumentum.tipus_nev == 'XLSX' || dokumentum.tipus_nev == 'XLS'){
            iconHtml = `<img src="/assets/excel.png" alt="${dokumentum.dokumentum_nev}" class="w-10 h-10 object-cover rounded-md">`;
          }
          else if(dokumentum.tipus_nev == 'JPG' || dokumentum.tipus_nev == 'JPEG' || dokumentum.tipus_nev == 'PNG' || dokumentum.tipus_nev == 'GIF' || dokumentum.tipus_nev == 'WEBP'){
            iconHtml = `<img src="/assets/image.png" alt="${dokumentum.dokumentum_nev}" class="w-10 h-10 object-cover rounded-md">`;
          }
          else if(dokumentum.tipus_nev == 'TXT'){
            iconHtml = `<img src="/assets/txt.png" alt="${dokumentum.dokumentum_nev}" class="w-10 h-10 object-cover rounded-md">`;
          }
          else {
            iconHtml = `
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 stroke-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            `;
          }
          $('#dokumentum_lista').append(`
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <a href="${dokumentum.dokumentum_link}" target="_blank">
              <div class="p-4">
                <div class="flex items-start justify-between">
                  <div class="p-2 rounded-md bg-gray-100">
                    ${iconHtml}
                  </div>
                  <div class="relative dokumentum-menu">
                    <button class="menu-toggle flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                    <div class="menu-content hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                      <ul class="py-1 text-sm text-gray-700">
                        <li><button id="dokumentum_atnevezes" class="w-full text-left px-4 py-2 hover:bg-gray-100" data-dokumentum_id="${dokumentum.dokumentum_id}" data-kategoria_id="${dokumentum.kategoria_id}">Átnevezés</button></li>
                        <li><button id="dokumentum_kategoria_modosit" class="w-full text-left px-4 py-2 hover:bg-gray-100" data-dokumentum_id="${dokumentum.dokumentum_id}" data-kategoria_id="${dokumentum.kategoria_id}">Kategória módosítása</button></li>
                        <li><button id="dokumentum_torles" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" data-dokumentum_id="${dokumentum.dokumentum_id}">Törlés</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <h3 class="mt-3 text-sm font-medium text-gray-900 truncate" title="${dokumentum.dokumentum_nev}">
                  ${dokumentum.dokumentum_nev}
                </h3>
                
                <div class="mt-2 flex items-center text-xs text-gray-500">
                  <span class="px-2 py-1 rounded-full bg-gray-100">${dokumentum.kategoria_nev}</span>
                </div>
                
                <div class="mt-3 flex justify-between items-center">
                  <div class="flex flex-col">
                    <span class="text-xs text-gray-500">${dokumentum.tipus_nev} • ${dokumentum.meret}</span>
                    <span class="text-xs text-gray-500">Hozzáadva: ${dokumentum.datum}</span>
                  </div>
                  <a href="${dokumentum.dokumentum_link}" download class="p-1.5 text-green-500 rounded-full hover:bg-gray-100">
                    <svg class="hover:text-zold-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </a>
                </div>
              </div>
              </a>
            </div>
          `);
        });
        }
        else{
          $('#dokumentum_lista').append(`
            <div class="absolute w-[90%] text-center text-gray-500 text-2xl py-10">
              Nincs találat
            </div>
          `);
        }
      }
      else{
        alert(data.message);
      }
    }
  });
}
dokumentum_lista_betoltes();




//###########################################################################################################################
//###########################################################################################################################
//##########################################   DOKUMENTUMOK ATNEVEZES      ##################################################
//###########################################################################################################################
//###########################################################################################################################
  // Dropdown megnyitás/becsukás
  $(document).on('click', '.menu-toggle', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const $menu = $(this).closest('.dokumentum-menu').find('.menu-content');
    $('.menu-content').not($menu).addClass('hidden');
    $menu.toggleClass('hidden');
  });


  $(document).on('click', function() {
    $('.menu-content').addClass('hidden');
  });



  $(document).on('click', '#dokumentum_atnevezes', function(e) {
    e.preventDefault();
    $('#dokumentum_atnevezes_dialog').removeClass('hidden');
    $('#dokumentum_atnevezes_form').trigger('reset');
    const dokumentum_id = $(this).data('dokumentum_id');
    const kategoria_id = $(this).data('kategoria_id');
    $('#dokumentum_atnevezes_gomb').attr('data-dokumentum_id', dokumentum_id);
    $('#dokumentum_atnevezes_gomb').attr('data-kategoria_id', kategoria_id);
    $.ajax({
      url: '/modul/dokumentumtar/server_script/dokumentum_nev_betoltes.php',
      type: 'POST',
      dataType: 'json',
      data: {dokumentum_id: dokumentum_id},
      success: function(data) {
        if(data.status === 'success'){
          $('#dokumentum_nev_szerkesztes').val(data.dokumentum_nev);
          $('#dokumentum_nev_szerkesztes_kiterjesztes').val(data.kiterjesztes);
        }
        else{
          alert(data.message);
        }
      }
    });
  });
  $(document).on('click', '#dokumentum_atnevezes_gomb', function(e) {
    e.preventDefault();
    const dokumentum_id = $('#dokumentum_atnevezes_gomb').attr('data-dokumentum_id');
    const dokumentum_nev = $('#dokumentum_nev_szerkesztes').val();
    const dokumentum_kiterjesztes = $('#dokumentum_nev_szerkesztes_kiterjesztes').val();
    const kategoria_id = $('#dokumentum_atnevezes_gomb').attr('data-kategoria_id');
    if(!dokumentum_nev){
      $('#form-dokumentum-atnevezes-alert').removeClass('hidden').addClass('fade-in');
      $('#dokumentum_nev_szerkesztes').addClass('border-flash border-red-500');
      return;
    }
    else{
      $('#form-dokumentum-atnevezes-alert').addClass('hidden');
      $('#dokumentum_nev_szerkesztes').removeClass('border-flash border-red-500');
    }
    $.ajax({
      url: '/modul/dokumentumtar/server_script/dokumentum_nev_modosit.php',
      type: 'POST',
      dataType: 'json',
      data: {dokumentum_id: dokumentum_id, dokumentum_nev: dokumentum_nev, dokumentum_kiterjesztes: dokumentum_kiterjesztes, kategoria_id: kategoria_id},
      success: function(data) {
        if(data.status === 'success'){
          $('#dokumentum_atnevezes_dialog').addClass('hidden');
        }
        else{
          alert(data.message);
        }
      }
    });
  });


  $(document).on('click', '#dokumentum_atnevezes_bezaras', function(e) {
    e.preventDefault();
    $('#dokumentum_atnevezes_dialog').addClass('hidden');
  });
  $(document).on('click', '#dokumentum_atnevezes_dialog', function (e) {
    if (e.target === this) {
      $('#dokumentum_atnevezes_dialog').addClass('hidden');
    }
  });

//###########################################################################################################################
//###########################################################################################################################
//##########################################   DOKUMENTUMOK KATEGORIA MODOSITASA      #######################################
//###########################################################################################################################
//###########################################################################################################################
  

  $(document).on('click', '#dokumentum_kategoria_modosit', function(e) {
    e.preventDefault();
    $('#dokumentum_kategoria_modosit_dialog').removeClass('hidden');
    const kategoria_id = $(this).data('kategoria_id');
    const dokumentum_id = $(this).data('dokumentum_id');
    const kategoria_szoveg = $('#kategoria_nev-' + kategoria_id).text() || 'Válassza ki a kategóriát!';

    $('#kategoria_modosit_valasztas span').text(kategoria_szoveg);
    $('#kategoria_modosit_id').val(kategoria_id);
    $('#kategoria_modosit_gomb').attr('data-dokumentum_id', dokumentum_id);
  });





  $(document).on('click', '#kategoria_modosit_valasztas', function(){
    const $lista = $('#kategoria_lista_modosit');
    const $modalBox = $('#dokumentum_kategoria_modosit_dialog > div');

    $lista.toggle();
    if ($lista.is(':visible')) {
      $modalBox.css({
        'max-height': '90vh',
        'overflow-y': 'auto'
      });
    } else {
      $modalBox.css({
        'max-height': '',
        'overflow-y': ''
      });
    }
    
    $.ajax({
      url: '/modul/dokumentumtar/server_script/kategoria_betoltes.php',
      type: 'POST',
      dataType: 'json',
      success: function(data) {
        if(data.status === 'success'){
          $('#kategoria_lista_modosit').empty();
          data.kategoria_lista.forEach(function(kategoria, index) {
            $('#kategoria_lista_modosit').append(`<div class="kategoria_modosit_sor hover:bg-zold-300 hover:text-white cursor-pointer p-2" data-kategoria_id="${kategoria.kategoria_id}">${kategoria.kategoria_nev}</div>`);
          });
        }
        else{
          alert(data.message);
        }
      }
    });
  });

  $(document).on('click', '.kategoria_modosit_sor', function() {
    const kategoria_id = $(this).data('kategoria_id');
    const kategoria_nev = $(this).text();
    $('#kategoria_modosit_valasztas span').text(kategoria_nev);
    $('#kategoria_modosit_id').val(kategoria_id);
    $('#kategoria_lista_modosit').hide();
  });

  $(document).on('click', '#kategoria_modosit_bezaras', function(e) {
    e.preventDefault();
    $('#dokumentum_kategoria_modosit_dialog').addClass('hidden');
    $('#kategoria_lista_modosit').hide();
    $('#kategoria_modosit_id').val('');
    $('#kategoria_modosit_valasztas span').text('Válassza ki a kategóriát!');
  });
  $(document).on('click', '#dokumentum_kategoria_modosit_dialog', function (e) {
    if (e.target === this) {
      $('#dokumentum_kategoria_modosit_dialog').addClass('hidden');
      $('#kategoria_lista_modosit').hide();
      $('#kategoria_modosit_id').val('');
      $('#kategoria_modosit_valasztas span').text('Válassza ki a kategóriát!');
    }
  });

  $(document).on('click', '#kategoria_modosit_gomb', function(e) {
    e.preventDefault();
    const kategoria_id = $('#kategoria_modosit_id').val();
    const kategoria_nev = $('#kategoria_modosit_valasztas span').text();
    const dokumentum_id = $('#kategoria_modosit_gomb').attr('data-dokumentum_id');
    if(!kategoria_nev){
      $('#kategoria_modosit_valasztas').addClass('border-flash border-red-500');
      return;
    }
    else{
      $('#kategoria_modosit_valasztas').removeClass('border-flash border-red-500');
    }
    $.ajax({
      url: '/modul/dokumentumtar/server_script/dokumentum_kategoria_modosit.php',
      type: 'POST',
      dataType: 'json',
      data: {kategoria_id: kategoria_id, kategoria_nev: kategoria_nev, dokumentum_id: dokumentum_id},
      success: function(data) {
        if(data.status === 'success'){
          $('#dokumentum_kategoria_modosit_dialog').addClass('hidden');
        }
        else{
          alert(data.message);
        }
      }
    });
  });

//###########################################################################################################################
//###########################################################################################################################
//##########################################   DOKUMENTUMOK TORLES      #####################################################
//###########################################################################################################################
//###########################################################################################################################
  let aktiv_dokumentum_id = null;


  $(document).on('click', '#dokumentum_torles', function(e) {
    e.preventDefault();
    aktiv_dokumentum_id = $(this).data('dokumentum_id'); // itt állítjuk be
    $('#biztosan_torol_dokumentum').removeClass('hidden');
  });


  $(document).on('click', '#biztosan_torol_bezaras_dokumentum', function(e) {
    e.preventDefault();
    $('#biztosan_torol_dokumentum').addClass('hidden');
    aktiv_dokumentum_id = null; // itt nullázzuk
  });


  $(document).on('click', '#biztosan_torol_gomb_dokumentum', function(e) {
    e.preventDefault();
    if (!aktiv_dokumentum_id) return;

      $.ajax({
        url: '/modul/dokumentumtar/server_script/dokumentum_torles.php',
        type: 'POST',
        dataType: 'json',
        data: {dokumentum_id: aktiv_dokumentum_id},
        success: function(data) {
          if(data.status === 'success'){
            $('#biztosan_torol_dokumentum').addClass('hidden');
            aktiv_dokumentum_id = null; // visszaállítás
          } else {
            alert(data.message);
          }
        }
      });
  });
  
//###########################################################################################################################
//###########################################################################################################################
//##########################################   Drag & Drop Main felületen      ##############################################
//###########################################################################################################################
//###########################################################################################################################

let dragCounter = 0;
const $mainContainer = $('#dokumentumtar_kontener');
const $dropOverlay = $('#main_dropzone_info');

$mainContainer.on('dragenter', function (e) {
  e.preventDefault();
  dragCounter++;
  $dropOverlay.removeClass('hidden');
});

$mainContainer.on('dragleave', function (e) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    $dropOverlay.addClass('hidden');
  }
});

$mainContainer.on('dragover', function (e) {
  e.preventDefault();
});

$mainContainer.on('drop', function (e) {
  e.preventDefault();
  dragCounter = 0;
  $dropOverlay.addClass('hidden');
  if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length > 0) {
    const droppedFiles = Array.from(e.originalEvent.dataTransfer.files);

    feldolgozFajlok(droppedFiles);

    const formData_dragdrop = new FormData();
    fajlok.forEach((fajl, index) => {
      formData_dragdrop.append(`fajl[]`, fajl);
    });
    const kategoria_id_dragdrop = $('#kategoria_id_hidden').val();
    const kategoria_nev_dragdrop = $('#kategoria_nev_hidden').val().trim();
    formData_dragdrop.append('kategoria_id', kategoria_id_dragdrop);
    formData_dragdrop.append('kategoria_nev', kategoria_nev_dragdrop);

    $.ajax({
      url: '/modul/dokumentumtar/server_script/dokumentum_feltoltes.php',
      type: 'POST',
      dataType: 'json',
      processData: false,
      contentType: false,
      data: formData_dragdrop,
      success: function(data) {
        if(data.status === 'success'){
          fajlok = [];
          frissitFajlLista();
        }
        else{
          alert(data.message);
        }
      }
    });
  }
});


//###########################################################################################################################
//###########################################################################################################################
//##########################################   Keresés és szűrők      #######################################################
//###########################################################################################################################
//###########################################################################################################################


$(document).on('input', '#kereses_input', function() {
  const kereses_szoveg = $(this).val().trim();
  const kategoria_id = $('#kategoria_id_hidden').val();
  const tipus = $('#tipus_valasztas').val();
  const rendezes = $('#rendezes_valasztas').val();
  if(kereses_szoveg.length > 2){
    dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
  }
  else{
    dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
  }
});

$(document).on('change', '#tipus_valasztas', function() {
  const tipus = $(this).val();
  const rendezes = $('#rendezes_valasztas').val();
  const kereses_szoveg = $('#kereses_input').val().trim();
  const kategoria_id = $('#kategoria_id_hidden').val();
  dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
});

$(document).on('change', '#rendezes_valasztas', function() {
  const tipus = $('#tipus_valasztas').val();
  const rendezes = $(this).val();
  const kereses_szoveg = $('#kereses_input').val().trim();
  const kategoria_id = $('#kategoria_id_hidden').val();
  dokumentum_lista_betoltes(kategoria_id, kereses_szoveg, rendezes, tipus);
});


});
