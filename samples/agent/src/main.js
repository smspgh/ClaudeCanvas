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
        console.log('Demo prompts: "settings", "login", "profile"');
    }
    // Initialize React root
    renderReact();
})();
