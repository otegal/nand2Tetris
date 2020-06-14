use std::convert::{TryFrom};

#[allow(dead_code)]
pub fn entry_point() {
    println!("in bool_logic mod entry_point");
}

// 全ての基本
pub fn nand (x: u8, y: u8) -> u8 {
    if x == 1 && y == 1 {
        0
    } else {
        1
    }
}

// Nandに同じ値をいれるとNotになるよ
pub fn not (x: u8) -> u8 {
    nand(x, x)
}

// Nandの結果をNotすればOk
pub fn and (x: u8, y: u8) -> u8 {
    // not(nand(x, y))
    nand(nand(x, y), nand(x, y))
}

// 入力した値をNotで入替えてNandに通せばOk
pub fn or (x: u8, y: u8) -> u8 {
    // nand(not(x), not(y))
    nand(nand(x, x), nand(y, y))
}

// OrをNotすればOk
pub fn nor (x: u8, y: u8) -> u8 {
    // not(or(x, y))
    nand(nand(nand(x, x), nand(y, y)), nand(nand(x, x), nand(y, y)))
}

// むっず。。。
pub fn xor (x: u8, y: u8) -> u8 {
    nand(
        nand(x, nand(x, y)),
        nand(nand(x, y), y)
    )
}

fn and_16bit (x_arr: &[u8; 16], y_arr: &[u8; 16]) -> [u8; 16] {
    let mut result: [u8; 16] = [0; 16];
    for x in 0..x_arr.len() {
        for y in 0..y_arr.len() {
            if x == y {
                // result[x]= not(nand(x_arr[x], y_arr[y]));
                result[x]= nand(nand(x_arr[x], y_arr[y]), nand(x_arr[x], y_arr[y]));
            }
        }
    }
    result
}


#[cfg(test)]
mod test {
    use super::*;

    fn converter_16bit_to_array(input: &str) -> [u8; 16] {
        let mut output: [u8; 16] = [0; 16];
        for i in 0..input.len() {
            output[i] = u8::try_from(
                input.chars().nth(i).unwrap().to_digit(2).unwrap()
            ).unwrap();
        }
        output
    }

    #[test]
    fn nand_test() {
        assert_eq!(0, nand(1,  1));
        assert_eq!(1, nand(1,  0));
        assert_eq!(1, nand(0, 1));
        assert_eq!(1, nand(0, 0));
    }

    #[test]
    fn not_test() {
        assert_eq!(0, not(1));
        assert_eq!(1, not(0));
    }

    #[test]
    fn and_test() {
        assert_eq!(1, and(1,  1));
        assert_eq!(0, and(1,  0));
        assert_eq!(0, and(0, 1));
        assert_eq!(0, and(0, 0));
    }

    #[test]
    fn or_test() {
        assert_eq!(1, or(1, 1));
        assert_eq!(1, or(1, 0));
        assert_eq!(1, or(0, 1));
        assert_eq!(0, or(0, 0));
    }

    #[test]
    fn nor_test() {
        assert_eq!(0, nor(1, 1));
        assert_eq!(0, nor(1, 0));
        assert_eq!(0, nor(0, 1));
        assert_eq!(1, nor(0, 0));
    }

    #[test]
    fn xor_test() {
        assert_eq!(0, xor(1, 1));
        assert_eq!(1, xor(1, 0));
        assert_eq!(1, xor(0, 1));
        assert_eq!(0, xor(0, 0));
    }

    #[test]
    fn and_16bit_test() {
        assert_eq!(
            converter_16bit_to_array("0000000000000000"),
            and_16bit(
            &converter_16bit_to_array("0000000000000000"),
            &converter_16bit_to_array("0000000000000000")
            )
        );
        assert_eq!(
            converter_16bit_to_array("0000000000000000"),
            and_16bit(
                &converter_16bit_to_array("0000000000000000"),
                &converter_16bit_to_array("1111111111111111")
            )
        );
        assert_eq!(
            converter_16bit_to_array("1111111111111111"),
            and_16bit(
                &converter_16bit_to_array("1111111111111111"),
                &converter_16bit_to_array("1111111111111111")
            )
        );
        assert_eq!(
            converter_16bit_to_array("0000000000000000"),
            and_16bit(
                &converter_16bit_to_array("1010101010101010"),
                &converter_16bit_to_array("0101010101010101")
            )
        );
        assert_eq!(
            converter_16bit_to_array("0000110011000000"),
            and_16bit(
                &converter_16bit_to_array("0011110011000011"),
                &converter_16bit_to_array("0000111111110000")
            )
        );
        assert_eq!(
            converter_16bit_to_array("0001000000110100"),
            and_16bit(
                &converter_16bit_to_array("0001001000110100"),
                &converter_16bit_to_array("1001100001110110")
            )
        );
    }
}
