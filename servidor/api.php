<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

final class ApiException extends RuntimeException
{
    public function __construct(string $message, public readonly int $statusCode)
    {
        parent::__construct($message);
    }
}

function respond_json(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

function read_scoreboard(PDO $database): array
{
    $row = $database->query(
        'SELECT local_points, local_tries, visitor_points, visitor_tries,
                second_half, elapsed_seconds, is_running, started_at, visitor_logo,
                event_id, last_try_team
         FROM scoreboard WHERE id = 1'
    )->fetch();

    if ($row === false) {
        throw new RuntimeException('No existe la fila inicial del marcador. Importa schema.sql.');
    }

    $now = time();
    $elapsed = (int) $row['elapsed_seconds'];
    if ((bool) $row['is_running'] && $row['started_at'] !== null) {
        $elapsed += max(0, $now - (int) $row['started_at']);
    }

    return [
        'localPoints' => (int) $row['local_points'],
        'localTries' => (int) $row['local_tries'],
        'visitorPoints' => (int) $row['visitor_points'],
        'visitorTries' => (int) $row['visitor_tries'],
        'secondHalf' => (bool) $row['second_half'],
        'elapsedSeconds' => $elapsed,
        'running' => (bool) $row['is_running'],
        'visitorLogo' => (string) $row['visitor_logo'],
        'eventId' => (int) $row['event_id'],
        'lastTryTeam' => $row['last_try_team'],
        'serverTime' => $now,
    ];
}

function required_integer(array $body, string $key): int
{
    $value = $body[$key] ?? null;
    if (!is_int($value)) {
        throw new ApiException('La solicitud contiene datos no válidos.', 400);
    }

    return $value;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        respond_json(read_scoreboard(database_connection()));
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Allow: GET, POST');
        throw new ApiException('Método no permitido.', 405);
    }

    if (!manager_authenticated()) {
        throw new ApiException('Inicia sesión para gestionar el marcador.', 401);
    }

    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!valid_csrf_token($csrfToken)) {
        throw new ApiException('La sesión de gestión ha caducado. Recarga la página.', 403);
    }

    $body = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($body) || !is_string($body['action'] ?? null)) {
        throw new ApiException('La solicitud contiene datos no válidos.', 400);
    }

    $database = database_connection();
    $database->beginTransaction();
    $row = $database->query(
        'SELECT local_points, local_tries, visitor_points, visitor_tries,
                second_half, elapsed_seconds, is_running, started_at
         FROM scoreboard WHERE id = 1 FOR UPDATE'
    )->fetch();

    if ($row === false) {
        throw new RuntimeException('No existe la fila inicial del marcador. Importa schema.sql.');
    }

    $now = time();
    $action = $body['action'];
    if ($action === 'score') {
        $team = $body['team'] ?? null;
        $points = required_integer($body, 'points');
        $tries = required_integer($body, 'tries');
        $allowedChanges = ['5:1', '-5:-1', '2:0', '-2:0', '3:0', '-3:0'];

        if (!in_array($team, ['local', 'visitor'], true)
            || !in_array($points . ':' . $tries, $allowedChanges, true)) {
            throw new ApiException('El cambio de puntuación no es válido.', 400);
        }

        $prefix = $team === 'local' ? 'local' : 'visitor';
        $pointsColumn = $prefix . '_points';
        $triesColumn = $prefix . '_tries';
        $newPoints = max(0, (int) $row[$pointsColumn] + $points);
        $newTries = max(0, (int) $row[$triesColumn] + $tries);

        $statement = $database->prepare(
            "UPDATE scoreboard SET {$pointsColumn} = ?, {$triesColumn} = ? WHERE id = 1"
        );
        $statement->execute([$newPoints, $newTries]);

        if ($tries > 0) {
            $database->prepare(
                'UPDATE scoreboard SET event_id = event_id + 1, last_try_team = ? WHERE id = 1'
            )->execute([$team]);
        }
    } elseif ($action === 'start') {
        if (!(bool) $row['is_running']) {
            $database->prepare(
                'UPDATE scoreboard SET is_running = 1, started_at = ? WHERE id = 1'
            )->execute([$now]);
        }
    } elseif ($action === 'pause') {
        if ((bool) $row['is_running'] && $row['started_at'] !== null) {
            $elapsed = (int) $row['elapsed_seconds'] + max(0, $now - (int) $row['started_at']);
            $database->prepare(
                'UPDATE scoreboard SET elapsed_seconds = ?, is_running = 0, started_at = NULL WHERE id = 1'
            )->execute([$elapsed]);
        }
    } elseif ($action === 'half') {
        $secondHalf = !(bool) $row['second_half'];
        $database->prepare(
            'UPDATE scoreboard SET second_half = ?, elapsed_seconds = ?, started_at = ? WHERE id = 1'
        )->execute([$secondHalf ? 1 : 0, $secondHalf ? 2400 : 0, (bool) $row['is_running'] ? $now : null]);
    } elseif ($action === 'reset') {
        $database->exec(
            'UPDATE scoreboard
             SET local_points = 0, local_tries = 0, visitor_points = 0, visitor_tries = 0,
                 second_half = 0, elapsed_seconds = 0, is_running = 0, started_at = NULL
             WHERE id = 1'
        );
    } elseif ($action === 'visitor') {
        $allowedLogos = [
            'Bisitaria.jpg',
            'Betsaide Elorrio RT.jpg',
            'Cormorán RC.jpg',
            'Durango RT.jpg',
            'Gaztedi RT.jpg',
            'Geurea RT.jpg',
            'Hernani RCE.jpg',
            'La Unica RT.jpg',
            'Pasek Belenos.jpg',
            'RC Rioja.jpeg',
            'Rugby Aranda Freund.jpg',
            'Txingudi RC.png',
            'Universitario Bilbao Rugby.jpg',
            'Uribealdea RKE.jpg',
        ];
        $logo = $body['logo'] ?? null;

        if (!is_string($logo) || !in_array($logo, $allowedLogos, true)) {
            throw new ApiException('El equipo visitante seleccionado no es válido.', 400);
        }

        $database->prepare('UPDATE scoreboard SET visitor_logo = ? WHERE id = 1')->execute([$logo]);
    } else {
        throw new ApiException('Acción no válida.', 400);
    }

    $database->commit();
    respond_json(read_scoreboard($database));
} catch (ApiException $error) {
    if (isset($database) && $database instanceof PDO && $database->inTransaction()) {
        $database->rollBack();
    }
    respond_json(['error' => $error->getMessage()], $error->statusCode);
} catch (JsonException $error) {
    if (isset($database) && $database instanceof PDO && $database->inTransaction()) {
        $database->rollBack();
    }
    respond_json(['error' => 'El contenido de la solicitud no es JSON válido.'], 400);
} catch (Throwable $error) {
    if (isset($database) && $database instanceof PDO && $database->inTransaction()) {
        $database->rollBack();
    }
    error_log('Error en api.php: ' . $error->getMessage());
    respond_json(['error' => 'No se pudo consultar o guardar el marcador. Revisa la conexión MySQL y schema.sql.'], 503);
}
