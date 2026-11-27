import { lojas} from    ./data/lojas.json';

export default function handler(
  req: { method: string },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    json: (body: unknown) => void;
  }
): void {
  if (req.method === 'GET') {
    res.status(200).json({
      stores: INITIAL_STORES,
      lastModified: new Date().toISOString(),
    });
    return;
  }

  res.status(405).json({ error: 'Somente consulta (GET) disponível na Vercel.' });
}

