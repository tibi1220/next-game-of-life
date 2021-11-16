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
    setGridHistory(prevHistory => {
      const idx = prevHistory.length - 1;

      prevHistory = prevHistory.map(grid => grid.map(row => row.slice()));
      const newGrid = generateEmptyGrid(rows, cols);

      prevHistory.push(
        newGrid.map((row, i) =>
          row.map((cell, j) => {
            if (i < prevHistory[idx].length && j < prevHistory[idx][0].length) {
              return prevHistory[idx][i][j];
            }

            return cell;
          })
        )
      );

      return prevHistory;
    });
  }, [rows, cols]);

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
            Oszlopok száma:
          </label>
          <input
            disabled={isRunning}
            type="number"
            name="cols"
            id="cols"
            value={cols}
            onChange={e => {
              const value = parseInt(e.target.value);
              setCols(value > 0 ? value : 15);
            }}
          />
        </div>
        {/* Rows */}
        <div>
          <label style={{ display: 'block' }} htmlFor="cols">
            Sorok száma:
          </label>
          <input
            disabled={isRunning}
            type="number"
            name="rows"
            id="rows"
            value={rows}
            onChange={e => {
              const value = parseInt(e.target.value);
              setRows(value > 0 ? value : 15);
            }}
          />
        </div>
        {/* Tick */}
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
              const value = parseInt(e.target.value);
              setTick(value > 0 ? value : 300);
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
              const value = parseInt(e.target.value);
              setPercentile(value > 0 ? value : 25);
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
          Törlés
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

      {/* <div style={{ display: 'flex' }}>
        <div>
          {JSON.stringify(gridHistory[gridHistory.length - 1], null, 2)}
        </div>
      </div> */}

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {renderGrid(getColor, 'gridColor')}

        {renderGrid(getBW, 'gridBW')}
      </div>
    </>
  );
};

export default Home;
