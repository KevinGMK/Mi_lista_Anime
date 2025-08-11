let animes = [];
let categoriaActual = "Todos";
let filtroPlataformas = [];
let ordenActual = "az";
let busquedaTexto = "";
let listaFiltradaGlobal = []; // guardamos la lista filtrada actual

document.addEventListener("DOMContentLoaded", () => {
  // Fetch animes.json
  fetch("animes.json")
    .then((response) => response.json())
    .then((data) => {
      animes = data.map((a, i) => {
        if (!a.fechaAñadida) a.fechaAñadida = new Date().toISOString();
        return { ...a, fechaISO: new Date(a.fechaAñadida).getTime(), id: i };
      });
      inicializarFiltros();
      filtrarLista();
    })
    .catch((error) => console.error("Error cargando el JSON:", error));

  // Eventos botones categorias
  document.getElementById("btnTodos").addEventListener("click", (e) =>
    seleccionarCategoria("Todos", e)
  );
  document.getElementById("btnViendo").addEventListener("click", (e) =>
    seleccionarCategoria("Viendo", e)
  );
  document.getElementById("btnTerminados").addEventListener("click", (e) =>
    seleccionarCategoria("Terminados", e)
  );
  document.getElementById("btnDestacado").addEventListener("click", (e) =>
    seleccionarCategoria("Destacado", e)
  );

  // Eventos toggles dropdown
  document
    .getElementById("toggleDropdownViendo")
    .addEventListener("click", () => toggleDropdown("dropdown-viendo"));
  document
    .getElementById("toggleDropdownTerminados")
    .addEventListener("click", () => toggleDropdown("dropdown-terminados"));
  document
    .getElementById("toggleDropdownDestacado")
    .addEventListener("click", () => toggleDropdown("dropdown-destacado"));

  // Evento búsqueda input
  document
    .getElementById("busqueda")
    .addEventListener("input", filtrarBusqueda);
});

// Inicializar plataformas únicas para filtros
function inicializarFiltros() {
  const plataformas = [...new Set(animes.map((a) => a.plataforma))];
  ["viendo", "terminados", "destacado"].forEach((cat) => {
    const cont = document.getElementById("filtros-plataforma-" + cat);
    cont.innerHTML = "";
    plataformas.forEach((plat) => {
      const id = `plat-${cat}-${plat.replace(/\s+/g, "-")}`;
      const checkbox = document.createElement("div");
      checkbox.classList.add("form-check");
      checkbox.innerHTML = `
        <input class="form-check-input" type="checkbox" id="${id}" value="${plat}" onchange="aplicarFiltros()" checked />
        <label class="form-check-label" for="${id}">${plat}</label>
      `;
      cont.appendChild(checkbox);
    });
  });
}

function toggleDropdown(id) {
  const menu = document.getElementById(id);
  // Cerrar otros menus
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el.id !== id) el.style.display = "none";
  });
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function seleccionarCategoria(cat, e) {
  categoriaActual = cat;
  filtroPlataformas = []; // reset plataformas al cambiar categoria
  ordenActual = "az"; // reset orden al cambiar
  busquedaTexto = document.getElementById("busqueda").value.toLowerCase();

  // Reset botones activos
  document.querySelectorAll(".menu-filtros button").forEach((btn) =>
    btn.classList.remove("active")
  );
  if (e) e.target.classList.add("active");

  // Ocultar todos dropdown
  document.querySelectorAll(".dropdown-menu").forEach(
    (el) => (el.style.display = "none")
  );

  // Reset checkboxes y radios para la categoria seleccionada
  const radios = document.querySelectorAll(
    `input[name="order-${cat.toLowerCase()}"]`
  );
  radios.forEach((r) => (r.checked = r.id.startsWith("az")));

  const checkboxes = document.querySelectorAll(
    `#filtros-plataforma-${cat.toLowerCase()} input[type="checkbox"]`
  );
  checkboxes.forEach((c) => (c.checked = true));

  filtrarLista();
}

function aplicarFiltros() {
  // Leer orden seleccionado
  const radios = document.querySelectorAll(
    `input[name="order-${categoriaActual.toLowerCase()}"]`
  );
  const radioSeleccionado = Array.from(radios).find((r) => r.checked);
  ordenActual = radioSeleccionado ? radioSeleccionado.value : "az";

  // Leer plataformas seleccionadas
  const checkboxes = document.querySelectorAll(
    `#filtros-plataforma-${categoriaActual.toLowerCase()} input[type="checkbox"]`
  );
  filtroPlataformas = Array.from(checkboxes)
    .filter((c) => c.checked)
    .map((c) => c.value);

  filtrarLista();
}

function filtrarBusqueda() {
  busquedaTexto = document.getElementById("busqueda").value.toLowerCase();
  filtrarLista();
}

