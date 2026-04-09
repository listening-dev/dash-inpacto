# Como re-integrar o Relatório no MainDashboard.tsx

Este guia descreve exatamente o que adicionar ao `src/components/dashboard/MainDashboard.tsx`
para reativar a aba de Relatório.

---

## 1. Imports (topo do arquivo)

```tsx
import RelatorioTab from '../relatorio/RelatorioTab';
import { useAuth } from '../../contexts/AuthContext';
```

No import do lucide-react, adicionar `FileText`:
```tsx
import { ..., FileText, ... } from 'lucide-react';
```

---

## 2. Dentro do componente `MainDashboard` (logo após a abertura do componente)

```tsx
const { user } = useAuth();
```

---

## 3. Render condicional (dentro de `renderContent()`, antes do `return renderGeral()`)

```tsx
if (activeTab === 'relatorio') return <RelatorioTab userId={user?.id || ''} />;
```

---

## 4. Seção "Ferramentas" no sidebar (dentro de `<nav>`, após o bloco das redes sociais)

```tsx
<div className="bg-white rounded-xl p-4 mt-4">
  <div className="mb-2 px-3 text-[15px] font-bold text-gray-800 uppercase tracking-widest">
    Ferramentas
  </div>
  <NavItem
    id="relatorio"
    label="Relatório"
    icon={<FileText size={20} style={{ color: '#e65220' }} />}
    {...navProps}
  />
</div>
```

---

## Arquivos do recurso (todos nesta pasta e em hooks/)

- `src/components/relatorio/RelatorioTab.tsx`
- `src/components/relatorio/RelatorioBuilder.tsx`
- `src/components/relatorio/RelatorioList.tsx`
- `src/components/relatorio/CanvasArea.tsx`
- `src/components/relatorio/CanvasItem.tsx`
- `src/components/relatorio/WidgetPicker.tsx`
- `src/components/relatorio/TextBlockEditor.tsx`
- `src/components/relatorio/TextBlockRenderer.tsx`
- `src/components/relatorio/widgetRegistry.ts`
- `src/components/relatorio/widgets/` (6 widgets)
- `src/hooks/useRelatorios.ts`
- `src/hooks/useRelatorioItens.ts`
- `src/types/relatorio.ts`
