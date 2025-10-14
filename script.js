const menuList = document.getElementById("menuList");
const drinkList = document.getElementById("drinkList");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const tabMenu = document.getElementById("tabMenu");
const tabDrink = document.getElementById("tabDrink");
const tabCart = document.getElementById("tabCart");
const menuTab = document.getElementById("menuTab");
const drinkTab = document.getElementById("drinkTab");
const cartTab = document.getElementById("cartTab");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const btnDone = document.getElementById("btnDone");
// ✅ Cập nhật selector mới theo HTML
const searchBar = document.querySelector('.search-box');
const indexInput = document.getElementById('indexInput');

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let activeTab = "menu"; // menu | drink | cart
let searchQuery = "";

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function showToast(msg = "Added to cart") {
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 1000);
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<span style="color:#dc2626; font-weight:600;">$1</span>`);
}

function resetSearch() {
    searchInput.value = "";
    indexInput.value = "";
    searchQuery = "";
}

function filterActive() {
    const q = searchInput.value.trim().toLowerCase();
    searchQuery = q;
    const idx = parseInt(indexInput.value);
    let data = activeTab === "drink" ? drinkItems : menuItems;
    let filtered = data;

    function matchInitials(name, vn, category) {
        if (!name) return false;

        const nameLower = name.toLowerCase();
        const vnLower = vn ? vn.toLowerCase() : "";
        const catLower = category ? category.toLowerCase() : "";

        // chữ cái đầu
        const initials = name.split(/\s+/).map(w => w[0]).join("").toLowerCase();
        const initialsVN = vn ? vn.split(/\s+/).map(w => w[0]).join("").toLowerCase() : "";
        const initialsCat = category ? category.split(/\s+/).map(w => w[0]).join("").toLowerCase() : "";

        return (
            nameLower.includes(q) ||
            vnLower.includes(q) ||
            catLower.includes(q) ||
            initials.startsWith(q) ||
            initialsVN.startsWith(q) ||
            initialsCat.startsWith(q)
        );
    }

    console.log("Index:", idx, "Query:", q, "activeTab:", activeTab);
    if (!isNaN(idx))
        filtered = filtered.filter(i => i.index === idx);
    else if (q)
        filtered = filtered.filter(x => matchInitials(x.name, x.nameVN, x.category));

    if (activeTab === "drink")
        renderDrinks(filtered);
    else
        renderMenu(filtered);
}

/* ---------- MENU LIST (giữ nút + bên phải) ---------- */
function renderMenu(items) {
    menuList.innerHTML = "";
    items.forEach(item => {
        const div = document.createElement("div");
        div.style.cssText = "background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.1);padding:12px;display:flex;justify-content:space-between;align-items:center;margin:6px 0;";
        const info = document.createElement("div");
        info.style.cssText = "flex:1;margin-right:10px;";
        info.innerHTML = `
            <div style="font-weight:500;">
                ${item.index ? item.index + ". " : ""}${highlightText(item.name, searchQuery)}
            </div>
            <div style="font-style:italic;color:#4b5563;margin-left:18px;font-size:0.9rem;">
                ${item.nameVN ? highlightText(item.nameVN, searchQuery) : ""}
            </div>
            `;
        const btn = document.createElement("button");
        btn.textContent = "+";
        btn.style.cssText = "background:#16a34a;color:#fff;font-size:1.1rem;border:none;border-radius:6px;padding:4px 10px;margin-left:10px;margin-right:4px;cursor:pointer;";
        btn.onmouseover = () => btn.style.background = "#15803d";
        btn.onmouseout = () => btn.style.background = "#16a34a";
        btn.onclick = () => addToCart({...item, sizeLabel: null });
        div.appendChild(info);
        div.appendChild(btn);
        menuList.appendChild(div);
    });
}

function renderDrinks(items) {
    drinkList.innerHTML = "";
    items.forEach(item => {
                const div = document.createElement("div");
                div.style.cssText = "background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.1);padding:12px;display:flex;justify-content:space-between;align-items:center;margin:6px 0;";

                // --- Left info ---
                const info = document.createElement("div");
                info.style.cssText = "flex:1;margin-right:10px;";
                info.innerHTML = `
        <div style="font-weight:500;">${highlightText(item.name, searchQuery)}</div>
        <div style="color:#4b5563;margin-left:18px;font-style:italic;font-size:0.9rem;">
            ${item.category ? `<span style="color:#6b7280;">${highlightText(item.category, searchQuery)}</span>` : ""}
            ${(item.category && item.nameVN) ? " – " : ""}
            ${item.nameVN ? highlightText(item.nameVN, searchQuery) : ""}
        </div>
        `;

        // --- Right side (select / label / button) ---
        const right = document.createElement("div");
        right.style.cssText = "display:flex;align-items:center;gap:8px;flex-shrink:0;";

        const btn = document.createElement("button");
        btn.textContent = "+";
        btn.style.cssText = "background:#16a34a;color:#fff;font-size:1.1rem;border:none;border-radius:6px;padding:4px 10px;margin-left:10px;margin-right:4px;cursor:pointer;";
        btn.onmouseover = () => (btn.style.background = "#15803d");
        btn.onmouseout = () => (btn.style.background = "#16a34a");

        const options = item.options || [{ label: "Regular", price: item.price }];
        const nonRegular = options.filter(o => o.label.toLowerCase() !== "regular");

        // Logic hiển thị tuỳ theo số lượng option
        if (options.length === 1 && options[0].label.toLowerCase() === "regular") {
            // ✅ Chỉ 1 option Regular → không hiển thị gì thêm
            btn.onclick = () => addToCart({...item, sizeLabel: null, price: options[0].price });
        } else if (options.length === 1) {
            // ✅ Chỉ 1 option (nhưng không phải Regular) → hiển thị text label
            const label = document.createElement("div");
            label.textContent = options[0].label;
            label.style.cssText = "color:#374151;font-weight:400;";
            right.appendChild(label);
            btn.onclick = () => addToCart({...item, sizeLabel: options[0].label, price: options[0].price });
        } else {
            // ✅ Nhiều options → hiển thị dropdown (chỉ label, không giá)
            const sel = document.createElement("select");
            sel.style.cssText = "border:1px solid #d1d5db;border-radius:6px;padding:4px 8px;";
            nonRegular.forEach((op, ix) => {
                const o = document.createElement("option");
                o.value = ix;
                o.text = op.label; // 👈 chỉ label, không giá
                sel.appendChild(o);
            });
            right.appendChild(sel);

            btn.onclick = () => {
                const choice = nonRegular[sel.value] || options[0];
                addToCart({...item, sizeLabel: choice.label, price: choice.price });
            };
        }

        right.appendChild(btn);
        div.appendChild(info);
        div.appendChild(right);
        drinkList.appendChild(div);
    });
}


/* ---------- CART ---------- */
function addToCart(item) {
    // match by name + size (nếu có)
    const key = (x) => `${x.name}__${x.sizeLabel||""}`;
    const found = cart.find(x => key(x) === key(item));
    if (found) found.qty++;
    else cart.push({ name: item.name, nameVN: item.nameVN, index: item.index, price: item.price, qty: 1, sizeLabel: item.sizeLabel });
    saveCart();
    showToast(); // KHÔNG auto switch cart
}

/* ---------- Confirm & Clear when Done ---------- */
btnDone.onclick = () => {
    const ok = confirm("Are you sure you want to complete the order?");
    if (ok) {
        cart = [];
        saveCart();
        showToast("Order completed successfully");
        activate("menu"); // quay lại menu sau khi hoàn tất
    }
};

function renderCart() {
    cartList.innerHTML = "";

    if (cart.length === 0) {
        btnDone.style.display = "none"; // 👈 Ẩn nút khi giỏ hàng trống
    } else {
        btnDone.style.display = "block"; // 👈 Hiện nút khi có món trong giỏ
    }

    let total = 0,
        qty = 0;
    cart.forEach((line, idx) => {
        total += line.price * line.qty;
        qty += line.qty;

        const row = document.createElement("div");
        row.style.cssText = "background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.1);padding:12px;display:flex;justify-content:space-between;align-items:center;margin:6px 0;";
        const info = document.createElement("div");
        info.style.cssText = "flex:1;margin-right:10px;";
        const sizeTxt = line.sizeLabel ? ` <span style='color:#6b7280;'>(${line.sizeLabel})</span>` : "";
        info.innerHTML = `
      <div style='font-weight:500;'>${line.name}${sizeTxt}</div>
      <div style='font-style:italic;color:#4b5563;margin-left:18px;'>${line.nameVN || ""}</div>
    `;

        const right = document.createElement("div");
        right.style.cssText = "display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:10px;";
        const qtyDiv = document.createElement("div");
        qtyDiv.textContent = "x" + line.qty;
        qtyDiv.style.cssText = "font-weight:600;color:#374151;min-width:30px;text-align:right;";
        const del = document.createElement("button");
        del.textContent = "✖";
        del.style.cssText = "background:none;color:#dc2626;font-size:1.2rem;border:none;cursor:pointer;padding:0 6px;";
        del.onmouseover = () => (del.style.color = "#b91c1c");
        del.onmouseout = () => (del.style.color = "#dc2626");
        del.onclick = () => {
            cart.splice(idx, 1);
            saveCart();
        };

        right.appendChild(qtyDiv);
        right.appendChild(del);
        row.appendChild(info);
        row.appendChild(right);
        cartList.appendChild(row);
    });

    cartTotal.textContent = "£" + total.toFixed(2);
    cartCount.textContent = qty;
}

/* ---------- Tab switches ---------- */
function activate(tab) {
    activeTab = tab;
    resetSearch();

    tabMenu.classList.toggle("tab-active", tab === "menu");
    tabMenu.classList.toggle("tab-inactive", tab !== "menu");
    tabDrink.classList.toggle("tab-active", tab === "drink");
    tabDrink.classList.toggle("tab-inactive", tab !== "drink");
    tabCart.classList.toggle("tab-active", tab === "cart");
    tabCart.classList.toggle("tab-inactive", tab !== "cart");

    menuTab.style.display = (tab === "menu") ? "block" : "none";
    drinkTab.style.display = (tab === "drink") ? "block" : "none";
    cartTab.style.display = (tab === "cart") ? "block" : "none";

    // ✅ Ẩn search bar khi ở cart
    searchBar.style.display = (tab === "cart") ? "none" : "flex";

    // ✅ Ẩn ô Index khi ở tab Drinks hoặc Cart
    indexInput.style.display = (tab === "drink" || tab === "cart") ? "none" : "block";

    if (tab === "menu") {
        indexInput.parentElement.style.flex = "1";
        indexInput.parentElement.style.paddingRight = "10px";
        searchInput.style.width = "93%";
    } else if (tab === "drink") {
        indexInput.parentElement.style.flex = "0";
        indexInput.parentElement.style.paddingRight = "5px";
        searchInput.style.width = "100%";
    }
}

tabMenu.onclick = () => activate("menu");
tabDrink.onclick = () => activate("drink");
tabCart.onclick = () => activate("cart");

/* ---------- Search bindings ---------- */
searchInput.oninput = filterActive;
indexInput.oninput = filterActive;

/* ---------- Init ---------- */
renderMenu(menuItems);
renderDrinks(drinkItems);
renderCart();