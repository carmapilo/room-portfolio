import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

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
  button.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const showModal = (modal) => {
  modal.style.display = "block";

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
    },
  });
};

const raycasterObjects = [];
let currentIntersects = [];

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

window.addEventListener("click", (event) => {
  if (currentIntersects.length > 0) {
    let object = currentIntersects[0].object;

    while (object.parent && !object.name.includes("Raycaster")) {
      object = object.parent;
    }
    console.log(object.name);

    if (object.name.includes("AboutMe")) {
      showModal(modals.about);
    } else if (object.name.includes("Projects")) {
      showModal(modals.projects);
    } else if (object.name.includes("Contact")) {
      showModal(modals.contact);
    }
  }
});

gltfLoader.load("/models/Room_Portfolio.glb", (gltf) => {
  // Loop through every part of the loaded model
  gltf.scene.traverse((child) => {
    // Check if the object is a mesh
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }

    if (child.name.includes("Raycaster")) {
      console.log(child.name);
      raycasterObjects.push(child);
    }
  });
  scene.add(gltf.scene);
});

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
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

function render() {
  controls.update();

  // console.log(camera.position);
  // console.log("-----------------");
  // console.log(controls.target);

  // Raycaster
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  // Change the color of the intersecting object
  for (let i = 0; i < currentIntersects.length; i++) {
    // currentIntersects[i].object.material.color.set(0xff0000);
  }

  if (currentIntersects.length > 0) {
    // console.log(currentIntersects[0].object.name);
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}
render();
