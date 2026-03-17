use std::fs;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::Emitter;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub management_url: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            management_url: "http://localhost:8317/management.html#/".to_string(),
        }
    }
}

pub fn validate_url(url: &str) -> Result<(), String> {
    if url.starts_with("http://") || url.starts_with("https://") {
        Ok(())
    } else {
        Err("Invalid URL: must start with http:// or https://".to_string())
    }
}

#[tauri::command]
fn save_config(app: tauri::AppHandle, url: String) -> Result<(), String> {
    validate_url(&url)?;
    let config_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    let config = AppConfig { management_url: url };
    let json = serde_json::to_string(&config).map_err(|e| e.to_string())?;
    fs::write(config_dir.join("config.json"), json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_config(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let config_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let config_path = config_dir.join("config.json");

    if config_path.exists() {
        match fs::read_to_string(&config_path) {
            Ok(contents) => match serde_json::from_str::<AppConfig>(&contents) {
                Ok(config) => return Ok(config),
                Err(_) => {}
            },
            Err(_) => {}
        }
    }

    Ok(AppConfig::default())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let reload = MenuItemBuilder::new("Reload")
                .id("reload")
                .accelerator("CmdOrCtrl+R")
                .build(app)?;

            let settings = MenuItemBuilder::new("Settings...")
                .id("settings")
                .accelerator("CmdOrCtrl+,")
                .build(app)?;

            let app_submenu = SubmenuBuilder::new(app, "App")
                .item(&reload)
                .item(&settings)
                .separator()
                .quit()
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                match event.id().as_ref() {
                    "reload" => { let _ = app.emit("menu:reload", ()); }
                    "settings" => { let _ = app.emit("menu:settings", ()); }
                    _ => {}
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_config, save_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