function filtrarLista() {
  let listaFiltrada = [];

  // Filtrar por categoria
  if (categoriaActual === "Todos") {
    listaFiltrada = animes;
  } else if (categoriaActual === "Viendo") {
    listaFiltrada = animes.filter((a) => a.estado === "Viendo");
    listaFiltrada = listaFiltrada.filter((a) =>
      filtroPlataformas.length ? filtroPlataformas.includes(a.plataforma) : true
    );
  } else if (categoriaActual === "Terminados") {
    listaFiltrada = animes.filter((a) => a.estado === "Completado");
    listaFiltrada = listaFiltrada.filter((a) =>
      filtroPlataformas.length ? filtroPlataformas.includes(a.plataforma) : true
    );
  } else if (categoriaActual === "Destacado") {
    listaFiltrada = animes.filter((a) => a.destacado);
    listaFiltrada = listaFiltrada.filter((a) =>
      filtroPlataformas.length ? filtroPlataformas.includes(a.plataforma) : true
    );
  }

  // Filtrar por búsqueda
  if (busquedaTexto) {
    listaFiltrada = listaFiltrada.filter((a) =>
      a.titulo.toLowerCase().includes(busquedaTexto)
    );
  }

  // Ordenar
  if (ordenActual === "az") {
    listaFiltrada.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (ordenActual === "za") {
    listaFiltrada.sort((a, b) => b.titulo.localeCompare(a.titulo));
  } else if (ordenActual === "fecha-reciente") {
    listaFiltrada.sort((a, b) => b.fechaISO - a.fechaISO);
  } else if (ordenActual === "fecha-antigua") {
    listaFiltrada.sort((a, b) => a.fechaISO - b.fechaISO);
  }

  // Guardar la lista filtrada para usar en el modal
  listaFiltradaGlobal = listaFiltrada;

  // Mostrar contador
  let textoContador = "";
  switch (categoriaActual) {
    case "Todos":
      textoContador = `${listaFiltrada.length} Anime${listaFiltrada.length !== 1 ? "s" : ""} en total`;
      break;
    case "Viendo":
      textoContador = `${listaFiltrada.length} Anime${listaFiltrada.length !== 1 ? "s" : ""} por mirar`;
      break;
    case "Terminados":
      textoContador = `${listaFiltrada.length} Anime${listaFiltrada.length !== 1 ? "s" : ""} terminados`;
      break;
    case "Destacado":
      textoContador = `${listaFiltrada.length} Anime${listaFiltrada.length !== 1 ? "s" : ""} favoritos`;
      break;
  }
  document.getElementById("contador-texto").textContent = textoContador;

  mostrarAnimes(listaFiltrada);
}

function mostrarAnimes(lista) {
  let container = document.getElementById("anime-list");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron animes.</p>';
    return;
  }

  lista.forEach((anime, index) => {
    let card = `
      <div class="col-6 col-sm-4 col-md-2 mb-4 text-center anime-card" data-index="${index}" style="cursor:pointer;">
        <img src="${anime.imagen_portada || 'https://via.placeholder.com/150x225?text=No+Image'}" alt="${anime.titulo}" class="anime-img rounded shadow-sm" />
        <div class="anime-title mt-2" title="${anime.titulo}">${anime.titulo}</div>
      </div>
    `;
    container.innerHTML += card;
  });

  // Agregar evento click a las tarjetas para abrir modal
  document.querySelectorAll(".anime-card").forEach(card => {
    card.addEventListener("click", () => {
      const idx = card.getAttribute("data-index");
      abrirModal(listaFiltradaGlobal[idx]);
    });
  });
}

function abrirModal(anime) {
  // Completar campos del modal
  document.getElementById("modal-anime-img").src = anime.imagen_modal || anime.imagen_portada || "https://via.placeholder.com/300x450?text=No+Image";
  document.getElementById("modal-anime-img").alt = anime.titulo;
  document.getElementById("modal-anime-title").textContent = anime.titulo;
  document.getElementById("modal-creador").textContent = anime.creador || "Desconocido";
  document.getElementById("modal-inicio").textContent = anime.inicio || "No disponible";
  document.getElementById("modal-finalizado").textContent = anime.finalizado || "No disponible";
  document.getElementById("modal-plataforma").textContent = anime.plataforma || "No disponible";
  document.getElementById("modal-temporada").textContent = anime.temporada || "No disponible";
  document.getElementById("modal-pelicula").textContent = anime.pelicula || "No disponible";

  const urlElem = document.getElementById("modal-url");
  if (anime.url) {
    urlElem.href = anime.url;
    urlElem.textContent = anime.url;
    urlElem.style.display = "inline";
  } else {
    urlElem.href = "#";
    urlElem.textContent = "No disponible";
    urlElem.style.display = "inline";
  }

  document.getElementById("modal-cantidad-episodios").textContent = anime.cantidad_episodios ?? "No disponible";
  document.getElementById("modal-estado").textContent = anime.estado ?? "No disponible";

  // Cambiar fondo GIF dinámicamente
  const modalContent = document.querySelector("#animeModal .modal-content");
  if (anime.fondo_gif) {
    modalContent.style.setProperty('--gif-fondo', `url('${anime.fondo_gif}')`);
  } else {
    modalContent.style.setProperty('--gif-fondo', 'none');
  }

  // Mostrar modal con Bootstrap 5
  const modal = new bootstrap.Modal(document.getElementById("animeModal"));
  modal.show();
}
