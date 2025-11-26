import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "my-secret-key";

// payload: userId, role
const payload = {
  userId: "123456",
  role: "admin", // 👈 để test admin
};

const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

console.log("Generated Token:", token);
