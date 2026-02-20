<?php
/**
 * TrackMate adatbázis lekérdezések
 * Pontosan a TM_db sémára szabva
 */

require_once __DIR__ . '../server_ini/config.php';

class TrackMateDB
{
    private PDO $db;

    public function __construct()
    {
        $this->db = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    // =====================================================================
    // FELHASZNÁLÓK
    // =====================================================================

    /** Aktív diákok (jogosultsag_id = 2) */
    public function getAktivDiakok(?int $osztalyId = null): array
    {
        $sql = "
            SELECT f.felh_id, f.felh_nev, f.teljes_nev, f.jogosultsag_id,
                   o.osztaly_nev, o.osztalyTXT, o.gyakorlatiNapok, f.osztaly_id
            FROM SYS_felh f
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            WHERE f.aktiv = 1 AND f.jogosultsag_id = 2
        ";
        $params = [];
        if ($osztalyId) {
            $sql .= " AND f.osztaly_id = ?";
            $params[] = $osztalyId;
        }
        $sql .= " ORDER BY f.teljes_nev";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Egy felhasználó adatai */
    public function getFelhasznalo(int $felhId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT f.*, o.osztaly_nev, o.osztalyTXT, o.gyakorlatiNapok
            FROM SYS_felh f
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            WHERE f.felh_id = ?
        ");
        $stmt->execute([$felhId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Osztályok listája */
    public function getOsztalyok(): array
    {
        $stmt = $this->db->query("SELECT * FROM SYS_osztaly WHERE aktiv = 1 ORDER BY osztaly_nev");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =====================================================================
    // MUNKANAPOK
    // =====================================================================

    /** Ma munkanap-e? */
    public function isMunkanap(string $datum): bool
    {
        $stmt = $this->db->prepare("
            SELECT is_munkanap FROM SYS_munkaido_naptar WHERE datum = ?
        ");
        $stmt->execute([$datum]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (bool) $row['is_munkanap'] : (date('N', strtotime($datum)) <= 5);
    }

    /** Adott diák gyakorlati napja-e ma? */
    public function isGyakorlatiNap(int $felhId, string $datum): bool
    {
        if (!$this->isMunkanap($datum)) return false;

        $felh = $this->getFelhasznalo($felhId);
        if (!$felh || empty($felh['gyakorlatiNapok'])) return false;

        $napMap = ['H' => 1, 'K' => 2, 'SZ' => 3, 'CS' => 4, 'P' => 5];
        $napSzam = (int) date('N', strtotime($datum));
        $napok = array_map('trim', explode('/', $felh['gyakorlatiNapok']));

        foreach ($napok as $nap) {
            if (isset($napMap[$nap]) && $napMap[$nap] === $napSzam) return true;
        }
        return false;
    }

    // =====================================================================
    // AKTIVITÁSOK (TM_munkalap_aktivitas)
    // =====================================================================

    /** Napi aktivitások egy diáknak */
    public function getNapiAktivitas(int $felhId, string $datum): array
    {
        $stmt = $this->db->prepare("
            SELECT ma.*, m.megnevezes AS munkalap_nev, p.projekt_nev
            FROM TM_munkalap_aktivitas ma
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE ma.felh_id = ?
              AND DATE(ma.kezdes_ido) = ?
            ORDER BY ma.kezdes_ido
        ");
        $stmt->execute([$felhId, $datum]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Van-e ma aktivitása a diáknak? */
    public function vanMaiAktivitas(int $felhId, string $datum): bool
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM TM_munkalap_aktivitas
            WHERE felh_id = ? AND DATE(kezdes_ido) = ?
        ");
        $stmt->execute([$felhId, $datum]);
        return $stmt->fetchColumn() > 0;
    }

    /** Jelenleg nyitott (le nem zárt) aktivitás */
    public function getNyitottAktivitas(int $felhId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT ma.*, m.megnevezes AS munkalap_nev, p.projekt_nev
            FROM TM_munkalap_aktivitas ma
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE ma.felh_id = ?
              AND ma.munkalap_allapot = 2
              AND (ma.zaras_ido IS NULL OR ma.zaras_ido > NOW())
            ORDER BY ma.kezdes_ido DESC
            LIMIT 1
        ");
        $stmt->execute([$felhId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /** Diák összes aktivitása (időszakra) */
    public function getAktivitasokIdoszak(int $felhId, string $tol, string $ig): array
    {
        $stmt = $this->db->prepare("
            SELECT ma.*, m.megnevezes AS munkalap_nev, p.projekt_nev
            FROM TM_munkalap_aktivitas ma
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE ma.felh_id = ?
              AND DATE(ma.kezdes_ido) BETWEEN ? AND ?
            ORDER BY ma.kezdes_ido
        ");
        $stmt->execute([$felhId, $tol, $ig]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Összes diák aktivitása adott napon */
    public function getOsszesNapiAktivitas(string $datum, ?int $osztalyId = null): array
    {
        $sql = "
            SELECT ma.felh_id, f.teljes_nev, o.osztaly_nev,
                   m.megnevezes AS munkalap_nev, p.projekt_nev,
                   ma.kezdes_ido, ma.zaras_ido, ma.munkaido_felh
            FROM TM_munkalap_aktivitas ma
            JOIN SYS_felh f ON f.felh_id = ma.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE DATE(ma.kezdes_ido) = ?
              AND f.jogosultsag_id = 2 AND f.aktiv = 1
        ";
        $params = [$datum];
        if ($osztalyId) {
            $sql .= " AND f.osztaly_id = ?";
            $params[] = $osztalyId;
        }
        $sql .= " ORDER BY f.teljes_nev, ma.kezdes_ido";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =====================================================================
    // BEJEGYZÉSEK (TM_munkalap_bejegyzes)
    // =====================================================================

    /** Egy diák bejegyzései adott napon */
    public function getNapiBejegyzesek(int $felhId, string $datum): array
    {
        $stmt = $this->db->prepare("
            SELECT b.*, m.megnevezes AS munkalap_nev, bt.tipus_nev
            FROM TM_munkalap_bejegyzes b
            JOIN TM_munkalap m ON m.munkalap_id = b.munkalap_id
            LEFT JOIN TM_munkalap_bejegyzes_tipus bt ON bt.tipus_id = b.tipus_id
            WHERE b.felh_id = ?
              AND DATE(b.datum) = ?
              AND b.aktiv = 1
            ORDER BY b.datum
        ");
        $stmt->execute([$felhId, $datum]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Diák bejegyzései időszakra */
    public function getBejegyzesekIdoszak(int $felhId, string $tol, string $ig): array
    {
        $stmt = $this->db->prepare("
            SELECT b.*, m.megnevezes AS munkalap_nev, bt.tipus_nev
            FROM TM_munkalap_bejegyzes b
            JOIN TM_munkalap m ON m.munkalap_id = b.munkalap_id
            LEFT JOIN TM_munkalap_bejegyzes_tipus bt ON bt.tipus_id = b.tipus_id
            WHERE b.felh_id = ?
              AND DATE(b.datum) BETWEEN ? AND ?
              AND b.aktiv = 1
            ORDER BY b.datum
        ");
        $stmt->execute([$felhId, $tol, $ig]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Gyenge minőségű bejegyzések (túl rövid, spam) */
    public function getGyengeBejegyzesek(string $datum, ?int $osztalyId = null): array
    {
        $sql = "
            SELECT b.bejegyzes_id, b.felh_id, f.teljes_nev, o.osztaly_nev,
                   b.megjegyzes, b.datum, m.megnevezes AS munkalap_nev,
                   CHAR_LENGTH(b.megjegyzes) AS hossz
            FROM TM_munkalap_bejegyzes b
            JOIN SYS_felh f ON f.felh_id = b.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            JOIN TM_munkalap m ON m.munkalap_id = b.munkalap_id
            WHERE DATE(b.datum) = ?
              AND b.aktiv = 1
              AND b.felh_id != 0
              AND b.tipus_id = 0
              AND CHAR_LENGTH(b.megjegyzes) < ?
              AND b.megjegyzes NOT LIKE '%elindította%'
              AND b.megjegyzes NOT LIKE '%lezárta%'
              AND b.megjegyzes NOT LIKE '%újraindította%'
              AND f.jogosultsag_id = 2
        ";
        $params = [$datum, MIN_BEJEGYZES_HOSSZ];
        if ($osztalyId) {
            $sql .= " AND f.osztaly_id = ?";
            $params[] = $osztalyId;
        }
        $sql .= " ORDER BY f.teljes_nev";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // =====================================================================
    // PROJEKTEK & MUNKALAPOK
    // =====================================================================

    /** Aktív projektek */
    public function getAktivProjektek(): array
    {
        $stmt = $this->db->query("
            SELECT p.*, a.allapot_nev, pa.cegnev AS partner_nev
            FROM TM_projekt p
            LEFT JOIN TORZS_allapot a ON a.allapot_id = p.allapot_id
            LEFT JOIN TORZS_partner pa ON pa.partner_id = p.partner_id
            WHERE p.aktiv = 1
            ORDER BY p.projekt_nev
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Aktív munkalapok egy projekthez */
    public function getProjektMunkalapok(int $projektId): array
    {
        $stmt = $this->db->prepare("
            SELECT m.*, a.allapot_nev
            FROM TM_munkalap m
            LEFT JOIN TORZS_allapot a ON a.allapot_id = m.allapot_id
            WHERE m.projekt_id = ? AND m.aktiv = 1
            ORDER BY m.megnevezes
        ");
        $stmt->execute([$projektId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Összes munkalap */
    public function getOsszesMunkalap(): array
    {
        $stmt = $this->db->query("
            SELECT m.*, a.allapot_nev, p.projekt_nev
            FROM TM_munkalap m
            LEFT JOIN TORZS_allapot a ON a.allapot_id = m.allapot_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE m.aktiv = 1
            ORDER BY m.megnevezes
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Egy projekt összes aktivitása (összes diák) */
    public function getProjektOsszAktivitas(int $projektId): array
    {
        $stmt = $this->db->prepare("
            SELECT f.teljes_nev, o.osztaly_nev,
                   m.megnevezes AS munkalap_nev,
                   SUM(ma.munkaido_felh) AS ossz_ora,
                   COUNT(*) AS aktivitas_szam,
                   MIN(ma.kezdes_ido) AS elso_munka,
                   MAX(ma.zaras_ido) AS utolso_munka
            FROM TM_munkalap_aktivitas ma
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            JOIN SYS_felh f ON f.felh_id = ma.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            WHERE m.projekt_id = ?
            GROUP BY f.felh_id, m.munkalap_id
            ORDER BY m.megnevezes, f.teljes_nev
        ");
        $stmt->execute([$projektId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Diák munkalap-történet (melyik munkalapokon dolgozott, összesítve) */
    public function getDiakMunkalapTortenet(int $felhId, int $limit = 30): array
    {
        $limit = (int) $limit;
        $stmt = $this->db->prepare("
            SELECT m.megnevezes AS munkalap_nev, p.projekt_nev,
                   SUM(ma.munkaido_felh) AS ossz_ora,
                   COUNT(*) AS alkalom,
                   MIN(ma.kezdes_ido) AS elso,
                   MAX(ma.zaras_ido) AS utolso
            FROM TM_munkalap_aktivitas ma
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            LEFT JOIN TM_projekt p ON p.projekt_id = m.projekt_id
            WHERE ma.felh_id = ?
            GROUP BY ma.munkalap_id
            ORDER BY MAX(ma.zaras_ido) DESC
            LIMIT $limit
        ");
        $stmt->execute([$felhId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Diák statisztikák */
    public function getDiakStat(int $felhId): array
    {
        $stmt = $this->db->prepare("
            SELECT
                COUNT(*) AS osszes_aktivitas,
                COALESCE(SUM(munkaido_felh), 0) AS ossz_ora,
                COUNT(DISTINCT munkalap_id) AS kulonbozo_munkalapok,
                MIN(kezdes_ido) AS elso_munka,
                MAX(zaras_ido) AS utolso_munka
            FROM TM_munkalap_aktivitas
            WHERE felh_id = ?
        ");
        $stmt->execute([$felhId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // =====================================================================
    // RIPORT SEGÉDLEKÉRDEZÉSEK
    // =====================================================================

    /** Összes diák összesített munkája időszakra */
    public function getRiportIdoszak(string $tol, string $ig, ?int $osztalyId = null): array
    {
        $sql = "
            SELECT f.felh_id, f.teljes_nev, o.osztaly_nev,
                   COUNT(*) AS aktivitas_szam,
                   COALESCE(SUM(ma.munkaido_felh), 0) AS ossz_ora,
                   COUNT(DISTINCT ma.munkalap_id) AS munkalapok_szama,
                   COUNT(DISTINCT DATE(ma.kezdes_ido)) AS aktiv_napok
            FROM TM_munkalap_aktivitas ma
            JOIN SYS_felh f ON f.felh_id = ma.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            WHERE DATE(ma.kezdes_ido) BETWEEN ? AND ?
              AND f.jogosultsag_id = 2 AND f.aktiv = 1
        ";
        $params = [$tol, $ig];
        if ($osztalyId) {
            $sql .= " AND f.osztaly_id = ?";
            $params[] = $osztalyId;
        }
        $sql .= " GROUP BY f.felh_id ORDER BY f.teljes_nev";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Munkanapok száma egy időszakban */
    public function getMunkanapokSzama(string $tol, string $ig): int
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM SYS_munkaido_naptar
            WHERE datum BETWEEN ? AND ? AND is_munkanap = 1
        ");
        $stmt->execute([$tol, $ig]);
        return (int) $stmt->fetchColumn();
    }

    // =====================================================================
    // MUNKALAP AUTO-LEZÁRÁS
    // =====================================================================

    /**
     * Nyitott (le nem zárt) aktivitások keresése, ahol a kezdés régebbi mint a határidő
     * Pl: ma 14:00 előtt indítottak, de nem zárták le
     */
    public function getNyitottAktivitasok(string $datum, string $zarasIdo = '14:00:00'): array
    {
        $hatarido = $datum . ' ' . $zarasIdo;
        $stmt = $this->db->prepare("
            SELECT ma.munkalap_aktivitas_id, ma.felh_id, ma.munkalap_id,
                   ma.kezdes_ido, ma.zaras_ido, ma.munkaido_felh,
                   f.teljes_nev, o.osztaly_nev,
                   m.megnevezes AS munkalap_nev
            FROM TM_munkalap_aktivitas ma
            JOIN SYS_felh f ON f.felh_id = ma.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            WHERE DATE(ma.kezdes_ido) = ?
              AND (
                  ma.zaras_ido IS NULL 
                  OR ma.zaras_ido > ?
                  OR TIMESTAMPDIFF(HOUR, ma.kezdes_ido, ma.zaras_ido) > 10
              )
              AND f.jogosultsag_id = 2
            ORDER BY f.teljes_nev
        ");
        $stmt->execute([$datum, $hatarido]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Aktivitás kényszerített lezárása
     * Beállítja a záras_ido-t és újraszámolja a munkaido_felh-t
     */
    public function forceCloseAktivitas(int $aktivitasId, string $zarasIdo): bool
    {
        $stmt = $this->db->prepare("
            UPDATE TM_munkalap_aktivitas 
            SET zaras_ido = ?,
                munkaido_felh = ROUND(TIMESTAMPDIFF(MINUTE, kezdes_ido, ?) / 60, 4)
            WHERE munkalap_aktivitas_id = ?
        ");
        return $stmt->execute([$zarasIdo, $zarasIdo, $aktivitasId]);
    }

    /**
     * Túlfutó aktivitások keresése (ahol a munkaidő irreálisan nagy, pl. >10 óra)
     * Ez azokat szűri ki, amiket már lezártak, de rosszul (pl. másnap)
     */
    public function getTulfutoAktivitasok(string $datumTol = '', string $datumIg = '', float $maxOra = 10.0): array
    {
        $datumTol = $datumTol ?: date('Y-m-d', strtotime('-7 days'));
        $datumIg  = $datumIg  ?: date('Y-m-d');
        $stmt = $this->db->prepare("
            SELECT ma.munkalap_aktivitas_id, ma.felh_id, ma.munkalap_id,
                   ma.kezdes_ido, ma.zaras_ido, ma.munkaido_felh,
                   f.teljes_nev, o.osztaly_nev,
                   m.megnevezes AS munkalap_nev,
                   ROUND(TIMESTAMPDIFF(MINUTE, ma.kezdes_ido, ma.zaras_ido) / 60, 2) AS valos_ora
            FROM TM_munkalap_aktivitas ma
            JOIN SYS_felh f ON f.felh_id = ma.felh_id
            LEFT JOIN SYS_osztaly o ON o.osztaly_id = f.osztaly_id
            JOIN TM_munkalap m ON m.munkalap_id = ma.munkalap_id
            WHERE DATE(ma.kezdes_ido) BETWEEN ? AND ?
              AND TIMESTAMPDIFF(HOUR, ma.kezdes_ido, ma.zaras_ido) > ?
              AND f.jogosultsag_id = 2
            ORDER BY ma.munkaido_felh DESC
        ");
        $stmt->execute([$datumTol, $datumIg, $maxOra]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
