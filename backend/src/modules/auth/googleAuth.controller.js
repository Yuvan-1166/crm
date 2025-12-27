import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import * as employeeRepo from "../employees/employee.repo.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res, next) => {
  try {
    const { token, inviteToken } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google token is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if employee exists
    let employee = await employeeRepo.getByEmail(email);

    // If invite token provided, validate it
    if (inviteToken) {
      const invitedEmployee = await employeeRepo.getByInvitationToken(inviteToken);
      
      if (!invitedEmployee) {
        return res.status(400).json({
          message: "Invalid or expired invitation link",
          code: "INVALID_INVITE"
        });
      }
      
      // Check if the Google email matches the invited email
      if (invitedEmployee.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({
          message: `This invitation was sent to ${invitedEmployee.email}. Please sign in with that email address.`,
          code: "EMAIL_MISMATCH"
        });
      }
      
      // Accept the invitation and update employee
      await employeeRepo.acceptInvitation(invitedEmployee.emp_id);
      employee = await employeeRepo.getById(invitedEmployee.emp_id);
    }

    // If no employee found and no invite token
    if (!employee) {
      return res.status(403).json({
        message: "You don't have access to this application. Please contact your administrator for an invitation.",
        code: "NOT_INVITED"
      });
    }

    // Check invitation status
    if (employee.invitation_status === 'INVITED') {
      return res.status(403).json({
        message: "Please use the invitation link sent to your email to complete registration.",
        code: "PENDING_INVITATION"
      });
    }

    if (employee.invitation_status === 'DISABLED') {
      return res.status(403).json({
        message: "Your account has been disabled. Please contact your administrator.",
        code: "ACCOUNT_DISABLED"
      });
    }

    // Update last login
    await employeeRepo.updateLastLogin(employee.emp_id);

    // Create JWT
    const jwtToken = jwt.sign(
      {
        empId: employee.emp_id,
        companyId: employee.company_id,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: jwtToken,
      user: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        role: employee.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
