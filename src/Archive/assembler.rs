use std::env;
use std::fs;
use std::fs::File;
use std::io::{BufReader, BufRead};

pub mod parser;
pub mod code;

pub fn main() {
    let program_path = &env::args().nth(1);
    match program_path {
        Some(path) => {
            let f = fs::File::open(path).unwrap();
            parser::Parser::new(f);
        },
        None => {
            println!("{}", "ファイルパスを指定してね");
            std::process::exit(0)
        }
    }
}
