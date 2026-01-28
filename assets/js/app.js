const form = document.getElementById('poc-form');
const tabButtons = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const addBtn = document.getElementById('add-btn');
const viewButtons = document.querySelectorAll('[data-view]');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const practiceList = document.getElementById('practice-list');
const practiceSelected = document.getElementById('practice-selected');
const consultarBtn = document.getElementById('consultar-btn');
const consultaResultado = document.getElementById('consulta-resultado');

const basicFields = [
  document.getElementById('unidadeSelect'),
  document.getElementById('setorSelect'),
  document.getElementById('subsetorSelect'),
  document.getElementById('observador'),
  document.getElementById('data'),
  document.getElementById('hora'),
  document.getElementById('pessoas-observadas'),
  document.getElementById('pessoas-area')
];

const unsafeFields = [
  document.getElementById('subcategoria'),
  document.getElementById('observado'),
  document.getElementById('quantidade'),
  document.getElementById('pratica-insegura'),
  document.getElementById('acao-recomendada'),
  practiceSelected
];

const safeFields = [
  document.getElementById('reconhecimento')
];

const mockResults = [
  {
    unidade: 'Unidade 01',
    setor: 'Produção',
    observador: 'Maria Souza',
    data: '2024-08-12',
    tipo: 'Prática Segura'
  },
  {
    unidade: 'Unidade 02',
    setor: 'Manutenção',
    observador: 'João Lima',
    data: '2024-08-15',
    tipo: 'Condição Insegura'
  }
];

const getSelectedType = () => {
  const checked = document.querySelector('input[name="tipo-registro"]:checked');
  return checked ? checked.value : '';
};

const setActiveTab = (tabName) => {
  tabButtons.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.tabPanel === tabName);
  });
};

const disableTab = (tabName, disabled) => {
  const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (!tab) return;
  tab.classList.toggle('is-disabled', disabled);
  tab.setAttribute('aria-disabled', disabled ? 'true' : 'false');
};

const validateBasic = () => {
  const basicValid = basicFields.every((field) => field.value.trim() !== '' && field.checkValidity());
  const typeSelected = getSelectedType() !== '';
  return basicValid && typeSelected;
};

const validateUnsafe = () => {
  return unsafeFields.every((field) => field.value.trim() !== '' && field.checkValidity());
};

const validateSafe = () => {
  return safeFields.every((field) => field.value.trim() !== '' && field.checkValidity());
};

const updateUI = () => {
  const basicValid = validateBasic();
  const selectedType = getSelectedType();

  if (!basicValid) {
    disableTab('inseguras', true);
    disableTab('seguras', true);
    addBtn.disabled = true;
    setActiveTab('basicos');
    return;
  }

  if (selectedType === 'insegura') {
    disableTab('inseguras', false);
    disableTab('seguras', true);
    if (document.querySelector('.tab.is-active')?.dataset.tab === 'seguras') {
      setActiveTab('basicos');
    }
  }

  if (selectedType === 'segura') {
    disableTab('inseguras', true);
    disableTab('seguras', false);
    if (document.querySelector('.tab.is-active')?.dataset.tab === 'inseguras') {
      setActiveTab('basicos');
    }
  }

  const unsafeValid = selectedType === 'insegura' && validateUnsafe();
  const safeValid = selectedType === 'segura' && validateSafe();
  addBtn.disabled = !(basicValid && (unsafeValid || safeValid));
};

const resetFormState = () => {
  form.reset();
  practiceSelected.value = '';
  practiceList.querySelectorAll('li').forEach((item) => item.classList.remove('is-selected'));
  setActiveTab('basicos');
  disableTab('inseguras', true);
  disableTab('seguras', true);
  addBtn.disabled = true;
};

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    viewButtons.forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');
    const view = button.dataset.view;
    viewPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.viewPanel === view);
    });
  });
});

practiceList.addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (!item) return;
  practiceList.querySelectorAll('li').forEach((li) => li.classList.remove('is-selected'));
  item.classList.add('is-selected');
  practiceSelected.value = item.dataset.practice || '';
  updateUI();
});

tabButtons.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.classList.contains('is-disabled')) {
      return;
    }
    setActiveTab(tab.dataset.tab);
  });
});

[...basicFields, ...unsafeFields, ...safeFields].forEach((field) => {
  field.addEventListener('input', updateUI);
  field.addEventListener('change', updateUI);
});

