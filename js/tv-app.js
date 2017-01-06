/*
 *
 * Estados de la App
 * - loading: no se ha inicializado nada
 * - ready:   ya estamos listos para gestionar mensajes
 *
 * Estados de la emision
 * - unknown:       no tenemos informacion
 * - al-aire:       estamos al aire
 * - fuera-de-aire: estamos fuera del aire
 */
var estadoApp = 'loading';
var estadoEmision = 'unknown';
var estadoDinamica = 'unknown';
var nidDinamica = 0;
var nidEmision = 0;
var respuestaTpl = '__IMAGEN__<div class="respuesta id__I__ respuesta-n__N__"><div class="letra letra__I__">__LETRA__</div><div class="txt respuesta__I__">__RESPUESTA__</div><div class="porcentaje porcentaje__I__">0%</div><div class="ico-correcta"></div><div class="clr"></div></div>';
var historial = new Array();
var pantallas = [
	'#emision-inicio',
	'#emision-fin',
	'#emision-ganador',
	'#dinamica-atento',
	'#dinamica-trivia-online',
	'#dinamica-multimedia-online'
];
var heMostrado = false;
var letras = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p'
];
// Globales del contenedor
var screen;					// Pantalla en la que nos encotramos
var sesion = false;			// Tenemos sesion o no
var programas;				// Informacion de programas disponibles
var hay_programas = false;	// Indica si tenemos o no programas con acceso al publico
var programa = 'noname';	// Nombre del programa con el que se está interactuando	
var statusPgm;				// Status del programa seleccionado
var inicio_emision = ''		// Mensaje de inicio de emision
var fin_emision = ''		// Mensaje de fin de emision
var uid = 0;				// Id del usuario
var uname = '';				// Nombre del usuario
var upicture = '';				// Imagen del usuario
var canal;						// Canal PubNub
var estiloApp = '';				// Estilo grafico que muestra la app
var intervalCheckDinamica = 0;	// Controld de intervalo

var checktvURL = pingURL.replace("ping.php", "check-tv.php");

jQuery(document).ready(function() {
    // Comienza la app
	console.log('Comienza la app');
	screen = 'programas';
	
	// Leo los programas
	leerProgramas();
		
});

// Funcion que lee programas online
function leerProgramas(){
	console.log("Consulto si hay programas");
	jQuery.ajax({
		url: programasURL,
		jsonp: "list",
		dataType: "jsonp",
		jsonpCallback: "listadoProgramas",
		cache: true,
		success: function(data) {
			// Hay programas con acceso al publico?
			if(data.nodes.length > 0){
				hay_programas = true;
				// Los almaceno
				programas = data.nodes;
				
				// Establezco el estio
				establecerEstilo(convertToSlug(programas[0].node.title));
				
				// Me conecto al primero
				programa = programas[0].node.title; 
				
				var ids0 = programas[0].node.nid;
				nidEmision = ids0;
				var ids1 = programas[0].node.canal;
				
				canal = 'programa-' + ids0;
				
				console.log("Voy a la emision " + ids0 + "/" + ids1);
				
				irAEmision(ids0, ids1);	
			}
			else{
				// Vuelvo a leer en 5 segundos
				console.log("No hay programas. Programo una nueva consulta");
				setTimeout(leerProgramas, 5000);
			}
		}
	});
}

// Funcion para conectarnos a una emision
function irAEmision(pnid, cnid){
	screen = 'emision';
	jQuery.getJSON(statusPgmURL + '?pnid=' + pnid + '&uid=' + uid, function(data) {
		// Almaceno
		statusPgm = data;
		
		// Inicio la playalongApp
		initPlayAlongApp();
		
		
	}, 'json' );
}



// Funcion que gestiona la PlayAlongApp
function initPlayAlongApp() {
	// Init documento

	console.log("Iniciamos Cliente TV v1");
		
	// Muestro la pantalla de emision
	jQuery("#emision").show();	
		
	// Tengo que pintar algo?
	if (statusPgm.data.status == 1){
		var mensaje = {};
		if(jQuery.isEmptyObject(statusPgm.data.dinamica)){
			// La emision esta al aire pero aun no se ha lanzado alguna dinamica
			mensaje.type = 'emision';
			mensaje.estado = statusPgm.data.status;
			mensaje.fin_emision = fin_emision;
			mensaje.inicio_emision = inicio_emision;

		}
		else{
			mensaje = statusPgm.data.dinamica;
		}
		console.log("Procesamos mensaje previo");
		// console.log(mensaje);
		procesarPubNubMessage(mensaje);
			
	}
	else{
		console.log("No hay mensaje previo");
	}
		
	// Me contecto a PubNub
	var pubnub = PUBNUB.init({
		subscribe_key: playalong_subkey
	});
	
	estadoApp = 'ready';
	
	// Me suscribo al canal y despacho los mensajes
	pubnub.subscribe({
		channel: canal,
		message: procesarPubNubMessage,
	});			
}

