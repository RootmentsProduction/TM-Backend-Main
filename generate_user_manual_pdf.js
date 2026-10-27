// Script to generate the comprehensive ATK VPE Automation User Manual & Timing Handbook PDF
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('Generating ATK VPE Automation Complete User Manual & Message Timing Handbook...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ATK VPE Automation — Complete User Manual & Message Timing Handbook</title>
  <style>
    @page {
      size: A4;
      margin: 13mm 13mm 13mm 13mm;
      @bottom-right {
        content: counter(page);
      }
    }

    *, *:before, *:after {
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print & Page Controls */
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      min-height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32px 24px;
      border: 3px solid #0f172a;
      border-radius: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
      page-break-after: always;
      break-after: page;
    }

    .cover-header {
      border-bottom: 4px solid #2563eb;
      padding-bottom: 24px;
    }

    .brand-tag {
      display: inline-block;
      background: #1e293b;
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #2563eb;
      margin: 0 0 14px 0;
      line-height: 1.4;
    }

    .cover-description {
      font-size: 10pt;
      color: #475569;
      line-height: 1.6;
      max-width: 95%;
    }

    .cover-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 15px;
    }

    .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .badge-primary { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
    .badge-dark { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }

    .cover-meta {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 25px;
    }

    .meta-item { font-size: 8.5pt; }
    .meta-label {
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      font-size: 7pt;
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }

    .cover-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #64748b;
    }

    /* Headings */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 16px;
      margin-bottom: 8px;
      border-left: 4px solid #3b82f6;
      padding-left: 8px;
    }

    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 5px;
    }

    p { margin: 0 0 8px 0; color: #334155; }
    ul, ol { margin: 0 0 10px 0; padding-left: 20px; color: #334155; }
    li { margin-bottom: 4px; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 8pt;
    }

    th {
      background: #1e293b;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-weight: 700;
      font-size: 7.5pt;
      letter-spacing: 0.3px;
    }

    td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td { background: #f8fafc; }

    /* Callouts */
    .callout {
      border-radius: 6px;
      padding: 9px 12px;
      margin: 10px 0;
      font-size: 8.5pt;
      border-left: 4px solid;
    }
    .callout-info { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
    .callout-success { background: #f0fdf4; border-color: #22c55e; color: #15803d; }
    .callout-warning { background: #fffbeb; border-color: #f59e0b; color: #b45309; }
    .callout-alert { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
    .callout-title {
      font-weight: 700;
      margin-bottom: 3px;
      font-size: 9pt;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .card-title {
      font-weight: 700;
      font-size: 9pt;
      color: #0f172a;
      margin-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 8px 0;
    }

    /* WhatsApp Chat Bubble Mock */
    .chat-container {
      background: #efeae2;
      border: 1px solid #d1d7db;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 10px 0 14px 0;
      background-image: radial-gradient(#e2d9cd 1px, transparent 1px);
      background-size: 16px 16px;
    }

    .chat-bubble {
      max-width: 85%;
      padding: 7px 11px;
      border-radius: 7.5px;
      margin-bottom: 8px;
      font-size: 8pt;
      line-height: 1.4;
      position: relative;
      box-shadow: 0 1px 0.5px rgba(11,20,26,.13);
    }

    .chat-bot {
      background: #ffffff;
      color: #111b21;
      border-top-left-radius: 0;
      margin-right: auto;
    }

    .chat-user {
      background: #d9fdd3;
      color: #111b21;
      border-top-right-radius: 0;
      margin-left: auto;
      text-align: left;
    }

    .chat-sender {
      font-weight: 700;
      font-size: 7.5pt;
      color: #128c7e;
      margin-bottom: 2px;
    }

    .chat-btn {
      display: inline-block;
      background: #f0f2f5;
      color: #00a884;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #d1d7db;
      margin-top: 5px;
      margin-right: 4px;
      text-align: center;
    }

    .chat-time {
      font-size: 6.5pt;
      color: #667781;
      float: right;
      margin-left: 8px;
      margin-top: 4px;
    }

    /* Step Card */
    .step-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 8px;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .step-number {
      font-size: 7.5pt;
      font-weight: 800;
      color: #2563eb;
      background: #eff6ff;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .step-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .step-timing {
      font-size: 7pt;
      font-weight: 600;
      color: #64748b;
    }

    code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 7.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="brand-tag">TOASTMASTERS INTERNATIONAL · DISTRICT 121</div>
      <div class="cover-title">ATK VPE Automation — User Manual</div>
      <div class="cover-subtitle">Complete Step-by-Step Operator Guide & Message Timing Handbook</div>
      <div class="cover-description">
        The authoritative, end-user manual for the Advanced Toastmasters of Kerala (ATK) automation system. Explains in complete detail: the exact timing of every automated WhatsApp message, how role players interact via chat, and how the Vice President Education (VPE) operates the web planner and programme review interfaces without touching spreadsheets.
      </div>
      <div class="cover-badges">
        <span class="badge badge-primary">Operator Manual</span>
        <span class="badge badge-success">Exact Message Timings</span>
        <span class="badge badge-warning">WhatsApp Interaction Flows</span>
        <span class="badge badge-purple">Web UI Walkthrough</span>
        <span class="badge badge-dark">Role-by-Role Guides</span>
      </div>
    </div>

    <div class="cover-meta">
      <div class="meta-item">
        <div class="meta-label">System Name</div>
        <div class="meta-value">ATK VPE Automation (MERN Stack Edition)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Club Organization</div>
        <div class="meta-value">Advanced Toastmasters of Kerala (Club #07842323 / ATK)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Primary Timezone</div>
        <div class="meta-value">Asia/Kolkata (IST / UTC+5:30)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Automated Dispatch Hours</div>
        <div class="meta-value">7:00 AM & 8:00 PM IST (with 1-Hour Tick Cycle)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Web Access URL</div>
        <div class="meta-value">http://localhost:3000 / /programme-review</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Audience</div>
        <div class="meta-value">VPE, TMOD, Grammarians, Speakers, Evaluators & Members</div>
      </div>
    </div>

    <div class="cover-footer">
      <div>ATK VPE AUTOMATION OPERATIONAL HANDBOOK · CONFIDENTIAL</div>
      <div>October 2026 Edition</div>
    </div>
  </div>

  <!-- ==================== SECTION 1: HOW THE SITE WORKS ==================== -->
  <div class="page-break"></div>
  <h1>1. How the Site & Automation System Work (The Big Picture)</h1>

  <h2>1.1 The Operational Concept</h2>
  <p>
    The ATK VPE Automation system eliminates manual back-and-forth communication. Instead of the VPE messaging dozens of club members every week, the system acts as an <strong>intelligent 24/7 digital assistant</strong> that coordinates meeting planning autonomously.
  </p>
  <p>
    The system operates across two linked environments:
  </p>
  <div class="two-col">
    <div class="card">
      <div class="card-title">📱 1. The WhatsApp Conversational Bot</div>
      <p style="font-size: 8pt; margin: 0;">
        Club members and role players interact directly inside WhatsApp. They receive interactive announcements, tap buttons to claim vacant meeting roles, submit speech project details, provide meeting themes, and submit Word & Idiom of the Day. No apps or passwords needed.
      </p>
    </div>
    <div class="card">
      <div class="card-title">💻 2. The VPE Web Control Center</div>
      <p style="font-size: 8pt; margin: 0;">
        The VPE manages club operations through modern web interfaces:
        <br>• <strong>The Web API / Flutter Dashboard</strong>: Plan meetings, reorder agenda items with drag-and-drop, and monitor readiness scores.
        <br>• <strong>The Programme Review Page</strong>: 60-day visual lookahead to protect speech slots, place holds, and schedule educational sessions.
      </p>
    </div>
  </div>

  <h2>1.2 How Information Flows Through the System</h2>
  <p>
    Every action taken on WhatsApp or the Web instantly updates the central database and cascades to other role players:
  </p>
  <ul>
    <li><strong>When a member claims a role</strong> on WhatsApp ➔ the meeting schedule is updated immediately, the role is marked filled, and role instructions are sent to the member.</li>
    <li><strong>When the TMOD submits the theme</strong> ➔ the theme is saved and automatically broadcast to the General Evaluator, Table Topics Master, Speakers, Evaluators, Grammarian, and the VP Public Relations.</li>
    <li><strong>When the Grammarian confirms the Word & Idiom</strong> ➔ the complete grammar package is formatted and delivered to the TMOD and VPE.</li>
    <li><strong>When a Speaker submits speech details</strong> ➔ the Path, Level, Project, Title, and Time are verified and handed off to the Speech Evaluator and TMOD.</li>
  </ul>

  <!-- ==================== SECTION 2: TIMING SCHEDULE ==================== -->
  <div class="page-break"></div>
  <h1>2. Master Chronological Timing Schedule</h1>
  <p>
    This master timetable details <strong>exactly when every automated message is triggered</strong>, the time of day it is sent, the recipient, and what condition initiates it:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Timeline</th>
        <th style="width: 14%;">Time of Day</th>
        <th style="width: 18%;">Event / Message</th>
        <th style="width: 18%;">Recipient</th>
        <th style="width: 36%;">Trigger Condition & Operational Logic</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>T-21 Days</strong></td>
        <td>1st of Month / Periodic</td>
        <td>Programme Review URL</td>
        <td>VPE</td>
        <td>Monthly planning trigger. Delivers tokenized URL for the 60-day slot review.</td>
      </tr>
      <tr>
        <td><strong>T-14 to T-10 Days</strong></td>
        <td>7:00 AM IST</td>
        <td>Speech Slot Invitation</td>
        <td>Qualified Speakers</td>
        <td>Evaluates member speech history; invites members who haven't spoken recently.</td>
      </tr>
      <tr>
        <td><strong>T-10 Days</strong></td>
        <td>Instant on Booking</td>
        <td>Speech Booking Confirmation</td>
        <td>Speaker</td>
        <td>Triggered immediately when member claims speech slot. Protects the slot.</td>
      </tr>
      <tr>
        <td><strong>T-7 to T-5 Days</strong></td>
        <td>7:00 AM IST</td>
        <td>Role Vacancy Announcement</td>
        <td>Active Club Members</td>
        <td>Detects unfilled roles in upcoming meeting. Sends <code>atk_role_reminder_v2</code> template.</td>
      </tr>
      <tr>
        <td><strong>T-7 to T-5 Days</strong></td>
        <td>Instant on Button Click</td>
        <td>Interactive Role List Menu</td>
        <td>Member</td>
        <td>Triggered immediately when member taps <code>[View roles]</code> button on WhatsApp.</td>
      </tr>
      <tr>
        <td><strong>T-7 to T-5 Days</strong></td>
        <td>Instant on Selection</td>
        <td>Role Claim Confirmation</td>
        <td>Member</td>
        <td>Triggered immediately when member selects role. Atomically reserves role.</td>
      </tr>
      <tr>
        <td><strong>T-6 Days</strong></td>
        <td>7:00 AM IST</td>
        <td>Speaker Details Prompt</td>
        <td>Confirmed Speakers</td>
        <td>First prompt requesting Pathway, Level, Project, Title, and Timing.</td>
      </tr>
      <tr>
        <td><strong>T-6 Days</strong></td>
        <td>7:00 AM IST</td>
        <td>Meeting Theme Request</td>
        <td>TMOD</td>
        <td>Prompts TMOD for meeting theme via copyable WhatsApp template.</td>
      </tr>
      <tr>
        <td><strong>T-5 & T-4 Days</strong></td>
        <td>7:00 AM & 8:00 PM IST</td>
        <td>Theme Reminder (if pending)</td>
        <td>TMOD</td>
        <td>Sends reminder twice daily if TMOD has not yet submitted theme.</td>
      </tr>
      <tr>
        <td><strong>T-5 to T-2 Days</strong></td>
        <td>7:00 AM & 8:00 PM IST</td>
        <td>Speaker Details Reminder</td>
        <td>Speakers</td>
        <td>Sends reminder twice daily if speaker details remain pending. Min 1 hr cooldown.</td>
      </tr>
      <tr>
        <td><strong>On Theme Submit</strong></td>
        <td>Instant on Reply</td>
        <td>Cascading Theme Broadcast</td>
        <td>GE, TTM, Speakers, Evaluators, Grammarian, VPPR</td>
        <td>Autonomous trigger. Instantly delivers theme to all meeting participants and VPPR.</td>
      </tr>
      <tr>
        <td><strong>T-3 Days</strong> (or on Theme)</td>
        <td>On Theme or 7:00 AM IST</td>
        <td>Word of the Day Prompt</td>
        <td>Grammarian</td>
        <td>Theme-aware trigger. Starts as soon as theme is available, or T-3 fallback.</td>
      </tr>
      <tr>
        <td><strong>On Word Submit</strong></td>
        <td>Instant on Reply</td>
        <td>Idiom of the Day Prompt</td>
        <td>Grammarian</td>
        <td>Acknowledges Word of Day and prompts for Idiom of Day format.</td>
      </tr>
      <tr>
        <td><strong>On Idiom Submit</strong></td>
        <td>Instant on Reply</td>
        <td>Grammar Review & Buttons</td>
        <td>Grammarian</td>
        <td>Delivers full bundle review with buttons: <code>[Confirm]</code>, <code>[Edit Word]</code>, <code>[Edit Idiom]</code>.</td>
      </tr>
      <tr>
        <td><strong>On Grammar Confirm</strong></td>
        <td>Instant on Confirm</td>
        <td>Grammar Package Handoff</td>
        <td>TMOD & VPE</td>
        <td>Triggered when Grammarian clicks Confirm. Delivers formatted bundle to TMOD.</td>
      </tr>
      <tr>
        <td><strong>T-3 to T-2 Days</strong></td>
        <td>7:00 AM IST</td>
        <td>Role Introduction Prompt</td>
        <td>Role Players</td>
        <td>Prompts role players for custom 2-3 sentence introduction or default bio fallback.</td>
      </tr>
      <tr>
        <td><strong>T-2 Days</strong></td>
        <td>6:00 PM IST</td>
        <td>Speech Details Handoff</td>
        <td>Speech Evaluators & TMOD</td>
        <td>Delivers speaker project objectives, title, and timing to assigned evaluators and TMOD.</td>
      </tr>
      <tr>
        <td><strong>T-1 Day</strong></td>
        <td>10:00 AM IST</td>
        <td>Draft Agenda & Approval</td>
        <td>VPE</td>
        <td>Compiles full draft agenda; displays Control Center readiness score.</td>
      </tr>
      <tr>
        <td><strong>Meeting Day</strong></td>
        <td>8:00 AM IST</td>
        <td>Meeting Day Final Reminders</td>
        <td>All Role Players</td>
        <td>Delivers arrival time, venue address/Zoom link, and final meeting agenda.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 3: WHATSAPP INTERACTION MANUAL ==================== -->
  <div class="page-break"></div>
  <h1>3. WhatsApp Member Interaction Manual (Message by Message)</h1>
  <p>
    This section shows <strong>exact WhatsApp screens and messages</strong> that club members see, explaining what buttons to tap and what text to send.
  </p>

  <h2>3.1 Flow 1: Vacant Role Announcement & Self-Selection</h2>
  <div class="chat-container">
    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Hi Anoop,<br><br>
      ATK Meeting 452 is scheduled for Sunday, 26 October 2026 as planned.<br><br>
      Please tap below to see the available roles. Thank you! 😊
      <span class="chat-time">7:00 AM</span>
      <br>
      <div class="chat-btn">🔘 View roles</div>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Anoop (Member)</div>
      <em>[Taps button: View roles]</em>
      <span class="chat-time">7:05 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Here are the open roles for ATK Meeting 452. Please choose one from the list:
      <span class="chat-time">7:05 AM</span>
      <br>
      <div class="chat-btn">📋 Select a Role (Interactive Menu)</div>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Anoop (Member)</div>
      Selected: <strong>Toastmaster of the Day (TMOD)</strong>
      <span class="chat-time">7:06 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      ✅ <strong>Role Confirmed!</strong><br><br>
      Thank you Anoop! You are now confirmed as the <strong>Toastmaster of the Day</strong> for ATK Meeting 452.<br><br>
      We will contact you shortly to collect your meeting theme.
      <span class="chat-time">7:06 AM</span>
    </div>
  </div>

  <h2>3.2 Flow 2: TMOD Meeting Theme Collection & Downstream Broadcast</h2>
  <div class="chat-container">
    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Hi Anoop,<br><br>
      As Toastmaster of the Day for ATK Meeting 452, please reply with your chosen <strong>Meeting Theme</strong>.<br><br>
      Please reply in this format:<br>
      <code>Theme: &lt;Your Theme Title&gt;</code>
      <span class="chat-time">7:00 AM (T-6)</span>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Anoop (TMOD)</div>
      Theme: Embracing the Uncomfortable
      <span class="chat-time">9:15 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      ✅ Thank you Anoop! Your theme <strong>"Embracing the Uncomfortable"</strong> has been saved and shared with your General Evaluator, Table Topics Master, Speakers, Evaluators, and Grammarian.
      <span class="chat-time">9:15 AM</span>
    </div>
  </div>

  <!-- ==================== SECTION 3 CONTINUED ==================== -->
  <div class="page-break"></div>
  <h2>3.3 Flow 3: Grammarian 2-Stage Word & Idiom Collection</h2>
  <p>
    The Grammarian workflow is designed to be 100% stress-free and accepts multi-line explanations or partial input:
  </p>

  <div class="chat-container">
    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Thank you for being the Grammarian for ATK Meeting 452. 😊<br><br>
      The meeting theme is *Embracing the Uncomfortable*.<br><br>
      <strong>*WORD OF THE DAY*</strong><br><br>
      Please copy the next message, fill in the details, and send it back.
      <span class="chat-time">9:16 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Word:<br>
      Meaning:<br>
      Usage:
      <span class="chat-time">9:16 AM</span>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Grammarian</div>
      Word: Fortitude<br>
      Meaning: Courage in pain or adversity<br>
      Usage: She endured her speech with great fortitude.
      <span class="chat-time">10:02 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Thank you! Your Word of the Day is received. ✅<br><br>
      <strong>*IDIOM OF THE DAY*</strong><br><br>
      Please copy the next message, fill in the details, and send it back.
      <span class="chat-time">10:02 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Idiom:<br>
      Meaning:<br>
      Usage:
      <span class="chat-time">10:02 AM</span>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Grammarian</div>
      Idiom: Bite the bullet<br>
      Meaning: To face a grim situation with courage<br>
      Usage: I decided to bite the bullet and take the speech slot.
      <span class="chat-time">10:05 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Please review your submissions for ATK Meeting 452:<br><br>
      <strong>*Word of the Day:*</strong> Fortitude<br>
      Meaning: Courage in pain or adversity<br>
      Usage: She endured her speech with great fortitude.<br><br>
      <strong>*Idiom of the Day:*</strong> Bite the bullet<br>
      Meaning: To face a grim situation with courage<br>
      Usage: I decided to bite the bullet and take the speech slot.<br><br>
      Please tap an option below:
      <span class="chat-time">10:05 AM</span>
      <br>
      <div class="chat-btn">✅ Confirm</div>
      <div class="chat-btn">✏️ Edit Word</div>
      <div class="chat-btn">✏️ Edit Idiom</div>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Grammarian</div>
      <em>[Taps button: Confirm]</em>
      <span class="chat-time">10:06 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      🎉 <strong>Grammarian Submission Complete!</strong><br><br>
      Your Word and Idiom of the Day have been confirmed and sent to your Toastmaster of the Day (Anoop) and the VPE. Thank you!
      <span class="chat-time">10:06 AM</span>
    </div>
  </div>

  <h2>3.4 Flow 4: Speaker Project Details Collection</h2>
  <div class="chat-container">
    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Hi Priyesh,<br><br>
      You are confirmed as <strong>Speaker 1</strong> for ATK Meeting 452.<br><br>
      Please copy the next message, fill in your Pathways speech details, and reply:
      <span class="chat-time">7:00 AM (T-6)</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      Path:<br>
      Level:<br>
      Project:<br>
      Title:<br>
      Time:
      <span class="chat-time">7:00 AM (T-6)</span>
    </div>

    <div class="chat-bubble chat-user">
      <div class="chat-sender">Priyesh (Speaker)</div>
      Path: Presentation Mastery<br>
      Level: Level 2<br>
      Project: Effective Body Language<br>
      Title: The Silence Between Words<br>
      Time: 5-7 minutes
      <span class="chat-time">11:30 AM</span>
    </div>

    <div class="chat-bubble chat-bot">
      <div class="chat-sender">ATK VPE Automation</div>
      ✅ Speech details saved for <strong>Speaker 1</strong>!<br><br>
      Title: "The Silence Between Words"<br>
      Pathways: Presentation Mastery · Level 2 · Effective Body Language<br>
      Time: 5-7 minutes<br><br>
      These details have been shared with your Speech Evaluator. Good luck!
      <span class="chat-time">11:30 AM</span>
    </div>
  </div>

  <!-- ==================== SECTION 4: VPE WEB INTERFACE ==================== -->
  <div class="page-break"></div>
  <h1>4. VPE Web Management Guide: Using the Web App & Planner</h1>

  <h2>4.1 Meeting Planning & Drag-and-Drop Reordering</h2>
  <p>
    The VPE operates through the <strong>Web API / Flutter Web application</strong>. The VPE never needs to open Google Sheets:
  </p>
  <div class="step-card">
    <div class="step-header">
      <span class="step-number">Step 1</span>
      <span class="step-title">Create a New Meeting</span>
      <span class="step-timing">Action: meeting.create</span>
    </div>
    <p style="font-size: 8pt; margin: 0;">
      Click <strong>"New Meeting"</strong>, select the target Sunday date from the datepicker. The backend automatically populates the default meeting structure (TMOD, GE, TTM, Speakers 1-3, Evaluators 1-3, Timer, Ah-Counter, Grammarian).
    </p>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-number">Step 2</span>
      <span class="step-title">Assign Members Using Dropdowns</span>
      <span class="step-timing">Searchable Directory</span>
    </div>
    <p style="font-size: 8pt; margin: 0;">
      Click on any role row and choose an active member from the searchable dropdown. The UI automatically enforces member IDs behind the scenes so name typos never break the database.
    </p>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-number">Step 3</span>
      <span class="step-title">Add Custom Educational Sessions</span>
      <span class="step-timing">Special Segments</span>
    </div>
    <p style="font-size: 8pt; margin: 0;">
      To add an Education Session, Panel Discussion, or Induction Ceremony, click <strong>"Add Item"</strong>, select <code>type: "session"</code>, enter the title, and assign the presenter.
    </p>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-number">Step 4</span>
      <span class="step-title">Drag & Drop Agenda Reordering</span>
      <span class="step-timing">Authoritative Sequence</span>
    </div>
    <p style="font-size: 8pt; margin: 0;">
      Grab any agenda row by its drag handle and move it up or down (for example, placing an Education Session before Table Topics). When you click <strong>Save</strong>, the backend preserves the exact sequence as positions 1 through N.
    </p>
  </div>

  <div class="step-card">
    <div class="step-header">
      <span class="step-number">Step 5</span>
      <span class="step-title">Save as Draft vs Confirmed Plan</span>
      <span class="step-timing">Action: meeting.save</span>
    </div>
    <p style="font-size: 8pt; margin: 0;">
      • <strong>Save as Draft (<code>save_mode: "DRAFT"</code>)</strong>: Saves your working plan without locking any slots.
      <br>• <strong>Save Meeting Plan (<code>save_mode: "CONFIRMED"</code>)</strong>: Confirms the plan and marks it <code>PLANNED</code>. Any vacant roles will be automatically picked up by the WhatsApp role-call engine.
    </p>
  </div>

  <h2>4.2 Dashboard & Readiness Metrics (dashboard.get)</h2>
  <p>
    The VPE Dashboard provides instant status indicators for all upcoming meetings:
  </p>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Readiness Category</th>
        <th style="width: 20%;">Ideal Ratio</th>
        <th style="width: 60%;">Meaning & Action Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Roles Filled</strong></td>
        <td><code>6/6</code></td>
        <td>TMOD, GE, TTM, Timer, Ah-Counter, Grammarian. If ratio is low, trigger role reminder broadcast.</td>
      </tr>
      <tr>
        <td><strong>Speakers Confirmed</strong></td>
        <td><code>3/3</code></td>
        <td>Prepared speakers confirmed for slots 1, 2, and 3.</td>
      </tr>
      <tr>
        <td><strong>Evaluators Paired</strong></td>
        <td><code>3/3</code></td>
        <td>Every confirmed speaker must have an assigned Speech Evaluator.</td>
      </tr>
      <tr>
        <td><strong>Speaker Details</strong></td>
        <td><code>3/3</code></td>
        <td>Pathways projects, speech titles, and timing received and validated.</td>
      </tr>
      <tr>
        <td><strong>Theme & Grammar</strong></td>
        <td><code>Ready</code></td>
        <td>TMOD theme submitted and Grammarian Word + Idiom approved.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 5: PROGRAMME REVIEW ==================== -->
  <div class="page-break"></div>
  <h1>5. VPE Web Management Guide: Using the 60-Day Programme Review</h1>

  <h2>5.1 Accessing the Review Page</h2>
  <p>
    On the 1st of each month (or upon request), the system sends the VPE a direct link with an embedded security token:
    <br><code>http://localhost:3000/programme-review?token=&lt;HMAC_TOKEN&gt;</code>
    <br>This page opens on any phone, tablet, or desktop browser with no login screen required.
  </p>

  <h2>5.2 Reviewing Slots & Taking Action</h2>
  <p>
    The page displays every meeting scheduled for the next 60 days. Each meeting shows Slot 1, Slot 2, and Slot 3. For each slot, the VPE can choose an action from the dropdown menu:
  </p>

  <div class="two-col">
    <div class="card">
      <div class="card-title">1. Keep Open</div>
      <p style="font-size: 8pt; margin: 0;">Leaves the slot available for club members to book through speech targeting invitations.</p>
    </div>
    <div class="card">
      <div class="card-title">2. Hold for Session (VPE Hold)</div>
      <p style="font-size: 8pt; margin: 0;">Reserves the slot for an educational session or workshop. Holds never auto-release and prevent members from claiming the slot.</p>
    </div>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">3. Confirm Session</div>
      <p style="font-size: 8pt; margin: 0;">Opens input fields: <em>Session Type, Presenter Name, Session Title / Topic, and Time Allotted (minutes)</em>. Locks the session into the agenda.</p>
    </div>
    <div class="card">
      <div class="card-title">4. Request Speaker Move</div>
      <p style="font-size: 8pt; margin: 0;">Used when a speaker needs to reschedule. <strong>Crucial safety feature:</strong> The speaker's current slot remains fully protected until they accept a new date!</p>
    </div>
  </div>

  <h2>5.3 Saving Your Review</h2>
  <p>
    Once you have made your changes across the 60-day window, scroll to the bottom and click the black <strong>"Save review"</strong> button. The status changes to green: <code>Saved. Slot changes recorded.</code> The changes are synchronized across MongoDB Atlas and the scheduling database immediately.
  </p>

  <!-- ==================== SECTION 6: ROLE-BY-ROLE CHEAT SHEETS ==================== -->
  <div class="page-break"></div>
  <h1>6. Role-by-Role Quick Reference Cheat Sheets</h1>

  <div class="card">
    <div class="card-title">👔 For the Vice President Education (VPE)</div>
    <ul>
      <li><strong>Weekly Routine</strong>: Check the Flutter Dashboard on Monday morning. Review the Readiness ratio for Sunday's meeting.</li>
      <li><strong>Vacant Roles</strong>: If roles are vacant at T-7 days, the bot handles it. You only need to step in manually if roles remain open by T-2 days.</li>
      <li><strong>Programme Review</strong>: Complete your 60-day slot review once a month via the <code>/programme-review</code> link.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title">🎭 For the Toastmaster of the Day (TMOD)</div>
    <ul>
      <li><strong>When Contacted (T-6 Days)</strong>: Reply on WhatsApp with your theme: <code>Theme: &lt;Title&gt;</code>.</li>
      <li><strong>Theme Propagation</strong>: You do not need to message anyone—the bot distributes your theme to all role players automatically.</li>
      <li><strong>Handoff Package (T-2 Days)</strong>: The bot delivers a full package containing: Word of the Day, Idiom of the Day, Speaker details, and role player bios for your stage introductions.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title">📖 For the Grammarian</div>
    <ul>
      <li><strong>When Contacted (T-3 Days or upon theme)</strong>: Copy the Word format message, fill in Word, Meaning, Usage, and send.</li>
      <li><strong>Stage 2</strong>: Copy the Idiom format message, fill in Idiom, Meaning, Usage, and send.</li>
      <li><strong>Final Step</strong>: Tap <code>[Confirm]</code> on the review screen. Done!</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title">🎤 For Prepared Speakers</div>
    <ul>
      <li><strong>Slot Booking</strong>: Tap <code>[Select Slot]</code> when the invitation arrives on WhatsApp.</li>
      <li><strong>Details Prompt (T-6 Days)</strong>: Copy the 5-line template: Path, Level, Project, Title, Time. Reply in one message.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title">🧐 For Speech Evaluators</div>
    <ul>
      <li><strong>Handoff (T-2 Days)</strong>: Receive your speaker's Pathways project objectives, title, and timing via WhatsApp.</li>
      <li><strong>Coordination</strong>: Contact your speaker directly before the meeting to discuss their personal evaluation goals.</li>
    </ul>
  </div>

  <div class="card">
    <div class="card-title">👥 For All Club Members</div>
    <ul>
      <li><strong>Weekly Role Call</strong>: When the announcement arrives, tap <code>[View roles]</code>, pick your role from the list, and receive instant confirmation.</li>
    </ul>
  </div>

  <!-- ==================== SECTION 7: FAQS & TROUBLESHOOTING ==================== -->
  <div class="page-break"></div>
  <h1>7. Frequently Asked Questions & Troubleshooting</h1>

  <div class="card">
    <div class="card-title">Q: What happens if a member makes a typo when submitting Word of the Day?</div>
    <p style="font-size: 8pt; margin: 0;">
      The bot's parser is case-insensitive and ignores extra spaces or leading prompt text. If a field is missing (e.g. they forgot "Usage:"), the bot saves what was submitted and sends a polite follow-up asking only for the missing usage.
    </p>
  </div>

  <div class="card">
    <div class="card-title">Q: What if two members try to claim the same role at the same time?</div>
    <p style="font-size: 8pt; margin: 0;">
      The engine executes atomic verification. The first member to tap gets the role. The second member receives a courteous notification: <em>"That role was just filled. Here are the remaining available roles..."</em> and is shown the updated list.
    </p>
  </div>

  <div class="card">
    <div class="card-title">Q: Why did I receive a reminder at 8:00 PM?</div>
    <p style="font-size: 8pt; margin: 0;">
      To keep meetings on schedule, the system operates two daily reminder slots: <strong>7:00 AM IST</strong> and <strong>8:00 PM IST</strong>. If a time-sensitive submission (such as a speech title or TMOD theme) is still pending, a reminder is sent during the next slot with a minimum cooldown period to prevent spam.
    </p>
  </div>

  <div class="card">
    <div class="card-title">Q: Does the system send WhatsApp messages in DEV / Test mode?</div>
    <p style="font-size: 8pt; margin: 0;">
      No. In development mode (<code>WA_SEND_MODE=TEST</code>), messages are only delivered to verified phone numbers listed in <code>WA_TEST_RECIPIENTS</code>. Club members never receive test messages.
    </p>
  </div>

  <div class="callout callout-success" style="margin-top: 15px;">
    <div class="callout-title">Support & System Administration</div>
    <p style="margin: 0;">
      For technical inquiries, database migrations, or WhatsApp Cloud API template updates, contact the ATK Technology & Automation Committee.
    </p>
  </div>

</body>
</html>`;

const outputHtmlPath = path.resolve(__dirname, 'ATK_VPE_Automation_Complete_User_Manual.html');
const outputPdfPath = path.resolve(__dirname, 'ATK_VPE_Automation_Complete_User_Manual.pdf');

fs.writeFileSync(outputHtmlPath, htmlContent, 'utf8');
console.log('HTML Manual written to:', outputHtmlPath);

// Use Microsoft Edge headless to generate the PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Invoking headless browser to render PDF...');
const result = cp.spawnSync(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${outputPdfPath}`,
  outputHtmlPath
], { timeout: 30000 });

if (fs.existsSync(outputPdfPath)) {
  const stats = fs.statSync(outputPdfPath);
  console.log('🎉 SUCCESS: Complete User Manual PDF Generated!');
  console.log(`File: ${outputPdfPath}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.error('❌ PDF generation failed. Error details:', result.stderr ? result.stderr.toString() : 'Unknown error');
  process.exit(1);
}
