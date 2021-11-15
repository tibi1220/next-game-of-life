import type { NextPage } from 'next';
import React, { useState, useEffect, useRef } from 'react';

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
  const [percentile, setPercentile] = useState(15);
  const [tick, setTick] = useState(300);

  const [grid, setGrid] = useState<Grid>(() => generateEmptyGrid(15, 15));
  const [gridHistory, setGridHistory] = useState<Grid[]>([]);

  useEffect(() => {
    setGrid(prevGrid => {
      const difference = rows - prevGrid[0].length;

      return prevGrid.map(row => {
        row = row.slice();

        if (difference > 0) {
          for (let i = 0; i < difference; i++) {
            row.push('nothing');
          }
        }
        for (let i = 0; i < Math.abs(difference); i++) {
          row.pop();
        }

        return row;
      });
    });
  }, [rows]);

  useEffect(() => {
    setGrid(prevGrid => {
      const difference = cols - prevGrid.length;

      prevGrid = prevGrid.map(row => row.slice());

      if (difference > 0) {
        for (let i = 0; i < difference; i++) {
          prevGrid.push(Array.from(Array(prevGrid[0].length), () => 'nothing'));
        }
      } else {
        for (let i = 0; i < Math.abs(difference); i++) {
          prevGrid.pop();
        }
      }

      return prevGrid;
    });
  }, [cols]);

  const nextGrid = (isGoingBack: boolean) => {
    setGrid(prevGrid => {
      let stop = true;
      let newGrid = prevGrid.map(row => row.slice());

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let neighbors = 0;

          operations.forEach(([x, y]) => {
            const newI = (i + x + rows) % rows;
            const newJ = (j + y + cols) % cols;

            if (
              prevGrid[newI][newJ] == 'alive' ||
              prevGrid[newI][newJ] == 'born'
            ) {
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
          if (newGrid[i][j] !== 'nothing' && newGrid[i][j] !== prevGrid[i][j]) {
            stop = false;
          }
        }
      }

      if (stop) {
        setIsRunning(false);
      }

      if (!isGoingBack) {
        setGridHistory(prevHist => {
          prevHist = prevHist.map(grid => grid.map(row => row.slice()));
          prevHist.push(prevGrid.map(row => row.slice()));

          return prevHist;
        });
      }

      return newGrid;
    });
  };

  const prevButtonClick = () => {
    setGridHistory(prevHistory => {
      prevHistory = prevHistory.map(grid => grid.map(row => row.slice()));
      setGrid(prevHistory.pop() as Grid);

      return prevHistory;
    });
  };

  const nextButtonClick = () => {
    nextGrid(false);
  };

  const runSimulation = () => {
    if (!runningRef.current) {
      return;
    }
    nextGrid(false);

    setTimeout(runSimulation, tick);
  };

  const renderGrid = (
    colorCallback: ColorCallback,
    id: string
  ): JSX.Element => {
    return (
      <div id={id} style={{ padding: 4, paddingTop: 12 }}>
        {grid.map((row, rowIDX) => (
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
                  setGrid(prevGrid => {
                    prevGrid = prevGrid.map(row => row.slice());
                    prevGrid[rowIDX][colIDX] =
                      prevGrid[rowIDX][colIDX] == 'nothing' ||
                      prevGrid[rowIDX][colIDX] == 'dead'
                        ? 'alive'
                        : 'nothing';

                    return prevGrid;
                  })
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
            setGrid(generateRandomGrid(percentile, rows, cols));
          }}
        >
          Random minta
        </button>
        <button
          onClick={() => {
            setGrid(generateEmptyGrid(rows, cols));
          }}
        >
          Törlés
        </button>
        {/* Prev buttun */}
        <button
          disabled={!gridHistory.length || isRunning}
          onClick={prevButtonClick}
        >
          &lt;-
        </button>
        {/* Next button */}
        <button disabled={isRunning} onClick={nextButtonClick}>
          -&gt;
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        {renderGrid(getColor, 'gridColor')}

        {renderGrid(getBW, 'gridBW')}
      </div>
    </>
  );
};

export default Home;
