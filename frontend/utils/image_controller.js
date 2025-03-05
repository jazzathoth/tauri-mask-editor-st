import { Controller } from "stimulus";
import { invoke } from '@tauri-apps/api/core';

export default class ImageController extends Controller {
  static targets = ["image"];

  connect() {
    this.currentImgIdx = 0;
    this.arrayOfImgPaths = [];
  }

  // async openFileDialog() {
  //   console.log("Invoking file dialog");
  //   try {
  //     const base64Image = await invoke("open_image_bytes");
  //     if (!base64Image) {
  //       console.log("No file received from backend");
  //       return;
  //     }
  //     console.log("Got image from rust");
  //
  //     this.imageTarget.src = `data:image/png;base64,${base64Image}`;
  //     this.imageTarget.style.display = "block";
  //
  //     this.imageTarget.onload = () => {
  //       console.log("loaded the reference image, triggering event");
  //       const e = new CustomEvent("bgImageLoaded", { bubbles: true });
  //       this.element.dispatchEvent(e);
  //     }
  //
  //     // this.debugTarget.textContent = "Debug: Image loaded";
  //   } catch (err) {
  //     console.log("Error selecting image: ", err);
  //   }
  // }

  async openImgFolderDialog() {
    console.log("Invoking source folder dialog");
    try {
      const images_array = await invoke("get_all_files");
      if (!images_array) {
        console.log("No images found");
        return;
      }
      console.log("Got array of images from rust");
      this.arrayOfImgPaths = images_array;
      this.currentImgIdx = 0;
      if (this.arrayOfImgPaths.length > 0) {
        this.loadImage(0);
      }
    } catch(err) {
      console.log("Error selecting an image folder");
    }
  }

  async loadImage(dx) {
    console.log("dx: ", dx);
    // this.currentImgIdx += dx
    this.currentImgIdx = (this.currentImgIdx + dx + this.arrayOfImgPaths.length) % this.arrayOfImgPaths.length;
    console.log("attempting to load image at index: ", this.currentImgIdx);
    let base64Image = null;
    try {
      if (this.arrayOfImgPaths.length > 0) {
        base64Image = await invoke("open_image_bytes_nodlg", { "path": this.arrayOfImgPaths[this.currentImgIdx] });
      }
      if (!base64Image) {
        console.log("No file received from backend");
        return;
      }
      console.log("got image from rust");

      this.imageTarget.src = `data:image/png;base64,${base64Image}`;
      this.imageTarget.style.display = "block";

      this.imageTarget.onload = () => {
        console.log("loaded the reference image, triggering event");
        const e = new CustomEvent("bgImageLoaded", { bubbles: true });
        this.element.dispatchEvent(e);
      } 
    } catch (err) {
      console.log("Error selecting image: ", err);
    }
  }
}
