import React, { useState, useEffect, useRef } from 'react';
import produce from 'immer';

type Cell = 'born' | 'alive' | 'dead' | 'nothing';

const getColor = (cell: Cell) => {
  switch (cell) {
    case 'born':
      return 'green';
    case 'alive':
      return 'blue';
    case 'dead':
      return 'red';
    default:
      return 'gray';
  }
};

const getBW = (cell: Cell) => {
  switch (cell) {
    case 'born':
    case 'alive':
      return 'black';
    default:
      return 'gray';
  }
};

const operations = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];

const generateGrid = (rows: number, cols: number): Cell[][] => {
  return Array.from(Array(rows), () =>
    Array.from(Array(cols), () => 'nothing')
  );
};

const generateRandom = (
  percentile: number,
  rows: number,
  cols: number
): Cell[][] => {
  return Array.from(Array(rows), () =>
    Array.from(Array(cols), () =>
      Math.random() * 100 < percentile ? 'alive' : 'nothing'
    )
  );
};

const History: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const [tick, setTick] = useState(300);
  const [percentile, setPercentile] = useState(20);
  const [grid, setGrid] = useState<Cell[][]>(() => generateGrid(rows, cols));
  const [gridHistory, setGridHistory] = useState<Cell[][][]>([]);

  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;

  useEffect(() => {
    setGrid(prevGrid =>
      produce(prevGrid, gridCopy => {
        const difference = cols - prevGrid.length;

        if (difference > 0) {
          for (let i = 0; i < difference; i++) {
            gridCopy.push(
              Array.from(Array(gridCopy[0].length), () => 'nothing')
            );
          }
        } else {
          for (let i = 0; i < Math.abs(difference); i++) {
            gridCopy.pop();
          }
        }
      })
    );
  }, [cols]);

  useEffect(() => {
    setGrid(prevGrid =>
      produce(prevGrid, gridCopy => {
        const difference = rows - prevGrid[0].length;

        gridCopy.map(row => {
          if (difference > 0) {
            for (let i = 0; i < difference; i++) {
              row.push('nothing');
            }
          } else {
            for (let i = 0; i < Math.abs(difference); i++) {
              row.pop();
            }
          }
          return row;
        });
      })
    );
  }, [rows]);

  const getNextGrid = () => {
    setGrid(prevGrid => {
      return produce(prevGrid, newGrid => {
        let stop = true;

        const rows = prevGrid.length;
        const cols = prevGrid[0].length;

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let neighbors = 0;

            operations.forEach(([x, y]) => {
              const nI = (i + x + rows) % rows;
              const nJ = (j + y + rows) % cols;

              if (prevGrid[nI][nJ] == 'alive' || prevGrid[nI][nJ] == 'born') {
                neighbors++;
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              newGrid[i][j] =
                prevGrid[i][j] == 'alive' || prevGrid[i][j] == 'born'
                  ? 'dead'
                  : 'nothing';
            } else if (
              (prevGrid[i][j] == 'dead' || prevGrid[i][j] == 'nothing') &&
              neighbors == 3
            ) {
              newGrid[i][j] = 'born';
            } else if (prevGrid[i][j] == 'born') {
              newGrid[i][j] = 'alive';
            } else if (prevGrid[i][j] == 'dead') {
              newGrid[i][j] = 'nothing';
            }

            if (newGrid[i][j] !== 'nothing' && newGrid[i][j] !== prevGrid[i][j])
              stop = false;
          }
        }

        if (stop) setIsRunning(false);

        return newGrid;
      });
    });
  };

  const runSimulation = () => {
    if (!runningRef.current) return;

    setTimeout(runSimulation, tick);
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <div>
          <label style={{ display: 'block' }} htmlFor="rows">
            Oszlopok száma:
          </label>
          <input
            type="number"
            name="rows"
            id="rows"
            value={rows}
            onChange={e => {
              setRows(parseInt(e.target.value));
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block' }} htmlFor="cols">
            Sorok száma:
          </label>
          <input
            type="number"
            name="cols"
            id="cols"
            value={cols}
            onChange={e => {
              setCols(parseInt(e.target.value));
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block' }} htmlFor="tick">
            Sebesség: [ms]
          </label>
          <input
            type="number"
            name="tick"
            id="tick"
            value={tick}
            onChange={e => {
              setTick(parseInt(e.target.value));
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block' }} htmlFor="precentile">
            Percentilis: [%]
          </label>
          <input
            type="number"
            name="percentile"
            id="percentile"
            value={percentile}
            onChange={e => {
              setPercentile(parseInt(e.target.value));
            }}
          />
        </div>
        <button
          onClick={() => {
            if (!isRunning) {
              runningRef.current = true;
              runSimulation();
            }
            setIsRunning(prev => !prev);
          }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={() => {
            setGrid(generateRandom(percentile, rows, cols));
          }}
        >
          Random minta
        </button>
        <button
          onClick={() => {
            setGridHistory([]);
            setGrid(generateGrid(rows, cols));
          }}
        >
          Törlés
        </button>
        <button
          disabled={!gridHistory.length}
          onClick={() => {
            setIsRunning(false);
            setGrid(gridHistory.pop() as Cell[][]);
          }}
        >
          &lt;-
        </button>
        <button
          disabled={isRunning}
          onClick={() => {
            setGridHistory(prev => {
              const next = [...prev];
              next.push(grid);
              return next;
            });
            getNextGrid();
          }}
        >
          -&gt;
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        <div id="gridCOLOR" style={{ padding: 4, paddingTop: 12 }}>
          {grid.map((row, rowIDX) => (
            <div key={`r${rowIDX}`} style={{ display: 'flex' }}>
              {row.map((col, colIDX) => (
                <div
                  key={`r${rowIDX}c${colIDX}`}
                  style={{
                    width: 20,
                    height: 20,
                    border: 'solid black 2px',
                    backgroundColor: getColor(col),
                  }}
                  onClick={() =>
                    setGrid(prevgrid =>
                      produce(prevgrid, gridCopy => {
                        gridCopy[rowIDX][colIDX] =
                          prevgrid[rowIDX][colIDX] == 'nothing'
                            ? 'alive'
                            : 'nothing';
                      })
                    )
                  }
                ></div>
              ))}
            </div>
          ))}
        </div>

        <div id="gridCOLOR" style={{ padding: 4, paddingTop: 12 }}>
          {grid.map((row, rowIDX) => (
            <div key={`r${rowIDX}`} style={{ display: 'flex' }}>
              {row.map((col, colIDX) => (
                <div
                  key={`r${rowIDX}c${colIDX}`}
                  style={{
                    width: 20,
                    height: 20,
                    border: 'solid black 2px',
                    backgroundColor: getBW(col),
                  }}
                  onClick={() =>
                    setGrid(prevgrid =>
                      produce(prevgrid, gridCopy => {
                        gridCopy[rowIDX][colIDX] =
                          prevgrid[rowIDX][colIDX] == 'nothing'
                            ? 'alive'
                            : 'nothing';
                      })
                    )
                  }
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default History;
