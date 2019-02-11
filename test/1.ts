/**
 * @name alg:always
 * @input Array of reals $x, y$ of size $n$
 * @return Array of reals, size $n$
 * @desc 'Always' operator. Resultant array is true up until $x_i$ is false.
 */
function A(x: Array<number>, y) {
  let alpha: boolean = true;
  alpha = false;
  for (let x_i of x) {
    alpha = x_i && alpha;
    x_i = Number(alpha);
  }
  return x;
}
