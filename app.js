const form = document.getElementById('poc-form');
const tabButtons = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const addBtn = document.getElementById('add-btn');
const viewButtons = document.querySelectorAll('[data-view]');
const viewPanels = document.querySelectorAll('[data-view-panel]');
const categoriaSelect = document.getElementById('categoriaInseguraSelect');
const subcategoriaSelect = document.getElementById('subcategoriaInseguraSelect');
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
  categoriaSelect,
  subcategoriaSelect,
  document.getElementById('observado'),
  document.getElementById('quantidade'),
  document.getElementById('pratica-insegura'),
  document.getElementById('acao-recomendada')
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

const getTipoInseguraSelecionado = () => {
  const checked = document.querySelector('input[name="tipoInsegura"]:checked');
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
  const tipoInseguraSelecionado = getTipoInseguraSelecionado() !== '';
  return tipoInseguraSelecionado
    && unsafeFields.every((field) => field.value.trim() !== '' && field.checkValidity());
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
  setActiveTab('basicos');
  disableTab('inseguras', true);
  disableTab('seguras', true);
  addBtn.disabled = true;
  
  // Preencher data e hora automaticamente
  preencherDataHoraAtual();
  
  // Restaurar valores padrão após reset
  setTimeout(() => {
    restaurarValoresPadrao();
  }, 100);
};

/**
 * Preenche data e hora com valores atuais
 */
function preencherDataHoraAtual() {
  const dataInput = document.getElementById('data');
  const horaInput = document.getElementById('hora');
  
  if (dataInput) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    dataInput.value = `${ano}-${mes}-${dia}`;
  }
  
  if (horaInput) {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    horaInput.value = `${horas}:${minutos}`;
  }
}

/**
 * Restaura valores padrão (observador Brayan, unidade Vespasiano, etc)
 */
