
// 1. LÓGICA DE NAVEGACIÓN (STORYTELLING)

const overlay = document.getElementById('story-overlay');
const scrollDownBtn = document.getElementById('smart-scroll-btn');

// Función para ir al mapa 
function goToMap() {
    overlay.classList.add('hidden');
    scrollDownBtn.style.display = 'none'; // Ocultar botón flotante al entrar al mapa
    
    // Tiempo para la carga del mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 800);
}

// Función para volver a la historia 
function goToStory() {
    overlay.classList.remove('hidden');
    
    
    overlay.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    scrollDownBtn.style.display = 'flex'; // Mostrar botón flotante de nuevo
}


// El botón flotante de la historia hace scroll hasta el botón del mapa
scrollDownBtn.addEventListener('click', () => {
    document.getElementById('enter-dashboard-btn').scrollIntoView({
        behavior: 'smooth'
    });
});

// Botón para ver el mapa
document.getElementById('enter-dashboard-btn').addEventListener('click', goToMap);

// Botón salir del mapa
document.getElementById('back-to-story-btn').addEventListener('click', goToStory);



// 2. INICIALIZACIÓN DEL MAPA (LEAFLET)

// Centrado en Cancún (Benito Juárez)
const map = L.map('map', {
    zoomControl: false 
}).setView([21.1619, -86.8515], 13);

// Control de zoom en la esquina inferior derecha
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Capa base del mapa (CartoDB Voyager)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
}).addTo(map);



// 3. VARIABLES GLOBALES Y ELEMENTOS DOM

const infoCard = document.getElementById('floating-info-card');
const cardContent = document.getElementById('card-content');
const closeCardBtn = document.getElementById('close-card-btn');

let geoJsonLayer; // Capa de datos
let highlightedLayer = null; // Para saber qué manzana está seleccionada

// Estilos base para los polígonos
const defaultStyle = {
    color: "#10b981", // Borde verde
    weight: 1,
    opacity: 0.6,
    fillOpacity: 0.1 // Casi transparente
};

const highlightStyle = {
    color: '#f59e0b', // Borde naranja al seleccionar
    weight: 3,
    opacity: 1,
    fillOpacity: 0.5
};



// 4. FUNCIONES DE COLOR

// Define los colores según el valor y el tipo de dato
function getColor(d, type) {
    // Escala Verde (Población)
    if (type === 'pob') {
        return d > 500 ? '#006d2c' :
               d > 200 ? '#31a354' :
               d > 100 ? '#74c476' :
               d > 50  ? '#bae4b3' :
                         '#edf8e9';
    }
    // Escala Azul (Vivienda)
    if (type === 'viv') {
        return d > 150 ? '#08519c' :
               d > 100 ? '#3182bd' :
               d > 50  ? '#6baed6' :
               d > 20  ? '#bdd7e7' :
                         '#eff3ff';
    }
    // Escala Azul Agua (Agua Potable)
    if (type === 'agua') {
        return d > 100 ? '#084594' :
               d > 50  ? '#2171b5' :
               d > 20  ? '#6baed6' :
               d > 5   ? '#bdd7e7' :
                         '#eff3ff';
    }
    // Escala Ámbar/Amarillo (Electricidad)
    if (type === 'luz') {
        return d > 100 ? '#b45309' :
               d > 50  ? '#d97706' :
               d > 20  ? '#f59e0b' :
               d > 5   ? '#fcd34d' :
                         '#fffbeb';
    }
    // Escala Roja (Alerta - Sin Drenaje)
    if (type === 'sin_dren') {
        return d > 20 ? '#7f1d1d' : // Muy mal
               d > 10 ? '#b91c1c' :
               d > 5  ? '#ef4444' :
               d > 0  ? '#fca5a5' :
                        '#f0fdf4'; // Bien (Casi nada sin drenaje)
    }
    
    return '#10b981'; 
}

// 5. CARGA DE DATOS (FETCH API)

