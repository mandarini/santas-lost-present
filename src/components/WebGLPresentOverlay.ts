/// <reference types="@types/google.maps" />
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
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
  let presentGroup: Group;
  let animationStartTime: number | null = null;

  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    scene = new Scene();
    camera = new PerspectiveCamera();

    // Ambient light for soft overall illumination
    const ambientLight = new AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // Create a 3D present box
    presentGroup = new Group();

    // Present box body (red)
    const boxGeometry = new BoxGeometry(25, 25, 25);
    const boxMaterial = new MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.3,
      roughness: 0.7,
    });
    const box = new Mesh(boxGeometry, boxMaterial);
    presentGroup.add(box);

    // Horizontal ribbon (gold)
    const ribbonHGeometry = new BoxGeometry(26, 5, 26);
    const ribbonMaterial = new MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.6,
      roughness: 0.3,
    });
    const ribbonH = new Mesh(ribbonHGeometry, ribbonMaterial);
    ribbonH.position.y = 0;
    presentGroup.add(ribbonH);

    // Vertical ribbon (gold)
    const ribbonVGeometry = new BoxGeometry(5, 26, 26);
    const ribbonV = new Mesh(ribbonVGeometry, ribbonMaterial);
    ribbonV.position.x = 0;
    presentGroup.add(ribbonV);

    // Bow on top (gold)
    const bowGeometry = new BoxGeometry(10, 8, 10);
    const bow = new Mesh(bowGeometry, ribbonMaterial);
    bow.position.y = 16;
    bow.rotation.y = Math.PI / 4;
    presentGroup.add(bow);

    // Position the present slightly above ground
    presentGroup.position.y = 15;

    scene.add(presentGroup);
  };

  webglOverlayView.onContextRestored = ({ gl }: google.maps.WebGLStateOptions) => {
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // Start the animation loop
    animationStartTime = Date.now();
    startCameraAnimation();
  };

  const startCameraAnimation = () => {
    // Initial camera position
    map.moveCamera({
      center: position,
      zoom: 18,
      tilt: 0,
      heading: 0,
    });

    renderer.setAnimationLoop(() => {
      if (!animationStartTime) return;

      const elapsed = Date.now() - animationStartTime;
      const duration = 8000; // 8 seconds total animation

      // Phase 1: Tilt up (0-2s)
      if (elapsed < 2000) {
        const progress = elapsed / 2000;
        map.moveCamera({
          tilt: progress * 67.5,
          zoom: 18 - progress * 0.5,
        });
      }
      // Phase 2: Rotate around (2-7s)
      else if (elapsed < 7000) {
        const rotationProgress = (elapsed - 2000) / 5000;
        map.moveCamera({
          heading: rotationProgress * 360,
          zoom: 17.5 - rotationProgress * 0.5,
        });
      }
      // Phase 3: Zoom out and settle (7-8s)
      else if (elapsed < duration) {
        const settleProgress = (elapsed - 7000) / 1000;
        map.moveCamera({
          tilt: 67.5 - settleProgress * 22.5,
          zoom: 17 + settleProgress * 0.5,
        });
      }
      // Animation complete
      else {
        renderer.setAnimationLoop(null);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }

      // Rotate the present continuously
      if (presentGroup) {
        presentGroup.rotation.y += 0.02;
      }

      webglOverlayView.requestRedraw();
    });
  };

  webglOverlayView.onDraw = ({ transformer }: google.maps.WebGLDrawOptions) => {
    if (!scene || !camera || !renderer) return;

    // Update camera matrix to position the present at the target location
    const matrix = transformer.fromLatLngAltitude({
      lat: position.lat,
      lng: position.lng,
      altitude: 50,
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
  webglOverlayView.setMap(map);

  return webglOverlayView;
}

export function removePresentOverlay(overlay: google.maps.WebGLOverlayView) {
  overlay.setMap(null);
}
