use std::fs;
use std::path::Path;
use std::io;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_fs::FilePath;
use base64::{engine::general_purpose::STANDARD, Engine as _};


#[tauri::command]
pub async fn open_image_bytes_nodlg(path: &str) -> Result<String, String> {
  let rpath = Path::new(path);
  println!("opening an image at path {:?}", rpath);

  let img_bytes = fs::read(path).map_err(|e| format!("Read file failed: {}", e))?;

  let base64_bytes = STANDARD.encode(img_bytes);
  Ok(base64_bytes)
}


#[tauri::command]
pub async fn get_all_files(app_handle: tauri::AppHandle) -> Option<Vec<String>> {

  let dir_path = app_handle.dialog().file().blocking_pick_folder()?;
  if let FilePath::Path(path_buf) = dir_path {
    let jpegs_list = list_jpegs(&path_buf);
    jpegs_list.ok()
  } else {
    None
  }
}


fn list_jpegs(dir: &Path) -> io::Result<Vec<String>> {
  let mut files = Vec::new();
  if dir.is_dir() {
    for entry in fs::read_dir(dir)? {
      let entry = entry?;
      let path = entry.path();
      if let Some(ext) = path.extension() {
        if ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("jpeg") {
          files.push(path.to_string_lossy().into_owned());
        }
      }
    }
  }
  Ok(files)
}
