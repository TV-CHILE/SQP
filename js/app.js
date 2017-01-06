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
var respuestaDinamica = 0;
var respuestaTpl = '__IMAGEN__<a role="button" class="btn btn-default respuesta" data-respuesta="__I__" data-loading-text="Guardando..."><span class="letra letra__I__">__LETRA__</span><span class="respuesta__I__">__RESPUESTA__</span></a>';
var historial = new Array();
var modales = [
	'#emision-inicio',
	'#emision-fin',
	'#emision-ganador',
	'#dinamica-atento',
	'#dinamica-trivia-online',
	'#dinamica-multimedia-online'
];
var mostradoModal = false;
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
var upicture = '';			// Imagen del usuario
var canal;					// Canal PubNub
var estiloApp = '';			// Estilo grafico que muestra la app
var mostrarLogin = false;	// Una vez preparara lainterfaz, desplegamos el modal de login

jQuery(document).ready(function() {
    // Comienza la app
	console.log('Comienza la app');
	screen = 'programas';
	
	// Tenemos informacion de login?
	var login = false;
	if(window.location.hash) {
		console.log("Tenemos hash");
		
		// Es hast para login?
		if(window.location.hash == '#login'){
			mostrarLogin = true;
		}
		else{
			// Un usuario que viene de hacer login
			var sesionData = window.location.hash.slice(1).split("&");
			sesionData.forEach(function(par){
				console.log("Procesando " + par);
				var keyValue = par.split("=");
				switch(keyValue[0]){
				case "uid":
					uid = parseInt(decodeURIComponent((keyValue[1]+'').replace(/\+/g, '%20')));
					login = true;
					break;
				case "name":
					uname = decodeURIComponent((keyValue[1]+'').replace(/\+/g, '%20'));
					break;
				case "picture":
					upicture = decodeURIComponent((keyValue[1]+'').replace(/\+/g, '%20'));
					break;
				}
			});
		}
		
	}
	
	// Heartbeat
	setInterval("ga('send','event','heartbeat','30s')",30000);
	ping(30);
	setInterval("ping(30)",30000);
	
	// Chequeo sesion
	if(typeof(Storage) !== "undefined") {
		if(login){
			// Si tenemos informacion de login, almacenamos
			localStorage.uid = uid;
			localStorage.uname = uname;
			localStorage.upicture = upicture;
			sesion = true;
			console.log("Login almacenado");
		}
		else{
			// Si no tenemos informacion de login, miramos si tenemos antigua
			if (localStorage.uid) {
				console.log("UID recuperado");
				sesion = true;
				uid = localStorage.uid;
			}
			if (localStorage.uname) {
				console.log("UName recuperado");
				uname = localStorage.uname;
			}
			if (localStorage.upicture) {
				console.log("UPicture recuperado");
				upicture = localStorage.upicture;
			}
		}
		
	}
	else {
		// No hay soporte Web Storage
		sesion = false;
	}
	if(sesion){
		// Muestro el boton de salir y oculto el de login de los modales
		jQuery('li.logout').show();
		jQuery('button.login-btn-modal').hide();
	}
	else{
		// Muestro la interfaz de login
		jQuery('li.login').show();
		jQuery('button.login-btn-modal').show();
	}
	
	// Leo los programas
	showLoading();
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
				// Los muestro
				programas.forEach(function(entry){
					var html = '<div class="field-content programa-btn"><a class="play" data-estilo="' + convertToSlug(entry.node.title) + '" data-nombre-programa="' + entry.node.title + '" data-inicio-emision="' + entry.node['inicio-emision'] + '" data-fin-emision="' + entry.node['fin-emision'] + '" data-sin-comenzar="' + entry.node['sin-comenzar'] + '" href="' + entry.node.nid + '/' + entry.node.canal + '"><img src="' + entry.node.field_logo.src + '" alt=""></a></div></div>';
					jQuery('#programas .view-programas').append(html);
				});
			
				// Capturo interactividad
				jQuery('#programas .play').click(function(event) {
					event.preventDefault();
				
					// Configuro:
					// mensaje emision sin comenzar
					jQuery("#sin-comenzar h2").html(jQuery(this).data("sinComenzar"));
					// mensaje inicio de emision
					inicio_emision = jQuery(this).data("inicioEmision");
					// mensaje fin de emision
					fin_emision = jQuery(this).data("finEmision");
				
					// nombre del programa
					programa = jQuery(this).data("nombrePrograma");
					jQuery("#emision h1.page-header").html(programa);
				
					var ids = jQuery(this).attr('href').split("/");
				
					canal = 'programa-' + ids[0];
				
					establecerEstilo(jQuery(this).data("estilo"));
				
					irAEmision(ids[0], ids[1]);
					
					// GA
					ga('send', 'event', 'nav', 'checkin', programa);
					
				});
			}
			hideLoading();
			if(mostrarLogin){
				jQuery('button.action-in').click();
				mostrarLogin = false;
			}
		}
	});
	
	// Login Facebook
	// http://app-chvplay.ddns.net/hybridauth/window/Facebook?destination=redirect&destination_error=redirect
	jQuery('button.facebookbtn').click(function() {
		// GA
		ga('send', 'event', 'nav', 'login', 'facebook');
		window.location.href = facebookLoginURL;
	});
	
	// Login Twitter
	// http://app-chvplay.ddns.net/hybridauth/window/Twitter?destination=redirect&destination_error=redirect
	jQuery('button.twitterbtn').click(function() {
		// GA
		ga('send', 'event', 'nav', 'login', 'twitter');
		window.location.href = twitterLoginURL;
	});
	// Boton Salir
	jQuery('button.salirbtn').click(function() {
		localStorage.clear();
		// GA
		ga('send', 'event', 'nav', 'logout');
		window.location.href = homeURL;
	});
	
	// Boton Login en modales
	jQuery('button.login-btn-modal').click(function() {
		// GA
		ga('send', 'event', 'nav', 'showlogin');
		window.location.href = homeURL + '#login';
		window.location.reload();
	});	
	
});

