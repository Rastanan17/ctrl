(() => {
  'use strict';

  const STORAGE_KEY = 'controlConsignaciones_v1';
  const IMAGE_OPTIONS = [
    ['images/bizcochitos.png', 'Bizcochitos'], ['images/maicena.png', 'Alfajores de maicena'],
    ['images/pepas.png', 'Pepas'], ['images/pepitos.png', 'Pepitos'],
    ['images/cheesecake.png', 'Cheesecake Petit'], ['images/cheesecake.png', 'Cheesecake Glotón'],
    ['images/cheesecake.png', 'Cheesecake Goloso'], ['images/oreo.png', 'Oreo petit'],
    ['images/oreo.png', 'Oreo glotón'], ['images/oreo.png', 'Oreo Goloso'],
    ['images/chocotorta.png', 'Chocotorta Petit'], ['images/chocotorta.png', 'Chocotorta Glotón'],
    ['images/chocotorta.png', 'Chocotorta Goloso'], ['images/lemonpie.png', 'Lemon pie petit'],
    ['images/lemonpie.png', 'Lemon pie Glotón'], ['images/lemonpie.png', 'Lemon pie Goloso'],
    ['images/tiramisu.png', 'Tiramisú Petit'], ['images/tiramisu.png', 'Tiramisú Glotón'],
    ['images/tiramisu.png', 'Tiramisú Goloso'], ['images/brownie.png', 'Brownie Petit'],
    ['images/brownie.png', 'Brownie Glotón'], ['images/brownie.png', 'Brownie Goloso'],
    ['images/pochoclochoco.png', 'Pochoclo chocolate'], ['images/pochoclofrutilla.png', 'Pochoclo frutilla'],
    ['images/pochocloslimon.png', 'Pochoclo limón'], ['images/pochoclosvainilla.png', 'Pochoclo vainilla']
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const dateTime = value => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const cleanPhone = value => String(value || '').replace(/\D/g, '').replace(/^0+/, '');

  const defaults = {
    clients: [],
    products: [
      { id: uid(), name: 'Alfajorcitos de Maicena', presentation: '250 gr', price: 4000, cost: 1400, brand: 'Tomá Mate', image: 'images/maicena.png' },
      { id: uid(), name: 'Bizcochitos de Grasa', presentation: '200 gr', price: 3000, cost: 1000, brand: 'Tomá Mate', image: 'images/bizcochitos.png' },
      { id: uid(), name: 'Pepas con Membrillo', presentation: '150 gr', price: 4000, cost: 1400, brand: 'Tomá Mate', image: 'images/pepas.png' },
      { id: uid(), name: 'Pepitos con Chips', presentation: '150 gr', price: 4000, cost: 1400, brand: 'Tomá Mate', image: 'images/pepitos.png' },
      { id: uid(), name: 'Pochoclos Chocolate', presentation: '1 paquete', price: 1300, cost: 500, brand: 'Tomá Mate', image: 'images/pochoclochoco.png' },
      { id: uid(), name: 'Pochoclos Frutilla', presentation: '1 paquete', price: 1300, cost: 500, brand: 'Tomá Mate', image: 'images/pochoclofrutilla.png' },
      { id: uid(), name: 'Pochoclos Limón', presentation: '1 paquete', price: 1300, cost: 500, brand: 'Tomá Mate', image: 'images/pochocloslimon.png' },
      { id: uid(), name: 'Pochoclos Vainilla', presentation: '1 paquete', price: 1300, cost: 500, brand: 'Tomá Mate', image: 'images/pochoclosvainilla.png' },
      { id: uid(), name: 'CheeseCake Petit', presentation: '100ml', price: 3500, cost: 1200, brand: 'Dulce Toque', image: 'images/cheesecake.png' },
      { id: uid(), name: 'CheeseCake Glotón', presentation: '250ml', price: 6000, cost: 2200, brand: 'Dulce Toque', image: 'images/cheesecake.png' },
      { id: uid(), name: 'CheeseCake Goloso', presentation: '350ml', price: 7500, cost: 2600, brand: 'Dulce Toque', image: 'images/cheesecake.png' },
      { id: uid(), name: 'ChocoTorta Petit', presentation: '100ml', price: 3500, cost: 1200, brand: 'Dulce Toque', image: 'images/chocotorta.png' },
      { id: uid(), name: 'ChocoTorta Glotón', presentation: '250ml', price: 7500, cost: 2500, brand: 'Dulce Toque', image: 'images/chocotorta.png' },
      { id: uid(), name: 'ChocoTorta Goloso', presentation: '350ml', price: 9500, cost: 3300, brand: 'Dulce Toque', image: 'images/chocotorta.png' },
      { id: uid(), name: 'Oreo Petit', presentation: '100ml', price: 3500, cost: 1200, brand: 'Dulce Toque', image: 'images/oreo.png' },
      { id: uid(), name: 'Oreo Glotón', presentation: '250ml', price: 6000, cost: 2200, brand: 'Dulce Toque', image: 'images/oreo.png' },
      { id: uid(), name: 'Oreo Goloso', presentation: '350ml', price: 7500, cost: 2600, brand: 'Dulce Toque', image: 'images/oreo.png' }
    ],
    deliveries: []
  };

  let state = loadState();
  let route = 'inicio';
  let deliveryDraft = { clientId: '', date: localDateTimeValue(), notes: '', items: [] };

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && Array.isArray(stored.clients) && Array.isArray(stored.products) && Array.isArray(stored.deliveries)) return migrateState(stored);
    } catch (error) { console.warn('No se pudo leer el almacenamiento:', error); }
    return structuredClone(defaults);
  }

  function migrateState(data) {
    data.clients.forEach(client => { if (!Number.isFinite(Number(client.commission))) client.commission = 0; });
    data.products.forEach(product => {
      if (!Number.isFinite(Number(product.cost))) product.cost = 0;
      product.brand ||= 'Tomá Mate';
      product.image ||= guessImage(product.name);
    });
    data.deliveries.forEach(delivery => {
      delivery.items.forEach(item => {
        const product = productByIdFrom(data, item.productId);
        if (!Number.isFinite(Number(item.cost))) item.cost = Number(product?.cost) || 0;
        item.brand ||= product?.brand || 'Tomá Mate';
        item.image ||= product?.image || guessImage(item.name);
      });
      if (!Number.isFinite(Number(delivery.commission))) delivery.commission = Number(data.clients.find(client => client.id === delivery.clientId)?.commission) || 0;
    });
    return data;
  }

  function productByIdFrom(data, id) { return data.products.find(item => item.id === id); }
  function guessImage(name = '') {
    const normalized = name.toLowerCase();
    const matches = [
      ['bizcoch', 'images/bizcochitos.png'], ['pepito', 'images/pepitos.png'], ['maicena', 'images/maicena.png'],
      ['pepa', 'images/pepas.png'], ['cheesecake', 'images/cheesecake.png'], ['chocotorta', 'images/chocotorta.png'],
      ['lemon', 'images/lemonpie.png'], ['tiram', 'images/tiramisu.png'], ['brownie', 'images/brownie.png'],
      ['oreo', 'images/oreo.png'], ['frutilla', 'images/pochoclofrutilla.png'], ['limón', 'images/pochocloslimon.png'],
      ['limon', 'images/pochocloslimon.png'], ['chocolate', 'images/pochoclochoco.png'], ['vainilla', 'images/pochoclosvainilla.png'],
      ['pochoclo', 'images/pochoclosvainilla.png']
    ];
    return matches.find(([term]) => normalized.includes(term))?.[1] || 'images/ctrl-icon.png';
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function localDateTimeValue(date = new Date()) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  function clientById(id) { return state.clients.find(item => item.id === id); }
  function productById(id) { return state.products.find(item => item.id === id); }
  function deliveryTotal(delivery) { return delivery.items.reduce((sum, item) => sum + item.quantity * item.price, 0); }
  function soldTotal(delivery) { return delivery.items.reduce((sum, item) => sum + (item.sold || 0) * item.price, 0); }
  function commissionRate(delivery) { return Math.max(0, Math.min(100, Number(delivery.commission) || 0)); }
  function commissionTotal(delivery) { return soldTotal(delivery) * commissionRate(delivery) / 100; }
  function netSoldTotal(delivery) { return soldTotal(delivery) - commissionTotal(delivery); }
  function soldCostTotal(delivery) { return delivery.items.reduce((sum, item) => sum + (item.sold || 0) * (Number(item.cost) || 0), 0); }
  function paidTotal(delivery) { return (delivery.payments || []).reduce((sum, item) => sum + item.amount, 0); }
  function pendingUnits(delivery) { return delivery.items.reduce((sum, item) => sum + Math.max(0, item.quantity - (item.sold || 0) - (item.returned || 0)), 0); }
  function statusOf(delivery) {
    const pending = pendingUnits(delivery);
    const sold = delivery.items.reduce((sum, item) => sum + (item.sold || 0), 0);
    const paid = paidTotal(delivery);
    const due = netSoldTotal(delivery);
    if (pending === 0 && paid >= due) return 'Cerrado';
    if (due > 0 && paid >= due) return 'Cobrado';
    if (sold > 0 || paid > 0 || delivery.items.some(item => (item.returned || 0) > 0)) return 'Parcial';
    return 'Entregado';
  }

  function totals() {
    const delivered = state.deliveries.reduce((sum, delivery) => sum + deliveryTotal(delivery), 0);
    const sold = state.deliveries.reduce((sum, delivery) => sum + soldTotal(delivery), 0);
    const commissions = state.deliveries.reduce((sum, delivery) => sum + commissionTotal(delivery), 0);
    const netSold = sold - commissions;
    const paid = state.deliveries.reduce((sum, delivery) => sum + paidTotal(delivery), 0);
    const stockValue = state.deliveries.reduce((sum, delivery) => sum + delivery.items.reduce((subtotal, item) => subtotal + Math.max(0, item.quantity - (item.sold || 0) - (item.returned || 0)) * item.price, 0), 0);
    return { delivered, sold, commissions, netSold, paid, stockValue, due: Math.max(0, netSold - paid) };
  }

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 2500);
  }

  function navigate(nextRoute) {
    route = nextRoute;
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === route));
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    const titles = { inicio: 'Mi reparto', clientes: 'Clientes', productos: 'Productos', entrega: 'Nueva entrega', historial: 'Historial' };
    $('#page-title').textContent = titles[route] || 'Mi reparto';
    const views = { inicio: renderHome, clientes: renderClients, productos: renderProducts, entrega: renderDeliveryForm, historial: renderHistory };
    $('#app').innerHTML = (views[route] || renderHome)();
    bindViewEvents();
  }

  function renderHome() {
    const summary = totals();
    const active = state.deliveries.filter(delivery => !['Cerrado'].includes(statusOf(delivery))).slice().reverse().slice(0, 3);
    return `
      <section class="hero-card">
        <small>Saldo pendiente de cobro</small>
        <div class="hero-total">${money(summary.due)}</div>
        <div class="summary-grid">
          <div class="summary"><span>En comercios</span><strong>${money(summary.stockValue)}</strong></div>
          <div class="summary"><span>Vendido bruto</span><strong>${money(summary.sold)}</strong></div>
          <div class="summary"><span>Cobrado</span><strong>${money(summary.paid)}</strong></div>
          <div class="summary"><span>Entregas</span><strong>${state.deliveries.length}</strong></div>
        </div>
      </section>
      ${renderBrandReport()}
      <div class="section-head"><div><h2>Accesos rápidos</h2></div></div>
      <section class="quick-grid">
        <button class="quick" data-go="entrega"><span>＋</span>Nueva entrega</button>
        <button class="quick" data-action="new-client"><span>♙</span>Agregar cliente</button>
        <button class="quick" data-action="new-product"><span>▣</span>Agregar producto</button>
        <button class="quick" data-go="historial"><span>≡</span>Ver historial</button>
      </section>
      <div class="section-head"><div><h2>Entregas activas</h2><p>Las últimas que requieren seguimiento</p></div></div>
      ${active.length ? active.map(deliveryCard).join('') : emptyState('✓', 'Todavía no hay entregas', 'Cargá la primera entrega para comenzar el seguimiento.')}
    `;
  }

  function deliveryCard(delivery, selectedBrand = '') {
    const client = clientById(delivery.clientId);
    const status = statusOf(delivery);
    const sold = netSoldTotal(delivery);
    const paid = paidTotal(delivery);
    const percent = sold ? Math.min(100, Math.round((paid / sold) * 100)) : 0;
    return `<article class="card">
      <div class="card-row">
        <div><div class="card-title">${escapeHtml(client?.name || 'Cliente eliminado')}</div><div class="muted small">${dateTime(delivery.date)} · ${delivery.items.length} producto${delivery.items.length === 1 ? '' : 's'}</div></div>
        <span class="status ${status.toLowerCase()}">${status}</span>
      </div>
      <div class="progress"><span style="width:${percent}%"></span></div>
      <div class="brand-tags">${[...new Set(delivery.items.map(item => item.brand || 'Tomá Mate'))].map(brand => `<span class="brand-tag ${brand === 'Dulce Toque' ? 'dulce' : 'mate'}">${escapeHtml(brand)}</span>`).join('')}</div>
      <div class="card-row small"><span>${pendingUnits(delivery)} unidades pendientes · comisión ${commissionRate(delivery)}%</span><strong>${money(Math.max(0, sold - paid))} por cobrar</strong></div>
      <div class="button-row"><button class="button ghost small-button" data-view-delivery="${delivery.id}">Ver detalle</button><button class="button green small-button" data-whatsapp="${delivery.id}">WhatsApp</button></div>
    </article>`;
  }

  function brandReport(brand) {
    let gross = 0, commission = 0, costs = 0, collected = 0;
    state.deliveries.forEach(delivery => {
      let deliveryBrandNet = 0;
      delivery.items.forEach(item => {
        if ((item.brand || 'Tomá Mate') !== brand) return;
        const itemGross = (item.sold || 0) * item.price;
        const itemCommission = itemGross * commissionRate(delivery) / 100;
        gross += itemGross;
        commission += itemCommission;
        deliveryBrandNet += itemGross - itemCommission;
        costs += (item.sold || 0) * (Number(item.cost) || 0);
      });
      const deliveryNet = netSoldTotal(delivery);
      if (deliveryNet > 0) collected += paidTotal(delivery) * (deliveryBrandNet / deliveryNet);
    });
    const received = gross - commission;
    const profit = Math.max(0, collected - costs);
    return { gross, commission, received, collected, costs, profit, half: profit / 2 };
  }

  function renderBrandReport() {
    const brands = ['Tomá Mate 🧉', 'Dulce Toque 🧁'];
    return `<div class="section-head"><div><h2>Cuentas por marca</h2><p>Costos y ganancia de lo vendido</p></div></div><div class="brand-grid">${brands.map((brand, index) => {
      const report = brandReport(brand);
      return `<article class="brand-report ${index ? 'dulce' : 'mate'}"><div class="brand-report-head"><strong>${brand}</strong><span>${money(report.collected)} cobrado</span></div><div class="report-row"><span>Venta bruta</span><strong>${money(report.gross)}</strong></div><div class="report-row"><span>Comisiones</span><strong>− ${money(report.commission)}</strong></div><div class="report-row"><span>Neto por recibir</span><strong>${money(report.received)}</strong></div><div class="report-row"><span>Costos</span><strong>− ${money(report.costs)}</strong></div><div class="report-profit"><span>Ganancia cobrada</span><strong>${money(report.profit)}</strong></div><div class="split-row"><span>Compras 50%<strong>${money(report.half)}</strong></span><span>Ahorro 50%<strong>${money(report.half)}</strong></span></div></article>`;
    }).join('')}</div>`;
  }

  function emptyState(icon, title, text) {
    return `<div class="card empty"><div class="empty-icon">${icon}</div><strong>${title}</strong><p class="small">${text}</p></div>`;
  }

  function renderClients() {
    return `<div class="section-head"><div><h2>Mis clientes</h2><p>${state.clients.length} guardado${state.clients.length === 1 ? '' : 's'}</p></div><button class="button" data-action="new-client">＋ Agregar</button></div>
      ${state.clients.length ? state.clients.map(client => {
        const open = state.deliveries.filter(d => d.clientId === client.id && statusOf(d) !== 'Cerrado');
        return `<article class="card"><div class="card-row"><div><div class="card-title">${escapeHtml(client.name)}</div><div class="muted small">${escapeHtml(client.contact || 'Sin responsable')}</div></div><strong>${open.length} activas</strong></div><p class="small">${escapeHtml(client.phone || 'Sin WhatsApp')}${client.address ? ` · ${escapeHtml(client.address)}` : ''}</p><span class="commission-badge">Comisión ${Number(client.commission) || 0}%</span><div class="button-row"><button class="button ghost small-button" data-edit-client="${client.id}">Editar</button>${client.phone ? `<a class="button green small-button" href="https://wa.me/${cleanPhone(client.phone)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div></article>`;
      }).join('') : emptyState('♙', 'No hay clientes', 'Agregá el primer comercio para registrar una entrega.')}`;
  }

  function renderProducts() {
    return `<div class="section-head"><div><h2>Catálogo</h2><p>Precios editables</p></div><button class="button" data-action="new-product">＋ Agregar</button></div>
      ${state.products.length ? state.products.map(product => `<article class="card product-card"><img class="product-thumb" src="${escapeHtml(product.image || guessImage(product.name))}" alt=""><div class="product-info"><div class="card-row"><div><div class="card-title">${escapeHtml(product.name)}</div><div class="muted small">${escapeHtml(product.presentation)} · ${escapeHtml(product.brand || 'Sin marca')}</div></div><div class="amount">${money(product.price)}</div></div><div class="muted small">Costo: ${money(product.cost || 0)}</div><div class="button-row"><button class="button ghost small-button" data-edit-product="${product.id}">Editar</button></div></div></article>`).join('') : emptyState('▣', 'No hay productos', 'Agregá un producto para armar entregas.')}`;
  }

  function renderDeliveryForm() {
    if (!state.clients.length) return `${emptyState('♙', 'Primero agregá un cliente', 'Necesitamos el comercio y su WhatsApp para preparar el comprobante.')}<button class="button full" data-action="new-client">Agregar cliente</button>`;
    if (!state.products.length) return `${emptyState('▣', 'Primero agregá un producto', 'Después podrás elegir cantidad y precio para la entrega.')}<button class="button full" data-action="new-product">Agregar producto</button>`;
    if (!deliveryDraft.clientId) deliveryDraft.clientId = state.clients[0].id;
    return `<form id="delivery-form">
      <div class="card">
        <div class="field"><label for="delivery-client">Cliente</label><select id="delivery-client" required>${state.clients.map(client => `<option value="${client.id}" ${client.id === deliveryDraft.clientId ? 'selected' : ''}>${escapeHtml(client.name)} · comisión ${Number(client.commission) || 0}%</option>`).join('')}</select></div>
        <div class="field"><label for="delivery-date">Fecha y hora</label><input id="delivery-date" type="datetime-local" value="${deliveryDraft.date}" required></div>
      </div>
      <div class="section-head"><div><h2>Productos</h2><p>Indicá los paquetes que dejás</p></div><button class="button ghost small-button" type="button" data-action="add-line">＋ Producto</button></div>
      <div id="delivery-lines">${deliveryDraft.items.length ? deliveryDraft.items.map((item, index) => deliveryLine(item, index)).join('') : emptyState('＋', 'Agregá productos', 'Podés incluir varios productos en la misma entrega.')}</div>
      <div class="total-box"><span>Total de la entrega</span><strong id="draft-total">${money(draftTotal())}</strong></div>
      <div class="field"><label for="delivery-notes">Observaciones (opcional)</label><textarea id="delivery-notes" placeholder="Ej.: dejar exhibido cerca de la caja">${escapeHtml(deliveryDraft.notes)}</textarea></div>
      <button class="button dark full" type="submit">Guardar entrega</button>
    </form>`;
  }

  function deliveryLine(item, index) {
    return `<div class="line-item" data-line="${index}"><div class="line-product-head"><img class="line-thumb" src="${escapeHtml(item.image || guessImage(item.name))}" alt=""><div class="field"><label>Producto</label><select class="line-product">${state.products.map(product => `<option value="${product.id}" ${product.id === item.productId ? 'selected' : ''}>${escapeHtml(product.name)} · ${escapeHtml(product.presentation)}</option>`).join('')}</select></div></div><div class="line-grid"><div class="field"><label>Precio unitario</label><input class="line-price" type="number" min="0" step="10" value="${item.price}"></div><div class="field"><label>Cantidad</label><input class="line-quantity" type="number" min="1" step="1" value="${item.quantity}"></div></div><div class="line-total"><button type="button" class="button danger small-button line-remove">Quitar</button><strong>${money(item.price * item.quantity)}</strong></div></div>`;
  }

  function draftTotal() { return deliveryDraft.items.reduce((sum, item) => sum + item.quantity * item.price, 0); }

  function renderHistory() {
    return `<div class="section-head"><div><h2>Todas las entregas</h2><p>${state.deliveries.length} registrada${state.deliveries.length === 1 ? '' : 's'}</p></div></div>
      <div class="filter-row"><input id="history-search" type="search" placeholder="Buscar cliente"><select id="history-status"><option value="">Todos los estados</option><option>Entregado</option><option>Parcial</option><option>Cobrado</option><option>Cerrado</option></select><select id="history-brand"><option value="">Todas las marcas</option><option>Tomá Mate</option><option>Dulce Toque</option></select></div>
      <div id="history-list">${historyList()}</div>`;
  }

  function historyList(search = '', filter = '', brand = '') {
    const filtered = state.deliveries.slice().reverse().filter(delivery => {
      const client = clientById(delivery.clientId);
      const hasBrand = !brand || delivery.items.some(item => (item.brand || 'Tomá Mate') === brand);
      return (!search || client?.name.toLowerCase().includes(search.toLowerCase())) && (!filter || statusOf(delivery) === filter) && hasBrand;
    });
    return filtered.length ? filtered.map(delivery => deliveryCard(delivery, brand)).join('') : emptyState('≡', 'No encontramos entregas', 'Probá otro filtro o registrá una entrega nueva.');
  }

  function bindViewEvents() {
    $$('[data-go]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.go)));
    $$('[data-action="new-client"]').forEach(button => button.addEventListener('click', () => openClientModal()));
    $$('[data-action="new-product"]').forEach(button => button.addEventListener('click', () => openProductModal()));
    $$('[data-edit-client]').forEach(button => button.addEventListener('click', () => openClientModal(button.dataset.editClient)));
    $$('[data-edit-product]').forEach(button => button.addEventListener('click', () => openProductModal(button.dataset.editProduct)));
    $$('[data-view-delivery]').forEach(button => button.addEventListener('click', () => openDeliveryModal(button.dataset.viewDelivery)));
    $$('[data-whatsapp]').forEach(button => button.addEventListener('click', () => sendWhatsApp(button.dataset.whatsapp)));

    const form = $('#delivery-form');
    if (form) {
      $('#delivery-client').addEventListener('change', event => deliveryDraft.clientId = event.target.value);
      $('#delivery-date').addEventListener('change', event => deliveryDraft.date = event.target.value);
      $('#delivery-notes').addEventListener('input', event => deliveryDraft.notes = event.target.value);
      $('[data-action="add-line"]').addEventListener('click', addDraftLine);
      $$('.line-item').forEach(bindLine);
      form.addEventListener('submit', saveDelivery);
    }
    const search = $('#history-search');
    const status = $('#history-status');
    const brand = $('#history-brand');
    if (search && status && brand) {
      const refresh = () => { $('#history-list').innerHTML = historyList(search.value.trim(), status.value, brand.value); bindHistoryButtons(); };
      search.addEventListener('input', refresh);
      status.addEventListener('change', refresh);
      brand.addEventListener('change', refresh);
    }
  }

  function bindHistoryButtons() {
    $$('[data-view-delivery]').forEach(button => button.addEventListener('click', () => openDeliveryModal(button.dataset.viewDelivery)));
    $$('[data-whatsapp]').forEach(button => button.addEventListener('click', () => sendWhatsApp(button.dataset.whatsapp)));
  }

  function addDraftLine() {
    const product = state.products[0];
    deliveryDraft.items.push({ productId: product.id, name: product.name, presentation: product.presentation, price: product.price, cost: product.cost || 0, brand: product.brand || 'Tomá Mate', image: product.image || guessImage(product.name), quantity: 1 });
    render();
  }

  function bindLine(element) {
    const index = Number(element.dataset.line);
    $('.line-product', element).addEventListener('change', event => {
      const product = productById(event.target.value);
      Object.assign(deliveryDraft.items[index], { productId: product.id, name: product.name, presentation: product.presentation, price: product.price, cost: product.cost || 0, brand: product.brand || 'Tomá Mate', image: product.image || guessImage(product.name) });
      render();
    });
    $('.line-price', element).addEventListener('input', event => { deliveryDraft.items[index].price = Math.max(0, Number(event.target.value) || 0); updateDraftTotals(); });
    $('.line-quantity', element).addEventListener('input', event => { deliveryDraft.items[index].quantity = Math.max(1, Number(event.target.value) || 1); updateDraftTotals(); });
    $('.line-remove', element).addEventListener('click', () => { deliveryDraft.items.splice(index, 1); render(); });
  }

  function updateDraftTotals() {
    $$('.line-item').forEach((element, index) => $('.line-total strong', element).textContent = money(deliveryDraft.items[index].price * deliveryDraft.items[index].quantity));
    $('#draft-total').textContent = money(draftTotal());
  }

  function saveDelivery(event) {
    event.preventDefault();
    if (!deliveryDraft.items.length) return toast('Agregá al menos un producto');
    const delivery = {
      id: uid(), clientId: deliveryDraft.clientId, date: new Date(deliveryDraft.date).toISOString(), notes: deliveryDraft.notes.trim(), createdAt: new Date().toISOString(),
      commission: Number(clientById(deliveryDraft.clientId)?.commission) || 0,
      items: deliveryDraft.items.map(item => ({ ...item, sold: 0, returned: 0 })), payments: []
    };
    state.deliveries.push(delivery);
    saveState();
    deliveryDraft = { clientId: deliveryDraft.clientId, date: localDateTimeValue(), notes: '', items: [] };
    render();
    toast('Entrega guardada');
    openDeliveryModal(delivery.id, true);
  }

  function openModal(content) {
    $('#modal-content').innerHTML = `<div class="modal-inner">${content}</div>`;
    $('#modal').showModal();
    $$('.close-modal', $('#modal')).forEach(button => button.addEventListener('click', closeModal));
  }
  function closeModal() { $('#modal').close(); }

  function openClientModal(id = '') {
    const client = clientById(id) || { name: '', contact: '', phone: '', address: '', commission: 0, notes: '' };
    openModal(`<div class="modal-head"><h2>${id ? 'Editar' : 'Nuevo'} cliente</h2><button class="close-modal" aria-label="Cerrar">×</button></div><form id="client-form"><div class="field"><label>Nombre del negocio o cliente</label><input name="name" required value="${escapeHtml(client.name)}"></div><div class="field"><label>Responsable</label><input name="contact" value="${escapeHtml(client.contact)}"></div><div class="field"><label>WhatsApp</label><input name="phone" inputmode="tel" placeholder="549223..." value="${escapeHtml(client.phone)}"><div class="muted small">Con código de país, sin + ni espacios. Ej.: 5492235674153</div></div><div class="field"><label>Dirección</label><input name="address" value="${escapeHtml(client.address)}"></div><div class="field"><label>Comisión del negocio (%)</label><input name="commission" type="number" min="0" max="100" step="1" value="${Number(client.commission) || 0}"><div class="muted small">La app descontará este porcentaje de cada venta.</div></div><div class="field"><label>Notas</label><textarea name="notes">${escapeHtml(client.notes)}</textarea></div><button class="button dark full" type="submit">Guardar cliente</button>${id ? `<div class="danger-zone"><button type="button" class="button danger full" id="delete-client">Eliminar cliente</button></div>` : ''}</form>`);
    $('#client-form').addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(event.target);
      const value = { id: id || uid(), name: data.get('name').trim(), contact: data.get('contact').trim(), phone: cleanPhone(data.get('phone')), address: data.get('address').trim(), commission: Math.max(0, Math.min(100, Number(data.get('commission')) || 0)), notes: data.get('notes').trim() };
      if (id) Object.assign(clientById(id), value); else state.clients.push(value);
      saveState(); closeModal(); toast('Cliente guardado'); render();
    });
    $('#delete-client')?.addEventListener('click', () => {
      if (state.deliveries.some(delivery => delivery.clientId === id)) return toast('No se puede eliminar: tiene entregas');
      if (confirm(`¿Eliminar a ${client.name}?`)) { state.clients = state.clients.filter(item => item.id !== id); saveState(); closeModal(); render(); toast('Cliente eliminado'); }
    });
  }

  function openProductModal(id = '') {
    const product = productById(id) || { name: '', presentation: '', price: '', cost: '', brand: 'Tomá Mate', image: IMAGE_OPTIONS[0][0] };
    openModal(`<div class="modal-head"><h2>${id ? 'Editar' : 'Nuevo'} producto</h2><button class="close-modal" aria-label="Cerrar">×</button></div><form id="product-form"><div class="image-picker-preview"><img id="product-image-preview" src="${escapeHtml(product.image || guessImage(product.name))}" alt="Vista previa"></div><div class="field"><label>Producto</label><input name="name" required value="${escapeHtml(product.name)}"></div><div class="field"><label>Presentación</label><input name="presentation" required placeholder="Ej.: 10 unidades" value="${escapeHtml(product.presentation)}"></div><div class="form-grid"><div class="field"><label>Precio de venta</label><input name="price" type="number" min="0" step="10" required value="${product.price}"></div><div class="field"><label>Costo por unidad</label><input name="cost" type="number" min="0" step="10" required value="${product.cost || 0}"></div></div><div class="field"><label>Marca</label><select name="brand"><option ${product.brand === 'Tomá Mate' ? 'selected' : ''}>Tomá Mate</option><option ${product.brand === 'Dulce Toque' ? 'selected' : ''}>Dulce Toque</option></select></div><div class="field"><label>Imagen</label><select name="image" id="product-image-select">${IMAGE_OPTIONS.map(([path, label]) => `<option value="${path}" ${path === product.image ? 'selected' : ''}>${label}</option>`).join('')}</select></div><button class="button dark full" type="submit">Guardar producto</button>${id ? `<div class="danger-zone"><button type="button" class="button danger full" id="delete-product">Eliminar producto</button></div>` : ''}</form>`);
    $('#product-image-select').addEventListener('change', event => $('#product-image-preview').src = event.target.value);
    $('#product-form').addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(event.target);
      const value = { id: id || uid(), name: data.get('name').trim(), presentation: data.get('presentation').trim(), price: Math.max(0, Number(data.get('price')) || 0), cost: Math.max(0, Number(data.get('cost')) || 0), brand: data.get('brand'), image: data.get('image') };
      if (id) Object.assign(productById(id), value); else state.products.push(value);
      saveState(); closeModal(); toast('Producto guardado'); render();
    });
    $('#delete-product')?.addEventListener('click', () => {
      if (state.deliveries.some(delivery => delivery.items.some(item => item.productId === id))) return toast('No se puede eliminar: figura en entregas');
      if (confirm(`¿Eliminar ${product.name}?`)) { state.products = state.products.filter(item => item.id !== id); saveState(); closeModal(); render(); toast('Producto eliminado'); }
    });
  }

  function receiptHtml(delivery) {
    const client = clientById(delivery.clientId);
    return `<div class="receipt"><img class="receipt-logo" src="images/ctrl.png" alt="Control"><h2>Comprobante de entrega</h2><p class="small muted" style="text-align:center">Mercadería entregada en consignación</p><hr><div><strong>${escapeHtml(client?.name || 'Cliente')}</strong><br><span class="small">${dateTime(delivery.date)} · comisión ${commissionRate(delivery)}%</span></div><hr>${delivery.items.map(item => `<div class="receipt-product"><img src="${escapeHtml(item.image || guessImage(item.name))}" alt=""><div class="receipt-line"><span>${item.quantity} × ${escapeHtml(item.name)}<br><small>${escapeHtml(item.presentation)} · ${escapeHtml(item.brand || 'Tomá Mate')}</small></span><strong>${money(item.quantity * item.price)}</strong></div></div>`).join('')}<hr><div class="receipt-line"><strong>TOTAL EXHIBIDO</strong><strong>${money(deliveryTotal(delivery))}</strong></div>${delivery.notes ? `<hr><p class="small"><strong>Observaciones:</strong> ${escapeHtml(delivery.notes)}</p>` : ''}</div>`;
  }

  function openDeliveryModal(id, justCreated = false) {
    const delivery = state.deliveries.find(item => item.id === id); if (!delivery) return;
      if (justCreated) {
        openModal(`
          <div class="modal-head">
            <div>
              <h2>Entrega guardada</h2>
              <span class="status entregado">Entregado</span>
            </div>
            <button class="close-modal" aria-label="Cerrar">×</button>
          </div>
          ${receiptHtml(delivery)}
          <div class="button-row">
            <button type="button" class="button green full" id="modal-whatsapp">Enviar comprobante por WhatsApp</button>
          </div>
          <div class="button-row">
            <button type="button" class="button ghost full close-modal">Listo</button>
          </div>
        `);
        $('#modal-whatsapp').addEventListener('click', () => sendWhatsApp(id));
        setTimeout(() => toast('Entrega guardada. Ya podés enviar el comprobante.'), 150);
        return;
      }
    const status = statusOf(delivery); const due = Math.max(0, netSoldTotal(delivery) - paidTotal(delivery));
    openModal(`
      <div class="modal-head">
        <div>
          <h2>Seguimiento</h2>
          <span class="status ${status.toLowerCase()}">${status}</span>
        </div>
        <button class="close-modal" aria-label="Cerrar">×</button>
      </div>
      <div class="section-head">
        <div>
          <h2>Seguimiento</h2>
          <p>Vendido, devuelto y pendiente</p>
        </div>
      </div>
      <form id="tracking-form">${delivery.items.map((item, index) => `
        <div class="line-item tracking-item">
          <img class="line-thumb" src="${escapeHtml(item.image || guessImage(item.name))}" alt="">
          <div>
            <div class="card-title">${escapeHtml(item.name)}</div>
            <div class="muted small">Entregado: ${item.quantity} ·Vendido: ${item.sold || 0} ·Devuelto: ${item.returned || 0} ·Pendiente: ${Math.max(0, item.quantity - (item.sold || 0) - (item.returned || 0))}</div>
          </div>
          <div class="line-grid tracking-inputs">
            <div class="field">
              <label>Vendido</label>
              <input name="sold-${index}" type="number" min="0" max="${item.quantity}" value="${item.sold || 0}">
            </div>
            <div class="field">
              <label>Devuelto</label>
              <input name="returned-${index}" type="number" min="0" max="${item.quantity}" value="${item.returned || 0}">
            </div>
          </div>
        </div>`).join('')}
        <button class="button dark full" type="submit">Guardar seguimiento</button>
      </form>
      <div class="settlement-box">
        <div class="report-row">
          <span>Venta bruta</span>
          <strong>${money(soldTotal(delivery))}</strong>
        </div>
        <div class="report-row">
          <span>Comisión (${commissionRate(delivery)}%)</span>
          <strong>− ${money(commissionTotal(delivery))}</strong>
        </div>
        <div class="report-profit">
          <span>Neto del emprendimiento</span>
          <strong>${money(netSoldTotal(delivery))}</strong>
        </div>
      </div>
      <div class="section-head">
        <div>
          <h2>Pagos</h2>
          <p>Por cobrar: ${money(due)}</p>
        </div>
      </div>${(delivery.payments || []).map(payment => `
      <div class="card-row card small">
        <span>${dateTime(payment.date)}</span>
        <strong>${money(payment.amount)}</strong>
      </div>`).join('') || 
      '<p class="muted small">Todavía no registraste pagos.</p>'}
      <form id="payment-form" class="button-row">
        <div class="field" style="flex:1;margin:0">
          <input name="amount" type="number" min="100" step="10" placeholder="Importe" required>
        </div>
        <button class="button" type="submit">Registrar pago</button>
      </form>
      <div class="button-row">
        <button class="button green full" id="modal-whatsapp">Enviar comprobante por WhatsApp</button>
      </div>
      <div class="danger-zone">
        <button class="button danger full" id="delete-delivery">Eliminar entrega</button>
      </div>`);
    $('#tracking-form').addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(event.target);
      const updates = delivery.items.map((item, index) => ({ sold: Math.max(0, Number(data.get(`sold-${index}`)) || 0), returned: Math.max(0, Number(data.get(`returned-${index}`)) || 0) }));
      if (updates.some((value, index) => value.sold + value.returned > delivery.items[index].quantity)) return toast('Vendido + devuelto supera lo entregado');
      updates.forEach((value, index) => Object.assign(delivery.items[index], value)); saveState(); closeModal(); render(); toast('Seguimiento actualizado');
    });
    $('#payment-form').addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(event.target); const amount = Number(data.get('amount')) || 0;
      const pendingDue = Math.max(0, netSoldTotal(delivery) - paidTotal(delivery));
      if (pendingDue <= 0) return toast('Primero registrá unidades vendidas');
      if (amount <= 0 || amount > pendingDue) return toast(`El pago máximo es ${money(pendingDue)}`);
      delivery.payments ||= []; delivery.payments.push({ id: uid(), amount, date: new Date().toISOString() }); saveState(); closeModal(); render(); toast('Pago registrado');
    });
    $('#modal-whatsapp').addEventListener('click', () => sendWhatsApp(id));
    $('#delete-delivery').addEventListener('click', () => { if (confirm('¿Eliminar esta entrega y todos sus movimientos?')) { state.deliveries = state.deliveries.filter(item => item.id !== id); saveState(); closeModal(); render(); toast('Entrega eliminada'); } });
  }

function whatsappText(delivery) {
  const client = clientById(delivery.clientId);
  const paid = paidTotal(delivery);
  const tracked = paid > 0 || delivery.items.some(item => (item.sold || 0) > 0 || (item.returned || 0) > 0);

  if (!tracked) {
    const lines = delivery.items.map(item => {
      const presentation = item.presentation ? ` (${item.presentation})` : '';
      return `• ${item.quantity} x ${item.name}${presentation} — ${money(item.quantity * item.price)}`;
    });
    const deliveredUnits = delivery.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    return [
      `*CONTROL DE CONSIGNACIONES*`,
      `*COMPROBANTE DE ENTREGA*`,
      ``,
      `Cliente: ${client?.name || ''}`,
      `Fecha: ${dateTime(delivery.date)}`,
      `Comisión acordada: ${commissionRate(delivery)}%`,
      ``,
      ...lines,
      `*TOTAL ENTREGADO: ${deliveredUnits} Producto${deliveredUnits === 1 ? '' : 's'}*`,
      delivery.notes ? `Observaciones: ${delivery.notes}` : null,
      ``,
      `*(Este mensaje funciona como duplicado de la mercadería entregada en consignación.)*`
    ].filter(line => line !== null).join('\n');
  }

  const lines = delivery.items.flatMap(item => {
    const sold = Number(item.sold) || 0;
    const returned = Number(item.returned) || 0;
    const pending = Math.max(0, item.quantity - sold - returned);
    const details = [`    Entregado: ${item.quantity}.`];
    if (sold > 0) details.push(`    Vendido: ${sold} x (${money(item.price)})`);
    if (returned > 0) details.push(`    Devuelto: ${returned}.`);
    if (pending > 0) details.push(`    Pendiente: ${pending}.`);
    return [`• *${item.name}*`, ...details];
  });

  const gross = soldTotal(delivery);
  const commission = commissionTotal(delivery);
  const net = netSoldTotal(delivery);
  const due = Math.max(0, net - paid);

  return [
    `*CONTROL DE CONSIGNACIONES*`,
    `*SEGUIMIENTO ACTUALIZADO*`,
    ``,
    `Cliente: ${client?.name || ''}`,
    `Entrega: ${dateTime(delivery.date)}`,
    `Actualizado: ${dateTime(new Date())}`,
    `Estado: ${statusOf(delivery)}`,
    ``,
    ...lines,
    ``,
    `Venta bruta: ${money(gross)}`,
    `Comisión (${commissionRate(delivery)}%): -${money(commission)}`,
    `Neto a rendir: ${money(net)}`,
    `Pagado: ${money(paid)}`,
    `*SALDO PENDIENTE: ${money(due)}*`,
    ``,
    pendingUnits(delivery) > 0
      ? `Mercadería que continúa en el negocio: ${pendingUnits(delivery)} unidad${pendingUnits(delivery) === 1 ? '' : 'es'}.`
      : `No queda mercadería pendiente en el negocio.`,
    ``,
    `*(Este mensaje funciona como actualización del comprobante de consignación.)*`
  ].join('\n');
}

  function sendWhatsApp(id) {
    const delivery = state.deliveries.find(item => item.id === id); const client = clientById(delivery?.clientId);
    if (!delivery || !client) return toast('No encontramos la entrega');
    const phone = cleanPhone(client.phone);
    if (!phone) return toast('El cliente no tiene WhatsApp cargado');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappText(delivery))}`, '_blank', 'noopener');
  }

  function openBackupModal() {
    openModal(`<div class="modal-head"><h2>Respaldo de datos</h2><button class="close-modal" aria-label="Cerrar">×</button></div><p class="muted">Los datos se guardan en este navegador. Exportá una copia periódicamente para no perderlos.</p><div class="button-row"><button class="button dark full" id="export-backup">Exportar copia</button><button class="button ghost full" id="import-backup">Importar copia</button></div>`);
    $('#export-backup').addEventListener('click', exportBackup);
    $('#import-backup').addEventListener('click', () => $('#import-file').click());
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `consignaciones-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); toast('Copia exportada');
  }

  async function importBackup(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.clients) || !Array.isArray(data.products) || !Array.isArray(data.deliveries)) throw new Error('Formato inválido');
      if (!confirm('Esta copia reemplazará los datos actuales. ¿Continuar?')) return;
      state = { clients: data.clients, products: data.products, deliveries: data.deliveries }; saveState(); closeModal(); render(); toast('Copia restaurada');
    } catch { toast('El archivo no es una copia válida'); }
  }

  $$('.nav-item').forEach(button => button.addEventListener('click', () => navigate(button.dataset.route)));
  $('#backup-button').addEventListener('click', openBackupModal);
  $('#import-file').addEventListener('change', event => { const [file] = event.target.files; if (file) importBackup(file); event.target.value = ''; });
  $('#modal').addEventListener('cancel', event => event.preventDefault());
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./js/sw.js').catch(console.warn));
  render();
})();
