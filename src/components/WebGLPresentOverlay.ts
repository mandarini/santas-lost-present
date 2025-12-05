/// <reference types="@types/google.maps" />
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  ConeGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
} from 'three';

export interface PresentOverlayOptions {
  map: google.maps.Map;
  position: { lat: number; lng: number };
  onAnimationComplete?: () => void;
}

export function createPresentOverlay(options: PresentOverlayOptions): google.maps.WebGLOverlayView {
  const { map, position, onAnimationComplete } = options;

  let scene: Scene;
  let renderer: WebGLRenderer;
  let camera: PerspectiveCamera;
  let pinGroup: Group;

  // Mutable animation options (like Google's working sample)
  const animationOptions = {
    tilt: 0,
    heading: 0,
    zoom: 18,
  };

  const webglOverlayView = new google.maps.WebGLOverlayView();
  console.log('[WebGL] Creating overlay view');

  webglOverlayView.onAdd = () => {
    console.log('[WebGL] onAdd called');
    scene = new Scene();
    camera = new PerspectiveCamera();

    // Ambient light for soft overall illumination
    const ambientLight = new AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // Create a 3D pin marker
    pinGroup = new Group();

    // Pin material (Google Maps red)
    const pinMaterial = new MeshStandardMaterial({
      color: 0xea4335,
      metalness: 0.1,
      roughness: 0.6,
    });

    // Pin head (sphere on top) - smaller, positioned higher
    const sphereGeometry = new SphereGeometry(8, 32, 32);
    const sphere = new Mesh(sphereGeometry, pinMaterial);
    sphere.position.y = 28;
    pinGroup.add(sphere);

    // Pin body (cone pointing down) - taller, thinner
    const coneGeometry = new ConeGeometry(6, 25, 32);
    const cone = new Mesh(coneGeometry, pinMaterial);
    cone.rotation.x = Math.PI; // Point downward
    cone.position.y = 8;
    pinGroup.add(cone);

    scene.add(pinGroup);
    console.log('[WebGL] Pin marker created');
  };

  webglOverlayView.onContextRestored = ({ gl }: google.maps.WebGLStateOptions) => {
    console.log('[WebGL] onContextRestored called', gl);
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // Move camera to target position first
    map.moveCamera({
      center: position,
      zoom: animationOptions.zoom,
      tilt: animationOptions.tilt,
      heading: animationOptions.heading,
    });

    // Start animation loop (matching Google's working pattern)
    console.log('[WebGL] Starting animation loop');
    let frameCount = 0;

    renderer.setAnimationLoop(() => {
      try {
        frameCount++;
        webglOverlayView.requestRedraw();

        // Phase 1: Tilt up (0 -> 67.5)
        if (animationOptions.tilt < 67.5) {
          animationOptions.tilt += 0.5;
          if (frameCount % 20 === 0) {
            console.log('[WebGL] Phase 1 - tilt:', animationOptions.tilt);
          }
        }
        // Phase 2: Rotate around (0 -> 360)
        else if (animationOptions.heading <= 360) {
          animationOptions.heading += 0.2;
          animationOptions.zoom -= 0.0005;
          if (frameCount % 100 === 0) {
            console.log('[WebGL] Phase 2 - heading:', animationOptions.heading, 'zoom:', animationOptions.zoom);
          }
        }
        // Animation complete
        else {
          console.log('[WebGL] Animation complete');
          renderer.setAnimationLoop(null);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          return;
        }

        map.moveCamera({
          tilt: animationOptions.tilt,
          heading: animationOptions.heading,
          zoom: animationOptions.zoom,
        });
      } catch (err) {
        console.error('[WebGL] Animation error:', err);
        renderer.setAnimationLoop(null);
      }
    });
  };

  webglOverlayView.onDraw = ({ transformer }: google.maps.WebGLDrawOptions) => {
    if (!scene || !camera || !renderer) {
      console.log('[WebGL] onDraw skipped - missing:', { scene: !!scene, camera: !!camera, renderer: !!renderer });
      return;
    }

    // Update camera matrix to position the pin at the target location
    const matrix = transformer.fromLatLngAltitude({
      lat: position.lat,
      lng: position.lng,
      altitude: 100,
    });
    camera.projectionMatrix = new Matrix4().fromArray(matrix);

    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  webglOverlayView.onContextLost = () => {
    if (renderer) {
      renderer.setAnimationLoop(null);
    }
  };

  webglOverlayView.onRemove = () => {
    if (renderer) {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    }
  };

  // Add overlay to map
  console.log('[WebGL] Setting map on overlay');
  webglOverlayView.setMap(map);
  console.log('[WebGL] Overlay added to map');

  return webglOverlayView;
}

export function removePresentOverlay(overlay: google.maps.WebGLOverlayView) {
  overlay.setMap(null);
}
