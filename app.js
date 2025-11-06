// Supabase Configuration
const SUPABASE_URL = 'https://sxhsqkyhflepeaexvqmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aHNxa3loZmxlcGVhZXh2cW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTUxNDMsImV4cCI6MjA3ODAzMTE0M30.s2EmGHQr8Ijrs71VHIlEXzagJrUDvOC4y-hY0wOkP0A';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let allPeople = [];
let filteredPeople = [];
let sortOrder = 'asc'; // 'asc' or 'desc'
let currentFilter = { letter: '', score: '', search: '' };

// DOM Elements
const peopleList = document.getElementById('peopleList');
const searchInput = document.getElementById('searchInput');
const letterFilter = document.getElementById('letterFilter');
const scoreFilter = document.getElementById('scoreFilter');
const sortBtn = document.getElementById('sortBtn');
const totalCount = document.getElementById('totalCount');
const avgScore = document.getElementById('avgScore');
const highestScore = document.getElementById('highestScore');

// Initial data (fallback if Supabase is not configured)
const initialData = [
    { name: 'Patato', score: 250 },
    { name: 'K', score: 240 },
    { name: 'Ami', score: 250 },
    { name: 'Mushroom', score: 120 },
    { name: 'Olvr', score: 295 },
    { name: 'Jin', score: 450 },
    { name: 'Yato', score: 480 },
    { name: 'Heeve', score: 260 },
    { name: 'Schrodinger', score: 290 },
    { name: 'Ren', score: 450 },
    { name: 'Yuta', score: 380 },
    { name: 'Bang Si', score: 160 },
    { name: 'Felecia', score: 130 },
    { name: 'Catch My Fade', score: 450 },
    { name: 'Nona', score: 280 },
    { name: 'Siri', score: 460 },
    { name: 'Addi', score: 330 },
    { name: 'Purr', score: 43 },
    { name: 'Buttercup', score: 200 },
    { name: 'Good Clown', score: 200 },
    { name: 'Gelii', score: 320 },
    { name: 'Kate', score: 420 },
    { name: 'Alex', score: 300 },
    { name: 'Wine', score: 350 },
    { name: 'Deo', score: 400 },
    { name: 'Tequila', score: 280 },
    { name: 'Belle', score: 200 },
    { name: 'Veronica', score: 300 },
    { name: 'Ligaya', score: 30 },
    { name: 'Maeve', score: 65 },
    { name: 'Popsmoke', score: 180 },
    { name: 'Doctor', score: 142 },
    { name: 'Beau', score: 240 },
    { name: 'M', score: 280 },
    { name: 'Kiana', score: 70 },
    { name: 'Demeter', score: 195 },
    { name: 'Elena', score: 120 },
    { name: 'Owwraytttt', score: 170 },
    { name: 'Uncle.yur', score: 30 },
    { name: 'Bobby', score: 350 },
    { name: 'Aqui', score: 450 },
    { name: 'Hoshi', score: 130 },
    { name: 'Tora', score: -100 },
    { name: 'Toe Sniffer', score: -20 },
    { name: 'Alexis', score: 140 },
    { name: 'Ursus', score: 70 },
    { name: 'Rick', score: 170 },
    { name: 'Pork Chops', score: 40 },
    { name: 'Jeanpaulgualtier', score: 67 },
    { name: 'Janice', score: -60 },
    { name: 'Zaine', score: 176 },
    { name: 'Thaven', score: 119 },
    { name: 'Kae', score: 138 },
    { name: 'Mica', score: 144 },
    { name: 'Omuamua', score: 151 },
    { name: 'Aint Inno', score: 182 },
    { name: 'Rof', score: 199 },
    { name: 'Meep', score: 160 },
    { name: 'Bumblebee', score: 121 },
    { name: 'Sia', score: 175 },
    { name: 'Robert', score: 142 },
    { name: 'Light', score: 108 },
    { name: 'Volker', score: 189 },
    { name: 'Pat', score: 134 },
    { name: 'Nyx', score: 178 },
    { name: 'Z (male)', score: 166 },
    { name: 'Dosii', score: 149 }
];

