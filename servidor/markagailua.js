const reloj=document.querySelector('.reloj');
const periodo=document.querySelector('.periodo');
const estadoConexion=document.querySelector('#estado-conexion');
const botonPantallaCompleta=document.querySelector('#pantalla-completa');
const anchoMarcador=document.querySelector('#ancho-marcador');
const altoMarcador=document.querySelector('#alto-marcador');
const videoEnsayo=document.querySelector('#video-ensayo');
const origenVideoEnsayo=document.querySelector('#video-ensayo source');
const selectorVisitante=document.querySelector('#seleccionar-visitante');
const insigniaVisitante=document.querySelector('#insignia-visitante');
const nombreVisitante=document.querySelector('#nombre-visitante');
const esGestor=document.body.dataset.manager==='true';
const csrfToken=document.querySelector('input[name="csrf_token"]')?.value;
const videosEnsayo={
    local: 'img/Entseguadrb.mp4',
    visitor: 'img/EntseguaBisitaria.mp4'
};
const nombresVisitante={
    'Bisitaria.jpg': 'BISITARIA',
    'Betsaide Elorrio RT.jpg': 'BETSAIDE ELORRIO RT',
    'Cormorán RC.jpg': 'CORMORÁN RC',
    'Durango RT.jpg': 'DURANGO RT',
    'Gaztedi RT.jpg': 'GAZTEDI RT',
    'Geurea RT.jpg': 'GEUREA RT',
    'Hernani RCE.jpg': 'HERNANI RCE',
    'La Unica RT.jpg': 'LA UNICA RT',
    'Pasek Belenos.jpg': 'PASEK BELENOS',
    'RC Rioja.jpeg': 'RC RIOJA',
    'Rugby Aranda Freund.jpg': 'RUGBY ARANDA FREUND',
    'Txingudi RC.png': 'TXINGUDI RC',
    'Universitario Bilbao Rugby.jpg': 'UNIVERSITARIO BILBAO',
    'Uribealdea RKE.jpg': 'URIBEALEA RKE'
};
let segundosBase=0;
let instanteBase=performance.now();
let relojEnMarcha=false;
let segundaParte=false;
let ultimoEvento=null;

videoEnsayo.addEventListener('ended', () => {
    videoEnsayo.hidden=true;
    videoEnsayo.currentTime=0;
});

function reproducirVideoEnsayo(equipo) {
    origenVideoEnsayo.setAttribute('src', videosEnsayo[equipo]);
    videoEnsayo.load();
    videoEnsayo.hidden=false;
    videoEnsayo.currentTime=0;
    const reproduccion=videoEnsayo.play();
    if(reproduccion) {
        reproduccion.catch((error) => {
            videoEnsayo.hidden=true;
            console.error(`No se pudo reproducir el vídeo del ensayo ${equipo}.`, error);
        });
    }
}

function mostrarError(mensaje) {
    estadoConexion.textContent=mensaje;
    estadoConexion.hidden=false;
}

function actualizarBotonPantallaCompleta() {
    const pantallaCompleta=Boolean(document.fullscreenElement);
    botonPantallaCompleta.textContent=pantallaCompleta? 'Salir de pantalla completa':'Pantalla completa';
    botonPantallaCompleta.setAttribute('aria-pressed', pantallaCompleta.toString());
}

if(botonPantallaCompleta) {
    function actualizarTamanoMarcador() {
        const ancho=Number(anchoMarcador.value);
        const alto=Number(altoMarcador.value);
        if(!Number.isSafeInteger(ancho) || ancho<1 || ancho>10000
            || !Number.isSafeInteger(alto) || alto<1 || alto>10000) return;

        document.documentElement.style.setProperty('--scoreboard-width', `${ancho}px`);
        document.documentElement.style.setProperty('--scoreboard-height', `${alto}px`);
    }

    anchoMarcador.addEventListener('input', actualizarTamanoMarcador);
    altoMarcador.addEventListener('input', actualizarTamanoMarcador);
    actualizarTamanoMarcador();

    if(document.fullscreenEnabled && document.documentElement.requestFullscreen) {
        botonPantallaCompleta.addEventListener('click', async () => {
            try {
                if(document.fullscreenElement) {
                    await document.exitFullscreen();
                } else {
                    await document.documentElement.requestFullscreen();
                }
            } catch(error) {
                console.error('No se pudo cambiar el modo de pantalla completa.', error);
                mostrarError('El navegador no ha permitido cambiar a pantalla completa.');
            }
        });
        document.addEventListener('fullscreenchange', actualizarBotonPantallaCompleta);
    } else {
        botonPantallaCompleta.disabled=true;
        botonPantallaCompleta.title='Este navegador no permite la pantalla completa en esta página.';
    }
}

