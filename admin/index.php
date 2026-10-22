<?php
require_once __DIR__ . '/../bootstrap.php';

if (!manager_authenticated()) {
    header('Location: gestion.php');
    exit;
}
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Control móvil del marcador</title>
    <link rel="stylesheet" href="../css/markagailua.css">
    <link rel="stylesheet" href="../css/servidor.css">
    <link rel="stylesheet" href="../css/movil.css">
</head>

<body class="pagina-movil" data-manager="true" data-asset-root="../" data-api-url="../api.php">
    <p class="estado-conexion" id="estado-conexion" role="status" hidden></p>
    <main class="control-movil">
        <?php include __DIR__ . '/includes/panelControl.php'; ?>
        <?php include __DIR__ . '/includes/panelConfig.php'; ?>
    </main>
    <script src="../js/admin.js"></script>
</body>

</html>