/*
 *
 * funcion que procesa un mensaje PubNub
 *
 */
function procesarPubNubMessage(m){
	// m es el mensaje
	switch(m.type){
		case 'emision':
			// procesarMensajeEmision(m);
			break;
		case 'emision-ganador':
			procesarMensajeEmisionGanador(m);
			break;						
		case 'trivia':
			procesarMensajeTrivia(m);
			break;
		case 'multimedia':
			// procesarMensajeMultimedia(m);
			break;
	}
	historial.push(m);
}


/*
 *
 * Eventos PubNub
 *
 */

/**
  *
  * Procesamos el mensaje de un ganador de una emision
  *
  */
function procesarMensajeEmisionGanador(m){
	console.log(m);
	// Mostramos los datos del ganador
	mostrarPantalla('#emision-ganador');
	jQuery('#emision-ganador .nombre').html(m.title);
	jQuery('#emision-ganador .multimedia').html(m.multimedia_render);
	// Tambien disponemos de m.multimedia_url
}

/**
  *
  * Funcion de apoyo para el proceso de una trivia
  * muestra los valores de la trivia
  */
function configurarValoresTrivia(mensaje){
	console.log("Configuramos valores trivia:");
	console.log(mensaje);

	jQuery('#dinamica-trivia-online .pregunta').html(mensaje.title);
	// Elimino prodibles respuestas antiguuas y creo las nuevas
	jQuery('#dinamica-trivia-online #respuestas img').remove();
	jQuery('#dinamica-trivia-online #respuestas .respuesta').remove();
	var i = 0;
	while(i < mensaje.field_respuesta_1_en_3.length){
		// '__IMAGEN__<div class="respuesta"><span class="letra">__LETRA__</span><span class="respuesta__I__">__RESPUESTA__</span></a>';
		var respuesta = respuestaTpl.replace(/__I__/g, (i + 1));
		respuesta = respuesta.replace(/__LETRA__/g, letras[i]);
		respuesta = respuesta.replace(/__N__/g, mensaje.field_respuesta_1_en_3.length);
		respuesta = respuesta.replace(/__RESPUESTA__/g, mensaje.field_respuesta_1_en_3[i]);
		if (typeof(mensaje.field_imagen_1_en_3) !== 'undefined'){
			if(typeof(mensaje.field_imagen_1_en_3[i]) !== 'undefined'){
				respuesta = respuesta.replace(/__IMAGEN__/g, mensaje.field_imagen_1_en_3[i]);
			}
			else{
				respuesta = respuesta.replace(/__IMAGEN__/g, '');
			}
		}
		else{
			respuesta = respuesta.replace(/__IMAGEN__/g, '');
		}
		jQuery('#dinamica-trivia-online #respuestas').append(respuesta);
		i++;
	}
	// Aplico margen a #respuestas en base al numero de respuestas
	switch(mensaje.field_respuesta_1_en_3.length){
		case 1:
		case 2:
		case 3:
		case 4:
			jQuery("#dinamica-trivia-online").css("padding-top", "1em");
			break;
		default:
			jQuery("#dinamica-trivia-online").css("padding-top", "0em");
	}
	if(mensaje.field_respuesta_1_en_3.length > 9){
		jQuery("#respuestas").css("width", "90%");
	    jQuery("#respuestas").css("margin", "0 auto");
	}
	else{
		jQuery("#respuestas").css("width", "100%");
	    jQuery("#respuestas").css("margin", "0 auto");
	}
	
}


/**
  *
  * Procesamos el mensaje de una emision que es una trivia
  *
  */
