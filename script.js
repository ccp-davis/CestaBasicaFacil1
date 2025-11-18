// script.js - dados, autenticação, filtros, geolocalização e interações.
// Deixe este arquivo em / mesma pasta / e referencie em cada HTML com defer.

// ---------------------- DADOS (produtos + mercados) ----------------------
const DATA = {
  products: [
    { id:1, nome:"Arroz 5kg", categoria:"Alimentos Básicos", imagem:"https://img.freepik.com/vetores-premium/bela-ilustracao-do-pacote-de-produtos-de-arroz_268722-462.jpg" },
    { id:2, nome:"Feijão 1kg", categoria:"Alimentos Básicos", imagem:"https://iili.io/KpZxCbe.md.jpg" },
    { id:3, nome:"Sabão em pó 800g", categoria:"Higiene/Limpeza", imagem:"https://iili.io/KpZz5Gf.md.webp" },
    { id:4, nome:"Carne bovina 1kg", categoria:"Carnes", imagem:"https://iili.io/KpZ1Jl1.md.jpg" },
    { id:5, nome:"Óleo de soja 900ml", categoria:"Alimentos Básicos", imagem:"https://iili.io/KpZEV4I.md.jpg" },
    { id:6, nome:"Detergente 500ml", categoria:"Higiene/Limpeza", imagem:"https://iili.io/KpZMJlS.md.webp" },
    // IMAGENS ATUALIZADAS
    { id:7, nome:"Açúcar 1kg", categoria:"Alimentos Básicos", imagem:"https://iili.io/KyMZaY7.md.webp" },
    { id:8, nome:"Leite 1L", categoria:"Bebidas", imagem:"https://iili.io/KyMpRJp.png" },
    { id:9, nome:"Macarrão 500g", categoria:"Alimentos Básicos", imagem:"https://iili.io/KyMyY3x.webp" }
  ],

  // mercados com coordenadas simuladas, telefone e whatsapp
  markets: [
    { id:1, nome:"Super Ideal", lat:-15.8260, lng:-57.6165, endereco:"Av. Mato Grosso, 123", whatsapp:"556598765432" },
    { id:2, nome:"Econômico", lat:-15.8300, lng:-57.6100, endereco:"R. Minas Gerais, 45", whatsapp:"556598701234" },
    { id:3, nome:"Bom Preço", lat:-15.8195, lng:-57.6200, endereco:"Av. Brasil, 300", whatsapp:"556598709876" },
    { id:4, nome:"Mercado Central", lat:-15.8280, lng:-57.6130, endereco:"Praça Central, 12", whatsapp:"556598703456" }
  ],

  // preços: id_produto x id_mercado -> preco (simulado)
  prices: [
    { productId:1, marketId:1, preco:6.99 },
    { productId:1, marketId:2, preco:7.49 },
    { productId:1, marketId:3, preco:7.29 },

    { productId:2, marketId:1, preco:8.99 },
    { productId:2, marketId:2, preco:9.19 },
    { productId:2, marketId:3, preco:8.89 },

    { productId:3, marketId:1, preco:11.50 },
    { productId:3, marketId:2, preco:12.20 },
    { productId:3, marketId:3, preco:11.79 },

    { productId:4, marketId:1, preco:34.90 },
    { productId:4, marketId:2, preco:33.50 },
    { productId:4, marketId:3, preco:35.20 },

    { productId:5, marketId:1, preco:10.50 },
    { productId:5, marketId:2, preco:9.99 },
    { productId:5, marketId:4, preco:10.19 }, // Óleo no Central

    { productId:6, marketId:1, preco:4.50 },
    { productId:6, marketId:3, preco:4.79 },
    { productId:6, marketId:4, preco:4.65 }, // Detergente no Central

    // extras: MAIS MERCADOS PARA AÇÚCAR, LEITE E MACARRÃO
    { productId:7, marketId:1, preco:4.20 },
    { productId:7, marketId:2, preco:4.35 }, 
    { productId:7, marketId:3, preco:4.10 }, 
    { productId:7, marketId:4, preco:4.25 }, // Açúcar no Central
    
    { productId:8, marketId:2, preco:3.99 },
    { productId:8, marketId:1, preco:4.05 }, 
    { productId:8, marketId:4, preco:3.89 }, 
    { productId:8, marketId:3, preco:3.95 }, // Leite no Bom Preço

    { productId:9, marketId:3, preco:2.99 },
    { productId:9, marketId:1, preco:3.15 }, 
    { productId:9, marketId:4, preco:3.09 },
    { productId:9, marketId:2, preco:3.05 } // Macarrão no Econômico
  ]
};

