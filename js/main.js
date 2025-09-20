document.addEventListener('DOMContentLoaded', () => {
    const servicesGallery = document.getElementById('services-gallery');
    const serviceModal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImages = document.getElementById('modal-images');
    const modalDesc = document.getElementById('modal-desc');
    const modalMinus = document.getElementById('modal-minus');
    const modalPlus = document.getElementById('modal-plus');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalCloseBtn = document.getElementById('modal-close');

    const cartToggle = document.getElementById('cart-toggle');
    const cartCount = document.getElementById('cart-count');
    const cartDetails = document.getElementById('cart-details');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const finalizeBtn = document.getElementById('finalize-btn');

    const appointmentFormModal = document.getElementById('appointment-form');
    const formCloseBtn = document.getElementById('form-close');
    const formSteps = document.querySelectorAll('.form-step');
    const toStep2Btn = document.getElementById('to-step-2');
    const toStep1Btn = document.getElementById('to-step-1');
    const toStep3Btn = document.getElementById('to-step-3');
    const toStep2BackBtn = document.getElementById('to-step-2-back');
    const form = document.getElementById('form-steps');
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTimeSelect = document.getElementById('appointment-time');
    const clientNameInput = document.getElementById('client-name');
    const clientWhatsappInput = document.getElementById('client-whatsapp');
    const appointmentSummary = document.getElementById('appointment-summary');
    const whatsappSend = document.getElementById('whatsapp-send');

    let services = [];
    let cart = {};
    let currentModalServiceId = null;

    // Fecha mínima de hoy para selección
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.min = today;

    // Cargar servicios dinámicamente desde JSON
    fetch('data/services.json')
        .then(res => res.json())
        .then(data => {
            services = data;
            renderServicesGallery();
        }).catch(e => console.error('Error cargando servicios:', e));

    function renderServicesGallery() {
        servicesGallery.innerHTML = '';
        services.forEach(service => {
            const card = document.createElement('article');
            card.className = 'service-card';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', 'false');
            card.innerHTML = `
                <img src="${service.images[0]}" alt="${service.name}" />
                <h3 class="service-name">${service.name}</h3>
                <p class="service-price">$${service.price.toFixed(2)}</p>
                <div class="card-controls">
                    <button class="minus-btn" aria-label="Quitar uno de ${service.name}">-</button>
                    <span class="quantity">${cart[service.id] || 0}</span>
                    <button class="plus-btn" aria-label="Agregar uno de ${service.name}">+</button>
                </div>
            `;
            servicesGallery.appendChild(card);
            card.addEventListener('click', e => {
                if (!e.target.closest('button')) openServiceModal(service.id);
            });
            card.addEventListener('keydown', e => {
                if(e.key === 'Enter') openServiceModal(service.id);
            });
            const minusBtn = card.querySelector('.minus-btn');
            const plusBtn = card.querySelector('.plus-btn');
            const qtySpan = card.querySelector('.quantity');
            minusBtn.addEventListener('click', e => {
                e.stopPropagation();
                updateCart(service.id, (cart[service.id] || 0) - 1);
                qtySpan.textContent = cart[service.id] || 0;
            });
            plusBtn.addEventListener('click', e => {
                e.stopPropagation();
                updateCart(service.id, (cart[service.id] || 0) + 1);
                qtySpan.textContent = cart[service.id] || 0;
            });
        });
        updateCartCount();
    }

    function openServiceModal(serviceId) {
        currentModalServiceId = serviceId;
        const service = services.find(s => s.id === serviceId);
        if (!service) return;
        modalTitle.textContent = service.name;
        modalDesc.textContent = service.description;
        modalImages.innerHTML = '';
        service.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = service.name;
            modalImages.appendChild(img);
        });
        modalQuantity.textContent = cart[serviceId] || 0;
        serviceModal.classList.remove('hidden');
        modalCloseBtn.focus();
    }

    modalMinus.addEventListener('click', () => {
        if (currentModalServiceId !== null) {
            updateCart(currentModalServiceId, (cart[currentModalServiceId] || 0) - 1);
            modalQuantity.textContent = cart[currentModalServiceId] || 0;
            renderServicesGallery();
        }
    });
    modalPlus.addEventListener('click', () => {
        if (currentModalServiceId !== null) {
            updateCart(currentModalServiceId, (cart[currentModalServiceId] || 0) + 1);
            modalQuantity.textContent = cart[currentModalServiceId] || 0;
            renderServicesGallery();
        }
    });
    modalCloseBtn.addEventListener('click', () => {
        currentModalServiceId = null;
        serviceModal.classList.add('hidden');
    });

    cartToggle.addEventListener('click', () => {
        if (cartDetails.classList.contains('hidden')) {
            renderCartDetails();
            cartDetails.classList.remove('hidden');
            cartCloseBtn.focus();
        } else {
            cartDetails.classList.add('hidden');
        }
    });
    cartCloseBtn.addEventListener('click', () => {
        cartDetails.classList.add('hidden');
        cartToggle.focus();
    });

    function updateCart(serviceId, qty) {
        if (qty < 0) qty = 0;
        if (qty === 0) delete cart[serviceId];
        else cart[serviceId] = qty;
        updateCartCount();
        renderCartDetails();
    }
    function updateCartCount() {
        const totalItems = Object.values(cart).reduce((a,b) => a + b,0);
        cartCount.textContent = totalItems;
        finalizeBtn.disabled = totalItems === 0;
    }

    function renderCartDetails() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (Object.keys(cart).length === 0) {
            cartItemsContainer.textContent = 'No hay servicios seleccionados.';
            cartTotal.textContent = '';
            finalizeBtn.disabled = true;
            return;
        }
        Object.entries(cart).forEach(([idStr, qty]) => {
            const id = parseInt(idStr,10);
            const service = services.find(s => s.id === id);
            if (!service) return;
            const itemTotal = service.price * qty;
            total += itemTotal;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `<span>${service.name} x${qty}</span><span>$${itemTotal.toFixed(2)}</span>`;
            cartItemsContainer.appendChild(div);
        });
        cartTotal.textContent = `Total a pagar: $${total.toFixed(2)}`;
        finalizeBtn.disabled = false;
    }

    finalizeBtn.addEventListener('click', () => {
        cartDetails.classList.add('hidden');
        openAppointmentForm();
    });

    function openAppointmentForm() {
        appointmentFormModal.classList.remove('hidden');
        showStep(1);
        form.reset();
        clientNameInput.value = '';
        clientWhatsappInput.value = '';
        appointmentTimeSelect.innerHTML = '<option value="">--Seleccione--</option>';
        appointmentSummary.innerHTML = '';
        toStep2Btn.disabled = true;
        toStep3Btn.disabled = true;
        whatsappSend.style.display = 'none';
    }
    formCloseBtn.addEventListener('click', () => {
        appointmentFormModal.classList.add('hidden');
        cartToggle.focus();
    });

    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const isActive = header.classList.contains('active');
            document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
            document.querySelectorAll('.accordion-panel').forEach(p => p.style.maxHeight = null);
            if (!isActive) {
                header.classList.add('active');
                const panel = header.nextElementSibling;
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });

    appointmentDateInput.addEventListener('change', () => {
        const selectedDate = appointmentDateInput.value;
        if (!selectedDate) {
            appointmentTimeSelect.innerHTML = '<option value="">--Seleccione--</option>';
            toStep2Btn.disabled = true;
            return;
        }
        const times = [];
        for(let h=9; h<=18; h++){
            times.push(`${h.toString().padStart(2,'0')}:00`);
        }
        appointmentTimeSelect.innerHTML = '<option value="">--Seleccione--</option>';
        times.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            appointmentTimeSelect.appendChild(option);
        });
        toStep2Btn.disabled = true;
    });
    appointmentTimeSelect.addEventListener('change', () => {
        toStep2Btn.disabled = !(appointmentDateInput.value && appointmentTimeSelect.value);
    });

    toStep2Btn.addEventListener('click', () => {
        showStep(2);
        clientNameInput.focus();
    });
    toStep1Btn.addEventListener('click', () => showStep(1));

    clientNameInput.addEventListener('input', validateStep2);
    clientWhatsappInput.addEventListener('input', validateStep2);

    function validateStep2() {
        const nameValid = clientNameInput.value.trim().length > 2;
        const whatsappValid = /^\+?\d{7,15}$/.test(clientWhatsappInput.value.trim());
        toStep3Btn.disabled = !(nameValid && whatsappValid);
    }
    toStep3Btn.addEventListener('click', () => {
        showStep(3);
        renderAppointmentSummary();
    });
    toStep2BackBtn.addEventListener('click', () => showStep(2));

    function showStep(step) {
        formSteps.forEach((el, idx) => el.classList.toggle('hidden', idx !== step-1));
    }

    function renderAppointmentSummary() {
        let total = 0;
        let summary = '<ul>';
        for(const idStr in cart){
            const id = parseInt(idStr, 10);
            const service = services.find(s => s.id === id);
            const qty = cart[id];
            if (!service) continue;
            const subtotal = service.price * qty;
            total += subtotal;
            summary += `<li>${service.name} x${qty} - $${subtotal.toFixed(2)}</li>`;
        }

        const whatsappWarning = document.getElementById('whatsapp-warning');

clientWhatsappInput.addEventListener('input', () => {
    const val = clientWhatsappInput.value.trim();
    const onlyDigits = /^\d{10}$/.test(val);

    if (!onlyDigits) {
        whatsappWarning.style.display = 'block';
        toStep3Btn.disabled = true;
    } else {
        whatsappWarning.style.display = 'none';
        validateStep2(); // Si el nombre también es válido se habilita el botón
    }
});

// Modifica validateStep2 para usar soloDigits en el check final:
function validateStep2() {
    const nameValid = clientNameInput.value.trim().length > 2;
    const whatsappVal = clientWhatsappInput.value.trim();
    const onlyDigits = /^\d{10}$/.test(whatsappVal);

    toStep3Btn.disabled = !(nameValid && onlyDigits);
}
        summary += '</ul>';
        appointmentSummary.innerHTML = `
            <p><strong>Servicios:</strong></p>
            ${summary}
            <p><strong>Fecha:</strong> ${appointmentDateInput.value}</p>
            <p><strong>Hora:</strong> ${appointmentTimeSelect.value}</p>
            <p><strong>Total a pagar:</strong> $${total.toFixed(2)}</p>
            <p><strong>Método de pago:</strong> Efectivo al finalizar el servicio.</p>
        `;

        let serviciosTexto = '';
        for (const idStr in cart) {
            const id = parseInt(idStr, 10);
            const servicio = services.find(s => s.id === id);
            const qty = cart[id];
            serviciosTexto += `${servicio.name} x${qty}\n`;
        }
        const mensaje = `Hola, quiero agendar una cita:\n` +
                        `💅 *Servicios:*\n${serviciosTexto}` +
                        `📅 *Fecha:* ${appointmentDateInput.value}\n` +
                        `⏰ *Hora:* ${appointmentTimeSelect.value}\n` +
                        `👤 *Nombre:* ${clientNameInput.value}\n` +
                        `📱 *WhatsApp:* ${clientWhatsappInput.value}\n` +
                        `💸 *Método de pago:* Efectivo al finalizar el servicio.`;
        const mensajeUrl = encodeURIComponent(mensaje);
        const numero = '5214776772422';
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numero}&text=${mensajeUrl}`;

        whatsappSend.href = urlWhatsApp;
        whatsappSend.style.display = 'inline-block';
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        // Intentar abrir WhatsApp en nueva pestaña
        const ventana = window.open(whatsappSend.href, '_blank');

        if (!ventana || ventana.closed || typeof ventana.closed == 'undefined') {
            // Popup bloqueado, mostrar enlace visible
            alert('No se pudo abrir WhatsApp automáticamente. Por favor use el enlace para confirmar la cita.');
            whatsappSend.style.display = 'inline-block';
        } else {
            // Popup abierto correctamente
            whatsappSend.style.display = 'none';
        }

        alert(`Gracias ${clientNameInput.value}, su cita ha sido agendada para el ${appointmentDateInput.value} a las ${appointmentTimeSelect.value}.`);

        appointmentFormModal.classList.add('hidden');
        cart = {};
        updateCartCount();
        renderServicesGallery();
        cartToggle.focus();
    });
});
