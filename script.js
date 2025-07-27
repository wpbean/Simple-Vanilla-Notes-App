/**
 * Modern Notes Application
 * A feature-rich note-taking app built with vanilla JavaScript
 * Uses modern ES6+ features and best practices
 */

class NotesApp {
    constructor() {
        // Initialize app state
        this.notes = [];
        this.currentEditId = null;
        this.currentPreviewNote = null;
        this.searchTerm = "";

        // DOM elements
        this.elements = {
            addNoteBtn: document.getElementById("addNoteBtn"),
            clearAllBtn: document.getElementById("clearAllBtn"),
            searchInput: document.getElementById("searchInput"),
            notesGrid: document.getElementById("notesGrid"),
            modalOverlay: document.getElementById("modalOverlay"),
            modalTitle: document.getElementById("modalTitle"),
            noteForm: document.getElementById("noteForm"),
            noteTitle: document.getElementById("noteTitle"),
            noteContent: document.getElementById("noteContent"),
            closeModalBtn: document.getElementById("closeModalBtn"),
            cancelBtn: document.getElementById("cancelBtn"),
            saveBtn: document.getElementById("saveBtn"),
            // Preview modal elements
            previewModalOverlay: document.getElementById("previewModalOverlay"),
            previewModalTitle: document.getElementById("previewModalTitle"),
            previewContent: document.getElementById("previewContent"),
            previewDates: document.getElementById("previewDates"),
            previewEditBtn: document.getElementById("previewEditBtn"),
            closePreviewModalBtn: document.getElementById(
                "closePreviewModalBtn"
            ),
        };

        this.init();
    }

    /**
     * Initialize the application
     * Set up event listeners and load existing notes
     */
    init() {
        this.loadNotes();
        this.bindEvents();
        this.renderNotes();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add note button
        this.elements.addNoteBtn.addEventListener("click", () =>
            this.openModal()
        );

        // Clear all notes button
        this.elements.clearAllBtn.addEventListener("click", () =>
            this.clearAllNotes()
        );

        // Search functionality
        this.elements.searchInput.addEventListener("input", (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderNotes();
        });

        // Modal controls
        this.elements.closeModalBtn.addEventListener("click", () =>
            this.closeModal()
        );
        this.elements.cancelBtn.addEventListener("click", () =>
            this.closeModal()
        );
        this.elements.modalOverlay.addEventListener("click", (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.closeModal();
            }
        });

        // Preview modal controls
        this.elements.closePreviewModalBtn.addEventListener("click", () =>
            this.closePreviewModal()
        );
        this.elements.previewModalOverlay.addEventListener("click", (e) => {
            if (e.target === this.elements.previewModalOverlay) {
                this.closePreviewModal();
            }
        });
        this.elements.previewEditBtn.addEventListener("click", () =>
            this.editFromPreview()
        );

