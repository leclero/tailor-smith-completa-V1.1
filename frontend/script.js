// const backendURL = window.backendURL; // viene de config.js

let elementos = [];
let carrito = [];

// ==================== Cargar elementos ====================
function cargarElementos() {
    axios.get(`${backendURL}/api/elementos`).then(res => {
        elementos = res.data;
        renderizarProductos();
        renderizarVideos();
    });
}

// ==================== Renderizar productos ====================
function renderizarProductos() {
    const contenedor = document.getElementById('carousel-inner');
    contenedor.innerHTML = "";

    const productos = elementos.filter(e => e.tipo === "imagen");

    productos.forEach((prod, index) => {
        const div = document.createElement('div');
        div.className = 'carousel-item' + (index === 0 ? ' active' : '');
        div.innerHTML = `
        <img src="${backendURL}${prod.archivo}" class="d-block mx-auto" style="max-height: 400px;">
        <div class="carousel-caption bg-dark bg-opacity-50 rounded p-2">
            <h5>${prod.nombre}</h5>
            <p>$${prod.precio}</p>
            <button class="btn btn-primary" onclick="agregarAlCarrito(${prod.id})">Agregar</button>
        </div>
        `;
        contenedor.appendChild(div);
    });
}

// ==================== Renderizar videos ====================
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

// ==================== Carrito ====================
function agregarAlCarrito(id) {
    const producto = elementos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    renderizarCarrito();
}

function quitarDelCarrito(id) {
    const producto = carrito.find(p => p.id === id);
    if (producto) {
        producto.cantidad--;
        if (producto.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }
    }
    renderizarCarrito();
}

function renderizarCarrito() {
    const contenedor = document.getElementById("carrito-contenido");
    contenedor.innerHTML = "";

    carrito.forEach(prod => {
        const div = document.createElement("div");
        div.className = "carrito-item";
        div.innerHTML = `
            <span>${prod.nombre} - $${prod.precio} x ${prod.cantidad}</span>
            <button class="btn btn-sm btn-danger" onclick="quitarDelCarrito(${prod.id})">-</button>
            <button class="btn btn-sm btn-success" onclick="agregarAlCarrito(${prod.id})">+</button>
        `;
        contenedor.appendChild(div);
    });

    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    document.getElementById("carrito-total").textContent = `Total: $${total}`;
}

// ==================== Enviar pedido por WhatsApp ====================
document.getElementById("btn-finalizar").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "🛒 Pedido Tailor Smith:\n\n";
    carrito.forEach(prod => {
        mensaje += `${prod.nombre} - $${prod.precio} x ${prod.cantidad} = $${prod.precio * prod.cantidad}\n`;
    });
    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    mensaje += `\n💵 Total: $${total}`;

    const telefono = "5491168915378";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
});

// Inicial
cargarElementos();
