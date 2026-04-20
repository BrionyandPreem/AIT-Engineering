let products = []; 
let filteredProducts = []; // เพิ่มตัวแปรเก็บสินค้าที่ผ่านการกรองแล้ว
let currentPage = 1;      
const itemsPerPage = 20;  

// 1. โหลดข้อมูล
async function loadProducts() {
    try {
        const response = await fetch('products.json'); 
        if (!response.ok) throw new Error("หาไฟล์ JSON ไม่เจอจ้า");
        
        products = await response.json();
        filteredProducts = [...products]; // เริ่มต้นให้สินค้าที่กรองแล้ว = สินค้าทั้งหมด
        console.log("โหลดข้อมูลสำเร็จ:", products);
        
        renderProducts(); 
    } catch (error) {
        console.error("อุ๊ย! โหลดข้อมูลไม่เข้าจ้าเปรม:", error);
    }
}

// 2. ตัวแปรตะกร้า
let cart = JSON.parse(localStorage.getItem('aitCart')) || [];

// 3. แสดงสินค้า (แบบแบ่งหน้า)
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return; 
    grid.innerHTML = "";

    // คำนวณจุดตัดแบ่งหน้าจาก filteredProducts
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredProducts.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-20">ไม่พบสินค้าในหมวดหมู่นี้จ้า</p>`;
    }

    paginatedItems.forEach(item => {
        const card = `
            <div class="product-card group text-center flex flex-col items-center" data-category="${item.categoryTag}">
                <div class="h-40 w-full bg-gray-50 mb-4 flex items-center justify-center p-4 overflow-hidden">
                    <img src="${item.img}" alt="${item.name}" class="max-h-full group-hover:scale-110 transition duration-300">
                </div>
                <h3 onclick="openModal('${item.name}', '${item.sku}', '${item.category}', '${item.desc}', '${item.img}')" 
                    class="text-sm font-medium text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition">
                    ${item.name}
                </h3>
                <p onclick="openModal('${item.name}', '${item.sku}', '${item.category}', '${item.desc}', '${item.img}')" 
                    class="text-blue-400 text-xs mb-4 cursor-pointer hover:underline">
                    Read more
                </p>
                <button onclick="addToCart('${item.name}', '${item.img}')" class="bg-orange-500 text-white px-4 py-1.5 text-[11px] rounded font-bold shadow-sm hover:bg-orange-600 transition">
                    <i class="fa-solid fa-plus mr-1"></i> Add to Cart
                </button>
            </div>
        `;
        grid.innerHTML += card;
    });

    renderPagination();
}

// ฟังก์ชันสร้างปุ่มเลขหน้า
function renderPagination() {
    const paginationDiv = document.getElementById('pagination-controls');
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    let paginationHtml = "";

    if (totalPages > 1) { // มีมากกว่า 1 หน้าค่อยโชว์ปุ่ม
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <button onclick="changePage(${i})" 
                    class="px-4 py-2 mx-1 rounded border ${currentPage === i ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-50'}">
                    ${i}
                </button>
            `;
        }
    }
    paginationDiv.innerHTML = paginationHtml;
}

function changePage(page) {
    currentPage = page;
    
    // อัปเดต URL โดยไม่ต้องรีเฟรชหน้าจอ
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=' + page;
    window.history.pushState({path:newurl}, '', newurl);
    
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. ตะกร้าสินค้า (เหมือนเดิม)
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function addToCart(productName, productImg) {
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: productName, img: productImg, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCount) cartCount.innerText = totalItems;
    if(cartTotal) cartTotal.innerText = totalItems + " ชิ้น";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `<p class="text-center text-gray-400 mt-10">ตะกร้าของคุณยังว่างอยู่...</p>`;
    } else {
        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div class="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border">
                    <img src="${item.img}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-[11px] truncate">${item.name}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <button onclick="changeQty(${index}, -1)" class="w-5 h-5 bg-gray-100 rounded text-xs">-</button>
                        <span class="text-xs font-bold">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="w-5 h-5 bg-gray-100 rounded text-xs">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-500 p-2">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        `).join('');
    }
    localStorage.setItem('aitCart', JSON.stringify(cart));
}

function changeQty(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// 5. Modal
function openModal(name, sku, cats, desc, imgSrc) {
    if(document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = name;
    if(document.getElementById('modalSku')) document.getElementById('modalSku').innerText = "SKU: " + sku;
    if(document.getElementById('modalCats')) document.getElementById('modalCats').innerText = cats;
    if(document.getElementById('modalDesc')) document.getElementById('modalDesc').innerHTML = desc;
    if(document.getElementById('modalImg')) document.getElementById('modalImg').src = imgSrc;
    
    if(document.getElementById('modalBreadcrumb')) {
        document.getElementById('modalBreadcrumb').innerText = `Home / Products / ${cats}`;
    }

    const modalBtn = document.getElementById('modalAddToCartBtn');
    if(modalBtn) {
        modalBtn.onclick = () => {
            addToCart(name, imgSrc);
            closeModal();
        };
    }

    const modal = document.getElementById('productModal');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    document.body.style.overflow = 'auto';
}

// 6. ระบบคัดกรอง (แก้ใหม่ให้ทำงานร่วมกับการแบ่งหน้า)
// แก้ฟังก์ชันนี้ใน script.js
function filterByCategory(categoryName) {
    // 1. จัดการชื่อหมวดหมู่ให้สะอาด (ตัวเล็ก + ตัดช่องว่าง)
    const searchCat = categoryName.toLowerCase().trim();
    
    // 2. กรองสินค้า
    if (searchCat === 'all' || searchCat === 'all categories') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(item => {
            // เช็คว่าใน categoryTag (ซึ่งอาจจะเป็น String หรือ Array) มีคำที่เราหาไหม
            const tags = String(item.categoryTag).toLowerCase();
            return tags.includes(searchCat);
        });
    }
    
    // 3. รีเซ็ตหน้ากลับไปที่ 1 และอัปเดต URL
    currentPage = 1;
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newurl}, '', newurl);
    
    // 4. สั่งให้หุ่นยนต์วาดสินค้าใหม่
    renderProducts();
}

// 7. เริ่มทำงาน
window.onload = function() {
    // ดึงเลขหน้าจาก URL ถ้าไม่มีให้เริ่มที่ 1
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'));
    
    if (pageFromUrl) {
        currentPage = pageFromUrl;
    } else {
        currentPage = 1;
    }

    loadProducts(); 
    updateCartUI(); 
};