        // Form submission
        this.elements.noteForm.addEventListener("submit", (e) =>
            this.handleFormSubmit(e)
        );

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closeModal();
                this.closePreviewModal();
            }
            if (e.ctrlKey && e.key === "n") {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    /**
     * Load notes from storage (in-memory for this demo)
     * In a real app, this would use localStorage
     */
    loadNotes() {
        // Note: In a real app, you would use:
        const stored = localStorage.getItem("notes");
        this.notes = stored ? JSON.parse(stored) : [];

        // For demo purposes, we'll start with some sample notes
        if (this.notes.length === 0) {
            this.notes = [
                {
                    id: this.generateId(),
                    title: "Welcome to Modern Notes! 🎉",
                    content:
                        "This is your first note. You can:\n\n• Add new notes\n• Edit existing notes\n• Delete notes you no longer need\n• Search through your notes\n\nEnjoy organizing your thoughts!",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
        }
    }

    /**
     * Save notes to storage (in-memory for this demo)
     */
    saveNotes() {
        // Note: In a real app, you would use:
        localStorage.setItem("notes", JSON.stringify(this.notes));

        // For demo purposes, we'll just keep them in memory
        console.log("Notes saved:", this.notes);
    }

    /**
     * Generate a unique ID for notes
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Open the modal for adding/editing notes
     * @param {Object|null} note - Note to edit, or null for new note
     */
    openModal(note = null) {
        this.currentEditId = note ? note.id : null;

        // Update modal title and button text
        this.elements.modalTitle.textContent = note
            ? "Edit Note"
            : "Add New Note";
        this.elements.saveBtn.textContent = note ? "Update Note" : "Save Note";

        // Fill form with note data if editing
        if (note) {
            this.elements.noteTitle.value = note.title;
            this.elements.noteContent.value = note.content;
        } else {
            this.elements.noteForm.reset();
        }

        // Show modal with animation
        this.elements.modalOverlay.classList.add("active");

        // Focus on title input
        setTimeout(() => {
            this.elements.noteTitle.focus();
        }, 100);
    }

    /**
     * Close the modal
     */
    closeModal() {
        this.elements.modalOverlay.classList.remove("active");
        this.currentEditId = null;
        this.elements.noteForm.reset();
    }

    /**
     * Open preview modal to view full note content
     * @param {Object} note - Note to preview
     */
    openPreviewModal(note) {
        // Store current note for potential editing
        this.currentPreviewNote = note;

        // Set preview content
        this.elements.previewModalTitle.textContent = this.escapeHtml(
            note.title
        );
        this.elements.previewContent.textContent = note.content;

        // Set date information
        const createdDate = this.formatDate(note.createdAt);
        const updatedDate = this.formatDate(note.updatedAt);
        const isUpdated = note.updatedAt !== note.createdAt;

        this.elements.previewDates.innerHTML = `
                    <div class="preview-date-item">
                        <span class="preview-date-label">Created:</span>
                        <span>${createdDate}</span>
                    </div>
                    ${
                        isUpdated
                            ? `
                        <div class="preview-date-item">
                            <span class="preview-date-label">Updated:</span>
                            <span>${updatedDate}</span>
                        </div>
                    `
                            : ""
                    }
                `;

        // Show preview modal
        this.elements.previewModalOverlay.classList.add("active");
    }

    /**
     * Close preview modal
     */
    closePreviewModal() {
        this.elements.previewModalOverlay.classList.remove("active");
        this.currentPreviewNote = null;
    }

    /**
     * Edit note from preview modal
     */
    editFromPreview() {
        console.log(
            "editFromPreview called, currentPreviewNote:",
            this.currentPreviewNote
        ); // Debug log
        if (this.currentPreviewNote) {
            const noteToEdit = this.currentPreviewNote;
            this.closePreviewModal();
            // Add a small delay to ensure preview modal is closed before opening edit modal
            setTimeout(() => {
                this.openModal(noteToEdit);
            }, 100);
        }
    }

    /**
     * Handle form submission for creating/updating notes
     * @param {Event} e - Form submit event
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const title = this.elements.noteTitle.value.trim();
        const content = this.elements.noteContent.value.trim();

        if (!title || !content) {
            alert("Please fill in both title and content.");
            return;
        }

        const now = new Date().toISOString();

        if (this.currentEditId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(
                (note) => note.id === this.currentEditId
            );
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title,
                    content,
                    updatedAt: now,
                };
            }
        } else {
            // Create new note
            const newNote = {
                id: this.generateId(),
                title,
                content,
                createdAt: now,
                updatedAt: now,
            };
            this.notes.unshift(newNote); // Add to beginning of array
        }

        this.saveNotes();
        this.renderNotes();
        this.closeModal();

        // Show success message (optional)
        this.showToast(
            this.currentEditId
                ? "Note updated successfully!"
                : "Note created successfully!"
        );
    }

    /**
     * Delete a note by ID
     * @param {string} id - Note ID to delete
     */
    deleteNote(id) {
        if (confirm("Are you sure you want to delete this note?")) {
            this.notes = this.notes.filter((note) => note.id !== id);
            this.saveNotes();
            this.renderNotes();
            this.showToast("Note deleted successfully!");
        }
    }

    /**
     * Clear all notes
     */
    clearAllNotes() {
        if (this.notes.length === 0) {
            alert("No notes to clear!");
            return;
        }

        if (
            confirm(
                "Are you sure you want to delete all notes? This action cannot be undone."
            )
        ) {
            this.notes = [];
            this.saveNotes();
            this.renderNotes();
            this.showToast("All notes cleared!");
        }
    }

    /**
     * Filter notes based on search term
     * @returns {Array} Filtered notes array
     */
    getFilteredNotes() {
        if (!this.searchTerm) {
            return this.notes;
        }

        return this.notes.filter(
            (note) =>
                note.title.toLowerCase().includes(this.searchTerm) ||
                note.content.toLowerCase().includes(this.searchTerm)
        );
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return "Today";
        } else if (diffDays === 2) {
            return "Yesterday";
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    /**
     * Create HTML for a single note card
     * @param {Object} note - Note object
     * @returns {string} HTML string
     */
    createNoteHTML(note) {
        return `
                    <div class="note-card" data-id="${note.id}">
                        <div class="note-header">
                            <h3 class="note-title" onclick="app.openPreviewModal(app.notes.find(n => n.id === '${
                                note.id
                            }'))" style="cursor: pointer;" title="Click to preview full note">
                                ${this.escapeHtml(note.title)}
                            </h3>
                            <div class="note-actions">
                                <button class="action-btn edit-btn" onclick="app.openModal(app.notes.find(n => n.id === '${
                                    note.id
                                }'))" title="Edit note">
                                    ✏️
                                </button>
                                <button class="action-btn delete-btn" onclick="app.deleteNote('${
                                    note.id
                                }')" title="Delete note">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="note-content" onclick="app.openPreviewModal(app.notes.find(n => n.id === '${
                            note.id
                        }'))" style="cursor: pointer;" title="Click to preview full note">
                            ${this.escapeHtml(this.truncateText(note.content))}
                        </div>
                        <div class="note-date">
                            ${
                                note.updatedAt !== note.createdAt
                                    ? "Updated"
                                    : "Created"
                            } ${this.formatDate(note.updatedAt)}
                        </div>
                    </div>
                `;
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Render all notes to the DOM
     */
    renderNotes() {
        const filteredNotes = this.getFilteredNotes();

        if (filteredNotes.length === 0) {
            this.elements.notesGrid.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <h3 class="empty-title">
                                ${
                                    this.searchTerm
                                        ? "No notes found"
                                        : "No notes yet"
                                }
                            </h3>
                            <p class="empty-description">
                                ${
                                    this.searchTerm
                                        ? `No notes match "${this.searchTerm}". Try a different search term.`
                                        : "Create your first note to get started!"
                                }
                            </p>
                        </div>
                    `;
        } else {
            this.elements.notesGrid.innerHTML = filteredNotes
                .map((note) => this.createNoteHTML(note))
                .join("");
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to show
     */
    showToast(message) {
        // Simple toast implementation
        const toast = document.createElement("div");
        toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    z-index: 2000;
                    font-weight: 500;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = "translateX(0)";
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = "translateX(100%)";
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
let app;
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        app = new NotesApp();
    });
} else {
    app = new NotesApp();
}