function irAEmision(pnid, cnid){
	screen = 'emision';
	showLoading();
	jQuery.getJSON(statusPgmURL + '?pnid=' + pnid + '&uid=' + uid, function(data) {
		// Almaceno
		statusPgm = data;
		
		// Modifico interfaz
		hideLoading();
		
		// Inicio la playalongApp
		initPlayAlongApp();
		
		
	}, 'json' );
}


function showLoading(){
	switch(screen){
		case 'programas':
			jQuery('#loading').show();
			jQuery('#programas').hide();
			jQuery('#emision').hide();
			break;
		case 'emision':
			jQuery('#loading').show();
			jQuery('#programas').hide();
			jQuery('#emision').hide();
			break;
	}
}


function hideLoading(){
	switch(screen){
		case 'programas':
			jQuery('#loading').hide();
			if(hay_programas){
				jQuery('#programas').show();
			}
			else{
				jQuery('#no-programas').show();
			}
			jQuery('#emision').hide();
			break;
		case 'emision':
			jQuery('#loading').hide();
			if(hay_programas){
				jQuery('#programas').hide();
			}
			else{
				jQuery('#no-programas').hide();
			}
			jQuery('#emision').show();
			break;
	}
}


// Funcion que gestiona la PlayAlongApp
function initPlayAlongApp() {
	// Init documento

	console.log("Iniciamos Cliente v1");
		
	// Inicializo sonido
	ion.sound({
		sounds: [
			{
				name: "atento"
			},
			{
				name: "online"
			},
			{
				name: "correcta",
			}
		],
		volume: 1.0,
		path: "/sounds/",
		preload: true,
		multiplay: true
	});
		
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
		console.log(mensaje);
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
	// Si hay actividad, oculto el mensaje de sin actividad
	jQuery('#sin-comenzar').hide();
	// m es el mensaje
	switch(m.type){
		case 'emision':
			procesarMensajeEmision(m);
			break;
		case 'emision-ganador':
			procesarMensajeEmisionGanador(m);
			break;						
		case 'trivia':
			procesarMensajeTrivia(m);
			break;
		case 'multimedia':
			procesarMensajeMultimedia(m);
			break;
	}
	historial.push(m);
}
/*
 *
 * funcion que gestiona el click sobre una respuesta de trivia
 *
 */
function clickRespuestaTrivia(){
	var $btn = jQuery(this);
		
	// Almaceno la respuesta
	respuestaDinamica = parseInt($btn.data("respuesta"));
	if(historial.length > 0){
		historial[historial.length -1].respuestaDinamica = respuestaDinamica;
	}
	
	// Cambio el aspecto de los botones
	$btn.addClass("btn-warning");
	jQuery("#dinamica-trivia-online a.respuesta").attr("disabled", "disabled");
	// $btn.removeAttr("disabled");
	
	// Ejecuto la respuesta
	enviarRespuestaDinamica($btn);
	
	ga('send', 'event', 'interaction', 'response', programa);
		
};


