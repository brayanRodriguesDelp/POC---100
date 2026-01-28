/*
  Exemplo de uso no HTML:
  <label><strong>Unidade*</strong>
    <select id="unidadeSelect" required></select>
  </label>
  <label><strong>Setor*</strong>
    <select id="setorSelect" required></select>
  </label>
  <label><strong>Subsetor*</strong>
    <select id="subsetorSelect" required></select>
  </label>

  <script src="assets/js/cascata-unidade-setor-subsetor.js"></script>
*/

// =======================
// MAPEAMENTO
// =======================
const MAP = {
  Vespasiano: {
    Administrativo: [
      'Comercial',
      'Diretoria',
      'Engenharia de Aplicações e Vendas',
      'Facilites',
      'Financeiro',
      'Gente e Gestão',
      'Gerência de Projetos',
      'Marketing',
      'Pesquisa e Desenvolvimento',
      'SGQ',
      'Suprimentos',
      'TI'
    ],
    Almoxarifado: ['Almoxarifado', 'Chaparia', 'Magazine'],
    'Area Externa': [
      'Área Externa',
      'Banker',
      'Estacionamento',
      'FAT',
      'Montagem de Andaimes',
      'Oficina de Excelência Operacional',
      'Sala de Treinamento'
    ],
    Calderaria: [
      'CD - Centro de Distribuição',
      'Célula A',
      'Célula B',
      'Célula ME',
      'Célula Robotizada',
      'Célula T',
      'Centro Tecnológico Soldagem',
      'Forno'
    ],
    CQ: ['CQ Documental', 'CQ Fábrica'],
    'Field Service': [
      'Administrativo',
      'Almoxarifado',
      'DOW',
      'Obra Coifa',
      'Saipem Guarujá-SP'
    ],
    Logística: ['Expedição', 'Operadores de ponte', 'Serviços Gerais'],
    Manutenção: ['Manutenção', 'Terceiros'],
    'Montagem de Campo': ['Montagem de Estacas'],
    'Montagem Mecanica': ['Montagem Mecanica'],
    Pintura: ['Pintura'],
    'Produtivo Indireto': [
      'Engenharia Industrial Usinagem',
      'Engenharia de Calderaria',
      'Engenharia de Materiais e Solda',
      'Engenharia de Usinagem',
      'Engenharia Industrial Mecanica',
      'Excelência Operacional',
      'Gerência da Produção',
      'Melhoria de Manufatura',
      'Metrologia',
      'PCP',
      'SESMT',
      'SGA'
    ],
    Terceiros: [
      'Clientes Residente',
      'Cliente Visitante',
      'Conservação e Limpeza',
      'Fretamento (Allure)',
      'Portaria',
      'Restaurante',
      'Vigilancia e Portaria'
    ],
    Usinagem: ['Ferramentaria', 'Leve', 'Pesada']
  },
  Contagem: 'Vespasiano',
  'Porto Açu': {
    Cais: ['Montagem/Soldagem'],
    'Galpão Delp Açu': [
      'Administrativo',
      'Área de Produção',
      'Manutenção',
      'Montagem/Mov de Carga',
      'Soldagem'
    ],
    'Montagem Externa': ['Jumper Niterói/ Bacalhau']
  }
};

// =======================
// UTILS
// =======================
const resolveUnitMap = (unidade) => {
  const unitEntry = MAP[unidade];
  if (!unitEntry) {
    return {};
  }
  if (typeof unitEntry === 'string') {
    return MAP[unitEntry] || {};
  }
  return unitEntry;
};

const fillSelect = ($select, items, placeholder) => {
  const safeItems = Array.isArray(items) ? items : [];
  $select.empty();
  $select.append(`<option value="">${placeholder}</option>`);
  safeItems.forEach((item) => {
    $select.append(`<option value="${item}">${item}</option>`);
  });
};

const resetSelect = ($select, placeholder) => {
  $select.empty();
  $select.append(`<option value="">${placeholder}</option>`);
};

// =======================
// EVENTOS
// =======================
$(function () {
  const $unidade = $('#unidadeSelect');
  const $setor = $('#setorSelect');
  const $subsetor = $('#subsetorSelect');
  const placeholder = 'Selecione';

  if (!$unidade.length || !$setor.length || !$subsetor.length) {
    return;
  }

  const updateSetores = (keepSelection) => {
    const unitMap = resolveUnitMap($unidade.val());
    const setores = Object.keys(unitMap);
    const currentSetor = keepSelection ? $setor.val() : '';
    fillSelect($setor, setores, placeholder);
    if (currentSetor && setores.includes(currentSetor)) {
      $setor.val(currentSetor);
    }
  };

  const updateSubsetores = (keepSelection) => {
    const unitMap = resolveUnitMap($unidade.val());
    const subsetores = unitMap[$setor.val()] || [];
    const currentSubsetor = keepSelection ? $subsetor.val() : '';
    fillSelect($subsetor, subsetores, placeholder);
    if (currentSubsetor && subsetores.includes(currentSubsetor)) {
      $subsetor.val(currentSubsetor);
    }
  };

  $unidade.on('change', () => {
    updateSetores(false);
    resetSelect($subsetor, placeholder);
  });

  $setor.on('change', () => {
    updateSubsetores(false);
  });

  // =======================
  // INIT
  // =======================
  if ($unidade.val()) {
    updateSetores(true);
    if ($setor.val()) {
      updateSubsetores(true);
    } else {
      resetSelect($subsetor, placeholder);
    }
  } else {
    resetSelect($setor, placeholder);
    resetSelect($subsetor, placeholder);
  }
});
