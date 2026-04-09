import React, { useState } from 'react';
import { Relatorio } from '../../types/relatorio';
import { useRelatorios } from '../../hooks/useRelatorios';
import RelatorioList from './RelatorioList';
import RelatorioBuilder from './RelatorioBuilder';

interface Props {
  userId: string;
}

export default function RelatorioTab({ userId }: Props) {
  const [activeRelatorio, setActiveRelatorio] = useState<Relatorio | null>(null);
  const { relatorios, loading, createRelatorio, deleteRelatorio } = useRelatorios(userId);

  const handleCreate = async (titulo: string, inicio: string, fim: string) => {
    const novo = await createRelatorio(titulo, inicio || undefined, fim || undefined);
    if (novo) setActiveRelatorio(novo);
  };

  if (activeRelatorio) {
    return (
      <RelatorioBuilder
        relatorio={activeRelatorio}
        userId={userId}
        onBack={() => setActiveRelatorio(null)}
        onUpdated={(r) => setActiveRelatorio(r)}
      />
    );
  }

  return (
    <RelatorioList
      relatorios={relatorios}
      loading={loading}
      onOpen={setActiveRelatorio}
      onCreate={handleCreate}
      onDelete={deleteRelatorio}
    />
  );
}
