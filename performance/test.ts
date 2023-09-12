import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 5,
  duration: '30s',
};

export default function () {
  const url = 'http://localhost:3000/mod/organizations/1/activities';
  const payload = JSON.stringify({
    name: 'test',
    description: 'test',
    startAt: '2021-05-01T00:00:00.000Z',
    endAt: '2021-05-01T00:00:00.000Z',
    location: 'test',
    maxParticipants: 1,
    minParticipants: 1,
    price: 1,
    currency: 'USD',
    isOnline: false,
    isPublished: false,
    isDeleted: false,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  check(res, {
    'status was 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 200,
  });
}
