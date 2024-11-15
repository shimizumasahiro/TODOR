// @generated automatically by Diesel CLI.

diesel::table! {
    todos (id) {
        id -> Nullable<Integer>,
        text -> Text,
        completed -> Bool,
    }
}