// helper moeda
function formatBRL(v){ return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

// ---------------------- MODAL CUSTOMIZADO (substitui alert/prompt) ----------------------
const customAlertModal = document.getElementById('customAlertModal');
const customAlertMessage = document.getElementById('customAlertMessage');
const customAlertClose = document.getElementById('customAlertClose');

// Função para mostrar o modal
function showAlert(message, redirectUrl = null) {
  if (customAlertModal && customAlertMessage) {
    customAlertMessage.innerHTML = message;
    customAlertModal.classList.remove('hidden');
    
    // Se houver URL de redirecionamento, adiciona o evento
    if (redirectUrl) {
      customAlertClose.onclick = () => { window.location.href = redirectUrl; };
    } else {
      customAlertClose.onclick = () => { customAlertModal.classList.add('hidden'); };
    }
  } else {
    // Fallback caso o HTML não esteja totalmente carregado (nunca deveria acontecer, mas por segurança)
    console.error('Modal de alerta não encontrado. Mensagem:', message);
  }
}

// ---------------------- MODAL DE DETALHES DO PRODUTO ----------------------
const productDetailModal = document.getElementById('productDetailModal');
const productDetailContent = document.getElementById('productDetailContent');
const closeDetailModal = document.getElementById('closeDetailModal');

if(productDetailModal) {
    closeDetailModal.onclick = () => productDetailModal.classList.add('hidden');
    productDetailModal.onclick = (e) => {
        if(e.target === productDetailModal) productDetailModal.classList.add('hidden');
    };
}

function showProductDetails(productId) {
    const product = DATA.products.find(p => p.id === productId);
    if (!product) return;

    const prices = getPricesForProduct(productId);
    const user = getCurrentUser();
    const canAccessDetails = user && user.isSubscribed;

    let pricesHTML = prices.map(pr => {
        const mk = DATA.markets.find(m => m.id === pr.marketId);
        const logoIcon = getMarketLogoSVG(mk.nome);
        const actionsHTML = canAccessDetails ? `
            <a href="https://www.google.com/maps/dir/?api=1&destination=${mk.lat},${mk.lng}" target="_blank" class="btn primary market-actions-small" style="padding: 8px 10px; font-size: 14px;"><i class="fas fa-route"></i> Rota</a>
            <a href="https://wa.me/55${mk.whatsapp}?text=${encodeURIComponent(`Olá! Vi o preço do(a) ${product.nome} no Cesta Básica Fácil.`)}" target="_blank" class="btn whatsapp-btn-full"><i class="fab fa-whatsapp"></i> WhatsApp</a>
        ` : `
            <span class="muted small">Assine para Contato/Rota</span>
        `;
        return `
            <div class="detail-price-row">
                <div>
                    <div class="detail-market-info">${logoIcon} ${mk.nome}</div>
                    <div class="muted small">${mk.endereco}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:800;color:var(--primary)"> ${formatBRL(pr.preco)}</div>
                    <div class="small" style="margin-top:6px; display:flex; gap: 8px;">${actionsHTML}</div>
                </div>
            </div>
        `;
    }).join('');

    // Adiciona o botão de assinatura se o usuário NÃO for assinante
    if (!canAccessDetails) {
        pricesHTML += `
            <div style="text-align:center; padding: 15px 0 5px 0; border-top: 1px solid #eee; margin-top: 15px;">
                <p class="premium-warning">Acesso aos contatos e rotas é exclusivo para assinantes.</p>
                <a href="pagamento.html" class="btn primary" style="width: 100%; display: block; justify-content: center;">
                    <i class="fas fa-crown"></i> Assine para liberar os recursos premium
                </a>
            </div>
        `;
    }

    productDetailContent.innerHTML = `
        <div id="detailHeader">
            <img src="${product.imagem}" alt="${product.nome}">
            <div>
                <h3 style="margin:0; font-size: 24px; color: var(--primary-600);">${product.nome}</h3>
                <p class="cat-small" style="margin:5px 0 0 0;">Categoria: ${product.categoria}</p>
                <p class="muted small" style="margin: 5px 0 0 0;">Preço médio: ${formatBRL(prices.reduce((sum, p) => sum + p.preco, 0) / prices.length)}</p>
            </div>
        </div>
        <h4>Preços e Opções de Compra</h4>
        <div id="detailPricesList">${pricesHTML}</div>
    `;

    productDetailModal.classList.remove('hidden');
}


// ---------------------- AUTENTICAÇÃO (localStorage) ----------------------
const AUTH_KEY = 'cbf_user'; // guarda {name,email,phone, isSubscribed}

function getCurrentUser(){
  try { 
    const user = JSON.parse(localStorage.getItem(AUTH_KEY));
    // Garante que o usuário tem o campo isSubscribed (padrão é false)
    return user ? { isSubscribed: false, ...user } : null; 
  } catch(e){ return null; }
}
function setCurrentUser(user){ localStorage.setItem(AUTH_KEY, JSON.stringify(user)); updateAuthUI(); }
function logoutUser(){ localStorage.removeItem(AUTH_KEY); updateAuthUI(); }

// atualiza link "Entrar / Cadastrar" e mostra saudação quando logado
function updateAuthUI(){
  const user = getCurrentUser();
  const authLink = document.getElementById('authLink');
  const userMenuDropdown = document.getElementById('userMenuDropdown');

  if(authLink){
    if(user){
      authLink.textContent = `Olá, ${user.name ? user.name.split(' ')[0] : user.email.split('@')[0]} ${user.isSubscribed ? '✅' : '🔒'}`;
      authLink.href = '#'; // Não navega, apenas abre o menu
      authLink.classList.add('logged');
      userMenuDropdown?.classList.add('hidden'); // Esconde o menu por padrão
    } else {
      authLink.textContent = 'Entrar / Cadastrar';
      authLink.href = 'cadastro.html';
      authLink.classList.remove('logged');
      userMenuDropdown?.classList.add('hidden');
    }

    // Adiciona listener para toggle do menu de usuário
    authLink.onclick = (e) => {
      if(authLink.classList.contains('logged')) {
        e.preventDefault();
        userMenuDropdown.classList.toggle('hidden');
      }
    };
  }
  
  // cadastro page specifics
  const btnLogout = document.getElementById('btnLogout');
  const btnProceedToPayment = document.getElementById('btnProceedToPayment');
  const regMessage = document.getElementById('regMessage');
  
  if(btnProceedToPayment){
    if(user && user.isSubscribed){
      btnProceedToPayment.style.display = 'none';
      regMessage && (regMessage.innerHTML = `<i class="fas fa-check-circle" style="color:#25D366"></i> Você já é um assinante Premium!`);
    } else if(user && !user.isSubscribed) {
      // Se já está logado mas não assinou
      btnProceedToPayment.textContent = 'Continuar para Pagamento';
      btnProceedToPayment.style.display = 'inline-block';
      regMessage && (regMessage.innerHTML = `Olá, ${user.name ? user.name : user.email}. Continue para gerenciar sua assinatura.`);
    } else {
      // Se não está logado
      btnProceedToPayment.textContent = 'Cadastrar e Avançar';
      btnProceedToPayment.style.display = 'inline-block';
      regMessage && (regMessage.textContent = '');
    }
  }

  // Lógica de mostrar/esconder logout no cadastro (usado como 'Minhas Informações')
  if (btnLogout) {
    btnLogout.style.style.display = user ? 'inline-block' : 'none';
  }

  // Notices on products/markets
  const notice = document.getElementById('loginNotice');
  if(notice) notice.classList.toggle('hidden', user && user.isSubscribed);
  const noticeM = document.getElementById('loginNoticeMarkets');
  if(noticeM) noticeM.classList.toggle('hidden', user && user.isSubscribed);
}

// ---------------------- CADASTRO / LOGIN / LOGOUT / MENU ----------------------
document.addEventListener('DOMContentLoaded', ()=>{
  // Configuração do Menu de Usuário
  setupUserMenu();
  
  // CADASTRO: Cadastrar e Avançar
  const btnProceedToPayment = document.getElementById('btnProceedToPayment');
  if(btnProceedToPayment){
    btnProceedToPayment.addEventListener('click', ()=>{
      const user = getCurrentUser();
      if(user && !user.isSubscribed) {
        window.location.href = 'pagamento.html';
        return;
      }

      const email = (document.getElementById('regEmail')||{}).value?.trim();
      const pass = (document.getElementById('regPass')||{}).value;
      const pass2 = (document.getElementById('regPass2')||{}).value;

      if(!email || !pass || !pass2){ showAlert('Preencha E-mail e Senhas.'); return; }
      if(pass !== pass2){ showAlert('As senhas não conferem.'); return; }

      // salva (simulação)
      setCurrentUser({ name: 'Novo Usuário', email: email, phone: '', isSubscribed: false });
      showAlert('Cadastro realizado! Você foi autenticado. Prossiga para a assinatura.', 'pagamento.html');
    });
  }

  // LOGIN: Entrar (página login.html)
  const btnLogin = document.getElementById('btnLogin');
  if(btnLogin) {
    btnLogin.addEventListener('click', () => {
      const email = document.getElementById('loginEmail')?.value.trim();
      const pass = document.getElementById('loginPass')?.value;
      
      if (email && pass) {
        // Simulação de login: Se a senha for "123", loga.
        if(pass === '123') {
           const name = 'Usuário Simulado'; 
           setCurrentUser({ name: name, email: email, isSubscribed: false });
           showAlert(`Login Simulado realizado! Olá, ${name}.`, 'index.html');
        } else {
           showAlert('E-mail ou senha incorretos (simulação: use senha "123").');
        }
      } else {
        showAlert('Preencha E-mail e Senha para Entrar.');
      }
    });
  }
  
  // Lógica de Login Social (Simulação - para os botões em cadastro.html e login.html)
  document.querySelectorAll('.btn-social').forEach(btn => {
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          const provider = btn.dataset.provider;
          const dummyEmail = `${provider.toLowerCase()}@simulacao.com`;
          const name = `Usuário ${provider}`;
          
          setCurrentUser({ name: name, email: dummyEmail, phone: '', isSubscribed: false });
          showAlert(`Login com ${provider} Simulado! Você está logado.`, 'index.html');
      });
  });


  // Ação de Sair (se for o botão na página de cadastro)
  const btnLogout = document.getElementById('btnLogout');
  if(btnLogout){
    btnLogout.addEventListener('click', ()=>{
      logoutUser();
      window.location.href = 'index.html';
    });
  }

  // contato page
  const sendContact = document.getElementById('sendContact');
  if(sendContact){
    sendContact.addEventListener('click', ()=>{
      const name = (document.getElementById('contactName')||{}).value || '';
      const email = (document.getElementById('contactEmail')||{}).value || '';
      const msg = (document.getElementById('contactMsg')||{}).value || '';
      if(!name || !email || !msg){ showAlert('Preencha todos os campos do contato.'); return; }
      showAlert('Mensagem enviada (simulação). Obrigado!');
      document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMsg').value='';
    });
  }

  // quick wa support
  const waSupport = document.getElementById('waSupport');
  if(waSupport) waSupport.addEventListener('click', ()=> {
    window.open(`https://wa.me/55${DATA.markets[0].whatsapp}?text=${encodeURIComponent('Olá, tenho uma dúvida sobre preços — Cesta Básica Fácil')}`, '_blank');
  });

  // home: render featured
  renderHomeCards();

  // produtos page: setup filters & render
  setupProductFilters();
  
  // NOVO: Adiciona listener para o botão de localização no HEADER (só existe em produtos.html)
  const btnGeoHeader = document.getElementById('btnGeoHeader');
  if(btnGeoHeader) btnGeoHeader.addEventListener('click', handleGeolocationHeader);

  // mercados page: render markets (distances empty until geolocation)
  renderMarkets();

  // Pagamento Page Setup
  setupPaymentPage();
  
  // Inicialização final da UI de autenticação
  updateAuthUI();
});

