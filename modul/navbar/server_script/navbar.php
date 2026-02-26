<?php
include_once('/var/www/html/server_ini/connector.php');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'logout') {
        session_destroy();
        echo json_encode(['success' => true]);
        header('Location: /index.php');  
        exit;
    }
}

if (!isset($_SESSION['felh'])) {
    header('Location: /index.php');  
    exit;
}



$adatok = [];


$jogosultsag_id = $_SESSION['jogosultsag_id'];
if ($jogosultsag_id == 3) {
    $menu_lekerdezes = "SELECT * FROM `SYS_menu` WHERE `navbar` = 1 AND `menu_id` = 1";
    
}
elseif ($jogosultsag_id == 1) {
    $menu_lekerdezes = "SELECT * FROM `SYS_menu` WHERE `navbar` = 1";
}
elseif ($jogosultsag_id == 2) {
    $menu_lekerdezes = "SELECT * FROM `SYS_menu` WHERE `navbar` = 1 AND (`menu_id` IN (1,2,3,4,5,6,7))";

}
elseif($jogosultsag_id == 4){
    $menu_lekerdezes = "SELECT * FROM `SYS_menu` WHERE `navbar` = 1 AND (`menu_id` IN (1,2,3))";
}

$menu_eredmeny = kerdes($menu_lekerdezes);

$profil_kep_lekerdezes = "SELECT `profil_kep_link` FROM `SYS_felh` WHERE `felh_id` = ".$_SESSION['felh_id']."";
$profil_kep_eredmeny = kerdes($profil_kep_lekerdezes);
$profil_kep = mysqli_fetch_assoc($profil_kep_eredmeny);
$adatok['profil_kep_link'] = $profil_kep['profil_kep_link'];


$menuk = [];
if ($menu_eredmeny && mysqli_num_rows($menu_eredmeny) > 0) {
    while ($menu = mysqli_fetch_assoc($menu_eredmeny)) {
        $menuk[] = [
            'id' => intval($menu['menu_id']),
            'cim' => $menu['menu_nev'],

        ];
    }
}
$adatok['menuk_tomb'] = $menuk;
echo json_encode($adatok);

exit;

?>