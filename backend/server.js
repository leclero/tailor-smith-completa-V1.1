const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Servir imágenes y videos
app.use('/media', express.static('img'));

const dataFile = 'datos.json';
let elementos = [];

// Cargar datos de datos.json (con manejo de errores)
if (fs.existsSync(dataFile)) {
try {
    const contenido = fs.readFileSync(dataFile, 'utf-8');
    elementos = JSON.parse(contenido.trim() || '[]');
    console.log('✅ Datos cargados desde datos.json');
} catch (error) {
    console.log('⚠️ Error leyendo datos.json. Archivo dañado o vacío. Iniciando catálogo vacío.');
    elementos = [];
}
} else {
elementos = [];
console.log('⚠️ No existe datos.json. Iniciando catálogo vacío.');
}

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, 'img/'),
filename: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video');
    const ext = isVideo ? '.mp4' : '.jpg';
    const prefix = isVideo ? 'video-' : 'producto-';
    const files = fs.readdirSync('img/').filter(f => f.startsWith(prefix));
    const num = files.length + 1;
    cb(null, `${prefix}${String(num).padStart(3, '0')}${ext}`);
}
});
const upload = multer({ storage });

// API

app.get('/api/elementos', (req, res) => {
res.json(elementos);
});

app.post('/api/upload', upload.single('archivo'), (req, res) => {
const archivo = req.file.filename;
const tipo = archivo.startsWith('video-') ? 'video' : 'imagen';

elementos.push({
    id: Date.now(),
    tipo: tipo,
    archivo: `/media/${archivo}`,
    nombre: "Nuevo elemento",
    precio: 0
});

guardarDatos();
res.json({ mensaje: 'Elemento subido correctamente.', archivo: archivo });
});

app.put('/api/elementos', (req, res) => {
elementos = req.body;
guardarDatos();
res.json({ mensaje: "Catálogo actualizado y guardado." });
});

function guardarDatos() {
fs.writeFileSync(dataFile, JSON.stringify(elementos, null, 2));
console.log('💾 Catálogo guardado en datos.json');
}

// Escuchar en toda la red (no solo localhost)
const PORT = 3000;
app.listen (PORT, () => {
console.log(`🚀 Backend escuchando en http://TU_IP_LOCAL:${PORT}`);
});