// ---------------------- LÓGICA DO MENU DO USUÁRIO ----------------------
function setupUserMenu(){
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  if (!userMenuDropdown) return;

  userMenuDropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.dataset.action;
      const user = getCurrentUser();

      // Esconde o menu após o clique
      userMenuDropdown.classList.add('hidden');

      if (action === 'logout') {
        logoutUser();
        showAlert('Você foi desconectado com sucesso.', 'index.html');
      } else if (action === 'my-account' || action === 'my-info') {
        // Redireciona para cadastro, que agora funciona como 'Minhas Informações'
        showAlert(`Ação: ${link.textContent} (Simulação)\nDetalhes: Aqui você editaria seus dados ou veria seu status de assinatura.`, 'cadastro.html');
      } else if (action === 'manage-sub') {
        window.location.href = 'pagamento.html';
      }
    });
  });
}

// ---------------------- LÓGICA DA PÁGINA DE PAGAMENTO ----------------------
function setupPaymentPage() {
  const paymentMethod = document.getElementById('paymentMethod');
  const cardFields = document.getElementById('cardFields');
  const generalFields = document.getElementById('generalFields');
  const btnPayCard = document.getElementById('btnPayCard');
  const btnGenerate = document.getElementById('btnGenerate');
  
  // Garante que a página tem o formulário antes de tentar configurar
  if (!paymentMethod) return;

  // Função para alternar campos
  function toggleFields() {
    const method = paymentMethod.value;
    cardFields.classList.toggle('hidden', method !== 'card');
    generalFields.classList.toggle('hidden', method === 'card');

    if (method === 'card') {
      btnPayCard.style.display = 'block';
      btnGenerate.style.display = 'none';
    } else {
      btnPayCard.style.display = 'none';
      btnGenerate.style.display = 'block';
      btnGenerate.innerHTML = `<i class="fas ${method === 'pix' ? 'fa-qrcode' : 'fa-barcode'}"></i> Gerar ${method === 'pix' ? 'QR Code PIX' : 'Boleto'}`;
    }
  }

  paymentMethod.addEventListener('change', toggleFields);
  toggleFields(); // Chamada inicial

  // Processamento de Cartão (Simulação)
  if(btnPayCard) {
    btnPayCard.addEventListener('click', () => {
      const number = document.getElementById('cardNumber').value.trim();
      const name = document.getElementById('cardHolderName').value.trim();
      const dobCard = document.getElementById('payerDobCard').value.trim(); // NOVO CAMPO
      if (!number || !name || !dobCard) { showAlert('Preencha todos os dados do pagador e do cartão, incluindo a Data de Nascimento.'); return; }
      
      // Simulação de Sucesso
      const user = getCurrentUser();
      if (user) {
        const namePayer = document.getElementById('payerNameCard').value.trim();
        const cpfPayer = document.getElementById('payerCpfCard').value.trim();
        
        setCurrentUser({ 
          ...user, 
          isSubscribed: true, 
          name: namePayer || user.name, 
          phone: 'Telefone Simulado', 
          cpf: cpfPayer || 'CPF Simulado',
          dob: dobCard // Salva a data de nascimento (simulação)
        });
        openPaymentModal('Cartão de Crédito', 'Pagamento Aprovado!', 'Sua assinatura Premium foi ativada com sucesso! Você já pode acessar todos os recursos do Cesta Básica Fácil.');
      }
    });
  }

  // Processamento de Pix/Boleto (Simulação)
  if(btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      const name = document.getElementById('payerName').value.trim();
      const cpf = document.getElementById('payerCpf').value.trim();
      const dob = document.getElementById('payerDob').value.trim(); // NOVO CAMPO
      const method = paymentMethod.value;
      if (!name || !cpf || !dob) { showAlert(`Preencha o Nome, CPF e Data de Nascimento do pagador para gerar o ${method}.`); return; }

      const title = method === 'pix' ? 'QR Code PIX Gerado' : 'Boleto Gerado';
      const code = method === 'pix' ? '00190.00009 01234.567890 12345.678901 5 9227000000500' : '23790.00008 60000.000010 32770.123454 4 9227000000500';
      const msg = `Seu código ${method.toUpperCase()} foi gerado com sucesso! A liberação da sua conta acontecerá após a confirmação do pagamento.`;

      const details = `<div style="text-align:left; margin-top:10px;"><p style="font-size:14px; font-weight:700;">Código de Barras/PIX:</p><code style="word-break: break-all; font-size: 12px; display: block; background: #f7f7f7; padding: 8px; border-radius: 4px;">${code}</code></div>`;

      const user = getCurrentUser();
      if (user) {
        // Atualiza os dados do usuário (simulação)
        setCurrentUser({ 
          ...user, 
          isSubscribed: true, 
          name: name || user.name, 
          phone: 'Telefone Simulado', 
          cpf: cpf || 'CPF Simulado',
          dob: dob // Salva a data de nascimento (simulação)
        });
        openPaymentModal(title, msg, details);
      }
    });
  }

  const modalCloseAndLogin = document.getElementById('modalCloseAndLogin');
  if(modalCloseAndLogin) {
    modalCloseAndLogin.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

function openPaymentModal(title, message, detailsHTML) {
  const modal = document.getElementById('paymentModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('modalDetails').innerHTML = detailsHTML;
  modal.classList.remove('hidden');
}


// ---------------------- RENDER HOME CARDS ----------------------
function renderHomeCards(){
  // hero search
  const goSearchBtn = document.getElementById('goSearchBtn');
  const homeSearch = document.getElementById('homeSearch');
  if(goSearchBtn){
    goSearchBtn.addEventListener('click', ()=> {
      const q = homeSearch.value.trim();
      if(q) window.location.href = `produtos.html?q=${encodeURIComponent(q)}`;
      else window.location.href = 'produtos.html';
    });
  }

  // chips
  document.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=> {
      const cat = ch.dataset.cat;
      window.location.href = `produtos.html?cat=${encodeURIComponent(cat)}`;
    });
  });
}

