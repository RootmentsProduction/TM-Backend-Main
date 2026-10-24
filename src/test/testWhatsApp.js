// Test script for Meta WhatsApp Cloud API outbound integration
require('dotenv').config();
require('../compat');

async function testWhatsAppOutbound() {
  console.log('\n======================================================');
  console.log('  📱 ATK VPE Automation — WhatsApp Live Test Suite    ');
  console.log('======================================================\n');

  // 1. Verify environment setup
  const token = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const sendMode = process.env.WA_SEND_MODE || 'TEST';
  const rawTestRecipients = process.env.WA_TEST_RECIPIENTS || '';

  console.log('1️⃣ Environment Configuration:');
  console.log('   - WA_PHONE_NUMBER_ID :', phoneNumberId || '❌ MISSING');
  console.log('   - META_ACCESS_TOKEN  :', token ? `✅ Present (${token.slice(0, 15)}...)` : '❌ MISSING');
  console.log('   - WA_SEND_MODE       :', sendMode);
  console.log('   - WA_TEST_RECIPIENTS :', rawTestRecipients || '❌ MISSING');

  if (!token || !phoneNumberId) {
    console.error('\n❌ Fatal: META_ACCESS_TOKEN or WA_PHONE_NUMBER_ID is missing from .env');
    process.exit(1);
  }

  const recipients = rawTestRecipients
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.error('\n❌ Fatal: No recipients specified in WA_TEST_RECIPIENTS.');
    process.exit(1);
  }

  const primaryRecipient = recipients[0];
  const normalizedRecipient = globalThis.normalizePhone_(primaryRecipient);

  console.log('\n2️⃣ Recipient Verification:');
  console.log('   - Configured Input   :', primaryRecipient);
  console.log('   - E.164 Normalized   :', normalizedRecipient);

  // 2. Fetch sender profile info from Meta Graph API
  console.log('\n3️⃣ Verifying Meta Phone Number ID Status:');
  try {
    const res = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(phoneNumberId)}?fields=id,verified_name,display_phone_number,quality_rating`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const info = await res.json();

    if (info.error) {
      console.error('   ❌ Meta API Error:', info.error.message);
      process.exit(1);
    }

    console.log('   - Verified Name      :', info.verified_name || '(N/A)');
    console.log('   - Display Number     :', info.display_phone_number || '(N/A)');
    console.log('   - Quality Rating     :', info.quality_rating || '(N/A)');
    console.log('   - Status             : ✅ Verified & Online');
  } catch (err) {
    console.error('   ❌ Connection Error to Meta Graph API:', err.message);
    process.exit(1);
  }

  // 3. Test allowlist check in Engine
  console.log('\n4️⃣ Testing Engine Allowlist Security Check:');
  const isAllowed = globalThis.isWhatsAppRecipientAllowed_(normalizedRecipient);
  console.log('   - Allowlist Passed   :', isAllowed ? '✅ YES' : '❌ NO');

  if (!isAllowed) {
    console.error(`\n❌ Error: Recipient ${normalizedRecipient} is blocked by WA_TEST_RECIPIENTS.`);
    process.exit(1);
  }

  // 4. Send Live WhatsApp Test Template Message (Works outside 24h window)
  console.log(`\n5️⃣ Sending Live WhatsApp Approved Template (atk_role_reminder_v2) to ${normalizedRecipient}...`);
  try {
    const templatePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizedRecipient,
      type: 'template',
      template: {
        name: 'atk_role_reminder_v2',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: 'Member' }]
          }
        ]
      }
    };

    const templateResult = globalThis.sendWhatsAppPayload_(templatePayload);
    if (templateResult && templateResult.ok) {
      console.log('   ✅ Template Outbound : 200 OK');
      console.log('   ✅ Meta Message ID   :', templateResult.messageId);
      console.log('   📲 Check your WhatsApp! You should see the atk_role_reminder_v2 template message.');
    } else {
      console.log('   ⚠️ Template Outbound note:', JSON.stringify(templateResult));
    }
  } catch (err) {
    console.error('   ❌ Template send error:', err.message);
  }

  // 5. Send Live Freeform Message & explain 24h window
  console.log(`\n6️⃣ Testing Freeform Text Message (Requires 24-hour Customer Service Window)...`);
  const testMessage = `👋 Hello from Advanced Toastmasters of Kerala (ATK) VPE Automation!\n\nTimestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  try {
    const textResult = globalThis.sendWhatsAppText_(normalizedRecipient, testMessage);
    if (textResult && textResult.ok) {
      console.log('   ✅ Freeform Outbound : 200 OK');
      console.log('   ✅ Meta Message ID   :', textResult.messageId);
    }
  } catch (err) {
    console.error('   ❌ Freeform send error:', err.message);
  }

  console.log('\n======================================================');
  console.log('  📌 IMPORTANT META WHATSAPP CLOUD API RULES:');
  console.log('  1. Template Messages (like atk_role_reminder_v2) can be');
  console.log('     delivered at ANY time.');
  console.log('  2. Freeform Text Messages can ONLY be delivered if the');
  console.log('     recipient sent a message to the bot in the last 24h.');
  console.log('  👉 To open the 24h window, send "Hi" from your phone');
  console.log('     to +91 97458 52423 on WhatsApp!');
  console.log('======================================================\n');
}

testWhatsAppOutbound();
