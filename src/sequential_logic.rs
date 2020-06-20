use crate::bool_logic;

static mut CLOCK: u8 = 0;
static mut STOCKED_DFF_OUTPUT: u8 = 0;

#[allow(dead_code)]
pub fn entry_point() {
    println!("in sequential_logic mod entry_point");
}

fn tick_tock() {
    unsafe { CLOCK += 1; }
}

fn dff(input: u8) -> u8 {
    let output: u8 = unsafe { STOCKED_DFF_OUTPUT };
    // 今回入力値はグローバル変数に格納して次のクロックで利用する
    unsafe {
        STOCKED_DFF_OUTPUT = input
    }
    output
}

fn bit(input: u8, load: u8) -> u8 {
    let mux_out = bool_logic::mux(unsafe { STOCKED_DFF_OUTPUT }, input, load);
    dff(mux_out)
}


#[cfg(test)]
mod test {
    use super::*;

    fn bit_test_exec(expect: u8, input: u8, load: u8) {
        tick_tock();
        assert_eq!(expect, bit(input, load));
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
    }
}
