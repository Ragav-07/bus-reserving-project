// BusReserve Pro — Full Feature Script
// Tamil Nadu & India Bus Booking Platform

document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();
    initDateInput();
    initNavbar();
    initMobileMenu();
    initCityDropdowns();
    checkLoginState();
});

// ============================================================
// DATA
// ============================================================

const CITIES = {
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Tirunelveli', 'Vellore', 'Erode',
        'Thanjavur', 'Dindigul', 'Kanyakumari', 'Ooty', 'Kodaikanal', 'Pondicherry', 'Nagercoil',
        'Hosur', 'Tiruppur', 'Karur', 'Cuddalore', 'Thoothukudi', 'Sivakasi', 'Namakkal',
        'Krishnagiri', 'Dharmapuri', 'Ramanathapuram', 'Virudhunagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum', 'Tumkur'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
    'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Nellore'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'],
    'Delhi': ['Delhi', 'Gurgaon', 'Noida'],
    'Others': ['Kolkata', 'Ahmedabad', 'Jaipur', 'Goa', 'Chandigarh', 'Bhubaneswar']
};

const BUSES = [
    { id: 'KPN001', name: 'KPN Travels', type: 'AC Sleeper (2+1)', subtype: 'sleeper', ac: true, departure: '21:00', arrival: '05:30+1', duration: '8h 30m', basePrice: 950, rows: 9, layout: '2+1', amenities: ['ac', 'charging', 'water', 'blanket'], rating: 4.5, reviews: 2341 },
    { id: 'SRS001', name: 'SRS Travels', type: 'AC Semi-Sleeper (2+2)', subtype: 'semisleeper', ac: true, departure: '22:30', arrival: '06:30+1', duration: '8h', basePrice: 650, rows: 9, layout: '2+2', amenities: ['ac', 'charging', 'water'], rating: 4.2, reviews: 1876 },
    { id: 'SETC01', name: 'SETC', type: 'Non-AC Sleeper (2+1)', subtype: 'sleeper', ac: false, departure: '20:00', arrival: '04:30+1', duration: '8h 30m', basePrice: 480, rows: 9, layout: '2+1', amenities: ['charging', 'water'], rating: 3.8, reviews: 987 },
    { id: 'PRV001', name: 'Parveen Travels', type: 'AC Sleeper (2+1)', subtype: 'sleeper', ac: true, departure: '23:00', arrival: '07:00+1', duration: '8h', basePrice: 880, rows: 9, layout: '2+1', amenities: ['ac', 'charging', 'water', 'blanket', 'snack'], rating: 4.6, reviews: 3102 },
    { id: 'GRN001', name: 'Greenline Travels', type: 'AC Semi-Sleeper (2+2)', subtype: 'semisleeper', ac: true, departure: '19:30', arrival: '03:30+1', duration: '8h', basePrice: 590, rows: 9, layout: '2+2', amenities: ['ac', 'charging'], rating: 4.0, reviews: 654 },
    { id: 'VRL001', name: 'VRL Travels', type: 'AC Seater (2+2)', subtype: 'seater', ac: true, departure: '18:00', arrival: '02:00+1', duration: '8h', basePrice: 450, rows: 10, layout: '2+2', amenities: ['ac', 'charging', 'water'], rating: 4.1, reviews: 1234 },
    { id: 'OBT001', name: 'Orange Travels', type: 'AC Sleeper (2+1)', subtype: 'sleeper', ac: true, departure: '20:30', arrival: '05:00+1', duration: '8h 30m', basePrice: 820, rows: 9, layout: '2+1', amenities: ['ac', 'charging', 'water', 'blanket'], rating: 4.3, reviews: 1567 },
    { id: 'TNSTC', name: 'TNSTC', type: 'Non-AC Seater (2+2)', subtype: 'seater', ac: false, departure: '06:00', arrival: '14:30', duration: '8h 30m', basePrice: 280, rows: 12, layout: '2+2', amenities: ['water'], rating: 3.5, reviews: 432 },
];

const AMENITY_LABELS = {
    ac: { label: 'AC', icon: '❄️' },
    charging: { label: 'Charging', icon: '🔌' },
    water: { label: 'Water', icon: '💧' },
    blanket: { label: 'Blanket', icon: '🛏️' },
    snack: { label: 'Snacks', icon: '🍱' }
};

// Price multipliers by distance category
function getPriceMultiplier(from, to) {
    const longRoutes = ['mumbai', 'delhi', 'kolkata', 'hyderabad', 'visakhapatnam'];
    const medRoutes = ['bangalore', 'mysore', 'kochi', 'thiruvananthapuram', 'chennai', 'madurai', 'coimbatore'];
    const f = from.toLowerCase(), t = to.toLowerCase();
    if (longRoutes.includes(f) || longRoutes.includes(t)) return 2.2;
    if (medRoutes.includes(f) && medRoutes.includes(t)) return 1.0;
    return 0.75;
}

// App state
const STATE = {
    user: null,
    search: null,
    busResults: [],
    selectedBus: null,
    selectedSeats: [],
    passengerInfo: [],
    contactInfo: {},
    paymentMethod: null,
    pnr: null
};

// ============================================================
// AUTH
// ============================================================

