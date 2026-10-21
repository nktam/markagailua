const estadoConexion=document.querySelector('#estado-conexion');
const botonAlternarReloj=document.querySelector('#alternar-reloj');
const iconoReloj=document.querySelector('#icono-reloj');
const textoReloj=document.querySelector('#texto-reloj');
const botonPantallaCompleta=document.querySelector('#pantalla-completa');
const selectorVisitante=document.querySelector('#seleccionar-visitante');
const tituloVisitante=document.querySelector('#titulo-visitante');
const csrfToken=document.querySelector('input[name="csrf_token"]')?.value;
const urlApi=document.body.dataset.apiUrl||'api.php';
const esPaginaMovil=document.body.classList.contains('pagina-movil');
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
let relojEnMarcha=false;

function mostrarError(mensaje) {
    if(!estadoConexion) return;

    estadoConexion.textContent=mensaje;
    estadoConexion.hidden=false;
}

function aplicarEstado(estado) {
    relojEnMarcha=estado.running;
    if(botonAlternarReloj) {
        botonAlternarReloj.classList.toggle('reloj-en-marcha', relojEnMarcha);
        iconoReloj.textContent=relojEnMarcha? 'Ⅱ':'▶';
        textoReloj.textContent=relojEnMarcha? 'Pausar':'Iniciar';
    }

    if(selectorVisitante) selectorVisitante.value=estado.visitorLogo;
    const nombre=nombresVisitante[estado.visitorLogo];
    if(nombre && tituloVisitante) tituloVisitante.textContent=nombre;
}

function recibirEstado(evento) {
    aplicarEstado(evento.detail.estado);
}

async function consultarEstado() {
    try {
        const response=await fetch(urlApi, {cache: 'no-store'});
        const estado=await response.json();
        if(!response.ok) throw new Error(estado.error||'No se pudo consultar el marcador.');
        aplicarEstado(estado);
        if(estadoConexion) estadoConexion.hidden=true;
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
        document.dispatchEvent(new CustomEvent('marcador:estado', {detail: {estado: resultado, accion: datos}}));
        if(estadoConexion) estadoConexion.hidden=true;
    } catch(error) {
        mostrarError(error.message||'No se pudo guardar el cambio.');
    }
}

function actualizarBotonPantallaCompleta() {
    const pantallaCompleta=Boolean(document.fullscreenElement);
    botonPantallaCompleta.textContent=pantallaCompleta? 'Salir de pantalla completa':'Pantalla completa';
    botonPantallaCompleta.setAttribute('aria-pressed', pantallaCompleta.toString());
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

if(botonAlternarReloj) {
    botonAlternarReloj.addEventListener('click', () => {
        enviarAccion({action: relojEnMarcha? 'pause':'start'});
    });
}

const botonCambiarParte=document.querySelector('#cambiar-parte');
if(botonCambiarParte) {
    botonCambiarParte.addEventListener('click', () => enviarAccion({action: 'half'}));
}

const botonResetearReloj=document.querySelector('#resetear-reloj');
if(botonResetearReloj) {
    botonResetearReloj.addEventListener('click', () => {
        if(window.confirm('¿Seguro que quieres reiniciar todo el marcador?')) {
            enviarAccion({action: 'reset'});
        }
    });
}

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

if(selectorVisitante) {
    selectorVisitante.addEventListener('change', () => {
        enviarAccion({action: 'visitor', logo: selectorVisitante.value});
    });
}

document.addEventListener('marcador:estado', recibirEstado);
if(esPaginaMovil) consultarEstado();
