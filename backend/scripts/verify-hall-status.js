const axios = require('axios');

async function verifyHallStatus() {
  try {
    console.log('Fetching dining halls from backend...\n');
    const response = await axios.get('http://localhost:3000/api/dining/halls');
    const halls = response.data;
    
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`Current time: ${currentDay} ${currentTime}\n`);
    console.log('='.repeat(80));
    console.log('DINING HALL STATUS VERIFICATION');
    console.log('='.repeat(80));
    
    const openHalls = halls.filter(h => h.isOpen === true);
    const closedHalls = halls.filter(h => h.isOpen === false);
    const undefinedHalls = halls.filter(h => h.isOpen === undefined || h.isOpen === null);
    
    console.log(`\n✅ OPEN HALLS (${openHalls.length}):`);
    console.log('-'.repeat(80));
    openHalls.forEach((h, idx) => {
      console.log(`${idx + 1}. ${h.name}`);
      console.log(`   Unit ID: ${h.cbordUnitId} | Status: ${h.isOpen}`);
    });
    
    console.log(`\n❌ CLOSED HALLS (${closedHalls.length}):`);
    console.log('-'.repeat(80));
    closedHalls.forEach((h, idx) => {
      console.log(`${idx + 1}. ${h.name}`);
      console.log(`   Unit ID: ${h.cbordUnitId} | Status: ${h.isOpen}`);
    });
    
    if (undefinedHalls.length > 0) {
      console.log(`\n❓ UNDEFINED STATUS (${undefinedHalls.length}):`);
      console.log('-'.repeat(80));
      undefinedHalls.forEach((h, idx) => {
        console.log(`${idx + 1}. ${h.name}`);
        console.log(`   Unit ID: ${h.cbordUnitId} | Status: ${h.isOpen}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY:');
    console.log(`  Total halls: ${halls.length}`);
    console.log(`  ✅ Open: ${openHalls.length}`);
    console.log(`  ❌ Closed: ${closedHalls.length}`);
    console.log(`  ❓ Undefined: ${undefinedHalls.length}`);
    
    // Check for common dining halls that should typically be open on weekdays
    console.log('\n' + '='.repeat(80));
    console.log('NOTABLE HALLS STATUS:');
    console.log('-'.repeat(80));
    
    const notableHalls = [
      { name: 'Rand Dining Center', id: 1, note: 'Main dining hall' },
      { name: 'The Commons Dining Center', id: 2, note: 'Main dining hall' },
      { name: 'The Kitchen at Kissam', id: 3, note: 'Main dining hall' },
      { name: 'Vandy Blenz', id: 5, note: 'Cafe - typically open weekdays' },
      { name: 'Grins Vegetarian Cafe', id: 9, note: 'Cafe - typically open weekdays' },
    ];
    
    for (const notable of notableHalls) {
      const hall = halls.find(h => h.cbordUnitId === notable.id);
      if (hall) {
        const status = hall.isOpen === true ? '✅ OPEN' : hall.isOpen === false ? '❌ CLOSED' : '❓ UNKNOWN';
        console.log(`${status} - ${hall.name}`);
        console.log(`   ${notable.note}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('NOTE: If major dining halls show as closed on a weekday, this might be');
    console.log('      accurate if they have limited hours or are closed on Fridays.');
    console.log('      Verify by checking the actual NetNutrition website.');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

verifyHallStatus();

