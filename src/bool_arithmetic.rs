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

// fn alu(x_arr: &[u8; 16], y_arr: [u8; 16], zx: u8, nx: u8, zy: u8, ny: u8, f: u8, no: u8)
//     -> ([u8; 16], u8, u8)
// {
//     // Arithmetic and Logic Unit
//     // zx: 入力xを0にする
//     // nx: 入力xを反転する
//     // zy: 入力yを0にする
//     // ny: 入力yを反転する
//
// }

#[cfg(test)]
mod test {
    use super::*;

    fn converter_16bit_to_array(input: &str) -> [u8; 16] {
        let mut output: [u8; 16] = [0; 16];
        for i in 0..input.len() {
            output[i] = u8::try_from(input.chars().nth(i).unwrap().to_digit(2).unwrap()).unwrap();
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

    // #[test]
    // fn aul_test() {
    //
    // }
}