function procesarMensajeTrivia(m){
	console.log(m);
	//Almaceno el nid
	nidDinamica = m.nid;
	// Reviso el estado
	switch(m.estado){
		case "0":
		case 0:
			// No debieramos recibir este estado
			break;
		case "3":
		case 3:
			// Atento...
			mostrarPantalla('#dinamica-atento');
			jQuery('#dinamica-atento h2.atencion').html(m.title);
			var estadoDinamica = "atento";
			
			break;
		case "6":
		case 6:
			// Online: completo los datos y muestro la pantalla
			mostrarPantalla('#dinamica-trivia-online');
			configurarValoresTrivia(m);
			jQuery('#dinamica-trivia-online h6.status').html('');
			jQuery('#dinamica-trivia-online h6.status').removeClass('cerrada');
			jQuery('#dinamica-trivia-online h6.status').removeClass('finalizada');
			// A partir de ahora comienzo a consultar cada 5 segundos por el status a http://dominio.net/check-tv.php?dnid=1237
			intervalCheckDinamica = setInterval(checkDinamica, 5000);
			
			var estadoDinamica = "online";
			break;
		case "8":
		case 8:
			// Stop: detengo la consulta de la dinamica
			clearInterval(intervalCheckDinamica);
			
			// Si la pantalla no esta visible es porque el usuario acaba de entrar: la mostramos
			if(!jQuery('#dinamica-trivia-online').is(':visible')){
				mostrarPantalla('#dinamica-trivia-online');
				configurarValoresTrivia(m);
			}
			if(m.hasOwnProperty("field_cerrada")){
				jQuery('#dinamica-trivia-online h6.status').html(m.field_cerrada);
				jQuery('#dinamica-trivia-online h6.status').addClass('cerrada');
				jQuery('#dinamica-trivia-online h6.status').show();
				
				// Muestro los porcentajes finales
				var i = 0;
				while(i < m.field_contador_1_en_3.length){
					jQuery('.respuesta .porcentaje' + (i + 1)).html(m.field_contador_1_en_3[i] + "%");
					i++;
				}
			}
			var estadoDinamica = "cerrado";
			break;
		case "10":
		case 10:
			// Detengo la consulta de la dinamica
			clearInterval(intervalCheckDinamica);
			// Busco la dinamica en el historial, por si se trata del cierre de una trivia predictiva (no incluyo la dinamica actual)
			var i = 0;
			var encontrado = false;
			while(i < (historial.length - 1) && !encontrado){
				if(historial[i].nid == nidDinamica && historial[i].estado == "6"){
					var backup = historial[i];
					encontrado = true;
				}
				i++;
			}
			if (encontrado){
				// La dinamica era de antes. Vuelvo a mostrar los valores
				
				// Recupero los valores
				configurarValoresTrivia(backup);
				if(backup.hasOwnProperty("field_finalizada")){
					jQuery('#dinamica-trivia-online h6.status').html(backup.field_finalizada);
					jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
				}
				// Muestro los porcentajes finales
				var i = 0;
				while(i < backup.field_respuesta_1_en_3.length){
					jQuery('.respuesta .porcentaje' + (i + 1)).html(m.field_contador_1_en_3[i] + "%");
					i++;
				}
					
				// Chequeo el resultado, si es que habia una respuesta correcta
				if(m.field_correcta_1_en_3 > 0){
					jQuery("#dinamica-trivia-online .id" + m.field_correcta_1_en_3).addClass("r-correcta");
					jQuery("#dinamica-trivia-online .id" + m.field_correcta_1_en_3 + " .ico-correcta").show();	
				}
				
				if(m.hasOwnProperty("field_finalizada")){
					jQuery('#dinamica-trivia-online h6.status').html(m.field_finalizada);
					jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
				}
				mostrarPantalla('#dinamica-trivia-online');
			}
			else{		
				// Muestro los porcentajes finales
				// Si la pantalla no esta visible es porque el usuario acaba de entrar: la mostramos
				if(!jQuery('#dinamica-trivia-online').is(':visible')){
					mostrarPantalla('#dinamica-trivia-online');
					configurarValoresTrivia(m);	
				}				
				
				var i = 0;
				while(i < m.field_contador_1_en_3.length){
					jQuery('.respuesta .porcentaje' + (i + 1)).html(m.field_contador_1_en_3[i] + "%");
					i++;
				}
				// Chequeo el resultado, si es que habia una respuesta correcta
				if(m.field_correcta_1_en_3 > 0){
					jQuery("#dinamica-trivia-online .id" + m.field_correcta_1_en_3).addClass("r-correcta");
					jQuery("#dinamica-trivia-online .id" + m.field_correcta_1_en_3 + " .ico-correcta").show();
				}
				
				if(m.hasOwnProperty("field_finalizada")){
					jQuery('#dinamica-trivia-online h6.status').html(m.field_finalizada);
					jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
				}
				
				// Bloqueo las respuestas
				jQuery("#dinamica-trivia-online a.respuesta").attr("disabled", "disabled");
			}
			break;
	}
}

