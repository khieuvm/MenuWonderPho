const menuList = document.getElementById("menuList");
const searchInput = document.getElementById("searchInput");
const indexInput = document.getElementById("indexInput");
const toast = document.getElementById("toast");
const tabMenu = document.getElementById("tabMenu");
const tabCart = document.getElementById("tabCart");
const menuTab = document.getElementById("menuTab");
const cartTab = document.getElementById("cartTab");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const cartEmpty = document.getElementById("cartEmpty");
const btnClear = document.getElementById("btnClear");
const btnDone = document.getElementById("btnDone");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function showToast(msg = "Đã thêm vào giỏ hàng") {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1000);
}

function filterMenu() {
  const text = searchInput.value.trim().toLowerCase();
  const idx = parseInt(indexInput.value);
  let filtered = menuItems;
  if (!isNaN(idx)) filtered = filtered.filter(i => i.index === idx);
  else if (text) filtered = filtered.filter(i =>
    i.name.toLowerCase().includes(text) ||
    i.nameVN.toLowerCase().includes(text)
  );
  renderMenu(filtered);
}

function renderMenu(items) {
  menuList.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "bg-white rounded shadow p-3 flex justify-between items-center";
    div.innerHTML = `
      <div>
        <div class="font-semibold">${item.index ? item.index + ". " : ""}${item.name}</div>
        <div class="text-sm italic text-gray-500">${item.nameVN}</div>
        <div class="text-gray-600">£${item.price.toFixed(2)}</div>
      </div>
      <button class="bg-green-500 text-white px-3 py-1 rounded">+</button>
    `;
    div.querySelector("button").onclick = () => {
      addToCart(item);
      showToast();
    };
    menuList.appendChild(div);
  });
}

function addToCart(item) {
  const existing = cart.find(c => c.name === item.name);
  if (existing) existing.qty++;
  else cart.push({...item, qty:1});
  saveCart();
  showToast();
}

function renderCart() {
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartEmpty.classList.remove("hidden");
  } else {
    cartEmpty.classList.add("hidden");
  }
  let total = 0, qty = 0;
  cart.forEach((line, idx) => {
    const subtotal = line.price * line.qty;
    total += subtotal;
    qty += line.qty;
    const el = document.createElement("div");
    el.className = "bg-white rounded shadow p-3 flex justify-between items-center";
    el.innerHTML = `
      <div>
        <div class="font-semibold">${line.name}</div>
        <div class="italic text-gray-500 text-sm">${line.nameVN}</div>
        <div class="text-sm text-gray-600">x${line.qty} – £${subtotal.toFixed(2)}</div>
      </div>
      <button class="text-red-500">✖</button>
    `;
    el.querySelector("button").onclick = () => {
      cart.splice(idx, 1);
      saveCart();
    };
    cartList.appendChild(el);
  });
  cartTotal.textContent = "£" + total.toFixed(2);
  cartCount.textContent = qty;
}

btnClear.onclick = () => {
  if (cart.length && confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
    cart = [];
    saveCart();
  }
};

btnDone.onclick = () => {
  if (cart.length === 0) return alert("Giỏ hàng trống!");
  showToast("Đơn hàng đã được ghi nhận!");
  cart = [];
  saveCart();
};

tabMenu.onclick = () => {
  tabMenu.classList.add("tab-active");
  tabCart.classList.remove("tab-active");
  menuTab.classList.remove("hidden");
  cartTab.classList.add("hidden");
};

tabCart.onclick = () => {
  tabCart.classList.add("tab-active");
  tabMenu.classList.remove("tab-active");
  cartTab.classList.remove("hidden");
  menuTab.classList.add("hidden");
  renderCart();
};

searchInput.oninput = filterMenu;
indexInput.oninput = filterMenu;

renderMenu(menuItems);
renderCart();