function renderizarReloj() {
    const transcurrido=segundosBase+(relojEnMarcha? Math.floor((performance.now()-instanteBase)/1000):0);
    const minutos=Math.floor(transcurrido/60).toString().padStart(2, '0');
    const segundos=(transcurrido%60).toString().padStart(2, '0');
    reloj.textContent=`${minutos}:${segundos}`;
    reloj.classList.toggle('tiempo-excedido', transcurrido>(segundaParte? 80:40)*60);
}

function aplicarEstado(estado) {
    document.querySelector('#puntos-local').textContent=estado.localPoints;
    document.querySelector('#ensayos-local').textContent=estado.localTries;
    document.querySelector('#puntos-visitante').textContent=estado.visitorPoints;
    document.querySelector('#ensayos-visitante').textContent=estado.visitorTries;
    segundaParte=estado.secondHalf;
    periodo.textContent=segundaParte? '2. ZATIA':'1. ZATIA';
    segundosBase=estado.elapsedSeconds;
    instanteBase=performance.now();
    relojEnMarcha=estado.running;
    renderizarReloj();

    const equipo=nombresVisitante[estado.visitorLogo];
    insigniaVisitante.src=`img/equipos/${encodeURIComponent(estado.visitorLogo)}`;
    insigniaVisitante.alt=equipo? `Escudo de ${equipo}`:'Escudo del equipo visitante';
    if(equipo) nombreVisitante.textContent=equipo;
    if(selectorVisitante) {
        selectorVisitante.value=estado.visitorLogo;
        if(equipo) document.querySelector('#titulo-visitante').textContent=equipo;
    }

    if(ultimoEvento===null) {
        ultimoEvento=estado.eventId;
    } else if(estado.eventId!==ultimoEvento) {
        ultimoEvento=estado.eventId;
        if(estado.lastTryTeam) reproducirVideoEnsayo(estado.lastTryTeam);
    }
}

async function consultarEstado() {
    try {
        const response=await fetch('api.php', {cache: 'no-store'});
        const estado=await response.json();
        if(!response.ok) throw new Error(estado.error||'No se pudo consultar el marcador.');
        aplicarEstado(estado);
        estadoConexion.hidden=true;
    } catch(error) {
        mostrarError(error.message||'Se perdió la conexión con el servidor.');
    } finally {
        window.setTimeout(consultarEstado, 1000);
    }
}

async function enviarAccion(datos) {
    try {
        const response=await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(datos)
        });
        const resultado=await response.json();
        if(!response.ok) throw new Error(resultado.error||'No se pudo guardar el cambio.');
        aplicarEstado(resultado);
        estadoConexion.hidden=true;
    } catch(error) {
        mostrarError(error.message||'No se pudo guardar el cambio.');
    }
}

if(esGestor) {
    document.querySelector('#iniciar-reloj').addEventListener('click', () => enviarAccion({action: 'start'}));
    document.querySelector('#pausar-reloj').addEventListener('click', () => enviarAccion({action: 'pause'}));
    document.querySelector('#cambiar-parte').addEventListener('click', () => enviarAccion({action: 'half'}));

    document.querySelector('#resetear-reloj').addEventListener('click', () => {
        if(window.confirm('¿Seguro que quieres reiniciar todo el marcador?')) {
            enviarAccion({action: 'reset'});
        }
    });

    document.querySelectorAll('[data-team][data-points]').forEach((boton) => {
        boton.addEventListener('click', () => {
            enviarAccion({
                action: 'score',
                team: boton.dataset.team==='visitante'? 'visitor':'local',
                points: Number(boton.dataset.points),
                tries: Number(boton.dataset.tryDelta||0)
            });
        });
    });

    selectorVisitante.addEventListener('change', () => {
        enviarAccion({action: 'visitor', logo: selectorVisitante.value});
    });
}

window.setInterval(renderizarReloj, 250);
consultarEstado();
