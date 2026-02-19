<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');

// Ellenőrizzük, hogy van-e beérkező osztály ID
if (isset($_POST['osztaly_id']) && !empty($_POST['osztaly_id'])) {
    $osztaly_id = intval($_POST['osztaly_id']);
    
    // Ellenőrizzük, hogy használja-e valaki az osztályt
    $ellenorzes_query = "SELECT COUNT(*) AS felhasznalok_szama FROM SYS_felh WHERE osztaly_id = $osztaly_id";
    $ellenorzes_eredmeny = kerdes($ellenorzes_query);
    $ellenorzes_adat = mysqli_fetch_assoc($ellenorzes_eredmeny);
    
    // Ha van felhasználó, aki használja, akkor nem töröljük
    if ($ellenorzes_adat['felhasznalok_szama'] > 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Ezt az osztályt nem lehet törölni, mert ' . $ellenorzes_adat['felhasznalok_szama'] . ' felhasználó tartozik hozzá.'
        ]);
        exit;
    }
    
    // Ha nincs felhasználó, inaktiváljuk az osztályt
    $torles_query = "UPDATE SYS_osztaly SET aktiv = 0 WHERE osztaly_id = $osztaly_id";
    $torles_eredmeny = kerdes($torles_query);
    
    if ($torles_eredmeny) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Az osztály sikeresen törölve lett.'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Hiba történt az osztály törlése során.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiányzó osztály azonosító.'
    ]);
}
?>