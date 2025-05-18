import { rest } from 'msw';

export const handlers = [
  rest.get('/api/investments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, type_name: 'Тестова інвестиція', cost: '1000', date: '2025-01-01' }
      ])
    );
  }),
];
