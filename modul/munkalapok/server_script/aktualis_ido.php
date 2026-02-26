<?php
date_default_timezone_set('Europe/Budapest'); //
$current_time = date('Y-m-d H:i:s');

echo json_encode([
    'status' => 'success',
    'aktualis_ido' => $current_time
]);



?>