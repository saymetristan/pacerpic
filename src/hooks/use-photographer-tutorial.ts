import { useEffect } from 'react';
import { driver, DriveStep, Side } from "driver.js";
import "driver.js/dist/driver.css";

export function usePhotographerTutorial(page: 'upload' | 'process') {
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('photographer-tutorial');
    
    if (hasSeenTutorial) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: '#000000',
      stagePadding: 4,
      popoverClass: 'custom-popover',
      steps: page === 'upload' ? getUploadSteps() : getProcessSteps()
    });

    driverObj.drive();
    
    // Marcamos como visto solo después de completar el tutorial
    const handleComplete = () => {
      localStorage.setItem('photographer-tutorial', 'true');
    };

    return () => {
      driverObj.destroy();
      handleComplete();
    };
  }, [page]);
}

function getUploadSteps(): DriveStep[] {
  return [
    {
      element: '[data-tour="zone-select"]',
      popover: {
        title: 'Selecciona la Zona',
        description: 'Elige la ubicación donde tomaste las fotografías para que los corredores puedan encontrarlas más fácilmente.',
        side: "bottom" as Side,
        align: 'start'
      }
    },
    {
      element: '[data-tour="upload-zone"]',
      popover: {
        title: 'Sube tus Fotos',
        description: 'Arrastra tus fotos aquí o haz clic para seleccionarlas. Puedes subir varias fotos a la vez.',
        side: "bottom" as Side,
        align: 'start'
      }
    },
    {
      element: '[data-tour="upload-button"]',
      popover: {
        title: 'Inicia la Subida',
        description: 'Una vez seleccionadas tus fotos, haz clic aquí para comenzar la subida.',
        side: "top" as Side,
        align: 'start'
      }
    },
    {
      element: '[data-tour="process-link"]',
      popover: {
        title: 'Procesar Imágenes',
        description: 'Después de subir tus fotos, ve a la sección de procesamiento para publicarlas.',
        side: "right" as Side,
        align: 'start'
      }
    }
  ];
}

function getProcessSteps(): DriveStep[] {
  return [
    {
      element: '[data-tour="process-buttons"]',
      popover: {
        title: 'Procesa tus Fotos',
        description: 'Cuando todas tus fotos estén cargadas, selecciona tu zona para procesarlas y publicarlas.',
        side: "bottom" as Side,
        align: 'start'
      }
    },
    {
      popover: {
        title: '¿Necesitas Ayuda?',
        description: 'Si tienes algún problema, no dudes en contactarnos a través del chat de la plataforma.',
      }
    }
  ];
} 