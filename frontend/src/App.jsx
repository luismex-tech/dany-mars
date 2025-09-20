import { useEffect, useState } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('TU_PUBLICO_STRIPE');

function Catalogo({setCart}) {
  const [peinados, setPeinados] = useState([]);
  useEffect(() => {
    fetch('http://localhost:4000/api/peinados')
      .then(res => res.json())
      .then(setPeinados);
  }, []);

  const addToCart = (item) => {
    setCart((c) => {
      const existe = c.find(p => p.id === item.id);
      if(existe){
        return c.map(p => p.id === item.id ? {...p, cantidad: p.cantidad + 1} : p);
      }else{
        return [...c, {...item, cantidad:1}];
      }
    });
  };

  return (
    <div style={{display:'flex', gap:'1rem'}}>
      {peinados.map(p => (
        <div key={p.id} style={{border:'1px solid gray', padding:10}}>
          <h3>{p.nombre}</h3>
          <p>${p.precio/100} MXN</p>
          <button onClick={() => addToCart(p)}>Añadir</button>
        </div>
      ))}
    </div>
  );
}

function CheckoutForm({cart}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Crear sesion pago
    const res = await fetch('http://localhost:4000/api/create-checkout-session',{
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({items: cart.map(({id,cantidad})=>({id,cantidad}))})
    });
    const {id} = await res.json();
    // Redirigir a Stripe
    const result = await stripe.redirectToCheckout({ sessionId: id });
    if(result.error) alert(result.error.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  )
}

export default function App() {
  const [cart, setCart] = useState([]);
  return (
    <Elements stripe={stripePromise}>
      <h1>Dany Mars</h1>
      <Catalogo setCart={setCart}/>
      <hr/>
      <h2>Carrito</h2>
      <ul>
        {cart.map(item => <li key={item.id}>{item.nombre} x {item.cantidad}</li>)}
      </ul>
      {cart.length > 0 && <CheckoutForm cart={cart}/>}
    </Elements>
  )
}
