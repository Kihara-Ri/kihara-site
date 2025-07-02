---
title: Rust核心机制(二)
date: 2024-04-03
tags: 
  - Rust
  - programming
categories: 
  - Tutorial
---

# Rust核心机制(二)

<div style="text-align: center">
<img src="https://www.rust-lang.org/static/images/rust-logo-blk.svg" style="display: inline-block; vertical-align= middle;">
<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/rust_crab_logo.png" style="zoom: 12%; display: inline-block; vertical-align= middle;"/>
</div>

## Understanding Ownership

所有权(Ownership)是Rust最独特的功能，它对语言的其他部分有着非常重大的影响，使Rust在没有垃圾回收机制的情况下保证了内存的安全

<!-- more -->

### What Is Ownership?



```rust
fn main() {
    let s = String::from("Hello");
    takes_ownership(s);

    let x = 5;
    makes_copy(x);
}
fn takes_ownership(some_string: String) {
    println!("{}", some_string);
}
fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
}
```



### References and Borrowing



```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
}
fn calculate_length(s: &String) -> usize {
    s.len()
}
```



```rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    let r3 = &mut s;
    println!("{}", r3);
}
```



```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");
    &s
}
```



### The Slice Type



## Using Structs to Structure Related Data



### Defining and Instantiating Structs



### An Example Program Using Structs



### Method Syntax



