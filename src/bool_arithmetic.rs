use crate::bool_logic;
use std::collections::HashMap;

#[allow(dead_code)]
pub fn entry_point() {
    println!("in bool_arithmetic mod entry_point");
}

fn half_adder(a: u8, b: u8) -> HashMap<&'static str, u8>{
    let mut result = HashMap::new();
    result.insert("carry", bool_logic::and(a, b));
    result.insert("sum", bool_logic::xor(a, b));
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
}
