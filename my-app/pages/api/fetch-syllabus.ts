// pages/api/fetch-syllabus.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import cheerio from 'cheerio';

const sendSlackNotification = async (message: string) => {
  const payload = { text: message };
  try {
    const response = await axios.post(process.env.SLACK_WEBHOOK_URL!, payload);
    if (response.status !== 200) {
      throw new Error(`Request to Slack returned an error ${response.status}, the response is:\n${response.data}`);
    }
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { lessonNumber } = req.body;
  if (!lessonNumber || isNaN(Number(lessonNumber)) || Number(lessonNumber) < 1 || Number(lessonNumber) > 15) {
    return res.status(400).json({ error: 'Invalid lesson number' });
  }

  try {
    const url = 'https://www.kyoumu.cst.nihon-u.ac.jp/syllabus/Publication/2024/course/1/K43D';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let targetLesson: string | null = null;

    $('table tr').each((index, element) => {
      const title = $(element).find('th').text().trim();
      if (title === `第${lessonNumber}回`) {
        const content = $(element).find('td').text().trim();
        const firstSentence = content.split('。')[0] + '。';
        targetLesson = `${title}　${firstSentence}`;
        return false; // break the loop
      }
    });

    if (targetLesson) {
      await sendSlackNotification(targetLesson);
      res.status(200).json({ message: 'Syllabus fetched and sent to Slack successfully', content: targetLesson });
    } else {
      res.status(404).json({ error: 'Specified lesson not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the syllabus or sending notifications' });
  }
}