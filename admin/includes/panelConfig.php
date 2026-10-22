<aside class="panel-config" aria-label="Panel de configuración">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <header class="panel-cabecera">
        <h1>Configuración</h1>
    </header>
    <section class="seccion-control" aria-labelledby="titulo-equipo-visitante">
        <h2 id="titulo-equipo-visitante">Equipo visitante</h2>
        <select id="seleccionar-visitante" aria-label="Equipo visitante">
            <option value="" selected disabled>Seleccionar equipo</option>
            <option value="Bisitaria.jpg">BISITARIA</option>
            <option value="Betsaide Elorrio RT.jpg">BETSAIDE ELORRIO RT</option>
            <option value="Cormorán RC.jpg">CORMORÁN RC</option>
            <option value="Durango RT.jpg">DURANGO RT</option>
            <option value="Gaztedi RT.jpg">GAZTEDI RT</option>
            <option value="Geurea RT.jpg">GEUREA RT</option>
            <option value="Hernani RCE.jpg">HERNANI RCE</option>
            <option value="La Unica RT.jpg">LA UNICA RT</option>
            <option value="Pasek Belenos.jpg">PASEK BELENOS</option>
            <option value="RC Rioja.jpeg">RC RIOJA</option>
            <option value="Rugby Aranda Freund.jpg">RUGBY ARANDA FREUND</option>
            <option value="Txingudi RC.png">TXINGUDI RC</option>
            <option value="Universitario Bilbao Rugby.jpg">UNIVERSITARIO BILBAO</option>
            <option value="Uribealdea RKE.jpg">URIBEALEA RKE</option>
        </select>
    </section>
    <section class="seccion-control" aria-label="Pantalla completa">
        <button class="boton-pantalla-completa" id="pantalla-completa" type="button" aria-pressed="false">
            Pantalla completa
        </button>
    </section>
    <form action="<?= str_contains($_SERVER['SCRIPT_NAME'] ?? '', '/anoeta/') ? '../gestion.php' : 'gestion.php' ?>" method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="action" value="logout">
        <button class="boton-pantalla-completa" type="submit">Cerrar sesión</button>
    </form>
</aside>
