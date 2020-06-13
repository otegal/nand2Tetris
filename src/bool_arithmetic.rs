use crate::bool_logic;
use std::collections::HashMap;

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
    let mut result: [u8; 16] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
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

fn incremnter(a_arr: &[u8; 16]) -> [u8; 16] {
    const INCREMENTER: [u8; 16] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

    // without overflow check
    let mut result: [u8; 16] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
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


#[cfg(test)]
mod test {
    use super::*;

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
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            adder_16bit(
                &[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                &[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            )
        );
        assert_eq!(
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            adder_16bit(
                &[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                &[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            )
        );
        assert_eq!(
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            adder_16bit(
                &[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                &[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            )
        );
        assert_eq!(
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            adder_16bit(
                &[1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                &[0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
            )
        );
        assert_eq!(
            [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1],
            adder_16bit(
                &[0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
                &[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]
            )
        );
        assert_eq!(
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            adder_16bit(
                &[0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0],
                &[1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0]
            )
        );
    }

    #[test]
    fn incrementer_test() {
        assert_eq!(
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            incremnter(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        );
        assert_eq!(
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            incremnter(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        );
        assert_eq!(
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
            incremnter(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1])
        );
        assert_eq!(
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            incremnter(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1])
        );
    }
}