// ---------------------- PRODUTOS / FILTROS ----------------------
function setupProductFilters(){
  const productsList = document.getElementById('productsList');
  if(!productsList) return;

  const searchInput = document.getElementById('prodSearch');
  const filterMarket = document.getElementById('filterMarket');
  const filterCategory = document.getElementById('filterCategory');
  const priceMaxInput = document.getElementById('priceMaxInput'); // Novo campo de preço máximo
  const clearBtn = document.getElementById('clearFilters');

  // populate markets dropdown & categories
  FILTERS_populateDropdowns();

  function renderFiltered(){
    const q = (searchInput?.value || '').toLowerCase();
    const marketId = filterMarket?.value || '';
    const cat = filterCategory?.value || '';
    // Usa o valor do input[type="number"]
    const maxPrice = Number(priceMaxInput?.value || 9999);
    const user = getCurrentUser();
    const canAccessDetails = user && user.isSubscribed;

    productsList.innerHTML = '';
    const filtered = DATA.products.filter(p=>{
      if(cat && p.categoria !== cat) return false;
      if(q && !(p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))) return false;
      // check min price for product across markets
      const prices = getPricesForProduct(p.id).map(x=>x.preco);
      const minp = prices.length ? Math.min(...prices) : 99999;
      // Filtro de preço MÁXIMO (usando input number)
      if(minp > maxPrice) return false;
      if(marketId){
        // ensure product has price in that market
        const has = DATA.prices.some(pr=>pr.productId===p.id && String(pr.marketId)===marketId);
        if(!has) return false;
      }
      return true;
    });

    if(filtered.length === 0){
      productsList.innerHTML = `<div class="notice">Nenhum item encontrado. Tente ajustar os filtros.</div>`;
      return;
    }

    filtered.forEach(p=>{
      const prices = getPricesForProduct(p.id);
      const min = prices.length ? Math.min(...prices) : null;
      const card = document.createElement('div');
      card.className = 'card product-card-clickable'; // Classe para indicar que o clique abre o modal
      card.setAttribute('data-product-id', p.id); // Adiciona ID para o clique
      
      let priceListHTML = '<div class="price-list-summary">';
      // Mostra os 3 primeiros preços com botões de rota e WhatsApp
      prices.slice(0, 3).forEach(pr => {
          const mk = DATA.markets.find(m => m.id === pr.marketId);
          const logoIcon = getMarketLogoSVG(mk.nome);
          
          // Ações no card (Rota + Ícone WhatsApp)
          const actionsHTML = canAccessDetails ? `
              <a href="https://www.google.com/maps/dir/?api=1&destination=${mk.lat},${mk.lng}" target="_blank" class="btn primary market-actions-small" onclick="event.stopPropagation();" style="padding: 6px 8px; font-size: 13px;"><i class="fas fa-route"></i> Rota</a>
              <a href="https://wa.me/55${mk.whatsapp}?text=${encodeURIComponent(`Olá! Vi o preço do(a) ${p.nome} no Cesta Básica Fácil.`)}" target="_blank" class="btn whatsapp-icon-only" onclick="event.stopPropagation();">
                <img src="https://iili.io/KywdJTJ.png" alt="WhatsApp Icon" class="wa-img-icon">
              </a>
          ` : `
              <span class="muted small">🔒 Assine</span>
          `;

          priceListHTML += `
              <div class="price-market-row-list">
                  <div style="font-weight: 600;">${logoIcon} ${mk.nome}</div>
                  <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
                      <div style="font-weight: 800; color: var(--primary);">${formatBRL(pr.preco)}</div>
                      <div class="market-actions-small-container">${actionsHTML}</div>
                  </div>
              </div>
          `;
      });
      priceListHTML += '</div>';

      // Adiciona um botão/link para "Ver Mais Detalhes" se houver mais de 3 preços
      if (prices.length > 3) {
          priceListHTML += `<div style="text-align: center; margin-top: 10px;">
              <button class="btn primary" onclick="event.stopPropagation(); showProductDetails(${p.id});">
                  <i class="fas fa-search"></i> Ver ${prices.length - 3} Mercados a Mais
              </button>
          </div>`;
      }


      card.innerHTML = `
        <div class="thumb"><img src="${p.imagem}" alt="${p.nome}"></div>
        <div class="name">${p.nome}</div>
        <div class="cat-small">${p.categoria}</div>
        <div class="muted small">Preços por mercado:</div>
        ${priceListHTML}
      `;
      
      productsList.appendChild(card);
    });

    // Adiciona evento de clique para abrir o modal no card inteiro
    productsList.querySelectorAll('.product-card-clickable').forEach(card => {
        card.addEventListener('click', () => {
            const productId = Number(card.getAttribute('data-product-id'));
            showProductDetails(productId);
        });
    });
  }

  // handlers
  [searchInput, filterMarket, filterCategory, priceMaxInput].forEach(inp=>{ if(inp) inp.addEventListener('input', renderFiltered); });
  
  if(clearBtn) clearBtn.addEventListener('click', ()=> {
    if(searchInput) searchInput.value=''; filterMarket.value=''; filterCategory.value=''; priceMaxInput.value=100; renderFiltered();
  });

  // initial rendering (support URL params q / cat)
  const url = new URL(location.href);
  const qParam = url.searchParams.get('q');
  const catParam = url.searchParams.get('cat');
  if(qParam && searchInput) searchInput.value = qParam;
  if(catParam && filterCategory) filterCategory.value = catParam;
  renderFiltered();
}

