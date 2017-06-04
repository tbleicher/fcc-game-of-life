//
// logic functions for Game of Life
//


//Return array of immediate neighbours to cell at [x,y]
export function arrayOfNeighbours(x, y, grid) {
  return [
    grid[y - 1][x - 1],
    grid[y - 1][x],
    grid[y - 1][x + 1],
    grid[y][x - 1],
    grid[y][x + 1],
    grid[y + 1][x - 1],
    grid[y + 1][x],
    grid[y + 1][x + 1],
  ]
}

//convert flat array representing generation
//into nested array of arrays with length of nCols
export function generationToGrid(gen, nCols) {
  var arr = [];
  var i;

  for (i = 0; i < gen.length; i += nCols) {
    arr.push(gen.slice(i, i + nCols));
  }

  return arr;
}

//Return true if cell at idx is alive in new generation
export function isAlive(cell, neighbours) {
  var sum = neighbours.filter(function (n) {
    return n.life;
  }).length;

  if (cell.life && sum === 2) {
    return true;
  }
  if (cell.life && sum === 3) {
    return true;
  }
  if (!cell.life && sum === 3) {
    return true;
  }
  return false;
}

//extend nested array representing the game board
//by repeating the first row at the end, then
//inserting the last row at the beginning.
//Repeat for columns.
//
//Example:
//
// 9  7 8 9  7
// 
// 3  1 2 3  1
// 6  4 5 6  4
// 9  7 8 9  7
// 
// 3  1 2 3  1 
export function lookupArray(old) {
  return []
    .concat([old[old.length - 1]], old, [old[0]])
    .map(function (r) {
      return [].concat(r[r.length - 1], r, [r[0]]);
    });
}

//Build array representing next generation of cells
export function newGeneration(old, nCols) {
  //transform array to grid (nested array)
  var grid = generationToGrid(old, nCols);
  //extend grid by one row/column in each direction
  var lookup = lookupArray(grid);

  var newGen = old.map(function (d, idx) {
    var x = idx % nCols;
    var y = Math.floor(idx / nCols);
    var n = arrayOfNeighbours(x + 1, y + 1, lookup);

    return Object.assign({}, d, { life: isAlive(d, n) });
  })

  return newGen;
}
