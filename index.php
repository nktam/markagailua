<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Marcador de rugby - Streaming</title>
    <link rel="stylesheet" href="css/streaming.css">
</head>

<body class="pagina-streaming" data-manager="false" data-asset-root="" data-api-url="api.php">
    <p class="estado-conexion" id="estado-conexion" role="status" hidden></p>
    <div class="recuadro">
        <main class="marcador" aria-label="Marcador de rugby">
            <div class="identidad-equipo equipo-local">
                <span>DON</span>
                <img class="insignia" src="img/drb.jpg" alt="Escudo de DRB">
            </div>
            <div class="puntos" id="puntos-local">0</div>
            <div class="puntos" id="puntos-visitante">0</div>
            <div class="identidad-equipo equipo-visitante">
                <img class="insignia" id="insignia-visitante" src="img/equipos/Bisitaria.jpg" alt="">
                <span id="nombre-visitante">BIS</span>
            </div>
            <div class="reloj">00:00</div>
            <span class="tarjetas" id="tarjetas-local"></span>
            <div class="ensayos" id="ensayos-local">0</div>
            <div class="ensayos" id="ensayos-visitante">0</div>
            <span class="tarjetas" id="tarjetas-visitante"></span>



        </main>
        <script src="js/markagailua.js"></script>
</body>

</html>