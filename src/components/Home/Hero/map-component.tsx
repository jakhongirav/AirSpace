"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define the building type
interface Building {
  id: number;
  name: string;
  coordinates: [number, number];
  height: number;
  pricePerSqFt: number;
  availableSqFt: number;
  airRightsVolume: number;
  viewProtected: boolean;
  row: number;
  footprint: number[][];
}

interface MapComponentProps {
  buildings: Building[];
}

const MapComponent = ({ buildings }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [popupInfo, setPopupInfo] = useState<Building | null>(null);
  const [popupCoordinates, setPopupCoordinates] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Simplified hover timeout
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map only once
  useEffect(() => {
    console.log("Map component mounting");
    if (!mapContainer.current) {
      console.log("Map container ref is null");
      return;
    }
    
    // Check if map is already initialized
    if (map.current) return;
    
    try {
      console.log("Initializing map...");
      mapboxgl.accessToken = 'pk.eyJ1IjoiYXRoYXJ2YWxhZGUiLCJhIjoiY203azliYXBmMGYxbjJqcHJucHltamx1MSJ9.MIDkONe-6BnGL4vlCqCBjw';
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-79.0767, 43.0828],
        zoom: 15.5,
        pitch: 60,
        bearing: 20,
        antialias: true
      });
      
      console.log("Map instance created");
      map.current = mapInstance;
      
      // Add basic error handling
      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map: ' + (e.error?.message || 'Unknown error'));
      });
      
      // Log when map is loaded
      mapInstance.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        
        try {
          // Create data for Niagara Falls buildings
          const niagaraBuildings: Building[] = [
            // First row buildings (closer to falls)
            {
              id: 1,
              name: "Queen Victoria Place",
              coordinates: [-79.0790, 43.0805] as [number, number],
              height: 25,
              pricePerSqFt: 520.50,
              availableSqFt: 15000,
              airRightsVolume: 120000,
              viewProtected: false,
              row: 1,
              footprint: [
                [-79.0795, 43.0800],
                [-79.0795, 43.0810],
                [-79.0785, 43.0810],
                [-79.0785, 43.0800],
                [-79.0795, 43.0800]
              ]
            },
            {
              id: 2,
              name: "Table Rock Centre",
              coordinates: [-79.0810, 43.0795] as [number, number],
              height: 20,
              pricePerSqFt: 495.75,
              availableSqFt: 12500,
              airRightsVolume: 100000,
              viewProtected: true,
              row: 1,
              footprint: [
                [-79.0815, 43.0790],
                [-79.0815, 43.0800],
                [-79.0805, 43.0800],
                [-79.0805, 43.0790],
                [-79.0815, 43.0790]
              ]
            },
            {
              id: 3,
              name: "Nikola Tesla Plaza",
              coordinates: [-79.0775, 43.0815] as [number, number],
              height: 15,
              pricePerSqFt: 550.80,
              availableSqFt: 18000,
              airRightsVolume: 150000,
              viewProtected: false,
              row: 1,
              footprint: [
                [-79.0780, 43.0810],
                [-79.0780, 43.0820],
                [-79.0770, 43.0820],
                [-79.0770, 43.0810],
                [-79.0780, 43.0810]
              ]
            },
            
            // Second row buildings (further from falls)
            {
              id: 4,
              name: "Fallsview Casino Resort",
              coordinates: [-79.0795, 43.0835] as [number, number],
              height: 45,
              pricePerSqFt: 425.30,
              availableSqFt: 9200,
              airRightsVolume: 80000,
              viewProtected: true,
              row: 2,
              footprint: [
                [-79.0800, 43.0830],
                [-79.0800, 43.0840],
                [-79.0790, 43.0840],
                [-79.0790, 43.0830],
                [-79.0800, 43.0830]
              ]
            },
            {
              id: 5,
              name: "Sheraton on the Falls",
              coordinates: [-79.0775, 43.0845] as [number, number],
              height: 50,
              pricePerSqFt: 467.80,
              availableSqFt: 11500,
              airRightsVolume: 95000,
              viewProtected: false,
              row: 2,
              footprint: [
                [-79.0780, 43.0840],
                [-79.0780, 43.0850],
                [-79.0770, 43.0850],
                [-79.0770, 43.0840],
                [-79.0780, 43.0840]
              ]
            },
            {
              id: 6,
              name: "6430 Niagara River Parkway",
              coordinates: [-79.0755, 43.0855] as [number, number],
              height: 55,
              pricePerSqFt: 482.50,
              availableSqFt: 14000,
              airRightsVolume: 110000,
              viewProtected: true,
              row: 2,
              footprint: [
                [-79.0760, 43.0850],
                [-79.0760, 43.0860],
                [-79.0750, 43.0860],
                [-79.0750, 43.0850],
                [-79.0760, 43.0850]
              ]
            }
          ];
          
          console.log("Adding buildings to map:", niagaraBuildings.length);
          
          // Add each building to the map
          niagaraBuildings.forEach(building => {
            console.log("Adding building:", building.name);
            
            // Create a GeoJSON polygon for the building footprint
            const buildingFootprint: GeoJSON.Feature = {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [building.footprint]
              },
              properties: building
            };
            
            // Add source for the building footprint
            mapInstance.addSource(`building-${building.id}`, {
              type: 'geojson',
              data: buildingFootprint
            });
            
            // Add 3D building extrusion
            mapInstance.addLayer({
              'id': `building-${building.id}-3d`,
              'source': `building-${building.id}`,
              'type': 'fill-extrusion',
              'paint': {
                'fill-extrusion-color': building.row === 1 ? '#1a2030' : '#2a3040',
                'fill-extrusion-height': building.height,
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.9
              }
            });
            
            // Add air rights volume visualization
            mapInstance.addLayer({
              'id': `air-rights-${building.id}`,
              'source': `building-${building.id}`,
              'type': 'fill-extrusion',
              'paint': {
                'fill-extrusion-color': building.viewProtected ? '#4CAF50' : '#FFA500',
                'fill-extrusion-height': building.height + building.airRightsVolume/5000,
                'fill-extrusion-base': building.height,
                'fill-extrusion-opacity': 0.4
              }
            });
            
            // Add a marker for the building
            mapInstance.addSource(`building-point-${building.id}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: building.coordinates
                },
                properties: building
              } as GeoJSON.Feature
            });
            
            mapInstance.addLayer({
              id: `building-marker-${building.id}`,
              type: 'circle',
              source: `building-point-${building.id}`,
              paint: {
                'circle-radius': 8,
                'circle-color': building.viewProtected ? '#4CAF50' : '#FFA500',
                'circle-opacity': 0.9,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
              }
            });
            
            // Simplified hover effect - show popup immediately, hide with delay
            mapInstance.on('mouseenter', `building-marker-${building.id}`, (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
              console.log("Mouse enter on building:", building.name);
              mapInstance.getCanvas().style.cursor = 'pointer';
              
              // Clear any existing timeout
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              
              // Show popup immediately
              setPopupInfo(building);
              setPopupCoordinates(building.coordinates);
              
              // Highlight air rights
              mapInstance.setPaintProperty(`air-rights-${building.id}`, 'fill-extrusion-opacity', 0.7);
            });
            
            mapInstance.on('mouseleave', `building-marker-${building.id}`, () => {
              console.log("Mouse leave on building:", building.name);
              mapInstance.getCanvas().style.cursor = '';
              
              // Clear any existing timeout
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
              }
              
              // Set timeout to hide popup after 500ms (increased for better UX)
              hoverTimeoutRef.current = setTimeout(() => {
                setPopupInfo(null);
                setPopupCoordinates(null);
                
                // Reset air rights highlight
                mapInstance.setPaintProperty(`air-rights-${building.id}`, 'fill-extrusion-opacity', 0.4);
              }, 500);
            });
          });
          
          // Add navigation control
          mapInstance.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
          
          console.log("Buildings added successfully");
          
        } catch (err) {
          console.error('Error adding 3D buildings:', err);
          setMapError('Error adding buildings: ' + (err as Error).message);
        }
      });
      
      return () => {
        console.log("Cleaning up map");
        // Clear any pending timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError('Error initializing map: ' + (err as Error).message);
    }
  }, []);

  // Safe access to map.project
  const getProjectedCoordinates = (coordinates: [number, number]) => {
    if (!map.current) return { x: 0, y: 0 };
    try {
      return map.current.project(coordinates);
    } catch (err) {
      console.error('Error projecting coordinates:', err);
      return { x: 0, y: 0 };
    }
  };

  // Function to keep popup visible when hovering over it
  const keepPopupVisible = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Function to hide popup when leaving popup area
  const hidePopupOnLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setPopupInfo(null);
      setPopupCoordinates(null);
      
      // Reset air rights highlight for all buildings
      if (map.current && popupInfo) {
        map.current.setPaintProperty(`air-rights-${popupInfo.id}`, 'fill-extrusion-opacity', 0.4);
      }
    }, 200);
  };

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl bg-gray-900">
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
      
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-darkmode/50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading 3D Map...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-darkmode/80 z-20">
          <div className="bg-red-900/50 p-4 rounded-lg text-white max-w-md text-center">
            <Icon icon="ph:warning-circle-fill" className="text-3xl mb-2 mx-auto" />
            <p>{mapError}</p>
            <p className="text-sm mt-2">Try refreshing the page or check your internet connection.</p>
          </div>
        </div>
      )}
      
      {/* Improved popup with hover-friendly design */}
      {popupInfo && popupCoordinates && mapLoaded && (
        <div 
          className="absolute z-20 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: getProjectedCoordinates(popupCoordinates).x,
            top: getProjectedCoordinates(popupCoordinates).y - 15
          }}
          onMouseEnter={keepPopupVisible}
          onMouseLeave={hidePopupOnLeave}
        >
          <div className="p-4 bg-darkmode/95 backdrop-blur-md border border-primary/30 rounded-lg shadow-lg max-w-xs">
            <h3 className="text-white text-lg font-medium mb-2">{popupInfo.name}</h3>
            <p className="text-primary text-xl font-bold mb-3">${popupInfo.pricePerSqFt}/sq.ft</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-white mb-3">
              <div>
                <span className="text-gray-400">Height:</span>
                <span className="ml-1">{popupInfo.height}m</span>
              </div>
              <div>
                <span className="text-gray-400">Available:</span>
                <span className="ml-1">{popupInfo.availableSqFt} sq.ft</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Status:</span>
                <span className={`ml-1 ${popupInfo.viewProtected ? 'text-green-400' : 'text-orange-400'}`}>
                  {popupInfo.viewProtected ? 'View Protected' : 'Unprotected View'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Position:</span>
                <span className="ml-1">Row {popupInfo.row} {popupInfo.row === 1 ? '(Falls-facing)' : '(Second row)'}</span>
              </div>
            </div>
            <button 
              className="w-full bg-primary text-darkmode px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              onClick={() => {
                console.log('Purchase clicked for:', popupInfo.name);
                // Add navigation or purchase logic here
              }}
            >
              {popupInfo.row === 1 && !popupInfo.viewProtected ? 'Sell Air Rights' : 'Buy Air Rights'}
            </button>
          </div>
          {/* Popup arrow */}
          <div className="w-3 h-3 bg-darkmode/95 transform rotate-45 mx-auto -mt-1.5 border-r border-b border-primary/30"></div>
        </div>
      )}
      
      {/* Overlay elements */}
      <div className="absolute top-4 left-4 bg-darkmode/70 backdrop-blur-sm p-3 rounded-lg border border-primary/30 text-white text-sm">
        <span className="flex items-center">
          <Icon icon="ph:info-bold" className="mr-2" /> Hover over buildings to see air rights details
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-3">
        <div className="bg-darkmode/70 backdrop-blur-sm p-2 rounded-lg border border-primary/30 text-white text-sm flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span>Protected View</span>
        </div>
        <div className="bg-darkmode/70 backdrop-blur-sm p-2 rounded-lg border border-primary/30 text-white text-sm flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
          <span>Unprotected View</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent; 