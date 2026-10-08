# Marcador compartido

La página pública (`servidor/index.php`) muestra únicamente el marcador. Cualquier cambio se guarda en MySQL y los navegadores conectados reciben el estado actualizado automáticamente. Para gestionar, abre `servidor/gestion.php` e inicia sesión con la clave privada configurada en el servidor.

## Requisitos

- PHP 8.1 o posterior con las extensiones `PDO` y `pdo_mysql`.
- MySQL 5.7 o posterior.
- Un servidor web con PHP (por ejemplo, Apache/XAMPP) o el servidor integrado de PHP.

## Configuración

1. Importa `schema.sql` en MySQL. Crea la base de datos `markagailua` y la tabla con el estado inicial.
2. Copia `config.example.php` como `config.php` y ajusta la conexión a MySQL.
3. Guarda la clave de gestión directamente en `config.php` como `admin_password`. No publiques ni compartas `config.php`; está excluido de Git.
4. Publica la carpeta `servidor/` completa, incluida `img/` y `css/`, en un servidor con HTTPS y abre `index.php`. El marcador es de solo lectura para los visitantes; el gestor entra por `gestion.php`.

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
