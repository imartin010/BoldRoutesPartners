// Test script to verify delivery filter is working
// Run this in your browser console on the inventory page

console.log('=== TESTING DELIVERY FILTER ===');

// Test 1: Check if ready_by_year filter is being applied
console.log('Current filters:', window.filters || 'No filters object found');

// Test 2: Check if ready_by column exists in properties
if (window.properties && window.properties.length > 0) {
  console.log('First property ready_by:', window.properties[0].ready_by);
  console.log('Properties with ready_by:', window.properties.filter(p => p.ready_by).length);
  console.log('Properties without ready_by:', window.properties.filter(p => !p.ready_by).length);
  
  // Show sample ready_by values
  const uniqueReadyBy = [...new Set(window.properties.map(p => p.ready_by).filter(Boolean))];
  console.log('Unique ready_by values:', uniqueReadyBy);
} else {
  console.log('No properties loaded yet');
}

// Test 3: Check filter options
if (window.filterOptions) {
  console.log('Filter options readyByYearOptions:', window.filterOptions.readyByYearOptions);
} else {
  console.log('No filter options loaded yet');
}

// Test 4: Simulate delivery filter
console.log('=== SIMULATING DELIVERY FILTER ===');
const testFilter = { ready_by_year: '2025' };
console.log('Test filter:', testFilter);

// Test 5: Check if the filter would work
if (window.properties && window.properties.length > 0) {
  const filtered = window.properties.filter(p => {
    const readyBy = p.ready_by || '';
    return readyBy.toLowerCase().includes('2025');
  });
  console.log('Properties matching 2025:', filtered.length);
  console.log('Sample matches:', filtered.slice(0, 3).map(p => ({ id: p.id, ready_by: p.ready_by })));
}




