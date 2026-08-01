// ==================================================
// VARIABLES GLOBALES
// ==================================================
let port;
let angulo = 0;
let objeto = []; // Historial de objetos detectados
let modoRadar = "180"; // Modos: "360", "180", "ESTATICO"
let colorRadar = { r: 0, g: 255, b: 0 }; // Color por defecto (Verde)
let estadoApp = "CONFIGURACION"; // Estados: "CONFIGURACION", "RADAR"

// Elementos de la Interfaz (Botones e Inputs)
let btnConectar, btnIrRadar, btnVolverConfig;
let btnModo360, btnModo180, btnModoEstatico;
let inputR, inputG, inputB;
let btnColorVerde, btnColorAmbar, btnColorCyan, btnColorRojo;

// ==================================================
// CONFIGURACIÓN INICIAL (SETUP)
// ==================================================
function setup() {
  let canvas = createCanvas(800, 800);
  canvas.parent('app-container');

  // --- BOTONES PRINCIPALES (Fila superior) ---
  btnConectar = createButton('🔗 Conectar Bluetooth');
  btnConectar.position(40, 205);
  estilarBoton(btnConectar, '#00ff00', '#000');
  btnConectar.mousePressed(connectSerial);

  btnIrRadar = createButton('🚀 Ir al Radar');
  btnIrRadar.position(230, 205); 
  estilarBoton(btnIrRadar, '#00ccff', '#000');
  btnIrRadar.mousePressed(() => cambiarEstado("RADAR"));

  btnVolverConfig = createButton('⚙️ Ajustes y Comandos');
  btnVolverConfig.position(30, 30);
  estilarBoton(btnVolverConfig, '#002200', '#00ff00');
  btnVolverConfig.style('border', '1px solid #00ff00');
  btnVolverConfig.mousePressed(() => cambiarEstado("CONFIGURACION"));
  btnVolverConfig.hide();

  // --- MODOS DE RADAR ---
  btnModo360 = createButton('🔄 360° (Continuo)');
  btnModo360.position(40, 310);
  estilarBoton(btnModo360, '#113311', '#00ff00');
  btnModo360.mousePressed(() => modoRadar = "360");

  btnModo180 = createButton('📐 180° (Normal)');
  btnModo180.position(200, 310);
  estilarBoton(btnModo180, '#113311', '#00ff00');
  btnModo180.mousePressed(() => modoRadar = "180");

  btnModoEstatico = createButton('🎯 Estático (Fijo 90°)'); 
  btnModoEstatico.position(360, 310);
  estilarBoton(btnModoEstatico, '#113311', '#00ff00');
  btnModoEstatico.mousePressed(() => modoRadar = "ESTATICO");

  // --- CONTROLES DE COLOR RGB ---
  inputR = createInput(colorRadar.r.toString(), 'number');
  inputR.position(40, 410); inputR.size(45);
  inputR.parent('app-container');
  
  inputG = createInput(colorRadar.g.toString(), 'number');
  inputG.position(95, 410); inputG.size(45);
  inputG.parent('app-container');

  inputB = createInput(colorRadar.b.toString(), 'number');
  inputB.position(150, 410); inputB.size(45);
  inputB.parent('app-container');

  inputR.input(() => colorRadar.r = constrain(parseInt(inputR.value()) || 0, 0, 255));
  inputG.input(() => colorRadar.g = constrain(parseInt(inputG.value()) || 0, 0, 255));
  inputB.input(() => colorRadar.b = constrain(parseInt(inputB.value()) || 0, 0, 255));

  // Presets de colores
  btnColorVerde = createButton('Verde');
  btnColorVerde.position(220, 410);
  estilarBoton(btnColorVerde, '#00ff00', '#000');
  btnColorVerde.mousePressed(() => aplicarColorPreset(0, 255, 0));

  btnColorAmbar = createButton('Ámbar');
  btnColorAmbar.position(285, 410);
  estilarBoton(btnColorAmbar, '#ffb000', '#000');
  btnColorAmbar.mousePressed(() => aplicarColorPreset(255, 176, 0));

  btnColorCyan = createButton('Cyan');
  btnColorCyan.position(355, 410);
  estilarBoton(btnColorCyan, '#00e5ff', '#000');
  btnColorCyan.mousePressed(() => aplicarColorPreset(0, 229, 255));

  btnColorRojo = createButton('Alerta');
  btnColorRojo.position(420, 410);
  estilarBoton(btnColorRojo, '#ff3333', '#fff');
  btnColorRojo.mousePressed(() => aplicarColorPreset(255, 51, 51));
}

// ==================================================
// CICLO DE DIBUJO (DRAW - 60 FPS)
// ==================================================
function draw() {
  if (estadoApp === "CONFIGURACION") {
    background(10, 15, 10);
    dibujarPantallaConfiguracion();
  } else if (estadoApp === "RADAR") {
    dibujarPantallaRadar();
  }
}

