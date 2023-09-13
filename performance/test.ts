import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  const url = 'http://localhost:3000/api/v1/files/1';

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url);
  check(res, {
    'status was 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 1000,
  });
}
