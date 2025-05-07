/**
 * SchoolGate Services
 * Core API communication functionality for SchoolGate application
 */

// Base API URL - change this to your Google Apps Script web app URL
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzDKStsdn6NcxGJdfdTScCClYnlB3iIoCVbMfU34x90Enrez6KjTgE8nSP653dGvt98uQ/exec';

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
            sessionStorage.setItem('user', JSON.stringify(data.data));
        }
        
        return data;
    },
    
    /**
     * Log out user
     */
    logout() {
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    }
};

// Teacher-specific API services
const TeacherService = {
    /**
     * Get student statistics
     */
    async getStudentStats() {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentStats');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudents');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'addStudent');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'updateStudent');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'deleteStudent');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getPermissions');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'approvePermission');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
        formData.append('role', 'teacher');
        formData.append('permissionId', permissionId);
        formData.append('teacherId', user.id);
        
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'rejectPermission');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
        formData.append('role', 'teacher');
        formData.append('permissionId', permissionId);
        formData.append('teacherId', user.id);
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getViolationTypes');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'addDisciplinePoint');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
        formData.append('role', 'teacher');
        formData.append('teacherId', user.id);
        
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
     * Get all discipline points
     */
    async getDisciplinePoints(studentId = null) {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('teacher')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getDisciplinePoints');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
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
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentProfile');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
        params.append('role', 'student');
        params.append('studentId', user.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student profile');
        }
        
        return data.data;
    },
    
    /**
     * Get student's permissions
     */
    async getStudentPermissions() {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentPermissions');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
        params.append('role', 'student');
        params.append('studentId', user.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student permissions');
        }
        
        return data.data;
    },
    
    /**
     * Request a new permission
     */
    async requestPermission(permissionData) {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'requestPermission');
        formData.append('username', user.username);
        formData.append('password', 'token-would-be-better');
        formData.append('role', 'student');
        formData.append('studentId', user.id);
        
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
     * Get student's attendance
     */
    async getStudentAttendance() {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentAttendance');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
        params.append('role', 'student');
        params.append('studentId', user.id);
        
        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch student attendance');
        }
        
        return data.data;
    },
    
    /**
     * Get student's discipline records
     */
    async getStudentDiscipline() {
        const user = AuthService.getCurrentUser();
        
        if (!AuthService.hasRole('student')) {
            throw new Error('Unauthorized access');
        }
        
        const params = new URLSearchParams();
        params.append('action', 'getStudentDiscipline');
        params.append('username', user.username);
        params.append('password', 'token-would-be-better');
        params.append('role', 'student');
        params.append('studentId', user.id);
        
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
     * Format date to Indonesian format
     */
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    /**
     * Get initials from a name
     */
    getInitials(name) {
        if (!name) return 'XX';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    
    /**
     * Show a toast notification
     */
    showToast(message, type = 'success', duration = 3000) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast-notification');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-full';
            document.body.appendChild(toast);
        }
        
        // Set toast content and style
        if (type === 'success') {
            toast.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-green-500 text-white transform transition-transform duration-300';
            toast.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
        } else if (type === 'error') {
            toast.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-red-500 text-white transform transition-transform duration-300';
            toast.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
        } else {
            toast.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-blue-500 text-white transform transition-transform duration-300';
            toast.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
        }
        
        // Show the toast
        setTimeout(() => {
            toast.classList.remove('translate-y-full');
        }, 10);
        
        // Hide the toast after duration
        setTimeout(() => {
            toast.classList.add('translate-y-full');
        }, duration);
    }
}; 