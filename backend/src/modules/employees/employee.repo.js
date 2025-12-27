import { db } from "../../config/db.js";
import crypto from "crypto";

/* ---------------------------------------------------
   GENERATE INVITATION TOKEN
--------------------------------------------------- */
export const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/* ---------------------------------------------------
   CREATE EMPLOYEE (with invitation support)
--------------------------------------------------- */
export const createEmployee = async (data) => {
  const invitationToken = data.invitation_status === 'INVITED' ? generateInvitationToken() : null;
  
  const [result] = await db.query(
    `
    INSERT INTO employees (
      company_id,
      name,
      email,
      phone,
      role,
      department,
      invitation_status,
      invitation_token,
      invitation_sent_at,
      invited_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.company_id || null,
      data.name,
      data.email,
      data.phone || null,
      data.role || "EMPLOYEE",
      data.department || null,
      data.invitation_status || "ACTIVE",
      invitationToken,
      data.invitation_status === 'INVITED' ? new Date() : null,
      data.invited_by || null,
    ]
  );

  return { insertId: result.insertId, invitationToken };
};

/* ---------------------------------------------------
   GET EMPLOYEE BY ID
--------------------------------------------------- */
export const getById = async (empId) => {
  const [rows] = await db.query(
    `SELECT * FROM employees WHERE emp_id = ?`,
    [empId]
  );
  return rows[0];
};

/* ---------------------------------------------------
   GET EMPLOYEE BY EMAIL
--------------------------------------------------- */
export const getByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT * FROM employees WHERE email = ?`,
    [email]
  );
  return rows[0];
};

/* ---------------------------------------------------
   GET EMPLOYEES BY COMPANY
--------------------------------------------------- */
export const getByCompany = async (companyId) => {
  const [rows] = await db.query(
    `
    SELECT * FROM employees 
    WHERE company_id = ?
    ORDER BY created_at DESC
    `,
    [companyId]
  );
  return rows;
};

/* ---------------------------------------------------
   UPDATE EMPLOYEE
--------------------------------------------------- */
export const updateEmployee = async (empId, updates) => {
  const fields = [];
  const values = [];

  if (updates.name) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.phone !== undefined) {
    fields.push("phone = ?");
    values.push(updates.phone);
  }

  if (updates.role) {
    fields.push("role = ?");
    values.push(updates.role);
  }

  if (updates.department !== undefined) {
    fields.push("department = ?");
    values.push(updates.department);
  }

  if (updates.company_id) {
    fields.push("company_id = ?");
    values.push(updates.company_id);
  }

  if (fields.length === 0) return;

  values.push(empId);

  await db.query(
    `UPDATE employees SET ${fields.join(", ")} WHERE emp_id = ?`,
    values
  );
};

/* ---------------------------------------------------
   UPDATE INVITATION STATUS
--------------------------------------------------- */
export const updateInvitationStatus = async (empId, status) => {
  await db.query(
    `UPDATE employees SET invitation_status = ? WHERE emp_id = ?`,
    [status, empId]
  );
};

/* ---------------------------------------------------
   GET EMPLOYEE BY INVITATION TOKEN
--------------------------------------------------- */
export const getByInvitationToken = async (token) => {
  const [rows] = await db.query(
    `SELECT * FROM employees WHERE invitation_token = ?`,
    [token]
  );
  return rows[0];
};

/* ---------------------------------------------------
   ACCEPT INVITATION (activate employee)
--------------------------------------------------- */
export const acceptInvitation = async (empId) => {
  await db.query(
    `UPDATE employees 
     SET invitation_status = 'ACTIVE', 
         invitation_token = NULL,
         last_login_at = NOW()
     WHERE emp_id = ?`,
    [empId]
  );
};

/* ---------------------------------------------------
   UPDATE LAST LOGIN
--------------------------------------------------- */
export const updateLastLogin = async (empId) => {
  await db.query(
    `UPDATE employees SET last_login_at = NOW() WHERE emp_id = ?`,
    [empId]
  );
};

/* ---------------------------------------------------
   RESEND INVITATION (generate new token)
--------------------------------------------------- */
export const resendInvitation = async (empId) => {
  const newToken = generateInvitationToken();
  await db.query(
    `UPDATE employees 
     SET invitation_token = ?, 
         invitation_sent_at = NOW(),
         invitation_status = 'INVITED'
     WHERE emp_id = ?`,
    [newToken, empId]
  );
  return newToken;
};

/* ---------------------------------------------------
   GET EMPLOYEES BY COMPANY (with invitation info)
--------------------------------------------------- */
export const getByCompanyWithStatus = async (companyId) => {
  const [rows] = await db.query(
    `
    SELECT 
      emp_id, company_id, name, email, phone, role, department,
      invitation_status, invitation_sent_at, invited_by, last_login_at,
      created_at, updated_at
    FROM employees 
    WHERE company_id = ?
    ORDER BY created_at DESC
    `,
    [companyId]
  );
  return rows;
};

/* ---------------------------------------------------
   DELETE EMPLOYEE
--------------------------------------------------- */
export const deleteEmployee = async (empId) => {
  await db.query(`DELETE FROM employees WHERE emp_id = ?`, [empId]);
};

/* ---------------------------------------------------
   COUNT EMPLOYEES BY COMPANY
--------------------------------------------------- */
export const countByCompany = async (companyId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS count FROM employees WHERE company_id = ?`,
    [companyId]
  );
  return rows[0].count;
};
