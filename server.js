import { randomUUID } from 'crypto';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import express from 'express';

const app = express();
const port = 3000;
const __dirname = path.resolve();

app.use(express.json());

const getEvents = async () => {
  const data = await readFile(`${__dirname}/src/__mocks__/response/realEvents.json`, 'utf8');

  return JSON.parse(data);
};

app.get('/api/events', async (_, res) => {
  const events = await getEvents();
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  const events = await getEvents();
  const newEvent = { id: randomUUID(), ...req.body };

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, newEvent],
    })
  );

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;
  const eventIndex = events.events.findIndex((event) => event.id === id);
  if (eventIndex > -1) {
    const newEvents = [...events.events];
    newEvents[eventIndex] = { ...events.events[eventIndex], ...req.body };

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/realEvents.json`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events[eventIndex]);
  } else {
    res.status(404).send('Event not found');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const events = await getEvents();
  const id = req.params.id;

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: events.events.filter((event) => event.id !== id),
    })
  );

  res.status(204).send();
});

// ------------------------- 여러 일정 처리 -------------------------

// 일정 목록 생성
app.post('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const repeatId = randomUUID(); // 반복 일정을 묶는 아이디
  const newEvents = req.body.events.map((event) => {
    const isRepeatEvent = event.repeat.type !== 'none'; // 반복 일정인지 확인
    return {
      id: randomUUID(),
      ...event,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? repeatId : undefined,
      },
    };
  });

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: [...events.events, ...newEvents],
    })
  );

  res.status(201).json(newEvents);
});

// 일정 목록 수정
app.put('/api/events-list', async (req, res) => {
  const events = await getEvents();
  let isUpdated = false;

  const newEvents = [...events.events]; // 기존 일정 목록 복사
  req.body.events.forEach((event) => {
    // 기존 일정 배열에서 같은 id를 가진 이벤트 찾음
    const eventIndex = events.events.findIndex((target) => target.id === event.id);
    if (eventIndex > -1) {
      isUpdated = true; // 수정 발생
      newEvents[eventIndex] = { ...events.events[eventIndex], ...event }; // 새로운 일정으로 덮어씀
    }
  });

  if (isUpdated) {
    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/realEvents.json`,
      JSON.stringify({
        events: newEvents,
      })
    );

    res.json(events.events);
  } else {
    res.status(404).send('Event not found');
  }
});

// 일정 목록 삭제
app.delete('/api/events-list', async (req, res) => {
  const events = await getEvents();
  const newEvents = events.events.filter((event) => !req.body.eventIds.includes(event.id)); // ? ids를 전달하면 해당 아이디를 기준으로 events에서 제거

  fs.writeFileSync(
    `${__dirname}/src/__mocks__/response/realEvents.json`,
    JSON.stringify({
      events: newEvents,
    })
  );

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
