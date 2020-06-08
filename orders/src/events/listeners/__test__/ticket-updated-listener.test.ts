import { TicketUpdatedEvent } from '@omtickets/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  // creates a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'concert2',
    price: 10,
    userId: 'fdfdfd',
  };
  // creates a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it('find, updates ans save a ticket', async () => {
  const { listener, data, ticket, msg } = await setup();
  // call the onMessage function with the data object and the message object
  await listener.onMessage(data, msg);
  // write assertions to make sure the ticket was updated
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks a message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with the data object and the message object
  await listener.onMessage(data, msg);
  // write assertations to make sure the ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if event has a skipped version number', async () => {
  const { listener, data, ticket, msg } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  // write assertations to make sure the ack function is called
  expect(msg.ack).not.toHaveBeenCalled();
});