/*
 *
 * Eventos PubNub
 *
 */


/**
  *
  * Procesamos el mensaje de una emision
  *
  */
function procesarMensajeEmision(m){
	// Reviso el estado
	switch(m.estado){
		case "0":
		case 0:
			// Pasamos a fuera del aire -> Da igual como estemos: mostramos mensaje de no hay emision
			mostrarModal('#emision-fin');
			jQuery('#emision-fin h3').html(m.fin_emision);
			var estadoEmision = "fuera-de-aire";
			break;
		case "1":
		case 1:
			// Pasamos al aire -> Da igual como estemos: mostramos mensaje indicando que se inicia la emision
			mostrarModal('#emision-inicio');
			jQuery('#emision-inicio .modal-body h3').html(m.inicio_emision);
			var estadoEmision = "al-aire";
			break;
	}
}

/**
  *
  * Procesamos el mensaje de un ganador de una emision
  *
  */
function procesarMensajeEmisionGanador(m){
	console.log(m);
	// Mostramos los datos del ganador
	mostrarModal('#emision-ganador');
	jQuery('#emision-ganador .nombre').html(m.title);
	jQuery('#emision-ganador .multimedia').html(m.multimedia_render);
	
	
	jQuery('#emision-ganador h2.nombre').show();
	// Activo scratch
	/*
	console.log("Creamos scratch");
	createScratchCard({
		'container':document.getElementById('scratchcard'),
		'background': m.multimedia_url,
		'foreground':'/images/scratch-foreground-v2.png',
		'percent':70,
		'coin':'/images/scratch-coin.png',
		'thickness':18,
		'callback':'ganadorScratchCallback'
	});
	*/
}
function ganadorScratchCallback(d) { 
	jQuery('#emision-ganador h2.nombre').show();
}
/**
  *
  * Funcion de apoyo para el proceso de una trivia
  * muestra los valores de la trivia
  */
