// pages/index.tsx
import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lessonNumber, setLessonNumber] = useState<string>('');

  const fetchSyllabus = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/fetch-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.content);
      } else {
        setMessage(data.error || 'An error occurred');
      }
    } catch (error) {
      setMessage('Error occurred while fetching syllabus');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Syllabus Fetcher</title>
        <meta name="description" content="Fetch and display syllabus information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Syllabus Fetcher</h1>
        <div>
          <label htmlFor="lessonNumber">回数を選択：</label>
          <select
            id="lessonNumber"
            value={lessonNumber}
            onChange={(e) => setLessonNumber(e.target.value)}
          >
            <option value="">選択してください</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                第{num}回
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchSyllabus} disabled={isLoading || !lessonNumber}>
          {isLoading ? 'Fetching...' : 'Fetch Syllabus'}
        </button>
        {message && (
          <div>
            <h2>Result:</h2>
            <p>{message}</p>
          </div>
        )}
      </main>

      <style jsx>{`
        div {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        button {
          font-size: 1rem;
          padding: 0.5rem 1rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }
        button:disabled {
          cursor: not-allowed;
        }
        h2 {
          font-size: 1.5rem;
          margin-top: 1rem;
        }
        select {
          margin-left: 0.5rem;
          font-size: 1rem;
          padding: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default Home;