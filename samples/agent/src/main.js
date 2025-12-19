/**
 * ClaudeCanvas Demo Application
 * Connects to the ClaudeCanvas server for UI generation
 */
import '@claude-canvas/renderer-lit';
const SERVER_URL = 'http://localhost:3001';
const surface = document.getElementById('surface');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const emptyState = document.getElementById('empty-state');
const loading = document.getElementById('loading');
const jsonOutput = document.getElementById('json-output');
const serverStatus = document.getElementById('server-status');
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
    contact: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                form: { name: '', email: '', message: '' },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'contact-form',
                title: 'Contact Us',
                components: [
                    {
                        component: 'Column',
                        gap: 16,
                        children: [
                            {
                                component: 'TextField',
                                valuePath: '/form/name',
                                label: 'Name',
                                placeholder: 'Your name',
                                required: true,
                            },
                            {
                                component: 'TextField',
                                valuePath: '/form/email',
                                label: 'Email',
                                placeholder: 'your@email.com',
                                inputType: 'email',
                                required: true,
                            },
                            {
                                component: 'TextField',
                                valuePath: '/form/message',
                                label: 'Message',
                                placeholder: 'How can we help?',
                                multiline: true,
                                rows: 4,
                            },
                            {
                                component: 'Button',
                                label: 'Send Message',
                                variant: 'primary',
                                action: { type: 'submit' },
                            },
                        ],
                    },
                ],
            },
        },
    ],
    product: [
        {
            type: 'dataModelUpdate',
            path: '/',
            data: {
                product: {
                    name: 'Premium Headphones',
                    price: '$299',
                    description: 'Crystal-clear audio with noise cancellation.',
                },
            },
        },
        {
            type: 'surfaceUpdate',
            surface: {
                id: 'product-card',
                components: [
                    {
                        component: 'Card',
                        elevated: true,
                        children: [
                            {
                                component: 'Column',
                                gap: 12,
                                children: [
                                    {
                                        component: 'Text',
                                        contentPath: '/product/name',
                                        textStyle: 'heading2',
                                    },
                                    {
                                        component: 'Text',
                                        contentPath: '/product/description',
                                        textStyle: 'body',
                                    },
                                    {
                                        component: 'Row',
                                        justify: 'spaceBetween',
                                        align: 'center',
                                        children: [
                                            {
                                                component: 'Text',
                                                contentPath: '/product/price',
                                                textStyle: 'heading3',
                                                color: '#6366f1',
                                            },
                                            {
                                                component: 'Button',
                                                label: 'Add to Cart',
                                                variant: 'primary',
                                                action: { type: 'custom', event: 'addToCart' },
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
};
function matchDemoPrompt(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('login') || lower.includes('sign in'))
        return demoResponses.login;
    if (lower.includes('contact') || lower.includes('message'))
        return demoResponses.contact;
    if (lower.includes('product') || lower.includes('card'))
        return demoResponses.product;
    return null;
}
let serverAvailable = false;
async function generateUI() {
    const prompt = promptInput.value.trim();
    if (!prompt)
        return;
    // Show loading
    emptyState.style.display = 'none';
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
            messages = matchDemoPrompt(prompt) ?? demoResponses.contact;
        }
    }
    else {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 500));
        messages = matchDemoPrompt(prompt) ?? demoResponses.contact;
    }
    // Process messages
    surface.processMessages(messages);
    // Show JSON output
    jsonOutput.textContent = JSON.stringify(messages, null, 2);
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
// Handle user actions
surface.addEventListener('cc-user-action', async (e) => {
    const detail = e.detail;
    console.log('User action:', detail);
    if (serverAvailable) {
        try {
            const response = await fetch(`${SERVER_URL}/api/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detail),
            });
            if (response.ok) {
                const data = await response.json();
                surface.processMessages(data.messages);
                jsonOutput.textContent = JSON.stringify(data.messages, null, 2);
                return;
            }
        }
        catch (error) {
            console.error('Server error:', error);
        }
    }
    // Fallback
    alert(`Action: ${detail.action.type}\nData: ${JSON.stringify(detail.dataModel, null, 2)}`);
});
// Initialize
(async () => {
    serverAvailable = await checkServer();
    console.log('ClaudeCanvas Demo loaded');
    console.log('Server available:', serverAvailable);
    if (!serverAvailable) {
        console.log('Try prompts like: "login form", "contact form", "product card"');
    }
})();
