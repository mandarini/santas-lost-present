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

interface GiftOverlayOptions {
  map: google.maps.Map;
  position: { lat: number; lng: number };
  onComplete?: () => void;
}

export function initGiftOverlay({ map, position, onComplete }: GiftOverlayOptions) {
  const google = (window as any).google;

  const mapOptions = {
    tilt: 0,
    heading: 0,
    zoom: 18,
    center: position,
  };

  let scene: Scene;
  let renderer: WebGLRenderer;
  let camera: PerspectiveCamera;
  let gift: Group;
  let animationStarted = false;

  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    scene = new Scene();
    camera = new PerspectiveCamera();

    // Lighting
    const ambientLight = new AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // Create a simple gift box (since we don't have a GLTF model)
    gift = createGiftBox();
    scene.add(gift);
  };

  webglOverlayView.onContextRestored = ({ gl }: { gl: WebGLRenderingContext }) => {
    renderer = new WebGLRenderer({
      canvas: gl.canvas as HTMLCanvasElement,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // Start animation after renderer is ready
    renderer.setAnimationLoop(() => {
      if (!animationStarted) {
        animationStarted = true;
      }

      webglOverlayView.requestRedraw();

      // Animate camera: tilt up, then rotate
      if (mapOptions.tilt < 67.5) {
        mapOptions.tilt += 0.5;
      } else if (mapOptions.heading <= 360) {
        mapOptions.heading += 0.3;
        mapOptions.zoom -= 0.001;
      } else {
        // Animation complete
        renderer.setAnimationLoop(null);
        if (onComplete) {
          onComplete();
        }
      }

      map.moveCamera({
        tilt: mapOptions.tilt,
        heading: mapOptions.heading,
        zoom: mapOptions.zoom,
      });

      // Rotate the gift
      if (gift) {
        gift.rotation.y += 0.02;
      }
    });
  };

  webglOverlayView.onDraw = ({ gl, transformer }: { gl: WebGLRenderingContext; transformer: any }) => {
    const latLngAltitudeLiteral = {
      lat: position.lat,
      lng: position.lng,
      altitude: 100,
    };

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new Matrix4().fromArray(matrix);

    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  // Set the overlay on the map
  webglOverlayView.setMap(map);

  // Pan to the target first
  map.panTo(position);
  map.setZoom(18);

  return webglOverlayView;
}

function createGiftBox(): Group {
  const group = new Group();

  // Main box (red)
  const boxGeometry = new BoxGeometry(25, 25, 25);
  const boxMaterial = new MeshStandardMaterial({ color: 0xcc0000 });
  const box = new Mesh(boxGeometry, boxMaterial);
  box.position.y = 12.5;
  group.add(box);

  // Ribbon horizontal (gold)
  const ribbonHGeometry = new BoxGeometry(26, 5, 5);
  const ribbonMaterial = new MeshStandardMaterial({ color: 0xffd700 });
  const ribbonH = new Mesh(ribbonHGeometry, ribbonMaterial);
  ribbonH.position.y = 12.5;
  group.add(ribbonH);

  // Ribbon vertical (gold)
  const ribbonVGeometry = new BoxGeometry(5, 5, 26);
  const ribbonV = new Mesh(ribbonVGeometry, ribbonMaterial);
  ribbonV.position.y = 12.5;
  group.add(ribbonV);

  // Ribbon top (gold)
  const ribbonTopGeometry = new BoxGeometry(5, 26, 5);
  const ribbonTop = new Mesh(ribbonTopGeometry, ribbonMaterial);
  ribbonTop.position.y = 25;
  group.add(ribbonTop);

  // Bow loops (gold spheres as simplified bow)
  const bowGeometry = new BoxGeometry(10, 6, 6);
  const bowLeft = new Mesh(bowGeometry, ribbonMaterial);
  bowLeft.position.set(-8, 30, 0);
  bowLeft.rotation.z = 0.5;
  group.add(bowLeft);

  const bowRight = new Mesh(bowGeometry, ribbonMaterial);
  bowRight.position.set(8, 30, 0);
  bowRight.rotation.z = -0.5;
  group.add(bowRight);

  // Scale up the entire gift
  group.scale.set(2, 2, 2);

  return group;
}
