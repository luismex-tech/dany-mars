const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const app = express();
const stripe = Stripe('TU_SECRETO_STRIPE'); // Pon tu clave secreta aquí

app.use(cors());
app.use(bodyParser.json());

// Productos iniciales (peinados)
let peinados = [
  { id: 1, nombre: 'Trenza Moderna', precio: 30000 }, // precios en centavos para Stripe (300.00 mxn)
  { id: 2, nombre: 'Ondas Glam', precio: 35000 },
  { id: 3, nombre: 'Chongo Bajo', precio: 25000 },
];

// Endpoint para obtener productos
app.get('/api/peinados', (req,res) => {
  res.json(peinados);
});

// Endpoint para editar productos (admin)
app.post('/api/peinados', (req,res) => {
  const {id, nombre, precio} = req.body;
  if (!nombre || !precio) return res.status(400).send('Faltan datos');
  if(id) {
    // Actualizar
    const index = peinados.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).send('No encontrado');
    peinados[index] = {id, nombre, precio};
    res.json(peinados[index]);
  } else {
    // Crear
    const newId = peinados.length ? peinados[peinados.length-1].id + 1 : 1;
    const nuevo = {id: newId, nombre, precio};
    peinados.push(nuevo);
    res.json(nuevo);
  }
});

// Endpoint para crear sesión de pago Stripe
app.post('/api/create-checkout-session', async (req,res) => {
  const {items} = req.body; // [{id, cantidad}]
  if(!items || !items.length) return res.status(400).send('Carrito vacío');
  // Mapear items a line_items de Stripe
  const line_items = items.map(item => {
    const producto = peinados.find(p => p.id === item.id);
    return {
      price_data: {
        currency: 'mxn',
        product_data: {
          name: producto.nombre,
        },
        unit_amount: producto.precio,
      },
      quantity: item.cantidad,
    }
  });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://tu-dominio.com/pago-exitoso',
      cancel_url: 'https://tu-dominio.com/cancelado',
    });
    res.json({id: session.id});
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(4000, () => {
  console.log('Backend corriendo en http://localhost:4000');
});
