import { initialStores} from '../src/data/initialStores';

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({
      stores: initialStores,
      count: initialStores.length,
    });
    return;
  }

  res.status(405).json({ error: 'Somente GET' });
}
