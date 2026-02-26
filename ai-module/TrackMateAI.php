<?php
/**
 * TrackMate AI Modul - 7 funkció
 *
 *  1. reggeliCheck()          - Ki nem kezdett még ma?
 *  2. napVegiOsszegzes()      - Nap végi AI értékelés
 *  3. feladatJavaslat()       - Intelligens feladatkiosztás
 *  4. idoszakiRiport()        - Időszaki összesítés diák/osztály
 *  5. hianyzasEllnorzes()     - Gyakorlati nap hiányzás figyelő
 *  6. bejegyzesMinoseg()      - Bejegyzések minőségellenőrzése
 *  7. projektElorehaladas()   - Projekt előrehaladás összefoglaló
 */

require_once __DIR__ . '/GeminiAI.php';
require_once __DIR__ . '/TrackMateDB.php';

class TrackMateAI
{
    private GeminiAI   $ai;
    private TrackMateDB $db;

    private string $systemBase = "A neved Léna, te vagy az Enterpartner Kft. AI mentor asszisztense.
Fiatalos, barátságos, de professzionális stílusban kommunikálsz. Tegeződsz a diákokkal.
A cég robotikával foglalkozik (humanoid robot H1, mobil manipulátor MM1, önvezető autó CAR, robotkar SO-101).
24 diák dolgozik duális rendszerben, különböző osztályokból (11-13. évfolyam).
A TrackMate rendszert használjuk munkaidő- és feladatkövetésre.
Mindig magyarul válaszolj. Légy tömör, konkrét, motiváló de őszinte.
A válaszaid elején ne köszönj és ne mutatkozz be, rögtön térj a lényegre.";

    public function __construct()
    {
        $this->ai = new GeminiAI();
        $this->db = new TrackMateDB();
    }

    // =========================================================================
    // 1. REGGELI CHECK - Ki nem kezdett még?
    // =========================================================================

    /**
     * Megnézi, hogy az adott napon ki kezdett/nem kezdett munkát.
     * Figyelembe veszi a gyakorlati napokat (osztályonként különböző).
     *
     * @param string   $datum     Dátum (Y-m-d), default: ma
     * @param int|null $osztalyId Szűrés osztályra (null = mind)
     * @return array  ['elkezdtek' => [...], 'nem_kezdtek' => [...], 'nem_gyakorlati' => [...]]
     */
    public function reggeliCheck(string $datum = '', ?int $osztalyId = null): array
    {
        $datum = $datum ?: date('Y-m-d');
        $diakok = $this->db->getAktivDiakok($osztalyId);
        $eredmeny = [
            'datum'           => $datum,
            'elkezdtek'       => [],
            'nem_kezdtek'     => [],
            'nem_gyakorlati'  => [],
            'nem_munkanap'    => !$this->db->isMunkanap($datum),
        ];

        if ($eredmeny['nem_munkanap']) return $eredmeny;

        foreach ($diakok as $diak) {
            $isGyak = $this->db->isGyakorlatiNap($diak['felh_id'], $datum);

            if (!$isGyak) {
                $eredmeny['nem_gyakorlati'][] = $diak;
                continue;
            }

            if ($this->db->vanMaiAktivitas($diak['felh_id'], $datum)) {
                $akt = $this->db->getNapiAktivitas($diak['felh_id'], $datum);
                $diak['aktivitasok'] = $akt;
                $eredmeny['elkezdtek'][] = $diak;
            } else {
                $eredmeny['nem_kezdtek'][] = $diak;
            }
        }

        return $eredmeny;
    }

    // =========================================================================
    // 2. NAP VÉGI ÖSSZEGZÉS + AI ÉRTÉKELÉS
    // =========================================================================

