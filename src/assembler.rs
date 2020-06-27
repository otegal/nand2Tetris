use std::env;
use std::fs;
use std::fs::File;
use std::io::{BufReader, BufRead};
use crate::assembler_parser;

pub fn assembler_main() {
    let program_path = &env::args().nth(1);
    match program_path {
        Some(path) => assemble(path),
        None => {
            println!("{}", "ファイルパスを指定してね");
            std::process::exit(0)
        }
    }
}

fn assemble(program_path: &str) {
    let f = fs::File::open(program_path).unwrap();
    assembler_parser::parser(f);
}

