$(document).ready(function(){
    const mobilnezet = window.innerWidth <= 850;

    const felhasznalo_kezdolap = $('#felhasznalo_kezdolap');
    const admin_kezdolap = $('#admin_kezdolap');
    var button = $('#toggleViewButton');
    const jogosultsag = $("#felh_jog").val();
    if (jogosultsag == 3){
        $("#kezdolap_nezet").addClass('hidden');
        $("#uj_fiok_nezet").removeClass('hidden');
       
    }
    else if (jogosultsag == 1){
        felhasznalo_kezdolap.addClass('hidden');
        admin_kezdolap.removeClass('hidden');
        button.text('Váltás Felhasználói Nézetre');
    }
    else{
        admin_kezdolap.addClass('hidden');
        felhasznalo_kezdolap.removeClass('hidden');
        button.addClass('hidden');
    }
    


    $.ajax({
        url: '/modul/kezdolap/server_script/admin_statisztika_betoltes.php',
        type: 'POST',
        success: function(response){
            const data = JSON.parse(response);
          
            if (data.status === 'success') {
                $("#osszes_projekt").text(data.osszes_projekt);
                $("#osszes_felhasznalo").text(data.osszes_aktiv_munkalap);
                $("#osszes_munkaora").text(Math.round(data.osszes_munkaora) + " óra");
                $("#hatralevo_munkalapok").text(data.hatralevo_munkalapok);
                
                // Felhasználói aktivitás grid megjelenítése
                const container = $('#felhasznalo_aktivitas');
                container.empty();
                
               data.felhasznalok.forEach(function(felhasznalo) {
                container.append(`
                    <div class="flex flex-col items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 pt-2" id="felhasznalo_aktivitas_${felhasznalo.felh_id}">
                        <div class="w-16 h-16 mb-2">
                            <img src="${felhasznalo.profil_kep_link}" 
                                 alt="${felhasznalo.teljes_nev}" 
                                 class="w-full h-full object-cover rounded-full border-2 border-gray-100">
                        </div>
                        <div class="text-center w-full">
                            <h3 class="text-gray-900">
                                ${felhasznalo.teljes_nev}
                            </h3>
                        </div>
                    </div>
                `);
            });

            }
        }
    });

    $(document).on('click', '#visszanyil_gomb', function(){
        $('#aktiv_felhasznalok_info_nezet').addClass('hidden');
        $('#osszes_projekt_info_nezet').addClass('hidden');
        admin_kezdolap.removeClass('hidden');
    });

    // ... existing code ...

    $(document).on('click', function(e) {
        const clickedElement = $(e.target).closest('div[id^="felhasznalo_aktivitas_"]');
        
        if (clickedElement.length > 0) {
            const felh_id = clickedElement.attr('id').split('_').pop();
            const tevekenysegContainer = $('#tevekenyseg_lista');
            
            tevekenysegContainer.empty();
            tevekenysegContainer.removeClass('hidden');
            $.ajax({
                url: '/modul/kezdolap/server_script/admin_felhasznalo_tevekenyseg.php',
                type: 'POST',
                dataType: 'JSON',
                data: { felh_id: felh_id },
                success: function(response) {
                    $('#tevekenyseg_lista_gomb').removeClass('hidden');
                    $('#tevekenyseg_lista_gomb').find('.rotate-icon').removeClass('rotate-180');

                    
                    if (response.status === 'success') {
                        response.projektek.forEach((projekt, index) => {
                            // Létrehozunk egy új div-et a diagramnak
                            const chartDiv = $(`
                                <div class="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 class="text-lg font-semibold mb-3">${projekt.projekt_nev}</h3>
                                    <div class="h-[300px]">
                                        <canvas id="chart_${index}"></canvas>
                                    </div>
                                </div>
                            `);
                            tevekenysegContainer.append(chartDiv);
    
                            // Adatok előkészítése a diagramhoz
                            const labels = projekt.munkalapok.map(m => m.megnevezes);
                            const teljesitettData = projekt.munkalapok.map(m => m.teljesitett_ora);
                            const osszOraData = projekt.munkalapok.map(m => m.ossz_ora); 

                            let maxOra = Math.max(...teljesitettData,...osszOraData);
                            maxOra = Math.ceil(maxOra * 1.2);
    
                            setTimeout(() => {
                                const ctx = document.getElementById(`chart_${index}`);
                                if (ctx) {
                                    new Chart(ctx, {
                                        type: 'bar',
                                        data: {
                                            labels: labels,
                                            datasets: [
                                                {
                                                    label: 'Teljesített órák',
                                                    data: teljesitettData,
                                                    backgroundColor: 'rgba(75, 192, 192, 1)',
                                                    borderColor: 'rgba(75, 192, 192, 1)',
                                                    borderWidth: 1
                                                },
                                                {
                                                    label: 'Összes óra',  // Címke változott
                                                    data: osszOraData,        // Itt változott!
                                                    backgroundColor: '#dbeaff',
                                                    borderColor: '#dbeaff',
                                                    borderWidth: 1
                                                }
                                            ]
                                        },
                                        options: {
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    min: 0,
                                                    max: maxOra,
                                                    ticks: {
                                                        stepSize: Math.ceil(maxOra / 10)
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Órák'
                                                    }
                                                },
                                                x: {
                                                    ticks: {
                                                        maxRotation: 0,
                                                        minRotation: 0
                                                    }
                                                }
                                            },
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                    
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function(context) {
                                                            
                                                            let percentage = '';

                                                            // Teljesített órák esetén százalékot is számolunk
                                                            if (context.datasetIndex === 0) {
                                                                
                                                                const osszIndex = context.dataIndex;
                                                                const osszOraValue = context.chart.data.datasets[1].data[osszIndex];
                                                                
                                                                if (osszOraValue > 0) {
                                                                    percentage = ` Arány: (${((context.raw / osszOraValue) * 100).toFixed(2)}%)`;
                                                                    
                                                                }
                                                                
                                                                
                                                            }

                                                                let ido = parseFloat(context.raw) || 0;
                                                                let ido_ora = Math.floor(ido);
                                                                let ido_perc = Math.round((ido - ido_ora) * 60);
                                                                return `${context.dataset.label}: ${ido_ora} óra ${ido_perc} perc ${percentage}`;
                                                            
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }, 100);
                        });
    
                        if (response.projektek.length === 0) {
                            tevekenysegContainer.removeClass('grid grid-cols-1 md:grid-cols-2 gap-4');
                            tevekenysegContainer.html(`
                                <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <p class="text-gray-500">Nincsenek megjeleníthető tevékenységek</p>
                                </div>
                            `);
                        }else{
                            tevekenysegContainer.addClass('grid grid-cols-1 md:grid-cols-2 gap-4');
                        }
    
                       
                    }
                },
                error: function() {
                    tevekenysegContainer.html(`
                        <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                            <p class="text-red-500">Hiba történt az adatok betöltése közben</p>
                        </div>
                    `);
                }
            });
        }
    });

    $(document).on('click', '#tevekenyseg_lista_gomb', function(){
        $('#tevekenyseg_lista').toggleClass('hidden');
        $(this).find('.rotate-icon').toggleClass('rotate-180');
        
    });

    $('#toggleViewButton').on('click', function() {
        
        
        

        if (felhasznalo_kezdolap.hasClass('hidden')) {
            felhasznalo_kezdolap.removeClass('hidden');
            admin_kezdolap.addClass('hidden');
            button.text('Váltás Admin Nézetre');
           
        } else {
            felhasznalo_kezdolap.addClass('hidden');
            admin_kezdolap.removeClass('hidden');
            button.text('Váltás Felhasználói Nézetre');
        }
        
    });

    function getMunkanapok(ev, honap) {
        const munkanapok = [];
        const datum = new Date(ev, honap - 1, 1); // 0-indexelt hónap JS-ben
    
        const napNevek = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    
        while (datum.getMonth() === honap - 1) {
            const nap = datum.getDay(); // 0=vasárnap, 1=hétfő, ...
            if (nap >= 1 && nap <= 5) {
                const evStr = datum.getFullYear();
                const honapStr = String(datum.getMonth() + 1).padStart(2, '0');
                const napStr = String(datum.getDate()).padStart(2, '0');
                const napNev = napNevek[nap];
                munkanapok.push(`${evStr}-${honapStr}-${napStr} (${napNev})`);
            }
            datum.setDate(datum.getDate() + 1);
        }
    
        return munkanapok;
    }


    const osztalySzinek = {};
    const hasznaltSzinek = new Set();

    function generaljEgyediSzin() {
        var szin;
        do {
            szin = 'FF' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
        } while (hasznaltSzinek.has(szin));
        hasznaltSzinek.add(szin);
        return szin;
    }



    function generateAttendanceSheet(datum) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jelenléti Ív');
        

        $.ajax({
            url: '/modul/kezdolap/server_script/jelenleti_iv_oszlop_struktura.php',
            type: 'POST',
            dataType: 'JSON',
            data: { datum: datum },
            success: function(response){
                let oszlop_definicio = [];

                if(!datum){
                    const ma = new Date();
                    const ev = ma.getFullYear();
                    const honap = String(ma.getMonth() + 1).padStart(2, '0');
                    datum = `${ev}-${honap}`;
                }

                const honap = parseInt(datum.split("-")[1], 10);
                const honapNevek = [
                "Január", "Február", "Március", "Április", "Május", "Június",
                "Július", "Augusztus", "Szeptember", "Október", "November", "December"
                ];

                oszlop_definicio.push({
                    header: honapNevek[honap-1],
                    key: 'datum',
                    width: 28
                });

                const latottNevek = new Set();
                $.each(response.message, function(index, item){
                    if (!latottNevek.has(item.teljes_nev)) {
                        latottNevek.add(item.teljes_nev);
                        oszlop_definicio.push({
                            header: item.teljes_nev,
                            key: "nev_" + item.felh_id, // ez most az első azonosító
                            width: 20
                        });
                    }
                });
                worksheet.columns = oszlop_definicio;
                const oszlopszam = oszlop_definicio.length;
                const utolsoOszlopBetu = worksheet.getColumn(oszlopszam).letter;
                worksheet.mergeCells(`A1:${utolsoOszlopBetu}1`);
                worksheet.getCell('A1').value = 'Jelenléti Ív';
                worksheet.getCell('A1').font = { bold: true, size: 25 };
                worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A2').value = honapNevek[honap-1];
                worksheet.getCell('A2').font = { bold: true, size: 17, color: { argb: 'FFFFFFFF' } };
                worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('A2').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF3FAF46' } // Zöld háttér
                };
                

                $.each(oszlop_definicio, function(index, item){
                    const cell = worksheet.getCell(2, index+1);
                    if (index === 0) return; // A2 kihagyása
                    cell.value = item.header;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF3FAF46' } // Zöld háttér
                      };
                      cell.font = {
                        color: { argb: 'FFFFFFFF' },
                        bold: true
                      };
                });

                const munkanapok = getMunkanapok(datum.split("-")[0], datum.split("-")[1]);
                $.each(munkanapok, function(index, item){
                    const rowIndex = 3 + index;
                    const row = worksheet.getRow(rowIndex);
                    row.getCell('A').value = item;
                    row.getCell('A').alignment = { vertical: 'middle', horizontal: 'left' };
                    row.getCell('A').font = { 
                        color: { argb: 'FFFFFFFF' },
                        size: 12
                    };
                    row.getCell('A').fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF3FAF46' } // Zöld háttér
                    };
                });

                const fullBorder = { style: 'thin', color: { argb: 'FF000000' } };

                for (let rowIndex = 1; rowIndex < 3 + munkanapok.length; rowIndex++) {
                    const row = worksheet.getRow(rowIndex);
                    for (let colIndex = 1; colIndex <= oszlop_definicio.length; colIndex++) {
                        const cell = row.getCell(colIndex);
                        cell.border = {
                            top: fullBorder,
                            left: fullBorder,
                            bottom: fullBorder,
                            right: fullBorder
                        };
                    }
                }

                $.ajax({
                    url: '/modul/kezdolap/server_script/jelenleti_iv_emberek_ido.php',
                    type: 'POST',
                    dataType: 'JSON',
                    data: { datum: datum },
                    success: function(response){
                        const adatok = response.message; // { felh_id: { napok: [...], ... }, ... }

                        // Végigmegyünk minden oszlopon, ami "nev_" kezdetű
                        $.each(oszlop_definicio, function(index, oszlop) {
                            if (!oszlop.key.startsWith("nev_")) return;
                    
                            const colIndex = index + 1;
                            const felh_id = oszlop.key.replace("nev_", "");
                            const napokDolgozott = adatok[felh_id] ? adatok[felh_id].napok : [];

                            const ember = adatok[felh_id];
                            const eletkor = ember ? parseInt(ember.eletkor) : 0;
                            const muszak = eletkor >= 18 ? "7:00-15:00" : "7:00-14:00";
                            if (!ember) return;
                            const osztaly = ember.osztaly || "ismeretlen";
                            if (!osztalySzinek[osztaly]) {
                                osztalySzinek[osztaly] = generaljEgyediSzin();
                            }
                            const szin = osztalySzinek[osztaly];
                            for (let rowIndex = 3; rowIndex < 3 + munkanapok.length; rowIndex++) {
                                const cell = worksheet.getRow(rowIndex).getCell(colIndex);
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: szin }
                                };
                            }
                            // végigmegyünk a munkanapokon
                            $.each(munkanapok, function(napIndex, nap) {
                                const rowIndex = 3 + napIndex;
                                const cell = worksheet.getRow(rowIndex).getCell(colIndex);
                    
                                if (napokDolgozott.includes(nap.split(" ")[0])) {
                                    cell.value = muszak;
                                    cell.font = {
                                        color: { argb: 'FFFFFFFF' },
                                        size: 12
                                    };
                                } else {
                                    cell.value = "-";
                                    cell.font = {
                                        color: { argb: 'FFFFFFFF' },
                                        size: 12
                                    };
                                }
                    
                                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                            });

                            let legendaStartRow = 4 + munkanapok.length + 2;
                            worksheet.getCell(`A${legendaStartRow - 1}`).value = 'Jelmagyarázat (osztály színek):';
                            worksheet.getCell(`A${legendaStartRow - 1}`).font = { bold: true };

                            let osztalyIndex = 0;
                            for (let osztalyNev in osztalySzinek) {
                                const cell = worksheet.getCell(`A${legendaStartRow + osztalyIndex}`);
                                cell.value = osztalyNev;
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: osztalySzinek[osztalyNev] }
                                };
                                cell.font = {
                                    color: { argb: 'FFFFFFFF' }, // fehér szöveg
                                    bold: true
                                };
                                cell.alignment = { vertical: 'middle', horizontal: 'center' }; // középre igazítás
                                osztalyIndex++;
                            }
                        });
                        
                        workbook.xlsx.writeBuffer().then(function(buffer) {
                            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = "jelenleti.xlsx";
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => {
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            }, 100);
                        });
                        
                    },
                    error: function(){
                        console.log('Hiba történt az adatok betöltése közben');
                    }
                });
                
            },
            error: function(){
                console.log('Hiba történt az adatok betöltése közben');
            }
        });

        return;
        
        
        // Adatsorok (4. sortól 28. sorig – 1-től 25-ig terjedő napok)
        const shifts = ['7:00-15:00', '7:00-14:00']; // kétféle műszak példa
        for (let day = 1; day <= 25; day++) {
          const rowIndex = 2 + day; // 4. sor = 1. nap
          const row = worksheet.getRow(rowIndex);
          // Dátum oszlop
          row.getCell('A').value = day;
          // Minden személynek adunk egy műszakot vagy "Táppénz" fix mintázatban
          for (let col = 2; col <= 10; col++) {
            const cell = row.getCell(col);
            if (day % 7 === 0 && col === 4) {
              // Példa: minden 7. nap a 3. személy (col 4, mert A=1,B=2,C=3,D=4) táppénzen
              cell.value = 'Táppénz';
            } else {
              // Egyébként felváltva a két műszak valamelyikét adjuk
              cell.value = shifts[(col + day) % shifts.length];
            }
          }
          // Feladat ütemezés oszlopok: X jelölés, ha az adott napon az adott feladat ütemezve van
          for (let taskCol = 11; taskCol <= 16; taskCol++) {
            const cell = row.getCell(taskCol);
            cell.value = ''; // alapértelmezett üres
          }
        
          // Igazítás a cellákban (dátum középre, műszak/táppénz középre, X is középre)
          row.getCell('A').alignment = { vertical: 'middle', horizontal: 'center' };
          for (let col = 2; col <= 10; col++) {
            row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
          }
          for (let taskCol = 11; taskCol <= 16; taskCol++) {
            row.getCell(taskCol).alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }
        
        // Értékelés sor (29. sor) - felirat és üres értékelések
        const evalRow = worksheet.getRow(29);
        evalRow.getCell('A').value = 'Értékelés'; 
        evalRow.getCell('A').font = { italic: true };
        for (let col = 2; col <= 10; col++) {
          evalRow.getCell(col).value = ''; // értékelés helye (statikus tartalom esetén üresen hagyható vagy kitölthető)
        }
        evalRow.height = 15;
        evalRow.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // Feladatok szekció (fejléc és feladatlista az alsó részen)
        // Fejléc "Feladatok" a 30. sorban, egyesítve A-E oszlopokban
        worksheet.mergeCells('A30:E30');
        const tasksTitleCell = worksheet.getCell('A30');
        tasksTitleCell.value = 'Feladatok';
        tasksTitleCell.font = { bold: true };
        tasksTitleCell.alignment = { horizontal: 'left', vertical: 'middle' };
        
        // Feladatok listája (31-36. sor)
        const tasks = [
          { desc: 'Belső projekt', responsible: 'Tóth András' },
          { desc: 'Szoftver fejlesztés', responsible: 'Kiss Béla' },
          { desc: 'Folyamat átszervezés', responsible: 'Nagy Péter' },
          { desc: 'Szerver telepítés', responsible: 'Bakos Péter László' },
          { desc: '1-3. osztály', responsible: 'Balogh Misi' },
          { desc: '4-5. osztály', responsible: 'Szabó Zsombor' }
        ];
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const rowIndex = 31 + i;
          // Feladat sorszáma az A oszlopban
          worksheet.getCell(`A${rowIndex}`).value = `${i+1}.`;
          // Feladat leírás (B-D egyesített cellában)
          worksheet.mergeCells(`B${rowIndex}:D${rowIndex}`);
          worksheet.getCell(`B${rowIndex}`).value = task.desc;
          // Felelős neve az E oszlopban
          worksheet.getCell(`E${rowIndex}`).value = task.responsible;
          // Igazítás: sorszám jobbra, leírás balra, név balra
          worksheet.getCell(`A${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
          worksheet.getCell(`B${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
          worksheet.getCell(`E${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
          // Betűstílus: sorszám félkövér, többi normál
          worksheet.getCell(`A${rowIndex}`).font = { bold: true };
        }
        
        // Feladatok szekció celláinak színezése (minden második sor halványszürke háttér)
        for (let i = 0; i < tasks.length; i++) {
          const rowIndex = 31 + i;
          const row = worksheet.getRow(rowIndex);
          if ((i + 1) % 2 === 0) {
            // Páros feladatsor - szürke háttér
            for (let col of ['A', 'B', 'C', 'D', 'E']) {
              row.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
            }
          } else {
            // Páratlan feladatsor - fehér háttér (nem szükséges explicit beállítani, mert alapértelmezett fehér)
          }
        }
        
        // Színezés a jelenléti tábla celláira személyenként (B-J oszlopok minden adatsorban)
        // Definiáljuk a színek körét (barna, sárga, szürke, kék) és ciklikusan alkalmazzuk a személyekre.
        const personColors = ['FFF4B084', 'FFFFFF00', 'FFA5A5A5', 'FFB4C6E7']; // barna (világos narancs), sárga, szürke, kék
        for (let col = 2; col <= 10; col++) {
          const color = personColors[(col - 2) % personColors.length];
          // Végigmegyünk az adatsorokon (4-28 sor) és beállítjuk a háttérszínt
          for (let rowIndex = 4; rowIndex <= 28; rowIndex++) {
            const cell = worksheet.getRow(rowIndex).getCell(col);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
          }
        }
        
        // Szegélyek beállítása minden releváns cellára
        const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
        // Jelenléti ív (A4:J28 adatrész) és fejléc, értékelés keretezése
        for (let r = 2; r <= 29; r++) {
          for (let c = 1; c <= 10; c++) {
            const cell = worksheet.getRow(r).getCell(c);
            cell.border = {
              top: thinBorder,
              left: thinBorder,
              bottom: thinBorder,
              right: thinBorder
            };
          }
        }
        // Feladat ütemezés oszlopok szegélyei (K4:P28 + fejléc)
        for (let r = 2; r <= 29; r++) {
          for (let c = 11; c <= 16; c++) {
            const cell = worksheet.getRow(r).getCell(c);
            cell.border = {
              top: thinBorder,
              left: thinBorder,
              bottom: thinBorder,
              right: thinBorder
            };
          }
        }
        // Elválasztó vastag vonal a név oszlopok és feladat ütemezés csoport között (J és K oszlopok között)
        for (let r = 2; r <= 29; r++) {
          worksheet.getRow(r).getCell('J').border = {
            top: thinBorder,
            left: thinBorder,
            bottom: thinBorder,
            right: { style: 'medium', color: { argb: 'FF000000' } } // J oszlop jobb széle vastag
          };
          worksheet.getRow(r).getCell('K').border = {
            top: thinBorder,
            left: { style: 'medium', color: { argb: 'FF000000' } }, // K oszlop bal széle vastag
            bottom: thinBorder,
            right: thinBorder
          };
        }
        // Feladatok szekció szegélyei (A30:E36)
        for (let r = 30; r <= 36; r++) {
          for (let c = 1; c <= 5; c++) {
            const cell = worksheet.getRow(r).getCell(c);
            cell.border = {
              top: thinBorder,
              left: thinBorder,
              bottom: thinBorder,
              right: thinBorder
            };
          }
        }
        // Böngészőben való letöltéshez: buffer generálás és letöltés
        workbook.xlsx.writeBuffer().then(function(buffer) {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "jelenleti.xlsx";
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        });
    }
    $(document).on('click', '#jelenleti_iv_gomb', function(){
        $('#jelenleti_iv_dialog').removeClass('hidden');
    });
    $(document).on('click', '#jelenleti_iv_bezaras', function(){
        $('#jelenleti_iv_dialog').addClass('hidden');
    });

    $(document).on('click', '#jelenleti_iv_gomb_letoltes', function(){
        const datum = $("#jelenleti_iv_datum").val();
        generateAttendanceSheet(datum);
    });


    const today = new Date();
    const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    flatpickr("#jelenleti_iv_datum", {
        locale: "hu",
        maxDate: maxDate,
        plugins: [
          new monthSelectPlugin({
            shorthand: false,         // teljes hónapnév
            dateFormat: "Y-m",        // input mező értéke pl: 2025-04
            altFormat: "F Y",         // megjelenítés pl: április 2025
            theme: "material"
          })
        ]
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

 

$(document).on('click', '#aktiv_felhasznalok_info', function(){
    $("#aktiv_felhasznalok_info_nezet").removeClass('hidden');
    admin_kezdolap.addClass('hidden');
    
    $("#osszes_projekt_info_nezet").addClass('hidden');
    $("#hatralevo_munkalapok_info_nezet").addClass('hidden');
    
    let searchterm = '';
    
    // Rendezési beállítások kezelése a közös rendezés_kezeles függvénnyel
    const rendezesBeallitasok = rendezes_kezeles('felhasznalo', '.felhasznalo_rendezes_gomb', function(oszlop, rendezes) {
        aktiv_felhasznalok_betoltes($('#search_felhasznalo').val(), oszlop, rendezes, 1);
    });
    
    const aktiv_felhasznalok_grid = $('#aktiv_felhasznalok_grid');
    
    function aktiv_felhasznalok_betoltes(searchterm = '', oszlop = rendezesBeallitasok.oszlop, rendezes = rendezesBeallitasok.rendezes, page = 1) {
        $.ajax({
            url: '/modul/kezdolap/server_script/admin_aktiv_felhasznalok.php',
            type: 'POST',
            dataType: 'json',
            data: {
                searchterm: searchterm,
                oszlop: oszlop,
                rendezes: rendezes,
                page: page,
                per_page: 10
            },
            success: function(response){
                console.log(response);
                
                if (response.status === 'success') {
                    aktiv_felhasznalok_grid.empty();
                    
                    // Felhasználók megjelenítése
                    response.adat.forEach(function(felhasznalo){
                        aktiv_felhasznalok_grid.append(`
                        <div class="grid grid-cols-[50px_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 p-3 font-semibold">
                            <div class="flex items-center justify-center transition: transform 0.3s ease row_details_icon">
                                <input type="hidden" class="felh_id" value="${felhasznalo.felh_id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <div class="flex items-center gap-2">
                                <img src="${felhasznalo.profil_kep_link}" alt="Profil kép" class="w-10 h-10 rounded-full">${felhasznalo.teljes_nev}
                            </div>
                            <div>${felhasznalo.email}</div>
                            <div>${felhasznalo.telefon || '-'}</div>
                            <div>${felhasznalo.osztaly_nev || '-'}</div>
                            
                        </div>
                        `);
                    });
                    
                    // Pagination megjelenítése a közös pagination_kezeles függvénnyel
                    const paginationHtml = pagination_kezeles(
                        response.pagination.current_page, 
                        response.pagination.total_pages, 
                        response.pagination.total
                    );
                    aktiv_felhasznalok_grid.append(paginationHtml);
                    
                    // Pagination click eseménykezelő
                    $('.pagination-btn').on('click', function() {
                        const newPage = $(this).data('page');
                        if (newPage >= 1 && newPage <= response.pagination.total_pages) {
                            aktiv_felhasznalok_betoltes(searchterm, oszlop, rendezes, newPage);
                        }
                    });
                }
            }
        });
    }
    
    // Keresés kezelése
    $('#search_felhasznalo').on('input', function(){
        searchterm = $(this).val();
        aktiv_felhasznalok_betoltes(searchterm, rendezesBeallitasok.oszlop, rendezesBeallitasok.rendezes, 1);
    });
    
    // Kezdeti betöltés
    aktiv_felhasznalok_betoltes('', rendezesBeallitasok.oszlop, rendezesBeallitasok.rendezes, 1);
});


$(document).on('click', '#osszes_projekt_info', function(){
    $("#osszes_projekt_info_nezet").removeClass('hidden');
    admin_kezdolap.addClass('hidden');

    $("#aktiv_felhasznalok_info_nezet").addClass('hidden');
    $("#hatralevo_munkalapok_info_nezet").addClass('hidden');

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





$(document).on('click', '#aktiv_felhasznalok_grid .row_details_icon', function() {
    const clickedElement = $(this);
    
    const felh_id = clickedElement.find('.felh_id').val();

    const rowDetails = clickedElement.closest('.grid').next('.row-details');
    if(rowDetails.length > 0 && rowDetails.is(':visible')){
        rowDetails.slideUp(300,function(){
            clickedElement.toggleClass('rotate-180');
        });
        return;
    }
    $.ajax({
        url: '/modul/kezdolap/server_script/admin_row_details.php',
        type: 'POST',
        dataType: 'json',
        data: {
            felh_id: felh_id
        },
        success: function(response) {
            console.log(response);
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            
                if (data.status === 'success') {
                    if(data.data.length > 0){
                        let rowDetailsHtml = `
                            <div class="row-details">
                                <div class="bg-white p-4 rounded-lg shadow-md">
                                    <h3 class="text-lg font-bold mb-4 text-gray-800">Munkalap Részletek</h3>
                        `;
                        
                        // Csoportosítjuk a munkalapokat projektek szerint
                        const projektek = {};
                        const egyebMunkalapok = []; // Az "Egyéb" munkalapok tárolására
                        
                        data.data.forEach(function(item) {
                            const projektNev = item.projekt_nev || 'Egyéb'; // Ha nincs projekt neve, akkor "Egyéb"
                            if (item.projekt_id) {
                                if (!projektek[projektNev]) {
                                    projektek[projektNev] = [];
                                }
                                projektek[projektNev].push(item);
                            } else {
                                // Ha a projekt_id null, akkor az "Egyéb" szekcióba tesszük
                                egyebMunkalapok.push(item);
                            }
                        });
                        
                        // Iterálunk a projektek felett
                        for (const projekt in projektek) {
                            rowDetailsHtml += `
                                <div class="mb-6">
                                    <div class="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg " id="projekt_lenyitas">
                                        <div class="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <h4 class="font-semibold text-gray-700">${projekt}</h4>
                                        </div>
                                        
                                        <span class="text-sm text-gray-500">Határidő: ${projektek[projekt][0].hatarido || 'Nincs megadva'}</span>
                                    </div>
                                    
                                    <div class="overflow-x-auto hidden" id="project_details">
                                        <table class="min-w-full bg-white">
                                            <thead>
                                                <tr class="bg-gray-50 border-b">
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkalap</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkaidő</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Órák</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Állapot</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-200">
                            `;
                            
                            // Iterálunk a munkalapokon a projekt alatt
                            projektek[projekt].forEach(function(munkalap) {
                                // Állapot színkódolás
                                let allapotSzin = '';
                                if (munkalap.allapot_nev === 'Elkészült') {
                                    allapotSzin = 'bg-green-100 text-green-800';
                                } else if (munkalap.allapot_nev === 'Indítás alatt') {
                                    allapotSzin = 'bg-blue-100 text-blue-800';
                                } else {
                                    allapotSzin = 'bg-yellow-100 text-yellow-800';
                                }
                                

                                let felh_teljesitett_ora = 0;
                                let felh_hours_teljesitett_ora = 0;
                                let felh_minutes_teljesitett_ora = 0;
                                let felh_teljesitett_ora_ido = '';
                                if (munkalap.munkaido_felh != null || munkalap.munkaido_felh == 0){
                                    felh_teljesitett_ora = parseFloat(munkalap.munkaido_felh) || 0;
                                    felh_hours_teljesitett_ora = Math.floor(felh_teljesitett_ora);
                                    felh_minutes_teljesitett_ora = Math.round((felh_teljesitett_ora - felh_hours_teljesitett_ora) * 60);
                                    
                                    felh_teljesitett_ora_ido = felh_hours_teljesitett_ora.toString()+' óra '+felh_minutes_teljesitett_ora.toString()+' perc';
                                }else{
                                    felh_teljesitett_ora_ido = '-';
                                }

                                rowDetailsHtml += `
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-4 text-sm font-medium text-gray-900 max-w-24">${munkalap.megnevezes}</td>
                                        <td class="py-3 px-4 text-sm text-gray-500">${felh_teljesitett_ora_ido}</td>
                                        <td class="py-3 px-4 text-sm text-gray-500">${munkalap.ossz_ora} óra</td>
                                        <td class="py-3 px-4 text-sm">
                                            <span class="px-2 py-1 rounded-full text-xs ${allapotSzin}">
                                                ${munkalap.allapot_nev}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            });
                            
                            rowDetailsHtml += `
                                            </tbody>
                                            </div>
                                        </table>
                                    
                                </div>
                            `;
                        }
                        
                        // "Egyéb" munkalapok hozzáadása
                        if (egyebMunkalapok.length > 0) {
                            rowDetailsHtml += `
                                <div class="mb-6">
                                    <div class="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg">
                                        <h4 class="font-semibold text-gray-700">Egyéb</h4>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full bg-white">
                                            <thead>
                                                <tr class="bg-gray-50 border-b">
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkalap</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Munkaidő</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Órák</th>
                                                    <th class="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Állapot</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-200">
                            `;
                            
                            // Iterálunk az "Egyéb" munkalapokon
                            egyebMunkalapok.forEach(function(munkalap) {
                                // Állapot színkódolás
                                let allapotSzin = '';
                                if (munkalap.allapot_nev === 'Elkészült') {
                                    allapotSzin = 'bg-green-100 text-green-800';
                                } else if (munkalap.allapot_nev === 'Indítás alatt') {
                                    allapotSzin = 'bg-yellow-100 text-yellow-800';
                                } else {
                                    allapotSzin = 'bg-blue-100 text-blue-800';
                                }
                                let munkaido_felh = parseFloat(munkalap.munkaido_felh) || 0;
                                let hours_felh = Math.floor(munkaido_felh);
                                let minutes_felh = Math.round((munkaido_felh - hours_felh) * 60);

                                let ossz_ora = parseFloat(munkalap.ossz_ora) || 0;
                                let hours_ossz_ora = Math.floor(ossz_ora);
                                let minutes_ossz_ora = Math.round((ossz_ora - hours_ossz_ora) * 60);
                                
                                rowDetailsHtml += `
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-4 text-sm font-medium text-gray-900 max-w-24">${munkalap.megnevezes}</td>
                                        <td class="py-3 px-4 text-sm text-gray-500">${hours_felh} óra ${minutes_felh} perc</td>
                                        <td class="py-3 px-4 text-sm text-gray-500">${hours_ossz_ora} óra ${minutes_ossz_ora} perc</td>
                                        <td class="py-3 px-4 text-sm">
                                            <span class="px-2 py-1 rounded-full text-xs ${allapotSzin}">
                                                ${munkalap.allapot_nev}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            });
                            
                            rowDetailsHtml += `
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `;
                        }
                        
                        rowDetailsHtml += `
                                </div>
                            </div>
                        `;
                        
                        // Használjuk az eltárolt elemet a DOM manipulációhoz
                        const rowDetails = $(rowDetailsHtml).insertAfter(clickedElement.closest('.grid'));
                        rowDetails.hide().slideDown(300);
                        
                    } else {
                        console.log('Nincs adat');
                        clickedElement.addClass('opacity-50 cursor-not-allowed');
                        clickedElement.off('click');
                    }
                } else {
                    console.error('Hiba történt: ', data.error);
                }
                
            }

    });
});

$(document).on('click', '#projekt_lenyitas', function(){
    console.log('click');
    const projectdetails = $(this).next('#project_details');
   
    projectdetails.slideToggle(300);
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




//--------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------

$(document).on('click', '.munkalap_megtekintes_gomb', function() {
    const munkalap_id = $(this).attr('id');
    document.cookie = `utolso_munkalap_id=${munkalap_id}; path=/`;
    window.open(`/?menu_id=3`);
});

$.ajax({
    url: '/modul/kezdolap/server_script/felhasznalo_statisztika_betoltes.php',
    type: 'POST',
    dataType: 'json',
    success: function(response) {

        let dolgozott_ora = response.dolgozott_ora;
        let dolgozott_ora_ora = Math.floor(dolgozott_ora);
        let dolgozott_ora_perc = Math.round((dolgozott_ora - dolgozott_ora_ora) * 60);
        if(dolgozott_ora_ora > 0){
            $('#dolgozott_ora').html(`${dolgozott_ora_ora} óra ${dolgozott_ora_perc} perc`);
        }else{
            $('#dolgozott_ora').html('0 óra 0 perc');
        }
    }
});



$.ajax({
    url: '/modul/kezdolap/server_script/aktiv_projektek_szama.php',
    type: 'POST',
    dataType: 'json',
    success: function(response) {

        if(response.status == 'success'){
            if(response.aktiv_projektek_szama > 0){
                $('#aktiv_projektek_szama').html(response.aktiv_projektek_szama);
            }else{
                $('#aktiv_projektek_szama').html('0');
            }
        }
    }
});

$.ajax({
    url: '/modul/kezdolap/server_script/aktiv_munkalapok_szama.php',
    type: 'POST',
    dataType: 'json',
    success: function(response) {

        if(response.status == 'success'){
            if(response.aktiv_munkalapok_szama > 0){
                $('#aktiv_munkalapok_szama').html(response.aktiv_munkalapok_szama);
            }else{
                $('#aktiv_munkalapok_szama').html('0');
            }
        }
    }
});



$.ajax({
    url: '/modul/kezdolap/server_script/legutobbi_munkalapok.php',
    type: 'POST',
    dataType: 'json',
    success: function(response) {
        if(response.status == 'success'){
            if(response.data.length > 0){
                let html = '';
                $('#legutobbi_munkalapok').empty();
                response.data.forEach(function(munkalap){
                    let hours = Math.floor(munkalap.felh_ossz_ora);
                    let minutes = Math.round((munkalap.felh_ossz_ora - hours) * 60);
                    if(minutes == 0){
                        munkalap.felh_ossz_ora = `${hours} óra`;
                    }
                    else{
                        munkalap.felh_ossz_ora = `${hours} óra ${minutes} perc`;
                    }
                    munkalap.hatarido = munkalap.hatarido.replace(/-/g, '.');
                    let html = `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-center">
                                <h3 class="font-semibold text-zold-500 text-lg">${munkalap.megnevezes} (ID: ${munkalap.munkalap_id})</h3>
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">Folyamatban</span>
                            </div>
                            <h4 class="text-gray-500 text-sm">Projekt: ${munkalap.projekt_nev}</h4>
                            <h4 class="text-gray-500 text-sm">Saját óra: ${munkalap.felh_ossz_ora}</h4>
                            <h4 class="text-gray-500 text-sm">Becsült óra: ${munkalap.munkaido} óra</h4>
                            <div class="flex justify-between items-center mt-4">
                            <div class="mt-2 text-sm text-gray-600">Projekt határidő: ${munkalap.hatarido}</div>
                            <button id="munkalap_elkezdese" class="bg-alapzold text-white p-2 rounded-lg" data-munkalap-id="${munkalap.munkalap_id}">
                                Feladat Indítása
                            </button>
                            </div>
                        </div>
                    `;
                    $('#legutobbi_munkalapok').append(html);
                });
            }
        }
        
    }
});



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


$.ajax({
    url: '/modul/kezdolap/server_script/projekt_hatarido.php',
    type: 'POST',
    dataType: 'json',
    success: function(response) {
        if(response.status == 'success'){
            if(response.data.length > 0){
                let html = '';
                $('#projekt_hatarido').empty();
                response.data.forEach(function(projekt){
                    let hatarido_napok = Math.floor((new Date(projekt.hatarido) - new Date()) / (1000 * 60 * 60 * 24));
                    let hatarido_szin = 'text-black';
                    if(hatarido_napok < 0){
                        hatarido_napok = 0;
                    }
                    if(hatarido_napok <= 30){
                        hatarido_szin = 'text-red-500';
                    }
                    projekt.hatarido = projekt.hatarido.replace(/-/g, '.');
                    html = `
                        <div class="border rounded-lg p-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 items-center">
                                <h3 class="font-semibold text-zold-500 text-lg md:justify-self-start">${projekt.projekt_nev} (ID: ${projekt.projekt_id})</h3>
                                <div class="md:justify-self-center">
                                    <h4 class="text-lg ${hatarido_szin}">Hátralévő napok: ${hatarido_napok} nap</h4>
                                </div>
                                <div class="text-lg text-gray-600 md:justify-self-end">Projekt határidő: ${projekt.hatarido}</div>
                            </div>
                        </div>
                    `;
                    $('#projekt_hatarido').append(html);
                });
            }
        }
        
    }
});

$(document).on('click', '#uj_projekt_gomb', function() {
    localStorage.setItem("gombrol_jottem", "1");
});


$(document).on('click', '#osszes_munkalap_lezarasa_gomb', function() {
    $.ajax({
        url: '/modul/kezdolap/server_script/osszes_munkalap_lezarasa.php',
        type: 'POST',
        dataType: 'json',
        success: function(response) {
            if(response.status == 'ok'){
                $('#osszes_munkalap_lezarasa_alert').removeClass('bg-red-500');
                $('#osszes_munkalap_lezarasa_alert').addClass('bg-green-500');
                $('#osszes_munkalap_lezarasa_alert').html(response.message + ' ' + response.closed_count + ' munkalap lezárva.');
                $('#osszes_munkalap_lezarasa_alert').show().delay(5000).fadeOut(500);
            }
            else{
                $('#osszes_munkalap_lezarasa_alert').removeClass('bg-green-500');
                $('#osszes_munkalap_lezarasa_alert').addClass('bg-red-500');
                $('#osszes_munkalap_lezarasa_alert').html(response.message);
                $('#osszes_munkalap_lezarasa_alert').show().delay(5000).fadeOut(500);
            }
        }
    });
});



}); // document ready