// Usamos la variable API_URL que definimos en el HTML
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        
        // AQUI EMPIEZA LO NUEVO:
        // CodeIgniter ya nos dio los datos, ahora Leaflet los dibuja
        
        geoJsonLayer = L.geoJSON(data, {
            style: defaultStyle,
            onEachFeature: function (feature, layer) {
                layer.on('click', function (e) {
                    const props = e.target.feature.properties;
                    
                    // Lógica de selección (resaltar manzana)
                    if (highlightedLayer) {
                        const theme = document.getElementById('filtro-tema').value;
                        if (theme === 'none') {
                            geoJsonLayer.resetStyle(highlightedLayer);
                        } else {
                            applyThemeColor(highlightedLayer, theme);
                        }
                    }
                    
                    layer.setStyle(highlightStyle);
                    highlightedLayer = layer;
                    
                    showInfoCard(props);
                });
            }
        }).addTo(map);

        // Inicializamos las gráficas
        initStoryCharts(data.features);

        // 🟢 ESTA ES LA PARTE IMPORTANTE (EL CARGANDO)
        // Como ya terminó de pintar todo lo de arriba, quitamos la pantalla de carga
        const loader = document.getElementById('map-loader');
        if (loader) {
            // Le añadimos la clase que lo hace transparente
            loader.classList.add('loader-hidden');
            
            // Esperamos medio segundo (500ms) a que se desvanezca y lo borramos
            setTimeout(() => { 
                loader.style.display = 'none'; 
            }, 500);
        }

    })
    .catch(error => {
        console.error("Error cargando datos:", error);
        
        // Si algo falla, mostramos el error en la pantalla de carga
        const loader = document.getElementById('map-loader');
        if(loader) {
            loader.innerHTML = '<div style="text-align:center; color:red;"><h3>Error :(</h3><p>No se pudieron cargar los datos.</p></div>';
        }
    });

// 6. GRÁFICAS DEL STORYTELLING 

