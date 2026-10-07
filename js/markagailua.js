const puntuaciones={local: 0, visitante: 0};
const ensayos={local: 0, visitante: 0};
const reloj=document.querySelector('.reloj');
const periodo=document.querySelector('.periodo');
const estadoReloj=document.querySelector('#estado-reloj');
const videoEnsayo=document.querySelector('#video-ensayo');
let segundosTranscurridos=0;
let intervaloReloj=null;
let segundaParte=false;

videoEnsayo.addEventListener('ended', () => {
    videoEnsayo.hidden=true;
    videoEnsayo.currentTime=0;
});

function reproducirVideoEnsayo() {
    videoEnsayo.hidden=false;
    videoEnsayo.currentTime=0;
    const reproduccion=videoEnsayo.play();
    if(reproduccion) {
        reproduccion.catch((error) => {
            videoEnsayo.hidden=true;
            console.error('No se pudo reproducir el vídeo del ensayo local.', error);
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
}

document.querySelector('#iniciar-reloj').addEventListener('click', () => {
    if(intervaloReloj!==null) return;
    estadoReloj.textContent='En marcha';
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
    estadoReloj.textContent='En pausa';
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
    estadoReloj.textContent='En pausa';
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
        if(equipo==='local' && cambioEnsayos>0) reproducirVideoEnsayo();
    });
});
