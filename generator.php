<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Generator PHP</title>
</head>
<body>
	

<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

<style>
    
    .textarea{
        padding-top: 20px;
    }

</style>


 <div class="container">
 	 <div class="row">
 	 	  <h1>Generador Json</h1>
 	 	  <div>


<form action="" method="post">

<button type="submit"  class="btn btn-primary" value="boton" name="b1"  >1- Sin programa</button>


<button type="submit"  class="btn btn-success" value="boton" name="b2" >2- Con programa</button>


<button type="submit"  class="btn btn-info" value="boton" name="b3" >3- Pronto</button>


<button type="submit"  class="btn btn-warning" value="boton" name="b4" >4- Al Aire</button>


<button type="submit"  class="btn btn-danger" value="boton" name="b5" >5- Atento</button>


<button type="submit"  class="btn btn-primary" value="boton" name="b6" >6- Online</button>


<button type="submit"  class="btn btn-success" value="boton" name="b7" >7- Fin</button>

<button type="submit"  class="btn btn-primary" value="boton" name="b8" >8- Fin2</button>

<div class="textarea">
     <textarea class="form-control" rows="3" name="text7">Mensaje de prueba</textarea>
 </div>


</form>

<br>
<a href="index.html">Link</a>


 </div>


 	 </div>
 </div>




<!-- Latest compiled and minified JavaScript Jquery -->
<script src="https://code.jquery.com/jquery-1.12.2.min.js"  crossorigin="anonymous"></script>


<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>



    <?php
     
    if(isset($_POST['b1']))
    {        
     $text = "listadoProgramas({\"nodes\":[]})";     
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);
     echo "<script>alert(\"OK 1\")</script>";
     exit();
    } 


    if(isset($_POST['b2']))
    {     
     $text = "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";   
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);
     

     $text2 = "{\"status\":\"ok\",\"msg\":\"No tiene emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":0}}";   
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);

     echo "<script>alert(\"OK 2\")</script>"; 
      
      exit();

    } 

    if(isset($_POST['b3']))
    {   
     $text = "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

     $text2 = "{\"status\":\"ok\",\"msg\":\"No tiene emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":0}}";   
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);


     echo "<script>alert(\"OK 3\")</script>";
     exit();
    }



    if(isset($_POST['b4']))
    {   
     $text =  "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

              
     $text2 = "{\"status\":\"ok\",\"msg\":\"Emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":1,\"dinamica\":{}}} ";   
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);


     echo "<script>alert(\"OK 4\")</script>";
     exit();
    }


 if(isset($_POST['b5']))
    {   
     $text =  "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

              
     $text2 = "{\"status\":\"ok\",\"msg\":\"Emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":1,\"dinamica\":{\"nid\":\"1310\",\"type\":\"trivia\",\"estado\":\"3\",\"title\":\"Utilizamos esta pregunta para test de dise\u00f1o?\",\"field_atento\":\"\u00a1Atenci\u00f3n!\"}}}";   
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);


     echo "<script>alert(\"OK5\")</script>";
     exit();
    }


 if(isset($_POST['b6']))
    {   
     $text =  "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

     $text2 = "{\"status\":\"ok\",\"msg\":\"Emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":1,\"dinamica\":{\"nid\":\"1310\",\"type\":\"trivia\",\"estado\":\"6\",\"title\":\"Utilizamos esta pregunta (".$_POST['text7'].") para tes de dise\u00f1o?\",\"field_respuesta_1_en_3\":[\"S\u00ed\",\"No\",\"Tal vez\"],\"field_imagen_1_en_3\":[]}}}";

     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);


     echo "<script>alert(\"OK 6\")</script>";
     exit();
    }



 if(isset($_POST['b7']))
    {   
     $text =  "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

     $text2 = "{\"status\":\"ok\",\"msg\":\"Emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":1,\"dinamica\":{\"nid\":\"1310\",\"type\":\"trivia\",\"estado\":\"10\",\"title\":\"Utilizamos esta pregunta para tes de dise\u00f1o?\",\"field_respuesta_1_en_3\":[\"S\u00ed, porque es importante revisar los detalles\",\"No es necesario. Acertamos a la primera\"],\"field_correcta_1_en_3\":2,\"field_contador_1_en_3\":[0,100],\"field_finalizada\":\"Finalizado\"}}}";
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);

     echo "<script>alert(\"OK 7\")</script>";
     exit();
    }
    
    
 if(isset($_POST['b8']))
    {   
     $text =  "listadoProgramas({\"nodes\":[{\"node\":{\"nid\":\"1317\",\"title\":\"Vi\u00f1a 2016\",\"canal\":\"2\",\"field_logo\":{\"src\":\"http:\/\/app-chvplay.ddns.net\/sites\/default\/files\/programa-logo\/btnvina.png\",\"alt\":\"\"},\"sin-comenzar\":\"Espera el comienzo de la pr\u00f3xima emisi\u00f3n.\",\"fin-emision\":\"Termin\u00f3 la emisi\u00f3n. Muchas gracias por tu participaci\u00f3n.\",\"inicio-emision\":\"Comienza la emisi\u00f3n. Atento a las din\u00e1micas.\"}}]})";
     $file = fopen("js/list.json", "w");
     fwrite($file, $text . PHP_EOL);
     fclose($file);

     $text2 = "{\"status\":\"ok\",\"msg\":\"Emisi\u00f3n al aire\",\"data\":{\"result\":\"\",\"ok\":0,\"status\":1,\"dinamica\":{\"nid\":\"1310\",\"type\":\"trivia\",\"estado\":\"10\",\"title\":\"Utilizamos esta pregunta para tes de dise\u00f1o?\",\"field_respuesta_1_en_3\":[\"S\u00ed, porque es importante revisar los detalles\",\"No es necesario. Acertamos a la primera\"],\"field_correcta_1_en_3\":2,\"field_contador_1_en_3\":[0,100],\"field_finalizada\":\"Finalizado\"}}}";
     $file2 = fopen("js/status-pgm.json", "w");
     fwrite($file2, $text2 . PHP_EOL);
     fclose($file2);

     echo "<script>alert(\"OK 8\")</script>";
     exit();
    }   


    ?>

</body>
</html>