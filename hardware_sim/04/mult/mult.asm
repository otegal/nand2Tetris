// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.
// 掛け算はできないので、R0をR1回分だけ足し合わせることで計算する
    @i      // iはメモリの特定の場所を参照している
    M=1     // i=1  Mはメモリのこと。Mは直前で@で呼び出したシンボルを使う
    @R2     // R2はメモリの特定の場所を参照している
    M=0     // R2=0 Mはメモリのこと。結果の初期化をしています
(LOOP)
    @i      // iはメモリの特定の場所を参照している。前述で定義した@iと同じアドレスになるはず
    D=M     // D=i  Dレジスタにiを格納する
    @R1
    D=D-M   // D=i-R1  Dレジスタにi-R1の結果を格納する
    @END
    D;JGT   // if (i - R1 > 0) goto END;
    @R0
    D=M     // D=R0
    @R2
    M=D+M   // M=R0+R2
    @i
    M=M+1   // M=i+1
    @LOOP
    0;JMP   // goto LOOP
(END)
    @END
    0;JMP   // goto END よって無限