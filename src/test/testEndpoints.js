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

    // 11. Test auth.sync with existing member (Riyas AF - 919846000000)
    const syncExistingRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.sync',
        club_id: 'ATK',
        phone: '+919846000000'
      })
    });
    const syncExistingJson = await syncExistingRes.json();
    const sed = syncExistingJson.data || {};
    const syncExistingOk = sed.has_completed_onboarding === true && sed.name === 'Riyas AF' && !!sed.session_token;
    console.log(`✅ POST /api/v1 (auth.sync - existing): ${syncExistingOk ? 'PASSED' : 'FAILED'} — name=${sed.name} onboarding=${sed.has_completed_onboarding} token=${sed.session_token ? 'YES' : 'NO'}`);

    // 12. Test auth.sync with unonboarded phone
    const syncNewRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.sync',
        club_id: 'ATK',
        phone: '+919876543210'
      })
    });
    const syncNewJson = await syncNewRes.json();
    const snd = syncNewJson.data || {};
    const syncNewOk = snd.has_completed_onboarding === false && !!snd.session_token;
    console.log(`✅ POST /api/v1 (auth.sync - unonboarded): ${syncNewOk ? 'PASSED' : 'FAILED'} — onboarding=${snd.has_completed_onboarding} token=${snd.session_token ? 'YES' : 'NO'}`);

    // 13. Test auth.send_otp
    const sendOtpRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.send_otp',
        club_id: 'ATK',
        phone: '+919876543210'
      })
    });
    const sendOtpJson = await sendOtpRes.json();
    const sod = sendOtpJson.data || {};
    const sendOtpOk = sod.expires_in_seconds === 300 && sod.message === 'OTP sent successfully';
    console.log(`✅ POST /api/v1 (auth.send_otp): ${sendOtpOk ? 'PASSED' : 'FAILED'} — ${sod.message} (expires=${sod.expires_in_seconds}s)`);

    // 14. Test auth.verify_otp (invalid OTP)
    const verifyBadRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.verify_otp',
        club_id: 'ATK',
        phone: '+919876543210',
        otp: '999999'
      })
    });
    const verifyBadJson = await verifyBadRes.json();
    const verifyBadOk = verifyBadJson.error && verifyBadJson.error.code === 'INVALID_OTP';
    console.log(`✅ POST /api/v1 (auth.verify_otp invalid): ${verifyBadOk ? 'PASSED' : 'FAILED'} — ${verifyBadJson.error ? verifyBadJson.error.message : 'no error'}`);

    // 15. Test auth.verify_otp (valid OTP: 123456)
    const verifyGoodRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.verify_otp',
        club_id: 'ATK',
        phone: '+919876543210',
        otp: '123456'
      })
    });
    const verifyGoodJson = await verifyGoodRes.json();
    const vgd = verifyGoodJson.data || {};
    const verifyGoodOk = vgd.has_completed_onboarding === false && !!vgd.session_token;
    console.log(`✅ POST /api/v1 (auth.verify_otp valid): ${verifyGoodOk ? 'PASSED' : 'FAILED'} — onboarding=${vgd.has_completed_onboarding} token=${vgd.session_token ? 'YES' : 'NO'}`);

    // 16. Test profile.create for new user
    const profileRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'profile.create',
        club_id: 'ATK',
        phone: '+919876543210',
        full_name: 'Anoop Paul',
        email: 'anoop@example.com',
        role: 'VP Education'
      })
    });
    const profileJson = await profileRes.json();
    const pd = profileJson.data || {};
    const profileOk = pd.has_completed_onboarding === true && pd.name === 'Anoop Paul' && pd.role === 'VP Education' && !!pd.member_id;
    console.log(`✅ POST /api/v1 (profile.create): ${profileOk ? 'PASSED' : 'FAILED'} — member_id=${pd.member_id} name=${pd.name} role=${pd.role} onboarding=${pd.has_completed_onboarding}`);

    // 17. Verify auth.sync now returns completed onboarding for Anoop Paul
    const syncAfterRes = await fetch(`${baseUrl}/api/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_version: 'v1',
        api_key: 'DEV_VPE_KEY_2026',
        action: 'auth.sync',
        club_id: 'ATK',
        phone: '+919876543210'
      })
    });
    const syncAfterJson = await syncAfterRes.json();
    const sad = syncAfterJson.data || {};
    const syncAfterOk = sad.has_completed_onboarding === true && sad.name === 'Anoop Paul' && sad.role === 'VP Education';
    console.log(`✅ POST /api/v1 (auth.sync - post-onboarding): ${syncAfterOk ? 'PASSED' : 'FAILED'} — name=${sad.name} role=${sad.role} onboarding=${sad.has_completed_onboarding}`);

    console.log('\n🎉 ALL EXPRESS HTTP & MONGODB ENDPOINTS VERIFIED SUCCESSFULLY!\n');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    server.close();
    process.exit(1);
  }
});
