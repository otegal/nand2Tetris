use crate::bool_logic;
use std::convert::{TryFrom};

static mut CLOCK: u8 = 0;
static mut STOCKED_BEFORE_DFF_INPUT: u8 = 0;
// static mut STOCKED_BEFORE_REGISTER_INPUT: [u8; 16] = [0; 16];

#[allow(dead_code)]
pub fn entry_point() {
    println!("in sequential_logic mod entry_point");
}

fn tick_tock() {
    unsafe { CLOCK += 1; }
}

fn dff(input: u8) -> u8 {
    let output: u8 = unsafe { STOCKED_BEFORE_DFF_INPUT };
    // 今回入力値はグローバル変数に格納して次のクロックで利用する
    unsafe {
        STOCKED_BEFORE_DFF_INPUT = input
    }
    output
}

fn bit(input: u8, load: u8) -> u8 {
    // ex
    // let mut output: u8 = 0;
    //
    // ここの選択をマルチプレクサでおこなう
    // if unsafe { STOCKED_BEFORE_BIT_LOAD } == 1 {
    //     unsafe { output = STOCKED_BEFORE_BIT_INPUT }
    // } else {
    //     unsafe { output = STOCKED_BEFORE_BIT_OUTPUT }
    // }
    //
    // ここの1回前の情報をdffに入れる
    // unsafe {
    //     STOCKED_BEFORE_BIT_INPUT = input;
    //     STOCKED_BEFORE_BIT_OUTPUT = output;
    //     STOCKED_BEFORE_BIT_LOAD = load;
    // }
    // output

    let mux_out: u8 = bool_logic::mux(unsafe { STOCKED_BEFORE_DFF_INPUT }, input, load);
    let output: u8 = dff(mux_out);
    output
}

