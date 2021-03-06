import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback, useRef } from 'react';

type Cell = 'born' | 'alive' | 'dead' | 'nothing';

type Grid = Cell[][];

type ColorCallback = (cell: Cell) => string;

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

const generateEmptyGrid = (rows: number, cols: number): Grid => {
  return Array.from(Array(rows), () =>
    Array.from(Array(cols), () => 'nothing')
  );
};

const generateRandomGrid = (
  percentile: number,
  rows: number,
  cols: number
): Grid => {
  return Array.from(Array(rows), () =>
    Array.from(Array(cols), () =>
      Math.random() * 100 < percentile ? 'alive' : 'nothing'
    )
  );
};

const Home: NextPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;

  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const [percentile, setPercentile] = useState(25);
  const [tick, setTick] = useState(300);

  const [gridHistory, setGridHistory] = useState<Grid[]>(() => {
    const retValue = [];
    retValue.push(generateEmptyGrid(rows, cols));
    return retValue;
  });

  useEffect(() => {
    setGridHistory(prevHist => {
      const idx = prevHist.length - 1;
      const difference = rows - prevHist[idx][0].length;

      return prevHist.map((grid, i) =>
        grid.map(row => {
          row = row.slice();

          if (i === idx) {
            if (difference > 0) {
              for (let i = 0; i < difference; i++) {
                row.push('nothing');
              }
            }
            for (let i = 0; i < Math.abs(difference); i++) {
              row.pop();
            }
          }

          return row;
        })
      );
    });

    console.log('Col change');
  }, [rows]);

  useEffect(() => {
    setGridHistory(prevHist => {
      const idx = prevHist.length - 1;
      const difference = cols - prevHist[idx].length;

      return prevHist.map((grid, i) => {
        grid = grid.map(row => row.slice());
        if (i === idx) {
          if (difference > 0) {
            for (let i = 0; i < difference; i++) {
              grid.push(Array.from(Array(grid[0].length), () => 'nothing'));
            }
          } else {
            for (let i = 0; i < Math.abs(difference); i++) {
              grid.pop();
            }
          }
        }
        return grid;
      });
    });

    console.log('Row change');
  }, [cols]);

  // const saveToHistory = useCallback((currentGrid: Grid) => {
  //   console.log('History saved');

  //   setGridHistory(prevHistory => {
  //     prevHistory = prevHistory.map(grid => grid.map(row => row.slice()));
  //     prevHistory.push(currentGrid);
  //     return prevHistory;
  //   });
  // }, []);

  const nextGrid = useCallback(() => {
    setGridHistory(prevHist => {
      const idx = prevHist.length - 1;
      prevHist = prevHist.map(grid => grid.map(row => row.slice()));

      let stop = true;
      let newGrid = prevHist[idx].map(row => row.slice());
      // let newGrid = JSON.parse(JSON.stringify(prevGrid));

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let neighbors = 0;

          operations.forEach(([x, y]) => {
            const newI = (i + x + rows) % rows;
            const newJ = (j + y + cols) % cols;

            if (
              prevHist[idx][newI][newJ] == 'alive' ||
              prevHist[idx][newI][newJ] == 'born'
            ) {
              neighbors++;
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            newGrid[i][j] =
              prevHist[idx][i][j] == 'alive' || prevHist[idx][i][j] == 'born'
                ? 'dead'
                : 'nothing';
          } else if (
            (prevHist[idx][i][j] == 'dead' ||
              prevHist[idx][i][j] == 'nothing') &&
            neighbors == 3
          ) {
            newGrid[i][j] = 'born';
          } else if (prevHist[idx][i][j] == 'born') {
            newGrid[i][j] = 'alive';
          } else if (prevHist[idx][i][j] == 'dead') {
            newGrid[i][j] = 'nothing';
          }
          if (
            newGrid[i][j] !== 'nothing' &&
            newGrid[i][j] !== prevHist[idx][i][j]
          ) {
            stop = false;
          }
        }
      }

      if (stop) {
        setIsRunning(false);
      }

      console.log('Going Forward');

      prevHist.push(newGrid);
      return prevHist;
    });
  }, [rows, cols]);

  const prevButtonClick = useCallback(() => {
    console.log('PrevButton Clicked');

    setGridHistory(prevHistory => {
      prevHistory = prevHistory.map(grid => grid.map(row => row.slice()));
      prevHistory.pop();

      return prevHistory;
    });
  }, []);

  const nextButtonClick = useCallback(() => {
    console.log('NextButton Clicked');

    nextGrid();
  }, [nextGrid]);

  const runSimulation = () => {
    if (!runningRef.current) {
      return;
    }
    console.log('Simulation: before next');
    // saveToHistory(grid.map(row => row.slice()));
    nextGrid();
    console.log('Simulation: after next');

    setTimeout(runSimulation, tick);
  };

  const renderGrid = (
    colorCallback: ColorCallback,
    id: string
  ): JSX.Element => {
    const idx = gridHistory.length - 1;

    return (
      <div id={id} style={{ padding: 4, paddingTop: 12 }}>
        {gridHistory[idx].map((row, rowIDX) => (
          <div key={`r${rowIDX}`} style={{ display: 'flex' }}>
            {row.map((col, colIDX) => (
              <div
                key={`r${rowIDX}c${colIDX}`}
                style={{
                  width: 20,
                  height: 20,
                  border: 'solid black 2px',
                  backgroundColor: colorCallback(col),
                }}
                onClick={() =>
                  setGridHistory(PrevHist =>
                    PrevHist.map((prevGrid, i) => {
                      prevGrid = prevGrid.map(row => row.slice());
                      if (i === idx) {
                        prevGrid[rowIDX][colIDX] =
                          prevGrid[rowIDX][colIDX] == 'nothing' ||
                          prevGrid[rowIDX][colIDX] == 'dead'
                            ? 'alive'
                            : 'nothing';
                      }

                      return prevGrid;
                    })
                  )
                }
              ></div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        {/* Cols */}
        <div>
          <label style={{ display: 'block' }} htmlFor="rows">
            Oszlopok sz??ma:
          </label>
          <input
            disabled={isRunning}
            type="number"
            name="rows"
            id="rows"
            value={rows}
            onChange={e => {
              setRows(parseInt(e.target.value));
            }}
          />
        </div>
        {/* Rows */}
        <div>
          <label style={{ display: 'block' }} htmlFor="cols">
            Sorok sz??ma:
          </label>
          <input
            disabled={isRunning}
            type="number"
            name="cols"
            id="cols"
            value={cols}
            onChange={e => {
              setCols(parseInt(e.target.value));
            }}
          />
        </div>
        {/* Tick */}
        <div>
          <label style={{ display: 'block' }} htmlFor="tick">
            Sebess??g: [ms]
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
        {/* Percentile */}
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
        {/* IsRunning */}
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
        {/* Random */}
        <button
          onClick={() => {
            setGridHistory(prevHist => {
              prevHist = prevHist.map(grid => grid.map(row => row.slice()));
              prevHist.push(generateRandomGrid(percentile, rows, cols));
              return prevHist;
            });
          }}
        >
          Random minta
        </button>
        {/* Delete */}
        <button
          onClick={() => {
            setGridHistory([generateEmptyGrid(rows, cols)]);
          }}
        >
          T??rl??s
        </button>
        {/* Prev buttun */}
        <button
          disabled={gridHistory.length <= 1 || isRunning}
          onClick={() => {
            prevButtonClick();
          }}
        >
          &lt;-
        </button>
        {/* Next button */}
        <button disabled={isRunning} onClick={nextButtonClick}>
          -&gt;
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        <div>
          {JSON.stringify(gridHistory[gridHistory.length - 1], null, 2)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {renderGrid(getColor, 'gridColor')}

        {renderGrid(getBW, 'gridBW')}
      </div>
    </>
  );
};

export default Home;
