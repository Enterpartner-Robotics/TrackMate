<?php
include_once('/var/www/html/server_ini/connector.php');
error_reporting(E_ALL);
ini_set("display_errors", '1');


$session_nelkuli_menuk = [100, 101];
$felh_id = isset($_SESSION['felh_id']) ? intval($_SESSION['felh_id']) : 0; 
$cookieName = 'last_menu_id_' . $felh_id; 

$menu_id = isset($_GET['menu_id']) 
    ? intval($_GET['menu_id']) 
    : (isset($_COOKIE[$cookieName]) ? intval($_COOKIE[$cookieName]) : 100);


$menu_tartalom = '/var/www/html/modul/bejelentkezes/bejelentkezes.html';

if (!isset($_SESSION['felh']) && !in_array($menu_id, $session_nelkuli_menuk)) {
    
    $menu_id = 100;
} elseif (isset($_SESSION['felh']) && $menu_id == 100) {
    
    
    $menu_id = isset($_COOKIE[$cookieName]) ? intval($_COOKIE[$cookieName]) : 1;
}

if(isset($_SESSION['jogosultsag_id'])){
    $jogosultsag_id = $_SESSION['jogosultsag_id'];
    if($jogosultsag_id == 3 && ( $menu_id != 1 && $menu_id!= 102 )){
    
        $menu_id = 1;
    }
}

setcookie($cookieName, $menu_id, [
    'expires' => time() + (30 * 24 * 60 * 60), 
    'path' => '/',
    'httponly' => false, 
    'samesite' => 'Lax'
]);

if (isset($_GET['ajax']) && $_GET['ajax'] == 1) {
    $menu_tipus_lekerdezes = "SELECT t.link 
        FROM SYS_menu m
        JOIN SYS_menu_tipus t 
        ON m.menu_tipus_id = t.menu_tipus_id
        WHERE m.menu_id = $menu_id";
    $menu_tipus_eredmeny = kerdes($menu_tipus_lekerdezes);

    if ($menu_tipus_eredmeny && mysqli_num_rows($menu_tipus_eredmeny) > 0) {
        $menu_tipus_tomb = mysqli_fetch_assoc($menu_tipus_eredmeny);
        include_once("/var/www/html" . $menu_tipus_tomb['link']);
    } else {
        echo "Tartalom nem található!";
    }
    exit;
}


$menu_tipus_lekerdezes = "SELECT t.link 
    FROM SYS_menu m
    JOIN SYS_menu_tipus t 
    ON m.menu_tipus_id = t.menu_tipus_id
    WHERE m.menu_id = $menu_id";
$menu_tipus_eredmeny = kerdes($menu_tipus_lekerdezes);
if ($menu_tipus_eredmeny && mysqli_num_rows($menu_tipus_eredmeny) > 0) {
    $menu_tipus_tomb = mysqli_fetch_assoc($menu_tipus_eredmeny);
    $menu_tartalom = "/var/www/html" . $menu_tipus_tomb['link'];
}

?>


<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TrackMate</title>
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script src="/node_modules/socket.io/client-dist/socket.io.js"></script>
  <script src="/js/jquery-3.7.1.min.js"></script>
  <script src="/js/tabulator.min.js"></script>
  <script src="/js/cookie.js"></script>
  <script src="/js/feladat_utemezo.js"></script>
  <script src="/js/jquery-ui.min.js"></script>
  <script src="/js/index.global.min.js"></script> 
  <script src="/js/websocket.js"></script>

  <script src="/node_modules/luxon/build/global/luxon.min.js"></script>
  
  <script src="/node_modules/flatpickr/dist/flatpickr.js"></script>
  <script src="/node_modules/flatpickr/dist/l10n/hu.js"></script>
  <script src="/node_modules/chart.js/dist/chart.umd.js"></script>
  <script src="/node_modules/exceljs/dist/exceljs.min.js"></script>
  <script src="/node_modules/flatpickr/dist/plugins/monthSelect/index.js"></script>


  
  
  <link rel="stylesheet" href="/node_modules/flatpickr/dist/plugins/monthSelect/style.css">
  <link rel="stylesheet" href="/node_modules/flatpickr/dist/themes/material_green.css">
  <link rel="stylesheet" href="../../css/jquery-ui.min.css">
  <link rel="stylesheet" href="../../output.css">
  <link rel="stylesheet" href="../../css/style.css">
  <link rel="stylesheet" href="../../css/tabulator_modern.min.css">
  
  <script src="/modul/navbar/server_script/navbar.js"></script>

</head>

<body class="bg-vaj-szin min-h-screen justify-center items-center ">
    <?php if($menu_id != 100 && $menu_id !=101) include_once('/var/www/html/modul/navbar/navbar.html'); ?>

<!--
    <audio autoplay>
      <source src="/assets/zene.mp3" type="audio/mpeg">
    </audio>
-->
    <div id="content" class="flex-1 example">
        <?php include_once($menu_tartalom);?>
    </div>
    
    <input type="hidden" id="felh_jog" value="<?php if(isset($_SESSION['jogosultsag_id'])){
        echo $_SESSION['jogosultsag_id'];
    }else{
        echo "";
      }    ?>">
      <input type="hidden" id="felh_id" value="<?php if(isset($_SESSION['felh_id'])){
        echo $_SESSION['felh_id'];
    }else{
        echo "";
    }    ?>">
    <div id="cookie-banner" class="fixed bottom-0 left-0 w-full bg-zold-300 text-white p-4 flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-3 md:space-y-0">
      <div class="text-sm md:pr-4">
        <strong>Tájékoztatás:</strong> Az oldal sütiket használ a jobb felhasználói élmény érdekében. 
        <a href="#" class="underline text-gray-800 font-bold">Tudj meg többet</a>.
      </div>
      <div>
        <button id="accept-cookies" class="bg-alapzold hover:bg-green-500 text-white px-4 py-2 rounded shadow">
          Elfogadom
        </button>
      </div>
    </div>

    <div id="feladat_tracker" class="fixed hidden bottom-0 left-0 w-full bg-white text-alapzold p-4 transition-all duration-300">
  <div class="md:flex justify-between items-center">
    <span class="text-xl text-alapzold font-bold md:pl-2" id="feladat_nev"></span>
    <div class="flex justify-between md:items-center">
      <span class="text-xl text-alapzold pr-2" id="ido_ora" ></span>
      
      <button id="feladat_bezarasa" class="bg-red-500 p-2 rounded text-white ">Befejezés</button>
      <button id="feladat_lecsukas" class="bg-gray-500 p-2 rounded text-white ml-2 w-auto hidden md:block">Bezárás</button>
      <button id="feladat_lecsukas_mobil" class="bg-gray-500 p-2 rounded text-white ml-2 w-10 md:hidden">X</button>
      
    </div>
  </div>
  <div class="bg-alapzold h-3 mt-2" style="width: 30%"></div>
</div>


</body>
</html>
