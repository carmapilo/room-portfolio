import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "./utils/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

// Loading Screen Logic
const loadingScreen = document.querySelector(".loading-screen");
const loadingText = document.querySelector(".loading-screen-text");
const loadingInstruction = document.querySelector(
  ".loading-screen-instruction"
);
const loadingButton = document.querySelector(".loading-screen-button");
let isModelLoaded = false;
let canDismissLoading = false;

function hideLoadingScreen() {
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      loadingScreen.style.display = "none";
    },
  });
}

function onModelLoaded() {
  isModelLoaded = true;
  canDismissLoading = true;

  // Change text to "Press Enter" and show button
  gsap.to(loadingText, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      loadingText.textContent = "READY";
      loadingInstruction.style.display = "block";
      loadingButton.style.display = "inline-block";

      gsap.to(loadingText, { opacity: 1, duration: 0.3 });
      gsap.to(loadingInstruction, { opacity: 1, duration: 0.3 });
      gsap.to(loadingButton, { opacity: 1, duration: 0.3 });
    },
  });
}

// Listen for Enter key
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && canDismissLoading) {
    hideLoadingScreen();
  }
});

// <CHANGE> Button click handler for loading screen
loadingButton.addEventListener("click", () => {
  if (canDismissLoading) {
    hideLoadingScreen();
  }
});

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const modals = {
  about: document.querySelector(".modal.about"),
  projects: document.querySelector(".modal.projects"),
  contact: document.querySelector(".modal.contact"),
};

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  let touchHappened = false;
  button.addEventListener(
    "click",
    (e) => {
      touchHappened = true;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );

  button.addEventListener(
    "touchend",
    (e) => {
      if (touchHappened) return;

      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );
});

let isModalOpen = false;

const showModal = (modal) => {
  modal.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if (currentHoveredObject) {
    playHoverAnimation(currentHoveredObject, false);
    currentHoveredObject = null;
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.inOut",
    onComplete: () => {
      modal.style.display = "none";
      isModalOpen = false;
      controls.enabled = true;
    },
  });
};

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;
let currentUpObject = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "js" });

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / sizes.width) * 2 - 1;
  pointer.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener(
  "touchstart",
  (event) => {
    if (isModalOpen) return;
    event.preventDefault();
    pointer.x = (event.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(event.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (event) => {
    if (isModalOpen) return;
    event.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    let object = currentIntersects[0].object;

    while (object.parent && !object.name.includes("Raycaster")) {
      object = object.parent;
    }
    // console.log(object.name);

    if (object.name.includes("AboutMe")) {
      showModal(modals.about);
    } else if (object.name.includes("Projects")) {
      showModal(modals.projects);
    } else if (object.name.includes("Contact")) {
      showModal(modals.contact);
    } else if (object.name.includes("Computer")) {
      showModal(modals.projects);
    }
  }
}

window.addEventListener("click", handleRaycasterInteraction);

gltfLoader.load("/models/Room_Portfoliov2.glb", (gltf) => {
  // Loop through every part of the loaded model
  gltf.scene.traverse((child) => {
    // Check if the object is a mesh
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }

    if (child.name.includes("Raycaster")) {
      raycasterObjects.push(child);
    }

    if (child.name.includes("Up")) {
      child.userData.initialScale = new THREE.Vector3().copy(child.scale);
      child.userData.initialPosition = new THREE.Vector3().copy(child.position);
      child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
    }

    if (child.name.includes("Hover")) {
      child.userData.initialScale = new THREE.Vector3().copy(child.scale);
      child.userData.initialPosition = new THREE.Vector3().copy(child.position);
      child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
    }
  });
  scene.add(gltf.scene);
  onModelLoaded();
});

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(
  11.19392504289486,
  5.391397965891819,
  1.7325880436473615
);
directionalLight.target.position.set(
  -0.7293108826258348,
  2.225315248196875,
  -0.6843806474066922
);
directionalLight.castShadow = true;
scene.add(directionalLight.target);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
// scene.background = null;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 15;
controls.minDistance = 5;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

camera.position.set(7.681051827298401, 5.725851969010977, 7.9782641056809);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
  -0.7293108826258348,
  2.225315248196875,
  -0.6843806474066922
);

// Event Listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function playHoverAnimation(object, isHovering) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.5,
      ease: "power2.inOut",
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x + Math.PI / 32,
      duration: 0.5,
      ease: "power2.inOut",
    });
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "power2.inOut",
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }
}

function playUpAnimation(object, isUp) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (isUp) {
    gsap.to(object.scale, {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(object.position, {
      z: object.position.z + 0.3,
      duration: 0.4,
      ease: "power2.out",
    });
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "power2.inOut",
    });
    gsap.to(object.position, {
      x: object.userData.initialPosition.x,
      y: object.userData.initialPosition.y,
      z: object.userData.initialPosition.z,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }
}

function render() {
  controls.update();

  // console.log(camera.position);
  // console.log("-----------------");
  // console.log(controls.target);

  // Raycaster
  if (!isModalOpen) {
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    currentIntersects = raycaster.intersectObjects(raycasterObjects);
    let currentIntersectObject = null;

    if (currentIntersects.length > 0) {
      let hitObject = currentIntersects[0].object;
      while (hitObject.parent && !hitObject.name.includes("Raycaster")) {
        hitObject = hitObject.parent;
      }
      currentIntersectObject = hitObject;
    }

    if (
      currentIntersectObject &&
      currentIntersectObject.name.includes("Hover")
    ) {
      document.body.style.cursor = "pointer";

      if (currentHoveredObject !== currentIntersectObject) {
        if (currentHoveredObject) {
          playHoverAnimation(currentHoveredObject, false);
        }

        playHoverAnimation(currentIntersectObject, true);
        currentHoveredObject = currentIntersectObject;
      }
    } else if (
      currentIntersectObject &&
      currentIntersectObject.name.includes("Up")
    ) {
      if (currentUpObject !== currentIntersectObject) {
        if (currentUpObject) {
          playUpAnimation(currentUpObject, false);
        }

        playUpAnimation(currentIntersectObject, true);
        currentUpObject = currentIntersectObject;
      }
    } else {
      if (currentHoveredObject) {
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
      }
      if (currentUpObject) {
        playUpAnimation(currentUpObject, false);
        currentUpObject = null;
      }
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}
render();