function openModal(id) {
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    setTimeout(() => lucide.createIcons(), 50);
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function switchToRegister() {
    closeModal('loginModal');
    openModal('registerModal');
}

function switchToLogin() {
    closeModal('registerModal');
    openModal('loginModal');
}

function togglePassword(id) {
    const inp = document.getElementById(id);
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.classList.add('hidden');

    if (!email || !pass) {
        errEl.textContent = 'Please enter email and password.';
        errEl.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: pass })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            STATE.user = { name: data.user.name, email: data.user.email, phone: data.user.phone };
            saveLoginState();
            updateNavForUser();
            closeModal('loginModal');
            showNotification(`Welcome back, ${data.user.name}! 👋`, 'success');
        } else {
            errEl.textContent = data.message || 'Invalid credentials.';
            errEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Login Error:", error);
        errEl.textContent = 'Server is unreachable. Make sure backend is running.';
        errEl.classList.remove('hidden');
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    const errEl = document.getElementById('regError');
    errEl.classList.add('hidden');

    if (!name || !email || !phone || !pass || !confirm) {
        errEl.textContent = 'Please fill all fields.';
        errEl.classList.remove('hidden');
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        errEl.textContent = 'Please enter a valid 10-digit mobile number.';
        errEl.classList.remove('hidden');
        return;
    }
    if (pass.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.classList.remove('hidden');
        return;
    }
    if (pass !== confirm) {
        errEl.textContent = 'Passwords do not match.';
        errEl.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, phone, password: pass })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            STATE.user = { name: data.user.name, email: data.user.email, phone: data.user.phone };
            saveLoginState();
            updateNavForUser();
            closeModal('registerModal');
            showNotification(`Account created! Welcome, ${data.user.name}! 🎉`, 'success');
        } else {
            errEl.textContent = data.message || 'Registration failed.';
            errEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Register Error:", error);
        errEl.textContent = 'Server is unreachable. Make sure backend is running.';
        errEl.classList.remove('hidden');
    }
}

function handleLogout() {
    STATE.user = null;
    localStorage.removeItem('brp_user');
    const guestBtns = document.getElementById('guestButtons');
    const userMenu = document.getElementById('userMenu');
    guestBtns.classList.remove('hidden');
    userMenu.classList.remove('flex');
    userMenu.classList.add('hidden');
    showNotification('Logged out successfully.', 'info');
}

function updateNavForUser() {
    const guestBtns = document.getElementById('guestButtons');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    guestBtns.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userMenu.classList.add('flex');
    userAvatar.textContent = STATE.user.name.charAt(0).toUpperCase();
    userName.textContent = STATE.user.name;
}

function saveLoginState() {
    localStorage.setItem('brp_user', JSON.stringify(STATE.user));
}

function checkLoginState() {
    const saved = localStorage.getItem('brp_user');
    if (saved) {
        STATE.user = JSON.parse(saved);
        updateNavForUser();
    }
}

// ============================================================
// CITY DROPDOWNS
// ============================================================

function initCityDropdowns() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.city-dropdown-wrapper')) {
            document.querySelectorAll('.city-dropdown').forEach(d => d.classList.add('hidden'));
        }
    });
}

function buildDropdown(containerId, exclude) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const filter = document.getElementById(containerId.replace('Dropdown', 'City')).value.toLowerCase();

    Object.entries(CITIES).forEach(([state, cities]) => {
        const filtered = cities.filter(c => !exclude || c !== exclude)
            .filter(c => !filter || c.toLowerCase().includes(filter));
        if (!filtered.length) return;

        const stateLabel = document.createElement('div');
        stateLabel.className = 'state-label';
        stateLabel.textContent = state;
        container.appendChild(stateLabel);

        filtered.forEach(city => {
            const opt = document.createElement('div');
            opt.className = 'city-option';
            opt.innerHTML = `<span class="city-dot"></span>${city}`;
            opt.addEventListener('click', () => {
                const inputId = containerId.replace('Dropdown', 'City');
                document.getElementById(inputId).value = city;
                container.classList.add('hidden');
            });
            container.appendChild(opt);
        });
    });

    if (!container.children.length) {
        container.innerHTML = '<div class="city-option text-gray-500">No cities found</div>';
    }
}

function showDropdown(dropdownId) {
    const exclude = dropdownId === 'toDropdown' ? document.getElementById('fromCity').value : null;
    buildDropdown(dropdownId, exclude);
    document.getElementById(dropdownId).classList.remove('hidden');
}

function filterCities(inputId, dropdownId) {
    const exclude = dropdownId === 'toDropdown' ? document.getElementById('fromCity').value : null;
    buildDropdown(dropdownId, exclude);
    document.getElementById(dropdownId).classList.remove('hidden');
}

