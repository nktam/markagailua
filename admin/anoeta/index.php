<?php
require_once __DIR__ . '/../../bootstrap.php';

if (!manager_authenticated()) {
    header('Location: ../gestion.php');
    exit;
}

$isManager = manager_authenticated();
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Marcador de rugby</title>
    <link rel="stylesheet" href="../../css/markagailua.css">
    <link rel="stylesheet" href="../../css/servidor.css">
</head>

<body data-manager="<?= $isManager ? 'true' : 'false' ?>" data-asset-root="../../" data-api-url="../../api.php">
    <p class="estado-conexion" id="estado-conexion" role="status" hidden></p>
    <?php include __DIR__ . '/../includes/anoeta.php'; ?>

    <?php include __DIR__ . '/../includes/panelControl.php'; ?>

    <?php include __DIR__ . '/../includes/panelConfig.php'; ?>

    <script src="../../js/markagailua.js"></script>
    <script src="../../js/admin.js"></script>
</body>

</html>
