use std::sync::{Arc, Mutex};
use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use std::env;
use dotenvy::dotenv;
use env_logger;

#[derive(Serialize, Deserialize, Queryable, Insertable, Clone)]
#[diesel(table_name = todos)]
struct Todo {
    id: Option<i32>,
    text: String,
    completed: bool,
}

table! {
    todos (id) {
        id -> Nullable<Integer>,
        text -> Text,
        completed -> Bool,
    }
}
struct AppState {
    db: Arc<Mutex<SqliteConnection>>,
}

impl AppState {
    fn new() -> Self {
        dotenv().ok();
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let connection = SqliteConnection::establish(&database_url)
            .expect(&format!("Error connecting to {}", database_url));
        AppState { db: Arc::new(Mutex::new(connection)) }
    }
}

async fn get_todos(data: web::Data<AppState>) -> impl Responder {
    use self::todos::dsl::*;

    let mut db_conn = data.db.lock().unwrap();
    let results = todos
        .load::<Todo>(&mut *db_conn)
        .expect("Error loading todos");

    HttpResponse::Ok().json(results)
}

async fn add_todo(
    todo: web::Json<Todo>,
    data: web::Data<AppState>,
) -> impl Responder {
    use self::todos::dsl::*;
    let new_todo = Todo {
        id: None,
        text: todo.text.clone(),
        completed: todo.completed,
    };

    let mut db_conn = data.db.lock().unwrap(); // &mutを使用
    diesel::insert_into(todos)
        .values(&new_todo)
        .execute(&mut *db_conn) // &mutを使用
        .expect("Error saving new todo");

    HttpResponse::Created().json(new_todo)
}

async fn delete_todo(
    todo_id: web::Path<i32>,  // 修正: 直接パターンマッチングしない
    data: web::Data<AppState>,
) -> impl Responder {
    use self::todos::dsl::*;

    let mut db_conn = data.db.lock().unwrap();
    let num_deleted = diesel::delete(todos.filter(id.eq(*todo_id)))  // *を追加して参照を解除
        .execute(&mut *db_conn)
        .expect("Error deleting todo");

    if num_deleted > 0 {
        HttpResponse::Ok().finish()
    } else {
        HttpResponse::NotFound().finish()
    }
}

async fn update_todo(
    todo_id: web::Path<i32>,  // 修正: 直接パターンマッチングしない
    todo: web::Json<Todo>,
    data: web::Data<AppState>,
) -> impl Responder {
    use self::todos::dsl::*;

    let mut db_conn = data.db.lock().unwrap();
    let num_updated = diesel::update(todos.filter(id.eq(*todo_id)))  // *を追加して参照を解除
        .set((text.eq(&todo.text), completed.eq(todo.completed)))
        .execute(&mut *db_conn)
        .expect("Error updating todo");

    if num_updated > 0 {
        HttpResponse::Ok().json(todo.into_inner())
    } else {
        HttpResponse::NotFound().finish()
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    let app_state = web::Data::new(AppState::new());
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .route("/todos", web::get().to(get_todos))
            .route("/todos", web::post().to(add_todo))
            .route("/todos/{id}", web::delete().to(delete_todo))
            .route("/todos/{id}", web::put().to(update_todo))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}