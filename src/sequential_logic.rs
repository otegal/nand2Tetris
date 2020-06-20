use crate::bool_logic;
use std::convert::{TryFrom};

#[allow(dead_code)]
pub fn entry_point() {
    println!("in sequential_logic mod entry_point");
}

struct Dff {
    pre_value: u8
}

impl Dff {
    fn new(init_status: u8) -> Dff {
        Dff {
            pre_value: init_status
        }
    }
    fn exec(&mut self, change: u8) -> u8 {
        let result = self.pre_value;
        self.pre_value = change;
        result
    }
}

struct Bit {
    dff: Dff
}

impl Bit {
    fn new() -> Bit {
        Bit {
            dff: Dff::new(0)
        }
    }
    fn exec(&mut self, input: u8, load: u8) -> u8 {
        let value = bool_logic::mux(self.dff.pre_value, input, load);
        self.dff.exec(value)
    }
}

struct Register {
    bits: [Bit; 16]
}

impl Register {
    fn new() -> Register {
        Register {
            bits: [
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
                Bit::new(),
            ]
        }
    }
    fn exec(&mut self, input_arr: &[u8; 16], load: u8) -> [u8; 16] {
        [
            self.bits[0].exec(input_arr[0], load),
            self.bits[1].exec(input_arr[1], load),
            self.bits[2].exec(input_arr[2], load),
            self.bits[3].exec(input_arr[3], load),
            self.bits[4].exec(input_arr[4], load),
            self.bits[5].exec(input_arr[5], load),
            self.bits[6].exec(input_arr[6], load),
            self.bits[7].exec(input_arr[7], load),
            self.bits[8].exec(input_arr[8], load),
            self.bits[9].exec(input_arr[9], load),
            self.bits[10].exec(input_arr[10], load),
            self.bits[11].exec(input_arr[11], load),
            self.bits[12].exec(input_arr[12], load),
            self.bits[13].exec(input_arr[13], load),
            self.bits[14].exec(input_arr[14], load),
            self.bits[15].exec(input_arr[15], load),
        ]
    }
}

struct Ram8 {
    registers: [Register; 8]
}

impl Ram8 {
    fn new() -> Ram8 {
        Ram8 {
            registers: [
                Register::new(),
                Register::new(),
                Register::new(),
                Register::new(),
                Register::new(),
                Register::new(),
                Register::new(),
                Register::new(),
            ]
        }
    }
    fn exec(&mut self, input_arr: &[u8; 16], load: u8, address: &[u8; 3]) -> [u8; 16] {
        let selector = bool_logic::dmux_8way(load, address);
        println!("{:?} {:?} {:?}",load, address, selector);
        bool_logic::mux_8way_16bit(
            &self.registers[0].exec(input_arr, selector[0]),
            &self.registers[1].exec(input_arr, selector[1]),
            &self.registers[2].exec(input_arr, selector[2]),
            &self.registers[3].exec(input_arr, selector[3]),
            &self.registers[4].exec(input_arr, selector[4]),
            &self.registers[5].exec(input_arr, selector[5]),
            &self.registers[6].exec(input_arr, selector[6]),
            &self.registers[7].exec(input_arr, selector[7]),
            address
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;

    fn converter_16bit_to_array<'a>(input: &'a str) -> [u8; 16] {
        let mut output: [u8; 16] = [0; 16];
        for i in 0..input.len() {
            output[i] = u8::try_from(
                input.chars().nth(i).unwrap().to_digit(2).unwrap()
            ).unwrap();
        }
        output
    }

    fn converter_3bit_to_array<'a>(input: &'a str) -> [u8; 3] {
        let mut output: [u8; 3] = [0; 3];
        for i in 0..input.len() {
            output[i] = u8::try_from(
                input.chars().nth(i).unwrap().to_digit(2).unwrap()
            ).unwrap();
        }
        output
    }

