import { add } from './math';

// Describe block groups related tests
describe('Math utilities', () => {
  // Individual test case
  test('add function should correctly add two numbers', () => {
    // Arrange: Set up inputs
    const a = 2;
    const b = 3;

    // Act: Call the function
    const result = add(a, b);

    // Assert: Check the result
    expect(result).toBe(5);
  });

  // Another test case
  test('add function works with negative numbers', () => {
    const result = add(-1, -2);
    expect(result).toBe(-3);
  });
});