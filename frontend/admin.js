const backendURL = 'https://washing-worlds-unlimited-residence.trycloudflare.com'; // Cambia si es necesario
// Login
let elementos = [];

// Mostrar panel si ya está logueado
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("adminLogueado") === "true") {
        mostrarPanelAdmin();
    }
});

function login() {
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    if (usuario === "admin" && clave === "smith2025") {
        localStorage.setItem("adminLogueado", "true");
        mostrarPanelAdmin();
    } else {
        document.getElementById('mensaje-login').textContent = "Usuario o contraseña incorrectos.";
    }
}

function mostrarPanelAdmin() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    cargarElementos();
}

function subirArchivo(e) {
    if (e) e.preventDefault();

    const archivo = document.getElementById('input-archivo').files[0];
    if (!archivo) {
        alert("Selecciona un archivo.");
        return;
    }

    enviarArchivo(archivo);
}

function manejarDrop(event) {
    event.preventDefault();
    const archivos = event.dataTransfer.files;
    for (let i = 0; i < archivos.length; i++) {
        enviarArchivo(archivos[i]);
    }
}

function enviarArchivo(archivo) {
    const formData = new FormData();
    formData.append('archivo', archivo);

    axios.post(`${backendURL}/api/upload`, formData).then(res => {
        document.getElementById('mensaje').textContent = "Archivo subido correctamente.";

        const archivoNombre = res.data.archivo;
        const tipo = archivoNombre.startsWith('/media/video-') ? 'video' : 'imagen';

        elementos.push({
            id: Date.now(),
            tipo: tipo,
            archivo: archivoNombre,
            nombre: "Nuevo elemento",
            precio: 0
        });

        renderizarElementos();
    }).catch(err => {
        console.error("Error al subir archivo:", err);
    });
}

function cargarElementos() {
    axios.get(`${backendURL}/api/elementos`).then(res => {
        elementos = res.data;
        renderizarElementos();
    });
}

function renderizarElementos() {
    const contenedor = document.getElementById('lista-elementos');
    contenedor.innerHTML = "";

    elementos.forEach((elem, index) => {
        const media = elem.tipo === 'video'
            ? `<video src="${backendURL}${elem.archivo}" width="100" controls></video>`
            : `<img src="${backendURL}${elem.archivo}" width="100">`;

        const div = document.createElement('div');
        div.className = 'elemento-admin';

        div.innerHTML = `
            ${media}
            <div style="display: flex; flex-direction: column; margin-bottom: 10px;">
                <label><strong>Nombre o Descripción:</strong></label>
                <input type="text" value="${elem.nombre}"
                    onfocus="if(this.value==='Nuevo elemento'){this.value=''}"
                    onblur="if(this.value.trim()===''){this.value='Nuevo elemento'}"
                    onchange="elementos[${index}].nombre = this.value">
            </div>
            <div style="display: flex; flex-direction: column; margin-bottom: 10px;">
                <label><strong>Precio o Valor:</strong></label>
                <input type="number" value="${elem.precio}"
                onchange="elementos[${index}].precio = parseFloat(this.value)">
            </div>
            <button type="button" onclick="elementos.splice(${index},1); renderizarElementos()">❌ Eliminar</button>
        `;

        contenedor.appendChild(div);
    });
}

function guardarCambios() {
    axios.put(`${backendURL}/api/elementos`, elementos).then(() => {
        document.getElementById('mensaje').textContent = "Catálogo guardado correctamente.";
    });
}

function salirAdmin() {
    localStorage.removeItem("adminLogueado");
    window.location.href = 'index.html';
}