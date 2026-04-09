import React from 'react';
import { PostSnapshotRow } from '../../../types/relatorio';

interface Props {
  snapshot: PostSnapshotRow[];
  titulo?: string;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
  return (n || 0).toLocaleString('pt-BR');
}

const PLAT_COLORS: Record<string, string> = {
  instagram: 'bg-[#E4405F] text-white',
  facebook: 'bg-[#1877F2] text-white',
  linkedin: 'bg-[#0077B5] text-white',
  twitter: 'bg-[#14171A] text-white',
};

export default function TopPostsWidget({ snapshot, titulo }: Props) {
  if (!snapshot || snapshot.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Sem posts para exibir</div>;
  }

  return (
    <div className="overflow-x-auto">
      {titulo && <p className="text-xs text-gray-500 mb-2">{titulo}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Views</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Curtidas</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Coment.</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.map((post, i) => (
            <tr key={post.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                  {post.thumbnail_url && post.thumbnail_url.startsWith('http') ? (
                    <img src={post.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${PLAT_COLORS[post.platform] || 'bg-gray-200 text-gray-600'}`}>
                      {post.platform?.substring(0, 2)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[160px]">
                      {post.titulo || 'Sem título'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${PLAT_COLORS[post.platform] || 'bg-gray-200 text-gray-600'}`}>
                        {post.platform}
                      </span>
                      <span className="text-[10px] text-gray-400">{post.formato}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-2 px-2 text-right font-semibold text-gray-800 text-xs">{fmtNum(post.visualizacoes)}</td>
              <td className="py-2 px-2 text-right text-gray-600 text-xs">{fmtNum(post.curtidas)}</td>
              <td className="py-2 px-2 text-right text-gray-600 text-xs">{fmtNum(post.comentarios)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
