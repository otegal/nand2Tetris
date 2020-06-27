mod bool_logic;
mod bool_arithmetic;
mod sequential_logic;
mod assembler;

fn main() {
    assembler::main();
    let s = "12(3456789";
    // let ss = {
    //     match &s.find("1") {
    //         Some(size) => true,
    //         None => false
    //     }
    // };
    // println!("{:?}", ss);

    // let d: Vec<&str> = s.split("(").collect();
    // println!("{:?}", d[1]);
}