<aside class="panel-control" aria-label="Panel de control del partido">
    <header class="panel-cabecera">
        <h1>Partido</h1>
    </header>

    <section class="seccion-control" aria-labelledby="titulo-reloj">
        <h2 id="titulo-reloj">Cronómetro</h2>
        <div class="controles-reloj">
            <button class="boton-reloj" id="alternar-reloj" type="button">
                <span class="icono-reloj" id="icono-reloj" aria-hidden="true">▶</span>
                <span id="texto-reloj">Iniciar</span>
            </button>
            <button class="boton-reloj" id="cambiar-parte" type="button">Cambiar parte</button>
        </div>
    </section>

    <section class="equipo-control" aria-labelledby="titulo-local">
        <h2 id="titulo-local">DRB</h2>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="local" data-points="5" data-try-delta="1"
                    aria-label="Sumar 5 puntos por ensayo a DRB"><span class="signo-puntos">+</span>
                    Ensayo</button>
                <button class="boton-puntos restar" type="button" data-team="local" data-points="-5"
                    data-try-delta="-1" aria-label="Restar 5 puntos por ensayo a DRB"><span
                        class="signo-puntos">−</span> Ensayo</button>
            </span>
        </div>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="local" data-points="2"
                    aria-label="Sumar 2 puntos por transformación a DRB"><span
                        class="signo-puntos">+</span> Transformación</button>
                <button class="boton-puntos restar" type="button" data-team="local" data-points="-2"
                    aria-label="Restar 2 puntos por transformación a DRB"><span
                        class="signo-puntos">−</span> Transformación</button>
            </span>
        </div>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="local" data-points="3"
                    aria-label="Sumar 3 puntos por golpe de castigo a DRB"><span
                        class="signo-puntos">+</span> Golpe</button>
                <button class="boton-puntos restar" type="button" data-team="local" data-points="-3"
                    aria-label="Restar 3 puntos por golpe de castigo a DRB"><span
                        class="signo-puntos">−</span> Golpe</button>
            </span>
        </div>
    </section>

    <section class="equipo-control visitante-control" aria-labelledby="titulo-visitante">
        <h2 id="titulo-visitante">BISITARIA</h2>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="visitante" data-points="5" data-try-delta="1"
                    aria-label="Sumar 5 puntos por ensayo al equipo visitante"><span class="signo-puntos">+</span>
                    Ensayo</button>
                <button class="boton-puntos restar" type="button" data-team="visitante" data-points="-5"
                    data-try-delta="-1" aria-label="Restar 5 puntos por ensayo al equipo visitante"><span
                        class="signo-puntos">−</span> Ensayo</button>
            </span>
        </div>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="visitante" data-points="2"
                    aria-label="Sumar 2 puntos por transformación al equipo visitante"><span
                        class="signo-puntos">+</span> Transformación</button>
                <button class="boton-puntos restar" type="button" data-team="visitante" data-points="-2"
                    aria-label="Restar 2 puntos por transformación al equipo visitante"><span
                        class="signo-puntos">−</span> Transformación</button>
            </span>
        </div>
        <div class="fila-puntuacion">
            <span class="acciones-puntuacion">
                <button class="boton-puntos" type="button" data-team="visitante" data-points="3"
                    aria-label="Sumar 3 puntos por golpe de castigo al equipo visitante"><span
                        class="signo-puntos">+</span> Golpe</button>
                <button class="boton-puntos restar" type="button" data-team="visitante" data-points="-3"
                    aria-label="Restar 3 puntos por golpe de castigo al equipo visitante"><span
                        class="signo-puntos">−</span> Golpe</button>
            </span>
        </div>
    </section>
    <div class="restablecer-control">
        <button class="boton-reloj" id="resetear-reloj" type="button">Resetear</button>
    </div>
</aside>
