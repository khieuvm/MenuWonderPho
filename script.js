const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const foodList = document.getElementById("foodList");
const drinkList = document.getElementById("drinkList");
const toast = document.getElementById("toast");
const tabFood = document.getElementById("tabFood");
const tabDrink = document.getElementById("tabDrink");
const tabCart = document.getElementById("tabCart");
const foodTab = document.getElementById("foodTab");
const drinkTab = document.getElementById("drinkTab");
const cartTab = document.getElementById("cartTab");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const btnDone = document.getElementById("btnDone");
const searchBar = document.querySelector('.search-box');
const searchInput = document.getElementById("searchInput");
const indexInput = document.getElementById('indexInput');
const btnClearSearch = document.getElementById("btnClearSearch");
// Popup element
const updatePopup = document.getElementById("updatePopup");
const updateTitle = document.getElementById("updateTitle");
const updateList = document.getElementById("updateList");
const searchItem = document.getElementById("searchItem");
const saveUpdate = document.getElementById("saveUpdate");
const cancelUpdate = document.getElementById("cancelUpdate");

let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
let activeTab = "food"; // food | drink | cart
let searchQuery = "";
let cartNote = localStorage.getItem("cartNote") || "";
let storedFoods = JSON.parse(localStorage.getItem("FoodMenu") || FoodMenu);
let storedDrinks = JSON.parse(localStorage.getItem("DrinkMenu") || DrinkMenu);

function clearData() {
    cartCount.textContent = 0;
    cartItems = [];
    cartNote = "";
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartNote");
    activate("food");
}

function saveNoteToLocal() {
    localStorage.setItem("cartNote", cartNote);
}

function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    cartCount.textContent = cartItems.reduce((sum, i) => sum + i.qty, 0);
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
    let data = activeTab === "drink" ? storedDrinks : storedFoods;
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

    if (!isNaN(idx))
        filtered = filtered.filter(i => i.index === idx);
    else if (q)
        filtered = filtered.filter(x => matchInitials(x.name, x.nameVN, x.category));

    if (activeTab === "drink")
        renderDrinks(filtered);
    else
        renderFood(filtered);
}

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

/* ---------- Init ---------- */
function initMenuStorage() {
    if (!localStorage.getItem("FoodMenu")) {
        localStorage.setItem("FoodMenu", JSON.stringify(FoodMenu));
        console.log("Default FoodMenu saved to localStorage");
    }
    if (!localStorage.getItem("DrinkMenu")) {
        localStorage.setItem("DrinkMenu", JSON.stringify(DrinkMenu));
        console.log("Default DrinkMenu saved to localStorage");
    }
}