// Initialize
async function init() {
    // Check if Supabase is configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured. Using local data. See SETUP.md for instructions.');
        allPeople = initialData;
        filterPeople(); // Call filterPeople instead of renderPeople directly
        return;
    }

    try {
        await loadPeople();
    } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to local data
        allPeople = initialData;
        filterPeople();
    }
}

// Load people from Supabase
async function loadPeople() {
    try {
        const { data, error } = await supabase
            .from('people')
            .select('*')
            .eq('approved', true)
            .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            allPeople = data.map(p => ({ name: p.name, score: p.score }));
        } else {
            // If no data, use initial data
            allPeople = initialData;
        }

        filterPeople();
    } catch (error) {
        console.error('Error loading people:', error);
        throw error;
    }
}

// Render people list
function renderPeople() {
    if (filteredPeople.length === 0) {
        peopleList.innerHTML = '<div class="empty-state"><h3>No people found</h3><p>Try adjusting your filters</p></div>';
        return;
    }

    peopleList.innerHTML = filteredPeople.map(person => `
        <div class="person-card">
            <div class="person-name">${escapeHtml(person.name)}</div>
            <div class="person-score ${getScoreClass(person.score)}">
                ${person.score > 0 ? '+' : ''}${person.score}
            </div>
        </div>
    `).join('');
}

// Get score CSS class
function getScoreClass(score) {
    if (score > 0) return 'score-positive';
    if (score < 0) return 'score-negative';
    return 'score-neutral';
}

// Filter people
function filterPeople() {
    filteredPeople = [...allPeople];

    // Filter by search
    if (currentFilter.search) {
        const searchLower = currentFilter.search.toLowerCase();
        filteredPeople = filteredPeople.filter(p => 
            p.name.toLowerCase().includes(searchLower)
        );
    }

    // Filter by letter
    if (currentFilter.letter) {
        filteredPeople = filteredPeople.filter(p => 
            p.name.charAt(0).toUpperCase() === currentFilter.letter
        );
    }

    // Filter by score range
    if (currentFilter.score) {
        switch (currentFilter.score) {
            case 'negative':
                filteredPeople = filteredPeople.filter(p => p.score < 0);
                break;
            case 'low':
                filteredPeople = filteredPeople.filter(p => p.score >= 0 && p.score <= 100);
                break;
            case 'medium':
                filteredPeople = filteredPeople.filter(p => p.score > 100 && p.score <= 250);
                break;
            case 'high':
                filteredPeople = filteredPeople.filter(p => p.score > 250 && p.score <= 400);
                break;
            case 'very-high':
                filteredPeople = filteredPeople.filter(p => p.score > 400);
                break;
        }
    }

    // Sort
    filteredPeople.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    renderPeople();
    updateStats();
}

// Update statistics
function updateStats() {
    const people = filteredPeople.length > 0 ? filteredPeople : allPeople;
    
    totalCount.textContent = people.length;
    
    if (people.length > 0) {
        const avg = Math.round(people.reduce((sum, p) => sum + p.score, 0) / people.length);
        avgScore.textContent = avg > 0 ? `+${avg}` : avg;
        
        const highest = Math.max(...people.map(p => p.score));
        highestScore.textContent = highest > 0 ? `+${highest}` : highest;
    } else {
        avgScore.textContent = '0';
        highestScore.textContent = '0';
    }
}

// Toggle sort
function toggleSort() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    sortBtn.textContent = `Sort: ${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`;
    filterPeople();
}


// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    currentFilter.search = e.target.value;
    filterPeople();
});

letterFilter.addEventListener('change', (e) => {
    currentFilter.letter = e.target.value;
    filterPeople();
});

scoreFilter.addEventListener('change', (e) => {
    currentFilter.score = e.target.value;
    filterPeople();
});

sortBtn.addEventListener('click', toggleSort);

// Initialize on load
init();