function restaurarValoresPadrao() {
  const observadorSelect = document.getElementById('observador');
  const unidadeSelect = document.getElementById('unidadeSelect');
  
  // Restaurar observador Brayan
  if (observadorSelect) {
    observadorSelect.value = 'brayan';
    observadorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Restaurar cascata Vespasiano > Administrativo > TI
  if (unidadeSelect) {
    setTimeout(() => {
      aplicarSelecaoCascata({
        unidade: 'Vespasiano',
        setor: 'Administrativo',
        subsetor: 'TI'
      });
    }, 200);
  }
  
  updateUI();
}

/**
 * Aplica seleção em cascata (unidade → setor → subsetor)
 */
function aplicarSelecaoCascata({ unidade, setor, subsetor }) {
  const unidadeSelect = document.getElementById('unidadeSelect');
  const setorSelect = document.getElementById('setorSelect');
  const subsetorSelect = document.getElementById('subsetorSelect');
  
  if (!unidadeSelect) return;
  
  // Selecionar unidade
  unidadeSelect.value = unidade;
  
  // Usar jQuery trigger se disponível
  if (window.$ && window.$(unidadeSelect).length) {
    window.$(unidadeSelect).trigger('change');
  } else {
    unidadeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Aguardar setores carregarem e selecionar
  setTimeout(() => {
    if (setorSelect && setor) {
      setorSelect.value = setor;
      if (window.$ && window.$(setorSelect).length) {
        window.$(setorSelect).trigger('change');
      } else {
        setorSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Aguardar subsetores carregarem e selecionar
      setTimeout(() => {
        if (subsetorSelect && subsetor) {
          subsetorSelect.value = subsetor;
          if (window.$ && window.$(subsetorSelect).length) {
            window.$(subsetorSelect).trigger('change');
          } else {
            subsetorSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, 300);
    }
  }, 300);
}

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

document.querySelectorAll('input[name="tipoInsegura"]').forEach((radio) => {
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

// Preencher data e hora automaticamente no carregamento da página
if (typeof preencherDataHoraAtual === 'function') {
  preencherDataHoraAtual();
}


/* ===============================
 * Helpers para IA - Gemini
 * =============================== */

/**
 * Constrói payload com as opções válidas de categorias e subcategorias
 * baseadas na constante global INSEGURAS do HTML.
 * @returns {Object} Estrutura com categorias e subcategorias para PRATICA e CONDICAO
 */
function buildInsegurasOptionsPayload() {
  // INSEGURAS vem do HTML (script inline)
  // Tentar diferentes formas de acessar
  let INSEGURAS_DATA = null;
  
  if (window.INSEGURAS) {
    INSEGURAS_DATA = window.INSEGURAS;
    console.log('✅ Encontrado via window.INSEGURAS');
  } else if (typeof INSEGURAS !== 'undefined') {
    INSEGURAS_DATA = INSEGURAS;
    console.log('✅ Encontrado via variável global INSEGURAS');
  } else if (window.PRATICA && window.CONDICAO) {
    INSEGURAS_DATA = { PRATICA: window.PRATICA, CONDICAO: window.CONDICAO };
    console.log('✅ Encontrado via window.PRATICA e window.CONDICAO separados');
  }
  
  if (!INSEGURAS_DATA) {
    console.error('❌ ERRO: Nenhuma forma de acessar INSEGURAS funcionou!');
    console.log('🔍 Variáveis globais disponíveis:', Object.keys(window).filter(k => k.includes('INSEGURA') || k.includes('PRATICA') || k.includes('CONDICAO')));
    return { PRATICA: {}, CONDICAO: {} };
  }
  
  console.log('🔍 INSEGURAS_DATA encontrado:', INSEGURAS_DATA);
  console.log('🔍 Chaves em INSEGURAS_DATA:', Object.keys(INSEGURAS_DATA));
  
  const payload = {
    PRATICA: INSEGURAS_DATA.PRATICA || {},
    CONDICAO: INSEGURAS_DATA.CONDICAO || {}
  };
  
  console.log('✅ Payload construído:');
  console.log('   - PRATICA:', payload.PRATICA);
  console.log('   - PRATICA tem', Object.keys(payload.PRATICA).length, 'categorias');
  console.log('   - CONDICAO:', payload.CONDICAO);
  console.log('   - CONDICAO tem', Object.keys(payload.CONDICAO).length, 'categorias');
  
  return payload;
}

/**
 * Aguarda que um select tenha um número mínimo de opções carregadas.
 * @param {HTMLSelectElement} selectEl - Elemento select
 * @param {number} minOptions - Número mínimo de opções (além da opção vazia)
 * @param {number} timeoutMs - Timeout em milissegundos
 * @returns {Promise<boolean>} True se carregou, false se timeout
 */
function waitForOptions(selectEl, minOptions = 1, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      // Conta opções (excluindo a primeira que é geralmente vazia)
      const optionsCount = selectEl.options.length - 1;
      if (optionsCount >= minOptions) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }
      if (Date.now() - startTime >= timeoutMs) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Chama a API do Gemini para interpretar o texto OCR e retornar
 * JSON estruturado com os campos do formulário.
 * @param {string} ocrText - Texto extraído via OCR
 * @param {Object} options - Opções válidas de categorias/subcategorias
 * @returns {Promise<Object>} Objeto com campos parseados
 */
async function callGeminiToParse(ocrText, options) {
  const apiKey = localStorage.getItem('pocAiApiKey');
  if (!apiKey) {
    throw new Error('Chave API do Gemini não configurada.');
  }

  console.log('📋 Opções enviadas ao Gemini:', options);
  const numCatPratica = Object.keys(options.PRATICA || {}).length;
  const numCatCondicao = Object.keys(options.CONDICAO || {}).length;
  console.log(`📊 Total: ${numCatPratica} categorias PRATICA, ${numCatCondicao} categorias CONDICAO`);

  // Limitar o texto OCR para reduzir tokens de entrada
  const ocrLimitado = ocrText.substring(0, 500);
  
  // Construir lista COMPLETA e hierárquica de forma MUITO CLARA
  let estruturaDetalhada = '';
  
  estruturaDetalhada += '=== ESTRUTURA HIERÁRQUICA ===\n\n';
  
  if (options.PRATICA) {
    estruturaDetalhada += '📌 TIPO: "PRATICA"\n';
    estruturaDetalhada += 'Categorias disponíveis para PRATICA:\n\n';
    Object.entries(options.PRATICA).forEach(([categoria, subcategorias]) => {
      estruturaDetalhada += `CATEGORIA: "${categoria}"\n`;
      estruturaDetalhada += `  Subcategorias:\n`;
      subcategorias.forEach(sub => {
        estruturaDetalhada += `    - "${sub}"\n`;
      });
      estruturaDetalhada += '\n';
    });
  }
  
  if (options.CONDICAO) {
    estruturaDetalhada += '📌 TIPO: "CONDICAO"\n';
    estruturaDetalhada += 'Categorias disponíveis para CONDICAO:\n\n';
    Object.entries(options.CONDICAO).forEach(([categoria, subcategorias]) => {
      estruturaDetalhada += `CATEGORIA: "${categoria}"\n`;
      estruturaDetalhada += `  Subcategorias:\n`;
      subcategorias.forEach(sub => {
        estruturaDetalhada += `    - "${sub}"\n`;
      });
      estruturaDetalhada += '\n';
    });
  }
  
  const prompt = `Você é um especialista em análise de segurança. Analise o texto OCR e preencha o JSON seguindo A HIERARQUIA EXATA.

TEXTO OCR:
"${ocrLimitado}"

${estruturaDetalhada}

PASSO A PASSO OBRIGATÓRIO:
1️⃣ Determine o TIPO: "PRATICA" (ação insegura de pessoa) OU "CONDICAO" (problema no ambiente/equipamento)

2️⃣ Olhe APENAS as categorias do tipo escolhido acima

3️⃣ Escolha UMA CATEGORIA (exemplo: "B. Posição das Pessoas" OU "CI. Ambiente / Área")
   ⚠️ ATENÇÃO: Categoria NÃO é "Risco de Queda" - isso é subcategoria!
   ⚠️ Categoria começa com letra (A., B., C., CI., etc)

4️⃣ Depois de escolher a CATEGORIA, olhe as subcategorias DAQUELA categoria

5️⃣ Escolha UMA SUBCATEGORIA da lista daquela categoria

6️⃣ Escreva descrição CLARA e OBJETIVA (2-3 frases, 100-150 caracteres):
   - Descreva O QUE foi observado
   - ONDE e COMO estava acontecendo
   - QUAL o risco presente

7️⃣ Escreva ação recomendada CLARA e OBJETIVA (2-3 frases, 100-150 caracteres):
   - O QUE deve ser feito
   - COMO corrigir
   - Cite norma se relevante (NR-35, NR-10, NR-06)

EXEMPLOS CORRETOS DE PREENCHIMENTO:

Exemplo 1 - PRATICA:
{
  "tipoRegistro": "insegura",
  "tipoInsegura": "PRATICA",
  "categoria": "B. Posição das Pessoas",
  "subcategoria": "B.3 Risco de Queda",
  "observado": "colaborador",
  "quantidade": 1,
  "praticaInsegura": "Colaborador realizando manutenção elétrica em cima de escada de 4 metros sem cinto de segurança ou linha de vida. Escada sem calço de segurança em superfície irregular.",
  "acaoRecomendada": "Interromper atividade imediatamente. Fornecer cinto paraquedista com talabarte e instalar pontos de ancoragem certificados. Treinar conforme NR-35 antes de retornar."
}

Exemplo 2 - CONDICAO:
{
  "tipoRegistro": "insegura",
  "tipoInsegura": "CONDICAO",
  "categoria": "CI. Ambiente / Área",
  "subcategoria": "CI.1 Piso irregular / escorregadio",
  "observado": "visitante",
  "quantidade": 2,
  "praticaInsegura": "Derramamento de óleo hidráulico no piso da produção com aproximadamente 3 metros de diâmetro. Superfície extremamente escorregadia sem sinalização ou isolamento.",
  "acaoRecomendada": "Sinalizar e isolar área imediatamente com cones e fita zebrada. Realizar limpeza com absorvente e desengordurante. Corrigir vazamento da prensa hidráulica."
}

Exemplo 3 - PRATICA com EPI:
{
  "tipoRegistro": "insegura",
  "tipoInsegura": "PRATICA",
  "categoria": "C. EPIs",
  "subcategoria": "C.1 Cabeça",
  "observado": "terceiro",
  "quantidade": 3,
  "praticaInsegura": "Três terceiros realizando carga e descarga sem capacete em área com ponte rolante ativa. Movimentação de cargas suspensas de até 2 toneladas sobre os trabalhadores.",
  "acaoRecomendada": "Fornecer capacetes classe A certificados imediatamente. Realizar DDS sobre riscos de queda de objetos. Aplicar advertência formal ao encarregado."
}

⚠️ ERROS COMUNS A EVITAR:
❌ categoria: "Risco de Queda" → ERRADO! Isso é subcategoria
✅ categoria: "B. Posição das Pessoas", subcategoria: "B.3 Risco de Queda" → CORRETO!

RETORNE APENAS O JSON PREENCHIDO (sem explicações, sem markdown):`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192  // Aumentado para máximo (8192)
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta inválida da API Gemini.');
  }

  // Verificar se a resposta foi truncada
  const finishReason = data.candidates[0].finishReason;
  console.log('Finish reason:', finishReason);
  
  if (finishReason === 'MAX_TOKENS') {
    console.warn('⚠️ Resposta do Gemini foi truncada por limite de tokens');
    
    // Tentar modo ultra-simples: usar o OCR como base
    console.log('Usando fallback com OCR resumido...');
    
    // Pegar as primeiras frases do OCR para prática e ação
    const linhas = ocrText.split('\n').filter(l => l.trim().length > 5);
    const pratica = linhas.slice(0, 2).join(' ').substring(0, 150).trim() || 'Prática/condição insegura identificada';
    const acao = linhas.length > 2 ? linhas.slice(2, 4).join(' ').substring(0, 150).trim() : 'Corrigir imediatamente';
    
    return {
      tipoRegistro: 'insegura',
      tipoInsegura: null,
      categoria: null,
      subcategoria: null,
      observado: 'colaborador',
      quantidade: 1,
      praticaInsegura: pratica,
      acaoRecomendada: acao
    };
  }

  const text = data.candidates[0].content.parts
    .map((p) => p.text || '')
    .join('')
    .trim();

  console.log('Resposta bruta do Gemini:', text);

  // Remove markdown code blocks se presentes
  let cleanText = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Remove possíveis textos antes/depois do JSON
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanText = jsonMatch[0];
  }
  
  console.log('Texto limpo para parse:', cleanText);
  
  // Parse JSON
  try {
    const parsed = JSON.parse(cleanText);
    return parsed;
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON:', parseError);
    console.error('Texto que falhou:', cleanText);
    throw new Error(`Falha ao interpretar resposta do Gemini: ${parseError.message}`);
  }
}

/**
 * Valida e sanitiza os campos parseados pelo Gemini.
 * @param {Object} parsed - Objeto parseado
 * @param {Object} options - Opções válidas
 * @returns {Object} Objeto validado
 */
function validateParsedFields(parsed, options) {
  const validated = { ...parsed };

  console.log('🔍 DEBUG - Estrutura options recebida:', options);
  console.log('🔍 DEBUG - Chaves disponíveis em options:', Object.keys(options));
  console.log('🔍 DEBUG - tipoInsegura recebido:', validated.tipoInsegura);

  // Função para normalizar strings (remove espaços extras, normaliza unicode)
  const normalize = (str) => {
    if (!str) return str;
    return str.trim().replace(/\s+/g, ' ').normalize('NFC');
  };

  // Validar tipoInsegura
  if (!['PRATICA', 'CONDICAO'].includes(validated.tipoInsegura)) {
    console.warn(`⚠ tipoInsegura inválido: "${validated.tipoInsegura}"`);
    validated.tipoInsegura = null;
  }

  // Validar categoria e subcategoria
  if (validated.tipoInsegura && validated.categoria) {
    const tipoData = options[validated.tipoInsegura];
    console.log(`🔍 DEBUG - options["${validated.tipoInsegura}"]:`, tipoData);
    
    if (!tipoData) {
      console.error(`❌ ERRO: options["${validated.tipoInsegura}"] está undefined ou null!`);
      console.log('🔍 Tentando chaves alternativas...');
      // Tentar encontrar chave com nome similar
      Object.keys(options).forEach(key => {
        console.log(`   - Chave encontrada: "${key}"`);
      });
      validated.categoria = null;
      validated.subcategoria = null;
      return validated;
    }
    
    const categoriesValid = Object.keys(tipoData);
    const categoriaNormalizada = normalize(validated.categoria);
    const categoriasNormalizadas = categoriesValid.map(c => normalize(c));
    
    console.log(`🔍 Validando categoria:`);
    console.log(`   Tipo: ${validated.tipoInsegura}`);
    console.log(`   Categoria recebida: "${validated.categoria}"`);
    console.log(`   Categoria normalizada: "${categoriaNormalizada}"`);
    console.log(`   Categorias válidas:`, categoriesValid);
    console.log(`   Categorias normalizadas:`, categoriasNormalizadas);
    
    // Buscar índice da categoria normalizada
    const indexCategoria = categoriasNormalizadas.indexOf(categoriaNormalizada);
    
    if (indexCategoria === -1) {
      console.warn(`⚠ Categoria "${validated.categoria}" não encontrada. Válidas:`, categoriesValid);
      validated.categoria = null;
      validated.subcategoria = null;
    } else {
      // Usar a categoria original (não normalizada) do objeto options
      const categoriaCorreta = categoriesValid[indexCategoria];
      console.log(`✅ Categoria encontrada! Usando: "${categoriaCorreta}"`);
      validated.categoria = categoriaCorreta;
      
      if (validated.subcategoria) {
        const subcategoriesValid = tipoData[categoriaCorreta] || [];
        const subcategoriaNormalizada = normalize(validated.subcategoria);
        const subcategoriasNormalizadas = subcategoriesValid.map(s => normalize(s));
        
        console.log(`🔍 Validando subcategoria:`);
        console.log(`   Subcategoria recebida: "${validated.subcategoria}"`);
        console.log(`   Subcategoria normalizada: "${subcategoriaNormalizada}"`);
        console.log(`   Subcategorias válidas:`, subcategoriesValid);
        
        const indexSubcategoria = subcategoriasNormalizadas.indexOf(subcategoriaNormalizada);
        
        if (indexSubcategoria === -1) {
          console.warn(`⚠ Subcategoria "${validated.subcategoria}" não encontrada. Válidas:`, subcategoriesValid);
          validated.subcategoria = null;
        } else {
          const subcategoriaCorreta = subcategoriesValid[indexSubcategoria];
          console.log(`✅ Subcategoria encontrada! Usando: "${subcategoriaCorreta}"`);
          validated.subcategoria = subcategoriaCorreta;
        }
      }
    }
  } else {
    validated.categoria = null;
    validated.subcategoria = null;
  }

  // Validar observado
  if (!['colaborador', 'terceiro', 'visitante'].includes(validated.observado)) {
    console.warn(`⚠ observado inválido: "${validated.observado}"`);
    validated.observado = null;
  }

  // Validar quantidade
  if (validated.quantidade != null) {
    const qty = parseInt(validated.quantidade, 10);
    if (isNaN(qty) || qty < 1) {
      console.warn(`⚠ quantidade inválida: "${validated.quantidade}"`);
      validated.quantidade = null;
    } else {
      validated.quantidade = qty;
    }
  }

  console.log('✅ Validação concluída:', validated);
  return validated;
}

/**
 * Aplica os campos parseados ao formulário, seguindo a ordem correta
 * de preenchimento e disparando eventos necessários.
 * @param {Object} parsed - Objeto validado com os campos
 */
async function applyParsedToForm(parsed) {
  addLogMessage(`Aplicando campos: tipo=${parsed.tipoInsegura}, cat=${parsed.categoria}, subcat=${parsed.subcategoria}`);
  
  // 1. Marcar tipo-registro = "insegura"
  const tipoRegistroRadio = document.querySelector('input[name="tipo-registro"][value="insegura"]');
  if (tipoRegistroRadio && !tipoRegistroRadio.checked) {
    tipoRegistroRadio.checked = true;
    tipoRegistroRadio.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));
    addLogMessage('✓ Tipo de registro marcado: insegura');
  }

  // 2. Marcar radio tipoInsegura (PRATICA ou CONDICAO)
  if (parsed.tipoInsegura) {
    const tipoInseguraRadio = document.querySelector(`input[name="tipoInsegura"][value="${parsed.tipoInsegura}"]`);
    if (tipoInseguraRadio) {
      const currentChecked = document.querySelector('input[name="tipoInsegura"]:checked');
      if (!currentChecked || currentChecked.value !== parsed.tipoInsegura) {
        tipoInseguraRadio.checked = true;
        
        // Disparar evento tanto nativo quanto jQuery
        tipoInseguraRadio.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.$ && window.$(tipoInseguraRadio).length) {
          window.$(tipoInseguraRadio).trigger('change');
        }
        
        addLogMessage(`✓ Tipo marcado: ${parsed.tipoInsegura}. Aguardando categorias...`);
        await new Promise(r => setTimeout(r, 300));
        
        // Aguardar opções de categoria carregarem
        const catLoaded = await waitForOptions(categoriaSelect, 1, 3000);
        if (catLoaded) {
          addLogMessage(`✓ Categorias carregadas: ${categoriaSelect.options.length - 1} opções`);
        } else {
          addLogMessage('⚠ Timeout aguardando categorias');
        }
      }
    }
  }

  // 3. Selecionar categoria
  if (parsed.categoria) {
    await new Promise(r => setTimeout(r, 200));
    
    // Verificar se a categoria existe nas opções
    const optionsArray = Array.from(categoriaSelect.options);
    const hasOption = optionsArray.some(opt => opt.value === parsed.categoria);
    
    addLogMessage(`Tentando selecionar categoria: "${parsed.categoria}" (existe: ${hasOption})`);
    
    if (hasOption && categoriaSelect.value !== parsed.categoria) {
      categoriaSelect.value = parsed.categoria;
      
      // Disparar eventos nativos e jQuery
      categoriaSelect.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.$ && window.$(categoriaSelect).length) {
        window.$(categoriaSelect).trigger('change');
      }
      
      addLogMessage(`✓ Categoria selecionada: ${parsed.categoria}. Aguardando subcategorias...`);
      await new Promise(r => setTimeout(r, 300));
      
      // Aguardar opções de subcategoria carregarem
      const subLoaded = await waitForOptions(subcategoriaSelect, 1, 3000);
      if (subLoaded) {
        addLogMessage(`✓ Subcategorias carregadas: ${subcategoriaSelect.options.length - 1} opções`);
      } else {
        addLogMessage('⚠ Timeout aguardando subcategorias');
      }
    } else if (!hasOption) {
      addLogMessage(`⚠ Categoria "${parsed.categoria}" não encontrada nas opções disponíveis`);
    }
  }

  // 4. Selecionar subcategoria
  if (parsed.subcategoria) {
    await new Promise(r => setTimeout(r, 200));
    
    const optionsArray = Array.from(subcategoriaSelect.options);
    const hasOption = optionsArray.some(opt => opt.value === parsed.subcategoria);
    
    addLogMessage(`Tentando selecionar subcategoria: "${parsed.subcategoria}" (existe: ${hasOption})`);
    
    if (hasOption && subcategoriaSelect.value !== parsed.subcategoria) {
      subcategoriaSelect.value = parsed.subcategoria;
      
      // Disparar eventos nativos e jQuery
      subcategoriaSelect.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.$ && window.$(subcategoriaSelect).length) {
        window.$(subcategoriaSelect).trigger('change');
      }
      
      addLogMessage(`✓ Subcategoria selecionada: ${parsed.subcategoria}`);
    } else if (!hasOption) {
      addLogMessage(`⚠ Subcategoria "${parsed.subcategoria}" não encontrada nas opções disponíveis`);
    }
  }

  // 5. Selecionar observado
  const observadoSelect = document.getElementById('observado');
  if (parsed.observado && observadoSelect && !observadoSelect.value) {
    observadoSelect.value = parsed.observado;
    observadoSelect.dispatchEvent(new Event('change', { bubbles: true }));
    addLogMessage(`✓ Observado: ${parsed.observado}`);
  }

  // 6. Preencher quantidade
  const quantidadeInput = document.getElementById('quantidade');
  if (parsed.quantidade != null && quantidadeInput && !quantidadeInput.value) {
    quantidadeInput.value = parsed.quantidade;
    quantidadeInput.dispatchEvent(new Event('input', { bubbles: true }));
    addLogMessage(`✓ Quantidade: ${parsed.quantidade}`);
  }

  // 7. Preencher prática insegura (APENAS se vazio)
  const praticaTextarea = document.getElementById('pratica-insegura');
  if (parsed.praticaInsegura && praticaTextarea && !praticaTextarea.value.trim()) {
    praticaTextarea.value = parsed.praticaInsegura;
    praticaTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    addLogMessage('✓ Prática insegura preenchida');
  }

  // 8. Preencher ação recomendada (APENAS se vazio)
  const acaoTextarea = document.getElementById('acao-recomendada');
  if (parsed.acaoRecomendada && acaoTextarea && !acaoTextarea.value.trim()) {
    acaoTextarea.value = parsed.acaoRecomendada;
    acaoTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    addLogMessage('✓ Ação recomendada preenchida');
  }

  // 9. Atualizar UI
  await new Promise(r => setTimeout(r, 200));
  updateUI();
}

/**
 * Adiciona mensagem ao log da IA (apenas console, sem UI)
 */
function addLogMessage(message) {
  console.log(`[POC AI] ${message}`);
  
  // Não mostrar mais o log visualmente
  // const logEl = document.getElementById('pocAiLog');
  // if (!logEl) return;
  // logEl.classList.remove('d-none');
  // logEl.classList.add('is-visible');
  // const timestamp = new Date().toLocaleTimeString('pt-BR');
  // logEl.innerHTML += `<div>[${timestamp}] ${message}</div>`;
  // logEl.scrollTop = logEl.scrollHeight;
}

/**
 * Limpa o log da IA
 */
function clearLogMessages() {
  const logEl = document.getElementById('pocAiLog');
  if (!logEl) return;
  logEl.innerHTML = '';
  logEl.classList.add('d-none');
  logEl.classList.remove('is-visible');
}

/* ===============================
 * PocAI – execução real com Gemini
 * =============================== */
window.PocAI = window.PocAI || {};
window.PocAI.run = async function () {
  const front = document.getElementById('pocAiFront');
  const back = document.getElementById('pocAiBack');
  const status = document.getElementById('pocAiFillStatus');
  const progress = document.getElementById('pocAiProgress');
  const error = document.getElementById('pocAiError');
  const runBtn = document.getElementById('pocAiRun');

  // Limpar log anterior
  clearLogMessages();

  if (!front?.files?.length || !back?.files?.length) {
    status.textContent = 'Selecione a frente e o verso do cartão.';
    return;
  }

  if (!window.Tesseract) {
    status.textContent = 'Biblioteca OCR indisponível. Recarregue a página.';
    return;
  }

  const apiKey = localStorage.getItem('pocAiApiKey');
  const aiEnabled = localStorage.getItem('pocAiEnabled') === 'true';

  if (!aiEnabled) {
    status.textContent = 'Modo IA desligado. Ative nas configurações.';
    return;
  }

  if (!apiKey) {
    status.textContent = 'Configure a API Key do Gemini nas opções.';
    return;
  }

  if (runBtn) {
    runBtn.disabled = true;
  }

  if (error) {
    error.classList.add('d-none');
    error.textContent = '';
  }
  if (progress) {
    progress.classList.remove('d-none');
    progress.textContent = 'Preparando leitura OCR…';
  }

  status.textContent = 'Enviando imagens para leitura por IA…';
  addLogMessage('Iniciando processamento...');

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Falha ao ler imagem.'));
      reader.readAsDataURL(file);
    });
  };

  const recognizeImage = async (file, label) => {
    const imageData = await readFileAsDataUrl(file);
    const result = await window.Tesseract.recognize(imageData, 'por', {
      logger: (message) => {
        if (progress && message.status) {
          const pct = Math.round((message.progress || 0) * 100);
          progress.textContent = `${label}: ${message.status} ${pct}%`;
        }
      }
    });
    return result?.data?.text || '';
  };

  try {
    // Fase 1: OCR
    addLogMessage('Extraindo texto das imagens com OCR...');
    status.textContent = 'Imagens recebidas. Interpretando conteúdo…';
    const [frontText, backText] = await Promise.all([
      recognizeImage(front.files[0], 'Frente'),
      recognizeImage(back.files[0], 'Verso')
    ]);

    const combinedText = [frontText, backText]
      .map((text) => text.trim())
      .filter(Boolean)
      .join('\n\n');

    if (!combinedText) {
      throw new Error('Não foi possível extrair texto das imagens.');
    }

    addLogMessage('OCR concluído. Texto extraído.');

    const selectedType = getSelectedType();

    // Se não for tipo "insegura", usar fallback simples
    if (selectedType !== 'insegura') {
      addLogMessage('Tipo de registro não é "insegura". Preenchendo campo de reconhecimento...');
      const reconhecimento = document.getElementById('reconhecimento');
      if (reconhecimento && !reconhecimento.value.trim()) {
        reconhecimento.value = combinedText;
      }
      updateUI();
      status.textContent = 'Leitura concluída. Campo preenchido com OCR.';
      addLogMessage('Concluído.');
      return;
    }

    // Fase 2: Interpretação com Gemini
    addLogMessage('Interpretando conteúdo com Gemini...');
    status.textContent = 'Analisando conteúdo com IA...';
    
    const options = buildInsegurasOptionsPayload();
    let parsed;
    
    try {
      parsed = await callGeminiToParse(combinedText, options);
      console.log('✅ Parsed do Gemini:', JSON.stringify(parsed, null, 2));
      addLogMessage(`JSON recebido: ${JSON.stringify(parsed)}`);
      
      // Validar campos
      const validated = validateParsedFields(parsed, options);
      console.log('✅ Campos validados:', JSON.stringify(validated, null, 2));
      addLogMessage(`Validado - pratica: "${validated.praticaInsegura}", acao: "${validated.acaoRecomendada}"`);
      
      // Aplicar ao formulário
      await applyParsedToForm(validated);
      
      status.textContent = 'Preenchimento automático concluído!';
      addLogMessage('✓ Formulário preenchido com sucesso.');
      
      // Fechar modal de preenchimento
      const fillModal = document.getElementById('pocAiFillModal');
      if (fillModal && window.bootstrap?.Modal) {
        const modalInstance = window.bootstrap.Modal.getInstance(fillModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      
      // Mostrar modal de sucesso
      setTimeout(() => {
        alert('✅ Formulário preenchido com sucesso!\n\nTodos os campos foram preenchidos automaticamente pela IA. Revise as informações e clique em "Adicionar" para salvar.');
      }, 300);
      
    } catch (geminiError) {
      console.error('Erro ao chamar Gemini:', geminiError);
      addLogMessage(`⚠ Erro no Gemini: ${geminiError.message}`);
      
      // Fallback: preencher apenas os textareas com OCR bruto
      addLogMessage('Usando fallback: preenchendo campos de texto com OCR bruto.');
      const pratica = document.getElementById('pratica-insegura');
      const acao = document.getElementById('acao-recomendada');
      if (pratica && !pratica.value.trim()) {
        pratica.value = combinedText;
      }
      if (acao && !acao.value.trim()) {
        acao.value = combinedText;
      }
      updateUI();
      status.textContent = 'Erro na interpretação IA. Campos preenchidos com OCR bruto.';
      
      if (error) {
        error.classList.remove('d-none');
        error.textContent = `Erro ao processar com Gemini: ${geminiError.message}. Campos preenchidos com texto bruto.`;
      }
    }

  } catch (err) {
    console.error('Erro no processamento:', err);
    addLogMessage(`✗ Erro: ${err.message}`);
    
    if (error) {
      error.classList.remove('d-none');
      error.textContent = err?.message || 'Erro ao ler imagens.';
    }
    status.textContent = 'Não foi possível interpretar as imagens.';
  } finally {
    if (progress) {
      progress.classList.add('d-none');
    }
    if (runBtn) {
      runBtn.disabled = false;
    }
  }
};

/* ===============================
 * Configurações e Modais
 * =============================== */
document.addEventListener('DOMContentLoaded', () => {
  const runBtn = document.getElementById('pocAiRun');
  const fillModalEl = document.getElementById('pocAiFillModal');
  const settingsModalEl = document.getElementById('pocAiSettingsModal');
  const fillButtons = [
    document.getElementById('poc-ai-fill-btn'),
    document.getElementById('poc-ai-fill-btn-safe')
  ];
  const settingsButtons = [
    document.getElementById('poc-ai-settings-btn'),
    document.getElementById('poc-ai-settings-btn-safe')
  ];
  const frontInput = document.getElementById('pocAiFront');
  const backInput = document.getElementById('pocAiBack');
  const modeCameraBtn = document.getElementById('pocAiModeCamera');
  const modeGalleryBtn = document.getElementById('pocAiModeGallery');
  const modeStatus = document.getElementById('pocAiFillStatus');

  // Settings modal
  const apiKeyInput = document.getElementById('pocAiApiKey');
  const enabledSwitch = document.getElementById('pocAiEnabled');
  const saveSettingsBtn = document.getElementById('pocAiSaveSettings');
  const settingsStatus = document.getElementById('pocAiSettingsStatus');

  const ensureModal = (modalElement) => {
    if (!modalElement || !window.bootstrap?.Modal) {
      return null;
    }
    return window.bootstrap.Modal.getOrCreateInstance(modalElement);
  };

  const setCaptureMode = (mode) => {
    if (!frontInput || !backInput) return;
    const captureValue = mode === 'camera' ? 'environment' : null;
    [frontInput, backInput].forEach((input) => {
      if (captureValue) {
        input.setAttribute('capture', captureValue);
      } else {
        input.removeAttribute('capture');
      }
      input.value = '';
    });
    if (modeStatus) {
      modeStatus.textContent =
        mode === 'camera'
          ? 'Modo câmera ativado. Tire as fotos.'
          : 'Escolha imagens da galeria.';
    }
  };

  // Carregar configurações salvas
  if (apiKeyInput) {
    apiKeyInput.value = localStorage.getItem('pocAiApiKey') || '';
  }
  if (enabledSwitch) {
    enabledSwitch.checked = localStorage.getItem('pocAiEnabled') === 'true';
  }

  // Salvar configurações
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const apiKey = apiKeyInput?.value?.trim() || '';
      const enabled = enabledSwitch?.checked || false;

      localStorage.setItem('pocAiApiKey', apiKey);
      localStorage.setItem('pocAiEnabled', enabled ? 'true' : 'false');

      if (settingsStatus) {
        settingsStatus.classList.remove('d-none');
        settingsStatus.textContent = 'Configurações salvas com sucesso!';
        setTimeout(() => {
          settingsStatus.classList.add('d-none');
        }, 3000);
      }
    });
  }

  fillButtons.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const modal = ensureModal(fillModalEl);
      if (modal) {
        clearLogMessages();
        modal.show();
      }
    });
  });

  settingsButtons.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const modal = ensureModal(settingsModalEl);
      if (modal) {
        modal.show();
      }
    });
  });

  if (modeCameraBtn) {
    modeCameraBtn.addEventListener('click', () => setCaptureMode('camera'));
  }

  if (modeGalleryBtn) {
    modeGalleryBtn.addEventListener('click', () => setCaptureMode('gallery'));
  }

  if (fillModalEl) {
    fillModalEl.addEventListener('show.bs.modal', () => {
      setCaptureMode('gallery');
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (window.PocAI && typeof window.PocAI.run === 'function') {
        window.PocAI.run();
      }
    });
  }
});
