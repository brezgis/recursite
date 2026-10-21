#!/usr/bin/env python3
"""Turn Gödel numbers back into words.

    cat quotes.txt | python3 decode.py
    python3 decode.py 30233088

The k-th character of a quote is the exponent of the k-th prime:
"hi" = 2^9 * 3^10, since space=1, a=2, ..., h=9, i=10.
"""
import sys

ALPHABET = " abcdefghijklmnopqrstuvwxyz.,'-/?!:;áéíóúäöüñō0123456789"

if hasattr(sys, "set_int_max_str_digits"):
    sys.set_int_max_str_digits(0)


def primes():
    found = []
    n = 2
    while True:
        if all(n % p for p in found if p * p <= n):
            found.append(n)
            yield n
        n += 1


def decode(n):
    chars = []
    for p in primes():
        if n == 1:
            return "".join(chars)
        e = 0
        while n % p == 0:
            n //= p
            e += 1
        if e == 0:
            raise ValueError("not a Gödel number: a prime was skipped")
        chars.append(ALPHABET[e - 1])


if __name__ == "__main__":
    lines = sys.argv[1:] or sys.stdin
    for line in lines:
        line = line.strip()
        print(decode(int(line)) if line else "")
