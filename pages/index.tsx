import Link from 'next/link';

import styles from '../styles/Home.module.css';

import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <>
      <div>
        <Link href="v1">
          <a>V1</a>
        </Link>
      </div>
      <div>
        <Link href="v2">
          <a>V2</a>
        </Link>
      </div>
      <div>
        <Link href="v3">
          <a>V3</a>
        </Link>
      </div>
      <div>
        <Link href="v4">
          <a>V4</a>
        </Link>
      </div>
      <div>
        <Link href="test1">
          <a>Test 1</a>
        </Link>
      </div>
    </>
  );
};

export default Home;
