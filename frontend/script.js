const backendURL = 'https://washing-worlds-unlimited-residence.trycloudflare.com';  // Cambia esto por la IP real de tu backend

let elementos = [];
let carrito = [];

// Cargar elementos
function cargarElementos() {
    axios.get(`${backendURL}/api/elementos`).then(res => {
        elementos = res.data;
        renderizarProductos();
        renderizarVideos();
    });
}

// Renderizar productos en el carrusel
function renderizarProductos() {
    const contenedor = document.getElementById('carousel-inner');
    contenedor.innerHTML = "";

    const productos = elementos.filter(e => e.tipo === "imagen");

    productos.forEach((prod, index) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (index === 0 ? ' active' : '');
        div.innerHTML = `
            <img src="${backendURL}${prod.archivo}" class="d-block mx-auto" style="max-height: 400px;">
            <div class="carousel-caption">
                <h5>${prod.nombre}</h5>
                <p>$${prod.precio}</p>
                <button class="btn btn-primary" onclick="agregarAlCarrito(${prod.id})">Agregar</button>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

// Renderizar videos
function renderizarVideos() {
    const contenedor = document.getElementById('galeria-videos');
    contenedor.innerHTML = "";

    const videos = elementos.filter(e => e.tipo === "video");

    videos.forEach(video => {
        const div = document.createElement('div');
        div.className = "col-md-4 mb-4";
        div.innerHTML = `
            <video controls width="100%" height="240">
                <source src="${backendURL}${video.archivo}" type="video/mp4">
            </video>
        `;
        contenedor.appendChild(div);
    });
}

// Agregar al carrito
function agregarAlCarrito(id) {
    const producto = elementos.find(p => p.id === id);
    if (!producto) return;

    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    renderizarCarrito();
}

// Cambiar cantidad desde input
function cambiarCantidad(id, nuevaCantidad) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    nuevaCantidad = parseInt(nuevaCantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        quitarDelCarrito(id);
    } else {
        item.cantidad = nuevaCantidad;
    }
    renderizarCarrito();
}

// Sumar 1 unidad
function sumarCantidad(id) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad++;
        renderizarCarrito();
    }
}

// Restar 1 unidad
function restarCantidad(id) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad--;
        if (item.cantidad <= 0) {
            quitarDelCarrito(id);
        } else {
            renderizarCarrito();
        }
    }
}

// Quitar producto
function quitarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    renderizarCarrito();
}

// Renderizar carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach(prod => {
        total += prod.precio * prod.cantidad;
        contenedor.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${prod.nombre}</span>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-secondary me-1" onclick="restarCantidad(${prod.id})">-</button>
                    <input type="number" value="${prod.cantidad}" min="1" style="width:50px;" onchange="cambiarCantidad(${prod.id}, this.value)">
                    <button class="btn btn-sm btn-secondary ms-1" onclick="sumarCantidad(${prod.id})">+</button>
                    <button class="btn btn-sm btn-danger ms-2" onclick="quitarDelCarrito(${prod.id})">❌</button>
                </div>
            </div>
        `;
    });

    document.getElementById('carrito-total').textContent = `Total: $${total.toFixed(2)}`;
}

// Enviar pedido por WhatsApp
document.getElementById('btn-finalizar').addEventListener('click', () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let mensaje = "Hola, quiero hacer un pedido:\n";
    carrito.forEach(prod => {
        mensaje += `- ${prod.nombre} x${prod.cantidad} = $${(prod.precio * prod.cantidad).toFixed(2)}\n`;
    });

    mensaje += `Total: $${carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0).toFixed(2)}`;

    const url = `https://wa.me/5491168915378?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
});

cargarElementos();