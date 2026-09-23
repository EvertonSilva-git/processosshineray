import { useEffect, useMemo, useState } from 'react';

const initialProcesses = [
  {
    id: 1,
    tipo: 'LCVM',
    numeroSolicitacao: 'SL-1045',
    procedencia: 'Nacional',
    mmv: 'SHINERAY/NP-203',
    numeroLicenca: 'LC-22984',
    quantidade: 'Restrita (3 a 100)',
    tipoVeiculo: 'Veículo leve de passageiros',
    dataInicio: '2025-05-05',
    situacao: 'Em edição',
    dataEnvio: '2025-05-05',
    dataEmissao: '',
    dataValidade: '',
    observacoes: [
      { id: 1, data: '2025-05-12 09:30', texto: 'Documentação pendente de assinatura do responsável.' }
    ]
  },
  {
    id: 2,
    tipo: 'LCM Especial',
    numeroSolicitacao: 'SL-1244',
    procedencia: 'Importado',
    mmv: 'I/SHINERAY/ATX-77',
    numeroLicenca: 'LC-23481',
    quantidade: 'Limitada (1 a 2)',
    tipoVeiculo: 'Triciclo/Quadriciclo fora de estrada',
    dataInicio: '2025-04-10',
    situacao: 'Encaminhada para o IBAMA',
    dataEnvio: '2025-04-12',
    dataEmissao: '2025-04-28',
    dataValidade: '2026-04-28',
    observacoes: []
  },
  {
    id: 3,
    tipo: 'Dispensa',
    numeroSolicitacao: 'SD-770',
    procedencia: 'Nacional',
    mmv: 'SHINERAY/PROT-105',
    numeroLicenca: 'LC-8874',
    quantidade: '8',
    tipoVeiculo: 'Protótipo',
    dataInicio: '2025-01-03',
    situacao: 'Licença/Certidão emitida',
    dataEnvio: '2025-01-04',
    dataEmissao: '2025-01-22',
    dataValidade: '2026-11-22',
    observacoes: [
      { id: 1, data: '2025-01-26 15:12', texto: 'Licença emitida com sucesso.' }
    ]
  },
  {
    id: 4,
    tipo: 'Extensão',
    numeroSolicitacao: 'SL-1452',
    procedencia: 'Importado',
    mmv: 'I/SHINERAY/EXT-88',
    mmvOriginal: 'I/SHINERAY/EXT-01',
    numeroLicenca: 'LC-99882',
    tipoVeiculo: 'Veículo leve comercial',
    dataInicio: '2025-06-04',
    situacao: 'A pagar',
    dataEnvio: '2025-06-08',
    dataEmissao: '2025-07-02',
    dataValidade: '2026-07-02',
    observacoes: []
  },
  {
    id: 5,
    tipo: 'LCVM Especial',
    numeroSolicitacao: 'SL-1451',
    procedencia: 'Nacional',
    mmv: 'SHINERAY/ES-120',
    numeroLicenca: 'LC-56421',
    quantidade: 'Limitada (1 a 2)',
    tipoVeiculo: 'Veículo leve comercial',
    dataInicio: '2025-08-10',
    situacao: 'Em análise pelo Analista do ATC',
    dataEnvio: '2025-08-18',
    dataEmissao: '2025-09-05',
    dataValidade: '2026-09-05',
    observacoes: []
  },
  {
    id: 6,
    tipo: 'LCM',
    numeroSolicitacao: 'SL-990',
    procedencia: 'Nacional',
    mmv: 'SHINERAY/MOTO-41',
    numeroLicenca: 'LC-10123',
    quantidade: 'Restrita (3 a 50)',
    tipoVeiculo: 'Motocicleta',
    dataInicio: '2025-03-02',
    situacao: 'Licença/Certidão emitida',
    dataEnvio: '2025-03-04',
    dataEmissao: '2025-03-26',
    dataValidade: '2026-03-26',
    observacoes: []
  }
];

const STATUS_OPTIONS = [
  'Em edição',
  'Encaminhada para o IBAMA',
  'Em análise pelo Analista do ATC',
  'A pagar',
  'Licença/Certidão emitida'
];

const BASE_FORM = {
  tipo: 'LCVM',
  numeroSolicitacao: '',
  procedencia: 'Nacional',
  mmv: 'SHINERAY/',
  mmvOriginal: '',
  numeroLicenca: '',
  quantidade: 'Restrita (3 a 100)',
  tipoVeiculo: 'Veículo leve de passageiros',
  dataInicio: '',
  situacao: 'Em edição',
  dataEnvio: '',
  dataEmissao: '',
  dataValidade: ''
};

const summaryConfigs = {
  todos: { label: 'Todos os processos', key: 'total' },
  andamento: { label: 'Em andamento', key: 'andamento' },
  emitidas: { label: 'Licenças Emitidas', key: 'emitidas' },
  revalidacao: { label: 'Para revalidação', key: 'revalidacao' }
};

