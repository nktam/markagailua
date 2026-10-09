const puntuaciones={local: 0, visitante: 0};
const ensayos={local: 0, visitante: 0};
const reloj=document.querySelector('.reloj');
const periodo=document.querySelector('.periodo');
const botonPantallaCompleta=document.querySelector('#pantalla-completa');
const anchoMarcador=document.querySelector('#ancho-marcador');
const altoMarcador=document.querySelector('#alto-marcador');
const videoEnsayo=document.querySelector('#video-ensayo');
const origenVideoEnsayo=document.querySelector('#video-ensayo source');
const videosEnsayo={
    local: 'img/Entseguadrb.mp4',
    visitante: 'img/EntseguaBisitaria.mp4'
};
let segundosTranscurridos=0;
let intervaloReloj=null;
let segundaParte=false;

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

function actualizarBotonPantallaCompleta() {
    const pantallaCompleta=Boolean(document.fullscreenElement);
    botonPantallaCompleta.textContent=pantallaCompleta? 'Salir de pantalla completa':'Pantalla completa';
    botonPantallaCompleta.setAttribute('aria-pressed', pantallaCompleta.toString());
}

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
        }
    });
    document.addEventListener('fullscreenchange', actualizarBotonPantallaCompleta);
} else {
    botonPantallaCompleta.disabled=true;
    botonPantallaCompleta.title='Este navegador no permite la pantalla completa en esta página.';
}

videoEnsayo.addEventListener('ended', () => {
    videoEnsayo.hidden=true;
    videoEnsayo.currentTime=0;
});

function reproducirVideoEnsayo(equipo='local') {
    const fuente=videosEnsayo[equipo] || videosEnsayo.local;
    origenVideoEnsayo.setAttribute('src', fuente);
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

const selectorVisitante=document.querySelector('#seleccionar-visitante');
const insigniaVisitante=document.querySelector('#insignia-visitante');
const nombreVisitante=document.querySelector('#nombre-visitante');

selectorVisitante.addEventListener('change', () => {
    const equipo=selectorVisitante.options[selectorVisitante.selectedIndex].textContent;
    insigniaVisitante.src=`img/equipos/${encodeURIComponent(selectorVisitante.value)}`;
    insigniaVisitante.alt=`Escudo de ${equipo}`;
    nombreVisitante.textContent=equipo;
});

function actualizarReloj() {
    const minutos=Math.floor(segundosTranscurridos/60).toString().padStart(2, '0');
    const segundos=(segundosTranscurridos%60).toString().padStart(2, '0');
    reloj.textContent=`${minutos}:${segundos}`;
    reloj.classList.toggle('tiempo-excedido', segundosTranscurridos>(segundaParte? 80:40)*60);
}

document.querySelector('#iniciar-reloj').addEventListener('click', () => {
    if(intervaloReloj!==null) return;
    intervaloReloj=window.setInterval(() => {
        segundosTranscurridos+=1;
        actualizarReloj();
    }, 1000);
});

document.querySelector('#pausar-reloj').addEventListener('click', () => {
    if(intervaloReloj!==null) {
        window.clearInterval(intervaloReloj);
        intervaloReloj=null;
    }
});

document.querySelector('#resetear-reloj').addEventListener('click', () => {
    if(!window.confirm('¿Seguro que quieres reiniciar todo el marcador?')) return;

    if(intervaloReloj!==null) {
        window.clearInterval(intervaloReloj);
        intervaloReloj=null;
    }

    Object.keys(puntuaciones).forEach((equipo) => {
        puntuaciones[equipo]=0;
        ensayos[equipo]=0;
        document.querySelector(`#puntos-${equipo}`).textContent='0';
        document.querySelector(`#ensayos-${equipo}`).textContent='0';
    });

    segundaParte=false;
    periodo.textContent='1. ZATIA';
    segundosTranscurridos=0;
    actualizarReloj();
});

document.querySelector('#cambiar-parte').addEventListener('click', () => {
    segundaParte=!segundaParte;
    segundosTranscurridos=segundaParte? 40*60:0;
    periodo.textContent=segundaParte? '2. ZATIA':'1. ZATIA';
    actualizarReloj();
});

document.querySelectorAll('[data-team][data-points]').forEach((boton) => {
    boton.addEventListener('click', () => {
        const equipo=boton.dataset.team;
        puntuaciones[equipo]=Math.max(0, puntuaciones[equipo]+Number(boton.dataset.points));
        const cambioEnsayos=Number(boton.dataset.tryDelta||0);
        ensayos[equipo]=Math.max(0, ensayos[equipo]+cambioEnsayos);
        document.querySelector(`#puntos-${equipo}`).textContent=puntuaciones[equipo];
        document.querySelector(`#ensayos-${equipo}`).textContent=ensayos[equipo];
        if(cambioEnsayos>0) reproducirVideoEnsayo(equipo);
    });
});
