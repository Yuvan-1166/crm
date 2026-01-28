-- Outreach Documents for RAG (company knowledge base)
CREATE TABLE IF NOT EXISTS outreach_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    content TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    chunk_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_filename (filename),
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- Document Metadata
CREATE TABLE IF NOT EXISTS outreach_document_meta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    chunks_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- Autopilot Status (per employee)
CREATE TABLE IF NOT EXISTS autopilot_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    company_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    interval_minutes INT DEFAULT 5,
    started_at TIMESTAMP NULL,
    stopped_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_emp (emp_id),
    INDEX idx_company_id (company_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- Autopilot Activity Log
CREATE TABLE IF NOT EXISTS autopilot_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    subject VARCHAR(500),
    needs_reply TINYINT(1) DEFAULT 0,
    reply_sent TINYINT(1) DEFAULT 0,
    intent TEXT,
    category VARCHAR(50),
    reply_sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_emp_id (emp_id),
    INDEX idx_message_id (message_id),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_emp_message (emp_id, message_id),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

-- Outreach Email Log (track generated/sent emails)
CREATE TABLE IF NOT EXISTS outreach_email_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    contact_id INT NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status ENUM('generated', 'sent', 'failed') DEFAULT 'generated',
    sent_at TIMESTAMP NULL,
    message_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_emp_id (emp_id),
    INDEX idx_contact_id (contact_id),
    INDEX idx_status (status),
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE
);
