<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vivienda y Hábitat - Benito Juárez</title>

    <!--Librerías Externas -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Diseño -->
   
    <link rel="stylesheet" href="<?= base_url('css/estilos_mapa.css') ?>">
</head>
<body>

    <!-- Header -->
    <header class="main-header">
        <img src="<?= base_url('img/logo_implan.png') ?>" alt="IMPLAN Benito Juárez" class="header-logo">
    </header>

    <!-- Botón de navegación -->
    <button id="smart-scroll-btn" class="scroll-down-btn" title="Ir al final">
        <i class="fas fa-chevron-down"></i>
    </button>

    <!-- Storytelling -->
    <div id="story-overlay">
        
        <!-- Banner -->
        <div class="story-header">
            <div class="story-header-content">
                <span class="story-tag">VIVIENDA Y HÁBITAT URBANO</span>
                <h1 class="story-title">Evolución Urbana de Cancún<br>y Retos de Vivienda</h1>
                <p class="story-intro">
                    La ciudad de Cancún se fundó en 1975 pensada como un proyecto turístico destinado a ser una fuente de ingresos importante para la nación. El proyecto se llevó a cabo y desde entonces, la mancha urbana ha crecido exponencialmente.
                </p>
            </div>
        </div>

        <div class="story-container">
            
            <!-- Sección 1: Mancha Urbana -->
            <div class="story-section" style="margin-top: 40px;">
                <div class="story-content">
                    <div class="section-title"><i class="fas fa-map-marked-alt"></i> Mancha Urbana</div>
                    <p class="story-text">
                        El incremento poblacional ha consolidado viviendas por toda la ciudad, ubicándose en zonas cada vez más alejadas del centro de la ciudad. Esta mancha urbana es el resultado del desplazamiento de las viviendas habitadas a ubicaciones cada vez más alejadas.
                    </p>
                    <div class="indicator-box">
                        <div class="indicator-label">Indicadores</div>
                        <span class="indicator-value">Mancha urbana</span>
                        <span class="indicator-value">Viviendas totales</span>
                        <div class="indicator-label" style="margin-top: 10px;">Visualización</div>
                        <span class="indicator-viz">Mapa de cambio de uso de suelo y coroplético</span>
                    </div>
                </div>
                <div class="story-image-container story-visual-container">
                    <!-- Dato de población -->
                    <div>
                        
                        <span id="total-poblacion" class="big-number">Cargando...</span>
                        <div class="big-number-label">Población Total Estimada</div>
                    </div>
                </div>
            </div>

            <!-- Sección 2: Infraestructura -->
            <div class="story-section reverse">
                <div class="story-content">
                    <div class="section-title"><i class="fas fa-tree"></i> Infraestructura</div>
                    <p class="story-text">
                        La infraestructura de Cancún como las calles y los parques son elementos físicos que constituyen una red que sostiene la vida cotidiana y determinan en gran medida el bienestar urbano.
                    </p>
                    <div class="indicator-box">
                        <div class="indicator-label">Indicador</div>
                        <span class="indicator-value">Infraestructura urbana, cantidad de espacios públicos y áreas verdes</span>
                        <div class="indicator-label" style="margin-top: 10px;">Visualización</div>
                        <span class="indicator-viz">Mapa de líneas y mapa coroplético</span>
                    </div>
                </div>
                <div class="story-image-container">
                    <!-- IMAGEN: Infraestructura-->
                    <img src="<?= base_url('img/infraestructura.jpg') ?>" alt="Infraestructura" class="story-image">
                </div>
            </div>

            <!-- Sección 3: Servicios -->
            <div class="story-section">
                <div class="story-content">
                    <div class="section-title"><i class="fas fa-faucet"></i> Servicios Públicos</div>
                    <p class="story-text">
                        Esta mancha urbana nos exige pensar en diseños para una planeación urbana eficiente y económicamente sostenible con la infraestructura adecuada de los servicios públicos como agua potable, drenaje y acceso a energía eléctrica.
                    </p>
                    <div class="indicator-box">
                        <div class="indicator-label">Indicadores</div>
                        <span class="indicator-value">• % de viviendas con/sin energía eléctrica</span>
                        <span class="indicator-value">• % de viviendas con/sin agua potable</span>
                        <span class="indicator-value">• % de viviendas con/sin drenaje</span>
                    </div>
                </div>
                <div class="story-image-container story-visual-container">
                    <!-- Gráfica de Servicio -->
                    <canvas id="chart-servicios"></canvas>
                </div>
            </div>

            <!-- Sección 4: Estado de Vivienda -->
            <div class="story-section reverse">
                <div class="story-content">
                    <div class="section-title"><i class="fas fa-home"></i> Dinámica de la Vivienda</div>
                    <p class="story-text">
                        Así como en todas las ciudades, la estructura social y económica de Cancún refleja el patrón de tenencia de la vivienda. Aún si el número de viviendas ha aumentado, una proporción importante permanece desocupada.
                    </p>
                    <div class="indicator-box">
                        <div class="indicator-label">Indicadores</div>
                        <span class="indicator-value">• Estado de la vivienda (propia, rentada)</span>
                        <span class="indicator-value">• Costo de la vivienda</span>
                        <span class="indicator-value">• % de viviendas desocupadas</span>
                        <span class="indicator-value">• Tasa de cambio poblacional 2010-2020</span>
                    </div>
                </div>
                <div class="story-image-container story-visual-container">
                    <!-- Gráfica de vivienda -->
                    <div style="width: 300px;">
                        <canvas id="chart-vivienda"></canvas>
                    </div>
                </div>
            </div>

            <div class="enter-button-container">
                <button id="enter-dashboard-btn" class="enter-btn">
                    Explorar el Tablero Interactivo <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Tablero del mapa -->
    <div class="dashboard-container">
        
        <!-- Tablero filtro -->
        <div class="sidebar-dark">
            <div class="back-container">
                <button id="back-to-story-btn" class="back-btn" title="Volver a Historia">
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
            <div class="app-title"><i class="fas fa-map-marked-alt"></i> Tablero COATI</div>
            
            <div class="sidebar-section-title">Explorador de Datos</div>
            
            <div class="search-container">
                <input type="text" id="cvegeo-search" class="search-input" placeholder="Buscar CVEGEO...">
                <button id="search-button" class="search-btn"><i class="fas fa-search"></i></button> 
            </div>

            <div class="filtro-grupo">
                <label><i class="fas fa-layer-group"></i> Colorear Mapa por:</label>
                <select id="filtro-tema" class="dark-select">
                    <option value="none">Ninguno (Solo Límites)</option>
                    <option value="pobtot">Población Total</option>
                    <option value="vivtot">Viviendas Totales</option>
                    <option value="viv_des">Viviendas Deshabitadas</option>
                    <option value="con_luz">% Con Electricidad</option>
                    <option value="con_agua">% Con Agua Potable</option>
                    <option value="sin_dren">% Sin Drenaje (Alerta)</option>
                </select>
            </div>

            <div class="filtro-grupo">
                <label><i class="fas fa-th"></i> Filtrar por AGEB</label>
                <input type="text" id="filtro-ageb" class="dark-input" placeholder="Ej: 3483">
            </div>

            <button id="reset-button" class="reset-button"><i class="fas fa-undo"></i> Restablecer Vista</button>
        </div>

        <!-- MAPA -->
        <div class="map-area">
            <div id="map"></div>
            <div id="map-loader" class="loader-container">
        <div class="spinner"></div>
        <p>Cargando datos del INEGI...</p>
    </div>
            <div id="floating-info-card">
                <div class="card-header">
                    <h3 class="card-title">Datos de la Manzana</h3>
                    <i class="fas fa-times close-card" id="close-card-btn"></i>
                </div>
                <div id="card-content" class="card-body"></div>
            </div>
        </div>
    </div> 

    <!-- SCRIPTS -->
    <script>
        // URL de la API para el JS externo
        const API_URL = '<?= site_url('/get-manzanas') ?>';
    </script>
    <!-- Tu lógica externa -->
    <script src="<?= base_url('js/logica_mapa.js') ?>"></script>

</body>
</html>