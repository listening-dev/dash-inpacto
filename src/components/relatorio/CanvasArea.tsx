import React from 'react';
import { RelatorioItem } from '../../types/relatorio';
import CanvasItem from './CanvasItem';

interface Props {
  itens: RelatorioItem[];
}

export default function CanvasArea({ itens }: Props) {
  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p className="font-semibold text-gray-500">Relatório vazio</p>
        <p className="text-sm mt-1">Use os botões acima para adicionar widgets ou blocos de texto.</p>
      </div>
    );
  }

  // Agrupa itens em linhas: coluna 0 = largura total, coluna != 0 = par lado a lado
  const rows: RelatorioItem[][] = [];
  let i = 0;
  while (i < itens.length) {
    const item = itens[i];
    if (item.coluna === 0) {
      rows.push([item]);
      i++;
    } else {
      const pair: RelatorioItem[] = [item];
      if (i + 1 < itens.length && itens[i + 1].coluna !== 0) {
        pair.push(itens[i + 1]);
        i += 2;
      } else {
        i++;
      }
      rows.push(pair);
    }
  }

  return (
    <div className="space-y-4">
      {rows.map((row, rowIdx) => {
        if (row.length === 1 && row[0].coluna === 0) {
          const item = row[0];
          const globalIdx = itens.findIndex(x => x.id === item.id);
          return (
            <CanvasItem
              key={item.id}
              item={item}
              isFirst={globalIdx === 0}
              isLast={globalIdx === itens.length - 1}
            />
          );
        }

        return (
          <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {row.map(item => {
              const globalIdx = itens.findIndex(x => x.id === item.id);
              return (
                <CanvasItem
                  key={item.id}
                  item={item}
                  isFirst={globalIdx === 0}
                  isLast={globalIdx === itens.length - 1}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
