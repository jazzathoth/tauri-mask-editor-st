import { Application } from "stimulus";
import GlobalCtrl from "./global_controller.js"
import ImageController from "./utils/image_controller.js";
import Draw from "./utils/draw_controller.js";
// import ClassData from "./utils/class_data_controller.js"

document.addEventListener("DOMContentLoaded", () => {
  const application = Application.start();

  application.register("global", GlobalCtrl);
  application.register("image", ImageController);
  application.register("drawing", Draw);
  // application.register("class-data", ClassData);

  console.log("registered my controllers");
  setTimeout(() => {
    console.log("Stimulus initialized. Registered controllers:", application.controllers)
  }, 1000);
  window.stimulusApp = application;
});
