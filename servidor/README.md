# Marcador compartido

La página pública (`servidor/index.php`) muestra únicamente el marcador. Cualquier cambio se guarda en MySQL y los navegadores conectados reciben el estado actualizado automáticamente. Para gestionar, abre `servidor/gestion.php` e inicia sesión con la clave privada configurada en el servidor.

## Requisitos

- PHP 8.1 o posterior con las extensiones `PDO` y `pdo_mysql`.
- MySQL 5.7 o posterior.
- Un servidor web con PHP (por ejemplo, Apache/XAMPP) o el servidor integrado de PHP.

## Configuración

1. Importa `schema.sql` en MySQL. Crea la base de datos `markagailua` y la tabla con el estado inicial.
2. Copia `config.example.php` como `config.php` y ajusta la conexión a MySQL.
3. Genera una clave segura para gestión y guarda únicamente su hash en `config.php`. Puedes generarlo con:

   ```sh
   php -r "echo password_hash('CAMBIA-ESTA-CLAVE', PASSWORD_DEFAULT), PHP_EOL;"
   ```

   Añade el hash a la configuración como `admin_password_hash`. No publiques ni compartas `config.php`; está excluido de Git.
4. Publica la carpeta `servidor/` en un servidor con HTTPS y abre `servidor/index.php`. El marcador es de solo lectura para los visitantes; el gestor entra por `servidor/gestion.php`.

Ejemplo de `config.php`:

```php
<?php
return [
    'db_host' => '127.0.0.1',
    'db_name' => 'markagailua',
    'db_user' => 'usuario_mysql',
    'db_password' => 'clave_mysql',
    'admin_password_hash' => 'PEGA_AQUI_EL_HASH_GENERADO',
];
```

También se admiten las variables de entorno `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `ADMIN_PASSWORD_HASH`.

Los navegadores consultan el estado compartido cada segundo. El cronómetro se calcula en el servidor, por lo que sigue avanzando correctamente aunque se cierre la pestaña del gestor.
