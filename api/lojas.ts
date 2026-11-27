import { linitialstores } from '../src/data/linitialStores';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      stores: INITIAL_STORES,
      count: INITIAL_STORES.length,
    });
    return;
  }
  res.status(405).json({ error: 'Somente GET' });
}
