use std::fs;
use std::io::{BufReader, BufRead};
use std::fs::File;

pub fn parser(f: File) {
    let reader = BufReader::new(f);

    let lines = reader.lines();
    for line in lines {
        println!("{:?}", line.unwrap()); // for debug
    }
}

fn hasMoreCommands() -> bool {
    true
}