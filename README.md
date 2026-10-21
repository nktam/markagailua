# Marcador compartido

La página pública de solo visualización está en `servidor/index.php`. Para gestionar, abre `servidor/admin/`; se solicitará la clave privada configurada en el servidor antes de mostrar el panel.

## Requisitos

- PHP 8.1 o posterior con las extensiones `PDO` y `pdo_mysql`.
- MySQL 5.7 o posterior.
- Un servidor web con PHP (por ejemplo, Apache/XAMPP) o el servidor integrado de PHP.

## Configuración

1. Importa `schema.sql` en MySQL. Crea la base de datos `markagailua` y la tabla con el estado inicial.
2. Copia `config.example.php` como `config.php` y ajusta la conexión a MySQL.
3. Guarda la clave de gestión directamente en `config.php` como `admin_password`. No publiques ni compartas `config.php`; está excluido de Git.
4. Publica la carpeta `servidor/` completa, incluida `admin/`, `img/` y `css/`, en un servidor con HTTPS. Los visitantes pueden abrir `/`; el gestor inicia sesión en `/admin/`.

## Ejecutar en local con Docker

Necesitas Docker Desktop con Docker Compose. Desde la raíz del proyecto, ejecuta:

```sh
docker compose up --build
```

Abre `http://localhost:8080` para ver el marcador y `http://localhost:8080/admin/` para acceder al panel de gestión. La clave local predeterminada es `cambia-esta-clave`; puedes cambiarla definiendo `ADMIN_PASSWORD` antes de iniciar Compose. La base de datos MySQL y su esquema se inicializan automáticamente la primera vez y se conservan en el volumen `mysql_data`.

Para detener los contenedores, pulsa `Ctrl+C` y ejecuta `docker compose down`. Para borrar también la base de datos local, ejecuta `docker compose down -v`.

La página de solo visualización, sin controles de gestión, está en `index.php`. Su presentación se configura en `css/streaming.css`.

Si la tabla `scoreboard` ya existía antes de esta versión, elimina las columnas que ya no se usan ejecutando una vez:

```sql
ALTER TABLE scoreboard
    DROP COLUMN event_id,
    DROP COLUMN last_try_team;
```

Ejemplo de `config.php`:

```php
<?php
return [
    'db_host' => '127.0.0.1',
    'db_name' => 'markagailua',
    'db_user' => 'usuario_mysql',
    'db_password' => 'clave_mysql',
    'admin_password' => 'TU-CLAVE-DE-GESTION',
];
```

También se admiten las variables de entorno `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `ADMIN_PASSWORD`.

La clave se guarda como texto en la configuración del servidor; protege ese archivo y utiliza HTTPS al publicar la aplicación.

Los navegadores consultan el estado compartido cada segundo. El cronómetro se calcula en el servidor, por lo que sigue avanzando correctamente aunque se cierre la pestaña del gestor.

El marcador tiene un tamaño fijo de 770 × 770 píxeles en las versiones local y de servidor.
