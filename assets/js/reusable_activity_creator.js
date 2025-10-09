/**
 * REUSABLE ACTIVITY CREATOR SYSTEM
 * Modular system for creating activities across different parts of the application
 * Can be used by Coordinator, Teacher, and other roles
 */

class ReusableActivityCreator {
    constructor(options = {}) {
        this.config = {
            // Default configuration
            apiEndpoint: 'course_outline_manage.php',
            autoSave: true,
            autoSaveInterval: 400,
            maxQuestions: 50,
            maxChoices: 10,
            supportedTypes: [
                'lecture', 'laboratory', 'coding', 'multiple_choice', 
                'identification', 'true_false', 'essay', 'upload_based'
            ],
            // Override with provided options
            ...options
        };
        
        this.state = {
            type: 'lecture',
            name: '',
            language: '',
            instructionsText: '',
            maxScore: 100,
            questions: [],
            testCases: [],
            // Additional state properties
            editActivityId: null,
            lessonId: null,
            courseId: null
        };
        
        this.modal = null;
        this.saveTimer = null;
        this.eventHandlers = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAutoSave();
    }
    
    /**
     * Show the activity creation modal
     * @param {Object} options - Configuration options
     * @param {number} options.lessonId - Lesson ID to attach activity to
     * @param {number} options.courseId - Course ID (optional)
     * @param {number} options.editActivityId - Activity ID to edit (optional)
     * @param {string} options.title - Modal title (optional)
     */
    showModal(options = {}) {
        const {
            lessonId,
            courseId,
            editActivityId,
            title = 'Create Activity'
        } = options;
        
        // Set context
        this.state.lessonId = lessonId;
        this.state.courseId = courseId;
        this.state.editActivityId = editActivityId;
        
        // Create modal if it doesn't exist
        if (!this.modal) {
            this.createModal();
        }
        
        // Update modal title
        const titleEl = this.modal.querySelector('#racModalTitle');
        if (titleEl) {
            titleEl.textContent = title;
        }
        
        // Load existing data if editing
        if (editActivityId) {
            this.loadActivityData(editActivityId);
        } else {
            this.resetState();
        }
        
        // Show modal
        this.modal.style.display = 'flex';
        this.render();
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    /**
     * Create the modal HTML structure
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'reusableActivityCreator';
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-card" style="max-width:900px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
                <div class="modal-header" style="padding:12px 14px;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:8px;">
                    <strong id="racModalTitle" style="flex:1">Create Activity</strong>
                    <button class="action-btn btn-gray" id="racClose">Close</button>
                </div>
                <div id="racBody" style="padding:12px 14px;overflow:auto;flex:1"></div>
                <div class="modal-footer" style="padding:10px 14px;border-top:1px solid #e9ecef;display:flex;gap:8px;justify-content:flex-end;align-items:center;">
                    <button class="action-btn btn-gray" id="racCancel">Cancel</button>
                    <button class="action-btn btn-green" id="racCreate">Create Activity</button>
                </div>
            </div>`;
        
        document.body.appendChild(this.modal);
        
        // Bind modal events
        this.bindModalEvents();
    }
    
    /**
     * Bind modal event handlers
     */
    bindModalEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('#racClose');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideModal();
        }
        
