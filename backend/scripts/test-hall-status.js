const axios = require('axios');
const { parse } = require('node-html-parser');

const CBORD_BASE_URL = 'https://netnutrition.cbord.com/nn-prod/vucampusdining';

// Dining halls to test
const DINING_HALLS = [
  { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
  { id: 2, name: 'The Commons Dining Center', cbordUnitId: 2 },
  { id: 3, name: 'The Kitchen at Kissam', cbordUnitId: 3 },
  { id: 4, name: 'The Pub at Overcup Oak', cbordUnitId: 4 },
  { id: 5, name: 'Vandy Blenz', cbordUnitId: 5 },
  { id: 6, name: "Suzie's Food for Thought Cafe", cbordUnitId: 6 },
  { id: 7, name: "Suzie's Blair School of Music", cbordUnitId: 7 },
  { id: 8, name: "Suzie's MRB II", cbordUnitId: 8 },
  { id: 9, name: 'Grins Vegetarian Cafe', cbordUnitId: 9 },
  { id: 10, name: "Suzie's Featheringill", cbordUnitId: 10 },
  { id: 11, name: 'Holy Smokes Kosher Food Truck', cbordUnitId: 11 },
  { id: 12, name: 'E. Bronson Ingram Dining Center', cbordUnitId: 12 },
  { id: 13, name: 'Commons Munchie', cbordUnitId: 13 },
  { id: 14, name: 'Kissam Munchie', cbordUnitId: 14 },
  { id: 15, name: 'Highland Munchie', cbordUnitId: 15 },
  { id: 16, name: 'Highland Hotline', cbordUnitId: 16 },
  { id: 17, name: 'Local Java Cafe at Alumni', cbordUnitId: 17 },
  { id: 18, name: 'Wasabi', cbordUnitId: 18 },
  { id: 19, name: 'Zeppos Dining', cbordUnitId: 19 },
  { id: 20, name: 'Rothschild Dining Center', cbordUnitId: 20 },
  { id: 21, name: 'Cafe Carmichael', cbordUnitId: 21 },
];

function parseTimeString(timeStr) {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  } catch (error) {
    return null;
  }
}

function calculateStatusFromHours(html) {
  try {
    const root = parse(html);
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[currentDay];

    const rows = root.querySelectorAll('tr');
    
    for (const row of rows) {
      const dayCell = row.querySelector('td');
      if (!dayCell) continue;

      const dayName = dayCell.text.trim();
      if (dayName !== currentDayName) continue;

      if (row.classList.contains('table-danger')) {
        return { status: false, reason: 'table-danger class' };
      }

      if (row.classList.contains('table-success')) {
        const timeCells = row.querySelectorAll('td');
        if (timeCells.length >= 3) {
          const openTimeStr = timeCells[1]?.text.trim();
          const closeTimeStr = timeCells[2]?.text.trim();

          if (openTimeStr && closeTimeStr) {
            const openTime = parseTimeString(openTimeStr);
            const closeTime = parseTimeString(closeTimeStr);

            if (openTime !== null && closeTime !== null) {
              const isOpen = currentTime >= openTime && currentTime <= closeTime;
              return {
                status: isOpen,
                reason: isOpen ? 'within hours' : 'outside hours',
                hours: `${openTimeStr} - ${closeTimeStr}`,
                currentTime: `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`,
                openMinutes: openTime,
                closeMinutes: closeTime,
              };
            }
          }
        }
      }
    }

    return { status: null, reason: 'could not find today\'s row' };
  } catch (error) {
    return { status: null, reason: `error: ${error.message}` };
  }
}

async function testHallStatus(hall) {
  try {
    // Create axios instance with session
    const axiosInstance = axios.create({
      baseURL: CBORD_BASE_URL,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    // Initialize session
    await axiosInstance.get('/', {
      headers: {
        Referer: `${CBORD_BASE_URL}/`,
        Origin: CBORD_BASE_URL,
      },
    });

    // Get hours
    const formBody = new URLSearchParams();
    formBody.append('unitOid', String(hall.cbordUnitId));

    const response = await axiosInstance.post(
      '/Unit/GetHoursOfOperationMarkup',
      formBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: '*/*',
          Referer: `${CBORD_BASE_URL}/`,
          Origin: CBORD_BASE_URL,
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    if (!response.data || typeof response.data !== 'string') {
      return { hall, result: { status: null, reason: 'invalid response' } };
    }

    const result = calculateStatusFromHours(response.data);
    return { hall, result };
  } catch (error) {
    return { hall, result: { status: null, reason: `API error: ${error.message}` } };
  }
}

async function testAllHalls() {
  console.log('Testing all dining hall statuses...\n');
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(`Current time: ${dayNames[now.getDay()]} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}\n`);

  const results = [];
  
  // Test in batches to avoid overwhelming the API
  for (let i = 0; i < DINING_HALLS.length; i += 5) {
    const batch = DINING_HALLS.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(hall => testHallStatus(hall)));
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + 5 < DINING_HALLS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Compare with backend API
  const backendResponse = await axios.get('http://localhost:3000/api/dining/halls');
  const backendHalls = backendResponse.data;
  const backendMap = new Map(backendHalls.map(h => [h.cbordUnitId, h.isOpen]));

  console.log('='.repeat(80));
  console.log('RESULTS:\n');

  const openHalls = results.filter(r => r.result.status === true);
  const closedHalls = results.filter(r => r.result.status === false);
  const unknownHalls = results.filter(r => r.result.status === null);

  console.log(`✅ OPEN (${openHalls.length}):`);
  for (const { hall, result } of openHalls) {
    const backendStatus = backendMap.get(hall.cbordUnitId);
    const match = backendStatus === true ? '✅' : '❌ MISMATCH';
    console.log(`  ${match} ${hall.name}`);
    if (result.hours) {
      console.log(`      Hours: ${result.hours}, Current: ${result.currentTime}`);
    }
  }

  console.log(`\n❌ CLOSED (${closedHalls.length}):`);
  for (const { hall, result } of closedHalls) {
    const backendStatus = backendMap.get(hall.cbordUnitId);
    const match = backendStatus === false ? '✅' : '❌ MISMATCH';
    console.log(`  ${match} ${hall.name}`);
    if (result.hours) {
      console.log(`      Hours: ${result.hours}, Current: ${result.currentTime}`);
    } else {
      console.log(`      Reason: ${result.reason}`);
    }
  }

  if (unknownHalls.length > 0) {
    console.log(`\n❓ UNKNOWN (${unknownHalls.length}):`);
    for (const { hall, result } of unknownHalls) {
      const backendStatus = backendMap.get(hall.cbordUnitId);
      console.log(`  ${hall.name}`);
      console.log(`      Reason: ${result.reason}`);
      console.log(`      Backend says: ${backendStatus === undefined ? 'undefined' : backendStatus}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  const matches = results.filter(r => {
    const backendStatus = backendMap.get(r.hall.cbordUnitId);
    return r.result.status === backendStatus;
  }).length;
  const mismatches = results.length - matches;
  
  console.log(`  Total tested: ${results.length}`);
  console.log(`  ✅ Matches: ${matches}`);
  console.log(`  ❌ Mismatches: ${mismatches}`);
  console.log(`  Open: ${openHalls.length}, Closed: ${closedHalls.length}, Unknown: ${unknownHalls.length}`);
}

testAllHalls().catch(console.error);