function FILTERS_populateDropdowns(){
  const filterMarket = document.getElementById('filterMarket');
  const filterCategory = document.getElementById('filterCategory');
  if(filterMarket){
    filterMarket.innerHTML = '<option value="">Todos os mercados</option>';
    DATA.markets.forEach(m=> filterMarket.insertAdjacentHTML('beforeend', `<option value="${m.id}">${m.nome}</option>`));
  }
  if(filterCategory){
    const cats = [...new Set(DATA.products.map(p=>p.categoria))];
    filterCategory.innerHTML = '<option value="">Todas as categorias</option>';
    cats.forEach(c=> filterCategory.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
  }
}

function getPricesForProduct(productId){
  return DATA.prices.filter(p=>p.productId===productId).map(p=>{
    return { marketId: p.marketId, preco: p.preco };
  });
}

// ---------------------- MERCADOS (geolocalização e render) ----------------------
let userCoords = null;
let geoStatusElementHeader = null; // Elemento para o status da localização no HEADER

function getMarketLogoSVG(marketName) {
    // Simulação de logo customizada com base no nome
    const colorMap = {
        "Super Ideal": "#FF3B30",
        "Econômico": "#0052cc",
        "Bom Preço": "#25D366",
        "Mercado Central": "#F9A825"
    };
    const color = colorMap[marketName] || "#999999";
    
    return `<svg class="market-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${color}"><path d="M22 8L12 3L2 8V20H22V8ZM14 17H10V11H14V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 22V24M17 22V24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function computeDistanceKm(lat1, lon1, lat2, lon2){
  // haversine
  const R = 6371;
  const toRad = v => v * Math.PI/180;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function renderMarkets(){
  const el = document.getElementById('marketsList');
  if(!el) return;
  el.innerHTML = '';
  const user = getCurrentUser();
  const canAccessDetails = user && user.isSubscribed;

  DATA.markets.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'card market-card';
    const dist = userCoords ? computeDistanceKm(userCoords.lat, userCoords.lng, m.lat, m.lng).toFixed(2) + ' km' : '—';
    const logoIcon = getMarketLogoSVG(m.nome);

    // Botões na página de Mercados (pode manter o texto se houver espaço)
    const actionsHTML = canAccessDetails ? `
        <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" class="btn map-btn"><i class="fas fa-route"></i> Rota</a>
        <a href="https://wa.me/55${m.whatsapp}?text=${encodeURIComponent('Olá! Vi seus preços no Cesta Básica Fácil.')}" target="_blank" class="btn whatsapp-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a>
    ` : `
        <span class="muted small">Assine para Contato/Rota</span>
    `;

    div.innerHTML = `
      <div class="market-info">
        <div style="font-weight:800">${logoIcon} ${m.nome} <span class="muted small">• ${dist}</span></div>
        <div class="muted small">${m.endereco}</div>
      </div>
      <div class="market-actions">
        ${actionsHTML}
      </div>
    `;
    el.appendChild(div);
  });

  // Attach events (only necessary for internal buttons like geo-location)
  // For Rota/WA, we use anchor tags <a> now in the HTML generation above.
}

// LÓGICA DE GEOLOCALIZAÇÃO
function handleGeolocation(statusElement) {
    if(!navigator.geolocation){ 
        showAlert('Geolocalização não suportada pelo seu navegador.'); 
        statusElement.textContent = 'Indisponível';
        return; 
    }
    statusElement.textContent = 'Obtendo localização...';
    navigator.geolocation.getCurrentPosition(pos=>{
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      statusElement.textContent = `Localização: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
      // Atualiza o display da localização no header, se estiver na página produtos
      if (geoStatusElementHeader) geoStatusElementHeader.textContent = `Localização: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
      renderMarkets(); // atualiza distâncias (em mercados.html)
    }, err=>{
      statusElement.textContent = 'Permissão negada ou erro ao obter localização.';
      if (geoStatusElementHeader) geoStatusElementHeader.textContent = 'Localização: Permissão negada';
      console.warn(err);
      // não trava: userCoords fica null
      renderMarkets();
    }, { enableHighAccuracy:true, timeout:10000 });
}

// Botão de localização no HEADER (só existe em produtos.html)
function handleGeolocationHeader() {
    if (!geoStatusElementHeader) {
        geoStatusElementHeader = document.getElementById('geoStatusHeader');
        if (!geoStatusElementHeader) return;
    }
    geoStatusElementHeader.classList.remove('hidden');
    handleGeolocation(geoStatusElementHeader);
}

// geolocation button na página mercados.html
document.addEventListener('click', (ev)=>{
  if(ev.target && ev.target.id === 'btnGetLocation'){
    const status = document.getElementById('geoStatus');
    handleGeolocation(status);
  }
});

// ---------------------- UTILIDADES (Checagem de Assinatura) ----------------------
function checkAuthAndSub(){
  const u = getCurrentUser();
  if(!u){
    showAlert('🔒 **Acesso restrito:** Faça login/cadastro para continuar.', 'cadastro.html');
    return false;
  }
  if(!u.isSubscribed){
    showAlert('🔒 **Funcionalidade Premium:** Faça sua assinatura mensal para liberar contatos e rotas.', 'pagamento.html');
    return false;
  }
  return true;
}

// ---------------------- INICIALIZAÇÃO ADICIONAL ----------------------
// popula dropdowns everywhere on load (ex: header auth link)
document.addEventListener('DOMContentLoaded', ()=>{
  // fill markets dropdown in produtos page if present
  FILTERS_populateDropdowns();

  // render markets list (initial)
  renderMarkets();

  // show login notices
  updateAuthUI();
  
  // Close custom alert if user clicks outside of modal content
  if(customAlertModal) {
    customAlertModal.addEventListener('click', (e) => {
      if (e.target === customAlertModal) {
        customAlertModal.classList.add('hidden');
      }
    });
  }
  
  // Define o elemento de status do header
  geoStatusElementHeader = document.getElementById('geoStatusHeader');
  if(geoStatusElementHeader) geoStatusElementHeader.classList.add('hidden');
});