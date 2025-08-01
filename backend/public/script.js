// Obtener token almacenado
let token = localStorage.getItem('token');

// Función para cargar productos
function loadProducts() {
  fetch('http://localhost:3000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById('productList');
      list.innerHTML = ''; // Limpiar lista
      data.forEach(product => {
        list.innerHTML += `<a href="#" class="list-group-item list-group-item-action">${product.name} - Stock: ${product.stock}</a>`;
      });
    })
    .catch(error => console.error('Error al cargar productos:', error));
}

// Función para agregar producto
function addProduct() {
  if (!token) {
    alert('Debes iniciar sesión primero');
    window.location.href = '/login.html';
    return;
  }
  showForm(null); // Mostrar formulario vacío para nuevo producto
}

// Función para editar producto
function editProduct(productId) {
  if (!token) {
    alert('Debes iniciar sesión primero');
    window.location.href = '/login.html';
    return;
  }
  fetch(`http://localhost:3000/api/products/${productId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => {
      console.log('Respuesta al obtener producto:', response.status, response.statusText);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(product => showForm(product))
    .catch(error => console.error('Error al cargar producto:', error.message));
}

// Función para guardar producto
function saveProduct(method, productId = null) {
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const stock = parseInt(document.getElementById('productStock').value);
  const price = parseFloat(document.getElementById('productPrice').value);
  const url = productId ? `http://localhost:3000/api/products/${productId}` : 'http://localhost:3000/api/products';
  console.log('Enviando solicitud:', { url, method, body: { name, category, stock, price } });

  if (isNaN(stock) || isNaN(price)) {
    console.error('Stock o precio no son números válidos:', { stock, price });
    return;
  }

  fetch(url, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, category, stock, price })
  })
    .then(response => {
      console.log('Respuesta del servidor:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Datos recibidos:', data);
      hideForm();
      loadProductsEnhanced();
    })
    .catch(error => {
      console.error('Error al guardar producto:', error.message);
    });
}

// Función para eliminar producto
function deleteProduct(productId) {
  if (confirm('¿Seguro que quieres eliminar este producto?')) {
    fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(() => loadProductsEnhanced())
      .catch(error => console.error('Error al eliminar producto:', error.message));
  }
}

// Función para mostrar formulario
function showForm(product = null) {
  const form = document.getElementById('productForm');
  const title = document.getElementById('formTitle');
  if (product) {
    title.textContent = 'Editar Producto';
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productStock').value = product.stock || '';
    document.getElementById('productPrice').value = product.price || '';
    form.setAttribute('data-product-id', product.id); // Almacenar el ID en el formulario
  } else {
    title.textContent = 'Agregar Producto';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productPrice').value = '';
    form.removeAttribute('data-product-id'); // Quitar el ID si es nuevo
  }
  form.style.display = 'block';
}

function hideForm() {
  document.getElementById('productForm').style.display = 'none';
}

// Función para cargar productos mejorada
function loadProductsEnhanced() {
  fetch('http://localhost:3000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => {
      console.log('Respuesta de productos:', response.status, response.statusText);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Datos de productos:', data);
      if (Array.isArray(data)) {
        const table = document.getElementById('productList');
        table.innerHTML = `
          <table class="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(product => `
                <tr>
                  <td>${product.id}</td>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.stock}</td>
                  <td>$${product.price.toFixed(2)}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${product.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        addEventListeners();
      } else if (data && data.error) {
        console.error('Error del servidor:', data.error);
      }
    })
    .catch(error => console.error('Error al cargar productos:', error.message));
}

// Función para cargar historial
function loadHistory() {
  fetch('http://localhost:3000/api/history', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(response => {
      console.log('Respuesta de historial:', response.status, response.statusText);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Datos de historial recibidos:', data);
      if (Array.isArray(data)) {
        const list = document.getElementById('historyList');
        list.innerHTML = `
          <table class="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.name || 'Producto eliminado'}</td>
                  <td>${item.type}</td>
                  <td>${item.quantity}</td>
                  <td>${item.created_at ? new Date(item.created_at).toLocaleString('en-US', { timeZone: 'America/Bogota' }) : 'Sin fecha'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else if (data && data.error) {
        console.error('Error del servidor:', data.error);
      }
    })
    .catch(error => console.error('Error al cargar historial:', error.message));
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

// Función para manejar login
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('Intentando login con:', { email, password });

  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(response => {
      console.log('Respuesta de login:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('Datos de login:', data);
      if (data.token) {
        localStorage.setItem('token', data.token); // Guardar token
        console.log('Token guardado:', data.token);
        window.location.href = '/index.html'; // Redirigir al dashboard
      } else {
        console.error('No se recibió token:', data);
      }
    })
    .catch(error => console.error('Error al iniciar sesión:', error));
}

// Función para manejar registro
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message); // Notificar éxito
      showLoginForm(); // Volver al formulario de login
    })
    .catch(error => console.error('Error al registrar:', error));
}

// Funciones para alternar entre formularios
function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

// Función para agregar event listeners
function addEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = btn.getAttribute('data-id');
      editProduct(productId); // Llamar a editProduct con el ID
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
  });
}

// Event listeners actualizados
document.addEventListener('DOMContentLoaded', () => {
  const addProductBtn = document.getElementById('addProductBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const registerLink = document.getElementById('registerLink');
  const backToLogin = document.getElementById('backToLogin');
  const productForm = document.getElementById('productFormData');
  const cancelBtn = document.getElementById('cancelBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');

  if (document.getElementById('productList') && !token) {
    window.location.href = '/login.html'; // Redirigir a login si no hay token
  }

  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      addProduct(); // Llamar a addProduct
    });
    if (token) loadProductsEnhanced(); // Usar la versión mejorada
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }

  if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const productId = document.getElementById('productForm').getAttribute('data-product-id');
      const method = productId ? 'PUT' : 'POST'; // Método fijo según si hay ID
      saveProduct(method, productId ? parseInt(productId) : null);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideForm);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', loadHistory);
  }

  if (token) {
    loadHistory(); // Cargar historial al inicio si hay token
  }
});