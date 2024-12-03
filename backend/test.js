function addMatrices(matrixA, matrixB) {
    // Check if matrices have the same dimensions
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
      return "Matrices must have the same dimensions for addition.";
    }
  
    const rows = matrixA.length;
    const cols = matrixA[0].length;
    const resultMatrix = [];
  
    for (let i = 0; i < rows; i++) {
      resultMatrix[i] = [];
      for (let j = 0; j < cols; j++) {
        resultMatrix[i][j] = matrixA[i][j] + matrixB[i][j];
      }
    }
  
    return resultMatrix;
  }
  
  
  // Example usage:
  const matrixA = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  
  const matrixB = [
    [9, 8, 7],
    [6, 5, 4],
    [3, 2, 1]
  ];
  
  const sumMatrix = addMatrices(matrixA, matrixB);
  
  console.log("Matrix A:");
  console.table(matrixA);
  console.log("Matrix B:");
  console.table(matrixB);
  console.log("Sum Matrix:");
  console.table(sumMatrix);
  
  
  //Example of error handling:
  const matrixC = [[1,2],[3,4]];
  const matrixD = [[1,2,3],[4,5,6]];
  const errorResult = addMatrices(matrixC,matrixD);
  console.log(errorResult); //Outputs "Matrices must have the same dimensions for addition."