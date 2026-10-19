const reloj=document.querySelector('.reloj');
const periodo=document.querySelector('.periodo');
const estadoConexion=document.querySelector('#estado-conexion');
const botonAlternarReloj=document.querySelector('#alternar-reloj');
const iconoReloj=document.querySelector('#icono-reloj');
const textoReloj=document.querySelector('#texto-reloj');
const botonPantallaCompleta=document.querySelector('#pantalla-completa');
const videoEnsayo=document.querySelector('#video-ensayo');
const origenVideoEnsayo=document.querySelector('#video-ensayo source');
const selectorVisitante=document.querySelector('#seleccionar-visitante');
const insigniaVisitante=document.querySelector('#insignia-visitante');
const nombreVisitante=document.querySelector('#nombre-visitante');
const esGestor=document.body.dataset.manager==='true';
const esStreaming=document.body.classList.contains('pagina-streaming');
const csrfToken=document.querySelector('input[name="csrf_token"]')?.value;
const raizRecursos=document.body.dataset.assetRoot||'';
const urlApi=document.body.dataset.apiUrl||'api.php';
const videosEnsayo={
    local: `${raizRecursos}img/Entseguadrb.mp4`,
    visitor: `${raizRecursos}img/EntseguaBisitaria.mp4`
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

if(videoEnsayo) {
    videoEnsayo.addEventListener('ended', () => {
        videoEnsayo.hidden=true;
        videoEnsayo.currentTime=0;
    });
}

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

function actualizarBotonReloj() {
    if(!botonAlternarReloj) return;

    botonAlternarReloj.classList.toggle('reloj-en-marcha', relojEnMarcha);
    iconoReloj.textContent=relojEnMarcha? 'Ⅱ':'▶';
    textoReloj.textContent=relojEnMarcha? 'Pausar':'Iniciar';
}

if(botonPantallaCompleta) {
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
    if(periodo) periodo.textContent=segundaParte? '2. ZATIA':'1. ZATIA';
    segundosBase=estado.elapsedSeconds;
    instanteBase=performance.now();
    relojEnMarcha=estado.running;
    actualizarBotonReloj();
    renderizarReloj();

    const equipo=nombresVisitante[estado.visitorLogo];
    insigniaVisitante.src=`${raizRecursos}img/equipos/${encodeURIComponent(estado.visitorLogo)}`;
    insigniaVisitante.alt=equipo? `Escudo de ${equipo}`:'Escudo del equipo visitante';
    if(equipo) nombreVisitante.textContent=esStreaming? equipo.slice(0, 3):equipo;
    if(selectorVisitante) {
        selectorVisitante.value=estado.visitorLogo;
        if(equipo) document.querySelector('#titulo-visitante').textContent=equipo;
    }
}

async function consultarEstado() {
    try {
        const response=await fetch(urlApi, {cache: 'no-store'});
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
        const response=await fetch(urlApi, {
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
        if(datos.action==='score' && datos.tries>0) {
            reproducirVideoEnsayo(datos.team);
        }
        estadoConexion.hidden=true;
    } catch(error) {
        mostrarError(error.message||'No se pudo guardar el cambio.');
    }
}

if(esGestor) {
    botonAlternarReloj.addEventListener('click', () => {
        enviarAccion({action: relojEnMarcha? 'pause':'start'});
    });
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
