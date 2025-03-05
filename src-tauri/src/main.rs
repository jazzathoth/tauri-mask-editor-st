// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
pub mod file_io;
pub mod mask;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
        mask::load_mask,
        mask::save_mask, 
        file_io::get_all_files, 
        file_io::open_image_bytes_nodlg])
    .run(tauri::generate_context!())
    .expect("Error while running Tauri app.");
}




