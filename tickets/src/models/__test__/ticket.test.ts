import { Ticket } from '../ticket';

it('implents optimistic concurrency control', async (done) => {
  // Creates an instance of a ticket
  const ticket = Ticket.build({ title: 'concert', price: 20, userId: '123' });

  // Save the ticket in the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance?.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance?.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point !');
});

it('increments the version number om multiples saves', async () => {
  // Creates an instance of a ticket
  const ticket = Ticket.build({ title: 'concert', price: 20, userId: '123' });

  // Save the ticket in the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