function swapCities() {
    const from = document.getElementById('fromCity');
    const to = document.getElementById('toCity');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

// ============================================================
// SEARCH BUSES
// ============================================================

function searchBuses() {
    const from = document.getElementById('fromCity').value.trim();
    const to = document.getElementById('toCity').value.trim();
    const date = document.getElementById('journeyDate').value;
    const passengers = parseInt(document.getElementById('passengerCount').value);
    const errEl = document.getElementById('searchError');
    errEl.classList.add('hidden');

    if (!from) { errEl.textContent = 'Please select departure city.'; errEl.classList.remove('hidden'); return; }
    if (!to) { errEl.textContent = 'Please select destination city.'; errEl.classList.remove('hidden'); return; }
    if (from === to) { errEl.textContent = 'Origin and destination cannot be the same.'; errEl.classList.remove('hidden'); return; }
    if (!date) { errEl.textContent = 'Please select a travel date.'; errEl.classList.remove('hidden'); return; }

    const btn = document.getElementById('searchBtn');
    btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Searching...';
    btn.disabled = true;
    lucide.createIcons();

    STATE.search = { from, to, date, passengers };
    const multiplier = getPriceMultiplier(from, to);

    // Generate results with randomized seat availability
    STATE.busResults = BUSES.map(bus => {
        const price = Math.round(bus.basePrice * multiplier / 10) * 10;
        const totalSeats = bus.layout === '2+1' ? bus.rows * 3 : bus.rows * 4;
        const booked = Math.floor(Math.random() * (totalSeats * 0.6));
        return { ...bus, price, totalSeats, availableSeats: totalSeats - booked, bookedSeatNums: generateBookedSeats(bus, booked) };
    }).filter(b => b.availableSeats >= passengers);

    setTimeout(() => {
        btn.innerHTML = '<i data-lucide="search" class="w-5 h-5"></i> Search Buses';
        btn.disabled = false;
        lucide.createIcons();
        renderResults();
        document.getElementById('busResults').classList.remove('hidden');
        document.getElementById('busResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1200);
}

function generateBookedSeats(bus, count) {
    const all = getAllSeatNumbers(bus);
    const shuffled = all.sort(() => 0.5 - Math.random());
    return new Set(shuffled.slice(0, count));
}

function getAllSeatNumbers(bus) {
    const seats = [];
    if (bus.layout === '2+1') {
        for (let r = 1; r <= bus.rows; r++) {
            seats.push(`L${r}A`, `L${r}B`, `U${r}A`);
        }
    } else {
        for (let r = 1; r <= bus.rows; r++) {
            seats.push(`${r}A`, `${r}B`, `${r}C`, `${r}D`);
        }
    }
    return seats;
}

function renderResults() {
    const { from, to, date, passengers } = STATE.search;
    const displayDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });

    document.getElementById('resultsTitle').textContent = `${from} → ${to}`;
    document.getElementById('resultsSubtitle').textContent = `${displayDate} · ${passengers} Passenger${passengers > 1 ? 's' : ''} · ${STATE.busResults.length} buses found`;

    applyFilters();
}

function applyFilters() {
    const filterType = document.getElementById('filterType').value;
    const sortBy = document.getElementById('sortBy').value;

    let results = [...STATE.busResults];

    if (filterType === 'ac') results = results.filter(b => b.ac);
    else if (filterType === 'sleeper') results = results.filter(b => b.subtype === 'sleeper');
    else if (filterType === 'semisleeper') results = results.filter(b => b.subtype === 'semisleeper');
    else if (filterType === 'seater') results = results.filter(b => b.subtype === 'seater');

    if (sortBy === 'price-low') results.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') results.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else results.sort((a, b) => a.departure.localeCompare(b.departure));

    const listEl = document.getElementById('busList');
    if (!results.length) {
        listEl.innerHTML = '<div class="text-center py-16 text-gray-400"><i data-lucide="search-x" class="w-16 h-16 mx-auto mb-4 opacity-30"></i><p class="text-lg">No buses match your filters</p></div>';
        lucide.createIcons();
        return;
    }

    listEl.innerHTML = results.map(bus => renderBusCard(bus)).join('');
    lucide.createIcons();
}

function renderBusCard(bus) {
    const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(bus.rating) ? '★' : (i < bus.rating ? '½' : '☆')).join('');
    const amenityChips = bus.amenities.map(a => {
        const am = AMENITY_LABELS[a];
        return `<span class="amenity-chip">${am.icon} ${am.label}</span>`;
    }).join('');

    const avail = bus.availableSeats;
    const availColor = avail < 5 ? 'text-red-400' : avail < 10 ? 'text-yellow-400' : 'text-green-400';

    return `
    <div class="bus-result-card p-5 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
            <!-- Operator Info -->
            <div class="md:w-48 flex-shrink-0">
                <div class="flex items-center gap-3 mb-1">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 font-bold text-sm text-white">
                        ${bus.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">${bus.name}</p>
                        <p class="text-xs text-gray-400">${bus.type}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1 text-xs mt-1">
                    <span class="rating-stars">${stars.substring(0, 5)}</span>
                    <span class="text-gray-400">${bus.rating} (${bus.reviews.toLocaleString('en-IN')})</span>
                </div>
            </div>

            <!-- Journey Info -->
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-white">${bus.departure}</p>
                        <p class="text-xs text-gray-500">${STATE.search.from}</p>
                    </div>
                    <div class="flex-1 flex flex-col items-center gap-0.5">
                        <p class="text-xs text-gray-500">${bus.duration}</p>
                        <div class="w-full h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 relative">
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <p class="text-xs text-gray-600">${bus.id.startsWith('SETC') ? 'SETC' : 'Private'}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-white">${bus.arrival.replace('+1', '')}<span class="text-xs text-gray-500">${bus.arrival.includes('+1') ? ' +1' : ''}</span></p>
                        <p class="text-xs text-gray-500">${STATE.search.to}</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-1">${amenityChips}</div>
            </div>

            <!-- Price & Book -->
            <div class="md:text-right flex-shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                <div>
                    <p class="text-xs text-gray-400">Per seat</p>
                    <p class="text-2xl font-bold text-white">₹${bus.price.toLocaleString('en-IN')}</p>
                    <p class="text-xs ${availColor} font-medium">${avail} seats left</p>
                </div>
                <button onclick="openSeatSelection('${bus.id}')"
                    class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                    Book Now →
                </button>
            </div>
        </div>
    </div>`;
}

// ============================================================
// SEAT SELECTION
// ============================================================

function openSeatSelection(busId) {
    STATE.selectedBus = STATE.busResults.find(b => b.id === busId);
    STATE.selectedSeats = [];

    document.getElementById('seatBusName').textContent = `${STATE.selectedBus.name} · ${STATE.selectedBus.type}`;
    renderSeatMap();
    updateSeatInfo();

    openModal('seatModal');
}

function renderSeatMap() {
    const bus = STATE.selectedBus;
    const container = document.getElementById('seatMap');
    container.innerHTML = '';

    if (bus.layout === '2+1') {
        renderSleeperMap(container, bus);
    } else {
        renderSeaterMap(container, bus);
    }
}

function renderSleeperMap(container, bus) {
    // Lower deck
    const lowerLabel = document.createElement('p');
    lowerLabel.className = 'text-xs font-semibold text-gray-400 self-start mb-1 uppercase tracking-wider';
    lowerLabel.textContent = '— Lower Berth —';
    container.appendChild(lowerLabel);

    for (let r = 1; r <= bus.rows; r++) {
        const row = document.createElement('div');
        row.className = 'seat-row';

        const rowNum = document.createElement('span');
        rowNum.className = 'row-num';
        rowNum.textContent = r;
        row.appendChild(rowNum);

        // Left 2 seats
        ['A', 'B'].forEach(s => {
            const seatId = `L${r}${s}`;
            row.appendChild(createSeat(seatId, bus));
        });

        // Aisle
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        row.appendChild(aisle);

        // Right 1 seat
        const seatId = `U${r}A`;
        row.appendChild(createSeat(seatId, bus));

        container.appendChild(row);
    }

    // Upper deck label
    const upperLabel = document.createElement('p');
    upperLabel.className = 'text-xs font-semibold text-gray-400 self-start mt-3 mb-1 uppercase tracking-wider';
    upperLabel.textContent = '— Upper Berth (Right Side) —';
    container.appendChild(upperLabel);
}

function renderSeaterMap(container, bus) {
    for (let r = 1; r <= bus.rows; r++) {
        const row = document.createElement('div');
        row.className = 'seat-row';

        const rowNum = document.createElement('span');
        rowNum.className = 'row-num';
        rowNum.textContent = r;
        row.appendChild(rowNum);

        // Left 2 seats
        ['A', 'B'].forEach(s => {
            row.appendChild(createSeat(`${r}${s}`, bus));
        });

        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        row.appendChild(aisle);

        // Right 2 seats
        ['C', 'D'].forEach(s => {
            row.appendChild(createSeat(`${r}${s}`, bus));
        });

        container.appendChild(row);
    }
}

function createSeat(seatId, bus) {
    const isBooked = bus.bookedSeatNums.has(seatId);
    const el = document.createElement('div');
    el.className = `seat ${isBooked ? 'booked' : 'available'}`;
    el.dataset.seatId = seatId;
    el.innerHTML = `<span class="seat-icon">${bus.layout === '2+1' ? '🛏️' : '💺'}</span><span>${seatId}</span>`;
    el.title = isBooked ? 'Booked' : `Seat ${seatId} – ₹${bus.price.toLocaleString('en-IN')}`;

    if (!isBooked) {
        el.addEventListener('click', () => toggleSeat(seatId, el));
    }
    return el;
}

function toggleSeat(seatId, el) {
    const max = STATE.search.passengers;
    if (STATE.selectedSeats.includes(seatId)) {
        STATE.selectedSeats = STATE.selectedSeats.filter(s => s !== seatId);
        el.classList.remove('selected');
        el.classList.add('available');
    } else {
        if (STATE.selectedSeats.length >= max) {
            showNotification(`You can select max ${max} seat(s) for ${max} passenger(s).`, 'error');
            return;
        }
        STATE.selectedSeats.push(seatId);
        el.classList.remove('available');
        el.classList.add('selected');
    }
    updateSeatInfo();
}

function updateSeatInfo() {
    const infoEl = document.getElementById('seatInfo');
    const listEl = document.getElementById('selectedSeatsList');
    const totalEl = document.getElementById('selectedSeatsTotal');
    const nextBtn = document.getElementById('seatNextBtn');

    if (STATE.selectedSeats.length > 0) {
        infoEl.classList.remove('hidden');
        listEl.textContent = STATE.selectedSeats.join(', ');
        totalEl.textContent = `₹${(STATE.selectedSeats.length * STATE.selectedBus.price).toLocaleString('en-IN')}`;
        nextBtn.disabled = false;
    } else {
        infoEl.classList.add('hidden');
        nextBtn.disabled = true;
    }
}

// ============================================================
// PASSENGER DETAILS
// ============================================================

function proceedToPassengerDetails() {
    if (!STATE.selectedSeats.length) return;
    closeModal('seatModal');

    const formsContainer = document.getElementById('passengerForms');
    formsContainer.innerHTML = STATE.selectedSeats.map((seat, i) => `
        <div class="glass-card rounded-2xl p-4 border border-white/10">
            <h4 class="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <i data-lucide="user" class="w-4 h-4"></i> Passenger ${i + 1} — Seat ${seat}
            </h4>
            <div class="space-y-3">
                <input type="text" id="pax_name_${i}" placeholder="Full Name (as per ID)"
                    class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all">
                <div class="grid grid-cols-2 gap-3">
                    <input type="number" id="pax_age_${i}" placeholder="Age" min="1" max="100"
                        class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all">
                    <select id="pax_gender_${i}" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all [color-scheme:dark]">
                        <option value="" class="bg-slate-900">Gender</option>
                        <option value="M" class="bg-slate-900">Male</option>
                        <option value="F" class="bg-slate-900">Female</option>
                        <option value="O" class="bg-slate-900">Other</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');

    // Pre-fill email if logged in
    if (STATE.user) {
        document.getElementById('contactEmail').value = STATE.user.email || '';
    }

    lucide.createIcons();
    openModal('passengerModal');
}

function proceedToPayment() {
    const errEl = document.getElementById('passengerError');
    errEl.classList.add('hidden');

    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();

    if (!email || !phone) {
        errEl.textContent = 'Please fill contact information.';
        errEl.classList.remove('hidden');
        return;
    }

    STATE.passengerInfo = [];
    for (let i = 0; i < STATE.selectedSeats.length; i++) {
        const name = document.getElementById(`pax_name_${i}`).value.trim();
        const age = document.getElementById(`pax_age_${i}`).value.trim();
        const gender = document.getElementById(`pax_gender_${i}`).value;

        if (!name || !age || !gender) {
            errEl.textContent = `Please fill all details for Passenger ${i + 1}.`;
            errEl.classList.remove('hidden');
            return;
        }
        STATE.passengerInfo.push({ name, age, gender, seat: STATE.selectedSeats[i] });
    }

    STATE.contactInfo = { email, phone };
    closeModal('passengerModal');
    renderFareSummary();
    openModal('paymentModal');
}

// ============================================================
// PAYMENT
// ============================================================

function renderFareSummary() {
    const bus = STATE.selectedBus;
    const seats = STATE.selectedSeats;
    const baseFare = bus.price * seats.length;
    const gst = Math.round(baseFare * 0.05);
    const total = baseFare + gst;

    document.getElementById('fareSummary').innerHTML = `
        <h3 class="font-semibold mb-3 text-sm text-gray-300 uppercase tracking-wider">Fare Summary</h3>
        <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-400">${bus.name} (${seats.length} seat${seats.length > 1 ? 's' : ''})</span><span class="text-white">₹${baseFare.toLocaleString('en-IN')}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">GST (5%)</span><span class="text-white">₹${gst.toLocaleString('en-IN')}</span></div>
            <div class="border-t border-white/10 pt-2 flex justify-between font-bold"><span class="text-white">Total Amount</span><span class="text-orange-400 text-lg">₹${total.toLocaleString('en-IN')}</span></div>
        </div>
    `;

    const total2 = total;
    document.getElementById('payNowText').textContent = `Pay ₹${total2.toLocaleString('en-IN')}`;
}

function updatePaymentUI(method) {
    STATE.paymentMethod = method;
    const area = document.getElementById('paymentInputArea');

    if (method === 'upi') {
        area.innerHTML = `
            <div class="glass-card rounded-xl p-4 border border-white/10">
                <label class="block text-sm font-medium text-gray-400 mb-2">UPI ID</label>
                <div class="relative">
                    <i data-lucide="at-sign" class="absolute left-4 top-3.5 w-4 h-4 text-green-500"></i>
                    <input type="text" placeholder="yourname@upi" id="upiId"
                        class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all">
                </div>
                <div class="flex gap-3 mt-3 flex-wrap">
                    ${['GPay','PhonePe','Paytm','BHIM'].map(app => `<button type="button" onclick="document.getElementById('upiId').value='user@${app.toLowerCase()}'" class="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-green-500/20 hover:border-green-500/50 transition-all">${app}</button>`).join('')}
                </div>
            </div>`;
    } else if (method === 'card') {
        area.innerHTML = `
            <div class="glass-card rounded-xl p-4 border border-white/10 space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCard(this)"
                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-2">Expiry</label>
                        <input type="text" placeholder="MM/YY" maxlength="5" oninput="formatExpiry(this)"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-2">CVV</label>
                        <input type="password" placeholder="•••" maxlength="4"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all">
                    </div>
                </div>
                <input type="text" placeholder="Cardholder Name"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all">
            </div>`;
    } else if (method === 'netbanking') {
        const banks = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara'];
        area.innerHTML = `
            <div class="glass-card rounded-xl p-4 border border-white/10">
                <label class="block text-sm font-medium text-gray-400 mb-3">Select Your Bank</label>
                <div class="grid grid-cols-4 gap-2">
                    ${banks.map(b => `<button type="button" class="bank-btn px-2 py-3 text-xs rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all font-semibold text-gray-300 hover:text-white" onclick="selectBank(this,'${b}')">${b}</button>`).join('')}
                </div>
            </div>`;
    }

    lucide.createIcons();
}

function formatCard(inp) {
    let v = inp.value.replace(/\D/g, '').substring(0, 16);
    inp.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(inp) {
    let v = inp.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    inp.value = v;
}

function selectBank(btn, bank) {
    document.querySelectorAll('.bank-btn').forEach(b => b.classList.remove('bg-orange-500/30', 'border-orange-500', 'text-white'));
    btn.classList.add('bg-orange-500/30', 'border-orange-500', 'text-white');
}

function handlePayment() {
    if (!STATE.paymentMethod) {
        showNotification('Please select a payment method.', 'error');
        return;
    }

    const btn = document.getElementById('payNowBtn');
    btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...';
    btn.disabled = true;
    lucide.createIcons();

    setTimeout(() => {
        btn.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i> Payment Successful!';
        btn.className = btn.className.replace('from-orange-500 to-red-600', 'from-green-500 to-teal-600').replace('hover:from-orange-600 hover:to-red-700', '');

        STATE.pnr = generatePNR();

        setTimeout(() => {
            closeModal('paymentModal');
            renderTicket();
            openModal('ticketModal');
        }, 800);
    }, 2000);
}

function generatePNR() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ============================================================
// E-TICKET
// ============================================================

function renderTicket() {
    const bus = STATE.selectedBus;
    const { from, to, date } = STATE.search;
    const displayDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    const baseFare = bus.price * STATE.selectedSeats.length;
    const gst = Math.round(baseFare * 0.05);
    const total = baseFare + gst;
    const bookingTime = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const paxRows = STATE.passengerInfo.map((p, i) => `
        <tr class="border-t border-white/5">
            <td class="py-2 pr-4 text-sm text-white font-medium">${p.name}</td>
            <td class="py-2 pr-4 text-sm text-gray-400">${p.age} / ${p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
            <td class="py-2 text-sm font-bold text-orange-400">${p.seat}</td>
        </tr>`).join('');

    document.getElementById('ticketBody').innerHTML = `
        <!-- PNR & Journey -->
        <div class="mb-5">
            <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                    <p class="text-xs text-gray-400 uppercase tracking-wider">Booking Reference (PNR)</p>
                    <p class="text-2xl font-bold font-mono text-orange-400 tracking-widest">${STATE.pnr}</p>
                </div>
                ${renderQR(STATE.pnr)}
            </div>

            <!-- Route -->
            <div class="glass-card rounded-2xl p-4 border border-white/10 mb-4">
                <div class="flex items-center gap-4">
                    <div class="text-center flex-shrink-0">
                        <p class="text-2xl font-bold text-white">${bus.departure}</p>
                        <p class="font-semibold text-gray-300">${from}</p>
                        <p class="text-xs text-gray-500">Boarding</p>
                    </div>
                    <div class="flex-1 text-center">
                        <p class="text-xs text-gray-400 mb-1">${bus.duration}</p>
                        <div class="relative h-0.5 bg-gradient-to-r from-orange-500 to-blue-500">
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></div>
                            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">${displayDate}</p>
                    </div>
                    <div class="text-center flex-shrink-0">
                        <p class="text-2xl font-bold text-white">${bus.arrival.replace('+1', '')}</p>
                        <p class="font-semibold text-gray-300">${to}</p>
                        <p class="text-xs text-gray-500">${bus.arrival.includes('+1') ? 'Next Day' : 'Same Day'}</p>
                    </div>
                </div>
            </div>

            <!-- Bus Info -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="glass-card rounded-xl p-3 border border-white/10">
                    <p class="text-xs text-gray-400">Bus Operator</p>
                    <p class="font-bold text-white text-sm">${bus.name}</p>
                </div>
                <div class="glass-card rounded-xl p-3 border border-white/10">
                    <p class="text-xs text-gray-400">Bus Type</p>
                    <p class="font-bold text-white text-sm">${bus.type}</p>
                </div>
                <div class="glass-card rounded-xl p-3 border border-white/10">
                    <p class="text-xs text-gray-400">Seat(s)</p>
                    <p class="font-bold text-orange-400 text-sm">${STATE.selectedSeats.join(', ')}</p>
                </div>
                <div class="glass-card rounded-xl p-3 border border-white/10">
                    <p class="text-xs text-gray-400">Booked At</p>
                    <p class="font-bold text-white text-xs">${bookingTime}</p>
                </div>
            </div>
        </div>

        <!-- Dashed Divider -->
        <div class="ticket-divider my-5">
            <div class="ticket-circle-left"></div>
            <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 8px,transparent 8px,transparent 16px)"></div>
            <div class="ticket-circle-right"></div>
        </div>

        <!-- Passengers Table -->
        <div class="mb-4">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Passenger Details</p>
            <table class="w-full">
                <thead><tr class="text-xs text-gray-500 uppercase tracking-wider">
                    <th class="text-left pb-2 pr-4">Name</th><th class="text-left pb-2 pr-4">Age/Gender</th><th class="text-left pb-2">Seat</th>
                </tr></thead>
                <tbody>${paxRows}</tbody>
            </table>
        </div>

        <!-- Dashed Divider -->
        <div class="ticket-divider my-5">
            <div class="ticket-circle-left"></div>
            <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.15) 0,rgba(255,255,255,0.15) 8px,transparent 8px,transparent 16px)"></div>
            <div class="ticket-circle-right"></div>
        </div>

        <!-- Fare Breakup -->
        <div class="mb-4">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Fare Breakup</p>
            <div class="space-y-1.5 text-sm">
                <div class="flex justify-between"><span class="text-gray-400">Base Fare (${STATE.selectedSeats.length} × ₹${bus.price.toLocaleString('en-IN')})</span><span class="text-white">₹${baseFare.toLocaleString('en-IN')}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">GST (5%)</span><span class="text-white">₹${gst.toLocaleString('en-IN')}</span></div>
                <div class="flex justify-between border-t border-white/10 pt-2 font-bold"><span class="text-white">Total Paid</span><span class="text-green-400 text-base">₹${total.toLocaleString('en-IN')}</span></div>
            </div>
        </div>

        <!-- Contact -->
        <div class="glass-card rounded-xl p-3 border border-white/10 mb-4">
            <p class="text-xs text-gray-400 mb-1">Ticket sent to</p>
            <p class="text-sm text-white">${STATE.contactInfo.email} · +91 ${STATE.contactInfo.phone}</p>
        </div>

        <!-- Terms -->
        <div class="text-xs text-gray-500 space-y-1">
            <p>• Arrive at boarding point 15 minutes before departure.</p>
            <p>• Carry a valid government ID (Aadhaar/PAN/Voter ID) during travel.</p>
            <p>• Cancellation: Free before 48h · 25% before 24h · Non-refundable within 2h.</p>
            <p>• Helpline: 0422-222-2222 | support@busreservepro.in</p>
        </div>
    `;

    lucide.createIcons();
}

function renderQR(text) {
    // Simple SVG QR-like pattern (decorative)
    const size = 72;
    const cell = 6;
    let rects = '';
    const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let i = 0; i < size; i += cell) {
        for (let j = 0; j < size; j += cell) {
            const on = ((i * 13 + j * 7 + seed) % 3) < 2;
            if (on) rects += `<rect x="${i}" y="${j}" width="${cell - 1}" height="${cell - 1}" fill="white" rx="1"/>`;
        }
    }
    // Corner squares (standard QR feature)
    const corner = (x, y) => `<rect x="${x}" y="${y}" width="18" height="18" fill="white" rx="2"/>
        <rect x="${x+3}" y="${y+3}" width="12" height="12" fill="#0f172a" rx="1"/>
        <rect x="${x+6}" y="${y+6}" width="6" height="6" fill="white" rx="0.5"/>`;

    return `<div class="flex-shrink-0">
        <svg width="72" height="72" viewBox="0 0 72 72" class="qr-code-svg" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:8px;padding:4px">
            ${rects}${corner(0, 0)}${corner(54, 0)}${corner(0, 54)}
        </svg>
        <p class="text-xs text-center text-gray-500 mt-1">QR Code</p>
    </div>`;
}

function printTicket() {
    const bus = STATE.selectedBus;
    const { from, to, date } = STATE.search;
    const displayDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    const baseFare = bus.price * STATE.selectedSeats.length;
    const gst = Math.round(baseFare * 0.05);
    const total = baseFare + gst;

    const printContent = `
    <div class="ticket-print-wrapper" style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <div class="ticket-header-print" style="background:linear-gradient(135deg,#ea580c,#b91c1c);color:white;padding:20px 24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-size:22px;font-weight:bold;">🚌 BusReservePro</div>
                    <div style="font-size:12px;opacity:0.8;">Your Trusted Travel Partner · Tamil Nadu & India</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px;opacity:0.8;">BOOKING CONFIRMED</div>
                    <div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-top:4px;">✓ CONFIRMED</div>
                </div>
            </div>
        </div>
        <div class="ticket-body-print" style="padding:24px;background:white;">
            <div style="margin-bottom:20px;">
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">PNR Number</div>
                <div style="font-size:26px;font-weight:bold;color:#ea580c;letter-spacing:0.15em;font-family:monospace;">${STATE.pnr}</div>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                <div style="text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#111;">${bus.departure}</div>
                    <div style="font-size:16px;font-weight:600;color:#374151;">${from}</div>
                    <div style="font-size:11px;color:#9ca3af;">Boarding</div>
                </div>
                <div style="text-align:center;flex:1;padding:0 16px;">
                    <div style="font-size:12px;color:#6b7280;">${bus.duration}</div>
                    <div style="border-top:2px solid #ea580c;margin:8px 0;position:relative;">
                        <span style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:white;padding:0 8px;font-size:18px;">🚌</span>
                    </div>
                    <div style="font-size:12px;color:#6b7280;">${displayDate}</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#111;">${bus.arrival.replace('+1', '')}</div>
                    <div style="font-size:16px;font-weight:600;color:#374151;">${to}</div>
                    <div style="font-size:11px;color:#9ca3af;">${bus.arrival.includes('+1') ? 'Next Day' : 'Same Day'}</div>
                </div>
            </div>
            <hr style="border:none;border-top:1px dashed #d1d5db;margin:16px 0;" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div><div style="font-size:11px;color:#6b7280;">Bus Operator</div><div style="font-weight:600;color:#111;">${bus.name}</div></div>
                <div><div style="font-size:11px;color:#6b7280;">Bus Type</div><div style="font-weight:600;color:#111;">${bus.type}</div></div>
                <div><div style="font-size:11px;color:#6b7280;">Seat No(s)</div><div style="font-weight:700;color:#ea580c;">${STATE.selectedSeats.join(', ')}</div></div>
                <div><div style="font-size:11px;color:#6b7280;">Travel Date</div><div style="font-weight:600;color:#111;">${new Date(date).toLocaleDateString('en-IN')}</div></div>
            </div>
            <hr style="border:none;border-top:1px dashed #d1d5db;margin:16px 0;" />
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Passengers</div>
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead><tr style="background:#f9fafb;">
                        <th style="text-align:left;padding:6px 8px;color:#6b7280;font-weight:600;">Name</th>
                        <th style="text-align:left;padding:6px 8px;color:#6b7280;font-weight:600;">Age/Gender</th>
                        <th style="text-align:left;padding:6px 8px;color:#6b7280;font-weight:600;">Seat</th>
                    </tr></thead>
                    <tbody>${STATE.passengerInfo.map(p => `
                        <tr style="border-top:1px solid #f3f4f6;">
                            <td style="padding:6px 8px;font-weight:500;">${p.name}</td>
                            <td style="padding:6px 8px;color:#6b7280;">${p.age} / ${p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                            <td style="padding:6px 8px;font-weight:700;color:#ea580c;">${p.seat}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
            <hr style="border:none;border-top:1px dashed #d1d5db;margin:16px 0;" />
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">Fare Breakup</div>
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:4px;"><span>Base Fare (${STATE.selectedSeats.length} seat${STATE.selectedSeats.length > 1 ? 's' : ''})</span><span>₹${baseFare.toLocaleString('en-IN')}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:8px;"><span>GST (5%)</span><span>₹${gst.toLocaleString('en-IN')}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:bold;border-top:1px solid #e5e7eb;padding-top:8px;"><span>Total Paid</span><span style="color:#16a34a;">₹${total.toLocaleString('en-IN')}</span></div>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <div style="font-size:11px;color:#9ca3af;line-height:1.8;">
                <p>• Arrive at boarding point 15 minutes before departure. Carry a valid govt. ID (Aadhaar/PAN/Voter ID).</p>
                <p>• Cancellation: Free before 48h · 25% charge before 24h · Non-refundable within 2h of departure.</p>
                <p>• Support: 0422-222-2222 | support@busreservepro.in | Mon-Sun 6AM–10PM</p>
            </div>
        </div>
    </div>`;

    const printArea = document.getElementById('printArea');
    printArea.innerHTML = printContent;
    window.print();
}

// ============================================================
// QUICK BOOK (from route cards)
// ============================================================

function quickBookRoute(from, to) {
    document.getElementById('fromCity').value = from;
    document.getElementById('toCity').value = to;
    const today = new Date();
    today.setDate(today.getDate() + 1);
    document.getElementById('journeyDate').value = today.toISOString().split('T')[0];
    document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => searchBuses(), 300);
}

// ============================================================
// RESET
// ============================================================

function resetBooking() {
    STATE.selectedBus = null;
    STATE.selectedSeats = [];
    STATE.passengerInfo = [];
    STATE.contactInfo = {};
    STATE.paymentMethod = null;
    STATE.pnr = null;

    const payBtn = document.getElementById('payNowBtn');
    if (payBtn) {
        payBtn.innerHTML = '<i data-lucide="lock" class="w-5 h-5"></i><span id="payNowText">Pay Now</span>';
        payBtn.disabled = false;
        payBtn.className = payBtn.className.replace('from-green-500 to-teal-600', 'from-orange-500 to-red-600').replace('hover:from-orange-600 hover:to-red-700', 'hover:from-orange-600 hover:to-red-700');
    }
}

// ============================================================
// NAVBAR
// ============================================================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) navbar.classList.add('nav-scrolled');
        else navbar.classList.remove('nav-scrolled');

        if (currentScroll > lastScroll && currentScroll > 100) navbar.style.transform = 'translateY(-100%)';
        else navbar.style.transform = 'translateY(0)';

        lastScroll = currentScroll;
    });

    // Active nav links
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { if (pageYOffset >= s.offsetTop - 200) current = s.id; });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-orange-400');
            link.querySelector('span')?.classList.remove('w-full');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('text-orange-400');
                link.querySelector('span')?.classList.add('w-full');
            }
        });
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// MOBILE MENU
// ============================================================

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    let open = false;

    btn.addEventListener('click', () => {
        open = !open;
        if (open) {
            menu.classList.remove('hidden');
            setTimeout(() => menu.classList.add('active'), 10);
            btn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
        } else {
            menu.classList.remove('active');
            setTimeout(() => menu.classList.add('hidden'), 300);
            btn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
        }
        lucide.createIcons();
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            open = false;
            menu.classList.remove('active');
            setTimeout(() => menu.classList.add('hidden'), 300);
            btn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
            lucide.createIcons();
        });
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) btn.click(); });
}

// ============================================================
// DATE INPUT
// ============================================================

function initDateInput() {
    const dateInput = document.getElementById('journeyDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
}

// ============================================================
// NOTIFICATION
// ============================================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast fixed bottom-5 right-5 z-[200] px-6 py-4 rounded-xl glass-card border-l-4 shadow-2xl transform translate-y-20 opacity-0 transition-all duration-500 ${
        type === 'success' ? 'border-green-500' : type === 'error' ? 'border-red-500' : 'border-orange-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" class="w-5 h-5 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-orange-500'}"></i>
            <span class="text-white font-medium text-sm">${message}</span>
        </div>`;
    document.body.appendChild(notification);
    lucide.createIcons();

    setTimeout(() => notification.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.08 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.glass-card:not(.modal-box *)').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${i * 0.05}s`;
        observer.observe(el);
    });
});

console.log('🚌 BusReserve Pro – Tamil Nadu & India | Initialized');
