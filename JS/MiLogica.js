/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global google*/

$(document).ready(function () {
    /**
     * Función que permite Colocar animación de simular
     * procesamiento de comunicación con el servidor
     */
    var loading = "<img src='CSS/images/ajax-loader.gif' width='20px'>";
    $(document).on("mobileinit", function () {
        $.mobile.loader.prototype.options.text = "<b>Procesando Solicitud...</b>";
        $.mobile.loader.prototype.options.textVisible = true;
        $.mobile.loader.prototype.options.textonly = false;
        $.mobile.loader.prototype.options.theme = "a";
        $.mobile.loader.prototype.options.html = "";
    });

    function cambio(page) {
        var efecto = ["pop", "fade", "flip", "turn", "flow", "slide", "slidedown", "slideup"];
        var anima = eval(Math.floor(Math.random() * efecto.length));
        $.mobile.changePage("#" + page, {
            transition: efecto[anima]
        });
    }
    var retornoIdDIV;
    $("#regresoPage").click(function () {
        $("#alIi").html("");
        $("#alti2").html("");
        $("#alMen").html("");
        cambio(retornoIdDIV);
    });

    $("#registrar").click(function () {
        mostrarMapa();
        cambio("forReg");
    });
    $("#listar").click(function () {
        cambio("ForLis");
        var numero = localStorage.length;
        $("#miLista").html("");
        for (var i = 0; i < numero; i++) {
            var code = localStorage.key(i);
            var ObjeHotel = localStorage.getItem(code);
            try {
                var Hotel = $.parseJSON(ObjeHotel);
                if (Hotel.type == "mapa") {
                    $("#miLista").append("<button id='miHotel" + i + "'>" + Hotel.nom + "</button>");
                    $("#miHotel" + i).addClass("ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-navigation");
                    mostrarHotel("miHotel" + i, Hotel);
                }
            } catch (e) {
            }
        }
    });

    $(".Inico").click(function () {
        cambio("inicio");
    });
    function mensage(mensaje) {
        $.mobile.loading("show", {
            text: mensaje,
            textVisible: true,
            theme: "a",
            textonly: false,
            html: ''
        });
    }
    function validar(form, reglas, msn, metodo) {
        $("#" + form).validate({
            rules: reglas,
            messages: msn,
            submitHandler: function () {
                metodo();
                $("#" + form).reset();
            }
        });
    }

    function alert(Titu, subTitu, mensaje, Retorno) {
        retornoIdDIV = Retorno;
        $("#alIi").html(Titu);
        $("#alti2").html(subTitu);
        $("#alMen").html(mensaje);
        cambio("alerta");
    }

    /************************************************/
    /**** Almacena la información del Formulario ****/
    /************************************************/
    $("#RegHotel").click(function () {
        var metodo = function () {
            var mensaje = "<h3>El registro fue exitoso de:</h3><br>" +
                    "El hotel:<b>" + $("#hotNo").val() + "</b><br>" +
                    "<b>Con lo datos:</b><br>" +
                    "<b>Dirección:</b> " + $("#hotDir").val() + "<br>" +
                    "<b>Telefono:</b> " + $("#hotTe").val() + "<br>" +
                    "<b># de estrellas:</b> " + $("#hotNu").val() + "<br>";
            alert("Información", "Registro de Hotel", mensaje, "inicio");
            var numero = localStorage.length;
            var Hotel = {
                nom: $("#hotNo").val(),
                dir: $("#hotDir").val(),
                tel: $("#hotTe").val(),
                num: $("#hotNu").val(),
                lap: latitudPunto,
                lop: longitudPunto,
                type: "mapa"
            };
            localStorage.setItem(numero, JSON.stringify(Hotel));
        };
        var reglas = {hotNo: {required: true}, hotDir: {required: true}, hotTe: {required: true, number: true, digits: true}, hotNu: {required: true, number: true, digits: true}};
        var MSN = {hotNo: {required: "* requerido"}, hotDir: {required: "* requerido"}, hotTe: {required: "* requerido", number: "* Debe ser un numero", digits: "* sin puntos, sin comas"}, hotNu: {required: "* requerido", number: "* Debe ser un numero", digits: "* sin puntos, sin comas"}};
        validar("registroHotel", reglas, MSN, metodo);
    });



    /************************************************************/
    /**** Obtener la Ubicaión para el Formulario de Registro ****/
    /************************************************************/
    function convertirDireccion() {
        var geocoder = new google.maps.Geocoder();
        var latlngN = new google.maps.LatLng(latitudPunto, longitudPunto);
        mensage("Procesando solicitud.....");
        geocoder.geocode({
            'latLng': latlngN
        }, function (resultados, estado) {
            if (estado == google.maps.GeocoderStatus.OK) {
                // console.log(resultados[0]);
                $("#hotDir").val(resultados[0].formatted_address);
                $.mobile.loading("hide");
            } else {
                $.mobile.loading("hide");
                alert("!Opsss....", "Error de Ubicación", "El punto de ubicacion no es valido.<br>" +
                        "Le solicitamos ubicar de nuevo el marcador.<br>" + estado + "<br>Gracias...", "#");
                // alert('Error en el servicio!!: ' + estado);
            }
        });
    }
    var marcador;
    var latitudPunto;
    var longitudPunto;
    var mapa;
    var latlngInicial = new google.maps.LatLng(4.678862228002737, -74.0582194691587);
    function mostrarMapa() {
        $("#hotMapa").html("Cargando Mapa...." + loading);
        mensage("Cargado mapa.....");
        setTimeout(function () {
            var opciones = {
                zoom: 12,
                center: latlngInicial,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            mapa = new google.maps.Map(document.getElementById("hotMapa"), opciones);
            marcador = new google.maps.Marker({
                position: latlngInicial,
                map: mapa,
                draggable: true,
                title: "Mi punto!!"
            });
            google.maps.event.addListener(marcador, 'dragend', function (event) {
                latitudPunto = event.latLng.lat();
                longitudPunto = event.latLng.lng();
                convertirDireccion();
            });
        }, 1000);
    }
    /***********************************************/
    /**** Grafica Ubicacion del Hotel **************/
    /**** Grafica Ubicacion del personal ***********/
    /**** Grafica la Ruta entre hotel y presona ****/
    /***********************************************/
    function mostrarHotel(elem, Oject) {
        $("#" + elem).click(function () {
            $("#RegLista").unbind();
            $("#RegLista").click(function () {
                $("#listar").trigger("click");
            });
            cambio("MostrarHotel");
            $("#UbiMapa").html("Cargando Mapa...." + loading);
            mensage("Cargado mapa.....");
            $("#DaNom").html(Oject.nom);
            $("#DaTel").html(Oject.tel);
            $("#DaEst").html(Oject.num);
            $("#DaUbi").html(Oject.dir);
            var ubicacion = new google.maps.LatLng(Oject.lap, Oject.lop);
            obtenerPosicionActual();
            setTimeout(function () {
                var opciones = {
                    zoom: 10,
                    center: ubicacion,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                mapa = new google.maps.Map(document.getElementById("UbiMapa"), opciones);
                marcador = new google.maps.Marker({
                    position: ubicacion,
                    icon: "hotel.png",
                    map: mapa,
                    title: "Hotel: " + Oject.nom
                });

                MiUbicacion = new google.maps.Marker({
                    position: posicion,
                    icon: "yo.png",
                    map: mapa,
                    draggable: true,
                    title: "Mi punto!!"
                });
                
               /* Grafica la ruta */
                var peticion = {
                    origin: posicion,
                    destination: ubicacion,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                var directionsDisplay;
                var directionsService = new google.maps.DirectionsService();
                var directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setMap(mapa);
                directionsService.route(peticion, function (respuesta, estado) {
                    if (estado == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(respuesta);
                    } else {
                        alert('Error en el servicio!!: ' + estado);
                    }
                });
                $.mobile.loading("hide");
            }, 1000);

        });
    }
    /********************************/
    /**** Objetener mi ubicación ****/
    /********************************/
    var MiUbicacion;
    var posicion;
    function exito(pos) {
        var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        posicion = latlng;
    }
    function fallido(error) {
        if (error.code == 0) {
            alert("Oops! No se puede obtener la posición actual.");
        }
        if (error.code == 1) {
            alert("Oops! Algo ha salido mal.");
        }
        if (error.code == 2) {
            alert("Oops! No has aceptado compartir tu posición.");
        }
        if (error.code == 3) {
            alert("Oops! Hemos superado el tiempo de espera");
        }
    }
    function obtenerPosicionActual() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(exito, fallido, {
                maximumAge: 500000,
                enableHighAccuracy: true,
                timeout: 6000
            });
        }
    }
});

jQuery.fn.reset = function () {
    $(this).each(function () {
        this.reset();
    });
};
