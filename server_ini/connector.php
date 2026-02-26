<?php
include_once('/var/www/html/server_ini/config.php');

@session_start();
$cdate = date("Y-m-d", time());
$ctime = date("H:i:s", time());
$cdatetime = date("Y-m-d H:i:s", time());

function escapeInput($input){
	$gaSql['user']     = DB_USER;
	$gaSql['password'] = DB_PASS;
	$gaSql['db']       = DB_NAME;
	$gaSql['server']   = DB_HOST;
	$gaSql['port']     = DB_PORT; 
	$gaSql['charset']  = DB_CHARSET;

	$link = mysqli_connect($gaSql['server'], $gaSql['user'], $gaSql['password'], $gaSql['db'],$gaSql['port'] );
	if (mysqli_connect_error()) {
		die( 'MySQL server kapcsolódási hiba(' . mysqli_connect_errno() .') '. mysqli_connect_error() );
	}
	//mysqli_set_charset($link, "utf8mb4");
	$input=mysqli_real_escape_string($link,$input);
return $input;
}

function kerdes($Query)
{

    mysqli_report(MYSQLI_REPORT_OFF);


    $cdatetime = date("Y-m-d H:i:s", time());
	
	$gaSql['user']     = DB_USER;
	$gaSql['password'] = DB_PASS;
	$gaSql['db']       = DB_NAME;
	$gaSql['server']   = DB_HOST;
	$gaSql['port']     = DB_PORT; 
	$gaSql['charset']  = DB_CHARSET;

    $link = mysqli_connect($gaSql['server'], $gaSql['user'], $gaSql['password'], $gaSql['db'], $gaSql['port']);
    if (mysqli_connect_error()) {
        die('MySQL server kapcsolódási hiba(' . mysqli_connect_errno() . ') ' . mysqli_connect_error());
    }



    $resultUtf8 = mysqli_query($link, "SET NAMES utf8");


    //$Query = str_replace("''", "NULL", $Query);
    //$Query = str_replace('""', 'NULL', $Query);

    $result = mysqli_query($link, $Query);



    return $result;
}





function log_error($num, $str, $file, $line, $context = null)
{
    log_exception(new ErrorException($str, 0, $num, $file, $line));
}


function log_exception(Exception $e)
{

    $cdatetime = date("Y-m-d H:i:s", time());

    $message = "Type: " . get_class($e) . "; Message: {$e->getMessage()}; File: {$e->getFile()}; Line: {$e->getLine()};";
}


function check_for_fatal()
{
    $error = error_get_last();
    if ($error["type"] == E_ERROR)
        log_error($error["type"], $error["message"], $error["file"], $error["line"]);
}


ini_set("display_errors", "off");
error_reporting(E_ALL);