document.querySelectorAll('input[name="tipo-registro"]').forEach((radio) => {
  radio.addEventListener('change', updateUI);
});

addBtn.addEventListener('click', () => {
  if (addBtn.disabled) return;
  alert('POC adicionada com sucesso (simulação)');
  resetFormState();
});

consultarBtn.addEventListener('click', () => {
  const results = Math.random() > 0.5 ? mockResults : [];
  if (!results.length) {
    consultaResultado.textContent = 'Sem resultados (simulação)';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('result-table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Unidade</th>
        <th>Setor</th>
        <th>Observador</th>
        <th>Data</th>
        <th>Tipo</th>
      </tr>
    </thead>
    <tbody>
      ${results
        .map(
          (row) => `
          <tr>
            <td>${row.unidade}</td>
            <td>${row.setor}</td>
            <td>${row.observador}</td>
            <td>${row.data}</td>
            <td>${row.tipo}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  `;
  consultaResultado.innerHTML = '';
  consultaResultado.appendChild(table);
});

updateUI();

window.PocAI = (() => {
  const STORAGE_KEYS = {
    enabled: 'poc_ai_enabled',
    apiKey: 'poc_gemini_api_key',
    mode: 'poc_ai_source_mode'
  };
  const CONFIDENCE_THRESHOLD = 0.75;
  const formScope = document.querySelector('#poc-form');

  if (!formScope) {
    return {};
  }

  const elements = {
    fillBtn: document.getElementById('ai-fill-btn'),
    optionsToggle: document.getElementById('ai-options-toggle'),
    optionsPanel: document.getElementById('ai-options-panel'),
    apiKeyInput: document.getElementById('ai-api-key'),
    enabledToggle: document.getElementById('ai-enabled'),
    saveSettingsBtn: document.getElementById('ai-save-settings'),
    frontInput: document.getElementById('ai-front-file'),
    backInput: document.getElementById('ai-back-file'),
    modeButtons: document.querySelectorAll('.ai-mode-btn'),
    status: document.getElementById('ai-status'),
    log: document.getElementById('ai-log')
  };

  const logMessages = [];
  const state = {
    enabled: false,
    apiKey: '',
    mode: 'camera',
    busy: false
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const normalizeText = (value) =>
    (value || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const setStatus = (message) => {
    if (!elements.status) return;
    elements.status.textContent = message;
  };

  const clearLog = () => {
    logMessages.length = 0;
    if (!elements.log) return;
    elements.log.innerHTML = '';
  };

  const addLog = (message) => {
    if (!message || !elements.log) return;
    logMessages.push(message);
    elements.log.innerHTML = '';
    logMessages.forEach((entry) => {
      const line = document.createElement('p');
      line.textContent = `• ${entry}`;
      elements.log.appendChild(line);
    });
  };

  const loadSettings = () => {
    state.enabled = localStorage.getItem(STORAGE_KEYS.enabled) === 'true';
    state.apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
    state.mode = localStorage.getItem(STORAGE_KEYS.mode) || 'camera';

    if (elements.apiKeyInput) {
      elements.apiKeyInput.value = state.apiKey;
    }
    if (elements.enabledToggle) {
      elements.enabledToggle.checked = state.enabled;
    }
  };

  const saveSettings = () => {
    state.apiKey = elements.apiKeyInput?.value.trim() || '';
    state.enabled = Boolean(elements.enabledToggle?.checked);
    localStorage.setItem(STORAGE_KEYS.apiKey, state.apiKey);
    localStorage.setItem(STORAGE_KEYS.enabled, state.enabled ? 'true' : 'false');
    updateFillAvailability();
    setStatus(state.enabled ? 'Modo IA ativo.' : 'Modo IA desativado.');
  };

  const updateModeButtons = () => {
    elements.modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === state.mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });
  };

  const updateCaptureMode = () => {
    const useCamera = state.mode === 'camera';
    const captureValue = useCamera ? 'environment' : null;
    [elements.frontInput, elements.backInput].forEach((input) => {
      if (!input) return;
      if (captureValue) {
        input.setAttribute('capture', captureValue);
      } else {
        input.removeAttribute('capture');
      }
    });
  };

  const setMode = (mode) => {
    state.mode = mode === 'gallery' ? 'gallery' : 'camera';
    localStorage.setItem(STORAGE_KEYS.mode, state.mode);
    updateModeButtons();
    updateCaptureMode();
  };

  const updateFillAvailability = () => {
    if (!elements.fillBtn) return;
    elements.fillBtn.disabled = !state.enabled || state.busy;
    if (!state.enabled) {
      setStatus('Ative o Modo IA nas opções (⚙️).');
      return;
    }
    if (!state.apiKey) {
      setStatus('Informe a chave da API Gemini nas opções.');
    }
  };

  const setLoading = (loading) => {
    state.busy = loading;
    if (!elements.fillBtn) return;
    elements.fillBtn.disabled = loading || !state.enabled;
    elements.fillBtn.textContent = loading ? 'Lendo cartão…' : 'Preencher cartão de POC';
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result?.toString() || '';
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.readAsDataURL(file);
    });

  const extractResponseText = (payload) => {
    const parts = payload?.candidates?.[0]?.content?.parts || [];
    return parts.map((part) => part.text || '').join('').trim();
  };

  const geminiRequest = async (parts) => {
    if (!state.apiKey) {
      throw new Error('Chave da API não configurada.');
    }
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Gemini (${response.status}): ${errorText || 'Falha na requisição.'}`);
    }
    return response.json();
  };

  const extractTextFromImages = async (frontFile, backFile) => {
    const [frontBase64, backBase64] = await Promise.all([
      readFileAsBase64(frontFile),
      readFileAsBase64(backFile)
    ]);
    const prompt =
      'Extraia todo o texto legível das imagens do cartão POC (frente e verso). ' +
      'Retorne apenas o texto contínuo, sem formatação, sem markdown e sem JSON.';
    const payload = await geminiRequest([
      { text: prompt },
      { inline_data: { mime_type: frontFile.type || 'image/jpeg', data: frontBase64 } },
      { inline_data: { mime_type: backFile.type || 'image/jpeg', data: backBase64 } }
    ]);
    return extractResponseText(payload);
  };

  const interpretToPocFields = async (extractedText, schema, categories) => {
    const prompt = [
      'Você é um assistente que interpreta cartões POC.',
      'Com base no texto abaixo, preencha o JSON estrito seguindo o schema.',
      'Respeite exatamente os nomes de categorias/subcategorias fornecidos nas listas.',
      'Se estiver incerto, escolha a opção mais próxima por similaridade textual e registre em meta.notes.',
      'Responda somente com JSON válido, sem markdown.',
      '',
      'Texto extraído:',
      extractedText || '(vazio)',
      '',
      'Schema esperado:',
      JSON.stringify(schema, null, 2),
      '',
      'Categorias disponíveis:',
      JSON.stringify(categories, null, 2)
    ].join('\n');

    const payload = await geminiRequest([{ text: prompt }]);
    return extractResponseText(payload);
  };

  const parseJsonStrict = (text) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        return null;
      }
    }
  };

  const buildOptionList = (select) => {
    if (!select) return [];
    return Array.from(select.options).map((option) => ({
      value: option.value,
      label: option.textContent || option.value
    }));
  };

  const scoreSimilarity = (base, candidate) => {
    if (!base || !candidate) return 0;
    if (base === candidate) return 1;
    if (candidate.includes(base) || base.includes(candidate)) return 0.9;
    const baseTokens = new Set(base.split(' '));
    const candidateTokens = new Set(candidate.split(' '));
    const intersection = [...baseTokens].filter((token) => candidateTokens.has(token));
    const score = intersection.length / Math.max(baseTokens.size, candidateTokens.size, 1);
    return score;
  };

  const findBestOption = (options, target) => {
    const normalizedTarget = normalizeText(target);
    let best = null;
    options.forEach((option) => {
      const normalizedLabel = normalizeText(option.label);
      const normalizedValue = normalizeText(option.value);
      const score = Math.max(
        scoreSimilarity(normalizedTarget, normalizedLabel),
        scoreSimilarity(normalizedTarget, normalizedValue)
      );
      if (!best || score > best.score) {
        best = { ...option, score };
      }
    });
    return best;
  };

  const shouldOverwrite = (currentValue, newValue, confidence, label) => {
    if (!currentValue || currentValue === newValue) return true;
    if ((confidence || 0) > CONFIDENCE_THRESHOLD) return true;
    return window.confirm(
      `O campo "${label}" já possui valor. Deseja substituir "${currentValue}" por "${newValue}"?`
    );
  };

  const setInputValue = (input, value, label, confidence) => {
    if (!input || value === undefined || value === null || value === '') return;
    const newValue = value.toString();
    if (!shouldOverwrite(input.value, newValue, confidence, label)) {
      addLog(`Campo "${label}" mantido pelo usuário.`);
      return;
    }
    input.value = newValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const setSelectValue = async (select, value, label, confidence) => {
    if (!select || !value) return;
    const options = buildOptionList(select).filter((option) => option.value);
    const match = findBestOption(options, value);
    if (!match || match.score < 0.45) {
      addLog(`Não foi possível localizar "${value}" em "${label}".`);
      return;
    }
    if (match.score < 0.7) {
      addLog(`"${label}" preenchido com baixa confiança usando "${match.label}".`);
    }
    if (!shouldOverwrite(select.value, match.value, confidence, label)) {
      addLog(`Campo "${label}" mantido pelo usuário.`);
      return;
    }
    select.value = match.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const setRadioValue = (name, value, label, confidence) => {
    if (!value) return;
    const radio = formScope.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!radio) {
      addLog(`Valor "${value}" não encontrado para "${label}".`);
      return;
    }
    if (!shouldOverwrite(radio.checked ? value : '', value, confidence, label)) {
      addLog(`Campo "${label}" mantido pelo usuário.`);
      return;
    }
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const waitForOption = async (select, value) => {
    if (!select || !value) return;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const options = buildOptionList(select);
      if (options.some((option) => option.value === value || option.label === value)) {
        return;
      }
      await delay(80);
    }
  };

  const applyPocAutofill = async (result) => {
    if (!result || !result.basic) {
      addLog('Resposta da IA inválida para preenchimento.');
      return;
    }

    clearLog();
    const { basic = {}, unsafe = {}, safe = {}, meta = {} } = result;
    const confidence = meta.confidence || {};

    const unidadeSelect = formScope.querySelector('#unidadeSelect');
    const setorSelect = formScope.querySelector('#setorSelect');
    const subsetorSelect = formScope.querySelector('#subsetorSelect');
    const categoriaSelect = formScope.querySelector('#categoriaInseguraSelect');
    const subcategoriaSelect = formScope.querySelector('#subcategoriaInseguraSelect');
    const observadorSelect = formScope.querySelector('#observador');
    const acompanhanteSelect = formScope.querySelector('#acompanhante');

    await setSelectValue(unidadeSelect, basic.unidade, 'Unidade', confidence.unidade);
    await waitForOption(setorSelect, basic.setor);
    await setSelectValue(setorSelect, basic.setor, 'Setor', confidence.setor);
    await waitForOption(subsetorSelect, basic.subsetor);
    await setSelectValue(subsetorSelect, basic.subsetor, 'Subsetor', confidence.subsetor);
    await setSelectValue(observadorSelect, basic.observador, 'Observador', confidence.observador);
    await setSelectValue(acompanhanteSelect, basic.acompanhante, 'Acompanhante', confidence.acompanhante);

    setInputValue(formScope.querySelector('#data'), basic.data, 'Data', confidence.data);
    setInputValue(formScope.querySelector('#hora'), basic.hora, 'Hora', confidence.hora);
    setInputValue(
      formScope.querySelector('#pessoas-observadas'),
      basic.pessoasObservadas,
      'Pessoas Observadas',
      confidence.pessoasObservadas
    );
    setInputValue(
      formScope.querySelector('#pessoas-area'),
      basic.pessoasArea,
      'Pessoas na Área',
      confidence.pessoasArea
    );

    setRadioValue('tipo-registro', basic.tipoRegistro, 'Tipo de registro', confidence.tipoRegistro);

    if (basic.tipoRegistro === 'insegura') {
      setRadioValue('tipoInsegura', unsafe.tipoInsegura, 'Tipo insegura', confidence.tipoInsegura);
      await setSelectValue(categoriaSelect, unsafe.categoria, 'Categoria', confidence.categoria);
      await waitForOption(subcategoriaSelect, unsafe.subcategoria);
      await setSelectValue(subcategoriaSelect, unsafe.subcategoria, 'Subcategoria', confidence.subcategoria);
      setInputValue(formScope.querySelector('#observado'), unsafe.observado, 'Observado', confidence.observado);
      setInputValue(
        formScope.querySelector('#quantidade'),
        unsafe.quantidade,
        'Quantidade',
        confidence.quantidade
      );
      setInputValue(
        formScope.querySelector('#pratica-insegura'),
        unsafe.praticaInsegura,
        'Descrição da prática/condição',
        confidence.praticaInsegura
      );
      setInputValue(
        formScope.querySelector('#acao-recomendada'),
        unsafe.acaoRecomendada,
        'Ação recomendada',
        confidence.acaoRecomendada
      );
    }

    if (basic.tipoRegistro === 'segura') {
      setInputValue(formScope.querySelector('#reconhecimento'), safe.reconhecimento, 'Reconhecimento', confidence.reconhecimento);
      setInputValue(formScope.querySelector('#observacao'), safe.observacao, 'Observação', confidence.observacao);
    }

    if (Array.isArray(meta.notes)) {
      meta.notes.forEach((note) => addLog(note));
    }

    if (confidence.categoria !== undefined && confidence.categoria < 0.6) {
      addLog('Categoria com baixa confiança, revise o preenchimento.');
    }
    if (confidence.subcategoria !== undefined && confidence.subcategoria < 0.6) {
      addLog('Subcategoria com baixa confiança, revise o preenchimento.');
    }

    updateUI();
  };

  const buildSchema = () => ({
    basic: {
      unidade: '',
      setor: '',
      subsetor: '',
      observador: '',
      acompanhante: '',
      data: 'YYYY-MM-DD',
      hora: 'HH:MM',
      pessoasObservadas: 0,
      pessoasArea: 0,
      tipoRegistro: 'insegura|segura'
    },
    unsafe: {
      tipoInsegura: 'PRATICA|CONDICAO',
      categoria: '',
      subcategoria: '',
      observado: 'colaborador|terceiro|visitante',
      quantidade: 0,
      praticaInsegura: '',
      acaoRecomendada: ''
    },
    safe: {
      reconhecimento: '',
      observacao: ''
    },
    meta: {
      confidence: {
        unidade: 0,
        setor: 0,
        subsetor: 0,
        categoria: 0,
        subcategoria: 0,
        tipoRegistro: 0
      },
      notes: []
    }
  });

  const buildCategoryContext = () => ({
    PRATICA: window.PRATICA || {},
    CONDICAO: window.CONDICAO || {}
  });

  const handleAutofill = async () => {
    if (!state.enabled) {
      setStatus('Ative o Modo IA nas opções (⚙️).');
      return;
    }
    if (!state.apiKey) {
      setStatus('Informe a chave da API Gemini nas opções.');
      return;
    }
    const frontFile = elements.frontInput?.files?.[0];
    const backFile = elements.backInput?.files?.[0];
    if (!frontFile || !backFile) {
      setStatus('Selecione duas imagens (frente e verso) antes de continuar.');
      return;
    }

    clearLog();
    setLoading(true);
    setStatus('Lendo cartão…');
    try {
      const extractedText = await extractTextFromImages(frontFile, backFile);
      if (!extractedText) {
        throw new Error('Não foi possível extrair texto do cartão.');
      }
      const schema = buildSchema();
      const categories = buildCategoryContext();
      const interpreted = await interpretToPocFields(extractedText, schema, categories);
      const result = parseJsonStrict(interpreted);
      if (!result) {
        throw new Error('Resposta da IA inválida (JSON quebrado).');
      }
      await applyPocAutofill(result);
      setStatus('Cartão preenchido. Revise os campos indicados.');
    } catch (error) {
      setStatus(error.message || 'Falha ao processar o cartão.');
      addLog('Erro ao processar o cartão. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const attachEvents = () => {
    elements.optionsToggle?.addEventListener('click', () => {
      const isHidden = elements.optionsPanel?.hasAttribute('hidden');
      if (elements.optionsPanel) {
        elements.optionsPanel.toggleAttribute('hidden');
      }
      elements.optionsToggle?.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    elements.saveSettingsBtn?.addEventListener('click', saveSettings);

    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setMode(button.dataset.mode);
      });
    });

    elements.fillBtn?.addEventListener('click', handleAutofill);
  };

  const init = () => {
    loadSettings();
    setMode(state.mode);
    updateFillAvailability();
    attachEvents();
  };

  init();

  return {
    extractTextFromImages,
    interpretToPocFields,
    applyPocAutofill
  };
})();