function initStoryCharts(features) {
    // Variables para acumular los totales de todo el municipio
    let totalPob = 0;
    let totalViv = 0;
    let totalDes = 0;
    let conLuz = 0, conAgua = 0, sinDren = 0;

    // Recorrer todos los polígonos para sumar
    features.forEach(f => {
        const p = f.properties;
        totalPob += p.pobtot || 0;
        totalViv += p.vivtot || 0;
        totalDes += p.viv_des || 0;
        conLuz += p.con_luz || 0;
        conAgua += p.con_agua || 0;
        sinDren += p.sin_dren || 0; 
    });

    // 1. Actualizar el número de Población en la historia
    const popElement = document.getElementById('total-poblacion');
    if (popElement) {
        popElement.innerText = totalPob.toLocaleString('es-MX');
    }

    // 2. Gráfica de Servicios 
    const ctxServicios = document.getElementById('chart-servicios');
    if (ctxServicios) {
        new Chart(ctxServicios, {
            type: 'bar',
            data: {
                labels: ['Con Luz', 'Con Agua', 'Sin Drenaje'],
                datasets: [{
                    label: 'Viviendas',
                    data: [conLuz, conAgua, sinDren],
                    backgroundColor: ['#fbbf24', '#3b82f6', '#ef4444'], // Amarillo, Azul, Rojo
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // 3. Gráfica de Vivienda
    const ctxVivienda = document.getElementById('chart-vivienda');
    if (ctxVivienda) {
        new Chart(ctxVivienda, {
            type: 'doughnut',
            data: {
                labels: ['Habitadas', 'Desocupadas'],
                datasets: [{
                    data: [totalViv - totalDes, totalDes],
                    backgroundColor: ['#10b981', '#e5e7eb'], // Verde, Gris
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', 
                plugins: { 
                    legend: { position: 'bottom' } 
                }
            }
        });
    }
}

// 7. FUNCIONES AUXILIARES DEL MAPA

// Función para aplicar color temático a una capa individual
// Se usa al cambiar el filtro o al des-seleccionar una manzana
function applyThemeColor(layer, theme) {
    let val = layer.feature.properties[theme];
    let type = 'pob'; 
    
    // Determinar qué paleta usar según el tema
    if (theme.includes('viv')) type = 'viv';
    if (theme === 'con_agua') type = 'agua';
    if (theme === 'con_luz') type = 'luz';
    if (theme === 'sin_dren') type = 'sin_dren';
    
    layer.setStyle({
        fillColor: getColor(val, type),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    });
}

// Función para mostrar la tarjeta flotante con datos
function showInfoCard(props) {
    // Formateador de números con comas (ej. 1,234)
    const fmt = (n) => n ? n.toLocaleString('es-MX') : '0';

    const html = `
        <div class="info-stat">
            <div class="info-label">Ubicación</div>
            <div class="info-value highlight" style="font-size:1rem;">${props.cvegeo}</div>
            <div style="font-size:0.8rem; color:#666;">AGEB: ${props.ageb}</div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
            <div style="background:#f0fdf4; padding:10px; border-radius:8px;">
                <div class="info-label" style="color:#166534;">Población</div>
                <div class="info-value">${fmt(props.pobtot)}</div>
            </div>
            <div style="background:#eff6ff; padding:10px; border-radius:8px;">
                <div class="info-label" style="color:#1e40af;">Viviendas</div>
                <div class="info-value">${fmt(props.vivtot)}</div>
            </div>
        </div>

        <div style="margin-top:15px;">
            <div class="info-label" style="margin-bottom:8px;">Servicios Básicos (Viviendas)</div>
            
            <div class="service-row">
                <span><i class="fas fa-bolt" style="color:#f59e0b;"></i> Con Luz</span>
                <strong>${fmt(props.con_luz)}</strong>
            </div>
            <div class="service-row">
                <span><i class="fas fa-tint" style="color:#3b82f6;"></i> Con Agua</span>
                <strong>${fmt(props.con_agua)}</strong>
            </div>
            <div class="service-row">
                <span><i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> SIN Drenaje</span>
                <strong>${fmt(props.sin_dren)}</strong>
            </div>
        </div>
    `;
    
    cardContent.innerHTML = html;
    infoCard.style.display = 'block';
    
    // Evento para cerrar la tarjeta
    closeCardBtn.onclick = () => {
        infoCard.style.display = 'none';
        // Al cerrar, quitamos el resaltado naranja
        if (highlightedLayer) {
            const theme = document.getElementById('filtro-tema').value;
            if (theme === 'none') geoJsonLayer.resetStyle(highlightedLayer);
            else applyThemeColor(highlightedLayer, theme);
            
            highlightedLayer = null;
        }
    };
}

// 8. CONTROLADORES DE LA BARRA LATERAL (FILTROS)

const filtroAgeb = document.getElementById('filtro-ageb');
const themeSelect = document.getElementById('filtro-tema');
const searchInput = document.getElementById('cvegeo-search');
const searchButton = document.getElementById('search-button');
const resetButton = document.getElementById('reset-button');

// FILTRO DE AGEB (Al escribir)
filtroAgeb.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    
    geoJsonLayer.eachLayer(layer => {
        // Mostrar solo si el AGEB coincide (o si el campo está vacío)
        const show = val === '' || layer.feature.properties.ageb.includes(val);
        
        if (show) {
            // Si se muestra, debemos decidir qué estilo aplicarle 
            const theme = themeSelect.value;
            if (theme === 'none') {
                layer.setStyle({ opacity: 0.6, fillOpacity: 0.1 });
            } else {
                applyThemeColor(layer, theme);
            }
        } else {
            // Si no coincide, lo ocultamos totalmente
            layer.setStyle({ opacity: 0, fillOpacity: 0 });
        }
    });
});

// SELECTOR DE TEMA 
themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    
    geoJsonLayer.eachLayer(layer => {
        // Solo cambiamos el color si la capa está visible (opacity > 0)
        // Esto respeta el filtro de AGEB
        if (layer.options.opacity === 0) return;
        
        if (theme === 'none') {
            layer.setStyle(defaultStyle);
        } else {
            applyThemeColor(layer, theme);
        }
    });
});

// BÚSQUEDA POR CVEGEO
function handleSearch() {
    const val = searchInput.value.trim();
    if (!val) return;
    
    let found = null;
    
    // Buscamos la capa exacta
    geoJsonLayer.eachLayer(l => {
        if (l.feature.properties.cvegeo === val) found = l;
    });
    
    if (found) {
        // Si había uno resaltado, lo restauramos
        const theme = themeSelect.value;
        if (highlightedLayer) {
             if (theme === 'none') geoJsonLayer.resetStyle(highlightedLayer);
             else applyThemeColor(highlightedLayer, theme);
        }
        
        // Resaltamos el nuevo
        found.setStyle(highlightStyle);
        highlightedLayer = found;
        
        // Redirige hacia él
        map.flyToBounds(found.getBounds(), { maxZoom: 18 });
        
        // Mostramos sus datos
        showInfoCard(found.feature.properties);
    } else {
        alert('No se encontró ninguna manzana con ese CVEGEO.');
    }
}

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => { if(e.key==='Enter') handleSearch(); });

// BOTÓN RESTABLECER
resetButton.addEventListener('click', () => {
    // Limpiar inputs
    filtroAgeb.value = '';
    searchInput.value = '';
    themeSelect.value = 'none';
    
    // Restaurar estilos de todas las capas
    geoJsonLayer.eachLayer(layer => layer.setStyle(defaultStyle));
    
    // Volver a la vista inicial de Cancún
    map.setView([21.1619, -86.8515], 13);
    
    // Ocultar tarjeta
    infoCard.style.display = 'none';
    highlightedLayer = null;
});