// ==================================================
// PANTALLA DE CONFIGURACIÓN
// ==================================================
function dibujarPantallaConfiguracion() {
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  noStroke();

  textSize(24);
  textStyle(BOLD);
  text("RADAR BLUETOOTH - CONFIGURACIÓN V2.0", 40, 45);

  // --- CUADRO INFORMATIVO / AVISO DESTACADO ---
  stroke(colorRadar.r, colorRadar.g, colorRadar.b, 100);
  fill(colorRadar.r * 0.1, colorRadar.g * 0.2, colorRadar.b * 0.1, 180);
  rect(40, 65, 720, 85, 8);

  noStroke();
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  textSize(15);
  textStyle(BOLD);
  text("ℹ️ AVISO DEL PROYECTO:", 55, 88);

  fill(230);
  textSize(13);
  textStyle(NORMAL);
  text("Esta página web es una herramienta de software visual para proyectos de programación con Bluetooth integrado.", 55, 110);
  text("Sirve como interfaz visual para un radar hecho con un sensor ultrasónico (no es un simulador).", 55, 130);

  // --- ESTADO DEL BLUETOOTH ---
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  textSize(15);
  textStyle(BOLD);
  text("Estado del Bluetooth: ", 40, 180);
  if (port && port.readable) {
    fill(0, 255, 0); text("● CONECTADO", 210, 180);
  } else {
    fill(255, 50, 50); text("○ DESCONECTADO", 210, 180);
  }

  // --- SECCIONES DE CONFIGURACIÓN ---
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  textStyle(BOLD);
  text("1. Selección de Modo de Radar (Actual: " + modoRadar + "):", 40, 280);
  text("2. Personalización de Color (RGB):", 40, 380);

  stroke(colorRadar.r, colorRadar.g, colorRadar.b);
  fill(colorRadar.r, colorRadar.g, colorRadar.b, 100);
  rect(520, 390, 30, 30, 4);

  // --- GUÍA DE COMANDOS ---
  noStroke();
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  textSize(17);
  text("📋 Guía de Comandos para el Microcontrolador", 40, 480);

  stroke(colorRadar.r, colorRadar.g, colorRadar.b, 100);
  fill(0, 15, 0);
  rect(40, 495, 265, 8); // Ajuste de diseño

  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  noStroke();
  textSize(14);
  textStyle(BOLD);
  text("Formato de transmisión requerido por Serial:", 60, 525);

  textStyle(NORMAL);
  fill(200);
  text("Envía ángulo y distancia separados por coma con salto de línea (\\n):", 60, 550);
  
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  text("Formato:   ANGULO,DISTANCIA\\n", 80, 580);
  text("Ejemplo:   90,35\\n", 80, 605);

  textStyle(BOLD);
  text("Comportamiento según el Modo seleccionado:", 60, 645);
  textStyle(NORMAL);
  fill(200);
  text("• Modo 360°:   Recibe ángulos continuos de 0 a 360°.", 80, 670);
  text("• Modo 180°:   Recibe barridos de 0 a 180° (Servo estándar).", 80, 695);
  text("• Modo Estático: Sensor fijo orientado a 90° (cono de visión de 45° a 135°).", 80, 720);
}

