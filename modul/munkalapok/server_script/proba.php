<?php
$kezdes_ido = "2025-03-10 14:00:00";
$zaras_ido  = "2025-03-10 21:34:00";

// DateTime objektumok létrehozása
$kezdes = new DateTime($kezdes_ido);
$zaras  = new DateTime($zaras_ido);
$kulonbseg = $zaras->diff($kezdes);
$teljesOra = $kulonbseg->days * 24 + $kulonbseg->h;
$perc = $kulonbseg->i;
$oraTizedes = $teljesOra + ($perc / 60);
$oraTizedes = number_format($oraTizedes, 4, ',', '');
echo $oraTizedes . ' óra';
?>