const lowerCards = [
  { label: 'LCVM', key: 'LCVM' },
  { label: 'LCVM Especial', key: 'LCVM Especial' },
  { label: 'LCM', key: 'LCM' },
  { label: 'LCM Especial', key: 'LCM Especial' },
  { label: 'Dispensa', key: 'Dispensa' },
  { label: 'Extensão', key: 'Extensão' }
];

const processTabs = [
  { id: 'em-edicao', label: 'Em edição', status: 'Em edição' },
  { id: 'encaminhada', label: 'Encaminhada / Analise / A pagar', status: 'multi' },
  { id: 'emitidas', label: 'Licença emitida', status: 'Licença/Certidão emitida' },
  { id: 'revalidacao', label: 'Para revalidação', status: 'revalidacao' }
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function diffInDays(start, end) {
  if (!start || !end) return null;
  const inicio = new Date(`${start}T00:00:00`);
  const fim = new Date(`${end}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return null;
  return Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
}

function getTipoVeiculos(tipo) {
  const map = {
    LCVM: ['Veículo leve de passageiros', 'Veículo leve comercial'],
    'LCVM Especial': ['Veículo leve de passageiros', 'Veículo leve comercial'],
    LCM: ['Motocicleta'],
    'LCM Especial': ['Motocicleta fora de estrada', 'Triciclo/Quadriciclo', 'Triciclo/Quadriciclo fora de estrada'],
    Dispensa: ['Protótipo'],
    Extensão: ['Veículo leve de passageiros', 'Veículo leve comercial', 'Motocicleta', 'Motocicleta fora de estrada', 'Triciclo/Quadriciclo', 'Triciclo/Quadriciclo fora de estrada']
  };

  return map[tipo] || [];
}

function getQuantidadeOptions(tipo) {
  const map = {
    LCVM: ['Restrita (3 a 100)', 'Ilimitada (100+)'],
    'LCVM Especial': ['Limitada (1 a 2)'],
    LCM: ['Restrita (3 a 50)'],
    'LCM Especial': ['Limitada (1 a 2)'],
    Extensão: [],
    Dispensa: []
  };

  return map[tipo] || [];
}

function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [processes, setProcesses] = useState(initialProcesses);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeProcessTab, setActiveProcessTab] = useState('em-edicao');
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [observationText, setObservationText] = useState('');
  const [formData, setFormData] = useState(BASE_FORM);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const summaryCards = useMemo(() => {
    const total = processes.length;
    const andamento = processes.filter((p) => p.situacao !== 'Licença/Certidão emitida').length;
    const emitidas = processes.filter((p) => p.situacao === 'Licença/Certidão emitida').length;
    const revalidacao = processes.filter((p) => {
      if (p.situacao !== 'Licença/Certidão emitida' || !p.dataValidade) return false;
      const remaining = diffInDays(new Date().toISOString().slice(0, 10), p.dataValidade);
      return remaining !== null && remaining <= 61 && remaining >= 0;
    }).length;

    return [
      { label: 'Todos os processos', value: total, accent: 'green' },
      { label: 'Em andamento', value: andamento, accent: 'blue' },
      { label: 'Licenças Emitidas', value: emitidas, accent: 'gold' },
      { label: 'Para revalidação', value: revalidacao, accent: 'red' }
    ];
  }, [processes]);

  const lowerSummary = useMemo(() =>
    lowerCards.map((card) => ({
      ...card,
      value: processes.filter((p) => p.tipo === card.key).length
    })),
  [processes]);

  const filteredProcesses = useMemo(() => {
    if (activeProcessTab === 'em-edicao') {
      return processes.filter((p) => p.situacao === 'Em edição');
    }

    if (activeProcessTab === 'encaminhada') {
      return processes.filter((p) =>
        ['Encaminhada para o IBAMA', 'Em análise pelo Analista do ATC', 'A pagar'].includes(p.situacao)
      );
    }

    if (activeProcessTab === 'emitidas') {
      return processes.filter((p) => p.situacao === 'Licença/Certidão emitida');
    }

    if (activeProcessTab === 'revalidacao') {
      return processes.filter((p) => {
        if (p.situacao !== 'Licença/Certidão emitida' || !p.dataValidade) return false;
        const remaining = diffInDays(new Date().toISOString().slice(0, 10), p.dataValidade);
        return remaining !== null && remaining <= 61 && remaining >= 0;
      });
    }

    return [];
  }, [activeProcessTab, processes]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      let next = { ...current, [name]: value };

      if (name === 'tipo') {
        const options = getQuantidadeOptions(value);
        const tiposVeiculo = getTipoVeiculos(value);

        next.quantidade = options.length ? options[0] : '';
        next.tipoVeiculo = tiposVeiculo.length ? tiposVeiculo[0] : '';

        if (value === 'Dispensa') {
          next.numeroSolicitacao = 'SD';
        } else {
          next.numeroSolicitacao = 'SL';
        }
      }

      if (name === 'procedencia') {
        next.mmv = value === 'Nacional' ? 'SHINERAY/' : 'I/SHINERAY/';
      }

      if (name === 'numeroSolicitacao') {
        const sanitized = value.replace(/[^0-9]/g, '');
        next.numeroSolicitacao = next.tipo === 'Dispensa' ? `SD${sanitized}` : `SL${sanitized}`;
      }

      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newProcess = {
      ...formData,
      id: Date.now(),
      numeroSolicitacao: formData.numeroSolicitacao || (formData.tipo === 'Dispensa' ? 'SD' : 'SL'),
      observacoes: []
    };

    setProcesses((current) => [newProcess, ...current]);
    setActiveScreen('processes');
    setActiveProcessTab('em-edicao');
    setFormData(BASE_FORM);
  };

  const submitObservation = () => {
    if (!selectedProcessId || !observationText.trim()) return;

    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    setProcesses((current) => current.map((process) => {
      if (process.id !== selectedProcessId) return process;
      return {
        ...process,
        observacoes: [...(process.observacoes || []), { id: Date.now(), data: timestamp, texto: observationText.trim() }]
      };
    }));

    setObservationText('');
    setSelectedProcessId(null);
  };

  const beforeRenderCard = (card) => {
    const remaining = diffInDays(new Date().toISOString().slice(0, 10), card.dataValidade);
    const diasEnvioEmissao = diffInDays(card.dataEnvio, card.dataEmissao);

    return (
      <div className="process-card" key={card.id}>
        <div className="process-card-top">
          <div>
            <span className="pill">{card.tipo}</span>
            <h3>{card.numeroSolicitacao}</h3>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setSelectedProcessId(card.id)}
            aria-label="Adicionar observação"
            title="Adicionar observação"
          >
            💬
          </button>
        </div>

        <div className="proc-grid">
          <div><span>Procedência</span><strong>{card.procedencia}</strong></div>
          <div><span>MMV</span><strong>{card.mmv}</strong></div>
          <div><span>Veículo</span><strong>{card.tipoVeiculo}</strong></div>
          <div><span>Quantidade</span><strong>{card.quantidade || '—'}</strong></div>
          <div><span>Data início</span><strong>{formatDate(card.dataInicio)}</strong></div>
          <div><span>Status</span><strong>{card.situacao}</strong></div>
          <div><span>Envio</span><strong>{formatDate(card.dataEnvio)}</strong></div>
          <div><span>Emissão</span><strong>{formatDate(card.dataEmissao)}</strong></div>
          <div><span>Validade</span><strong>{formatDate(card.dataValidade)}</strong></div>
          <div><span>Licença</span><strong>{card.numeroLicenca || 'Não emitida'}</strong></div>
        </div>

        <div className="days-row">
          <div className="day-box">
            <label>Dias restantes</label>
            <strong>{remaining === null ? '—' : `${remaining} dias`}</strong>
          </div>
          <div className="day-box">
            <label>Solicitação até emissão</label>
            <strong>{diasEnvioEmissao === null ? '—' : `${diasEnvioEmissao} dias`}</strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">S</div>
          <div>
            <p className="eyebrow">Shineray</p>
            <h1>Gestão de processos</h1>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Navegação principal">
          <button className={activeScreen === 'home' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveScreen('home')}>Home</button>
          <button className={activeScreen === 'form' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveScreen('form')} title="Cadastrar novo processo">＋</button>
          <button className={activeScreen === 'processes' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveScreen('processes')}>Processos</button>
        </nav>
      </header>

      {activeScreen === 'home' && (
        <main className="screen">
          <section className="carousel-shell">
            <div className="carousel-header">
              <div>
                <p className="eyebrow">Painel principal</p>
                <h2>Visão geral</h2>
              </div>
              <div className="carousel-controls">
                <button type="button" onClick={() => setCurrentCardIndex((prev) => (prev - 1 + 4) % 4)} aria-label="Anterior">←</button>
                <button type="button" onClick={() => setCurrentCardIndex((prev) => (prev + 1) % 4)} aria-label="Próximo">→</button>
              </div>
            </div>

            <div className="carousel-viewport">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
              >
                {summaryCards.map((card) => (
                  <div className={`summary-card ${card.accent}`} key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mini-grid">
            {lowerSummary.map((card) => (
              <div className="mini-card" key={card.key}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
          </section>
        </main>
      )}

      {activeScreen === 'form' && (
        <main className="screen">
          <section className="form-shell">
            <div className="form-head">
              <div>
                <p className="eyebrow">Cadastro</p>
                <h2>Novo processo</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="process-form">
              <div className="field-row two-columns">
                <label>
                  <span>Tipo</span>
                  <select name="tipo" value={formData.tipo} onChange={handleFormChange}>
                    {['LCVM', 'LCVM Especial', 'LCM', 'LCM Especial', 'Dispensa', 'Extensão'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Número da solicitação</span>
                  <input
                    type="text"
                    name="numeroSolicitacao"
                    value={formData.numeroSolicitacao}
                    onChange={handleFormChange}
                    placeholder={formData.tipo === 'Dispensa' ? 'SD' : 'SL'}
                  />
                </label>
              </div>

              <div className="field-row two-columns">
                <label>
                  <span>Procedência</span>
                  <select name="procedencia" value={formData.procedencia} onChange={handleFormChange}>
                    <option value="Nacional">Nacional</option>
                    <option value="Importado">Importado</option>
                  </select>
                </label>

                <label>
                  <span>MMV</span>
                  <input
                    type="text"
                    name="mmv"
                    value={formData.mmv}
                    onChange={handleFormChange}
                    placeholder={formData.procedencia === 'Nacional' ? 'SHINERAY/' : 'I/SHINERAY/'}
                  />
                </label>
              </div>

              {formData.tipo === 'Extensão' && (
                <div className="field-row">
                  <label>
                    <span>MMV Original</span>
                    <input
                      type="text"
                      name="mmvOriginal"
                      value={formData.mmvOriginal}
                      onChange={handleFormChange}
                      placeholder="Digite o MMV original"
                    />
                  </label>
                </div>
              )}

              <div className="field-row two-columns">
                <label>
                  <span>Número da Licença</span>
                  <input type="text" name="numeroLicenca" value={formData.numeroLicenca} onChange={handleFormChange} placeholder="Opcional" />
                </label>

                <label>
                  <span>Quantidade</span>
                  {formData.tipo === 'Dispensa' ? (
                    <input type="number" name="quantidade" value={formData.quantidade} onChange={handleFormChange} min="1" />
                  ) : getQuantidadeOptions(formData.tipo).length > 0 ? (
                    <select name="quantidade" value={formData.quantidade} onChange={handleFormChange}>
                      {getQuantidadeOptions(formData.tipo).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value="Não aplicável" disabled />
                  )}
                </label>
              </div>

              <div className="field-row two-columns">
                <label>
                  <span>Tipo de veículo</span>
                  <select name="tipoVeiculo" value={formData.tipoVeiculo} onChange={handleFormChange}>
                    {getTipoVeiculos(formData.tipo).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Data do início</span>
                  <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleFormChange} />
                </label>
              </div>

              <div className="field-row two-columns">
                <label>
                  <span>Situação</span>
                  <select name="situacao" value={formData.situacao} onChange={handleFormChange}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Data do envio</span>
                  <input type="date" name="dataEnvio" value={formData.dataEnvio} onChange={handleFormChange} />
                </label>
              </div>

              <div className="field-row two-columns">
                <label>
                  <span>Data de emissão</span>
                  <input type="date" name="dataEmissao" value={formData.dataEmissao} onChange={handleFormChange} />
                </label>

                <label>
                  <span>Data de validade da licença</span>
                  <input type="date" name="dataValidade" value={formData.dataValidade} onChange={handleFormChange} />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">Salvar processo</button>
              </div>
            </form>
          </section>
        </main>
      )}

      {activeScreen === 'processes' && (
        <main className="screen">
          <section className="process-shell">
            <div className="process-tabs">
              {processTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={activeProcessTab === tab.id ? 'tab-btn active' : 'tab-btn'}
                  onClick={() => setActiveProcessTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="process-list">
              {filteredProcesses.length > 0 ? filteredProcesses.map((card) => beforeRenderCard(card)) : (
                <div className="empty-state">Nenhum processo encontrado para este filtro.</div>
              )}
            </div>
          </section>
        </main>
      )}

      {selectedProcessId && (
        <div className="modal-overlay" onClick={() => setSelectedProcessId(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Observações do processo</h3>
              <button type="button" onClick={() => setSelectedProcessId(null)}>✕</button>
            </div>

            <div className="observations-list">
              {processes
                .find((p) => p.id === selectedProcessId)
                ?.observacoes?.map((obs) => (
                  <div className="observation-item" key={obs.id}>
                    <strong>{obs.data}</strong>
                    <p>{obs.texto}</p>
                  </div>
                )) || <p className="empty-note">Sem observações registradas.</p>}
            </div>

            <textarea
              value={observationText}
              onChange={(event) => setObservationText(event.target.value)}
              rows="4"
              placeholder="Digite sua observação..."
            />

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setSelectedProcessId(null)}>Cancelar</button>
              <button type="button" className="primary-btn" onClick={submitObservation}>Salvar observação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