// ==================================================
// INTERFAZ GRÁFICA DEL RADAR
// ==================================================
function dibujarPantallaRadar() {
  // Efecto de rastro de pantalla
  background(colorRadar.r * 0.05, colorRadar.g * 0.05, colorRadar.b * 0.05, 20);

  let cx = width / 2;
  let cy = height / 2;
  let radioMax = 300;

  // --- 1. DIBUJAR GEOMETRÍA ---
  stroke(colorRadar.r, colorRadar.g, colorRadar.b, 150);
  strokeWeight(1.5);
  noFill();

  if (modoRadar === "360") {
    for (let r = 50; r <= radioMax; r += 50) circle(cx, cy, r * 2);
    line(cx - radioMax, cy, cx + radioMax, cy);
    line(cx, cy - radioMax, cx, cy + radioMax);
    line(cx - 212, cy - 212, cx + 212, cy + 212);
    line(cx - 212, cy + 212, cx + 212, cy - 212);

  } else if (modoRadar === "180") {
    for (let r = 50; r <= radioMax; r += 50) arc(cx, cy, r * 2, r * 2, PI, TWO_PI);
    line(cx - radioMax, cy, cx + radioMax, cy);
    line(cx, cy, cx, cy - radioMax);
    line(cx, cy, cx - 212, cy - 212);
    line(cx, cy, cx + 212, cy - 212);

  } else if (modoRadar === "ESTATICO") {
    let rad45 = radians(225);
    let rad135 = radians(315);

    for (let r = 50; r <= radioMax; r += 50) {
      arc(cx, cy, r * 2, r * 2, rad45, rad135);
    }
    // Eje principal en 90°
    line(cx, cy, cx, cy - radioMax);

    // Líneas del cono de visión (45° y 135°)
    let x45 = cx + radioMax * cos(radians(45));
    let y45 = cy - radioMax * sin(radians(45));
    line(cx, cy, x45, y45);

    let x135 = cx + radioMax * cos(radians(135));
    let y135 = cy - radioMax * sin(radians(135));
    line(cx, cy, x135, y135);
  }

  // --- 2. MARCAS Y NÚMEROS DE ESCALA ---
  fill(colorRadar.r, colorRadar.g, colorRadar.b);
  noStroke();
  textSize(11);
  textStyle(BOLD);

  for (let r = 50; r <= radioMax; r += 50) {
    let distanciaCM = r / 5;
    text(distanciaCM + " cm", cx + 8, cy - r + 15);

    if (modoRadar === "360") {
      text(distanciaCM + " cm", cx + 8, cy + r - 5);
      text(distanciaCM + " cm", cx + r - 35, cy + 15);
      text(distanciaCM + " cm", cx - r + 5, cy + 15);
    } else if (modoRadar === "180") {
      text(distanciaCM + " cm", cx + r - 35, cy - 10);
      text(distanciaCM + " cm", cx - r + 5, cy - 10);
    }
  }

  // --- 3. LÍNEA DE INDICACIÓN / BARRIDO ---
  let anguloNorm = angulo % 360;

  if (modoRadar === "ESTATICO") {
    stroke(colorRadar.r, colorRadar.g, colorRadar.b, 200);
    strokeWeight(2.5);
    line(cx, cy, cx, cy - radioMax);
  } else {
    let dibujarLinea = true;
    if (modoRadar === "180" && (anguloNorm > 180)) dibujarLinea = false;

    if (dibujarLinea) {
      let lx = cx + radioMax * cos(radians(anguloNorm));
      let ly = cy - radioMax * sin(radians(anguloNorm));
      stroke(255);
      strokeWeight(2.5);
      line(cx, cy, lx, ly);
    }
  }

  // --- 4. DIBUJAR PUNTOS DETECTADOS ---
  for (let i = 0; i < objeto.length; i++) {
    let obj = objeto[i];
    let visible = true;
    let anguloGrafica = obj.ang;

    if (modoRadar === "180" && obj.ang > 180) visible = false;
    if (modoRadar === "ESTATICO") anguloGrafica = 90;

    if (visible) {
      let distPixel = map(obj.dist, 0, 60, 0, radioMax);
      let objX = cx + distPixel * cos(radians(anguloGrafica));
      let objY = cy - distPixel * sin(radians(anguloGrafica));

      fill(255, 30, 30);
      noStroke();
      ellipse(objX, objY, 12, 12);
    }
  }
}

// ==================================================
// FUNCIONES BLUETOOTH (WEB SERIAL API)
// ==================================================
async function connectSerial() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    console.log("¡Puerto abierto con éxito!");
    
    // Iniciamos la lectura en segundo plano UNA SOLA VEZ
    readSerialData(); 
  } catch (err) {
    console.error("Error al conectar Bluetooth:", err);
  }
}

async function readSerialData() {
  while (port && port.readable) {
    const reader = port.readable.getReader();
    try {
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Convertir los datos a texto
        const text = new TextDecoder().decode(value);
        buffer += text;
        
        // Separar por saltos de línea (\n)
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Guardar el fragmento incompleto
        
        for (let line of lines) {
          line = line.trim();
          if (line) {
            let datos = line.split(',');
            if (datos.length === 2) {
              angulo = parseInt(datos[0]);
              let distancia = parseInt(datos[1]);
              
              if (!isNaN(angulo) && !isNaN(distancia)) {
                objeto.push({ ang: angulo, dist: distancia });
                if (objeto.length > 25) objeto.shift(); // Historial de 25
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error leyendo el puerto Serial:", error);
    } finally {
      reader.releaseLock();
    }
  }
}

// ==================================================
// FUNCIONES AUXILIARES (UI Y ESTILOS)
// ==================================================
function estilarBoton(btn, bg, clr) {
  btn.style('background-color', bg);
  btn.style('color', clr);
  btn.style('border', 'none');
  btn.style('padding', '10px 15px');
  btn.style('border-radius', '5px');
  btn.style('cursor', 'pointer');
  btn.style('font-weight', 'bold');
  btn.parent('app-container');
}

function aplicarColorPreset(r, g, b) {
  colorRadar = { r, g, b };
  inputR.value(r);
  inputG.value(g);
  inputB.value(b);
}

function cambiarEstado(nuevoEstado) {
  estadoApp = nuevoEstado;
  if (estadoApp === "RADAR") {
    btnConectar.hide();
    btnIrRadar.hide();
    btnModo360.hide();
    btnModo180.hide();
    btnModoEstatico.hide();
    inputR.hide();
    inputG.hide();
    inputB.hide();
    btnColorVerde.hide();
    btnColorAmbar.hide();
    btnColorCyan.hide();
    btnColorRojo.hide();
    
    btnVolverConfig.show();
    background(0); // Limpiar fondo al entrar al radar
  } else {
    btnConectar.show();
    btnIrRadar.show();
    btnModo360.show();
    btnModo180.show();
    btnModoEstatico.show();
    inputR.show();
    inputG.show();
    inputB.show();
    btnColorVerde.show();
    btnColorAmbar.show();
    btnColorCyan.show();
    btnColorRojo.show();
    
    btnVolverConfig.hide();
  }
}