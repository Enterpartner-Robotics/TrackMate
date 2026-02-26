<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');



$felvetel_datum = time();
$datum = date('Y-m-d');
// Csak POST esetén fut
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
$bevetelezes_mod = $_POST['bevetelezes_mod'];
if(isset($_POST['szamla_id'])){
    $szamla_id = $_POST['szamla_id'];
}
else{
    $szamla_id = NULL;
}

    $felh_id = isset($_SESSION['felh_id']) ? $_SESSION['felh_id'] : null;
    if (!$felh_id) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nincs bejelentkezve felhasználó!'
        ]);
        exit;
    }

    $list = json_decode($_POST['list'], true); // JSON dekódolása

    foreach ($list as $item) {
        $aru_id = $item['aru_id'];
        $aruMegnevezes = $item['aruMegnevezes'];
        $darab = $item['darab'];
        $beszerzesiAr = $item['beszerzesiAr'];
        $hely = $item['hely'];
        $pozicio = $item['pozicio'];
        $file_link = $item['file'];
        $megjegyzes = isset($item['megjegyzes']) ? $item['megjegyzes'] : '';

    
        $queryTipus = "SELECT aru_tipus_id FROM TORZS_aru WHERE aru_id = '$aru_id' LIMIT 1";
        $resTipus   = kerdes($queryTipus);

        if (!$resTipus || mysqli_num_rows($resTipus) === 0) {
            $uj_torzs_aru_qry = "INSERT INTO `TORZS_aru`(`aru_id`, `aru_megnevezes`, `aru_tipus_id`, `megjegyzes`, `file_link`, `felvetel_datum`, `aktiv`) VALUES (NULL,'".$aruMegnevezes."', NULL, NULL, NULL,".$felvetel_datum.", 1)";
            $uj_torzs_aru = kerdes($uj_torzs_aru_qry);

            $uj_aru_id = "SELECT aru_id FROM `TORZS_aru` WHERE aru_megnevezes = '$aruMegnevezes' LIMIT 1";
            $resUjAru = kerdes($uj_aru_id);
            $rowUjAru = mysqli_fetch_assoc($resUjAru);
            $aru_id = $rowUjAru['aru_id'];
            $aru_tipus_id = "NULL";
        }
        else{
            $rowTipus = mysqli_fetch_assoc($resTipus);
            $aru_tipus_id = $rowTipus['aru_tipus_id'];  
        }
        $aru_tipus_id_sql = is_null($aru_tipus_id) || $aru_tipus_id === 'NULL' ? "NULL" : $aru_tipus_id;


    
    


    
        $checkRaktar = "SELECT raktar_id, darab,beszerzesi_ar FROM `TM_raktar` WHERE aru_id = '$aru_id' LIMIT 1";
        $resRaktar   = kerdes($checkRaktar);

        if ($resRaktar && mysqli_num_rows($resRaktar) > 0) {
        
            $rowRaktar = mysqli_fetch_assoc($resRaktar);
            $ujDarab   = $rowRaktar['darab'] + $darab;
            

            $updateRaktar = "
                UPDATE `TM_raktar`
                SET darab = '$ujDarab', beszerzesi_ar ='$beszerzesiAr'
                WHERE raktar_id = '{$rowRaktar['raktar_id']}'
            ";
            $resUpdate = kerdes($updateRaktar);

            if (!$resUpdate) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Nem sikerült frissíteni a raktárkészletet!'
                ]);
                exit;
            }
        } else {
            
            $insertRaktar = "
                INSERT INTO `TM_raktar`
                    (raktar_id, aru_id, darab, beszerzesi_ar, megjegyzes)
                VALUES
                    (NULL, '$aru_id', '$darab', '$beszerzesiAr', '$megjegyzes')
            ";
            $resInsert = kerdes($insertRaktar);

            if (!$resInsert) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Nem sikerült létrehozni az új raktárkészletet!'
                ]);
                exit;
            }



        }


        $raktar_id_query="SELECT raktar_id FROM `TM_raktar` WHERE aru_id= '$aru_id' LIMIT 1";
        $raktar_id_result=kerdes($raktar_id_query);
        if ($raktar_id_result && mysqli_num_rows($raktar_id_result) > 0) {
            $raktar_id_row = mysqli_fetch_assoc($raktar_id_result); 
            $raktar_id = $raktar_id_row['raktar_id']; 
        }
        if($hely != '' && $pozicio != ''){
            $pozicio_beszuras_query = "INSERT INTO `TM_raktar_aru_helye`(`hely_id`, `raktar_id`, `hely`, `pozicio`, `aktiv`) VALUES (NULL, '$raktar_id', '$hely', '$pozicio', 1)";
            $pozicio_beszuras_result = kerdes($pozicio_beszuras_query);
            if (!$pozicio_beszuras_result) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Nem sikerült létrehozni a raktárbejegyzést!'
                ]);
                exit;
            }
        }
        if($bevetelezes_mod == '1'){
            $insertBejegyzes = "
            INSERT INTO `TM_raktar_bejegyzes`
                (raktar_bejegyzes_id, felh_id, aru_id, aru_tipus_id, raktar_id, darab, beszerzesi_ar, bejegyzes_tipus_id, szamla_id, megjegyzes, file_link, felvetel_datum, datum)
            VALUES
                (NULL, '$felh_id', '$aru_id', ".$aru_tipus_id_sql.",'$raktar_id','$darab', '$beszerzesiAr', '1', '$szamla_id', '$megjegyzes', NULL, '$felvetel_datum', '$datum')
            ";
            
        }
        else{
            $insertBejegyzes = "
            INSERT INTO `TM_raktar_bejegyzes`
                (raktar_bejegyzes_id, felh_id, aru_id, aru_tipus_id, raktar_id, darab, beszerzesi_ar, bejegyzes_tipus_id, megjegyzes, file_link, felvetel_datum, datum)
            VALUES
                (NULL, '$felh_id', '$aru_id', ".$aru_tipus_id_sql.",'$raktar_id','$darab', '$beszerzesiAr', '1', '$megjegyzes', NULL, '$felvetel_datum', '$datum')
            ";
        }

        $resultBejegyzes = kerdes($insertBejegyzes);
        
        if (!$resultBejegyzes) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Nem sikerült létrehozni a raktárbejegyzést!'
            ]);
            exit;
        }
        if (!empty($file_link)) {
            $newFolder = '/var/www/html/userfiles/aru_kepek/' . $aru_id;
            if (!is_dir($newFolder)) {
                if (!mkdir($newFolder, 0777, true)) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Nem sikerült létrehozni a termék mappát!'
                    ]);
                    exit;
                }
            }
            $sourcePath = '/var/www/html' . $file_link;
            $newFileName = basename($file_link);
            $destinationPath = $newFolder . '/' . $newFileName;

            if (file_exists($sourcePath)) {
                if (rename($sourcePath, $destinationPath)) {
                    $newFileLink = '/userfiles/aru_kepek/' . $aru_id . '/' . $newFileName;
                    $updateFileLinkQry = "UPDATE `TORZS_aru` SET file_link = '$newFileLink' WHERE aru_id = '$aru_id' LIMIT 1";
                    kerdes($updateFileLinkQry);
                }
            }
        }
    }
    $tmpFolder = '/var/www/html/userfiles/aru_kepek/tmp_' . $felh_id;
    if (is_dir($tmpFolder)) {
        $files = array_diff(scandir($tmpFolder), array('.', '..'));
        if (empty($files)) {
            rmdir($tmpFolder);
        }
    }


    $updateData = array('update' => 'raktar_tabla');
     // A Node.js szerver URL-je
    $ch = curl_init(NODE_SERVER_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $nodeResponse = curl_exec($ch);
    curl_close($ch);




 
    echo json_encode([
        'status'  => 'success',
        'message' => 'Raktár bevételezés sikeres!'
    ]);
   

} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Érvénytelen kérés (nem POST)'
    ]);
}
?>