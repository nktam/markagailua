const reloj=document.querySelector('.reloj');
const periodo=document.querySelector('.periodo');
const estadoConexion=document.querySelector('#estado-conexion');
const videoEnsayo=document.querySelector('#video-ensayo');
const origenVideoEnsayo=document.querySelector('#video-ensayo source');
const insigniaVisitante=document.querySelector('#insignia-visitante');
const nombreVisitante=document.querySelector('#nombre-visitante');
const esStreaming=document.body.classList.contains('pagina-streaming');
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
    if(!videoEnsayo || !origenVideoEnsayo) return;

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
    if(!estadoConexion) return;

    estadoConexion.textContent=mensaje;
    estadoConexion.hidden=false;
}

function renderizarReloj() {
    if(!reloj) return;

    const transcurrido=segundosBase+(relojEnMarcha? Math.floor((performance.now()-instanteBase)/1000):0);
    const minutos=Math.floor(transcurrido/60).toString().padStart(2, '0');
    const segundos=(transcurrido%60).toString().padStart(2, '0');
    reloj.textContent=`${minutos}:${segundos}`;
    reloj.classList.toggle('tiempo-excedido', transcurrido>(segundaParte? 80:40)*60);
}

function aplicarEstado(estado) {
    const puntosLocal=document.querySelector('#puntos-local');
    const ensayosLocal=document.querySelector('#ensayos-local');
    const puntosVisitante=document.querySelector('#puntos-visitante');
    const ensayosVisitante=document.querySelector('#ensayos-visitante');

    if(puntosLocal) puntosLocal.textContent=estado.localPoints;
    if(ensayosLocal) ensayosLocal.textContent=estado.localTries;
    if(puntosVisitante) puntosVisitante.textContent=estado.visitorPoints;
    if(ensayosVisitante) ensayosVisitante.textContent=estado.visitorTries;
    actualizarTarjetas('local', estado.localYellowCards, estado.localRedCards);
    actualizarTarjetas('visitante', estado.visitorYellowCards, estado.visitorRedCards);
    segundaParte=estado.secondHalf;
    if(periodo) periodo.textContent=segundaParte? '2. ZATIA':'1. ZATIA';
    segundosBase=estado.elapsedSeconds;
    instanteBase=performance.now();
    relojEnMarcha=estado.running;
    renderizarReloj();

    const equipo=nombresVisitante[estado.visitorLogo];
    if(insigniaVisitante) {
        insigniaVisitante.src=`${raizRecursos}img/equipos/${encodeURIComponent(estado.visitorLogo)}`;
        insigniaVisitante.alt=equipo? `Escudo de ${equipo}`:'Escudo del equipo visitante';
    }
    if(equipo && nombreVisitante) nombreVisitante.textContent=esStreaming? equipo.slice(0, 3):equipo;
}

function actualizarTarjetas(equipo, amarillas, rojas) {
    const contenedor=document.querySelector(`#tarjetas-${equipo}`);
    if(!contenedor) return;

    contenedor.replaceChildren();
    const tarjetas=[
        {color: 'amarilla', cantidad: amarillas, nombre: 'amarilla'},
        {color: 'roja', cantidad: rojas, nombre: 'roja'}
    ];
    const total=tarjetas.reduce((suma, tarjeta) => suma+tarjeta.cantidad, 0);
    contenedor.setAttribute('aria-label', total? `${total} ${total===1? 'tarjeta':'tarjetas'}`:'');

    tarjetas.forEach(({color, cantidad, nombre}) => {
        if(cantidad<1) return;

        const badge=document.createElement('span');
        badge.className=`tarjeta tarjeta-${color}`;
        badge.setAttribute('aria-label', `${cantidad} ${nombre}${cantidad===1? '':'s'}`);
        badge.textContent=cantidad>1? cantidad.toString():'';
        contenedor.append(badge);
    });
}

async function consultarEstado() {
    try {
        const response=await fetch(urlApi, {cache: 'no-store'});
        const estado=await response.json();
        if(!response.ok) throw new Error(estado.error||'No se pudo consultar el marcador.');
        aplicarEstado(estado);
        if(estadoConexion) estadoConexion.hidden=true;
        document.dispatchEvent(new CustomEvent('marcador:estado', {detail: {estado}}));
    } catch(error) {
        mostrarError(error.message||'Se perdió la conexión con el servidor.');
    } finally {
        window.setTimeout(consultarEstado, 1000);
    }
}

document.addEventListener('marcador:estado', (evento) => {
    const {estado, accion}=evento.detail;
    aplicarEstado(estado);
    if(accion?.action==='score' && accion.tries>0) reproducirVideoEnsayo(accion.team);
});

window.setInterval(renderizarReloj, 250);
consultarEstado();
