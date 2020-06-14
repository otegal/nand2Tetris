use crate::bool_logic;
use std::collections::HashMap;
use std::convert::{TryFrom};

#[allow(dead_code)]
pub fn entry_point() {
    println!("in bool_arithmetic mod entry_point");
}

fn half_adder(a: u8, b: u8) -> HashMap<&'static str, u8> {
    let mut result = HashMap::new();
    let carry: u8 = bool_logic::and(a, b);
    let sum: u8 = bool_logic::xor(a, b);

    result.insert("carry", carry);
    result.insert("sum", sum);
    result
}

fn full_adder(a: u8, b: u8, c: u8) -> HashMap<&'static str, u8> {
    let mut result = HashMap::new();
    let ha_first: HashMap<&'static str, u8> = half_adder(a, b);
    let ha_second: HashMap<&'static str, u8> = half_adder(c, ha_first["sum"]);
    let carry: u8 = bool_logic::or(ha_second["carry"], ha_first["carry"]);
    let sum: u8 = ha_second["sum"];

    result.insert("carry", carry);
    result.insert("sum", sum);
    result
}

fn adder_16bit(a_arr: &[u8; 16], b_arr: &[u8; 16]) -> [u8; 16] {
    // without overflow check
    let mut result: [u8; 16] = [0; 16];
    let mut carry: u8 = 0;

    for a in 0..a_arr.len() {
        for b in 0..b_arr.len() {
            if a == b {
                let fa = full_adder(a_arr[a_arr.len() - 1 - a], b_arr[b_arr.len() - 1 - b], carry);
                result[result.len() - 1 - a] = fa["sum"];
                carry = fa["carry"];
            }
        }
    }
    result
}

fn incrementer(a_arr: &[u8; 16]) -> [u8; 16] {
    const INCREMENTER: [u8; 16] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

    // without overflow check
    let mut result: [u8; 16] = [0; 16];
    let mut carry: u8 = 0;

    for a in 0..a_arr.len() {
        for b in 0..INCREMENTER.len() {
            if a == b {
                let fa = full_adder(a_arr[a_arr.len() - 1 - a], INCREMENTER[INCREMENTER.len() - 1 - b], carry);
                result[result.len() - 1 - a] = fa["sum"];
                carry = fa["carry"];
            }
        }
    }
    result
}