    fn register_test_exec(expect: i16, input: i16, load: u8, register: &mut Register) {
        // .cpmファイルが10進数で記載されているのでビット列に変換してから比較する
        // expect
        let formatted_expect: String = format!("{:0b}", expect);
        let expect_arr: [u8; 16] = converter_16bit_to_array(&formatted_expect);
        // input
        let formatted_input: String = format!("{:0b}", input);
        let input_arr: [u8; 16] = converter_16bit_to_array(&formatted_input);

        assert_eq!(expect_arr, register.exec(&input_arr, load));
    }

    #[test]
    fn dff_test() {
        let mut dff: Dff = Dff::new(0);
        assert_eq!(0, dff.exec(1));
        assert_eq!(1, dff.exec(0));
        assert_eq!(0, dff.exec(0));
        assert_eq!(0, dff.exec(1));
        assert_eq!(1, dff.exec(1));
        assert_eq!(1, dff.exec(1));
    }

    #[test]
    fn bit_test() {
        let mut bit: Bit = Bit::new();
        assert_eq!(0, bit.exec(0, 0));
        assert_eq!(0, bit.exec(0, 0));
        assert_eq!(0, bit.exec(0, 1));
        assert_eq!(0, bit.exec(0, 1));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 1));
        assert_eq!(1, bit.exec(1, 1));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(1, 0));
        assert_eq!(1, bit.exec(1, 0));
        assert_eq!(1, bit.exec(0, 1));
        assert_eq!(0, bit.exec(0, 1));
        assert_eq!(0, bit.exec(1, 1));
        assert_eq!(1, bit.exec(1, 1));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 0));
        assert_eq!(1, bit.exec(0, 1));
        assert_eq!(0, bit.exec(0, 1));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
        assert_eq!(0, bit.exec(1, 0));
    }

    #[test]
    fn register_test() {
        let mut register = Register::new();
        register_test_exec(     0,      0 , 0, &mut register);
        register_test_exec(     0,      0 , 0, &mut register);
        register_test_exec(     0,      0 , 1, &mut register);
        register_test_exec(     0,      0 , 1, &mut register);
        register_test_exec(     0, -32123 , 0, &mut register);
        register_test_exec(     0, -32123 , 0, &mut register);
        register_test_exec(     0,  11111 , 0, &mut register);
        register_test_exec(     0,  11111 , 0, &mut register);
        register_test_exec(     0, -32123 , 1, &mut register);
        register_test_exec(-32123, -32123 , 1, &mut register);
        register_test_exec(-32123, -32123 , 1, &mut register);
        register_test_exec(-32123, -32123 , 1, &mut register);
        register_test_exec(-32123, -32123 , 0, &mut register);
        register_test_exec(-32123, -32123 , 0, &mut register);
        register_test_exec(-32123,  12345 , 1, &mut register);
        register_test_exec( 12345,  12345 , 1, &mut register);
        register_test_exec( 12345,      0 , 0, &mut register);
        register_test_exec( 12345,      0 , 0, &mut register);
        register_test_exec( 12345,      0 , 1, &mut register);
        register_test_exec(     0,      0 , 1, &mut register);
        register_test_exec(     0,      1 , 0, &mut register);
        register_test_exec(     0,      1 , 0, &mut register);
        register_test_exec(     0,      1 , 1, &mut register);
        register_test_exec(     1,      1 , 1, &mut register);
        register_test_exec(     1,      2 , 0, &mut register);
        register_test_exec(     1,      2 , 0, &mut register);
        register_test_exec(     1,      2 , 1, &mut register);
        register_test_exec(     2,      2 , 1, &mut register);
        register_test_exec(     2,      4 , 0, &mut register);
        register_test_exec(     2,      4 , 0, &mut register);
        register_test_exec(     2,      4 , 1, &mut register);
        register_test_exec(     4,      4 , 1, &mut register);
        register_test_exec(     4,      8 , 0, &mut register);
        register_test_exec(     4,      8 , 0, &mut register);
        register_test_exec(     4,      8 , 1, &mut register);
        register_test_exec(     8,      8 , 1, &mut register);
        register_test_exec(     8,     16 , 0, &mut register);
        register_test_exec(     8,     16 , 0, &mut register);
        register_test_exec(     8,     16 , 1, &mut register);
        register_test_exec(    16,     16 , 1, &mut register);
        register_test_exec(    16,     32 , 0, &mut register);
        register_test_exec(    16,     32 , 0, &mut register);
        register_test_exec(    16,     32 , 1, &mut register);
        register_test_exec(    32,     32 , 1, &mut register);
        register_test_exec(    32,     64 , 0, &mut register);
        register_test_exec(    32,     64 , 0, &mut register);
        register_test_exec(    32,     64 , 1, &mut register);
        register_test_exec(    64,     64 , 1, &mut register);
        register_test_exec(    64,    128 , 0, &mut register);
        register_test_exec(    64,    128 , 0, &mut register);
        register_test_exec(    64,    128 , 1, &mut register);
        register_test_exec(   128,    128 , 1, &mut register);
        register_test_exec(   128,    256 , 0, &mut register);
        register_test_exec(   128,    256 , 0, &mut register);
        register_test_exec(   128,    256 , 1, &mut register);
        register_test_exec(   256,    256 , 1, &mut register);
        register_test_exec(   256,    512 , 0, &mut register);
        register_test_exec(   256,    512 , 0, &mut register);
        register_test_exec(   256,    512 , 1, &mut register);
        register_test_exec(   512,    512 , 1, &mut register);
        register_test_exec(   512,   1024 , 0, &mut register);
        register_test_exec(   512,   1024 , 0, &mut register);
        register_test_exec(   512,   1024 , 1, &mut register);
        register_test_exec(  1024,   1024 , 1, &mut register);
        register_test_exec(  1024,   2048 , 0, &mut register);
        register_test_exec(  1024,   2048 , 0, &mut register);
        register_test_exec(  1024,   2048 , 1, &mut register);
        register_test_exec(  2048,   2048 , 1, &mut register);
        register_test_exec(  2048,   4096 , 0, &mut register);
        register_test_exec(  2048,   4096 , 0, &mut register);
        register_test_exec(  2048,   4096 , 1, &mut register);
        register_test_exec(  4096,   4096 , 1, &mut register);
        register_test_exec(  4096,   8192 , 0, &mut register);
        register_test_exec(  4096,   8192 , 0, &mut register);
        register_test_exec(  4096,   8192 , 1, &mut register);
        register_test_exec(  8192,   8192 , 1, &mut register);
        register_test_exec(  8192,  16384 , 0, &mut register);
        register_test_exec(  8192,  16384 , 0, &mut register);
        register_test_exec(  8192,  16384 , 1, &mut register);
        register_test_exec( 16384,  16384 , 1, &mut register);
        register_test_exec( 16384, -32768 , 0, &mut register);
        register_test_exec( 16384, -32768 , 0, &mut register);
        register_test_exec( 16384, -32768 , 1, &mut register);
        register_test_exec(-32768, -32768 , 1, &mut register);
        register_test_exec(-32768,     -2 , 0, &mut register);
        register_test_exec(-32768,     -2 , 0, &mut register);
        register_test_exec(-32768,     -2 , 1, &mut register);
        register_test_exec(    -2,     -2 , 1, &mut register);
        register_test_exec(    -2,     -3 , 0, &mut register);
        register_test_exec(    -2,     -3 , 0, &mut register);
        register_test_exec(    -2,     -3 , 1, &mut register);
        register_test_exec(    -3,     -3 , 1, &mut register);
        register_test_exec(    -3,     -5 , 0, &mut register);
        register_test_exec(    -3,     -5 , 0, &mut register);
        register_test_exec(    -3,     -5 , 1, &mut register);
        register_test_exec(    -5,     -5 , 1, &mut register);
        register_test_exec(    -5,     -9 , 0, &mut register);
        register_test_exec(    -5,     -9 , 0, &mut register);
        register_test_exec(    -5,     -9 , 1, &mut register);
        register_test_exec(    -9,     -9 , 1, &mut register);
        register_test_exec(    -9,    -17 , 0, &mut register);
        register_test_exec(    -9,    -17 , 0, &mut register);
        register_test_exec(    -9,    -17 , 1, &mut register);
        register_test_exec(   -17,    -17 , 1, &mut register);
        register_test_exec(   -17,    -33 , 0, &mut register);
        register_test_exec(   -17,    -33 , 0, &mut register);
        register_test_exec(   -17,    -33 , 1, &mut register);
        register_test_exec(   -33,    -33 , 1, &mut register);
        register_test_exec(   -33,    -65 , 0, &mut register);
        register_test_exec(   -33,    -65 , 0, &mut register);
        register_test_exec(   -33,    -65 , 1, &mut register);
        register_test_exec(   -65,    -65 , 1, &mut register);
        register_test_exec(   -65,   -129 , 0, &mut register);
        register_test_exec(   -65,   -129 , 0, &mut register);
        register_test_exec(   -65,   -129 , 1, &mut register);
        register_test_exec(  -129,   -129 , 1, &mut register);
        register_test_exec(  -129,   -257 , 0, &mut register);
        register_test_exec(  -129,   -257 , 0, &mut register);
        register_test_exec(  -129,   -257 , 1, &mut register);
        register_test_exec(  -257,   -257 , 1, &mut register);
        register_test_exec(  -257,   -513 , 0, &mut register);
        register_test_exec(  -257,   -513 , 0, &mut register);
        register_test_exec(  -257,   -513 , 1, &mut register);
        register_test_exec(  -513,   -513 , 1, &mut register);
        register_test_exec(  -513,  -1025 , 0, &mut register);
        register_test_exec(  -513,  -1025 , 0, &mut register);
        register_test_exec(  -513,  -1025 , 1, &mut register);
        register_test_exec( -1025,  -1025 , 1, &mut register);
        register_test_exec( -1025,  -2049 , 0, &mut register);
        register_test_exec( -1025,  -2049 , 0, &mut register);
        register_test_exec( -1025,  -2049 , 1, &mut register);
        register_test_exec( -2049,  -2049 , 1, &mut register);
        register_test_exec( -2049,  -4097 , 0, &mut register);
        register_test_exec( -2049,  -4097 , 0, &mut register);
        register_test_exec( -2049,  -4097 , 1, &mut register);
        register_test_exec( -4097,  -4097 , 1, &mut register);
        register_test_exec( -4097,  -8193 , 0, &mut register);
        register_test_exec( -4097,  -8193 , 0, &mut register);
        register_test_exec( -4097,  -8193 , 1, &mut register);
        register_test_exec( -8193,  -8193 , 1, &mut register);
        register_test_exec( -8193, -16385 , 0, &mut register);
        register_test_exec( -8193, -16385 , 0, &mut register);
        register_test_exec( -8193, -16385 , 1, &mut register);
        register_test_exec(-16385, -16385 , 1, &mut register);
        register_test_exec(-16385,  32767 , 0, &mut register);
        register_test_exec(-16385,  32767 , 0, &mut register);
        register_test_exec(-16385,  32767 , 1, &mut register);
        register_test_exec( 32767,  32767 , 1, &mut register);
    }

    fn ram8_test_exec(expect: i16, input: i16, load: u8, address: u8, ram8: &mut Ram8) {
        // .cpmファイルが10進数で記載されているのでビット列に変換してから比較する
        // expect
        let formatted_expect: String = format!("{:0b}", expect);
        let expect_arr: [u8; 16] = converter_16bit_to_array(&formatted_expect);
        // input
        let formatted_input: String = format!("{:0b}", input);
        let input_arr: [u8; 16] = converter_16bit_to_array(&formatted_input);
        // address
        let pre_formatted_address: String = format!("{:0b}", address);
        let formatted_address: String = format!("{:0>3}",pre_formatted_address);
        let address_arr: [u8; 3] = converter_3bit_to_array(&formatted_address);

        assert_eq!(expect_arr, ram8.exec(&input_arr, load, &address_arr));
    }

    #[test]
    fn ram8_test() {
        let mut ram8 = Ram8::new();
        ram8_test_exec(     0,      0, 0, 0, &mut ram8);
        ram8_test_exec(     0,      0, 1, 0, &mut ram8);
        ram8_test_exec(     0,      0, 1, 0, &mut ram8);
        ram8_test_exec(     0,  11111, 0, 0, &mut ram8);
        ram8_test_exec(     0,  11111, 0, 0, &mut ram8);
        ram8_test_exec(     0,  11111, 1, 1, &mut ram8);
        ram8_test_exec( 11111,  11111, 1, 1, &mut ram8);
        ram8_test_exec(     0,  11111, 0, 0, &mut ram8);
        ram8_test_exec(     0,  11111, 0, 0, &mut ram8);
        ram8_test_exec(     0,   3333, 0, 3, &mut ram8);
        ram8_test_exec(     0,   3333, 0, 3, &mut ram8);
        ram8_test_exec(     0,   3333, 1, 3, &mut ram8);
        ram8_test_exec(  3333,   3333, 1, 3, &mut ram8);
        ram8_test_exec(  3333,   3333, 0, 3, &mut ram8);
        ram8_test_exec(  3333,   3333, 0, 3, &mut ram8);
        ram8_test_exec( 11111,   3333, 0, 1, &mut ram8);
        ram8_test_exec( 11111,   7777, 0, 1, &mut ram8);
        ram8_test_exec( 11111,   7777, 0, 1, &mut ram8);
        ram8_test_exec(     0,   7777, 1, 7, &mut ram8);
        ram8_test_exec(  7777,   7777, 1, 7, &mut ram8);
        ram8_test_exec(  7777,   7777, 0, 7, &mut ram8);
        ram8_test_exec(  7777,   7777, 0, 7, &mut ram8);
        ram8_test_exec(  3333,   7777, 0, 3, &mut ram8);
        ram8_test_exec(  7777,   7777, 0, 7, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 0, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 0, &mut ram8);
        ram8_test_exec( 11111,   7777, 0, 1, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 2, &mut ram8);
        ram8_test_exec(  3333,   7777, 0, 3, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 4, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 5, &mut ram8);
        ram8_test_exec(     0,   7777, 0, 6, &mut ram8);
        ram8_test_exec(  7777,   7777, 0, 7, &mut ram8);
        ram8_test_exec(     0,  21845, 1, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 0, &mut ram8);
        ram8_test_exec( 11111,  21845, 1, 1, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 1, &mut ram8);
        ram8_test_exec(     0,  21845, 1, 2, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 2, &mut ram8);
        ram8_test_exec(  3333,  21845, 1, 3, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 3, &mut ram8);
        ram8_test_exec(     0,  21845, 1, 4, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 4, &mut ram8);
        ram8_test_exec(     0,  21845, 1, 5, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 5, &mut ram8);
        ram8_test_exec(     0,  21845, 1, 6, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 6, &mut ram8);
        ram8_test_exec(  7777,  21845, 1, 7, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 7, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 1, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 2, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 3, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 4, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 5, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 6, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 7, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 0, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 0, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 0, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 1, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 1, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 2, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 2, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 3, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 3, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 4, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 4, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 5, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 5, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 6, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 6, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 6, &mut ram8);
        ram8_test_exec( 21845, -21846, 1, 7, &mut ram8);
        ram8_test_exec(-21846, -21846, 1, 7, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 0, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 1, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 2, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 3, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 4, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 5, &mut ram8);
        ram8_test_exec( 21845, -21846, 0, 6, &mut ram8);
        ram8_test_exec(-21846, -21846, 0, 7, &mut ram8);
        ram8_test_exec(-21846,  21845, 1, 7, &mut ram8);
        ram8_test_exec( 21845,  21845, 1, 7, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 0, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 1, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 2, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 3, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 4, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 5, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 6, &mut ram8);
        ram8_test_exec( 21845,  21845, 0, 7, &mut ram8);
    }
}
