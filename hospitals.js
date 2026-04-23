document.addEventListener('DOMContentLoaded', () => {
    const hospitalList = document.getElementById('hospital-list');
    const searchInput = document.getElementById('hospital-search');
    const stockFilter = document.getElementById('stock-filter');

    function renderHospitals(data) {
        hospitalList.innerHTML = '';
        data.forEach(hospital => {
            const card = document.createElement('div');
            card.className = 'hospital-card glass-form';
            
            const bloodPills = Object.entries(hospital.stock)
                .map(([type, units]) => {
                    const isCritical = units < 10;
                    return `<div class="blood-pill ${isCritical ? 'critical' : ''}">${type} <span>${units} Units</span></div>`;
                }).join('');

            card.innerHTML = `
                <div class="card-header">
                    <div class="hospital-status ${hospital.status}"></div>
                    <h3>${hospital.name}</h3>
                </div>
                <p class="location">📍 ${hospital.location}</p>
                <div class="stock-info">
                    ${bloodPills}
                </div>
                <div class="card-footer">
                    <span class="stock-status ${hospital.theme}">${getStatusText(hospital.theme)}</span>
                    <button class="btn-primary small">Request Transfer</button>
                </div>
            `;
            hospitalList.appendChild(card);
        });
    }

    function getStatusText(theme) {
        switch(theme) {
            case 'good': return 'Full Stock';
            case 'warning': return 'Normal';
            case 'critical': return 'Low Stock';
            default: return 'Stable';
        }
    }

    function filterHospitals() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = stockFilter.value;

        const filtered = hospitalData.filter(hospital => {
            const matchesSearch = hospital.name.toLowerCase().includes(searchTerm) || 
                                hospital.location.toLowerCase().includes(searchTerm);
            
            let matchesStock = true;
            if (filterValue === 'high') {
                matchesStock = hospital.theme === 'good';
            } else if (filterValue === 'low') {
                matchesStock = hospital.theme === 'critical' || hospital.theme === 'warning';
            }

            return matchesSearch && matchesStock;
        });

        renderHospitals(filtered);
    }

    searchInput.addEventListener('input', filterHospitals);
    stockFilter.addEventListener('change', filterHospitals);

    // Initial render
    renderHospitals(hospitalData);
});
