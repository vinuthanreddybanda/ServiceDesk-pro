// ============================================
// ServiceDesk Pro — Database Seeder
// ============================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';
import Organization from '../src/models/Organization.js';
import Priority from '../src/models/Priority.js';
import Category from '../src/models/Category.js';
import SLAPolicy from '../src/models/SLAPolicy.js';
import Ticket from '../src/models/Ticket.js';
import Asset from '../src/models/Asset.js';
import Vendor from '../src/models/Vendor.js';
import KnowledgeArticle from '../src/models/KnowledgeArticle.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicedesk-pro';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Priority.deleteMany({}),
      Category.deleteMany({}),
      SLAPolicy.deleteMany({}),
      Ticket.deleteMany({}),
      Asset.deleteMany({}),
      Vendor.deleteMany({}),
      KnowledgeArticle.deleteMany({}),
    ]);
    console.log('[SEED] Cleared existing data');

    // --- Organization ---
    const org = await Organization.create({
      name: 'Acme Technologies',
      departments: ['IT', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
      settings: {
        businessHours: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5], timezone: 'UTC' },
        ticketPrefix: 'SD',
        assetPrefix: 'AST',
      },
    });
    console.log('[SEED] Organization created');

    // --- Priorities ---
    const priorities = await Priority.insertMany([
      { label: 'Critical', weight: 1, color: '#b91c1c', slaResponseMins: 15, slaResolutionMins: 60 },
      { label: 'High', weight: 2, color: '#c2742f', slaResponseMins: 30, slaResolutionMins: 240 },
      { label: 'Medium', weight: 3, color: '#b8860b', slaResponseMins: 120, slaResolutionMins: 480 },
      { label: 'Low', weight: 4, color: '#5b7a8a', slaResponseMins: 480, slaResolutionMins: 1440 },
    ]);
    console.log('[SEED] 4 priorities created');

    const [critical, high, medium, low] = priorities;

    // --- Categories ---
    const categories = await Category.insertMany([
      { name: 'Hardware', description: 'Physical equipment issues', defaultPriority: medium._id, order: 1 },
      { name: 'Software', description: 'Software installation, bugs, updates', defaultPriority: medium._id, order: 2 },
      { name: 'Network', description: 'Connectivity, VPN, Wi-Fi', defaultPriority: high._id, order: 3 },
      { name: 'Email', description: 'Email access, configuration, delivery', defaultPriority: medium._id, order: 4 },
      { name: 'Access & Permissions', description: 'Account access, password resets, permissions', defaultPriority: high._id, order: 5 },
      { name: 'Security', description: 'Security incidents, malware, phishing', defaultPriority: critical._id, order: 6 },
      { name: 'General Inquiry', description: 'Other IT requests', defaultPriority: low._id, order: 7 },
    ]);
    console.log('[SEED] 7 categories created');

    // --- SLA Policies ---
    await SLAPolicy.insertMany([
      { name: 'Critical SLA', priority: critical._id, responseTime: 15, resolutionTime: 60, isActive: true,
        escalationChain: [
          { level: 1, notifyRole: 'manager', afterMinutes: 30 },
          { level: 2, notifyRole: 'admin', afterMinutes: 45 },
        ],
      },
      { name: 'High SLA', priority: high._id, responseTime: 30, resolutionTime: 240, isActive: true,
        escalationChain: [
          { level: 1, notifyRole: 'manager', afterMinutes: 120 },
        ],
      },
      { name: 'Medium SLA', priority: medium._id, responseTime: 120, resolutionTime: 480, isActive: true },
      { name: 'Low SLA', priority: low._id, responseTime: 480, resolutionTime: 1440, isActive: true },
    ]);
    console.log('[SEED] 4 SLA policies created');

    // --- Users ---
    const users = await User.create([
      { name: 'Admin User', email: 'admin@acme.com', passwordHash: 'admin123', role: 'admin', department: 'IT', phone: '+1-555-0100', organization: org._id },
      { name: 'Sarah Manager', email: 'sarah@acme.com', passwordHash: 'manager123', role: 'manager', department: 'IT', phone: '+1-555-0101', organization: org._id },
      { name: 'John Technician', email: 'john@acme.com', passwordHash: 'tech123', role: 'technician', department: 'IT', phone: '+1-555-0102', organization: org._id },
      { name: 'Emily Technician', email: 'emily@acme.com', passwordHash: 'tech123', role: 'technician', department: 'IT', phone: '+1-555-0103', organization: org._id },
      { name: 'Mike Asset Mgr', email: 'mike@acme.com', passwordHash: 'asset123', role: 'asset_manager', department: 'IT', phone: '+1-555-0104', organization: org._id },
      { name: 'Alice Employee', email: 'alice@acme.com', passwordHash: 'employee123', role: 'employee', department: 'Engineering', phone: '+1-555-0200', organization: org._id },
      { name: 'Bob Employee', email: 'bob@acme.com', passwordHash: 'employee123', role: 'employee', department: 'Sales', phone: '+1-555-0201', organization: org._id },
      { name: 'Carol Employee', email: 'carol@acme.com', passwordHash: 'employee123', role: 'employee', department: 'Marketing', phone: '+1-555-0202', organization: org._id },
      { name: 'Dave Employee', email: 'dave@acme.com', passwordHash: 'employee123', role: 'employee', department: 'HR', phone: '+1-555-0203', organization: org._id },
      { name: 'Eve Employee', email: 'eve@acme.com', passwordHash: 'employee123', role: 'employee', department: 'Finance', phone: '+1-555-0204', organization: org._id },
    ]);
    console.log('[SEED] 10 users created');

    const [admin, manager, john, emily, assetMgr, alice, bob, carol, dave, eve] = users;

    // --- Vendors ---
    const vendors = await Vendor.insertMany([
      { name: 'Dell Technologies', email: 'sales@dell.com', phone: '+1-800-999-3355', website: 'https://dell.com', contactPerson: 'Tom Wilson' },
      { name: 'Apple Inc.', email: 'enterprise@apple.com', phone: '+1-800-275-2273', website: 'https://apple.com', contactPerson: 'Jane Smith' },
      { name: 'Cisco Systems', email: 'orders@cisco.com', phone: '+1-800-553-6387', website: 'https://cisco.com', contactPerson: 'Mike Chen' },
      { name: 'Microsoft', email: 'licensing@microsoft.com', phone: '+1-800-642-7676', website: 'https://microsoft.com', contactPerson: 'Lisa Park' },
    ]);
    console.log('[SEED] 4 vendors created');

    // --- Assets ---
    await Asset.create([
      { type: 'laptop', name: 'Dell Latitude 5540', manufacturer: 'Dell', model: 'Latitude 5540', serialNumber: 'DL5540-001', vendor: vendors[0]._id, purchaseDate: new Date('2024-01-15'), purchaseCost: 1299, warrantyExpiry: new Date('2027-01-15'), assignedTo: alice._id, department: 'Engineering', location: 'Floor 3', lifecycleStatus: 'assigned' },
      { type: 'laptop', name: 'MacBook Pro 14"', manufacturer: 'Apple', model: 'MacBook Pro M3', serialNumber: 'MBP14-002', vendor: vendors[1]._id, purchaseDate: new Date('2024-03-10'), purchaseCost: 1999, warrantyExpiry: new Date('2027-03-10'), assignedTo: bob._id, department: 'Sales', location: 'Floor 2', lifecycleStatus: 'assigned' },
      { type: 'desktop', name: 'Dell OptiPlex 7010', manufacturer: 'Dell', model: 'OptiPlex 7010', serialNumber: 'DO7010-003', vendor: vendors[0]._id, purchaseDate: new Date('2024-02-20'), purchaseCost: 899, warrantyExpiry: new Date('2027-02-20'), assignedTo: carol._id, department: 'Marketing', location: 'Floor 2', lifecycleStatus: 'assigned' },
      { type: 'monitor', name: 'Dell UltraSharp 27"', manufacturer: 'Dell', model: 'U2723QE', serialNumber: 'DU27-004', vendor: vendors[0]._id, purchaseDate: new Date('2024-01-15'), purchaseCost: 619, warrantyExpiry: new Date('2027-01-15'), assignedTo: alice._id, department: 'Engineering', location: 'Floor 3', lifecycleStatus: 'assigned' },
      { type: 'network_device', name: 'Cisco Catalyst 9200', manufacturer: 'Cisco', model: 'C9200L-24T-4G', serialNumber: 'CC9200-005', vendor: vendors[2]._id, purchaseDate: new Date('2023-06-01'), purchaseCost: 3500, warrantyExpiry: new Date('2026-06-01'), department: 'IT', location: 'Server Room', lifecycleStatus: 'assigned' },
      { type: 'server', name: 'Dell PowerEdge R750', manufacturer: 'Dell', model: 'PowerEdge R750', serialNumber: 'DPE-006', vendor: vendors[0]._id, purchaseDate: new Date('2023-09-15'), purchaseCost: 8500, warrantyExpiry: new Date('2026-09-15'), department: 'IT', location: 'Server Room', lifecycleStatus: 'assigned' },
      { type: 'printer', name: 'HP LaserJet Pro M404', manufacturer: 'HP', model: 'M404dn', serialNumber: 'HP404-007', vendor: vendors[0]._id, purchaseDate: new Date('2024-04-01'), purchaseCost: 349, warrantyExpiry: new Date('2025-04-01'), department: 'HR', location: 'Floor 1', lifecycleStatus: 'in_repair' },
      { type: 'laptop', name: 'Dell Latitude 5530', manufacturer: 'Dell', model: 'Latitude 5530', serialNumber: 'DL5530-008', vendor: vendors[0]._id, purchaseDate: new Date('2022-06-15'), purchaseCost: 1199, warrantyExpiry: new Date('2025-06-15'), department: 'IT', location: 'Storage', lifecycleStatus: 'procured' },
      { type: 'software_license', name: 'Microsoft 365 E3', manufacturer: 'Microsoft', model: 'M365 E3', serialNumber: 'M365-E3-009', vendor: vendors[3]._id, purchaseDate: new Date('2024-01-01'), purchaseCost: 4320, warrantyExpiry: new Date('2025-01-01'), department: 'IT', lifecycleStatus: 'assigned', notes: '12 seats, annual subscription' },
      { type: 'phone', name: 'iPhone 15 Pro', manufacturer: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'IP15P-010', vendor: vendors[1]._id, purchaseDate: new Date('2024-05-01'), purchaseCost: 999, warrantyExpiry: new Date('2025-05-01'), assignedTo: manager._id, department: 'IT', lifecycleStatus: 'assigned' },
    ]);
    console.log('[SEED] 10 assets created');

    // --- Tickets ---
    const now = new Date();
    await Ticket.create([
      {
        subject: 'Laptop not booting after Windows update',
        description: 'My Dell Latitude won\'t boot after the latest Windows update. It shows a blue screen with error code CRITICAL_PROCESS_DIED. I\'ve tried restarting multiple times but the issue persists.',
        requester: alice._id, assignee: john._id, category: categories[0]._id, priority: high._id,
        status: 'in_progress', department: 'Engineering',
        slaDueAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        comments: [
          { author: john._id, content: 'I\'ll connect remotely to diagnose. Can you boot into Safe Mode? Try holding Shift while restarting.' },
          { author: alice._id, content: 'Safe mode works. I can see the desktop now.' },
        ],
      },
      {
        subject: 'Cannot access shared drive \\\\fileserver\\projects',
        description: 'Getting "Access Denied" when trying to access the projects shared drive. I need access for the Q3 marketing materials. This was working fine yesterday.',
        requester: carol._id, assignee: emily._id, category: categories[4]._id, priority: medium._id,
        status: 'in_progress', department: 'Marketing',
        slaDueAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        internalNotes: [
          { author: emily._id, content: 'Checked AD permissions — user was removed from the Projects group during last night\'s sync. Re-adding now.' },
        ],
      },
      {
        subject: 'VPN disconnects every 10 minutes',
        description: 'The Cisco AnyConnect VPN keeps disconnecting roughly every 10 minutes. I\'m working from home and this is severely impacting productivity. Running Windows 11 with AnyConnect 4.10.',
        requester: bob._id, assignee: john._id, category: categories[2]._id, priority: high._id,
        status: 'open', department: 'Sales',
        slaDueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      },
      {
        subject: 'Email not syncing on mobile device',
        description: 'My Outlook app on iPhone stopped syncing about 2 hours ago. I can access email on my laptop through the web browser but not on mobile. I\'ve already tried removing and re-adding the account.',
        requester: dave._id, category: categories[3]._id, priority: low._id,
        status: 'open', department: 'HR',
        slaDueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
      {
        subject: 'Request for Adobe Creative Cloud license',
        description: 'I need an Adobe Creative Cloud license for the upcoming product launch campaign. Specifically need Photoshop, Illustrator, and InDesign. Manager (Sarah) has approved.',
        requester: carol._id, assignee: assetMgr._id, category: categories[1]._id, priority: low._id,
        status: 'pending', department: 'Marketing',
        slaDueAt: new Date(now.getTime() + 20 * 60 * 60 * 1000),
        comments: [
          { author: assetMgr._id, content: 'License request submitted to procurement. Expected delivery: 2-3 business days.' },
        ],
      },
      {
        subject: 'Suspicious phishing email received',
        description: 'Received an email claiming to be from IT department asking me to reset my password via a link. The email address looks suspicious: it-support@acme-secure.xyz. I did NOT click the link.',
        requester: eve._id, assignee: manager._id, category: categories[5]._id, priority: critical._id,
        status: 'escalated', department: 'Finance', escalationLevel: 1,
        slaDueAt: new Date(now.getTime() + 30 * 60 * 1000),
        internalNotes: [
          { author: manager._id, content: 'Confirmed phishing attempt. Blocking domain at email gateway and running a scan across all mailboxes for similar messages.' },
        ],
      },
      {
        subject: 'Printer on Floor 1 showing paper jam error',
        description: 'The HP printer near the HR office is showing a paper jam error. We\'ve checked and there\'s no visible paper jam. The error won\'t clear even after power cycling.',
        requester: dave._id, assignee: john._id, category: categories[0]._id, priority: low._id,
        status: 'resolved', department: 'HR', resolvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        comments: [
          { author: john._id, content: 'Cleared a small paper fragment from the fuser unit. Printer is back online.' },
          { author: dave._id, content: 'Working great now, thanks!' },
        ],
      },
      {
        subject: 'New employee onboarding — accounts needed',
        description: 'New developer starting Monday. Need: AD account, email, GitHub org access, Jira access, VPN credentials, and a laptop setup. Name: Jordan Rivera, Department: Engineering.',
        requester: manager._id, assignee: john._id, category: categories[4]._id, priority: medium._id,
        status: 'in_progress', department: 'IT',
        slaDueAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        comments: [
          { author: john._id, content: 'AD account and email created. Working on GitHub and Jira access now.' },
        ],
        internalNotes: [
          { author: john._id, content: 'Laptop AST-00008 (Dell Latitude 5530) from storage being configured with standard dev image.' },
        ],
      },
      {
        subject: 'Monitor flickering intermittently',
        description: 'My external Dell monitor keeps flickering. It happens randomly, sometimes every few minutes, sometimes goes an hour without issues. Using DisplayPort cable.',
        requester: alice._id, category: categories[0]._id, priority: low._id,
        status: 'open', department: 'Engineering',
        slaDueAt: new Date(now.getTime() + 22 * 60 * 60 * 1000),
      },
      {
        subject: 'Database server high CPU usage alert',
        description: 'Monitoring system flagged the production database server (PowerEdge R750) with sustained CPU usage above 95% for the last 30 minutes. Response times are degrading.',
        requester: admin._id, assignee: emily._id, category: categories[2]._id, priority: critical._id,
        status: 'in_progress', department: 'IT',
        slaDueAt: new Date(now.getTime() + 45 * 60 * 1000),
        slaBreached: false,
        internalNotes: [
          { author: emily._id, content: 'Identified a runaway query from the reporting module. Killing the process and adding query timeout limits.' },
        ],
      },
    ]);
    console.log('[SEED] 10 tickets created');

    // --- Knowledge Base Articles ---
    await KnowledgeArticle.create([
      {
        title: 'How to Connect to the VPN from Home',
        content: `## Problem\nYou need to connect to the company VPN to access internal resources while working remotely.\n\n## Solution\n1. Download **Cisco AnyConnect** from the IT portal: https://itportal.acme.com/vpn\n2. Install and open the application\n3. Enter the server address: **vpn.acme.com**\n4. Click **Connect**\n5. Enter your **AD credentials** (same as your Windows login)\n6. Approve the MFA prompt on your phone\n\n## Troubleshooting\n- **Connection drops frequently**: Try switching between Wi-Fi and wired connection\n- **"Unable to establish VPN" error**: Ensure no other VPN software is running\n- **MFA not received**: Check the Authenticator app or contact IT for a reset`,
        author: john._id, category: categories[2]._id, tags: ['vpn', 'remote', 'connectivity'],
        status: 'published', viewCount: 142, helpfulCount: 38,
      },
      {
        title: 'Password Reset Guide',
        content: `## Self-Service Password Reset\n1. Go to **https://passwordreset.acme.com**\n2. Enter your email address\n3. Answer your security questions or verify via MFA\n4. Create a new password meeting these requirements:\n   - At least 12 characters\n   - One uppercase, one lowercase, one number, one special character\n   - Cannot reuse the last 5 passwords\n\n## If You're Locked Out\n- Wait 30 minutes for automatic unlock, OR\n- Contact the IT Help Desk at **ext. 5555** or email **helpdesk@acme.com**`,
        author: emily._id, category: categories[4]._id, tags: ['password', 'account', 'security'],
        status: 'published', viewCount: 287, helpfulCount: 65,
      },
      {
        title: 'Setting Up Email on Mobile Devices',
        content: `## iOS (iPhone/iPad)\n1. Go to **Settings → Mail → Accounts → Add Account**\n2. Select **Microsoft Exchange**\n3. Enter your full email: **yourname@acme.com**\n4. Tap **Sign In** and authenticate with your AD credentials\n5. Enable **Mail, Calendar, Contacts** as needed\n\n## Android\n1. Open the **Outlook** app (download from Play Store if needed)\n2. Tap **Add Account**\n3. Enter your email and tap **Continue**\n4. Enter your password and approve MFA\n\n## Common Issues\n- **"Account not found"**: Ensure you're using your full email address\n- **Sync issues**: Try removing and re-adding the account`,
        author: john._id, category: categories[3]._id, tags: ['email', 'mobile', 'outlook'],
        status: 'published', viewCount: 98, helpfulCount: 22,
      },
    ]);
    console.log('[SEED] 3 knowledge base articles created');

    console.log('\n========================================');
    console.log('  SEED COMPLETE');
    console.log('========================================');
    console.log('\n  Demo Accounts:');
    console.log('  ──────────────────────────────────────');
    console.log('  Admin:      admin@acme.com      / admin123');
    console.log('  Manager:    sarah@acme.com      / manager123');
    console.log('  Technician: john@acme.com       / tech123');
    console.log('  Technician: emily@acme.com      / tech123');
    console.log('  Asset Mgr:  mike@acme.com       / asset123');
    console.log('  Employee:   alice@acme.com      / employee123');
    console.log('  Employee:   bob@acme.com        / employee123');
    console.log('  Employee:   carol@acme.com      / employee123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
};

seed();