        // Cancel button
        const cancelBtn = this.modal.querySelector('#racCancel');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.hideModal();
        }
        
        // Create button
        const createBtn = this.modal.querySelector('#racCreate');
        if (createBtn) {
            createBtn.onclick = () => this.handleCreate();
        }
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }
    
    /**
     * Render the form based on current state
     */
    render() {
        const body = this.modal.querySelector('#racBody');
        if (!body) return;
        
        // Preserve scroll position
        const prevScrollTop = body.scrollTop;
        
        body.innerHTML = this.generateFormHTML();
        
        // Restore scroll position
        body.scrollTop = prevScrollTop;
        
        // Bind form events
        this.bindFormEvents();
        
        // Update create button text
        const createBtn = this.modal.querySelector('#racCreate');
        if (createBtn) {
            createBtn.textContent = this.state.editActivityId ? 'Save Changes' : 'Create Activity';
        }
    }
    
    /**
     * Generate the form HTML based on current state
     */
    generateFormHTML() {
        return `
            <div style="display:grid;grid-template-columns:1fr;gap:16px;">
                <!-- Step 1: Activity Type Selection -->
                <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                    <div style="font-weight:600;margin-bottom:12px;color:#333;">Step 1 · Choose Activity Type</div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        ${this.generateActivityTypeOptions()}
                    </div>
                </div>
                
                <!-- Step 2: Basic Information -->
                <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                    <div style="font-weight:600;margin-bottom:12px;color:#333;">Step 2 · Basic Information</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Activity Name <span style="color:red;">*</span></label>
                            <input type="text" id="racName" class="modal-input" placeholder="Enter activity name" value="${this.escapeHtml(this.state.name)}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" required />
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Max Score</label>
                            <input type="number" id="racMaxScore" class="modal-input" min="1" max="1000" value="${this.state.maxScore}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Instructions</label>
                        <textarea id="racInstructions" class="modal-input" rows="3" placeholder="Enter instructions for students..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${this.escapeHtml(this.state.instructionsText)}</textarea>
                    </div>
                </div>
                
                <!-- Step 3: Dynamic Content Based on Type -->
                ${this.generateDynamicContent()}
            </div>`;
    }
    
    /**
     * Generate activity type selection options
     */
    generateActivityTypeOptions() {
        const types = [
            { value: 'lecture', label: '📚 Lecture', desc: 'Interactive lessons with questions' },
            { value: 'laboratory', label: '🔬 Laboratory', desc: 'Hands-on coding exercises' },
            { value: 'coding', label: '💻 Coding Exercise', desc: 'Programming challenges with auto-checking' },
            { value: 'multiple_choice', label: '📝 Multiple Choice', desc: 'Quiz with multiple answer options' },
            { value: 'identification', label: '🔍 Identification', desc: 'Fill-in-the-blank questions' },
            { value: 'true_false', label: '✅ True/False', desc: 'Binary choice questions' },
            { value: 'essay', label: '📄 Essay', desc: 'Open-ended written responses' },
            { value: 'upload_based', label: '📎 Upload-based', desc: 'File submission activities' }
        ];
        
        return types.map(type => `
            <label class="rac-radio-tile" style="flex:1;min-width:200px;border:2px solid ${this.state.type === type.value ? '#28a745' : '#e3e6ea'};border-radius:8px;padding:16px;cursor:pointer;background:${this.state.type === type.value ? '#f8fff9' : 'white'};transition:all 0.2s;">
                <input type="radio" name="racType" value="${type.value}" ${this.state.type === type.value ? 'checked' : ''} style="margin-right:8px;" />
                <div style="font-weight:600;color:#333;margin-bottom:4px;">${type.label}</div>
                <div style="font-size:13px;color:#666;">${type.desc}</div>
            </label>
        `).join('');
    }
    
    /**
     * Generate dynamic content based on activity type
     */
    generateDynamicContent() {
        switch (this.state.type) {
            case 'coding':
                return this.generateCodingContent();
            case 'multiple_choice':
            case 'identification':
            case 'true_false':
            case 'essay':
                return this.generateQuizContent();
            case 'upload_based':
                return this.generateUploadContent();
            default:
                return this.generateBasicContent();
        }
    }
    
    /**
     * Generate coding-specific content
     */
    generateCodingContent() {
        return `
            <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                <div style="font-weight:600;margin-bottom:12px;color:#333;">💻 Coding Exercise Settings</div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                    <div>
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Programming Language</label>
                        <select id="racLanguage" class="modal-input" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
                            <option value="cpp" ${this.state.language === 'cpp' ? 'selected' : ''}>C++</option>
                            <option value="java" ${this.state.language === 'java' ? 'selected' : ''}>Java</option>
                            <option value="python" ${this.state.language === 'python' ? 'selected' : ''}>Python</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Time Limit (minutes)</label>
                        <input type="number" id="racTimeLimit" class="modal-input" min="5" max="300" value="60" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Problem Statement</label>
                    <textarea id="racProblemStatement" class="modal-input" rows="4" placeholder="Describe the coding problem..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;">${this.escapeHtml(this.state.problemStatement || '')}</textarea>
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Starter Code (optional)</label>
                    <textarea id="racStarterCode" class="modal-input" rows="6" placeholder="Provide starter code for students..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;font-family:monospace;resize:vertical;">${this.escapeHtml(this.state.starterCode || '')}</textarea>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Test Cases</label>
                    <div id="racTestCases">
                        ${this.generateTestCasesHTML()}
                    </div>
                    <button type="button" class="action-btn btn-green" id="racAddTestCase" style="margin-top:8px;padding:8px 16px;font-size:14px;">+ Add Test Case</button>
                </div>
            </div>`;
    }
    
    /**
     * Generate quiz-specific content
     */
    generateQuizContent() {
        return `
            <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📝 Questions</div>
                <div id="racQuestions">
                    ${this.generateQuestionsHTML()}
                </div>
                <button type="button" class="action-btn btn-green" id="racAddQuestion" style="margin-top:12px;padding:10px 16px;font-size:14px;">+ Add Question</button>
            </div>`;
    }
    
    /**
     * Generate upload-based content
     */
    generateUploadContent() {
        return `
            <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📎 Upload Settings</div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                    <div>
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Max File Size (MB)</label>
                        <input type="number" id="racMaxFileSize" class="modal-input" min="1" max="100" value="5" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Due Date</label>
                        <input type="datetime-local" id="racDueDate" class="modal-input" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                    </div>
                </div>
                
                <div>
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Accepted File Types</label>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;">
                        ${this.generateFileTypeOptions()}
                    </div>
                </div>
            </div>`;
    }
    
    /**
     * Generate basic content for lecture/laboratory
     */
    generateBasicContent() {
        return `
            <div class="form-section" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;background:#f8f9fa;">
                <div style="font-weight:600;margin-bottom:12px;color:#333;">📚 Activity Details</div>
                <div style="color:#666;font-size:14px;">
                    This activity type focuses on content delivery and student engagement. 
                    You can add materials and resources to support the learning objectives.
                </div>
            </div>`;
    }
    
    /**
     * Generate test cases HTML
     */
    generateTestCasesHTML() {
        if (!this.state.testCases || this.state.testCases.length === 0) {
            return '<div class="empty-state" style="text-align:center;color:#666;padding:20px;">No test cases added yet</div>';
        }
        
        return this.state.testCases.map((testCase, index) => `
            <div class="test-case-item" style="border:1px solid #e3e6ea;border-radius:6px;padding:12px;margin-bottom:8px;background:white;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong>Test Case ${index + 1}</strong>
                    <div style="display:flex;gap:8px;">
                        <label style="display:flex;align-items:center;gap:4px;font-size:12px;">
                            <input type="checkbox" ${testCase.isSample ? 'checked' : ''} onchange="updateTestCase(${index}, 'isSample', this.checked)" />
                            Sample
                        </label>
                        <button type="button" class="action-btn btn-red" onclick="removeTestCase(${index})" style="padding:4px 8px;font-size:12px;">Remove</button>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div>
                        <label style="display:block;margin-bottom:4px;font-size:12px;font-weight:500;">Input:</label>
                        <textarea rows="2" placeholder="Test input..." onchange="updateTestCase(${index}, 'input', this.value)" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:monospace;">${this.escapeHtml(testCase.input || '')}</textarea>
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:4px;font-size:12px;font-weight:500;">Expected Output:</label>
                        <textarea rows="2" placeholder="Expected output..." onchange="updateTestCase(${index}, 'output', this.value)" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:12px;font-family:monospace;">${this.escapeHtml(testCase.output || '')}</textarea>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Generate questions HTML
     */
    generateQuestionsHTML() {
        if (!this.state.questions || this.state.questions.length === 0) {
            return '<div class="empty-state" style="text-align:center;color:#666;padding:20px;">No questions added yet</div>';
        }
        
        return this.state.questions.map((question, index) => `
            <div class="question-item" style="border:1px solid #e3e6ea;border-radius:8px;padding:16px;margin-bottom:16px;background:white;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h4 style="margin:0;color:#333;">Question ${index + 1}</h4>
                    <button type="button" class="action-btn btn-red" onclick="removeQuestion(${index})" style="padding:8px 12px;font-size:12px;">Remove</button>
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Question Text:</label>
                    <textarea rows="3" placeholder="Enter your question here..." onchange="updateQuestion(${index}, 'text', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${this.escapeHtml(question.text || '')}</textarea>
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Points:</label>
                    <input type="number" min="1" value="${question.points || 1}" onchange="updateQuestion(${index}, 'points', this.value)" style="max-width:100px;padding:8px;border:1px solid #ddd;border-radius:6px;" />
                </div>
                
                ${this.generateQuestionTypeContent(question, index)}
            </div>
        `).join('');
    }
    
    /**
     * Generate question type specific content
     */
    generateQuestionTypeContent(question, index) {
        switch (this.state.type) {
            case 'multiple_choice':
                return this.generateMultipleChoiceContent(question, index);
            case 'identification':
                return this.generateIdentificationContent(question, index);
            case 'true_false':
                return this.generateTrueFalseContent(question, index);
            case 'essay':
                return this.generateEssayContent(question, index);
            default:
                return '';
        }
    }
    
    /**
     * Generate multiple choice content
     */
    generateMultipleChoiceContent(question, index) {
        const choices = question.choices || [{ text: '', correct: false }, { text: '', correct: false }];
        
        return `
            <div>
                <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Choices (Select the correct answer):</label>
                <div id="choices-${index}">
                    ${choices.map((choice, choiceIndex) => `
                        <div class="choice-item" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:#f8f9fa;border-radius:6px;border:1px solid #e3e6ea;">
                            <input type="radio" name="correct-${index}" value="${choiceIndex}" ${choice.correct ? 'checked' : ''} onchange="updateChoice(${index}, ${choiceIndex}, 'correct', this.checked)" />
                            <span style="font-weight:600;color:#333;min-width:20px;">${String.fromCharCode(65 + choiceIndex)}.</span>
                            <input type="text" value="${this.escapeHtml(choice.text || '')}" placeholder="Enter choice text..." onchange="updateChoice(${index}, ${choiceIndex}, 'text', this.value)" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
                            <button type="button" class="action-btn btn-red" onclick="removeChoice(${index}, ${choiceIndex})" style="padding:8px 12px;font-size:12px;">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="action-btn btn-green" onclick="addChoice(${index})" style="margin-top:8px;padding:10px 16px;font-size:14px;">+ Add Choice</button>
            </div>`;
    }
    
    /**
     * Generate identification content
     */
    generateIdentificationContent(question, index) {
        return `
            <div>
                <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Correct Answer:</label>
                <input type="text" value="${this.escapeHtml(question.answer || '')}" placeholder="Enter the correct answer..." onchange="updateQuestion(${index}, 'answer', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;" />
            </div>`;
    }
    
    /**
     * Generate true/false content
     */
    generateTrueFalseContent(question, index) {
        return `
            <div>
                <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Correct Answer:</label>
                <select onchange="updateQuestion(${index}, 'answer', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
                    <option value="" ${!question.answer ? 'selected' : ''}>Select correct answer</option>
                    <option value="true" ${question.answer === 'true' ? 'selected' : ''}>True</option>
                    <option value="false" ${question.answer === 'false' ? 'selected' : ''}>False</option>
                </select>
            </div>`;
    }
    
    /**
     * Generate essay content
     */
    generateEssayContent(question, index) {
        return `
            <div>
                <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Expected Answer (for reference):</label>
                <textarea rows="4" placeholder="Enter expected answer or key points..." onchange="updateQuestion(${index}, 'answer', this.value)" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">${this.escapeHtml(question.answer || '')}</textarea>
            </div>`;
    }
    
    /**
     * Generate file type options
     */
    generateFileTypeOptions() {
        const fileTypes = [
            { value: 'PDF', label: '📄 PDF' },
            { value: 'DOCX', label: '📝 DOCX' },
            { value: 'PPTX', label: '📊 PPTX' },
            { value: 'JPG', label: '🖼️ JPG' },
            { value: 'PNG', label: '🖼️ PNG' },
            { value: 'TXT', label: '📄 TXT' },
            { value: 'ZIP', label: '📦 ZIP' }
        ];
        
        return fileTypes.map(type => `
            <label style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;font-size:12px;">
                <input type="checkbox" ${(this.state.acceptedFiles || []).includes(type.value) ? 'checked' : ''} onchange="updateFileType('${type.value}', this.checked)" />
                <span>${type.label}</span>
            </label>
        `).join('');
    }
    
    /**
     * Bind form event handlers
     */
    bindFormEvents() {
        // Activity type change
        const typeInputs = this.modal.querySelectorAll('input[name="racType"]');
        typeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.state.type = e.target.value;
                this.render();
            });
        });
        
        // Basic form fields
        const nameInput = this.modal.querySelector('#racName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.state.name = e.target.value;
                this.scheduleSave();
            });
        }
        
        const instructionsInput = this.modal.querySelector('#racInstructions');
        if (instructionsInput) {
            instructionsInput.addEventListener('input', (e) => {
                this.state.instructionsText = e.target.value;
                this.scheduleSave();
            });
        }
        
        const maxScoreInput = this.modal.querySelector('#racMaxScore');
        if (maxScoreInput) {
            maxScoreInput.addEventListener('input', (e) => {
                this.state.maxScore = parseInt(e.target.value) || 100;
                this.scheduleSave();
            });
        }
        
        // Language selection for coding
        const languageInput = this.modal.querySelector('#racLanguage');
        if (languageInput) {
            languageInput.addEventListener('change', (e) => {
                this.state.language = e.target.value;
                this.scheduleSave();
            });
        }
        
        // Problem statement for coding
        const problemInput = this.modal.querySelector('#racProblemStatement');
        if (problemInput) {
            problemInput.addEventListener('input', (e) => {
                this.state.problemStatement = e.target.value;
                this.scheduleSave();
            });
        }
        
        // Starter code for coding
        const starterInput = this.modal.querySelector('#racStarterCode');
        if (starterInput) {
            starterInput.addEventListener('input', (e) => {
                this.state.starterCode = e.target.value;
                this.scheduleSave();
            });
        }
        
        // Bind dynamic event handlers
        this.bindDynamicEvents();
    }
    
    /**
     * Bind dynamic event handlers for questions, choices, etc.
     */
    bindDynamicEvents() {
        // Add question button
        const addQuestionBtn = this.modal.querySelector('#racAddQuestion');
        if (addQuestionBtn) {
            addQuestionBtn.onclick = () => this.addQuestion();
        }
        
        // Add test case button
        const addTestCaseBtn = this.modal.querySelector('#racAddTestCase');
        if (addTestCaseBtn) {
            addTestCaseBtn.onclick = () => this.addTestCase();
        }
        
        // Bind global functions for inline event handlers
        window.updateQuestion = (index, field, value) => this.updateQuestion(index, field, value);
        window.removeQuestion = (index) => this.removeQuestion(index);
        window.addChoice = (questionIndex) => this.addChoice(questionIndex);
        window.updateChoice = (questionIndex, choiceIndex, field, value) => this.updateChoice(questionIndex, choiceIndex, field, value);
        window.removeChoice = (questionIndex, choiceIndex) => this.removeChoice(questionIndex, choiceIndex);
        window.addTestCase = () => this.addTestCase();
        window.updateTestCase = (index, field, value) => this.updateTestCase(index, field, value);
        window.removeTestCase = (index) => this.removeTestCase(index);
        window.updateFileType = (type, checked) => this.updateFileType(type, checked);
    }
    
    /**
     * Add a new question
     */
    addQuestion() {
        if (!this.state.questions) {
            this.state.questions = [];
        }
        
        const newQuestion = {
            text: '',
            points: 1,
            choices: this.state.type === 'multiple_choice' ? [
                { text: '', correct: false },
                { text: '', correct: false }
            ] : [],
            answer: '',
            explanation: ''
        };
        
        this.state.questions.push(newQuestion);
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Update question data
     */
    updateQuestion(index, field, value) {
        if (!this.state.questions || !this.state.questions[index]) return;
        
        this.state.questions[index][field] = value;
        this.scheduleSave();
    }
    
    /**
     * Remove question
     */
    removeQuestion(index) {
        if (!this.state.questions || !this.state.questions[index]) return;
        
        this.state.questions.splice(index, 1);
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Add choice to question
     */
    addChoice(questionIndex) {
        if (!this.state.questions || !this.state.questions[questionIndex]) return;
        
        if (!this.state.questions[questionIndex].choices) {
            this.state.questions[questionIndex].choices = [];
        }
        
        this.state.questions[questionIndex].choices.push({ text: '', correct: false });
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Update choice data
     */
    updateChoice(questionIndex, choiceIndex, field, value) {
        if (!this.state.questions || !this.state.questions[questionIndex] || !this.state.questions[questionIndex].choices) return;
        
        this.state.questions[questionIndex].choices[choiceIndex][field] = value;
        this.scheduleSave();
    }
    
    /**
     * Remove choice from question
     */
    removeChoice(questionIndex, choiceIndex) {
        if (!this.state.questions || !this.state.questions[questionIndex] || !this.state.questions[questionIndex].choices) return;
        
        this.state.questions[questionIndex].choices.splice(choiceIndex, 1);
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Add test case
     */
    addTestCase() {
        if (!this.state.testCases) {
            this.state.testCases = [];
        }
        
        this.state.testCases.push({
            input: '',
            output: '',
            isSample: false,
            timeLimitMs: 2000
        });
        
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Update test case data
     */
    updateTestCase(index, field, value) {
        if (!this.state.testCases || !this.state.testCases[index]) return;
        
        this.state.testCases[index][field] = value;
        this.scheduleSave();
    }
    
    /**
     * Remove test case
     */
    removeTestCase(index) {
        if (!this.state.testCases || !this.state.testCases[index]) return;
        
        this.state.testCases.splice(index, 1);
        this.render();
        this.scheduleSave();
    }
    
    /**
     * Update file type selection
     */
    updateFileType(type, checked) {
        if (!this.state.acceptedFiles) {
            this.state.acceptedFiles = [];
        }
        
        if (checked) {
            if (!this.state.acceptedFiles.includes(type)) {
                this.state.acceptedFiles.push(type);
            }
        } else {
            this.state.acceptedFiles = this.state.acceptedFiles.filter(t => t !== type);
        }
        
        this.scheduleSave();
    }
    
    /**
     * Handle create/save button click
     */
    async handleCreate() {
        const createBtn = this.modal.querySelector('#racCreate');
        if (!createBtn) return;
        
        // Validate required fields
        if (!this.state.name.trim()) {
            this.showError('Activity name is required');
            return;
        }
        
        if (!this.state.lessonId) {
            this.showError('Lesson ID is required');
            return;
        }
        
        // Disable button and show loading
        createBtn.disabled = true;
        createBtn.textContent = this.state.editActivityId ? 'Saving...' : 'Creating...';
        
        try {
            const result = await this.saveActivity();
            
            if (result.success) {
                this.showSuccess(this.state.editActivityId ? 'Activity updated successfully' : 'Activity created successfully');
                this.hideModal();
                
                // Trigger callback if provided
                if (this.config.onSuccess) {
                    this.config.onSuccess(result);
                }
            } else {
                this.showError(result.message || 'Failed to save activity');
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            this.showError('Network error occurred');
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = this.state.editActivityId ? 'Save Changes' : 'Create Activity';
        }
    }
    
    /**
     * Save activity to backend
     */
    async saveActivity() {
        const payload = this.buildPayload();
        
        const formData = new FormData();
        formData.append('action', 'activity_sync');
        formData.append('activity', JSON.stringify(payload));
        
        // Add CSRF token if available
        await this.addCSRFToken(formData);
        
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        return await response.json();
    }
    
    /**
     * Build payload for API
     */
    buildPayload() {
        const payload = {
            id: this.state.editActivityId || undefined,
            lesson_id: this.state.lessonId,
            type: this.state.type,
            title: this.state.name,
            instructions: this.buildInstructions(),
            max_score: this.state.maxScore
        };
        
        if (this.state.type === 'coding') {
            payload.test_cases = (this.state.testCases || []).map(tc => ({
                is_sample: !!tc.isSample,
                input_text: tc.input || '',
                expected_output_text: tc.output || '',
                time_limit_ms: tc.timeLimitMs || 2000
            }));
        } else if (this.state.type !== 'lecture' && this.state.type !== 'laboratory') {
            payload.questions = (this.state.questions || []).map(q => {
                const item = {
                    text: q.text || '',
                    points: parseInt(q.points) || 1,
                    explanation: q.explanation || ''
                };
                
                if (this.state.type === 'multiple_choice') {
                    item.choices = (q.choices || []).map(c => ({
                        text: c.text || '',
                        is_correct: !!c.correct
                    }));
                } else if (this.state.type === 'identification') {
                    item.answer = q.answer || '';
                } else if (this.state.type === 'true_false') {
                    item.choices = [
                        { text: 'True', is_correct: q.answer === 'true' },
                        { text: 'False', is_correct: q.answer === 'false' }
                    ];
                } else if (this.state.type === 'essay') {
                    item.explanation = q.answer || q.explanation || '';
                }
                
                return item;
            });
        }
        
        return payload;
    }
    
    /**
     * Build instructions JSON based on activity type
     */
    buildInstructions() {
        if (this.state.type === 'coding') {
            return JSON.stringify({
                language: this.state.language || 'cpp',
                instructions: this.state.instructionsText || '',
                problemStatement: this.state.problemStatement || '',
                starterCode: this.state.starterCode || '',
                difficulty: this.state.difficulty || 'beginner',
                timeLimit: this.state.timeLimit || 60
            });
        } else if (this.state.type === 'upload_based') {
            return JSON.stringify({
                kind: 'upload_based',
                instructions: this.state.instructionsText || '',
                acceptedFiles: this.state.acceptedFiles || ['PDF', 'DOCX', 'JPG', 'PNG'],
                maxFileSize: this.state.maxFileSize || 5
            });
        } else {
            return JSON.stringify({
                kind: this.state.type,
                instructions: this.state.instructionsText || ''
            });
        }
    }
    
    /**
     * Add CSRF token to form data
     */
    async addCSRFToken(formData) {
        try {
            const tokenFormData = new FormData();
            tokenFormData.append('action', 'get_csrf_token');
            
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                body: tokenFormData,
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            if (result && result.success && result.token) {
                formData.append('csrf_token', result.token);
            }
        } catch (error) {
            console.warn('Failed to get CSRF token:', error);
        }
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (!this.config.autoSave) return;
        
        // Auto-save to localStorage
        this.scheduleSave = () => {
            if (this.saveTimer) {
                clearTimeout(this.saveTimer);
            }
            
            this.saveTimer = setTimeout(() => {
                try {
                    const key = `rac_draft_${this.state.lessonId || 'new'}`;
                    const draft = { ...this.state };
                    delete draft.editActivityId; // Don't save edit ID in drafts
                    localStorage.setItem(key, JSON.stringify(draft));
                } catch (error) {
                    console.warn('Failed to save draft:', error);
                }
            }, this.config.autoSaveInterval);
        };
    }
    
    /**
     * Load activity data for editing
     */
    async loadActivityData(activityId) {
        try {
            const formData = new FormData();
            formData.append('action', 'activity_get');
            formData.append('id', activityId);
            
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                this.populateFromActivityData(result.data);
            }
        } catch (error) {
            console.error('Error loading activity data:', error);
        }
    }
    
    /**
     * Populate form from activity data
     */
    populateFromActivityData(activity) {
        this.state.name = activity.title || '';
        this.state.type = activity.type || 'lecture';
        this.state.maxScore = activity.max_score || 100;
        
        // Parse instructions
        if (activity.instructions) {
            try {
                const instructions = JSON.parse(activity.instructions);
                this.state.instructionsText = instructions.instructions || '';
                this.state.language = instructions.language || '';
                this.state.problemStatement = instructions.problemStatement || '';
                this.state.starterCode = instructions.starterCode || '';
            } catch (error) {
                this.state.instructionsText = activity.instructions;
            }
        }
        
        // Load questions if available
        if (activity.questions) {
            this.state.questions = activity.questions.map(q => ({
                text: q.question_text || '',
                points: q.points || 1,
                choices: (q.choices || []).map(c => ({
                    text: c.choice_text || '',
                    correct: !!c.is_correct
                })),
                answer: q.answer || '',
                explanation: q.explanation || ''
            }));
        }
        
        // Load test cases if available
        if (activity.test_cases) {
            this.state.testCases = activity.test_cases.map(tc => ({
                input: tc.input_text || '',
                output: tc.expected_output_text || '',
                isSample: !!tc.is_sample,
                timeLimitMs: tc.time_limit_ms || 2000
            }));
        }
    }
    
    /**
     * Reset state to defaults
     */
    resetState() {
        this.state = {
            type: 'lecture',
            name: '',
            language: 'cpp',
            instructionsText: '',
            maxScore: 100,
            questions: [],
            testCases: [],
            editActivityId: null,
            lessonId: this.state.lessonId,
            courseId: this.state.courseId
        };
    }
    
    /**
     * Hide modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        // Clear draft
        if (this.state.lessonId) {
            try {
                localStorage.removeItem(`rac_draft_${this.state.lessonId}`);
            } catch (error) {
                console.warn('Failed to clear draft:', error);
            }
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', 'Error', message);
        } else {
            alert(message);
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('success', 'Success', message);
        } else {
            alert(message);
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Global event listeners can be added here
    }
}

// Global instance for easy access
window.ReusableActivityCreator = ReusableActivityCreator;

// Convenience function to show activity creator
window.showActivityCreator = function(options) {
    if (!window.activityCreator) {
        window.activityCreator = new ReusableActivityCreator();
    }
    window.activityCreator.showModal(options);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReusableActivityCreator;
}



