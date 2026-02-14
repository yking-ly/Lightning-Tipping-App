// This file forces VS Code to reload TypeScript types
// Save this file or reload VS Code window to clear red errors

import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

// Test toast types
toast.success('Test');
toast.error('Test');
toast('Test');

// Test cookies types
const token = Cookies.get('token');
Cookies.set('test', 'value');

export { };
