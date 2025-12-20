/**
 * ClaudeCanvas Demo Application
 * Side-by-side comparison of Lit and React renderers
 */
import '@claude-canvas/renderer-lit';
import { setByPointer } from '@claude-canvas/core';
// React imports
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CcSurface as CcSurfaceReact } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';
const SERVER_URL = 'http://localhost:3001';
// DOM Elements
const surfaceLit = document.getElementById('surface-lit');
const surfaceReactContainer = document.getElementById('surface-react');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const emptyStateLit = document.getElementById('empty-state-lit');
const emptyStateReact = document.getElementById('empty-state-react');
const loading = document.getElementById('loading');
const jsonOutput = document.getElementById('json-output');
const serverStatus = document.getElementById('server-status');
// React state
let reactRoot = null;
let reactSurface = null;
let reactDataModel = {};
function renderReact() {
    if (!reactRoot) {
        reactRoot = createRoot(surfaceReactContainer);
    }
    reactRoot.render(React.createElement(CcSurfaceReact, {
        surface: reactSurface,
        initialDataModel: reactDataModel,
        onAction: (action) => {
            console.log('React action:', action);
            alert(`React Action: ${action.action.type}\nData: ${JSON.stringify(action.dataModel, null, 2)}`);
        },
        onDataModelChange: (dm) => {
            reactDataModel = dm;
        },
    }));
}
// Process messages for React
function processMessagesReact(messages) {
    for (const message of messages) {
        switch (message.type) {
            case 'surfaceUpdate':
                reactSurface = message.surface;
                break;
            case 'dataModelUpdate':
                reactDataModel = setByPointer(reactDataModel, message.path, message.data);
                break;
            case 'deleteSurface':
                if (reactSurface?.id === message.surfaceId) {
                    reactSurface = null;
                }
                break;
        }
    }
    renderReact();
}
// Check server connection
async function checkServer() {
    try {
        const response = await fetch(`${SERVER_URL}/health`);
        if (response.ok) {
            serverStatus.textContent = '🟢 Connected to Claude Code';
            serverStatus.style.color = '#22c55e';
            return true;
        }
    }
    catch {
        // Server not available
    }
    serverStatus.textContent = '🔴 Server offline - using demo mode';
    serverStatus.style.color = '#ef4444';
    return false;
}
// Demo responses for when server is offline
const demoResponses = {
    dashboard: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                chartData: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        { label: 'Revenue', data: [12000, 19000, 15000, 22000, 18000, 25000], color: '#6366f1' },
                        { label: 'Expenses', data: [8000, 11000, 9500, 13000, 10000, 14000], color: '#f43f5e' },
                    ],
                },
                orders: [
                    { id: 1, customer: 'Acme Corp', amount: 1250, status: 'Completed' },
                    { id: 2, customer: 'TechStart Inc', amount: 890, status: 'Pending' },
                    { id: 3, customer: 'Global Foods', amount: 2100, status: 'Completed' },
                    { id: 4, customer: 'City Motors', amount: 3400, status: 'Processing' },
                    { id: 5, customer: 'DataFlow LLC', amount: 1780, status: 'Completed' },
                    { id: 6, customer: 'CloudSync Pro', amount: 2950, status: 'Pending' },
                    { id: 7, customer: 'GreenEnergy Co', amount: 4200, status: 'Completed' },
                    { id: 8, customer: 'SmartHome Ltd', amount: 1100, status: 'Processing' },
                ],
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'dashboard',
                title: 'Sales Dashboard',
                components: [
                    {
                        component: 'Column',
                        gap: 24,
                        children: [
                            { component: 'Text', content: 'Sales Dashboard', textStyle: 'heading1' },
                            {
                                component: 'Card',
                                elevated: true,
                                children: [
                                    {
                                        component: 'Column',
                                        gap: 16,
                                        children: [
                                            { component: 'Text', content: 'Monthly Revenue vs Expenses', textStyle: 'heading3' },
                                            {
                                                component: 'Chart',
                                                chartType: 'bar',
                                                dataPath: '/chartData',
                                                title: 'Revenue Comparison',
                                                showLegend: true,
                                                height: 280,
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                component: 'Card',
                                elevated: true,
                                children: [
                                    {
                                        component: 'Column',
                                        gap: 16,
                                        children: [
                                            { component: 'Text', content: 'Recent Orders', textStyle: 'heading3' },
                                            {
                                                component: 'DataTable',
                                                dataPath: '/orders',
                                                columns: [
                                                    { key: 'id', label: 'ID', width: 60, sortable: true },
                                                    { key: 'customer', label: 'Customer', sortable: true },
                                                    { key: 'amount', label: 'Amount ($)', sortable: true },
                                                    { key: 'status', label: 'Status', sortable: true },
                                                ],
                                                pagination: true,
                                                pageSize: 5,
                                                searchable: true,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
    editor: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                content: '<h2>Welcome to the Editor</h2><p>Start typing your content here...</p>',
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'editor',
                title: 'Rich Text Editor',
                components: [
                    {
                        component: 'Card',
                        elevated: true,
                        children: [
                            {
                                component: 'Column',
                                gap: 16,
                                children: [
                                    { component: 'Text', content: 'Document Editor', textStyle: 'heading2' },
                                    {
                                        component: 'RichTextEditor',
                                        valuePath: '/content',
                                        placeholder: 'Start writing...',
                                        minHeight: 300,
                                        toolbar: ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'code'],
                                    },
                                    {
                                        component: 'Row',
                                        gap: 12,
                                        justify: 'end',
                                        children: [
                                            { component: 'Button', label: 'Cancel', variant: 'outline', action: { type: 'custom', event: 'cancel' } },
                                            { component: 'Button', label: 'Save Document', variant: 'primary', action: { type: 'submit' } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
    charts: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                pieData: {
                    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
                    datasets: [{ label: 'Sales', data: [35, 25, 22, 18], color: '#6366f1' }],
                },
                lineData: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: [
                        { label: 'Visitors', data: [1200, 1900, 1700, 2400, 2100, 2800], color: '#22c55e' },
                        { label: 'Conversions', data: [120, 180, 150, 220, 190, 260], color: '#f97316' },
                    ],
                },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'charts',
                title: 'Chart Gallery',
                components: [
                    {
                        component: 'Column',
                        gap: 24,
                        children: [
                            { component: 'Text', content: 'Chart Gallery', textStyle: 'heading1' },
                            {
                                component: 'Row',
                                gap: 24,
                                wrap: true,
                                children: [
                                    {
                                        component: 'Card',
                                        elevated: true,
                                        style: { flex: 1, minWidth: 300 },
                                        children: [
                                            {
                                                component: 'Column',
                                                gap: 12,
                                                children: [
                                                    { component: 'Text', content: 'Product Distribution (Pie)', textStyle: 'heading3' },
                                                    { component: 'Chart', chartType: 'pie', dataPath: '/pieData', showLegend: true, height: 250 },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        component: 'Card',
                                        elevated: true,
                                        style: { flex: 1, minWidth: 300 },
                                        children: [
                                            {
                                                component: 'Column',
                                                gap: 12,
                                                children: [
                                                    { component: 'Text', content: 'Product Distribution (Doughnut)', textStyle: 'heading3' },
                                                    { component: 'Chart', chartType: 'doughnut', dataPath: '/pieData', showLegend: true, height: 250 },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                component: 'Card',
                                elevated: true,
                                children: [
                                    {
                                        component: 'Column',
                                        gap: 12,
                                        children: [
                                            { component: 'Text', content: 'Website Traffic (Line Chart)', textStyle: 'heading3' },
                                            { component: 'Chart', chartType: 'line', dataPath: '/lineData', showLegend: true, height: 300 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
    settings: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                settings: { volume: 50, theme: 'system', notifications: true, sounds: false },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'settings-form',
                title: 'Settings',
                components: [
                    {
                        component: 'Card',
                        elevated: true,
                        children: [
                            {
                                component: 'Column',
                                gap: 20,
                                children: [
                                    { component: 'Text', content: 'Settings', textStyle: 'heading2' },
                                    {
                                        component: 'Slider',
                                        valuePath: '/settings/volume',
                                        label: 'Volume',
                                        min: 0,
                                        max: 100,
                                        step: 1,
                                    },
                                    {
                                        component: 'Select',
                                        valuePath: '/settings/theme',
                                        label: 'Theme',
                                        options: [
                                            { label: 'Light', value: 'light' },
                                            { label: 'Dark', value: 'dark' },
                                            { label: 'System', value: 'system' },
                                        ],
                                    },
                                    {
                                        component: 'Checkbox',
                                        valuePath: '/settings/notifications',
                                        label: 'Enable Notifications',
                                    },
                                    {
                                        component: 'Checkbox',
                                        valuePath: '/settings/sounds',
                                        label: 'Enable Sounds',
                                    },
                                    {
                                        component: 'Button',
                                        label: 'Save Settings',
                                        variant: 'primary',
                                        action: { type: 'submit' },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
    login: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                form: { email: '', password: '', rememberMe: false },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'login-form',
                title: 'Sign In',
                components: [
                    {
                        component: 'Column',
                        gap: 16,
                        children: [
                            {
                                component: 'TextField',
                                valuePath: '/form/email',
                                label: 'Email',
                                placeholder: 'Enter your email',
                                inputType: 'email',
                                required: true,
                            },
                            {
                                component: 'TextField',
                                valuePath: '/form/password',
                                label: 'Password',
                                placeholder: 'Enter your password',
                                inputType: 'password',
                                required: true,
                            },
                            {
                                component: 'Checkbox',
                                valuePath: '/form/rememberMe',
                                label: 'Remember me',
                            },
                            {
                                component: 'Button',
                                label: 'Sign In',
                                variant: 'primary',
                                action: { type: 'submit' },
                            },
                        ],
                    },
                ],
            },
        },
    ],
    profile: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                profile: { name: '', country: 'us' },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'profile-card',
                title: 'User Profile',
                components: [
                    {
                        component: 'Card',
                        elevated: true,
                        children: [
                            {
                                component: 'Column',
                                gap: 16,
                                children: [
                                    {
                                        component: 'Row',
                                        gap: 12,
                                        children: [
                                            { component: 'Text', content: 'Profile Settings', textStyle: 'heading2' },
                                            { component: 'Icon', name: 'settings', size: 24, color: '#666' },
                                        ],
                                    },
                                    {
                                        component: 'TextField',
                                        valuePath: '/profile/name',
                                        label: 'Name',
                                        placeholder: 'Enter your name',
                                    },
                                    {
                                        component: 'Select',
                                        valuePath: '/profile/country',
                                        label: 'Country',
                                        options: [
                                            { label: 'United States', value: 'us' },
                                            { label: 'United Kingdom', value: 'uk' },
                                            { label: 'Canada', value: 'ca' },
                                            { label: 'Australia', value: 'au' },
                                        ],
                                    },
                                    {
                                        component: 'Button',
                                        label: 'Save',
                                        variant: 'primary',
                                        action: { type: 'submit' },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
function matchDemoPrompt(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('dashboard') || lower.includes('sales') || lower.includes('table'))
        return demoResponses.dashboard;
    if (lower.includes('chart') || lower.includes('graph') || lower.includes('pie') || lower.includes('line'))
        return demoResponses.charts;
    if (lower.includes('editor') || lower.includes('rich text') || lower.includes('wysiwyg'))
        return demoResponses.editor;
    if (lower.includes('settings') || lower.includes('slider') || lower.includes('volume'))
        return demoResponses.settings;
    if (lower.includes('login') || lower.includes('sign in'))
        return demoResponses.login;
    if (lower.includes('profile') || lower.includes('user'))
        return demoResponses.profile;
    return null;
}
let serverAvailable = false;
async function generateUI() {
    const prompt = promptInput.value.trim();
    if (!prompt)
        return;
    // Show loading, hide empty states
    emptyStateLit.style.display = 'none';
    emptyStateReact.style.display = 'none';
    loading.style.display = 'flex';
    generateBtn.disabled = true;
    let messages;
    if (serverAvailable) {
        try {
            const response = await fetch(`${SERVER_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            if (!response.ok) {
                throw new Error('Server error');
            }
            const data = await response.json();
            messages = data.messages;
        }
        catch (error) {
            console.error('Server error, falling back to demo:', error);
            messages = matchDemoPrompt(prompt) ?? demoResponses.settings;
        }
    }
    else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 500));
        messages = matchDemoPrompt(prompt) ?? demoResponses.settings;
    }
    // Process messages for both renderers
    surfaceLit.processMessages(messages);
    processMessagesReact(messages);
    // Show JSON output
    jsonOutput.textContent = JSON.stringify({ messages }, null, 2);
    // Hide loading
    loading.style.display = 'none';
    generateBtn.disabled = false;
}
// Event listeners
generateBtn.addEventListener('click', generateUI);
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        generateUI();
    }
});
// Handle Lit user actions
surfaceLit.addEventListener('cc-user-action', async (e) => {
    const detail = e.detail;
    console.log('Lit action:', detail);
    alert(`Lit Action: ${detail.action.type}\nData: ${JSON.stringify(detail.dataModel, null, 2)}`);
});
// Initialize
(async () => {
    serverAvailable = await checkServer();
    console.log('ClaudeCanvas Dual Renderer Demo loaded');
    console.log('Server available:', serverAvailable);
    if (!serverAvailable) {
        console.log('Demo prompts: "dashboard", "charts", "editor", "settings", "login", "profile"');
    }
    // Initialize React root
    renderReact();
})();
