import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

it('returns a 404 on unknown path', async () => {
  await request(app).get(`/api/tickets/ffklfdfd/fdfdfd`).send().expect(404);
});

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns a ticket if the ticket is  found', async () => {
  const title = 'concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketReponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketReponse.body.title).toEqual(title);
  expect(ticketReponse.body.price).toEqual(price);
});
