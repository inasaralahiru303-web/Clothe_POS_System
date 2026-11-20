
// PRODUCT DETAILS

let products = [
    {id:1, name:"Oversized T-Shirt", category:"Shirts", price:2490, stock:10, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"},
    {id:2, name:"Linen Shirt", category:"Shirts", price:3890, stock:12, image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400"},
    {id:3, name:"Denim Jeans", category:"Trousers", price:5490, stock:8, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"},
    {id:4, name:"Midi Dress", category:"Dresses", price:6290, stock:7, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"},
    {id:5, name:"Hoodie", category:"Hoodies", price:5990, stock:10, image:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"},
    {id:6, name:"Tote Bag", category:"Accessories", price:2190, stock:15, image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400"}
];

let cart = [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let selectedCategory = "All";
let editId = null;


// SAVE DATA

function saveData() {
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("orders", JSON.stringify(orders));
}

// DISPLAY PRODUCTS

function displayProducts() {

    let search = document.getElementById("searchInput").value.toLowerCase();

    let result = products.filter(p =>
        (selectedCategory === "All" || p.category === selectedCategory) &&
        p.name.toLowerCase().includes(search)
    );

    document.getElementById("productGrid").innerHTML = result.map(p => `
        <div class="product-card">

            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
            </div>

            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.category}</p>
                <b>Rs. ${p.price}</b>

                <button onclick="addToCart(${p.id})"
                    ${p.stock <= 0 ? "disabled" : ""}>
                    +
                </button>
            </div>

        </div>
    `).join("");

}

// SEARCH PRODUCTS

document.getElementById("searchInput").addEventListener("input", displayProducts);


// CATEGORY FILTER

document.querySelectorAll(".filter").forEach(btn => {

    btn.onclick = function() {
        selectedCategory = this.dataset.category;
        document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        displayProducts();
    };

});


// ADD TO CART

function addToCart(id) {

    let product = products.find(p => p.id === id);
    let item = cart.find(p => p.id === id);

    if (!product || product.stock <= 0) return;
    if (item) {
        if (item.qty >= product.stock) return alert("Stock limit reached!");
        item.qty++;
    } else {
        cart.push({...product, qty:1});
    }

    displayCart();
}


// DISPLAY CART

function displayCart() {

    document.getElementById("cartItems").innerHTML = cart.map(item => `
        <div class="cart-item">

            ${item.name} - Rs. ${item.price}

            <button onclick="changeQty(${item.id}, -1)">-</button>

            ${item.qty}

            <button onclick="changeQty(${item.id}, 1)">+</button>

        </div>
    `).join("") || "Your cart is empty.";

    let subtotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

    let discount = Math.min(100, Math.max(0,
        Number(document.getElementById("discountInput").value) || 0
    ));

    let totalDiscount = subtotal * discount / 100;

    document.getElementById("subtotal").innerText = "Rs. " + subtotal.toFixed(2);
    document.getElementById("discountAmount").innerText = "Rs. " + totalDiscount.toFixed(2);
    document.getElementById("total").innerText = "Rs. " + (subtotal - totalDiscount).toFixed(2);

}


// CHANGE QUANTITY

function changeQty(id, amount) {

    let item = cart.find(p => p.id === id);
    let product = products.find(p => p.id === id);

    if (!item || !product) return;

    item.qty += amount;

    if (item.qty <= 0) {
        cart = cart.filter(p => p.id !== id);
    } else if (item.qty > product.stock) {
        item.qty = product.stock;
    }

    displayCart();
}


// CLEAR CART

document.getElementById("clearCart").onclick = function() {
    cart = [];
    displayCart();
};


// DISCOUNT

document.getElementById("discountInput").oninput = displayCart;

// PRODUCT CRUD

function displayProductTable() {

    document.getElementById("productsTable").innerHTML = products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="editProduct(${p.id})">Edit</button>
                <button onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join("");

}


// ADD PRODUCT

document.getElementById("addProductBtn").onclick = function() {

    editId = null;
    document.getElementById("itemForm").reset();
    document.getElementById("dialogTitle").innerText = "Add Product";

    document.getElementById("productFields").hidden = false;
    document.getElementById("customerFields").hidden = true;

    document.getElementById("itemDialog").showModal();

};


// EDIT PRODUCT

function editProduct(id) {

    let p = products.find(p => p.id === id);
    if (!p) return;

    editId = id;

    let form = document.getElementById("itemForm");

    form.elements.name.value = p.name;
    form.elements.category.value = p.category;
    form.elements.price.value = p.price;
    form.elements.stock.value = p.stock;
    form.elements.image.value = p.image;

    document.getElementById("dialogTitle").innerText = "Edit Product";
    document.getElementById("productFields").hidden = false;
    document.getElementById("customerFields").hidden = true;

    document.getElementById("itemDialog").showModal();

}


// SAVE PRODUCT

document.getElementById("itemForm").onsubmit = function(e) {

    e.preventDefault();

    let form = new FormData(this);

    if (document.getElementById("customerFields").hidden === false) {

        let customer = {
            id: editId || Date.now(),
            name: form.get("customerName"),
            phone: form.get("phone"),
            email: form.get("email")
        };

        if (editId) {
            customers = customers.map(c => c.id === editId ? customer : c);
        } else {
            customers.push(customer);
        }

        displayCustomers();

    } else {

        let product = {
            id: editId || Date.now(),
            name: form.get("name"),
            category: form.get("category"),
            price: Number(form.get("price")),
            stock: Number(form.get("stock")),
            image: form.get("image")
        };

        if (editId) {
            products = products.map(p => p.id === editId ? product : p);
        } else {
            products.push(product);
        }

        displayProducts();
        displayProductTable();
    }

    saveData();
    document.getElementById("itemDialog").close();

};


// DELETE PRODUCT

function deleteProduct(id) {

    if (confirm("Delete this product?")) {
        products = products.filter(p => p.id !== id);
        cart = cart.filter(p => p.id !== id);
        displayProducts();
        displayProductTable();
        displayCart();
    }

}



