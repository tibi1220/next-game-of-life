import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback, useRef } from 'react';

type Cell = 1 | 0;
type Grid = Cell[][];

const defaultRows = 3;
const defaultCols = 3;

const generateEmptyGrid = (rows: number, cols: number): Grid => {
  return Array.from(Array(rows), () => Array.from(Array(cols), () => 0));
};

const Home: NextPage = () => {
  const [rows, setRows] = useState(defaultRows);
  const [cols, setCols] = useState(defaultCols);
  const [grid, setGrid] = useState(() =>
    generateEmptyGrid(defaultRows, defaultCols)
  );

  useEffect(() => {
    setGrid(generateEmptyGrid(rows, cols));
  }, [rows, cols]);

  return (
    <>
      <div style={{ display: 'flex' }}>
        <label style={{ display: 'block' }} htmlFor="rows">
          Oszlopok száma:
        </label>
        <input
          type="number"
          name="rows"
          id="rows"
          value={cols}
          onChange={e => {
            setCols(parseInt(e.target.value));
          }}
        />
        <label style={{ display: 'block' }} htmlFor="rows">
          Sorok száma:
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

      <div style={{ padding: 4, paddingTop: 12 }}>
        {grid.map((row, i) => (
          <div key={i} style={{ display: 'flex' }}>
            {row.map((cell, j) => (
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: 'solid black 2px',
                  backgroundColor: cell ? 'black' : 'white',
                }}
                key={j}
              ></div>
            ))}
          </div>
        ))}
      </div>

      <div>{JSON.stringify(grid)}</div>
    </>
  );
};

export default Home;