    /**
     * Nap végi összesítő egy diákról vagy az összes diákról
     *
     * @param string   $datum   Dátum (Y-m-d)
     * @param int|null $felhId  Egy diák (null = összes)
     * @param int|null $osztalyId Szűrés osztályra
     * @return string  AI értékelés
     */
    public function napVegiOsszegzes(string $datum = '', ?int $felhId = null, ?int $osztalyId = null): string
    {
        $datum = $datum ?: date('Y-m-d');

        if ($felhId) {
            return $this->egyDiakNapVege($felhId, $datum);
        }

        // Összes diák nap végi összesítő
        $diakok = $this->db->getAktivDiakok($osztalyId);
        $osszesites = [];

        foreach ($diakok as $diak) {
            if (!$this->db->isGyakorlatiNap($diak['felh_id'], $datum)) continue;

            $aktivitasok = $this->db->getNapiAktivitas($diak['felh_id'], $datum);
            $bejegyzesek = $this->db->getNapiBejegyzesek($diak['felh_id'], $datum);
            $osszOra = array_sum(array_column($aktivitasok, 'munkaido_felh'));

            $osszesites[] = [
                'nev'          => $diak['teljes_nev'],
                'osztaly'      => $diak['osztaly_nev'],
                'ossz_ora'     => round($osszOra, 2),
                'aktivitasok'  => $aktivitasok,
                'bejegyzesek'  => $bejegyzesek,
            ];
        }

        if (empty($osszesites)) {
            return "Nincs adat a(z) $datum napra.";
        }

        $prompt = "## Nap végi összesítő: $datum\n\n";
        foreach ($osszesites as $d) {
            $prompt .= "### {$d['nev']} ({$d['osztaly']})\n";
            $prompt .= "Ledolgozott idő: {$d['ossz_ora']} óra\n";
            $prompt .= "Aktivitások:\n";
            foreach ($d['aktivitasok'] as $a) {
                $prompt .= "  - {$a['munkalap_nev']} ({$a['projekt_nev']}): "
                         . "{$a['kezdes_ido']} → {$a['zaras_ido']} ({$a['munkaido_felh']} óra)\n";
            }
            if (!empty($d['bejegyzesek'])) {
                $prompt .= "Bejegyzések:\n";
                foreach ($d['bejegyzesek'] as $b) {
                    $megj = mb_substr(strip_tags($b['megjegyzes']), 0, 200);
                    $prompt .= "  - [{$b['munkalap_nev']}] $megj\n";
                }
            }
            $prompt .= "\n";
        }

        $prompt .= "Készíts egy tömör nap végi értékelést:
1. Ki dolgozott jól, ki keveset?
2. Ki milyen projekten dolgozott?
3. Voltak-e problémák (kevés óra, hiányzó bejegyzés)?
4. Összegző táblázat: név | óra | értékelés (jó/közepes/gyenge)";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    private function egyDiakNapVege(int $felhId, string $datum): string
    {
        $diak = $this->db->getFelhasznalo($felhId);
        if (!$diak) return "Felhasználó nem található: $felhId";

        $aktivitasok = $this->db->getNapiAktivitas($felhId, $datum);
        $bejegyzesek = $this->db->getNapiBejegyzesek($felhId, $datum);
        $osszOra     = array_sum(array_column($aktivitasok, 'munkaido_felh'));
        $stat        = $this->db->getDiakStat($felhId);

        $prompt = "## Nap végi értékelés: {$diak['teljes_nev']}\n";
        $prompt .= "Osztály: {$diak['osztaly_nev']} | Dátum: $datum\n";
        $prompt .= "Napi munkaidő: " . round($osszOra, 2) . " óra\n";
        $prompt .= "Összes eddigi munkaidő: " . round($stat['ossz_ora'], 1) . " óra\n\n";

        $prompt .= "### Mai aktivitások:\n";
        foreach ($aktivitasok as $a) {
            $prompt .= "- {$a['projekt_nev']} / {$a['munkalap_nev']}: {$a['munkaido_felh']} óra "
                     . "({$a['kezdes_ido']} → {$a['zaras_ido']})\n";
        }

        $prompt .= "\n### Mai bejegyzések:\n";
        foreach ($bejegyzesek as $b) {
            $megj = mb_substr(strip_tags($b['megjegyzes']), 0, 300);
            $prompt .= "- [{$b['munkalap_nev']}] $megj\n";
        }

        $prompt .= "\nÉrtékeld a diák mai munkáját:
1. Mennyit és mit dolgozott?
2. Elég részletesek-e a bejegyzései?
3. Javaslat holnapra.";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 3. FELADATKIOSZTÁS JAVASLAT
    // =========================================================================

    /**
     * @param int    $felhId     Diák ID
     * @param string $kontextus  Mentor megjegyzése (pl. "backend feladatot adjunk")
     */
    public function feladatJavaslat(int $felhId, string $kontextus = ''): string
    {
        $diak     = $this->db->getFelhasznalo($felhId);
        $tortenet = $this->db->getDiakMunkalapTortenet($felhId);
        $stat     = $this->db->getDiakStat($felhId);
        $projektek = $this->db->getAktivProjektek();
        $munkalapok = $this->db->getOsszesMunkalap();

        if (!$diak) return "Felhasználó nem található: $felhId";

        $prompt = "## Diák: {$diak['teljes_nev']} ({$diak['osztaly_nev']})\n";
        $prompt .= "Összes munkaidő: " . round($stat['ossz_ora'], 1) . " óra, ";
        $prompt .= "{$stat['kulonbozo_munkalapok']} különböző munkalapon\n\n";

        $prompt .= "### Eddigi munkái (legutóbbi 30):\n";
        foreach ($tortenet as $t) {
            $prompt .= "- {$t['projekt_nev']} / {$t['munkalap_nev']}: "
                     . round($t['ossz_ora'], 1) . " óra ({$t['alkalom']}x, utolsó: {$t['utolso']})\n";
        }

        $prompt .= "\n### Elérhető aktív projektek:\n";
        foreach ($projektek as $p) {
            $prompt .= "- {$p['projekt_nev']} ({$p['allapot_nev']}) - határidő: {$p['hatarido']}\n";
        }

        $prompt .= "\n### Elérhető munkalapok:\n";
        foreach ($munkalapok as $m) {
            $prompt .= "- [{$m['projekt_nev']}] {$m['megnevezes']} ({$m['allapot_nev']})\n";
        }

        if ($kontextus) {
            $prompt .= "\n### Mentor megjegyzése:\n$kontextus\n";
        }

        $prompt .= "\nJavasolj 2-3 konkrét feladatot/munkalapot ennek a diáknak:
1. A feladat neve (létező munkalapok közül, vagy új javaslat)
2. Miért pont ez? (fejlődés, változatosság, projekt szükséglet)
3. Becsült időigény
4. Milyen készségeket fejleszti?";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 4. IDŐSZAKI RIPORT
    // =========================================================================

    /**
     * @param string   $tol        Kezdő dátum
     * @param string   $ig         Záró dátum
     * @param int|null $osztalyId  Szűrés osztályra
     * @param int|null $felhId     Szűrés egy diákra
     */
    public function idoszakiRiport(string $tol, string $ig, ?int $osztalyId = null, ?int $felhId = null): string
    {
        $riport     = $this->db->getRiportIdoszak($tol, $ig, $osztalyId);
        $munkanapok = $this->db->getMunkanapokSzama($tol, $ig);

        if (empty($riport)) {
            return "Nincs adat a megadott időszakban ($tol – $ig).";
        }

        // Ha egy diákot kértek, részletes
        if ($felhId) {
            $riport = array_filter($riport, fn($r) => $r['felh_id'] == $felhId);
            $aktivitasok = $this->db->getAktivitasokIdoszak($felhId, $tol, $ig);
            $bejegyzesek = $this->db->getBejegyzesekIdoszak($felhId, $tol, $ig);
        }

        $prompt = "## Időszaki riport: $tol – $ig\n";
        $prompt .= "Munkanapok száma az időszakban: $munkanapok\n";
        $prompt .= "Diákok száma: " . count($riport) . "\n\n";

        foreach ($riport as $r) {
            $napAtlag = $r['aktiv_napok'] > 0 ? round($r['ossz_ora'] / $r['aktiv_napok'], 1) : 0;
            $prompt .= "### {$r['teljes_nev']} ({$r['osztaly_nev']})\n";
            $prompt .= "- Aktív napok: {$r['aktiv_napok']} / $munkanapok\n";
            $prompt .= "- Összesen: " . round($r['ossz_ora'], 1) . " óra\n";
            $prompt .= "- Napi átlag: $napAtlag óra\n";
            $prompt .= "- Különböző munkalapok: {$r['munkalapok_szama']}\n";

            if ($felhId && isset($aktivitasok)) {
                $prompt .= "- Részletes aktivitások:\n";
                foreach ($aktivitasok as $a) {
                    $prompt .= "  [{$a['kezdes_ido']}] {$a['projekt_nev']} / {$a['munkalap_nev']} "
                             . "({$a['munkaido_felh']} óra)\n";
                }
            }
            $prompt .= "\n";
        }

        $prompt .= "Készíts professzionális riportot:
1. Általános áttekintés számokkal
2. Top 5 legjobban teljesítő diák
3. Figyelmet igénylő diákok (kevés óra, kevés aktív nap)
4. Osztályonkénti összehasonlítás (ha több osztály van)
5. Trendek és javaslatok a következő időszakra";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 5. HIÁNYZÁS-FIGYELŐ
    // =========================================================================

    /**
     * Ki nem volt bent gyakorlati napon?
     * Figyelembe veszi az osztály gyakorlati napjait.
     *
     * @param string   $datum     Dátum (Y-m-d)
     * @param int|null $osztalyId Szűrés
     * @return array   Hiányzók listája
     */
    public function hianyzasEllenorzes(string $datum = '', ?int $osztalyId = null): array
    {
        $datum = $datum ?: date('Y-m-d');
        $diakok = $this->db->getAktivDiakok($osztalyId);

        $eredmeny = [
            'datum'      => $datum,
            'munkanap'   => $this->db->isMunkanap($datum),
            'hianyzok'   => [],
            'jelenlevok' => [],
        ];

        if (!$eredmeny['munkanap']) return $eredmeny;

        foreach ($diakok as $diak) {
            if (!$this->db->isGyakorlatiNap($diak['felh_id'], $datum)) continue;

            if (!$this->db->vanMaiAktivitas($diak['felh_id'], $datum)) {
                $eredmeny['hianyzok'][] = [
                    'felh_id'    => $diak['felh_id'],
                    'nev'        => $diak['teljes_nev'],
                    'osztaly'    => $diak['osztaly_nev'] ?? '-',
                ];
            } else {
                $aktivitasok = $this->db->getNapiAktivitas($diak['felh_id'], $datum);
                $osszOra = array_sum(array_column($aktivitasok, 'munkaido_felh'));
                $eredmeny['jelenlevok'][] = [
                    'felh_id'    => $diak['felh_id'],
                    'nev'        => $diak['teljes_nev'],
                    'osztaly'    => $diak['osztaly_nev'] ?? '-',
                    'ossz_ora'   => round($osszOra, 2),
                ];
            }
        }

        return $eredmeny;
    }

    /**
     * Időszaki hiányzás-összesítő AI elemzéssel
     */
    public function hianyzasRiport(string $tol, string $ig, ?int $osztalyId = null): string
    {
        $riport = $this->db->getRiportIdoszak($tol, $ig, $osztalyId);
        $munkanapok = $this->db->getMunkanapokSzama($tol, $ig);
        $diakok = $this->db->getAktivDiakok($osztalyId);

        // Kik nem szerepelnek egyáltalán a riportban?
        $aktivFelhIds = array_column($riport, 'felh_id');
        $nullaAktiv = array_filter($diakok, fn($d) => !in_array($d['felh_id'], $aktivFelhIds));

        $prompt = "## Hiányzás-elemzés: $tol – $ig\n";
        $prompt .= "Munkanapok: $munkanapok\n\n";

        $prompt .= "### Diákok aktivitása:\n";
        foreach ($riport as $r) {
            $szazalek = $munkanapok > 0 ? round($r['aktiv_napok'] / $munkanapok * 100) : 0;
            $prompt .= "- {$r['teljes_nev']} ({$r['osztaly_nev']}): "
                     . "{$r['aktiv_napok']}/$munkanapok nap ($szazalek%)\n";
        }

        if (!empty($nullaAktiv)) {
            $prompt .= "\n### Egyáltalán nem dolgoztak:\n";
            foreach ($nullaAktiv as $d) {
                $prompt .= "- {$d['teljes_nev']} ({$d['osztaly_nev']})\n";
            }
        }

        $prompt .= "\nÉrtékeld a jelenlét-adatokat:
1. Kik hiányoznak sokat?
2. Van-e mintázat (bizonyos napok, osztályok)?
3. Javaslatok";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 6. BEJEGYZÉS-MINŐSÉG ELLENŐRZÉS
    // =========================================================================

    /**
     * Gyenge/üres bejegyzések kiszűrése + AI javaslat
     */
    public function bejegyzesMinoseg(string $datum = '', ?int $osztalyId = null): string
    {
        $datum = $datum ?: date('Y-m-d');
        $gyenge = $this->db->getGyengeBejegyzesek($datum, $osztalyId);

        if (empty($gyenge)) {
            return "Nincs gyenge minőségű bejegyzés $datum napon.";
        }

        $prompt = "## Bejegyzés-minőség ellenőrzés: $datum\n\n";
        $prompt .= "Az alábbi bejegyzések túl rövidek vagy értelmetlen tartalommal rendelkeznek "
                 . "(kevesebb mint " . MIN_BEJEGYZES_HOSSZ . " karakter):\n\n";

        foreach ($gyenge as $b) {
            $prompt .= "- **{$b['teljes_nev']}** ({$b['osztaly_nev']}) a '{$b['munkalap_nev']}' munkalapon:\n";
            $prompt .= "  Bejegyzés: \"{$b['megjegyzes']}\" ({$b['hossz']} karakter)\n\n";
        }

        $prompt .= "Készíts egy összefoglalót:
1. Kik írtak gyenge bejegyzéseket?
2. Mik a tipikus problémák? (pl. spam, csak 'asd', túl rövid)
3. Javaslat: milyen bejegyzéseket kellene írniuk helyette?
4. Szöveges minta, amit a diákoknak mutathatunk példaként.";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 7. PROJEKT ELŐREHALADÁS ÖSSZEFOGLALÓ
    // =========================================================================

    /**
     * Egy vagy az összes projekt AI elemzése
     *
     * @param int|null $projektId  Egy projekt (null = összes)
     */
    public function projektElorehaladas(?int $projektId = null): string
    {
        $projektek = $this->db->getAktivProjektek();

        if ($projektId) {
            $projektek = array_filter($projektek, fn($p) => $p['projekt_id'] == $projektId);
        }

        if (empty($projektek)) {
            return "Nincs aktív projekt" . ($projektId ? " (ID: $projektId)" : "") . ".";
        }

        $prompt = "## Projekt előrehaladás összefoglaló\n\n";

        foreach ($projektek as $p) {
            $aktivitas = $this->db->getProjektOsszAktivitas($p['projekt_id']);
            $osszOra = array_sum(array_column($aktivitas, 'ossz_ora'));
            $diakSzam = count(array_unique(array_column($aktivitas, 'teljes_nev')));

            $prompt .= "### {$p['projekt_nev']}\n";
            $prompt .= "- Állapot: {$p['allapot_nev']}\n";
            $prompt .= "- Határidő: {$p['hatarido']}\n";
            $prompt .= "- Összes ráfordítás: " . round($osszOra, 1) . " óra\n";
            $prompt .= "- Dolgozó diákok: $diakSzam fő\n";

            if (!empty($aktivitas)) {
                // Max 10 sort küldünk, hogy ne legyen túl nagy a prompt
                $top = array_slice($aktivitas, 0, 10);
                $prompt .= "- Top munkák (diák / munkalap / óra):\n";
                foreach ($top as $a) {
                    $prompt .= "  - {$a['teljes_nev']}: "
                             . "{$a['munkalap_nev']} – " . round($a['ossz_ora'], 1)
                             . " óra ({$a['aktivitas_szam']}x)\n";
                }
                if (count($aktivitas) > 10) {
                    $prompt .= "  - ... és még " . (count($aktivitas) - 10) . " további bejegyzés\n";
                }
            }
            $prompt .= "\n";
        }

        $prompt .= "Készíts összefoglaló elemzést:
1. Melyik projekt halad jól, melyik lemaradt?
2. Hol vannak kapacitás-problémák (túl kevés ember, túl sok idő)?
3. Határidő-kockázatok (hány nap van hátra, mennyi munka van még)
4. Javaslatok erőforrás-átcsoportosításra";

        return $this->ai->generate($prompt, $this->systemBase);
    }

    // =========================================================================
    // 8. MUNKALAP AUTO-LEZÁRÁS
    // =========================================================================

    /**
     * Nyitott vagy túlfutó munkalapok keresése és opcionális lezárása
     *
     * @param string $datum       Melyik napra (default: ma)
     * @param bool   $autoClose   true = lezárja is, false = csak listázza
     * @param string $zarasOra    Mikorra zárja (default: 14:00)
     * @return array  Eredmény: mit talált, mit zárt le
     */
    public function munkalapAutoZaras(string $datum = '', bool $autoClose = false, string $zarasOra = '14:00'): array
    {
        $datum = $datum ?: date('Y-m-d');
        $zarasIdo = $datum . ' ' . $zarasOra . ':00';

        // 1. Nyitott aktivitások keresése
        $nyitottak = $this->db->getNyitottAktivitasok($datum, $zarasOra . ':00');

        // 2. Túlfutó (már lezárt, de irreális idővel) aktivitások
        $tulfutok = $this->db->getTulfutoAktivitasok($datum, $datum, 10.0);

        $eredmeny = [
            'datum'           => $datum,
            'zaras_ido'       => $zarasOra,
            'nyitott_szam'    => count($nyitottak),
            'tulfuto_szam'    => count($tulfutok),
            'nyitottak'       => [],
            'tulfutok'        => [],
            'lezartak'        => [],
            'auto_close'      => $autoClose,
        ];

        // Nyitott aktivitások feldolgozása
        foreach ($nyitottak as $n) {
            $item = [
                'aktivitas_id' => $n['munkalap_aktivitas_id'],
                'felh_id'      => $n['felh_id'],
                'nev'          => $n['teljes_nev'],
                'osztaly'      => $n['osztaly_nev'] ?? '-',
                'munkalap'     => $n['munkalap_nev'],
                'kezdes'       => $n['kezdes_ido'],
                'zaras'        => $n['zaras_ido'],
                'eddigi_ora'   => round($n['munkaido_felh'], 2),
            ];

            if ($autoClose) {
                // Lezárjuk 14:00-ra
                $ok = $this->db->forceCloseAktivitas(
                    $n['munkalap_aktivitas_id'],
                    $zarasIdo
                );
                $item['lezarva'] = $ok;
                $item['uj_zaras'] = $zarasIdo;

                // Új munkaidő kiszámítása
                $kezdes = strtotime($n['kezdes_ido']);
                $vege   = strtotime($zarasIdo);
                $item['uj_ora'] = round(max(0, ($vege - $kezdes) / 3600), 2);

                $eredmeny['lezartak'][] = $item;
            } else {
                $eredmeny['nyitottak'][] = $item;
            }
        }

        // Túlfutók listázása (ezeket már lezárták, de rossz idővel)
        foreach ($tulfutok as $t) {
            $eredmeny['tulfutok'][] = [
                'aktivitas_id' => $t['munkalap_aktivitas_id'],
                'felh_id'      => $t['felh_id'],
                'nev'          => $t['teljes_nev'],
                'osztaly'      => $t['osztaly_nev'] ?? '-',
                'munkalap'     => $t['munkalap_nev'],
                'kezdes'       => $t['kezdes_ido'],
                'zaras'        => $t['zaras_ido'],
                'valos_ora'    => round($t['valos_ora'], 2),
                'munkaido_felh' => round($t['munkaido_felh'], 2),
            ];
        }

        return $eredmeny;
    }
}
