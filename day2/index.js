const [, , action, ...numbers] = process.argv;
console.log('🚀 ~ params:', action, numbers);

function add(numbers) {
  return numbers.reduce((acc, val) => {
    return acc + parseInt(val);
  }, 0);
}

function divide(numbers) {
  if (parseInt(numbers[1]) !== 0) {
    return parseInt(numbers[0]) / parseInt(numbers[1]);
  }
  console.error("the second number can't be zero");
}

function subtract(numbers) {
  let nums = numbers.map(Number);
  if (nums.length < 2 || nums.some(Number.isNaN)) {
    console.error('need 2 valid numbers');
    return;
  }
  return nums.slice(1).reduce((acc, v) => acc - v, nums[0]);
}

function multiply(numbers) {
  let nums = numbers.map(Number);
  if (nums.length < 2 || nums.some(Number.isNaN)) {
    console.error('need 2 valid numbers');
    return;
  }
  return nums.reduce((acc, v) => acc * v, 1);
}

let result;
switch (action) {
  case 'add':
    result = add(numbers);
    break;
  case 'divide':
    result = divide(numbers);
    break;
  case 'sub':
    {
      result = subtract(numbers);
    }
    break;
  case 'multi':
    {
      result = multiply(numbers);
    }
    break;
  default:
    break;
}

console.log('your result is: ', result);
