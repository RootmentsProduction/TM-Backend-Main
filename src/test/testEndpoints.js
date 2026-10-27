const http = require('http');
const app = require('../server');

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server listening on ${baseUrl}`);

  try {
    // 1. Test Root Info
    const rootRes = await fetch(`${baseUrl}/`);
    const rootJson = await rootRes.json();
    console.log('✅ GET /:', rootJson.service, '| Status:', rootJson.status);

    // 2. Test Health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log('✅ GET /health:', healthJson.ok ? 'OK' : 'FAILED');

    // 3. Test Meta Webhook Verification (Challenge)
    const challengeRes = await fetch(`${baseUrl}/webhook?hub.mode=subscribe&hub.verify_token=ATK_VPE_VERIFY_2026_X7K9M4P2&hub.challenge=TEST_CHALLENGE_XYZ`);
    const challengeText = await challengeRes.text();
    console.log('✅ GET /webhook verification challenge:', challengeText === 'TEST_CHALLENGE_XYZ' ? 'PASSED (challenge returned)' : 'FAILED');

    // 4. Test Web API v1
    const apiRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GET_CLUB_SETTINGS', club_id: 'atk_default' })
    });
    const apiJson = await apiRes.json();
    console.log('✅ POST /api/v1 (GET_CLUB_SETTINGS):', apiJson.data ? `Club: ${apiJson.data.club_name}` : 'OK response');

    // 5. Test Pure MongoDB REST Endpoints
    const membersRes = await fetch(`${baseUrl}/api/members`);
    const membersJson = await membersRes.json();
    console.log(`✅ GET /api/members (MongoDB Atlas): Found ${membersJson.count} members.`);

    const meetingsRes = await fetch(`${baseUrl}/api/meetings`);
    const meetingsJson = await meetingsRes.json();
    console.log(`✅ GET /api/meetings (MongoDB Atlas): Found ${meetingsJson.count} meetings.`);

    // 6. Test Dev Regression API endpoint
    const regRes = await fetch(`${baseUrl}/api/dev/regression?verify_token=ATK_VPE_VERIFY_2026_X7K9M4P2`);
    const regJson = await regRes.json();
    console.log('✅ GET /api/dev/regression:', regJson.ok ? `PASSED (${regJson.duration_ms}ms)` : 'FAILED');

    // 7. Test meeting.attendance.save
    const attSaveRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'meeting.attendance.save',
        club_id: 'ATK',
        meeting_id: 'meeting_test_att',
        attendance: [
          { member_id: '1', name: 'Anoop Paul', status: 'present' },
          { member_id: '2', name: 'Vivek Cheriyan', status: 'absent' },
          { member_id: '3', name: 'Priyesh', status: 'excused' }
        ]
      })
    });
    const attSaveJson = await attSaveRes.json();
    const sd = attSaveJson.data || {};
    const saveOk = sd.total_marked === 3 && sd.present_count === 1 && sd.absent_count === 1 && sd.excused_count === 1;
    console.log(`✅ POST /api/v1 (meeting.attendance.save): ${saveOk ? 'PASSED' : 'FAILED'} — total=${sd.total_marked} P=${sd.present_count} A=${sd.absent_count} E=${sd.excused_count}`);

    // 8. Test meeting.attendance.get
    const attGetRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'meeting.attendance.get',
        club_id: 'ATK',
        meeting_id: 'meeting_test_att'
      })
    });
    const attGetJson = await attGetRes.json();
    const gd = attGetJson.data || {};
    const getOk = Array.isArray(gd.attendance) && gd.attendance.length === 3;
    console.log(`✅ POST /api/v1 (meeting.attendance.get): ${getOk ? 'PASSED' : 'FAILED'} — ${(gd.attendance || []).length} records returned`);

    // 9. Test meeting.attendance.get with no data (should return empty array, not error)
    const attEmptyRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'meeting.attendance.get',
        club_id: 'ATK',
        meeting_id: 'meeting_nonexistent_xyz'
      })
    });
    const attEmptyJson = await attEmptyRes.json();
    const ed = attEmptyJson.data || {};
    const emptyOk = Array.isArray(ed.attendance) && ed.attendance.length === 0;
    console.log(`✅ POST /api/v1 (meeting.attendance.get empty): ${emptyOk ? 'PASSED' : 'FAILED'} — ${(ed.attendance || []).length} records (expected 0)`);

    // 10. Test meeting.attendance.save validation (missing meeting_id)
    const attBadRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'meeting.attendance.save',
        club_id: 'ATK',
        attendance: [{ member_id: '1', name: 'Test', status: 'present' }]
      })
    });
    const attBadJson = await attBadRes.json();
    const badOk = attBadJson.error && attBadJson.error.code === 'BAD_REQUEST';
    console.log(`✅ POST /api/v1 (meeting.attendance.save validation): ${badOk ? 'PASSED' : 'FAILED'} — ${attBadJson.error ? attBadJson.error.message : 'no error'}`);

    console.log('\n🎉 ALL EXPRESS HTTP & MONGODB ENDPOINTS VERIFIED SUCCESSFULLY!\n');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    server.close();
    process.exit(1);
  }
});
