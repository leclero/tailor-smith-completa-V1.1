let elementos = [];
let carrito = [];

// Cargar elementos desde backend
function cargarElementos() {
    axios.get(`${backendURL}/api/elementos`).then(res => {
        elementos = res.data;
        renderizarProductos();
        renderizarVideos();
    });
}

// Renderizar productos
function renderizarProductos() {
    const contenedor = document.getElementById("carousel-inner");
    contenedor.innerHTML = "";

    const productos = elementos.filter(e => e.tipo === "imagen");

    productos.forEach((prod, index) => {
        const div = document.createElement("div");
        div.className = "carousel-item" + (index === 0 ? " active" : "");
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
    const contenedor = document.getElementById("galeria-videos");
    contenedor.innerHTML = "";

    const videos = elementos.filter(e => e.tipo === "video");

    videos.forEach(video => {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-4";
        div.innerHTML = `
            <video controls width="100%" height="240">
                <source src="${backendURL}${video.archivo}" type="video/mp4">
            </video>
        `;
        contenedor.appendChild(div);
    });
}

// Carrito
function agregarAlCarrito(id) {
    const producto = elementos.find(p => p.id === id);
    const item = carrito.find(p => p.id === id);

    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    renderizarCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }
    }
    renderizarCarrito();
}

function renderizarCarrito() {
    const contenedor = document.getElementById("carrito-contenido");
    const totalElem = document.getElementById("carrito-total");
    contenedor.innerHTML = "";

    let total = 0;
    carrito.forEach(prod => {
        total += prod.precio * prod.cantidad;
        const div = document.createElement("div");
        div.className = "carrito-item";
        div.innerHTML = `
            ${prod.nombre} - $${prod.precio} x ${prod.cantidad}
            <button onclick="cambiarCantidad(${prod.id}, -1)">➖</button>
            <button onclick="cambiarCantidad(${prod.id}, 1)">➕</button>
        `;
        contenedor.appendChild(div);
    });

    totalElem.textContent = `Total: $${total.toFixed(2)}`;
}

cargarElementos();