fn alu(x_arr: &[u8; 16], y_arr: &[u8; 16], zx: u8, nx: u8, zy: u8, ny: u8, f: u8, no: u8)
    -> ([u8; 16], u8, u8) {
    // ググりまくってもよくわからん。。。

    // Arithmetic and Logic Unit
    // zx: 入力xを0にする
    // nx: 入力xを反転する
    // zy: 入力yを0にする
    // ny: 入力yを反転する
    // f:  1だったら加算、0だったらAnd演算
    // no: 出力outを反転する

    // if zx then x = 0
    let out_zx: [u8; 16] = bool_logic::mux_16bit(x_arr, &[0; 16], zx);

    // if nx then x = !x
    let not_nx: [u8; 16] = bool_logic::not_16bit(&out_zx);
    let out_nx: [u8; 16] = bool_logic::mux_16bit(&out_zx, &not_nx, nx);

    // if zy then y = 0
    let out_zy: [u8; 16] = bool_logic::mux_16bit(y_arr, &[0; 16], zy);

    // if ny then y = !y
    let not_ny: [u8; 16] = bool_logic::not_16bit(&out_zy);
    let out_ny: [u8; 16] = bool_logic::mux_16bit(&out_zy, &not_ny, ny);

    // if f then out = x + y
    //      else out = x & y
    let x_plus_y: [u8; 16] = adder_16bit(&out_nx, &out_ny);
    let x_and_y: [u8; 16] = bool_logic::and_16bit(&out_nx, &out_ny);
    let f_xy: [u8; 16] = bool_logic::mux_16bit(&x_and_y, &x_plus_y, f);

    // if no then out = !out
    let not_f_xy: [u8; 16] = bool_logic::not_16bit(&f_xy);
    let out: [u8; 16] = bool_logic::mux_16bit(&f_xy, &not_f_xy, no);

    let mut ret0: [u8; 8] = [0; 8];
    let mut ret1: [u8; 8] = [0; 8];
    let retsign: u8 = out[0];
    for i in 0..8 { ret0[i] = out[i]; }
    for i in 8..16 { ret1[i - 8] = out[i]; }

    let ret0is0 = bool_logic::or_8way(&ret0);
    let ret1is0 = bool_logic::or_8way(&ret1);

    // if out = 0 then zr = 1 else zr = 0
    let inverse_zr: u8 = bool_logic::or(ret0is0, ret1is0);
    let zr: u8 = bool_logic::not(inverse_zr);

    // if out < 0 then ng = 1 else ng = 0
    let ng: u8 = bool_logic::and(retsign, 1);

    (out, zr, ng)
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

    #[test]
    fn converter_16bit_to_array_test() {
        assert_eq!([1; 16], converter_16bit_to_array("1111111111111111"));
        assert_eq!([0; 16], converter_16bit_to_array("0000000000000000"));
        assert_eq!([1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], converter_16bit_to_array("1001001001001001"));
    }

    #[test]
    fn half_adder_test() {
        assert_eq!(1, half_adder(1, 1)["carry"]);
        assert_eq!(0, half_adder(1, 0)["carry"]);
        assert_eq!(0, half_adder(0, 1)["carry"]);
        assert_eq!(0, half_adder(0, 0)["carry"]);
        assert_eq!(0, half_adder(1, 1)["sum"]);
        assert_eq!(1, half_adder(1, 0)["sum"]);
        assert_eq!(1, half_adder(0, 1)["sum"]);
        assert_eq!(0, half_adder(0, 0)["sum"]);
    }

    #[test]
    fn full_adder_test() {
        assert_eq!(0, full_adder(0, 0, 0)["carry"]);
        assert_eq!(0, full_adder(0, 0, 1)["carry"]);
        assert_eq!(0, full_adder(0, 1, 0)["carry"]);
        assert_eq!(1, full_adder(0, 1, 1)["carry"]);
        assert_eq!(0, full_adder(1, 0, 0)["carry"]);
        assert_eq!(1, full_adder(1, 0, 1)["carry"]);
        assert_eq!(1, full_adder(1, 1, 0)["carry"]);
        assert_eq!(1, full_adder(1, 1, 1)["carry"]);

        assert_eq!(0, full_adder(0, 0, 0)["sum"]);
        assert_eq!(1, full_adder(0, 0, 1)["sum"]);
        assert_eq!(1, full_adder(0, 1, 0)["sum"]);
        assert_eq!(0, full_adder(0, 1, 1)["sum"]);
        assert_eq!(1, full_adder(1, 0, 0)["sum"]);
        assert_eq!(0, full_adder(1, 0, 1)["sum"]);
        assert_eq!(0, full_adder(1, 1, 0)["sum"]);
        assert_eq!(1, full_adder(1, 1, 1)["sum"]);
    }

    #[test]
    fn adder_16bit_test() {
        assert_eq!(
            converter_16bit_to_array("0000000000000000"),
            adder_16bit(
                &converter_16bit_to_array("0000000000000000"),
                &converter_16bit_to_array("0000000000000000")
            )
        );
        assert_eq!(
            converter_16bit_to_array("1111111111111111"),
            adder_16bit(
                &converter_16bit_to_array("0000000000000000"),
                &converter_16bit_to_array("1111111111111111")
            )
        );
        assert_eq!(
            converter_16bit_to_array("1111111111111110"),
            adder_16bit(
                &converter_16bit_to_array("1111111111111111"),
                &converter_16bit_to_array("1111111111111111")
            )
        );
        assert_eq!(
            converter_16bit_to_array("1111111111111111"),
            adder_16bit(
                &converter_16bit_to_array("1010101010101010"),
                &converter_16bit_to_array("0101010101010101")
            )
        );
        assert_eq!(
            converter_16bit_to_array("0100110010110011"),
            adder_16bit(
                &converter_16bit_to_array("0011110011000011"),
                &converter_16bit_to_array("0000111111110000")
            )
        );
        assert_eq!(
            converter_16bit_to_array("1010101010101010"),
            adder_16bit(
                &converter_16bit_to_array("0001001000110100"),
                &converter_16bit_to_array("1001100001110110")
            )
        );
    }

    #[test]
    fn incrementer_test() {
        assert_eq!(
            converter_16bit_to_array("0000000000000001"),
            incrementer(&converter_16bit_to_array("0000000000000000"))
        );
        assert_eq!(
            converter_16bit_to_array("0000000000000000"),
            incrementer(&converter_16bit_to_array("1111111111111111"))
        );
        assert_eq!(
            converter_16bit_to_array("0000000000000110"),
            incrementer(&converter_16bit_to_array("0000000000000101"))
        );
        assert_eq!(
            converter_16bit_to_array("1111111111111100"),
            incrementer(&converter_16bit_to_array("1111111111111011"))
        );
    }

    #[test]
    fn aul_test() {
        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 0, 1, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 1, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 1, 1, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 0, 0, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 1, 1, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 0, 0, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 0, 0, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 1, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 0, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 1, 1, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            1, 1, 0, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111110"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 0, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 1, 0, 0, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 0, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 0, 0, 0, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("1111111111111111"),
            0, 1, 0, 1, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 0, 1, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000000"), result.0);
        assert_eq!(1, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 1, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("1111111111111111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 1, 1, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000010001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 0, 0, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000011"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 1, 1, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111101110"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 0, 0, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111111100"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111101111"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 0, 0, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111111101"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 1, 1, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000010010"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 0, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000000100"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 1, 1, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000010000"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            1, 1, 0, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000010"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 0, 0, 1, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000010100"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 1, 0, 0, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000001110"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 0, 1, 1, 1,
        );
        assert_eq!(converter_16bit_to_array("1111111111110010"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(1, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 0, 0, 0, 0, 0,
        );
        assert_eq!(converter_16bit_to_array("0000000000000001"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);


        let result = alu(
            &converter_16bit_to_array("0000000000010001"),
            &converter_16bit_to_array("0000000000000011"),
            0, 1, 0, 1, 0, 1,
        );
        assert_eq!(converter_16bit_to_array("0000000000010011"), result.0);
        assert_eq!(0, result.1);
        assert_eq!(0, result.2);
    }
}
