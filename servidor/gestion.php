<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$error = '';
$config = app_config();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!valid_csrf_token($_POST['csrf_token'] ?? null)) {
        http_response_code(400);
        $error = 'La sesión del formulario ha caducado. Recarga la página e inténtalo de nuevo.';
    } elseif (($_POST['action'] ?? '') === 'logout') {
        $_SESSION = [];
        session_regenerate_id(true);
        header('Location: index.php');
        exit;
    } elseif (($_POST['action'] ?? '') === 'login') {
        $passwordHash = (string) ($config['admin_password_hash'] ?? '');
        $password = $_POST['password'] ?? '';

        if ($passwordHash === '') {
            $error = 'El administrador todavía no ha configurado la clave en el servidor.';
        } elseif (!is_string($password) || !password_verify($password, $passwordHash)) {
            http_response_code(401);
            $error = 'La clave de gestión no es correcta.';
        } else {
            session_regenerate_id(true);
            $_SESSION['manager_authenticated'] = true;
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            header('Location: index.php');
            exit;
        }
    } else {
        http_response_code(400);
        $error = 'Acción no válida.';
    }
}

if (manager_authenticated()) {
    header('Location: index.php');
    exit;
}
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gestión del marcador</title>
    <link rel="stylesheet" href="../css/markagailua.css">
    <link rel="stylesheet" href="servidor.css">
</head>
<body class="pagina-gestion">
    <main class="formulario-gestion">
        <p>RUGBY / CONTROL</p>
        <h1>Gestión del marcador</h1>
        <?php if ($error !== ''): ?>
            <p class="error-gestion" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
        <form action="gestion.php" method="post">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
            <input type="hidden" name="action" value="login">
            <label for="password">Clave de gestión</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
            <button class="boton-reloj" type="submit">Entrar</button>
        </form>
        <a href="index.php">Volver al marcador</a>
    </main>
</body>
</html>
