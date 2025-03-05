import { Controller } from "stimulus";
import { getClassData } from "./utils/class_data_controller.js";

export default class GlobalCtrl extends Controller {
  static targets = ["brushSize", "annotationInput"];

  connect() {
    this.zoom = 1.0;
    this.xOffset = 0;
    this.yOffset = 0;

    console.log("Global controller init.");
    this.populateAnnotationClasses();
    
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  openImagesFolder() {
    const canvasContainer = document.getElementById("canvasContainer");
    const imageController = this.application.getControllerForElementAndIdentifier(canvasContainer, "image");
    if (imageController) {
      imageController.openImgFolderDialog();
    } else {
      console.error("imageController not found in canvasContainer");
    }
  }

  nextImage(e) {
    console.log(e);
    const dx = parseInt(e.target.dataset.dx, 10);
    const canvasContainer = document.getElementById("canvasContainer");
    const imageController = this.application.getControllerForElementAndIdentifier(canvasContainer, "image");
    if (imageController) {
      console.log("global dx: ", dx);
      imageController.loadImage(dx);
    } else {
      console.error("imageController not found in canvasContainer");
    }
  }

  saveMask() {
    const canvasContainer = document.getElementById("canvasContainer");
    if (!canvasContainer) return;
    const drawingController = this.application.getControllerForElementAndIdentifier(canvasContainer, "drawing");

    bytesData = drawingController.getByteString(); 
  }

  undoAction() {
    const canvasContainer = document.getElementById("canvasContainer");
    const drawingController = this.application.getControllerForElementAndIdentifier(canvasContainer, "drawing");

    if (drawingController) {
      drawingController.undo();
    } else {
      console.error("drawingController not found in canvasContainer");
    }
  }

  populateAnnotationClasses() {
    var classData;
    getClassData().then(r => { 
      classData = r;
      this.annotationInputTarget.innerHTML = "";
      console.log("data classes: ", classData.classes);

      Object.entries(classData.classes).forEach(([name, data]) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        this.annotationInputTarget.appendChild(option);
      });
    });
  }

  getDrawController() {
    const container = document.getElementById("canvasContainer");
    return this.application.getControllerForElementAndIdentifier(container, "drawing");
  }

  updateAnnotationClass(e) {
    console.log("ran updateAnnotationClass");
    const newClass = e.target.value;
    const drawController = this.getDrawController();
    if (drawController) {
      console.log("Got draw controller");
      drawController.setAnnotationClass(newClass);
    }
  }
  
  updateBrushSize(e) {
    console.log("ran updateBrushSize");
    const newSize = parseInt(e.target.value, 10);
    const drawController = this.getDrawController();
    if (drawController) {
      console.log("Got draw controller");
      drawController.setBrushSize(newSize);
      // document.getElementById("brushSizeValue").textContent = newSize;
    }
  }

  updateZoom () {
    const canvasContainer = document.getElementById("canvasContainer");
    if (canvasContainer) {
      canvasContainer.style.transform = `scale(${this.zoom})`;
    }
  }

  updateTransform() {
    const canvasContainer = document.getElementById("canvasContainer");
    if (canvasContainer) {
      canvasContainer.style.transform = `translate(${this.xOffset}px, ${this.yOffset}px) scale(${this.zoom})`;
    }
  }

  handleKeyPress(e) {
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 3.0;
    const transStep = 10;

    switch (e.key) {
      case "r":
        this.zoom = Math.min(this.zoom + zoomStep, maxZoom);
        this.updateZoom();
        break;
      case "f":
        this.zoom = Math.max(this.zoom - zoomStep, minZoom);
        this.updateZoom();
        break;
      case "w":
        this.yOffset -= transStep;
        break;
      case "s":
        this.yOffset += transStep;
        break;
      case "a":
        this.xOffset -= transStep;
        break;
      case "d":
        this.xOffset += transStep;
        break;
      default:
        console.log(`got keypress ${e.key}`);
    }
    this.updateTransform();
  }
}
