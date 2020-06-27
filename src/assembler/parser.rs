use std::fs::File;
use std::io::{BufReader, BufRead};
use std::convert::TryInto;

#[derive(PartialEq)]
enum CommandType {
    A_COMMAND,
    C_COMMAND,
    L_COMMAND
}

pub struct Parser {
    instructions: Vec<String>,
    line_counter: u8,
    current_command: String
}

impl Parser {
    pub fn new(f: File) -> Parser {
        let reader = BufReader::new(f);
        let lines: Vec<String> = reader
            .lines()
            .map(|l| l.unwrap())
            .map(|l| match l.find("//") {
                Some(v) => l[0..v].to_string(),
                None => l,
            })
            .filter(|l| !l.is_empty())
            .map(|l| l.trim().to_owned())
            .collect();
        let first_cmd = lines[0].to_string();

        Parser {
            instructions: lines,
            line_counter: 0,
            current_command: first_cmd
        }
    }

    pub fn has_more_commands(&mut self) -> bool {
        self.instructions.len() > self.line_counter as usize
    }

    pub fn advance(&mut self) {
        if !self.has_more_commands() {
            return
        }

        let command = &self.current_command;
        if command.is_empty() {
            return
        }
    }

    pub fn command_type(&mut self) -> CommandType {
        match &self.current_command[0..1] {
            "@" => CommandType::A_COMMAND,
            "(" => CommandType::L_COMMAND,
            _   => CommandType::C_COMMAND
        }
    }

    pub fn symbol(&mut self) -> String {
        let str = match self.command_type() {
            CommandType::A_COMMAND => &self.current_command[0..1],
            CommandType::L_COMMAND => &self.current_command[1..2], // TODO implement
            CommandType::C_COMMAND => ""
        };
        str.to_string()
    }

    pub fn dest(&mut self) {
        if self.command_type() != CommandType::C_COMMAND {
            panic!("abababababababababa");
        }
        // TODO implement
    }

    pub fn comp(&mut self) {
        if self.command_type() != CommandType::C_COMMAND {
            panic!("abababababababababa");
        }
        // TODO implement
    }

    pub fn jump(&mut self) {
        if self.command_type() != CommandType::C_COMMAND {
            panic!("abababababababababa");
        }
        // TODO implement
    }
}
