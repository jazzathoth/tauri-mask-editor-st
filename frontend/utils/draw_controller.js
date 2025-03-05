import { Controller } from "stimulus";
import { getClassData } from "./class_data_controller.js";
import { invoke } from "@tauri-apps/api/core";

 /**
 * @extends {Controller}
 *
 * @property {HTMLCanvasElement} canvasTarget
 */

export default class Draw extends Controller {
  static targets = ["canvas"];

  connect() {
    console.log("drawing controller initialized");

    this.canvas = this.canvasTarget;
    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.brushSize = 5;
    this.annotationClass = {color: [255, 0, 0, 127], id: 1};
    this.undoStack = [];

    this.adjustCanvasSize(true);
    // window.addEventListener("resize", () => this.adjustCanvasSize(false));

    this.element.addEventListener("bgImageLoaded", () => this.adjustCanvasSize(false));

    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", (e) => this.stopDrawing());
    this.canvas.addEventListener("mouseleave", (e) => this.stopDrawing());
  }

  adjustCanvasSize(isInit) {
    console.log("adjusting image size")
    this.canvas.width = this.getImageWidth();
    this.canvas.height = this.getImageHeight();
    let previousImageData;

    if (!isInit) {
      previousImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!isInit) {
      this.ctx.putImageData(previousImageData, 0, 0);
    }
  }
  

  startDrawing(e) {
    this.isDrawing = true;
    this.saveState();
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;
    this.draw(e);
  }

  getImageWidth() {
    const img = document.querySelector("[data-image-target='image']");
    return img ? img.clientWidth : 1;
  }

  getImageHeight() {
    const img = document.querySelector("[data-image-target='image']");
    return img ? img.clientHeight : 1;
  }
  

  draw(e) {
    if (!this.isDrawing) return;

    const offsetX = e.offsetX;
    const offsetY = e.offsetY;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    const setPixel = (x, y) => {
      if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) return;
      const rad = Math.floor(this.brushSize / 2);
      
      for (let fy = -rad; fy <= rad; fy++) {
        for (let fx = -rad; fx <= rad; fx++) {
          if (fx*fx + fy*fy <= rad*rad) {
            const pxX = x + fx;
            const pxY = y + fy;
            // const px = (fy+y) * this.canvas.width + (fx+x);
            if(pxX < 0 || pxX >= this.canvas.width || pxY < 0 || pxY > this.canvas.height) continue;
            const idx = (pxY * this.canvas.width + pxX) * 4;
            for (let ppi = 0; ppi < 4; ppi++) {
              data[idx + ppi] = this.annotationClass.color[ppi];
            }
          }
        }
      }
    };

    const drawLine = (x0, y0, x1, y1) => {
      const dx = Math.abs(x1-x0), sx = x0 < x1 ? 1 : -1;
      const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, e2;

      while (true) {
        setPixel(x0, y0);
        if(x0 === x1 && y0 === y1) break;
        e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    };

    drawLine(this.lastX, this.lastY, offsetX, offsetY);

    this.lastX = offsetX;
    this.lastY = offsetY;

    this.ctx.putImageData(imageData, 0, 0);
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  saveState() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack.push(imageData);
    if (this.undoStack.length > 10) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length > 0) {
      const previousState = this.undoStack.pop();
      this.ctx.putImageData(previousState, 0, 0);
    } else {
      console.log("Nothing to undo");
    }
  }

  setBrushSize(size) {
    console.log(`Setting brush size to ${size}`);
    this.brushSize = size;
    console.log("Draw controller: setting brush size")
  }

  setAnnotationClass(className) {
    console.log(`Setting class to: ${className}`);
    var classData;
    getClassData().then(r => {
      classData = r;
      console.log(classData);
      if (classData.classes[className]) {
        console.log(classData.classes[className]);
        this.annotationClass = classData.classes[className];
      } else {
        console.warn(`Unknown annotation for class: ${className}`);
      }
    });
  }

  getByteString() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1];
    const binary = atob(base64Data);
    const uint8Array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    invoke("save_mask", { pngBytes: uint8Array })
      .then(() => console.log("Mask sent to rust to write to disk"))
      .catch((err) => console.error("Error sending mask to rust backend"));
  }
}