function configurarValoresTrivia(mensaje){
	console.log("Configuramos valores trivia:");
	console.log(mensaje);
	habilitarBotenesTrivia();
	jQuery('#dinamica-trivia-online .pregunta').html(mensaje.title);
	// Elimino prodibles respuestas antiguuas y creo las nuevas
	jQuery('#dinamica-trivia-online #respuestas img').remove();
	jQuery('#dinamica-trivia-online #respuestas .respuesta').remove();
	var i = 0;
	while(i < mensaje.field_respuesta_1_en_3.length){
		var respuesta = respuestaTpl.replace(/__I__/g, (i + 1));
		respuesta = respuesta.replace(/__LETRA__/g, letras[i]);
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
	
	// Evento click de los botones
	jQuery("#dinamica-trivia-online a.respuesta").click(clickRespuestaTrivia);
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
			ion.sound.play("atento");
			mostrarModal('#dinamica-atento');
			if(m.hasOwnProperty("field_atento")){
				jQuery('#dinamica-atento h2.atencion').html(m.field_atento);
			}
			var estadoDinamica = "atento";
			
			break;
		case "6":
		case 6:
			// Online: completo los datos y muestro el modal
			ion.sound.play("online");
			respuestaDinamica = 0;
			mostrarModal('#dinamica-trivia-online');
			configurarValoresTrivia(m);
			jQuery('#dinamica-trivia-online h6.status').html('');
			jQuery('#dinamica-trivia-online h6.status').removeClass('cerrada');
			jQuery('#dinamica-trivia-online h6.status').removeClass('finalizada');
			//jQuery('#dinamica-trivia-online h6.status').hide();
			var estadoDinamica = "online";
			break;
		case "8":
		case 8:
			// Stop: no permito interactuar con la dinamica
			// Si el modal no esta exhibido es porque el usuario acaba de entrar: lo mostramos
			if(!jQuery('#dinamica-trivia-online').is(':visible')){
				respuestaDinamica = 0;
				mostrarModal('#dinamica-trivia-online');
				configurarValoresTrivia(m);
			}
			if(m.hasOwnProperty("field_cerrada")){
				jQuery('#dinamica-trivia-online h6.status').html(m.field_cerrada);
				jQuery('#dinamica-trivia-online h6.status').addClass('cerrada');
				jQuery('#dinamica-trivia-online h6.status').show();
				
				// Muestro los porcentajes
				var i = 0;
				while(i < m.field_contador_1_en_3.length){
					jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html(jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html() + ' | <span class="porcentaje">' + m.field_contador_1_en_3[i] + "%</span>");
					i++;
				}
			}
			
			deshabilitarBotenesTrivia();
			var estadoDinamica = "cerrado";
			break;
		case "10":
		case 10:
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
				respuestaDinamica = backup.respuestaDinamica;
				var finishFunction = function(){
					// Recupero los valores
					habilitarBotenesTrivia();
					configurarValoresTrivia(backup);
					if(backup.hasOwnProperty("field_finalizada")){
						jQuery('#dinamica-trivia-online h6.status').html(backup.field_finalizada);
						jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
						//jQuery('#dinamica-trivia-online h6.status').show();
					}

					// Marco la respuesta que habia marcardo inicialmente, si es que habia marcado alguna
					if(respuestaDinamica > 0){
						jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").addClass("btn-warning");
					}
					// Muestro los porcentajes
					var i = 0;
					while(i < backup.field_respuesta_1_en_3.length){
						jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html(jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html() + ' | <span class="porcentaje">' + m.field_contador_1_en_3[i] + "%</span>");
						i++;
					}
					
					// Chequeo el resultado, si es que habia una respuesta correcta
					if(m.field_correcta_1_en_3 > 0){
						if(respuestaDinamica == m.field_correcta_1_en_3){
							// Acierto = Verde
							ion.sound.play("correcta");
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-success");
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
						}
						else{
							// Error
							if(respuestaDinamica == 0){
								// No habia contestado
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-primary");
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');	
							}
							else{
								// Habia contestado pero mal
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-primary");
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").addClass("btn-danger");
								jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").html() + ' <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>');
							}
						}
					}
					
					if(m.hasOwnProperty("field_finalizada")){
						jQuery('#dinamica-trivia-online h6.status').html(m.field_finalizada);
						jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
						//jQuery('#dinamica-trivia-online h6.status').show();
					}
					
					// Bloqueo las respuestas
					jQuery("#dinamica-trivia-online a.respuesta").attr("disabled", "disabled");
				};
				mostrarModal('#dinamica-trivia-online', finishFunction);
			}
			else{		
				// Muestro los porcentajes
				// Si el modal no esta exhibido es porque el usuario acaba de entrar: lo mostramos
				if(!jQuery('#dinamica-trivia-online').is(':visible')){
					respuestaDinamica = 0;
					mostrarModal('#dinamica-trivia-online');
					configurarValoresTrivia(m);
				}				
				
				var i = 0;
				while(i < m.field_contador_1_en_3.length){
					jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html(jQuery('#dinamica-trivia-online .respuesta' + (i + 1)).html() + ' | <span class="porcentaje">' + m.field_contador_1_en_3[i] + "%</span>");
					i++;
				}
				// Chequeo el resultado, si es que habia una respuesta correcta
				if(m.field_correcta_1_en_3 > 0){
					if(respuestaDinamica == m.field_correcta_1_en_3){
						// Acierto = Verde
						ion.sound.play("correcta");
						jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-success");
						jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
					}
					else{
						// Error
						if(respuestaDinamica == 0){
							// No habia contestado
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-primary");
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
							
						}
						else{
							// Habia contestado pero mal
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").addClass("btn-primary");
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + m.field_correcta_1_en_3 + "']").html() + ' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").addClass("btn-danger");
							jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").html(jQuery("#dinamica-trivia-online a.respuesta[data-respuesta='" + respuestaDinamica + "']").html() + ' <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>');
						}
					}
				}
				
				if(m.hasOwnProperty("field_finalizada")){
					jQuery('#dinamica-trivia-online h6.status').html(m.field_finalizada);
					jQuery('#dinamica-trivia-online h6.status').addClass('finalizada');
					//jQuery('#dinamica-trivia-online h6.status').show();
				}
				
				// Bloqueo las respuestas
				jQuery("#dinamica-trivia-online a.respuesta").attr("disabled", "disabled");
			}
			break;
	}
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
			ion.sound.play("atento");
			mostrarModal('#dinamica-atento');
			if(m.hasOwnProperty("field_atento")){
				jQuery('#dinamica-atento h2.atencion').html(m.field_atento);
			}
			var estadoDinamica = "atento";
			break;
		case "6":
		case 6:
			// Online: completo los datos y muestro el modal
			respuestaDinamica = 0;
			mostrarModal('#dinamica-multimedia-online');
			jQuery('#dinamica-multimedia-online .pregunta').html(m.title);
			jQuery('#dinamica-multimedia-online .multimedia').html(m.multimedia_render);
			var estadoDinamica = "online";
			break;
		case "10":
		case 10:
			//Algo que hacer?
			// Si el modal no esta exhibido es porque el usuario acaba de entrar: lo mostramos
			if(!jQuery('#dinamica-multimedia-online').is(':visible')){
				respuestaDinamica = 0;
				mostrarModal('#dinamica-multimedia-online');
				jQuery('#dinamica-multimedia-online .pregunta').html(m.title);
				jQuery('#dinamica-multimedia-online .multimedia').html(m.multimedia_render);
				var estadoDinamica = "online";
			}
			break;
	}
}

