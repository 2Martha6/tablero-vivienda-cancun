<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        return view('mapa_view');
    }

    public function getManzanas()
    {
        $db = \Config\Database::connect();

        // CONSULTA SQL 
        
        $sql = "
            SELECT 
                cvegeo, 
                cve_ent,
                cve_mun,
                cve_loc,
                cve_ageb,
                pobtot,       -- Población Total
                vivtot,       -- Viviendas Totales
                vivpar_des,   -- Viviendas Deshabitadas
                vph_c_elec,   -- Con Electricidad
                vph_aguadv,   -- Con Agua
                vph_nodren,   -- Sin Drenaje
                ST_AsGeoJSON(
                    ST_Transform(
                        ST_SetSRID(
                            ST_MakeValid(geom), 
                            6372
                        ), 
                        4326
                    )
                ) AS geojson 
            FROM manzana  -- <--- TABLA EN SINGULAR
            WHERE geom IS NOT NULL;
        ";

        try {
            $query = $db->query($sql);
            $results = $query->getResultArray();
        } catch (\Throwable $e) {
            
            return $this->response->setJSON(['error' => $e->getMessage()]);
        }

        $features = [];
        foreach ($results as $row) {
            if ($row['geojson']) {
                $features[] = [
                    'type' => 'Feature',
                    'geometry' => json_decode($row['geojson']),
                    'properties' => [
                        // Identificadores
                        'cvegeo' => $row['cvegeo'],
                        'entidad' => $row['cve_ent'],
                        'municipio' => $row['cve_mun'],
                        'localidad' => $row['cve_loc'],
                        'ageb' => $row['cve_ageb'],
                        
                        // Datos Estadísticos 
                        'pobtot' => is_numeric($row['pobtot']) ? (int)$row['pobtot'] : 0,
                        'vivtot' => is_numeric($row['vivtot']) ? (int)$row['vivtot'] : 0,
                        'viv_des' => is_numeric($row['vivpar_des']) ? (int)$row['vivpar_des'] : 0,
                        'con_luz' => is_numeric($row['vph_c_elec']) ? (int)$row['vph_c_elec'] : 0,
                        'con_agua' => is_numeric($row['vph_aguadv']) ? (int)$row['vph_aguadv'] : 0,
                        'sin_dren' => is_numeric($row['vph_nodren']) ? (int)$row['vph_nodren'] : 0
                    ]
                ];
            }
        }

        $featureCollection = [
            'type' => 'FeatureCollection',
            'features' => $features
        ];

        return $this->response->setJSON($featureCollection);
    }
}