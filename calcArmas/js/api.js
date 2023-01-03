
let selectedProductId = null

function closeProductModal() {
  const modalElement = document.getElementById("addProduto");
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();

  const productName = document.getElementById("productName").value = " "
  const price = document.getElementById("price").value = " "
  const photo = document.getElementById("photo").value = " "
  const quantidade = document.getElementById("quantidade").value = " "

  document.getElementById('submitBtn').innerHTML = 'Adicionar'

  selectedProductId = null
}
  function submitForm() {
    if(!selectedProductId) saveProduct() 
    else updateProduct()
  }

function writeProductRow(product) {
  const productUpdate = encodeURIComponent(JSON.stringify(product))
  return `
  <tr id="row-${product.id}">
          <td>${product.id}</td>
          <td>${product.productName}</td>
          <td>${product.price}</td>
          <td>${product.photo}</td>
          <td>${product.quantidade}</td>
          <td class="w-10">
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#addProduto" onclick="fillFormForUpdate('${productUpdate}')">Atualizar</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Deletar</button>
          </td>
        </tr>
  `;
} 

function fillFormForUpdate(productPayload) {
  document.getElementById('submitBtn').innerHTML = 'Atualizar'
  const product = JSON.parse(decodeURIComponent(productPayload))

  document.getElementById("productName").value = product.productName
  document.getElementById("price").value = product.price
  document.getElementById("photo").value = product.photo
  document.getElementById("quantidade").value = product.quantidade

selectedProductId = product.id
}


async function saveProduct() {
  
  const productName = document.getElementById("productName").value;
  const price = document.getElementById("price").value;
  const photo = document.getElementById("photo").value;
  const quantidade = document.getElementById("quantidade").value;

  const {data} = await axios.post('http://149.56.77.89:3001/api/weapons', { productName, price, photo,quantidade })

const product = { id: data.id, productName, price, photo, quantidade }

const appendData = writeProductRow(product)

const tableBody = document.getElementById("table-body")
tableBody.innerHTML += appendData;

closeProductModal()
}


async function updateProduct() {
  const productName = document.getElementById("productName").value;
  const price = document.getElementById("price").value;
  const photo = document.getElementById("photo").value;
  const quantidade = document.getElementById("quantidade").value;

  await axios({
    method: 'PUT',
    url: 'http://149.56.77.89:3001/api/weapons/' + selectedProductId,
    data: { productName, price, photo, quantidade }
  })

  const productNameField = document.querySelector('#row-' + selectedProductId + " td:nth-child(2)")
  const priceField = document.querySelector('#row-' + selectedProductId + " td:nth-child(3)")
  const photoField = document.querySelector('#row-' + selectedProductId + " td:nth-child(4)")
  const quantidadeField = document.querySelector('#row-' + selectedProductId + " td:nth-child(5)")
  const updateButtonField =  document.querySelector('#row-' + selectedProductId + " td:nth-child(6) button:nth-child(1)")

  const productUpdate = encodeURIComponent(JSON.stringify({ id: selectedProductId, productName, price, photo, quantidade }))

  updateButtonField.setAttribute('onclick', 'fillFormForUpdate("' + productUpdate + '")')

  productNameField.innerHTML = productName
  priceField.innerHTML = price
  photoField.innerHTML = photo
  quantidadeField.innerHTML = quantidade

  closeProductModal()

}


function deleteProduct(productId) {
  const productElement = document.getElementById('row-' + productId)
  productElement.remove()
}


async function loadProducts() {
  let tableBodyContent = ""

  const { data: products } = await axios.get('http://149.56.77.89:3001/api/weapons')


  products.forEach(product => (tableBodyContent += writeProductRow(product)));

  const tableBody = document.getElementById("table-body")
  tableBody.innerHTML = tableBodyContent;
}


loadProducts();