/**
  *
  * Leesmos y pintamos el estado de una dinamica desde http://dominio.net/check-tv.php?dnid=1237
  *
  */
function checkDinamica(){
	console.log("Consulto por el estado de la dinamica");
	jQuery.ajax({
		url: checktvURL,
		data: {dnid: nidDinamica},
		dataType: "jsonp",
		success: function(data) {
			// Hay datos?
			console.log(data);
			if(data.data.dinamicas.length > 0){
				var parcial = 0;
				for(var contador = 1; contador <= data.data.dinamicas[0].contadores.length; contador++){
					if(contador < data.data.dinamicas[0].contadores.length){
						var porcentaje = 0;
						if(data.data.dinamicas[0].total > 0){
							porcentaje = Math.round(data.data.dinamicas[0].contadores[contador - 1] * 100 / data.data.dinamicas[0].total);
						}
						parcial = parcial + porcentaje;
						
					}
					else{
						// Ultimo porcentaje
						var porcentaje = 0;
						if(data.data.dinamicas[0].total > 0){
							porcentaje = 100 - parcial;
						}
					}
					jQuery("#dinamica-trivia-online .respuesta .porcentaje" + contador).html(porcentaje + '%');
				}
			}
			else{
				console.log("No recibo informacion de la dinamica");
			}
		}
	});

}

/**
  *
  * Procesamos el mensaje de una emision que es un multimedia
  *
  */
function procesarMensajeMultimedia(m){
	console.log(m);
	// Almaceno el nid
	nidDinamica = m.nid;
	// Reviso el estado
	switch(m.estado){
		case "0":
		case 0:
			// No debieramos recibir este estado
			break;
		case "3":
		case 3:
			// Atento...
			mostrarPantalla('#dinamica-atento');
			if(m.hasOwnProperty("field_atento")){
				jQuery('#dinamica-atento h2.atencion').html(m.field_atento);
			}
			var estadoDinamica = "atento";
			break;
		case "6":
		case 6:
			// Online: completo los datos y muestro la pantalla
			mostrarPantalla('#dinamica-multimedia-online');
			jQuery('#dinamica-multimedia-online .pregunta').html(m.title);
			jQuery('#dinamica-multimedia-online .multimedia').html(m.multimedia_render);
			var estadoDinamica = "online";
			break;
		case "10":
		case 10:
			//Algo que hacer?
			// Si el modal no esta exhibido es porque el usuario acaba de entrar: lo mostramos
			if(!jQuery('#dinamica-multimedia-online').is(':visible')){
				mostrarPantalla('#dinamica-multimedia-online');
				jQuery('#dinamica-multimedia-online .pregunta').html(m.title);
				jQuery('#dinamica-multimedia-online .multimedia').html(m.multimedia_render);
				var estadoDinamica = "online";
			}
			break;
	}
}

/*
 * function mostrarPantalla
 * Muestra una pantalla, pero previamente revisa y oculta los que pueden estar mostrados.
 */
function mostrarPantalla(id, finishFunction){
	// console.log("Solicitan mostrar " + id);
	var i = 0;
	heMostrado = false;
	
	
	// Oculto cualquier otra pantalla que se este viendo
	while(i < pantallas.length){
		
		// La pantalla esta visible? Lo oculto 
		if(jQuery(pantallas[i]).is(':visible')){
			console.log("La pantalla " + pantallas[i] + " esta visible. La oculto");
			jQuery(pantallas[i]).hide();
		}
		i++;
	}
	if(!heMostrado){
		console.log("Muestro " + id);
		jQuery(id).fadeIn(200);
		heMostrado = true;
	}	
	
	
}


//Funcion que establece el estilo de la app (body)
function establecerEstilo(estilo){
	var nuevo = 'estilo-' + estilo;
	// Si habia un estilo antiguo, lo elimino
	if(estiloApp.length > 0){
		jQuery('body').removeClass(estiloApp);
	}
	estiloApp = nuevo;
	jQuery('body').addClass(estiloApp);
}


// Funcion que convierte un texto en slug
function convertToSlug(text){
	return text
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'')
		;
}