/*
 * function mostrarModal
 * Muestra un modal, pero previamente revisa y oculta los que pueden estar mostrados.
 * Lo hacemos asi para evitar un error de Bootstrap que se dispara cuando muestras un modal mientras se esta ocultando otro.
 */
function mostrarModal(id, finishFunction){
	// console.log("Solicitan mostrar " + id);
	mostradoModal = false;
	var mismoModal = false;
	var i = 0;
	while(i < modales.length){
		// console.log("Procesando " + modales[i])
		// Elimino eventos on('hidden.bs.modal') del modal
		jQuery(modales[i]).unbind('hidden.bs.modal');
		
		// El modal esta visible? Lo oculto 
		if(jQuery(modales[i]).is(':visible')){
			// Vamos a mostrar le mismo modal que vamos a ocultar?
			if(modales[i] == id){
				// console.log("Vamos a mostrar el mismo modal que vamos a ocultar");
				mismoModal = true;
			}
			// console.log(modales[i] + " esta visible");
			// Tengo que mostrar un modal que es igual al que esta mostrado?
			if(modales[i] == id){
				mismoModal = true;
			}
			jQuery(modales[i]).on('hidden.bs.modal', function (e) {
				// Muestro el modal que se me ha solicitado, si es que no se ha mostrado ya
				// console.log("Se ha ocultado");
				if (typeof(finishFunction) !== 'undefined'){
					// console.log("Tenemos funcion fisnish. La ejecutamos");
					finishFunction();
				}
				else{
					// console.log("No tenemos funcion finish");
				}
				if(!mostradoModal){
					// console.log("Muestro modal " + id);
					jQuery(id).modal('show');
					mostradoModal = true;
				}
			});
			// console.log("Ordeno ocultar " + modales[i]);
			jQuery(modales[i]).modal('hide');
		}
		i++;
	}
	
	// Otros aspectos del html
	jQuery(".view-play .view-empty").remove();
	jQuery('#emision-ganador .multimedia').html('');	
	jQuery('#dinamica-multimedia-online .multimedia').html('');
	
	// Si aun no he mostrado el modal, es el momento de hacerlo
	if(!mostradoModal && !mismoModal){
		// console.log("Finalmente mostramos modal " + id);
		jQuery(id).modal('show');
		mostradoModal = true;
	}
}

function habilitarBotenesTrivia(){

	jQuery("#dinamica-trivia-online a.respuesta").removeAttr("disabled");
	jQuery("#dinamica-trivia-online a.respuesta").removeClass("btn-danger");
	jQuery("#dinamica-trivia-online a.respuesta").removeClass("btn-success");
	jQuery("#dinamica-trivia-online a.respuesta").removeClass("btn-primary");
	jQuery("#dinamica-trivia-online a.respuesta").removeClass("btn-warning");
	jQuery("#dinamica-trivia-online a.respuesta").removeClass("btn-default");
	jQuery("#dinamica-trivia-online a.respuesta").addClass("btn-default");	
}

function deshabilitarBotenesTrivia(){
	jQuery("#dinamica-trivia-online a.respuesta").attr("disabled", "disabled");	
}


// Envio la respuesta a una dinamica
function enviarRespuestaDinamica($btn){
	jQuery.getJSON(checkURL + "?uid=" + uid + "&dnid=" + nidDinamica + "&rid=" + respuestaDinamica, function( data ) {
		// $btn.button('reset');
		$btn.attr("disabled", "disabled");
		console.log(data);
		// Algo mas que hacer?
	}, "json" );
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
	
	// Cargo la tipografica
	var i = 0;
	while(i < fuentes.length){
		if (estilo in fuentes[i]){
			WebFont.load({
				google: {
					families: [fuentes[i][estilo]]
				}
			});
		}
		i++;
	}
}

// Funcion que hace ping
function ping(intervalo){
	jQuery.getJSON(pingURL + '?intervalo=' + intervalo, function(data) {
		// Algo que hacer?
		
	}, 'json' );
}

// Funcion que convierte un texto en slug
function convertToSlug(text){
	return text
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'')
		;
}
