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
}
