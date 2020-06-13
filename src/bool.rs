pub fn entry_point() {
    println!("in bool mod entry_point");
}

// 全ての基本
fn nand (x: bool, y: bool) -> bool {
    if x && y {
        false
    } else {
        true
    }
}

// Nandに同じ値をいれるとNotになるよ
fn not (x: bool) -> bool {
    nand(x, x)
}

// Nandの結果をNotすればOk
fn and (x: bool, y: bool) -> bool {
    // not(nand(x, y))
    nand(nand(x, y), nand(x, y))
}

// 入力した値をNotで入替えてNandに通せばOk
fn or (x: bool, y: bool) -> bool {
    // nand(not(x), not(y))
    nand(nand(x, x), nand(y, y))
}

// むっず。。。
fn xor (x: bool, y: bool) -> bool {
    nand(
        nand(x, nand(x, y)),
        nand(nand(x, y), y)
    )
}

fn and_2bit (x_arr: &[bool; 2], y_arr: &[bool; 2]) -> [bool; 2] {
    let mut result: [bool; 2] = [true, true];
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

    #[test]
    fn nand_test() {
        assert_eq!(false, nand(true,  true));
        assert_eq!(true, nand(true,  false));
        assert_eq!(true, nand(false, true));
        assert_eq!(true, nand(false, false));
    }

    #[test]
    fn not_test() {
        assert_eq!(false, not(true));
        assert_eq!(true, not(false));
    }

    #[test]
    fn and_test() {
        assert_eq!(true, and(true, true));
        assert_eq!(false, and(true, false));
        assert_eq!(false, and(false, true));
        assert_eq!(false, and(false, false));
    }

    #[test]
    fn or_test() {
        assert_eq!(true, or(true, true));
        assert_eq!(true, or(true, false));
        assert_eq!(true, or(false, true));
        assert_eq!(false, or(false, false));
    }

    #[test]
    fn xor_test() {
        assert_eq!(false, xor(true, true));
        assert_eq!(true, xor(true, false));
        assert_eq!(true, xor(false, true));
        assert_eq!(false, xor(false, false));
    }

    #[test]
    fn and_2bit_test() {
        assert_eq!([true, true], and_2bit(&[true, true], &[true, true]));
        assert_eq!([true, false], and_2bit(&[true, true], &[true, false]));
        assert_eq!([false, true], and_2bit(&[true, true], &[false, true]));
        assert_eq!([true, false], and_2bit(&[true, false], &[true, true]));
        assert_eq!([false, true], and_2bit(&[false, true], &[true, true]));
        assert_eq!([false, false], and_2bit(&[true, true], &[false, false]));
        assert_eq!([false, false], and_2bit(&[true, false], &[false, true]));
        assert_eq!([false, false], and_2bit(&[false, false], &[true, true]));
        assert_eq!([false, false], and_2bit(&[true, false], &[false, false]));
        assert_eq!([false, false], and_2bit(&[false, false], &[false, true]));
    }
}
