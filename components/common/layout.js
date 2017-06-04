//
// shared layout related functions
//

//calculate colums, rows and offsets from width, height and radius
export function getLayout(width, height, radius) {
  const padding = radius;
  const nCols = Math.floor((width - padding) / (2 * radius));
  const nRows = Math.floor((height - padding) / (2 * radius));
  const offsetX = (width - nCols * 2 * radius) / 2;
  const offsetY = (height - nRows * 2 * radius) / 2;

  return { nCols, nRows, offsetX, offsetY };
}


//return array with {x,y} objects for all cells
export function getCellCoords(width, height, radius) {
  return getGridCoords(width, height, radius, 0);
}


//return array with {x,y} objects for all grid point
export function getGridCoords(width, height, radius, gridOffset = 1) {
  const { nCols, nRows, offsetX, offsetY } = getLayout(width, height, radius);
  let dX = offsetX;
  let dY = offsetY;

  // adjust grid offset for grid or cell position
  if (gridOffset === 0) {
    dX = offsetX + radius;
    dY = offsetY + radius;
  }

  return Array
    .apply(null, { length: (nCols + gridOffset) * (nRows + gridOffset) })
    .map(Number.call, Number)
    .map(i => {
      return {
        index: i,
        x: (i % (nCols + gridOffset)) * 2 * radius - width / 2 + dX,
        y: Math.floor(i / (nCols + gridOffset)) * 2 * radius - height / 2 + dY
      }
    });
}


//convert flat array representing a generation
//into nested array of arrays with length of nCols
export function generationToGrid(gen, nCols) {
  var arr = [];
  var i;

  for (i = 0; i < gen.length; i += nCols) {
    arr.push(gen.slice(i, i + nCols));
  }

  return arr;
}


//slice or append cells to match row length
export function matchColumns(oldRow, nCols) {
  const row = oldRow.slice(0, nCols);
  
  while (row.length !== nCols) {
    row.push({ life: false });
  }
  
  return row;
}


//slice or append rows to match nRows
export function matchRows(oldGrid, nRows) {
  const grid = oldGrid.slice(0,nRows);
  
  while (grid.length !== nRows) {
    grid.push( grid[0].map(d => ({life: false }) ));
  }
  
  return grid;
}


//extend or shrink array to fit generation to new board layout
export function remapGeneration(generation, oldCols, newCols, newRows) {
  const oldGrid = generationToGrid(generation, oldCols);
  const newGrid = matchRows(oldGrid, newRows)
    .map(r => matchColumns(r, newCols));
  return [].concat(...newGrid);
}
