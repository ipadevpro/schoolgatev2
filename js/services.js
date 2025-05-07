/**
 * SchoolGate Services
 * Core API communication functionality for SchoolGate application
 */

// Base API URL - change this to your Google Apps Script web app URL
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzLpE9St8QIWtIJKQTpGUqWHO3p_8m-jTRVRiTniz5KhMXcEZ3YOOF7z_g2L3RpwOPZVQ/exec';

// Authentication utilities
const AuthService = {
    /**
     * Get current user from session storage
     */
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('user') || '{}');
    },
    
    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        const user = this.getCurrentUser();
        return !!user.id;
    },
    
    /**
     * Check if user has a specific role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user.role === role;
    },
    
    /**
     * Get user credentials for API calls
     * This is a helper method to ensure all API calls use the same credentials
     */
    getCredentials() {
        const user = this.getCurrentUser();
        // Store password in sessionStorage temporarily during login
        const password = sessionStorage.getItem('temp_password');
        
        return {
            username: user.username,
            role: user.role,
            id: user.id,
            password: password
        };
    },
    
    /**
     * Log in user
     */
    async login(username, password, role) {
        const formData = new URLSearchParams();
        formData.append('action', 'login');
        formData.append('username', username);
        formData.append('password', password);
        formData.append('role', role);
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Store user data
            sessionStorage.setItem('user', JSON.stringify(data.data));
            // Store password temporarily for API calls (not secure for production!)
            sessionStorage.setItem('temp_password', password);
        }
        
        return data;
    },
    
    /**
     * Log out user
     */
    logout() {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('temp_password');
        window.location.href = 'index.html';
    }
};

// Teacher-specific API services
const TeacherService = {
    /**
     * Get student statistics
     */
    async getStudentStats() {
        const user = AuthService.getCurrentUser();
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentStats');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'teacher');
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student statistics');
        }
        
        return data.data;
    },
    
    /**
     * Get all students
     */
    async getStudents() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudents');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'teacher');
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch students');
        }
        
        return data.data;
    },
    
    /**
     * Add a new student
     */
    async addStudent(studentData) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'addStudent');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        
        // Add student data
        Object.keys(studentData).forEach(key => {
            formData.append(key, studentData[key]);
        });
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to add student');
        }
        
        return data.data;
    },
    
    /**
     * Update a student
     */
    async updateStudent(studentId, studentData) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'updateStudent');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        formData.append('studentId', studentId);
        
        // Add student data
        Object.keys(studentData).forEach(key => {
            formData.append(key, studentData[key]);
        });
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to update student');
        }
        
        return data.data;
    },
    
    /**
     * Delete a student
     */
    async deleteStudent(studentId) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'deleteStudent');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        formData.append('studentId', studentId);
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to delete student');
        }
        
        return data.data;
    },
    
    /**
     * Get all permissions
     */
    async getPermissions() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getPermissions');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'teacher');
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch permissions');
        }
        
        return data.data;
    },
    
    /**
     * Approve a permission request
     */
    async approvePermission(permissionId) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'approvePermission');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        formData.append('permissionId', permissionId);
        formData.append('teacherId', credentials.id);
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to approve permission');
        }
        
        return data.data;
    },
    
    /**
     * Reject a permission request
     */
    async rejectPermission(permissionId, notes = '') {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'rejectPermission');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        formData.append('permissionId', permissionId);
        formData.append('teacherId', credentials.id);
        formData.append('notes', notes);
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to reject permission');
        }
        
        return data.data;
    },
    
    /**
     * Get violation types
     */
    async getViolationTypes() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getViolationTypes');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'teacher');
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch violation types');
        }
        
        return data.data;
    },
    
    /**
     * Add discipline points to a student
     */
    async addDisciplinePoint(disciplineData) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'addDisciplinePoint');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'teacher');
        formData.append('teacherId', credentials.id);
        
        // Add discipline data
        Object.keys(disciplineData).forEach(key => {
            formData.append(key, disciplineData[key]);
        });
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to add discipline points');
        }
        
        return data.data;
    },
    
    /**
     * Get discipline points for all students or a specific student
     */
    async getDisciplinePoints(studentId = null) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getDisciplinePoints');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'teacher');
        
        if (studentId) {
            params.append('studentId', studentId);
        }
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch discipline points');
        }
        
        return data.data;
    }
};

// Student-specific API services
const StudentService = {
    /**
     * Get student profile
     */
    async getStudentProfile() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentProfile');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'student');
        params.append('studentId', credentials.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student profile');
        }
        
        return data.data;
    },
    
    /**
     * Get student permissions
     */
    async getStudentPermissions() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentPermissions');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'student');
        params.append('studentId', credentials.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student permissions');
        }
        
        return data.data;
    },
    
    /**
     * Request permission
     */
    async requestPermission(permissionData) {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'requestPermission');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('role', 'student');
        formData.append('studentId', credentials.id);
        
        // Add permission data
        Object.keys(permissionData).forEach(key => {
            formData.append(key, permissionData[key]);
        });
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to request permission');
        }
        
        return data.data;
    },
    
    /**
     * Get student attendance
     */
    async getStudentAttendance() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentAttendance');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'student');
        params.append('studentId', credentials.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student attendance');
        }
        
        return data.data;
    },
    
    /**
     * Get student discipline records
     */
    async getStudentDiscipline() {
        const credentials = AuthService.getCredentials();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentDiscipline');
        params.append('username', credentials.username);
        params.append('password', credentials.password);
        params.append('role', 'student');
        params.append('studentId', credentials.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student discipline records');
        }
        
        return data.data;
    }
};

// Utility functions
const Utils = {
    /**
     * Format date to locale string
     */
    formatDate(date) {
        if (!date) return '';
        
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        
        return new Date(date).toLocaleDateString('id-ID', options);
    },
    
    /**
     * Get initials from name
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'success', duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white shadow-lg`;
        toast.style.transition = 'all 0.3s ease-in-out';
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        
        // Add message
        toast.textContent = message;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
}; 