fn register(input_arr: &[u8; 16], load: u8) -> [u8; 16] {
    let mut output: [u8; 16] = [0; 16];
    // println!("{}", load);
    // if load == 1 {
    //     output = unsafe { STOCKED_BEFORE_REGISTER_INPUT }
    // } else {
    //     for i in 0..output.len() {
    //         output[i] = bit(input_arr[i], load);
    //     }
    // }
    // println!("{:?}", output);
    // unsafe { STOCKED_BEFORE_REGISTER_INPUT = output }

    for i in 0..output.len() {
        output[i] = bit(input_arr[i], load);
    }
    output
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

    fn bit_test_exec(expect: u8, input: u8, load: u8) {
        tick_tock();
        assert_eq!(expect, bit(input, load));
    }

    fn register_test_exec(expect: i16, input: i16, load: u8) {
        tick_tock();
        // .cpmファイルが10進数で記載されているのでビット列に変換してから比較する
        // expect
        let formatted_expect: String = format!("{:0b}", expect);
        let expect_arr: [u8; 16] = converter_16bit_to_array(&formatted_expect);
        // input
        let formatted_input: String = format!("{:0b}", input);
        let input_arr: [u8; 16] = converter_16bit_to_array(&formatted_input);

        assert_eq!(expect_arr, register(&input_arr, load));
    }

    #[test]
    fn bit_test() {
        bit_test_exec(0, 0, 0);
        bit_test_exec(0, 0, 0);
        bit_test_exec(0, 0, 1);
        bit_test_exec(0, 0, 1);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 1);
        bit_test_exec(1, 1, 1);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 1, 0);
        bit_test_exec(1, 1, 0);
        bit_test_exec(1, 0, 1);
        bit_test_exec(0, 0, 1);
        bit_test_exec(0, 1, 1);
        bit_test_exec(1, 1, 1);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 0);
        bit_test_exec(1, 0, 1);
        bit_test_exec(0, 0, 1);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);
        bit_test_exec(0, 1, 0);

        // teardown
        unsafe {
            CLOCK = 0;
            STOCKED_BEFORE_DFF_INPUT = 0;
        }
    }

    #[test]
    fn register_test() {
        register_test_exec(     0,      0 , 0);
        register_test_exec(     0,      0 , 0);
        register_test_exec(     0,      0 , 1);
        register_test_exec(     0,      0 , 1);
        register_test_exec(     0, -32123 , 0);
        register_test_exec(     0, -32123 , 0);
        register_test_exec(     0,  11111 , 0);
        register_test_exec(     0,  11111 , 0);
        register_test_exec(     0, -32123 , 1);
        // register_test_exec(-32123, -32123 , 1);
        // register_test_exec(-32123, -32123 , 1);
        // register_test_exec(-32123, -32123 , 1);
        // register_test_exec(-32123, -32123 , 0);
        // register_test_exec(-32123, -32123 , 0);
        // register_test_exec(-32123,  12345 , 1);
        // register_test_exec( 12345,  12345 , 1);
        // register_test_exec( 12345,      0 , 0);
        // register_test_exec( 12345,      0 , 0);
        // register_test_exec( 12345,      0 , 1);
        // register_test_exec(     0,      0 , 1);
        // register_test_exec(     0,      1 , 0);
        // register_test_exec(     0,      1 , 0);
        // register_test_exec(     0,      1 , 1);
        // register_test_exec(     1,      1 , 1);
        // register_test_exec(     1,      2 , 0);
        // register_test_exec(     1,      2 , 0);
        // register_test_exec(     1,      2 , 1);
        // register_test_exec(     2,      2 , 1);
        // register_test_exec(     2,      4 , 0);
        // register_test_exec(     2,      4 , 0);
        // register_test_exec(     2,      4 , 1);
        // register_test_exec(     4,      4 , 1);
        // register_test_exec(     4,      8 , 0);
        // register_test_exec(     4,      8 , 0);
        // register_test_exec(     4,      8 , 1);
        // register_test_exec(     8,      8 , 1);
        // register_test_exec(     8,     16 , 0);
        // register_test_exec(     8,     16 , 0);
        // register_test_exec(     8,     16 , 1);
        // register_test_exec(    16,     16 , 1);
        // register_test_exec(    16,     32 , 0);
        // register_test_exec(    16,     32 , 0);
        // register_test_exec(    16,     32 , 1);
        // register_test_exec(    32,     32 , 1);
        // register_test_exec(    32,     64 , 0);
        // register_test_exec(    32,     64 , 0);
        // register_test_exec(    32,     64 , 1);
        // register_test_exec(    64,     64 , 1);
        // register_test_exec(    64,    128 , 0);
        // register_test_exec(    64,    128 , 0);
        // register_test_exec(    64,    128 , 1);
        // register_test_exec(   128,    128 , 1);
        // register_test_exec(   128,    256 , 0);
        // register_test_exec(   128,    256 , 0);
        // register_test_exec(   128,    256 , 1);
        // register_test_exec(   256,    256 , 1);
        // register_test_exec(   256,    512 , 0);
        // register_test_exec(   256,    512 , 0);
        // register_test_exec(   256,    512 , 1);
        // register_test_exec(   512,    512 , 1);
        // register_test_exec(   512,   1024 , 0);
        // register_test_exec(   512,   1024 , 0);
        // register_test_exec(   512,   1024 , 1);
        // register_test_exec(  1024,   1024 , 1);
        // register_test_exec(  1024,   2048 , 0);
        // register_test_exec(  1024,   2048 , 0);
        // register_test_exec(  1024,   2048 , 1);
        // register_test_exec(  2048,   2048 , 1);
        // register_test_exec(  2048,   4096 , 0);
        // register_test_exec(  2048,   4096 , 0);
        // register_test_exec(  2048,   4096 , 1);
        // register_test_exec(  4096,   4096 , 1);
        // register_test_exec(  4096,   8192 , 0);
        // register_test_exec(  4096,   8192 , 0);
        // register_test_exec(  4096,   8192 , 1);
        // register_test_exec(  8192,   8192 , 1);
        // register_test_exec(  8192,  16384 , 0);
        // register_test_exec(  8192,  16384 , 0);
        // register_test_exec(  8192,  16384 , 1);
        // register_test_exec( 16384,  16384 , 1);
        // register_test_exec( 16384, -32768 , 0);
        // register_test_exec( 16384, -32768 , 0);
        // register_test_exec( 16384, -32768 , 1);
        // register_test_exec(-32768, -32768 , 1);
        // register_test_exec(-32768,     -2 , 0);
        // register_test_exec(-32768,     -2 , 0);
        // register_test_exec(-32768,     -2 , 1);
        // register_test_exec(    -2,     -2 , 1);
        // register_test_exec(    -2,     -3 , 0);
        // register_test_exec(    -2,     -3 , 0);
        // register_test_exec(    -2,     -3 , 1);
        // register_test_exec(    -3,     -3 , 1);
        // register_test_exec(    -3,     -5 , 0);
        // register_test_exec(    -3,     -5 , 0);
        // register_test_exec(    -3,     -5 , 1);
        // register_test_exec(    -5,     -5 , 1);
        // register_test_exec(    -5,     -9 , 0);
        // register_test_exec(    -5,     -9 , 0);
        // register_test_exec(    -5,     -9 , 1);
        // register_test_exec(    -9,     -9 , 1);
        // register_test_exec(    -9,    -17 , 0);
        // register_test_exec(    -9,    -17 , 0);
        // register_test_exec(    -9,    -17 , 1);
        // register_test_exec(   -17,    -17 , 1);
        // register_test_exec(   -17,    -33 , 0);
        // register_test_exec(   -17,    -33 , 0);
        // register_test_exec(   -17,    -33 , 1);
        // register_test_exec(   -33,    -33 , 1);
        // register_test_exec(   -33,    -65 , 0);
        // register_test_exec(   -33,    -65 , 0);
        // register_test_exec(   -33,    -65 , 1);
        // register_test_exec(   -65,    -65 , 1);
        // register_test_exec(   -65,   -129 , 0);
        // register_test_exec(   -65,   -129 , 0);
        // register_test_exec(   -65,   -129 , 1);
        // register_test_exec(  -129,   -129 , 1);
        // register_test_exec(  -129,   -257 , 0);
        // register_test_exec(  -129,   -257 , 0);
        // register_test_exec(  -129,   -257 , 1);
        // register_test_exec(  -257,   -257 , 1);
        // register_test_exec(  -257,   -513 , 0);
        // register_test_exec(  -257,   -513 , 0);
        // register_test_exec(  -257,   -513 , 1);
        // register_test_exec(  -513,   -513 , 1);
        // register_test_exec(  -513,  -1025 , 0);
        // register_test_exec(  -513,  -1025 , 0);
        // register_test_exec(  -513,  -1025 , 1);
        // register_test_exec( -1025,  -1025 , 1);
        // register_test_exec( -1025,  -2049 , 0);
        // register_test_exec( -1025,  -2049 , 0);
        // register_test_exec( -1025,  -2049 , 1);
        // register_test_exec( -2049,  -2049 , 1);
        // register_test_exec( -2049,  -4097 , 0);
        // register_test_exec( -2049,  -4097 , 0);
        // register_test_exec( -2049,  -4097 , 1);
        // register_test_exec( -4097,  -4097 , 1);
        // register_test_exec( -4097,  -8193 , 0);
        // register_test_exec( -4097,  -8193 , 0);
        // register_test_exec( -4097,  -8193 , 1);
        // register_test_exec( -8193,  -8193 , 1);
        // register_test_exec( -8193, -16385 , 0);
        // register_test_exec( -8193, -16385 , 0);
        // register_test_exec( -8193, -16385 , 1);
        // register_test_exec(-16385, -16385 , 1);
        // register_test_exec(-16385,  32767 , 0);
        // register_test_exec(-16385,  32767 , 0);
        // register_test_exec(-16385,  32767 , 1);
        // register_test_exec( 32767,  32767 , 1);

        // teardown
        unsafe {
            CLOCK = 0;
            STOCKED_BEFORE_DFF_INPUT = 0;
        }
    }
}