/* ---------- Food LIST ---------- */
function renderFood(items) {
    foodList.innerHTML = "";
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
        btn.onclick = () => addToCart({ ...item, sizeLabel: null });
        div.appendChild(info);
        div.appendChild(btn);
        foodList.appendChild(div);
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
            padding:5px;
            padding-right: 0;
            box-shadow:0 1px 4px rgba(0,0,0,0.1);
            margin:5px;
            border-left:4px solid ${isDrink ? "#3b82f6" : "#10b981"};
        `;

            // 📝 Thông tin món
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

            // 🧩 Tạo nút tăng / giảm / xóa
            const btnMinus = document.createElement("button");
            btnMinus.textContent = "➖";
            btnMinus.title = "Giảm số lượng";
            btnMinus.style.cssText = `
            background:none; border:none; cursor:pointer;
            font-size:0.5rem; color:#dc2626; padding:2px;
        `;
            btnMinus.onclick = () => {
                if (item.qty > 1) {
                    item.qty--;
                } else {
                    // nếu giảm còn 0 thì xóa luôn
                    cartItems = cartItems.filter(i => i !== item);
                }
                renderCart();
            };

            const btnPlus = document.createElement("button");
            btnPlus.textContent = "➕";
            btnPlus.title = "Tăng số lượng";
            btnPlus.style.cssText = `
            background:none; border:none; cursor:pointer;
            font-size:0.5rem; color:#16a34a; padding:2px;
        `;
            btnPlus.onclick = () => {
                item.qty++;
                renderCart();
            };

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "🗑️";
            btnDelete.title = "Xóa món này";
            btnDelete.style.cssText = `
            background:none; border:none; cursor:pointer;
            font-size:1.2rem; margin-left:5px;
        `;
            btnDelete.onclick = () => {
                cartItems = cartItems.filter(i => i !== item);
                renderCart();
            };

            // 🔢 Số lượng
            const qtyDiv = document.createElement("div");
            qtyDiv.textContent = `${item.qty}`;
            qtyDiv.style.cssText = `
            font-weight:500; font-size:1rem; color:#111827; min-width:15px; text-align:center;
        `;

            // ⚙️ Layout phần nút
            const controls = document.createElement("div");
            controls.style.cssText = `
            display:flex; align-items:center;
        `;
            controls.append(btnMinus, qtyDiv, btnPlus, btnDelete);

            // 🧱 Cấu trúc tổng
            const wrapper = document.createElement("div");
            wrapper.style.cssText = `
            display:flex; align-items:center; justify-content:space-between; width:100%;
        `;
            wrapper.innerHTML = infoHTML;
            wrapper.appendChild(controls);

            div.appendChild(wrapper);
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

    // ✅ hiển thị ghi chú ở cuối
    if (cartNote) {
        const noteDiv = document.createElement("div");
        noteDiv.style.cssText = `
        margin-top:15px;
        padding:10px;
        background:#fef3c7;
        border-left:4px solid #f59e0b;
        border-radius:6px;
        color:#92400e;
        `;
        noteDiv.innerHTML = `<strong>📝 Note:</strong><br>${cartNote.replace(/\n/g, "<br>")}`;
        cartList.appendChild(noteDiv);
    }

    cartCount.textContent = cartItems.reduce((sum, i) => sum + i.qty, 0);
}

// Order History
function openHistoryPopup() {
    const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    if (history.length === 0) {
        clearHistory.style.display = "none";
        historyList.innerHTML = `<div style="text-align:center; color:#6b7280;">No orders yet.</div>`;
        return (historyPopup.style.display = "flex");
    }

    clearHistory.style.display = "block";
    history.sort((a, b) => new Date(b.id) - new Date(a.id));
    history.forEach(order => {
        const div = document.createElement("div");
        div.style.cssText = `
      border:1px solid #d1d5db;
      border-radius:8px;
      padding:10px;
      margin-bottom:8px;
      cursor:pointer;
    `;
        const time = new Date(order.id).toLocaleString();
        div.innerHTML = `
      <div style="font-weight:600; color:#111827;">🕓 ${time}</div>
      <div style="color:#4b5563;">Total: <strong>${order.total.toLocaleString()}₫</strong></div>
    `;
        div.onclick = () => showOrderDetail(order);
        historyList.appendChild(div);
    });

    historyPopup.style.display = "flex";
}

function showOrderDetail(order) {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    clearHistory.style.display = "none";
    const time = new Date(order.id).toLocaleString();
    const header = document.createElement("div");
    header.style.cssText = `
    display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
  `;
    header.innerHTML = `
    <h4 style="margin:0; font-size:1rem; font-weight:600;">Order Detail</h4>
    <button class="back-btn" id="backToHistory">← Back</button>
  `;
    historyList.appendChild(header);

    const foodItems = order.items.filter(i => !i.category);
    const drinkItems = order.items.filter(i => i.category);

    const content = document.createElement("div");
    content.innerHTML = `
    <div style="font-size:0.9rem; color:#4b5563; margin-bottom:6px;">🕓 ${time}</div>
    <div id="orderItemList" style="margin-bottom:10px;">
      ${foodItems.map(i => `
        <div style="display:flex; gap: 10px;justify-content:space-between; padding:4px 0; border-bottom:1px solid #eee;">
          <div style="flex:8;">${i.index ? ` ${i.index}. ` : ""}${i.category ? ` ${i.category} - ` : ""}${i.name}${i.sizeLabel ? ` (${i.sizeLabel})` : ""}</div>
          <div style="flex:1;" class="push">x${i.qty}</div>
          <div style="flex:1;">${((i.price || 0) * i.qty).toLocaleString()}</div>
          <input type="checkbox" class="item-check" data-price="${((i.price || 0) * i.qty)}">
        </div>
      `).join("")}
      ${drinkItems.map(i => `
        <div style="display:flex; gap: 10px;justify-content:space-between; padding:4px 0; border-bottom:1px solid #eee;">
          <div style="flex:8;">${i.index ? ` ${i.index}. ` : ""}${i.category ? ` ${i.category} - ` : ""}${i.name}${i.sizeLabel ? ` (${i.sizeLabel})` : ""}</div>
          <div style="flex:1;" class="push">x${i.qty}</div>
          <div style="flex:1;">${((i.price || 0) * i.qty).toLocaleString()}</div>
          <input type="checkbox" class="item-check" data-price="${((i.price || 0) * i.qty)}">
        </div>
      `).join("")}
    </div>
    ${order.note
            ? `<div style="margin-top:8px; color:#92400e;">📝 Note: ${order.note}</div>`
            : ""
        }
    <div style="text-align:right; font-weight:700; margin-top:10px;">Total: ${order.total.toLocaleString()} - Include Fee (+10%): ${((order.total * 1.1).toFixed(2)).toLocaleString()}</div>
    <div id="selectedTotalBox" style="margin-top:8px; text-align:right; font-size:0.95rem; font-weight:600; color:#2563eb;"></div>
  `;
    historyList.appendChild(content);

    const orderItemList = document.getElementById("orderItemList");
    const checkboxes = orderItemList.querySelectorAll(".item-check");
    checkboxes.forEach(cb => cb.addEventListener("change", updateSelectedTotal));

    document.getElementById("backToHistory").onclick = () => openHistoryPopup();
}

function updateSelectedTotal() {
    const orderItemList = document.getElementById("orderItemList");
    const checkboxes = orderItemList.querySelectorAll(".item-check");

    let total = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) total += parseFloat(cb.dataset.price);
    });
    const box = document.getElementById("selectedTotalBox");
    if (total > 0) {
        box.innerHTML = `Selected total: ${total.toLocaleString()} - Include Fee (+10%): ${((total * 1.1).toFixed(2)).toLocaleString()}`;
    } else {
        box.innerHTML = "";
    }
}

let editingType = "";
let editingData = [];

// mở popup chính
function openUpdatePopup(type) {
    editingType = type;
    const key = type === "Food" ? "FoodMenu" : "DrinkMenu";
    editingData = JSON.parse(localStorage.getItem(key) || "[]");
    updateTitle.textContent = type === "Food" ? "🍱 Update Food" : "🥤 Update Drink";
    updatePopup.style.display = "flex";
    renderUpdateList(editingData);
}

function renderUpdateList(list) {
    updateList.innerHTML = "";
    if (list.length === 0) {
        updateList.innerHTML =
            '<div style="text-align:center; color:#6b7280;">No items</div>';
        return;
    }

    list.forEach((item, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "update-item-wrapper";

        const div = document.createElement("div");
        div.className = "update-item";
        div.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin:2px;gap:5px";

        if (editingType === "Food") {
            div.innerHTML = `
        <input style="flex:1; font-size: 16px;" type="text" value="${item.index || ""}" data-field="index" placeholder="-">
        <input style="flex:4; font-size: 16px;" type="text" value="${item.name || ""}" data-field="name" placeholder="Name">
        <input style="flex:4; font-size: 16px;" type="text" value="${item.nameVN || ""}" data-field="nameVN" placeholder="Other Name">
        <input style="flex:1; font-size: 16px;" type="text"  value="${item.price || ""}" data-field="price" placeholder="Price">
        <button class="option-btn delete">🗑️</button>
      `;
        } else {
            div.innerHTML = `
        <input style="flex:2; font-size: 16px;" type="text" value="${item.category || ""}" data-field="category" placeholder="Category">
        <input style="flex:5; font-size: 16px;" type="text" value="${item.name || ""}" data-field="name" placeholder="Name">
        <input style="flex:2; font-size: 16px;" type="text" value="${item.nameVN || ""}" data-field="nameVN" placeholder="Other Name">
        <button class="option-btn delete">🗑️</button>
      `;
        }

        // --- Update basic fields ---
        div.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", (e) => {
                const field = e.target.dataset.field;
                editingData[idx][field] = e.target.value;
            });
        });

        // --- Delete item ---
        div.querySelector(".option-btn.delete").onclick = () => {
            if (confirm("🗑️ Delete this item?")) {
                editingData.splice(idx, 1);
                renderUpdateList(editingData);
            }
        };

        wrapper.appendChild(div);
        //--- Nếu là drink thì render options inline ---
        if (editingType === "Drink") {
            const optDiv = document.createElement("div");
            optDiv.className = "option-inline";

            // render option list
            const options = item.options || [];
            options.forEach((opt, optIdx) => {
                const optRow = document.createElement("div");
                optRow.className = "option-item";
                optRow.innerHTML = `
          <input font-size: 16px;" type="text" value="${opt.label || ""}" placeholder="Label">
          <input  font-size: 16px;" type="text" value="${opt.price || ""}" placeholder="Price">
          <button class="option-btn delete" >🗑️</button>
        `;
                const [label, price, del] = optRow.querySelectorAll("input,button");
                label.addEventListener("input", () => (options[optIdx].label = label.value));
                price.addEventListener("input", () => (options[optIdx].price = parseFloat(price.value)));
                del.onclick = () => {
                    if (confirm("Delete this option?")) {
                        options.splice(optIdx, 1);
                        renderUpdateList(editingData);
                    }
                };
                optDiv.appendChild(optRow);
            });

            // add new option
            const addOptBtn = document.createElement("button");
            addOptBtn.className = "add-option";
            addOptBtn.textContent = "➕ Add Option";
            addOptBtn.onclick = () => {
                if (!editingData[idx].options) editingData[idx].options = [];
                editingData[idx].options.push({ label: "", price: 0 });
                renderUpdateList(editingData);
            };
            optDiv.appendChild(addOptBtn);

            wrapper.appendChild(optDiv);
        }

        if (editingType === "Drink")
            updateList.appendChild(wrapper);
        else
            updateList.appendChild(div);
    });
}


/* ---------- Tab switches ---------- */
function activate(tab) {
    activeTab = tab;
    resetSearch();

    // --- cập nhật trạng thái tab button ---
    const tabs = [
        { el: tabFood, name: "food" },
        { el: tabDrink, name: "drink" },
        { el: tabCart, name: "cart" },
    ];
    tabs.forEach(t => {
        t.el.classList.toggle("tab-active", tab === t.name);
        t.el.classList.toggle("tab-inactive", tab !== t.name);
    });

    // --- hiển thị nội dung tương ứng ---
    foodTab.style.display = (tab === "food") ? "block" : "none";
    drinkTab.style.display = (tab === "drink") ? "block" : "none";
    cartTab.style.display = (tab === "cart") ? "block" : "none";

    // --- điều chỉnh hiển thị & bố cục search bar ---
    searchBar.style.display = (tab !== "cart") ? "flex" : "none";

    if (tab === "food") {
        indexInput.style.display = "block";
        indexInput.style.flex = "2";
        searchInput.style.flex = "8";
    } else if (tab === "drink") {
        indexInput.style.display = "none";
        searchInput.style.flex = "10";
    }

    // --- render nội dung ---
    const renderMap = {
        food: () => renderFood(storedFoods),
        drink: () => renderDrinks(storedDrinks),
        cart: () => renderCart(),
    };
    renderMap[tab]?.();
}

//Click
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.style.display =
        menuDropdown.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
        menuDropdown.style.display = "none";
    }
});

menuDropdown.addEventListener("click", (e) => {
    if (!e.target.classList.contains("menu-item")) return;
    const action = e.target.dataset.action;
    menuDropdown.style.display = "none";

    switch (action) {
        case "updateFood":
            openUpdatePopup("Food");
            break;
        case "updateDrink":
            openUpdatePopup("Drink");
            break;
        case "history":
            openHistoryPopup();
            break;
        case "about":
            showToast("ℹ️ This ordering system by Khieudeptrai 😎");
            break;
    }
});

tabFood.onclick = () => activate("food");
tabDrink.onclick = () => activate("drink");
tabCart.onclick = () => activate("cart");

/* ---------- Confirm & Clear when Done ---------- */
btnDone.onclick = () => {
    if (confirm("Are you sure you want to complete the order?")) {
        const total = cartItems.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
        const newOrder = {
            id: new Date().toISOString(),
            items: cartItems.map(i => ({ ...i })), // clone lại
            note: cartNote,
            total,
        };
        // ✅ lưu vào localStorage
        const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        history.push(newOrder);
        localStorage.setItem("orderHistory", JSON.stringify(history));

        clearData();
        showToast("Order completed successfully");
    }
};

btnClearSearch.onclick = () => {
    resetSearch();

    // Reset list
    if (activeTab === "food") renderFood(storedFoods);
    else if (activeTab === "drink") renderDrinks(storedDrinks);
};

// Sự kiện mở popup
btnNote.addEventListener("click", () => {
    notePopup.style.display = "flex";
    noteInput.value = cartNote; // hiển thị ghi chú cũ nếu có
    noteInput.focus();
});

// Lưu ghi chú
saveNote.addEventListener("click", () => {
    cartNote = noteInput.value.trim();
    saveNoteToLocal();
    notePopup.style.display = "none";
    if (activeTab === "cart") renderCart();
});

// Hủy popup
cancelNote.addEventListener("click", () => {
    notePopup.style.display = "none";
});

closeHistory.addEventListener("click", () => {
    historyPopup.style.display = "none";
});

clearHistory.addEventListener("click", () => {
    if (confirm("⚠️ Are you sure you want to delete all order history?")) {
        localStorage.removeItem("orderHistory");
        document.getElementById("historyList").innerHTML =
            `<div style="text-align:center; color:#6b7280;">No orders yet.</div>`;
        clearHistory.style.display = "none";
    }
});

addItem.onclick = () => {
    if (editingType === "Food") {
        editingData.push({
            index: "",
            name: "",
            nameVN: "",
            price: 0,
        });
    } else {
        editingData.push({
            category: "",
            name: "",
            nameVN: "",
            options: [],
        });
    }
    renderUpdateList(editingData);

    setTimeout(() => {
        const allItems = updateList.querySelectorAll(".update-item");
        const lastItem = allItems[allItems.length - 1];
        if (lastItem) {
            const firstInput = lastItem.querySelector("input");
            if (firstInput) {
                firstInput.focus();
                firstInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, 0);

};

searchItem.oninput = () => {
    const q = searchItem.value.toLowerCase();
    const filtered = editingData.filter(
        (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.nameVN && i.nameVN.toLowerCase().includes(q))
    );
    renderUpdateList(filtered);
};

cancelUpdate.onclick = () => (updatePopup.style.display = "none");

saveUpdate.onclick = () => {
    // 🔹 Clear previous highlights
    const wrappers = updateList.querySelectorAll(".update-item-wrapper");
    wrappers.forEach((w) => (w.style.background = ""));

    let warningMsg = "";
    const invalidItems = [];

    if (editingType === "Food") {
        // 🍱 Validate food items
        editingData.forEach((item) => {
            const missingFields = [];
            if (!item.name || item.name.trim() === "") missingFields.push("name");
            if (!item.price || item.price <= 0) missingFields.push("price");
            if (missingFields.length > 0) {
                invalidItems.push({
                    ...item,
                    reason: `Missing ${missingFields.join(", ")}`,
                });
            }
        });
    } else if (editingType === "Drink") {
        // ☕ Validate drink items
        editingData.forEach((item) => {
            const missingFields = [];
            if (!item.name || item.name.trim() === "") missingFields.push("name");
            if (!item.category || item.category.trim() === "")
                missingFields.push("category");

            if (missingFields.length > 0) {
                invalidItems.push({
                    ...item,
                    reason: `Missing ${missingFields.join(", ")}`,
                });
            }

            if (!item.options || item.options.length === 0) {
                invalidItems.push({ ...item, reason: "No options defined" });
            } else {
                const badOpts = item.options.filter(
                    (opt) =>
                        !opt.label ||
                        opt.label.trim() === "" ||
                        !opt.price ||
                        isNaN(opt.price) ||
                        opt.price <= 0
                );

                if (badOpts.length > 0) {
                    invalidItems.push({
                        ...item,
                        reason: `${badOpts.length} option(s) missing label or price`,
                    });
                }
            }
        });
    }

    // 🔹 Show warnings & highlight invalid items
    if (invalidItems.length > 0) {
        warningMsg =
            "⚠️ Some items have missing or invalid data:\n\n" +
            invalidItems
                .map(
                    (i, idx) =>
                        `${idx + 1}. ${i.name || "(Unnamed)"} — ${i.reason}`
                )
                .join("\n");

        // Highlight problematic rows
        invalidItems.forEach((item, idx) => {
            const wrappers = [...updateList.querySelectorAll(".update-item-wrapper")];

            let target = null;

            // tìm wrapper chứa input có value khớp với item.name
            for (const w of wrappers) {
                const nameInput = w.querySelector('input[data-field="name"]');
                if (nameInput && nameInput.value === item.name) {
                    target = w;
                    break;
                }
            }
            if (target) {
                target.style.background = "#f89090ff";
            }
        });
        // 🟡 Ask user if they still want to save
        const confirmSave = confirm(
            warningMsg + "\n\nYou should review and fix the highlighted items before saving.\nDo you still want to save these changes?"
        );
        if (!confirmSave) return;
    }

    showToast(`${editingType} updated successfully!`);
    updatePopup.style.display = "none";
    if (editingType === "Food") {
        localStorage.setItem("FoodMenu", JSON.stringify(editingData));
        storedFoods = editingData;
        renderFood(storedFoods);
    }
    else {
        localStorage.setItem("DrinkMenu", JSON.stringify(editingData));
        storedDrinks = editingData;
        renderDrinks(storedDrinks);
    }
}

/* ---------- Search bindings ---------- */
searchInput.oninput = filterActive;
indexInput.oninput = filterActive;

initMenuStorage();

renderFood(storedFoods);
renderDrinks(storedDrinks);
renderCart();