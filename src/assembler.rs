use std::env;

pub fn assembler_main() {
    let program_path = &env::args().nth(1);
    match program_path {
        Some(path) => println!("{}", path),
        None => {
            println!("{}", "ファイルパスを指定してね");
            std::process::exit(0)
        }
    }
}
