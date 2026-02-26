<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $felh_id=$_SESSION['felh_id'];
    if(!isset($felh_id)){
        echo json_encode(['status' => 'error','message' => 'Nincs bejelentkezve']);
        exit;
    }
    $datum = $_POST['datum'];
    if(!isset($datum)){
        echo json_encode(['status' => 'error','message' => 'Nincs dátum megadva']);
        exit;
    }
    $datum = str_replace('.', '-', $datum);
    $sql = "SELECT
                sf.felh_id,
                sf.teljes_nev,
                sf.szuletesi_ido,
                so.osztaly_nev,
                DATE_FORMAT(tma.kezdes_ido, '%Y-%m-%d') AS ev_honap
            FROM
                SYS_felh sf
                INNER JOIN SYS_osztaly so ON sf.osztaly_id = so.osztaly_id
                LEFT JOIN TM_munkalap_aktivitas tma 
                ON tma.felh_id = sf.felh_id AND tma.kezdes_ido LIKE '$datum%'
            ";
    $result = kerdes($sql);
    if($result){
        $data = [];
        $ma = new DateTime();
        while($row = mysqli_fetch_assoc($result)){
            $felh_id = $row['felh_id'];

            if (!isset($data[$felh_id])) {
                $szuletesiDatum = new DateTime($row['szuletesi_ido']);
                $kor = $szuletesiDatum->diff($ma)->y; 
                $data[$felh_id] = [
                    'eletkor' => $kor,
                    'teljes_nev' => $row['teljes_nev'],
                    'osztaly' => $row['osztaly_nev'],
                    'napok' => []
                ];
            }

            if (!empty($row['ev_honap'])) {
                $data[$felh_id]['napok'][] = $row['ev_honap'];
            }
        }
        echo json_encode(['status' => 'success','message' => $data]);
    }else{
        echo json_encode(['status' => 'error','message' => 'Hiba történt a lekérdezés közben']);
    }
}
?>