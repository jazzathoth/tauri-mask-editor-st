use std::fs;
use std::io::{ self, Write };
use std::path::{ Path, PathBuf };
use base64::{engine::general_purpose::STANDARD, Engine as _};

macro_rules! handle_br {
  ($e:expr) => {
    match $e {
      Ok(val) => val,
      Err(e) => {
        println!("{e}");
        return false;
      }
    }
  }
}

#[tauri::command]
pub async fn save_mask(base_path: String, jpeg_name: String, png_bytes: Vec<u8>) -> bool {
  handle_br!(ensure_masks_folder(&base_path));

  let mask_path = get_mask_path(&base_path, &jpeg_name);
  let mut file = handle_br!(fs::File::create(&mask_path));

  handle_br!(file.write_all(&png_bytes));
  println!("Mask saved at {:?}", mask_path);
  true
}

#[tauri::command]
pub async fn load_mask(jpeg_name: &str, base_path: &str) -> Result<String, String> {
  let mask_path = get_mask_path(base_path, jpeg_name);
  
  if !mask_path.exists() {
    println!("Mask does not exist: {:?}", mask_path);
    return Ok("error".to_string());
  }

  let img_bytes = fs::read(mask_path).map_err(|e| format!("Read mask failed: {}", e))?;
  let base64_bytes = STANDARD.encode(img_bytes);
  Ok(base64_bytes)
}



fn ensure_masks_folder(base_path: &str) -> io::Result<()> {
  let masks_folder = Path::new(base_path).join("masks");

  if !masks_folder.exists() {
    fs::create_dir_all(&masks_folder)?;
  }
  Ok(())
}

fn get_mask_path(base_path: &str, image_filename: &str) -> PathBuf {
  let base_path = Path::new(base_path);
  let masks_folder = base_path.join("masks");

  let mask_filename = Path::new(image_filename).with_extension("png");
    
  masks_folder.join(mask_filename)
}
