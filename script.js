const menuList = document.getElementById("menuList");
const drinkList = document.getElementById("drinkList");
const toast = document.getElementById("toast");
const tabMenu = document.getElementById("tabMenu");
const tabDrink = document.getElementById("tabDrink");
const tabCart = document.getElementById("tabCart");
const menuTab = document.getElementById("menuTab");
const drinkTab = document.getElementById("drinkTab");
const cartTab = document.getElementById("cartTab");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const btnDone = document.getElementById("btnDone");
const searchBar = document.querySelector('.search-box');
const searchInput = document.getElementById("searchInput");
const indexInput = document.getElementById('indexInput');
const btnClearSearch = document.getElementById("btnClearSearch");

let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
let activeTab = "menu"; // menu | drink | cart
let searchQuery = "";

function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
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
    console.log("Filtering...");
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
            btn.onclick = () => addToCart({ ...item, sizeLabel: null, price: options[0].price });
        } else if (options.length === 1) {
            // ✅ Chỉ 1 option (nhưng không phải Regular) → hiển thị text label
            const label = document.createElement("div");
            label.textContent = options[0].label;
            label.style.cssText = "color:#374151;font-weight:400;";
            right.appendChild(label);
            btn.onclick = () => addToCart({ ...item, sizeLabel: options[0].label, price: options[0].price });
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
                addToCart({ ...item, sizeLabel: choice.label, price: choice.price });
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
    // Tạo đối tượng cart item chuẩn hoá
    const newItem = {
        name: item.name || null,
        nameVN: item.nameVN || null,
        category: item.category || null,
        index: item.index ?? null,
        price: item.price ?? 0,
        sizeLabel: item.sizeLabel || null,
        qty: 1
    };

    // Tìm xem trong cart đã có item tương tự chưa
    const existing = cartItems.find(c =>
        c.name === newItem.name &&
        c.sizeLabel === newItem.sizeLabel &&
        c.category === newItem.category
    );

    if (existing) {
        existing.qty += 1;
    } else {
        cartItems.push(newItem);
    }
    saveCart();
    showToast();
}


/* ---------- Confirm & Clear when Done ---------- */
btnDone.onclick = () => {
    const ok = confirm("Are you sure you want to complete the order?");
    if (ok) {
        cartItems = [];
        saveCart();
        showToast("Order completed successfully");
        activate("menu"); // quay lại menu sau khi hoàn tất
    }
};

function renderCart() {
    cartList.innerHTML = "";

    if (cartItems.length === 0) {
        cartCount.textContent = 0;
        btnDone.style.display = "none";
        cartList.innerHTML = `<div style="text-align:center; color:#6b7280; padding:20px;">Your cart is empty 🛒</div>`;
        return;
    }

    btnDone.style.display = "block";

    const foodItems = cartItems.filter(i => !i.category);
    const drinkItems = cartItems.filter(i => i.category);

    // ✅ Helper: group drinks by category
    const groupByCategory = (arr) => {
        const groups = {};
        arr.forEach(i => {
            const cat = i.category || "Other Drinks";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(i);
        });
        return groups;
    };
    const drinkGroups = groupByCategory(drinkItems);

    // ✅ Helper: render section (food / drink group)
    const renderSection = (title, items, isDrink = false) => {
        if (items.length === 0) return;

        const section = document.createElement("div");
        section.innerHTML = `<h3 style="margin:10px 0; font-weight:600; color:${isDrink ? "#2563eb" : "#10b981"};">${title}</h3>`;

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:${isDrink ? "#eff6ff" : "#fff"};
        border-radius:8px;
        padding:10px 12px;
        box-shadow:0 1px 4px rgba(0,0,0,0.1);
        margin:6px;
        border-left:4px solid ${isDrink ? "#3b82f6" : "#10b981"};
      `;

            const infoHTML = isDrink
                ? `
            <div>
              <strong>${item.name}</strong>
              <div style="font-style:italic;color:#2563eb;margin-left:15px;">
                ${item.category ? `${item.category}` : ""}${item.nameVN ? ` - ${item.nameVN}` : ""}
                ${item.sizeLabel ? ` (${item.sizeLabel})` : ""}
              </div>
            </div>
          `
                : `
            <div>
            <strong>${item.index ? `${item.index}. ` : ""}${item.name}</strong>
            <div style="font-style:italic;color:#4b5563;margin-left:15px;">
              ${item.nameVN || ""}
            </div>
          </div>
          `;

            const qtyHTML = `
        <div style="font-weight:500; font-size:1rem; color:#111827;">x${item.qty}</div>
      `;

            div.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:20px;width:100%;">
            ${infoHTML}
            ${qtyHTML}
        </div>
      `;

            section.appendChild(div);
        });

        cartList.appendChild(section);
    };

    // --- Render Food ---
    renderSection("🍱 Food Items", foodItems, false);

    // --- Render Drinks grouped by category ---
    if (drinkItems.length > 0) {
        const drinksHeader = document.createElement("h3");
        drinksHeader.textContent = "🍸 Drinks";
        drinksHeader.style.cssText = "margin:14px 0 6px; font-weight:700; color:#2563eb;";
        cartList.appendChild(drinksHeader);

        for (const [category, items] of Object.entries(drinkGroups)) {
            const categoryDiv = document.createElement("div");
            categoryDiv.innerHTML = `<h4 style="margin:10px 0 4px 6px; font-weight:600; color:#1e3a8a;">${category}</h4>`;
            cartList.appendChild(categoryDiv);
            renderSection("", items, true);
        }
    }

    cartCount.textContent = cartItems.reduce((sum, i) => sum + i.qty, 0);
}


/* ---------- Tab switches ---------- */
function activate(tab) {
    activeTab = tab;
    resetSearch();

    // --- cập nhật trạng thái tab button ---
    const tabs = [
        { el: tabMenu, name: "menu" },
        { el: tabDrink, name: "drink" },
        { el: tabCart, name: "cart" },
    ];
    tabs.forEach(t => {
        t.el.classList.toggle("tab-active", tab === t.name);
        t.el.classList.toggle("tab-inactive", tab !== t.name);
    });

    // --- hiển thị nội dung tương ứng ---
    menuTab.style.display = (tab === "menu") ? "block" : "none";
    drinkTab.style.display = (tab === "drink") ? "block" : "none";
    cartTab.style.display = (tab === "cart") ? "block" : "none";

    // --- điều chỉnh hiển thị & bố cục search bar ---
    searchBar.style.display = (tab !== "cart") ? "flex" : "none";

    if (tab === "menu") {
        indexInput.style.display = "block";
        indexInput.style.flex = "2";
        searchInput.style.flex = "8";
    } else if (tab === "drink") {
        indexInput.style.display = "none";
        searchInput.style.flex = "10";
    }

    // --- render nội dung ---
    const renderMap = {
        menu: () => renderMenu(menuItems),
        drink: () => renderDrinks(drinkItems),
        cart: () => renderCart(),
    };
    renderMap[tab]?.();
}


tabMenu.onclick = () => activate("menu");
tabDrink.onclick = () => activate("drink");
tabCart.onclick = () => activate("cart");

btnClearSearch.onclick = () => {
    resetSearch();

    // Reset list
    if (activeTab === "menu") renderMenu(menuItems);
    else if (activeTab === "drink") renderDrinks(drinkItems);
};

/* ---------- Search bindings ---------- */
searchInput.oninput = filterActive;
indexInput.oninput = filterActive;

/* ---------- Init ---------- */
renderMenu(menuItems);
renderDrinks(drinkItems);
renderCart();